# Lumyn Payroll

A full-featured payroll management system built with Next.js, Prisma (v7), Clerk authentication, and PostgreSQL.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Database ORM**: Prisma v7 with `@prisma/adapter-pg` (PostgreSQL)
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui, Recharts
- **Email**: Nodemailer

## Project Structure

- `app/` — Next.js App Router pages and API routes
  - `(dashboard)/` — Protected dashboard pages
  - `api/` — Server-side API routes
  - `sign-in/`, `sign-up/` — Clerk auth pages
- `components/` — Shared React components
- `lib/` — Server utilities (prisma client, auth helpers, etc.)
  - `generated/prisma/` — Auto-generated Prisma client (do not edit)
- `prisma/` — Prisma schema and migrations
- `mobile/` — Mobile app (separate package)
- `public/` — Static assets

## Running the App

```bash
npm run dev       # Start dev server on port 5000
npm run build     # Build for production
npm run start     # Start production server on port 5000
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

## Environment Variables Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `SUPER_ADMIN_CLERK_ID` | Clerk user ID for super admin |
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

## Replit Configuration

- Dev server runs on port **5000** bound to `0.0.0.0` (required for Replit preview)
- `next.config.ts` is pre-configured with Replit dev domain origins
- Prisma v7 uses `prisma.config.ts` for database URL (not the schema file)
- Prisma client is output to `lib/generated/prisma/` — run `npm run db:generate` after schema changes
