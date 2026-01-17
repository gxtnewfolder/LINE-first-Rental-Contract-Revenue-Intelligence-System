# Prisma Schema Design Decisions

## Overview

The schema supports a family rental management system with 2 buildings (~10 rooms), optimized for historical analysis and LINE-first workflow.

---

## Design Decisions

### 1. Historical Rent Analysis

**Problem**: Need to compare rent over time with inflation.

**Solution**:
- `RentHistory` table (denormalized) for fast time-series queries
- `InflationIndex` with year/month uniqueness for easy joins
- `Payment.periodYear` + `periodMonth` for aggregation

```sql
-- Example: Compare rent vs inflation
SELECT rh.year, rh.month, rh.rentTHB, ii.ratePct
FROM rent_history rh
JOIN inflation_index ii ON rh.year = ii.year AND rh.month = ii.month
WHERE rh.roomId = ?
```

### 2. Contract Versioning

**Problem**: Track contract renewals and amendments.

**Solution**:
- Self-referential `previousId` in Contract
- `version` counter
- Full audit trail in `ContractStateTransition`

```
Contract A (v1) → Contract B (v2, previousId = A)
```

### 3. Monthly Income Aggregation

**Problem**: Quickly sum income by month/year/building.

**Solution**:
- Composite index `@@index([periodYear, periodMonth])`
- Unique constraint prevents duplicate payments
- `paidTHB` separate from `amountTHB` for partial payments

```sql
-- Monthly income by building
SELECT b.name, SUM(p.paidTHB)
FROM payments p
JOIN contracts c ON p.contractId = c.id
JOIN rooms r ON c.roomId = r.id
JOIN buildings b ON r.buildingId = b.id
WHERE p.periodYear = 2026 AND p.periodMonth = 1
GROUP BY b.id
```

### 4. Contract FSM States

| State | Description |
|-------|-------------|
| `DRAFT` | Just created, editable |
| `PENDING_SIGNATURE` | Sent for signing |
| `SIGNED` | All signatures collected |
| `ACTIVE` | Currently in effect |
| `EXPIRING` | Within 30 days of end |
| `RENEWED` | Replaced by new contract |
| `TERMINATED` | Ended |

Transitions logged in `ContractStateTransition` for audit.

### 5. LINE Integration

- `Tenant.lineUserId` for direct notifications
- Indexed for fast lookup when LINE messages arrive

### 6. Indexes Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| `rooms` | `status` | Find vacant rooms quickly |
| `contracts` | `startDate, endDate` | Find expiring contracts |
| `payments` | `periodYear, periodMonth` | Monthly aggregation |
| `payments` | `dueDate` | Overdue detection |
| `tenants` | `lineUserId` | LINE lookup |

### 7. Naming Conventions

- Table names: `snake_case` via `@@map()`
- Model names: `PascalCase`
- All amounts in THB (integer, no decimals for simplicity)

---

## Entity Relationship

```
Building 1──* Room 1──* Contract *──1 Tenant
                           │
                           ├──* ContractSignature
                           ├──* ContractStateTransition
                           └──* Payment
                           
InflationIndex (standalone)
RentHistory (denormalized view)
```

---

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Integer THB | Simpler math, no currency decimals (Thai Baht rarely uses satang for rent) |
| Denormalized RentHistory | Extra writes on rent changes, but reads are ~10x faster for analytics |
| Self-join for versions | More complex queries, but cleaner than version table |
| PostgreSQL | Requires Docker for dev, but better for future analytics and jsonb if needed |
