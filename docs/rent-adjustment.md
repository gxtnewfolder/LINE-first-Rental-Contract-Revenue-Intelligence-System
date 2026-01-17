# Rent Adjustment Analysis - Thai Inflation

## 1. Formula & Logic

### Core Principle

```
Rent should at minimum keep pace with inflation to maintain real value.
Suggested rent = Current rent × (1 + cumulative inflation since last adjustment)
```

### Formulas

#### Inflation-Adjusted Rent (Basic)

```
Suggested Rent = Base Rent × (CPI_current / CPI_base)

Where:
  CPI_current = Consumer Price Index at evaluation date
  CPI_base    = CPI when rent was last adjusted
```

#### Using Percentage Rate

```
Suggested Rent = Current Rent × (1 + Σ monthly_inflation_rates)

For practical use with manual entry:
Suggested Rent = Current Rent × (1 + annual_inflation_rate)
```

### Decision Logic

```typescript
// domain/inflation/calculator.ts

interface RentAdjustmentResult {
  currentRent: number;
  suggestedRent: number;
  minimumRent: number;        // Inflation-only adjustment
  adjustmentPct: number;
  inflationPct: number;
  rentGrowthPct: number;
  gap: number;                // rentGrowth - inflation
  recommendation: 'INCREASE' | 'MAINTAIN' | 'REVIEW';
  reasoning: string;
  tenantFactor: number;       // Retention discount
}

function calculateRentAdjustment(
  currentRent: number,
  originalRent: number,
  contractStartDate: Date,
  inflationData: InflationRate[],
  tenantYears: number
): RentAdjustmentResult {
  
  // 1. Calculate cumulative inflation
  const cumulativeInflation = calculateCumulativeInflation(
    contractStartDate,
    new Date(),
    inflationData
  );
  
  // 2. Calculate rent growth
  const rentGrowth = (currentRent - originalRent) / originalRent;
  
  // 3. Gap analysis
  const gap = rentGrowth - cumulativeInflation;
  
  // 4. Minimum rent (inflation-adjusted)
  const minimumRent = Math.round(originalRent * (1 + cumulativeInflation));
  
  // 5. Suggested rent with tenant retention factor
  const tenantFactor = calculateTenantDiscount(tenantYears);
  const suggestedRent = Math.round(minimumRent * (1 - tenantFactor));
  
  // 6. Determine recommendation
  const recommendation = determineRecommendation(gap, tenantYears);
  
  return {
    currentRent,
    suggestedRent,
    minimumRent,
    adjustmentPct: (suggestedRent - currentRent) / currentRent * 100,
    inflationPct: cumulativeInflation * 100,
    rentGrowthPct: rentGrowth * 100,
    gap: gap * 100,
    recommendation,
    reasoning: generateReasoning(gap, tenantYears, cumulativeInflation),
    tenantFactor
  };
}
```

---

## 2. Example Calculation

### Scenario

| Data Point | Value |
|------------|-------|
| Room | 101, ตึก A |
| Original rent (Jan 2023) | ฿8,000 |
| Current rent | ฿8,000 |
| Contract duration | 2 years |
| Thai inflation 2023 | 2.5% |
| Thai inflation 2024 | 1.8% |
| Thai inflation 2025 | 2.1% |

### Calculation Steps

```
Step 1: Cumulative Inflation
────────────────────────────
Cumulative = (1 + 0.025) × (1 + 0.018) × (1 + 0.021) - 1
           = 1.025 × 1.018 × 1.021 - 1
           = 1.0657 - 1
           = 0.0657 (6.57%)

Step 2: Minimum Inflation-Adjusted Rent
────────────────────────────────────────
Minimum = ฿8,000 × 1.0657 = ฿8,526

Step 3: Rent Growth Analysis
────────────────────────────
Rent Growth = (฿8,000 - ฿8,000) / ฿8,000 = 0%
Gap = 0% - 6.57% = -6.57% (BEHIND inflation)

Step 4: Tenant Retention Factor
───────────────────────────────
Tenant Years = 2
Discount = 2 × 0.5% = 1% discount for loyalty

Step 5: Suggested Rent
──────────────────────
Suggested = ฿8,526 × (1 - 0.01) = ฿8,441

Step 6: Rounded Suggestion
──────────────────────────
Suggested = ฿8,500 (rounded to nearest ฿100)
```

### Result Output

```json
{
  "currentRent": 8000,
  "suggestedRent": 8500,
  "minimumRent": 8526,
  "adjustmentPct": 6.25,
  "inflationPct": 6.57,
  "rentGrowthPct": 0,
  "gap": -6.57,
  "recommendation": "INCREASE",
  "reasoning": "ค่าเช่าไม่ได้ปรับมา 2 ปี ขณะที่เงินเฟ้อสะสม 6.57% แนะนำปรับขึ้น ฿500 (6.25%) พร้อมส่วนลดผู้เช่าเดิม 1%",
  "tenantFactor": 0.01
}
```

---

## 3. Edge Cases

### Case 1: Long-term Tenant (5+ years)

```typescript
// Higher loyalty discount for long-term tenants
function calculateTenantDiscount(years: number): number {
  if (years >= 5) return 0.05;      // 5% discount
  if (years >= 3) return 0.03;      // 3% discount
  if (years >= 1) return 0.01;      // 1% discount
  return 0;                          // New tenant
}
```

