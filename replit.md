# Lumyn Payroll

A full-featured payroll management system built for Kenyan SMBs with Next.js 16, Prisma v7, Clerk authentication, and PostgreSQL.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk (`@clerk/nextjs`) — users sign up and choose their own role
- **Database ORM**: Prisma v7 with `@prisma/adapter-pg` (PostgreSQL)
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui, Recharts
- **Email**: Nodemailer

## Project Structure

```
app/
  (dashboard)/       — Protected dashboard pages (redirects to /onboarding if no DB record)
  api/               — Server-side API routes
  sign-in/           — Clerk sign-in page
  sign-up/           — Clerk sign-up page (redirects to /onboarding after sign-up)
  onboarding/        — Role selection page (new users pick their role here)
components/          — Shared Radix/shadcn UI components
app/components/      — Custom UI components (Badge with danger/success/warning variants)
hooks/               — React hooks (use-nav-items.ts with 5-role navigation)
lib/
  auth.ts            — getCurrentDbUser() — does NOT auto-create for regular users
  rbac.ts            — RBAC permissions matrix (5 roles: EMPLOYEE, MANAGER, HR_ADMIN, FINANCE, SUPER_ADMIN)
  generated/prisma/  — Auto-generated Prisma client (do not edit; run npm run db:generate)
  prisma.ts          — Prisma client singleton
prisma/
  schema.prisma      — Database schema (Role enum: SUPER_ADMIN, HR_ADMIN, FINANCE, MANAGER, EMPLOYEE)
  config.ts          — Prisma v7 config (DATABASE_URL lives here, not in schema)
proxy.ts             — Clerk auth middleware (Replit uses proxy.ts, NOT middleware.ts)
mobile/              — React Native / Expo mobile app (separate package)
public/              — Static assets
```

## User Roles (DB Enum)

| Role | Access |
|------|--------|
| `EMPLOYEE` | Own payslips, leave requests, attendance, payment methods, wallet |
| `MANAGER` | Team view + all EMPLOYEE access, employees list, reports |
| `HR_ADMIN` | All MANAGER access + payroll, departments, documents, organization |
| `FINANCE` | All HR_ADMIN access + compliance, disbursement (tab in payroll) |
| `SUPER_ADMIN` | Full access + User Management page to view/edit all users' roles |

## Authentication & Onboarding Flow

1. User visits `/` → redirected to `/dashboard`
2. Dashboard layout calls `getCurrentDbUser()` — if no DB record → redirect to `/onboarding`
3. `proxy.ts` middleware protects all routes: no Clerk session → redirect to `/sign-in`
4. **New sign-up**: `/sign-up` → `forceRedirectUrl="/onboarding"` → role selection page
5. User picks role → `POST /api/auth/onboarding` creates DB record → redirect to `/dashboard`
6. **Super Admin**: `SUPER_ADMIN_CLERK_ID` env var — auto-creates their DB record on first visit
7. Super Admin can view all users at `/admin/users` and adjust any role

## Running the App

```bash
npm run dev          # Start dev server on port 5000
npm run build        # Build for production
npm run start        # Start production server on port 5000
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

## Critical Replit Notes

- Dev server runs on port **5000** bound to `0.0.0.0` (required for Replit webview)
- Replit uses `proxy.ts` for Next.js middleware — **never create `middleware.ts`** (conflicts)
- Prisma v7: `datasource db` in `schema.prisma` has NO `url` field — DB URL is in `prisma.config.ts`
- Prisma client output: `lib/generated/prisma/` — must run `npx prisma generate` after schema changes
- `npx prisma db push` syncs the DB schema without migrations (used for dev)

## Navigation (Consolidated)

Nav items are driven by `hooks/use-nav-items.ts` using only the 5 DB roles.
- Duplicate routes redirect to their canonical page:
  - `/leave-management` → `/leave`
  - `/leave-types` → `/leave` (HR+ see a "Leave Types" tab on the `/leave` page)
  - `/compliance-manager` → `/compliance`
  - `/document-manager` → `/documents`
  - `/disbursement` → `/payroll`

## Environment Variables Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `SUPER_ADMIN_CLERK_ID` | Clerk user ID to auto-promote to Super Admin |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of the app |
| `NEXT_PUBLIC_COMPANY_NAME` | Company name |
| `NEXT_PUBLIC_COMPANY_REG` | Company registration number |
| `NEXT_PUBLIC_COMPANY_TAX_ID` | Company KRA PIN |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Company contact email |
| `NEXT_PUBLIC_CONTACT_PHONE` | Company contact phone |
| `NEXT_PUBLIC_COUNTRY` | Country |
| `NEXT_PUBLIC_CURRENCY` | Currency (e.g. KES) |
| `DARAJA_CONSUMER_KEY` | M-Pesa Daraja API key |
| `DARAJA_CONSUMER_SECRET` | M-Pesa Daraja API secret |
| `DARAJA_SHORTCODE` | M-Pesa shortcode |
| `PESAPAL_CONSUMER_KEY` | PesaPal consumer key |
| `PESAPAL_CONSUMER_SECRET` | PesaPal consumer secret |
| `WISE_API_KEY` | Wise international transfers API key |
