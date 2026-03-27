# 🚧 Remaining Implementations - Lumyn Payroll

Prioritized roadmap for full production readiness. Based on file structure, schema, API routes vs. existing UIs.

## 🎯 Priority 1: Critical (Blockers - 1-2 days)
| Feature | Description | Files/Status | Est. |
|---------|-------------|--------------|------|
| Dashboard Pages | Create `page.tsx` in empty subdirs: `employees/`, `payroll/`, `reports/`, `wallet/`, `payments/` etc. Use shadcn tables/charts. | app/(dashboard)/{employees,payroll,...}/ missing page.tsx | 1 day |
| Error Boundaries | Global error fallback, API error toasts. | lib/error-boundary.tsx | 2h |
| Loading States | Skeletons for all tables/charts. | Reuse Loader2 + shadcn skeleton | 2h |

## 🛠️ Priority 2: Core UI/UX (3-5 days)
| Feature | Description | Files/Status |
|---------|-------------|--------------|
| Reports Page | Recharts dashboard (payroll summary, compliance charts). | app/(dashboard)/reports/page.tsx + mock data |
| Payroll Disburse UI | Form + preview table for batch disbursement (FINANCE role). | app/(dashboard)/payroll/disburse/page.tsx |
| Employee CRUD | Add/Edit employee form (HR_ADMIN). | app/(dashboard)/employees/[id]/page.tsx + form |
| Mobile Completion | Tabs: Dashboard, Attendance, Payslips, Wallet. | mobile/app/(tabs)/{dashboard,...}/index.tsx |
| Onboarding Flow | Multi-step wizard post-signup. | app/onboarding/ + stepper component |

## 🔧 Priority 3: Testing & Reliability (2-3 days)
| Feature | Description | Files/Status |
|---------|-------------|--------------|
| Unit Tests | Services (payment, attendance), utils. | Add Vitest: tests/lib/payments.test.ts |
| E2E Tests | Core flows (login → payroll → disburse). | Playwright/cypress/ |
| Form Validation | Zod + React Hook Form everywhere. | lib/validators/leave.ts etc. |

## 📱 Priority 4: Polish & Integrations (3-5 days)
| Feature | Description | Files/Status |
|---------|-------------|--------------|
| Notifications UI | List/mark-read UI (all read button). | app/(dashboard)/notifications/page.tsx |
| Document Manager | Upload/preview/delete grid. | app/(dashboard)/documents/page.tsx |
| Settings Pages | Forms for company/leave/payroll rules. | app/(dashboard)/settings/{company,...}/page.tsx |
| Wallet Topup UI | Pesapal iframe + history. | app/(dashboard)/wallet/page.tsx |
| OpenAPI Docs | Swagger for /api routes. | Add swagger-ui-next |

## ☁️ Priority 5: Deploy & Ops (1 day)
| Feature | Description | Files/Status |
|---------|-------------|--------------|
| Docker Compose | Postgres + app + seed. | docker-compose.yml |
| Vercel/Render Config | next.config.ts tweaks, env groups. | vercel.json |
| CI/CD | GitHub Actions: lint/test/deploy. | .github/workflows/ |

## 📊 Progress Tracker
- **Implemented**: Leave page (bugfixed), auth/onboarding basics, API stubs, RBAC, services.
- **Total Est.**: 10-16 days solo.
- **Next**: Start P1 dashboard pages.

**Legend**: Est. in hours/days. Update as completed. Ping for help on any!