**Example**: 5-year tenant, inflation suggests ฿9,000, apply 5% loyalty → ฿8,550

**Reasoning**: Tenant turnover costs (vacancy + cleaning + finding new tenant) often exceed 5% of annual rent.

### Case 2: Deflation Period

```typescript
// Never suggest rent decrease due to deflation
if (suggestedRent < currentRent) {
  return {
    ...result,
    suggestedRent: currentRent,
    recommendation: 'MAINTAIN',
    reasoning: 'เงินเฟ้อติดลบ แต่แนะนำคงค่าเช่าเดิม ไม่ลดค่าเช่า'
  };
}
```

### Case 3: Multi-year Contract (Fixed Rate)

```typescript
// Check if contract has fixed rent clause
if (contract.isFixedRent) {
  return {
    ...result,
    recommendation: 'REVIEW',
    reasoning: 'สัญญาระบุค่าเช่าคงที่ ไม่สามารถปรับได้ระหว่างสัญญา รอต่อสัญญาใหม่',
    suggestedRent: currentRent,
    applicableAt: contract.endDate  // Suggest when renewal
  };
}
```

### Case 4: Rent Already Above Market

```typescript
// If rent growth > inflation by large margin, don't increase
if (gap > 0.05) { // 5% above inflation
  return {
    ...result,
    recommendation: 'MAINTAIN',
    reasoning: 'ค่าเช่าปัจจุบันสูงกว่าอัตราเงินเฟ้อแล้ว ไม่แนะนำปรับเพิ่ม'
  };
}
```

### Case 5: Recent Renovation

```typescript
// Premium for recently renovated rooms
interface RoomContext {
  lastRenovationDate?: Date;
  renovationCost?: number;
}

function applyRenovationPremium(
  suggestedRent: number,
  context: RoomContext
): number {
  if (!context.lastRenovationDate) return suggestedRent;
  
  const monthsSinceRenovation = differenceInMonths(
    new Date(),
    context.lastRenovationDate
  );
  
  // 10% premium for first year, declining
  if (monthsSinceRenovation < 12) {
    return Math.round(suggestedRent * 1.10);
  } else if (monthsSinceRenovation < 24) {
    return Math.round(suggestedRent * 1.05);
  }
  
  return suggestedRent;
}
```

### Case 6: Partial Year Inflation

```typescript
// When inflation data is incomplete (mid-year analysis)
function calculatePartialYearInflation(
  year: number,
  monthsAvailable: number,
  inflationData: InflationRate[]
): number {
  const yearData = inflationData.filter(d => d.year === year);
  
  if (yearData.length === 0) {
    // Use previous year as estimate
    return getPreviousYearInflation(year - 1, inflationData);
  }
  
  // Annualize partial data
  const avgMonthlyRate = yearData.reduce((s, d) => s + d.ratePct, 0) / yearData.length;
  return avgMonthlyRate * 12 / 100;  // Annualized
}
```

---

## 4. Recommendation Thresholds

| Gap (Rent Growth - Inflation) | Recommendation | Thai Message |
|-------------------------------|----------------|--------------|
| < -5% | **INCREASE** (urgent) | ควรปรับค่าเช่าโดยเร็ว |
| -5% to -2% | **INCREASE** | แนะนำปรับค่าเช่า |
| -2% to +2% | **MAINTAIN** | ค่าเช่าเหมาะสม |
| +2% to +5% | **MAINTAIN** | ค่าเช่าดีกว่าเงินเฟ้อ |
| > +5% | **REVIEW** | ค่าเช่าสูงกว่าตลาด ระวังผู้เช่าย้าย |

---

## 5. Thai Inflation Data Source

### Phase 1: Manual Entry

```typescript
// Admin manually enters data from BOT/MOC reports
await db.inflationIndex.create({
  data: {
    year: 2025,
    month: 12,
    ratePct: 0.18,  // 0.18% monthly
    source: 'manual',
    notes: 'จากรายงานกระทรวงพาณิชย์'
  }
});
```

### Data Sources (Thai)
- **Bank of Thailand (BOT)**: https://www.bot.or.th
- **Ministry of Commerce**: https://www.moc.go.th (CPI data)
- **หมวด**: ดัชนีราคาผู้บริโภคทั่วไป (Headline CPI)

### Phase 2: Future API Integration

```typescript
// Future: Auto-fetch from BOT API
async function fetchInflationFromBOT(year: number, month: number) {
  // BOT provides XBRL/XML data feeds
  // https://www.bot.or.th/App/BTWS_STAT
}
```

---

## 6. Service Interface

```typescript
// domain/inflation/types.ts

export interface RentAdvisor {
  // Core analysis
  analyzeRoom(roomId: string): Promise<RentAdjustmentResult>;
  analyzeBuilding(buildingId: string): Promise<RentAdjustmentResult[]>;
  
  // Comparison
  compareRentToInflation(
    contractId: string
  ): Promise<RentInflationComparison>;
  
  // Batch suggestions
  getSuggestionsForExpiringContracts(
    daysAhead: number
  ): Promise<RentSuggestion[]>;
}
```
