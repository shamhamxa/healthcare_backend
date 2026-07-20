# Clinic Management System — Backend API

Enterprise Patient Journey Management System. Single-clinic first, multi-clinic SaaS-ready from day one.

**The Visit is the central business entity.** Patients, tokens, vitals, diagnoses, prescriptions, invoices, payments and follow-ups all hang off a Visit, which moves through a strict state machine mirroring real clinic flow:

```
REGISTERED → WAITING → IN_ASSESSMENT → READY_FOR_DOCTOR
  → IN_CONSULTATION → PAYMENT_PENDING → COMPLETED
  (CANCELLED reachable from any pre-completed state)
```

## Tech stack

NestJS · PostgreSQL · Prisma 6 · Redis + BullMQ (optional locally) · JWT + refresh tokens · Docker

## Architecture decisions

- **Multi-tenant:** every business table carries `clinicId` (plus nullable `branchId` for future branches). Tenant scope is enforced from the JWT in every query; super admins pass `clinicId` explicitly.
- **Relational + JSONB hybrid:** searchable/reportable business data (names, phones, dates, amounts, invoice numbers) is relational and indexed. Flexible medical data (vitals, symptoms, clinical/SOAP/AI notes, attachment metadata, doctor preferences) is JSONB — AI features plug in without schema redesign.
- **RBAC:** system roles (SUPER_ADMIN, CLINIC_ADMIN, DOCTOR, RECEPTIONIST, ASSISTANT, CASHIER) with granular permission codes (`patients.create`, `visits.consult`, `billing.refund`, …) checked by a global guard.
- **Atomic numbering:** MRNs, visit numbers, daily per-doctor tokens, invoice & receipt numbers come from an `ON CONFLICT`-based counter table — concurrency-safe.
- **Audit trail:** data changes → `audit_logs`; user actions (logins, token calls) → `activity_logs`. Soft delete everywhere user-facing.
- **Notifications:** persisted first, dispatched via BullMQ when `REDIS_ENABLED=true`. Provider integrations (SMS/WhatsApp/email/push) plug into one processor.

## Running locally

```bash
npm install
# .env is pre-configured for local PostgreSQL (healthcare_dev)
npx prisma migrate dev
npx prisma db seed
npm run start:dev        # http://localhost:3000/api/v1
```

Or with Docker (Postgres + Redis + API): `docker compose up` from the repo root.

### Seeded logins (password: `Admin@12345`)

| Email | Role |
|---|---|
| super@clinic.local | Super Admin |
| admin@citycare.clinic | Clinic Admin |
| dr.ahmed@citycare.clinic / dr.sara@citycare.clinic | Doctor |
| reception@citycare.clinic | Receptionist |
| assistant@citycare.clinic | Clinical Assistant |
| cashier@citycare.clinic | Cashier |

## API map (prefix `/api/v1`)

**Auth** — `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`, `POST /auth/change-password`

**Front desk**
- `GET /patients?q=` search (name/phone/MRN) · `POST /patients` (409 + candidates on duplicate; `force=true` overrides) · `GET /patients/:id/timeline` full medical history
- `POST /appointments` (clash detection, auto reminder) · `/appointments/:id/check-in|reschedule|cancel|no-show`
- `POST /visits` walk-in check-in (creates Visit + daily token) · `POST /visits/:id/cancel`
- `GET /queue?queueType=RECEPTION|ASSISTANT|DOCTOR&doctorId=` live board with estimated wait · `POST /queue/call-next` · `/queue/tokens/:id/call|skip|recall|complete|transfer`

**Clinical assistant**
- `PATCH /visits/:id/assessment` — vitals (BP, pulse, temp, height/weight/BMI, SpO₂, respiration, sugar), chief complaint, symptoms, report flags; `readyForDoctor=true` moves patient to doctor queue

**Doctor**
- `POST /visits/:id/start-consultation` · `PATCH /visits/:id/consultation` (notes, diagnoses w/ ICD codes, follow-up) · `POST /visits/:id/complete-consultation` (auto-creates invoice)
- `PUT /visits/:visitId/prescription` (editable until signed) · `POST …/prescription/sign` · `GET …/prescription/print` (PDF payload)
- `GET /medicines?q=` typeahead · favorites (`/medicines/favorites/*`) · most-used (`/medicines/most-used/mine`) · templates (`/medicines/templates/*`)

**Billing** — `GET/PATCH /invoices/:id` (items, discount, tax) · `POST /invoices/:id/payments` (cash/card/online, split supported; full payment auto-closes the visit) · `GET /payments/:id/receipt` · `POST /payments/:id/refund`

**Follow-ups** — `GET /follow-ups?due=today|overdue|upcoming` · `POST /follow-ups/:id/book|remind|status`

**Files** — `POST /attachments` (multipart; lab reports, X-rays, clinical images) · `GET /attachments/:id/download`

**Analytics** — `/analytics/dashboard`, `/revenue` (daily series + by method), `/doctor-performance` (avg consult & wait minutes), `/disease-trends`, `/top-medicines`, `/follow-up-rate`

**Admin** — `POST /clinics` (SaaS tenant onboarding w/ first admin) · `GET /clinics/me` · `POST/GET/PATCH /users` · `GET /users/doctors` · `GET /audit-logs` · `GET /notifications`

## Project layout

```
prisma/schema.prisma     # full data model — the source of truth
prisma/seed.ts           # roles, permissions, demo clinic, medicine master
src/
  common/                # guards, decorators, filters, pagination, tenant utils
  prisma/                # PrismaService + atomic NumberingService
  modules/
    auth/ users/ clinics/ patients/ appointments/ visits/ queue/
    medicines/ prescriptions/ billing/ follow-ups/ attachments/
    notifications/ analytics/ audit/
```
