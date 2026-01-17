# Income Tracking & Analytics Module

## 1. Data Aggregation Strategy

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA AGGREGATION LAYERS                              │
└─────────────────────────────────────────────────────────────────────────────┘

Raw Data (Payments table)
         │
         ▼
┌─────────────────┐
│  Real-time      │  Direct queries for current month
│  Aggregation    │  Used by: LINE commands, Dashboard
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RentHistory    │  Denormalized monthly snapshots
│  (Materialized) │  Used by: Trend analysis, AI insights
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Export Layer   │  CSV/Excel generation
│                 │  Used by: Reporting, Backup
└─────────────────┘
```

### Aggregation Levels

| Level | Granularity | Source | Usage |
|-------|-------------|--------|-------|
| **Per Payment** | Individual | `payments` | Audit, corrections |
| **Per Room/Month** | Room × Month | `rent_history` | Trend analysis |
| **Per Building/Month** | Building × Month | Computed | Summary reports |
| **Per Portfolio/Month** | All × Month | Computed | Total income |

### Write Strategy

```typescript
// On payment status change to PAID
async function recordPayment(paymentId: string) {
  const payment = await db.payment.update({
    where: { id: paymentId },
    data: { status: 'PAID', paidDate: new Date() }
  });

  // Denormalize for analytics
  await db.rentHistory.upsert({
    where: {
      roomId_year_month: {
        roomId: payment.contract.roomId,
        year: payment.periodYear,
        month: payment.periodMonth
      }
    },
    create: {
      roomId: payment.contract.roomId,
      contractId: payment.contractId,
      year: payment.periodYear,
      month: payment.periodMonth,
      rentTHB: payment.paidTHB
    },
    update: {
      rentTHB: payment.paidTHB
    }
  });
}
```

---

## 2. Example Queries

### Monthly Income by Building

```typescript
// Prisma query
const monthlyIncomeByBuilding = await db.payment.groupBy({
  by: ['contractId'],
  where: {
    periodYear: 2026,
    periodMonth: 1,
    status: 'PAID'
  },
  _sum: { paidTHB: true }
});

// With building info (raw SQL for efficiency)
const result = await db.$queryRaw`
  SELECT 
    b.name as building_name,
    SUM(p.paid_thb) as total_income,
    COUNT(DISTINCT r.id) as rooms_paid
  FROM payments p
  JOIN contracts c ON p.contract_id = c.id
  JOIN rooms r ON c.room_id = r.id
  JOIN buildings b ON r.building_id = b.id
  WHERE p.period_year = ${year}
    AND p.period_month = ${month}
    AND p.status = 'PAID'
  GROUP BY b.id, b.name
  ORDER BY b.name
`;
```

### Occupancy Rate

```typescript
// Current occupancy
const occupancyRate = await db.$queryRaw`
  SELECT 
    b.name as building_name,
    COUNT(*) FILTER (WHERE r.status = 'OCCUPIED') as occupied,
    COUNT(*) as total,
    ROUND(
      COUNT(*) FILTER (WHERE r.status = 'OCCUPIED')::numeric / 
      COUNT(*)::numeric * 100, 1
    ) as occupancy_pct
  FROM rooms r
  JOIN buildings b ON r.building_id = b.id
  GROUP BY b.id, b.name
`;

// Historical occupancy (from contracts)
const historicalOccupancy = await db.$queryRaw`
  SELECT 
    ${year} as year,
    ${month} as month,
    COUNT(DISTINCT c.room_id) as occupied_rooms,
    (SELECT COUNT(*) FROM rooms) as total_rooms
  FROM contracts c
  WHERE c.status IN ('ACTIVE', 'SIGNED')
    AND c.start_date <= make_date(${year}, ${month}, 1)
    AND c.end_date >= make_date(${year}, ${month}, 1)
`;
```

### Income vs Inflation Comparison

```typescript
// Rent growth vs inflation
const rentVsInflation = await db.$queryRaw`
  SELECT 
    rh.year,
    rh.month,
    AVG(rh.rent_thb) as avg_rent,
    ii.rate_pct as inflation_rate,
    LAG(AVG(rh.rent_thb)) OVER (ORDER BY rh.year, rh.month) as prev_rent,
    ROUND(
      (AVG(rh.rent_thb) - LAG(AVG(rh.rent_thb)) OVER (ORDER BY rh.year, rh.month)) /
      LAG(AVG(rh.rent_thb)) OVER (ORDER BY rh.year, rh.month) * 100, 2
    ) as rent_growth_pct
  FROM rent_history rh
  LEFT JOIN inflation_index ii ON rh.year = ii.year AND rh.month = ii.month
  GROUP BY rh.year, rh.month, ii.rate_pct
  ORDER BY rh.year DESC, rh.month DESC
  LIMIT 12
`;
```

### Overdue Payments

```typescript
// Current overdue
const overduePayments = await db.payment.findMany({
  where: {
    status: 'OVERDUE',
    // OR pending past due date
    OR: [
      { status: 'OVERDUE' },
      {
        status: 'PENDING',
        dueDate: { lt: new Date() }
      }
    ]
  },
  include: {
    contract: {
      include: {
        room: { include: { building: true } },
        tenant: true
      }
    }
  },
  orderBy: { dueDate: 'asc' }
});
```

### Room Performance Ranking

```typescript
// Best performing rooms (last 12 months)
const roomPerformance = await db.$queryRaw`
  SELECT 
    r.room_number,
    b.name as building_name,
    SUM(p.paid_thb) as total_income,
    COUNT(*) FILTER (WHERE p.status = 'PAID') as paid_months,
    COUNT(*) FILTER (WHERE p.status = 'OVERDUE') as overdue_months,
    ROUND(AVG(p.paid_thb), 0) as avg_monthly_rent
  FROM rooms r
  JOIN buildings b ON r.building_id = b.id
  LEFT JOIN contracts c ON c.room_id = r.id
  LEFT JOIN payments p ON p.contract_id = c.id
    AND p.period_year >= ${year - 1}
  GROUP BY r.id, r.room_number, b.name
  ORDER BY total_income DESC
`;
```

---

## 3. Metrics That Matter for Small Landlords

### Dashboard Metrics

| Metric | Formula | Why It Matters |
|--------|---------|----------------|
| **Monthly Income** | SUM(paid_thb) for month | Core revenue tracking |
| **Occupancy Rate** | occupied_rooms / total_rooms × 100 | Portfolio health |
| **Collection Rate** | paid_payments / due_payments × 100 | Cash flow risk |
| **Avg Rent per Room** | total_rent / occupied_rooms | Pricing benchmark |
| **Days to Collect** | AVG(paid_date - due_date) | Cash flow timing |

### Alert Thresholds

| Alert | Condition | Action |
|-------|-----------|--------|
| 🔴 **Overdue** | Payment > 7 days past due | Push LINE notification |
| 🟡 **Expiring Contract** | End date within 30 days | Renewal reminder |
| 🟠 **Low Occupancy** | < 80% occupied | Review pricing |
| 📊 **Rent vs Inflation** | Rent growth < inflation - 1% | Suggest adjustment |

### AI-Ready Data Structure

```typescript
// Analytics payload for AI summary generation
interface AnalyticsSnapshot {
  period: { year: number; month: number };
  
