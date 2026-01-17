# System Architecture

Rental Management System for Next.js App Router + Prisma v7

---

## 1. Project Folder Structure

```
rental-system/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Route group: Admin web UI
│   │   ├── page.tsx              # Dashboard home
│   │   ├── buildings/
│   │   ├── rooms/
│   │   ├── tenants/
│   │   ├── contracts/
│   │   └── analytics/
│   │
│   ├── api/                      # API routes
│   │   ├── webhooks/
│   │   │   └── line/route.ts     # LINE webhook endpoint
│   │   ├── cron/
│   │   │   ├── reminders/route.ts
│   │   │   └── inflation/route.ts
│   │   ├── contracts/
│   │   ├── payments/
│   │   └── buildings/
│   │
│   ├── sign/                     # Public signature capture
│   │   └── [contractId]/page.tsx
│   │
│   ├── generated/prisma/         # Prisma generated client
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
│
├── lib/                          # Shared utilities
│   ├── db.ts                     # Prisma client singleton
│   ├── config.ts                 # Environment config
│   └── utils/
│       ├── date.ts
│       └── format.ts
│
├── services/                     # Business logic layer
│   ├── building.service.ts
│   ├── room.service.ts
│   ├── tenant.service.ts
│   ├── contract.service.ts
│   ├── payment.service.ts
│   └── analytics.service.ts
│
├── domain/                       # Domain logic & types
│   ├── contract/
│   │   ├── fsm.ts                # Contract state machine
│   │   ├── types.ts
│   │   └── validation.ts
│   ├── payment/
│   │   └── types.ts
│   └── inflation/
│       ├── calculator.ts
│       └── types.ts
│
├── integrations/                 # External services
│   ├── line/
│   │   ├── client.ts             # LINE API client
│   │   ├── commands.ts           # Thai command parser
│   │   ├── handlers.ts           # Command handlers (thin)
│   │   └── templates.ts          # Flex message templates
│   └── pdf/
│       └── generator.ts          # PDF contract generation
│
├── ai/                           # AI modules (isolated)
│   ├── summary/
│   │   └── generator.ts          # Thai language summaries
│   ├── anomaly/
│   │   └── detector.ts           # Income anomaly detection
│   └── rent/
│       └── advisor.ts            # Rent adjustment advisor
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── agent/                        # AI agent context
│   └── PROJECT.md
│
├── docs/
│   ├── AI Agent Spec.md
│   └── architecture.md
│
├── public/
├── docker-compose.yml
└── package.json
```

---

## 2. Separation of Concerns

```mermaid
graph TB
    subgraph "UI Layer"
        A[Next.js Pages]
        B[React Components]
    end
    
    subgraph "API Layer"
        C[API Routes]
        D[LINE Webhook]
        E[Cron Endpoints]
    end
    
    subgraph "Service Layer"
        F[Business Services]
    end
    
    subgraph "Domain Layer"
        G[Contract FSM]
        H[Validation]
        I[Types]
    end
    
    subgraph "Data Layer"
        J[Prisma ORM]
        K[(PostgreSQL)]
    end
    
    subgraph "Integrations"
        L[LINE Client]
        M[PDF Generator]
    end
    
    subgraph "AI Layer"
        N[Summary Gen]
        O[Anomaly]
        P[Rent Advisor]
    end
    
    A --> C
    B --> C
    C --> F
    D --> F
    E --> F
    F --> G
    F --> J
    F --> L
    F --> N
    G --> H
    J --> K
```

| Layer | Responsibility | Rules |
|-------|---------------|-------|
| **UI** | Display & interaction | No business logic |
| **API** | HTTP handlers | Thin, delegate to services |
| **Service** | Business operations | Orchestrates domain + data |
| **Domain** | Core logic & rules | Pure functions, no I/O |
| **Data** | Persistence | Prisma queries only |
| **Integrations** | External APIs | Isolated adapters |
| **AI** | Decision support | Read-only, explainable |

---

## 3. LINE Webhook & Cron Jobs

### LINE Webhook

```
app/api/webhooks/line/route.ts
```

```typescript
// Thin handler - delegates immediately
export async function POST(request: Request) {
  const body = await request.json();
  const signature = request.headers.get('x-line-signature');
  
  if (!verifySignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Delegate to command router
  await lineCommandRouter.handle(body.events);
  
  return Response.json({ success: true });
}
```

### Cron Jobs Location

```
app/api/cron/
├── reminders/route.ts    # Contract expiry & payment due notifications
└── inflation/route.ts    # Monthly inflation data fetch
```

**Invocation**: Use external cron service (Vercel Cron, cron-job.org, or system crontab) to hit these endpoints:

```bash
# Example crontab
0 9 * * * curl -X POST https://your-domain/api/cron/reminders
0 0 1 * * curl -X POST https://your-domain/api/cron/inflation
```

**Security**: Protected by secret header or API key in environment.

---

## 4. AI Module Isolation

```
ai/
├── summary/
│   └── generator.ts      # Stateless summary generation
├── anomaly/
│   └── detector.ts       # Income pattern analysis
└── rent/
    └── advisor.ts        # Inflation-based recommendations
```

### Design Principles

1. **Stateless Functions** - No side effects, pure input → output
2. **Service Interface** - Called by services, never directly by API
3. **Explainable Output** - Always include reasoning with recommendations
4. **Human Approval** - AI never auto-executes actions

### Example Interface

```typescript
// ai/rent/advisor.ts
export interface RentRecommendation {
  currentRent: number;
  suggestedRent: number;
  adjustmentPct: number;
  reasoning: string;         // Thai explanation
  inflationContext: string;
  confidence: 'low' | 'medium' | 'high';
}

export async function recommendRentAdjustment(
  roomId: string,
  inflationData: InflationRate[]
): Promise<RentRecommendation> {
  // Pure calculation logic
  // Returns recommendation with full context
}
```

### Future Expansion

To add new AI capabilities:

1. Create new folder under `ai/`
2. Export pure functions with typed interfaces
3. Add service method to call AI function
4. Never expose AI directly to API layer

---

## 5. Data Flow Example

**"ดูรายได้เดือนนี้" (View this month's income)**

```mermaid
sequenceDiagram
    participant U as LINE User
    participant W as Webhook
    participant R as Command Router
    participant S as Analytics Service
    participant D as Prisma/DB
    participant AI as AI Summary
    participant L as LINE Reply
    
    U->>W: Text message
    W->>R: Parse command
    R->>S: getMonthlyIncome()
    S->>D: Query payments
    D-->>S: Payment data
    S->>AI: generateSummary(data)
    AI-->>S: Thai summary
    S-->>R: Formatted result
    R->>L: Send Flex message
    L-->>U: Income summary
```

---

## 6. Key Conventions

| Concern | Convention |
|---------|-----------|
| **API Routes** | `route.ts` files, thin handlers |
| **Services** | `*.service.ts`, single responsibility |
| **Domain** | Pure TypeScript, no imports from other layers |
| **Types** | Co-located `types.ts` in each domain folder |
| **AI** | Isolated folder, pure functions, always return explanations |
| **LINE** | Thai commands mapped to service calls |

---

## 7. Environment Variables

```env
# Database
DATABASE_URL="postgresql://dev:dev@localhost:5432/rental_dev"

# LINE
LINE_CHANNEL_ACCESS_TOKEN="..."
LINE_CHANNEL_SECRET="..."

# Cron Security
CRON_SECRET="..."

# AI (Future)
OPENAI_API_KEY="..."
```

---

*This architecture prioritizes simplicity and maintainability for a family-scale system.*
