# Lumyn Payroll — HR & Payroll Management System

A comprehensive HR and payroll management platform for the Kenyan market, featuring automated PAYE/NSSF/NHIF/SHIF calculations, leave management, attendance tracking, wallet disbursements, and role-based access control.

## Architecture

- **Web App**: Next.js 16 (App Router, Turbopack) on port 5000
- **Mobile App**: Expo 53 (React Native) on port 8080
- **Database**: PostgreSQL via Prisma ORM (`lib/generated/prisma`)
- **Auth**: Clerk (`@clerk/nextjs`) with `proxy.ts` as the auth middleware (Next.js 16 uses `proxy.ts` instead of `middleware.ts`)
- **Payments**: Pesapal integration for wallet top-ups and disbursements

## Project Structure

```
app/                      Next.js App Router
  (dashboard)/            Protected dashboard routes (employees, payroll, leave, etc.)
  api/                    Backend API routes
  sign-in/                Clerk sign-in page
  sign-up/                Clerk sign-up page
components/ui/            Shared Shadcn UI components (root-level)
app/components/ui/        Additional UI components (badge, button, card)
lib/
  prisma.ts               Prisma client (singleton, uses PrismaPg adapter)
  auth.ts                 Clerk user → DB user helper
  rbac.ts                 Role-based access control permission matrix
  wallet/                 Pesapal wallet service
prisma/
  schema.prisma           Database schema
  migrations/             Applied migrations
mobile/                   Expo mobile app
proxy.ts                  Clerk auth middleware (Next.js 16 convention)
```

## Key Configuration

- `proxy.ts` — Clerk middleware protecting all non-public routes
- `next.config.ts` — allowedDevOrigins set via REPLIT_DEV_DOMAIN for Replit proxy
- `prisma.config.ts` — Prisma config using DATABASE_URL

## Environment Variables

### Secrets (set in Replit Secrets)
- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit DB)
- `CLERK_SECRET_KEY` — Clerk server-side secret key
- `PESAPAL_CONSUMER_KEY` — Pesapal API key (optional, for payments)
- `PESAPAL_CONSUMER_SECRET` — Pesapal API secret (optional, for payments)

### Shared Env Vars
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` — `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` — `/dashboard`
- `SUPER_ADMIN_CLERK_ID` — Clerk user ID for the super admin account
- `NEXT_PUBLIC_BASE_URL` — Public URL of the app (used for Pesapal callbacks)

## Roles & Permissions

Defined in `lib/rbac.ts`:
- `SUPER_ADMIN` — Full access + admin panel
- `HR_ADMIN` — Employee management, leave, onboarding
- `FINANCE` / `FINANCE_LEAD` / `CFO` — Payroll, disbursements, wallet
- `MANAGER` — Department-level view + leave approvals
- `EMPLOYEE` — Own profile, payslips, leave requests

## Running Workflows

- **Start application** — `npm run dev` on port 5000
- **Mobile App** — `expo start --web --port 8080` in `mobile/`

## Important Notes

- Next.js 16 uses `proxy.ts` (not `middleware.ts`) for route protection middleware
- Prisma client output is at `lib/generated/prisma` (not the default location)
- The DB adapter is `@prisma/adapter-pg` (PrismaPg) — the DATABASE_URL is passed to it directly
- To set a super admin: update `SUPER_ADMIN_CLERK_ID` env var with the user's Clerk ID
- Payroll calculations are done in `app/api/payroll/runs/route.ts` (PAYE, NSSF, SHIF, Housing Levy)
