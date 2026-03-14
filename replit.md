# Lumyn Payroll

A complete modern SaaS HR and Payroll Management Platform built for Kenyan SMBs (5–500 employees).

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React + @expo/vector-icons (mobile)
- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-pg`
- **Mobile**: Expo ~53 + React Native + expo-router (in `mobile/` directory)

## Architecture

### Web App (Port 5000)
- `app/` — Next.js App Router pages (12 sections)
- `app/api/` — All REST API routes
- `app/components/` — Shared UI components (Badge, Button, Card, Sidebar, TopNav)
- `lib/` — Prisma client, API helpers, utilities
- `prisma/` — Schema, migrations, seed data

### Mobile App (Port 8080)
- `mobile/app/(tabs)/` — Bottom tab screens (Dashboard, Employees, Payroll, Leave, Profile)
- `mobile/constants/api.ts` — Shared API fetch utility
- Connects to Next.js API via `EXPO_PUBLIC_API_URL` env var

## Prisma 7 Setup (Critical)

Prisma 7 uses the **driver adapter pattern** — NOT the traditional binary engine.

- `prisma.config.ts` — Defines DATABASE_URL for Prisma CLI
- `prisma/schema.prisma` — Schema WITHOUT `url` in datasource block
- `lib/prisma.ts` — Creates `PrismaClient` with `new PrismaPg({ connectionString })` adapter
- `@prisma/adapter-pg` package is required (already installed)

## Database Setup (User must do this)

1. Add `DATABASE_URL=postgresql://...` to `.env` file
2. Run: `npm run db:generate` (regenerate Prisma client)
3. Run: `npm run db:migrate` (apply schema migrations)
4. Run: `npm run db:seed` (optional: seed sample data)

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server (port 5000) |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed sample data (8 employees, 6 depts, etc.) |
| `npm run db:studio` | Open Prisma Studio |

## API Routes

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/dashboard` | GET | KPIs, charts, compliance alerts |
| `/api/employees` | GET, POST | Employee list with search/filter/pagination |
| `/api/employees/:id` | GET, PATCH, DELETE | Single employee CRUD |
| `/api/departments` | GET, POST | Department list |
| `/api/payroll/runs` | GET, POST | Payroll run list, create new run |
| `/api/payroll/runs/:id` | PATCH | Approve/update payroll run |
| `/api/payroll/entries` | GET | Payroll entries for a run |
| `/api/attendance` | GET, POST | Attendance records with date filter |
| `/api/leave/requests` | GET, POST | Leave request list |
| `/api/leave/requests/:id` | PATCH | Approve/reject leave request |
| `/api/leave/balances` | GET | Leave balance summaries |
| `/api/leave/types` | GET | Available leave types |
| `/api/advances` | GET, POST | Salary advance requests |
| `/api/advances/:id` | PATCH | Approve/reject advance |
| `/api/compliance` | GET | Statutory compliance records |
| `/api/compliance/:id` | PATCH | Mark compliance as filed |
| `/api/notifications` | GET, PATCH | Notifications + mark read |
| `/api/reports` | GET | Payroll, headcount, leave, dept-cost reports |

## Kenyan Payroll Calculations

- **PAYE**: 10% (0–24,000), 25% (24,001–32,333), 30% (above 32,333)
- **NSSF**: min(KES 2,160, basic × 6%)
- **SHIF**: KES 500 flat rate
- **Housing Levy**: gross × 1.5%

## Workflows

- **Start application** — `npm run dev` on port 5000 (webview)
- **Mobile App** — `cd mobile && expo start --web --port 8080` (console)

## Pages

1. **Dashboard** — KPIs, payroll trend, dept headcount, compliance alerts, activity feed
2. **Employees** — Search/filter table, add employee modal, status badges
3. **Payroll** — Run payroll, payroll register, approve runs, per-employee breakdown
4. **Attendance** — Daily clock-in/out log, add records, summary metrics
5. **Leave** — Requests management, approve/reject, leave type balances
6. **Advances** — Salary advance requests, approve/reject workflow
7. **Compliance** — PAYE/NSSF/SHIF/Housing Levy filing status by month
8. **Reports** — Payroll trend, dept cost, leave utilization, headcount charts
9. **Organization** — Org chart and department structure (static)
10. **Documents** — HR document library (static)
11. **Notifications** — System alerts, mark as read
12. **Settings** — Company/payroll/leave configuration (static)