  income: {
    total: number;
    byBuilding: { name: string; amount: number }[];
    vsLastMonth: number;  // percentage change
    vsLastYear: number;
  };
  
  occupancy: {
    current: number;      // percentage
    vacant: { room: string; building: string; daysSinceVacant: number }[];
  };
  
  collection: {
    rate: number;         // percentage
    overdue: { room: string; amount: number; daysPastDue: number }[];
    avgDaysToCollect: number;
  };
  
  contracts: {
    expiringSoon: { room: string; tenant: string; daysRemaining: number }[];
    recentRenewals: number;
    recentTerminations: number;
  };
  
  inflation: {
    currentRate: number;
    avgRentGrowth: number;
    roomsBelowInflation: { room: string; gap: number }[];
  };
}
```

---

## 4. Export Formats

### CSV Export Structure

```csv
year,month,building,room,tenant,rent_thb,status,due_date,paid_date
2026,1,ตึก A,101,คุณสมชาย,8500,PAID,2026-01-05,2026-01-04
2026,1,ตึก A,102,คุณสมหญิง,9000,PAID,2026-01-05,2026-01-06
2026,1,ตึก B,201,คุณมานะ,7500,OVERDUE,2026-01-05,
```

### Summary Report (Excel-friendly)

```typescript
// Generate summary sheet data
const summaryReport = {
  generatedAt: new Date().toISOString(),
  period: `${thaiMonth(month)} ${year + 543}`,  // Buddhist year
  
  totals: {
    income: 83000,
    rooms: 10,
    occupied: 9,
    vacant: 1
  },
  
  buildings: [
    { name: 'ตึก A', rooms: 5, income: 45000, occupancy: 100 },
    { name: 'ตึก B', rooms: 5, income: 38000, occupancy: 80 }
  ],
  
  payments: [...], // All payment rows
  
  notes: [
    'ห้อง 205 ว่าง ตั้งแต่ 1 ธ.ค. 2025',
    'ค่าเช่าค้าง: ห้อง 203 (฿8,500)'
  ]
};
```

---

## 5. Service Interface

```typescript
// services/analytics.service.ts

export interface AnalyticsService {
  // Core metrics
  getMonthlyIncome(year: number, month: number): Promise<IncomeReport>;
  getOccupancyRate(date?: Date): Promise<OccupancyReport>;
  getOverduePayments(): Promise<OverduePayment[]>;
  
  // Trends
  getIncomeHistory(months: number): Promise<MonthlyIncome[]>;
  getRentVsInflation(roomId?: string): Promise<RentInflationComparison[]>;
  
  // AI-ready
  getAnalyticsSnapshot(year: number, month: number): Promise<AnalyticsSnapshot>;
  
  // Export
  exportToCSV(year: number, month?: number): Promise<string>;
  exportToExcel(year: number): Promise<Buffer>;
}
```

---

## 6. File Structure

```
services/
└── analytics.service.ts     # Main analytics logic

domain/
└── analytics/
    ├── types.ts             # AnalyticsSnapshot, reports
    └── calculations.ts      # Pure calculation functions

app/api/analytics/
├── income/route.ts          # GET /api/analytics/income
├── occupancy/route.ts       # GET /api/analytics/occupancy
└── export/route.ts          # GET /api/analytics/export
```
