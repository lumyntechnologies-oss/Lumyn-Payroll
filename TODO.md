<!-- # Lumyn Payroll System - Completion Roadmap

## Current Status
✅ Employee Dashboard (personalized name)
✅ Profile page (employee view)
✅ Settings (role-based: personal for employees, full admin for HR+)
✅ Sidebar nav (RBAC compliant, no duplicates)
✅ Basic frontend structure

## Backend Implementation (Priority 1)
- [ ] `/api/employees/**` - Full CRUD, role-based filtering
- [ ] `/api/payroll/runs/**` - Create/view payroll runs (MANAGER+)
- [ ] `/api/payroll/payslips/**` - Generate/download payslips (all roles own)
- [ ] `/api/attendance/**` - Clock in/out, summargges (role-filtered)
- [ ] `/api/leave/**` - Request/approve leaves (employee/manager)
- [ ] `/api/payments/**` - Methods CRUD (own for employee, team for manager)
- [ ] `/api/dashboard` - Role-specific KPIs (personal for employee, team for manager, company for HR)
- [ ] `/api/settings/**` - Company config (HR_ADMIN+ only)

## Integration (Priority 2)
- [ ] Payment providers (M-Pesa, bank APIs via `lib/payments`)
- [ ] Clerk auth full sync (`/api/auth/sync`)
- [ ] Prisma seed production data (`prisma/seed.ts`)
- [ ] File uploads (payslips, docs)

## Frontend Polish (Priority 3)
- [ ] Forms validation (react-hook-form, zod)
- [ ] Loading/error states everywhere
- [ ] Mobile app (`mobile/` folder)
- [ ] Reports export (PDF/Excel)

## Security/Production (Priority 4)
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Audit logs full impl
- [ ] Environment vars (.env)
- [ ] Deployment (Vercel/Docker)

## Quick Start Command
```bash
npm install
npx prisma migrate dev
npm run dev
```

**Next**: Confirm priority (backend first?) or specific feature. -->
