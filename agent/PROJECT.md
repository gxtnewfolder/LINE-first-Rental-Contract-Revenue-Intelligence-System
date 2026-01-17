# Rental Contract Management System (LINE-first)

## 1. Project Overview

This project is a **family-scale rental management system** for a building owner.
The system manages rental rooms, tenants, contracts, income tracking, and rent adjustment based on Thai inflation rates.

Primary interaction channel is **LINE Messaging API**.
Secondary interface is a minimal **admin web dashboard**.

This system is NOT a marketplace.
This system is NOT multi-tenant SaaS.
Scope is intentionally small, deterministic, and automation-friendly.

---

## 2. Core Goals

- Reduce manual document handling (Word + paper signing)
- Support in-person signature and mobile digital signature
- Track rental income per room
- Analyze rent adjustment against Thai inflation
- Notify owner via LINE for important events
- Enable AI-assisted decision support (not auto-action)

---

## 3. Buildings & Scale Constraints

- 2 buildings
- Each building: 4–5 rooms
- Single owner (family use)
- Low concurrency
- Data correctness > performance

These constraints are **intentional** and must not be abstracted away.

---

## 4. Tech Stack (Fixed)

- Next.js (App Router)
- TypeScript
- Prisma v7
- Relational database (already configured)
- LINE Messaging API
- Existing project template MUST be used

Agents MUST NOT:
- Scaffold a new Next.js project
- Replace Prisma setup
- Introduce unnecessary frameworks

---

## 5. High-Level Architecture
LINE User
│
▼
LINE Webhook Adapter
│
▼
Command Router
│
▼
Service Layer
│
├── Contract FSM Engine
├── Payment & Revenue Logic
├── AI / Analytics Logic
│
▼
Prisma ORM → Database

Separation of concerns is mandatory:
- Adapters = IO only
- Services = business logic
- AI modules = decision support only
- No logic inside API handlers

---

## 6. Core Domain Concepts

### Entities
- Building
- Room
- Tenant
- Contract
- ContractStateTransition
- Payment
- InflationRate

### Contract Lifecycle (FSM)
DRAFT
→ PENDING_SIGNATURE
→ SIGNED
→ ACTIVE
→ EXPIRING
→ (RENEWED | TERMINATED)
All state transitions:
- Must be validated
- Must be logged
- Must be auditable

---

## 7. Digital Contract & Signature

- Contract templates are HTML/Markdown-based
- PDF generation is server-side
- Digital signature via mobile browser
- Signature metadata includes:
  - Timestamp
  - Signer role
  - Contract version

Legal compliance is out of scope, but auditability is required.

---

## 8. LINE Integration Principles

- LINE is the primary UX
- Owner prefers text-based interaction
- Commands are short and in Thai

Example commands:
- รายได้เดือนนี้
- ห้องว่าง
- สัญญาใกล้หมด
- ดูสัญญา

LINE handlers MUST be thin and delegate to services.

---

## 9. AI & Automation Scope

AI is used for:
- OCR of uploaded documents
- Rent adjustment recommendation
- Inflation comparison
- Income anomaly detection

AI MUST NOT:
- Auto-change rent
- Auto-terminate contracts
- Hide decision logic

All AI outputs must be explainable and reversible.

---

## 10. Automation Engineering Principles

- Deterministic over probabilistic where possible
- Stateless pure functions preferred
- Config over magic constants
- Idempotent operations
- Explicit audit logs

---

## 11. Non-Goals (Important)

This project will NOT:
- Handle public user registration
- Support payment gateways
- Support multiple landlords
- Implement complex ML models
- Optimize for scale

---

## 12. Agent Rules (Critical)

Agents MUST:
- Read this file before modifying code
- Follow existing project conventions
- Modify schema incrementally
- Output diffs when changing Prisma
- Avoid over-engineering

Agents MUST NOT:
- Invent new requirements
- Introduce abstractions without justification
- Restructure the project arbitrarily

---

## 13. Review & Commit Policy

- One task per agent run
- Human review required
- Commit after each approved task

---

## 14. Owner Context (For UX Decisions)

- Owner is non-technical
- Uses LINE daily
- Prefers clarity over features
- Accepts simple UI if automation works

---

End of document.