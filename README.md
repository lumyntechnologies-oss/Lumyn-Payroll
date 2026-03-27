# Lumyn Payroll 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.5-green?logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwind)](https://tailwindcss.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-purple?logo=react)](https://reactnative.dev)

**Lumyn Payroll** is a production-ready, full-featured payroll management system built for Kenyan businesses. Handle employee onboarding, attendance tracking, compliant payroll processing (PAYE, NSSF, SHIF, Housing Levy), multi-method disbursements (M-Pesa, Bank, International), and mobile access.

## ✨ Features

| Category | Capabilities |
|----------|--------------|
| **👥 Employees** | Onboarding, profiles (KRA/NSSF/NHIF), departments, payment methods (BANK/MPESA/INTERNATIONAL), documents upload |
| **⏰ Attendance** | Clock-in/out, history, overtime, rules config, today status |
| **💰 Payroll** | Monthly runs, payslips, tax calc (2026 brackets), export, batch disbursement |
| **🏦 Payments** | Pesapal/Daraja/Wise integration, wallet top-up/transactions, reconciliation |
| **📄 Leave** | Types/balances/requests, approval workflow, policy config |
| **📊 Reports** | Dashboard analytics, compliance summary, exports |
| **🛡️ Compliance** | PAYE/NSSF/SHIF/Housing Levy tracking, alerts, tax calculations |
| **📱 Mobile** | React Native Expo app for employees/managers |
| **🔐 Security** | Clerk auth, granular RBAC (5 roles), audit logs, data masking |

**Kenya-Specific**: 2026 tax brackets, statutory contributions (NSSF 6%, NHIF 1.75%, SHIF 0.5%, Housing Levy 1.5%).

## 🏗️ Tech Stack

- **Web**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Prisma + PostgreSQL, tRPC-ready API routes
- **Auth**: Clerk (multi-role support)
- **Payments**: Pesapal, Daraja (M-Pesa), Wise
- **Mobile**: React Native + Expo Router
- **DB**: PostgreSQL (migrations included)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (local/Docker/Supabase)
- Clerk account (dev keys)
- [.env](https://github.com/joshuaLumyn/Lumyn-Payroll/blob/main/.env.example) with DB_URL, CLERK keys, payment provider secrets

```bash
git clone https://github.com/joshuaLumyn/Lumyn-Payroll.git
cd Lumyn-Payroll
cp .env.example .env  # Fill in your values
npm install
npm run db:generate
npx prisma db push  # Or npm run db:migrate for prod
npm run db:seed   
npm run dev         # http://localhost:3000
```

**Login**: Use seeded Super Admin or sign up. Dashboard auto-redirects.

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Payments (Pesapal example)
PESAPAL_CONSUMER_KEY=...
PESAPAL_CONSUMER_SECRET=...

# Super Admin (Clerk ID)
SUPER_ADMIN_CLERK_ID=...
```

## 📋 Detailed Setup

<details>
<summary>Database & Seeding</summary>

```bash
npx prisma migrate dev --name init
npm run db:seed  # Creates Super Admin, sample employees/depts/payroll
npx prisma studio  # Browse data
```
</details>

<details>
<summary>Payment Providers</summary>

Configure in `/api/settings`:
- **M-Pesa**: Daraja API credentials
- **Bank**: Pesapal sandbox/prod keys
- **International**: Wise API token

Test disbursements in sandbox mode.
</details>

<details>
<summary>Mobile App</summary>

```bash
cd mobile
npm install
npx expo start  # Set EXPO_PUBLIC_API_URL to your web URL
```
</details>

## 🎯 Role-Based Access Control (RBAC)

Comprehensive permissions enforced frontend/backend:

| Role | Key Permissions |
|------|-----------------|
| **EMPLOYEE** | Own data, payment methods, leave requests |
| **MANAGER** | Team view/approve, dept reports |
| **FINANCE** | Payroll runs, disbursements, reconciliation |
| **HR_ADMIN** | Employee mgmt, leave policies, compliance |
| **SUPER_ADMIN** | Full access |

See [RBAC-GUIDE.md](app/docs/RBAC-GUIDE.md) for full matrix.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Next.js API   │───▶│   Prisma ORM     │
│     Routes      │    │   PostgreSQL     │
└─────────────────┘    └──────────────────┘
         ▲                      ▲
         │                      │
┌─────────────────┐    ┌──────────────────┐
│   Services      │◀──▶│   Middleware     │
│ (payments, etc) │    │ (role-check)     │
└─────────────────┘    └──────────────────┘
```

- **Services**: Modular (lib/attendance, lib/payments/PesapalProvider, etc.)
- **Middleware**: Role validation on sensitive routes
- **Hooks**: use-nav-items for dynamic UI

## 📖 API Examples

```bash
# Get payroll run
curl http://localhost:3000/api/payroll/runs/2026-1

# Clock in
curl -X POST http://localhost:3000/api/attendance/clock-in

# Disburse payroll (FINANCE+ role)
curl -X POST http://localhost:3000/api/payroll/disburse/{runId}
```

Full OpenAPI docs: Coming soon.

## 🚀 Development

```bash
npm run lint
npm run db:studio  # Prisma UI
npm run build      # Production build
```

**Testing**: Unit tests pending (add Jest/Vitest).

## ☁️ Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Add env vars (DB_URL, Clerk keys)
3. Prisma auto-migrates on deploy

### Self-Hosted
- Docker Compose for Postgres + app
- PM2/Render for Node

## 🤝 Contributing

1. Fork & PR
2. Follow ESLint/Prettier
3. Add tests for new features
4. Update Prisma schema → `npx prisma db push`

Issues: [Create New](https://github.com/joshuaLumyn/Lumyn-Payroll/issues/new)

## 📄 License

[MIT](LICENSE) - Free for commercial use.

## 🙌 Support

- [RBAC Guide](app/docs/RBAC-GUIDE.md)
- Discord/Slack: Coming soon
- Paid support: Contact joshua@lumyn.co.ke

---

⭐ **Star on GitHub** if useful! Made with ❤️ for Kenyan businesses.

