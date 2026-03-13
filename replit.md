# Lumyn Payroll

A modern HR and Payroll Management Platform UI built for small and medium businesses in Kenya (5–500 employees).

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Custom components built with Radix UI primitives

## Project Structure

```
app/
├── components/
│   ├── layout/         # Sidebar, TopNav
│   └── ui/             # Card, Badge, Button
├── dashboard/          # HR Admin Dashboard
├── employees/          # Employee Directory
├── payroll/            # Payroll Management
├── attendance/         # Attendance Tracking
├── leave/              # Leave Management
├── advances/           # Salary Advances
├── compliance/         # Statutory Compliance (PAYE, NSSF, SHIF)
├── reports/            # Reports & Analytics
├── organization/       # Org Structure Tree
├── documents/          # Document Management
├── notifications/      # System Notifications
├── settings/           # System Settings + Integrations
lib/
└── utils.ts            # cn() utility
```

## Running the App

```bash
npm run dev   # Dev server on port 5000
npm run build # Production build
npm start     # Production server
```

## Key Features

- Full dashboard layout with collapsible sidebar navigation
- KPI cards, analytics charts (line, bar, pie) using Recharts
- Employee directory with search, filter, pagination
- Payroll processing interface with statutory deductions (PAYE, NSSF, SHIF, Housing Levy)
- Attendance tracking with clock-in/out records
- Leave management with approval workflow
- Salary advance requests and approval
- Compliance dashboard with PAYE/NSSF/SHIF/Housing Levy tracking
- Reports & analytics with multiple chart types
- Organization structure tree view
- Settings with integrations (M-Pesa, KRA iTax, NSSF, SHIF, SMS, Biometric)

## Deployment

Configured for autoscale deployment with build step (`npm run build`) and production start (`npm start`).
