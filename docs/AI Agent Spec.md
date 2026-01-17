Rental Management System (Family Use)

1. Project Overview

ระบบจัดการการปล่อยเช่าตึกสำหรับใช้งานภายในครอบครัว
	•	จำนวน: 2 ตึก ตึกละ 4–5 ห้อง
	•	เน้นจัดการเอกสารสัญญาเช่า การเซ็นสัญญา และสถิติรายได้
	•	ผู้ใช้งานหลัก: คุณพ่อ (ทำงานผ่าน LINE เป็นหลัก)

เป้าหมายหลัก
	1.	ลดงานเอกสารกระดาษ (Word + Print)
	2.	เก็บข้อมูลรายได้ต่อห้องอย่างเป็นระบบ
	3.	วิเคราะห์การปรับค่าเช่าตามอัตราเงินเฟ้อไทย
	4.	รองรับการทำงานผ่าน LINE เป็นหลัก
	5.	เปิดทางให้ใช้ Automation + AI ในอนาคต

⸻

2. Tech Stack (ตามที่กำหนด)
	•	Frontend / Backend: Next.js (App Router)
	•	ORM: Prisma v7
	•	Database (Dev): PostgreSQL (Docker)
	•	Auth: Simple role-based (Owner / Tenant)
	•	Deployment (Future): Cloud VM / PaaS
	•	Integration: LINE Messaging API

⸻

3. Core Features

3.1 Room & Building Management
	•	จัดการข้อมูลตึก
	•	จัดการห้อง (เลขห้อง, ขนาด, ค่าเช่าปัจจุบัน, สถานะ)

3.2 Tenant Management
	•	ข้อมูลผู้เช่า
	•	ประวัติการเช่า
	•	เชื่อมโยงผู้เช่ากับห้อง

3.3 Contract Management
	•	Template สัญญาเช่า (Markdown / HTML)
	•	Auto-generate PDF
	•	รองรับ:
	•	เซ็นต่อหน้า (Tablet / Mobile)
	•	เซ็นผ่านมือถือ (ลิงก์)
	•	เก็บ version ของสัญญา

3.4 Income & Statistics
	•	บันทึกรายได้รายเดือนต่อห้อง
	•	Dashboard สรุป:
	•	รายได้ต่อตึก / ห้อง
	•	Occupancy rate
	•	Export CSV / Excel

3.5 Inflation-based Rent Analysis
	•	ดึงข้อมูลอัตราเงินเฟ้อไทย (manual / API future)
	•	คำนวณ:
	•	ค่าเช่าปัจจุบันเทียบเงินเฟ้อ
	•	ค่าเช่าแนะนำ (Suggested Rent)

3.6 LINE-first Workflow
	•	แจ้งเตือนผ่าน LINE:
	•	ถึงรอบต่อสัญญา
	•	ค่าเช่าค้างชำระ
	•	สั่งงานผ่าน LINE (Phase 2):
	•	“ดูรายได้เดือนนี้”
	•	“ห้องว่างมีอะไรบ้าง”

⸻

4. Database Design (High-level)

Entities
	•	Building
	•	Room
	•	Tenant
	•	Contract
	•	ContractSignature
	•	Payment
	•	InflationIndex

⸻

5. Automation & AI Opportunities

Automation Engineering
	•	Auto-generate contract on tenant creation
	•	Auto reminder (cron + LINE)
	•	Auto rent adjustment simulation

AI Usage
	•	AI สรุปสถานะตึกเป็นภาษาไทยอ่านง่าย
	•	AI วิเคราะห์แนวโน้มรายได้
	•	AI ช่วยตรวจความผิดปกติของรายได้ (Anomaly Detection)
	•	AI Chat Agent ผ่าน LINE

⸻

6. AI Agent Task Breakdown (for Antigravity)

Agent 1: System Architect

Prompt:

Design overall architecture for a small-scale rental management system using Next.js + Prisma + PostgreSQL (Docker-based dev).

⸻

Agent 2: Database Agent

Prompt:

Design Prisma schema for buildings, rooms, tenants, contracts, payments, and inflation index. Optimize for analytics.

⸻

Agent 3: Contract Automation Agent

Prompt:

Create a contract templating system that can generate PDF contracts and manage digital signatures.

⸻

Agent 4: LINE Integration Agent

Prompt:

Implement LINE Messaging API integration for notifications and basic command-based interactions.

⸻

Agent 5: Analytics & Inflation Agent

Prompt:

Design a rent analysis module that compares historical rent with Thai inflation data and suggests rent adjustments.

⸻

Agent 6: AI Insight Agent

Prompt:

Build an AI-powered summary generator that explains rental performance in simple Thai language for non-technical users.

⸻

7. Development Environment

Docker (Dev)
	•	PostgreSQL
	•	Prisma migration

version: '3.9'
services:
  db:
    image: postgres:16
    container_name: rental_pg
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: rental_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:


⸻

8. Future Phase
	•	OCR เอกสารเก่า
	•	Voice command ผ่าน LINE
	•	Predictive vacancy model
	•	Cloud deployment + backup

⸻

9. Success Criteria
	•	คุณพ่อใช้งานผ่าน LINE ได้จริง
	•	ลดการใช้กระดาษ >80%
	•	ดูรายได้และตัดสินใจปรับค่าเช่าได้จาก dashboard เดียว

⸻

Owner: Family Internal Use
Status: MVP Planning