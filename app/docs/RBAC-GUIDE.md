<!-- # Role-Based Access Control (RBAC) Guide

## Overview
This document outlines what different user roles can see and access in the Payroll System.

## Role Hierarchy (Lowest to Highest Permission)

1. **EMPLOYEE** - Basic employee
2. **MANAGER** - Team/Department manager
3. **HR_ADMIN** - HR department administrator
4. **FINANCE_LEAD** - Finance department lead
5. **CFO** - Chief Financial Officer
6. **SUPER_ADMIN** - System administrator (full access)

---

## Access Matrix by Role

### EMPLOYEE (Lowest Level)
**What they can see:**
- Dashboard (personal stats only)
- Payment Methods (add/edit/delete own methods)
- Own Payslips & Payment History
- Own Leave Requests
- Own Profile
- Notifications & Settings

**What they CANNOT see:**
- Other employees' data
- Payroll runs
- Disbursement system
- Reports (all employees data)
- Audit logs
- Admin settings

**Quick Actions Available:**
- View Payment Methods

**Navigation Items Visible:**
```
- Dashboard
- Payment Methods
- Notifications
- Settings
```

---

### MANAGER (Team Lead)
**Inherits:** All EMPLOYEE access

**Additional Access:**
- View team/department employees
- View team payroll runs
- View team attendance records
- View team leave requests (approve/reject)
- Download team reports

**What they CANNOT see:**
- Company-wide disbursement system
- Finance provider settings
- Reconciliation data
- Other department data (unless configured)
- Audit logs

**Quick Actions Available:**
- View Payment Methods
- Add Employee (to their department)
- Run Payroll (view only)
- Approve Leave (their team)
- Generate Report (their team)

**Navigation Items Visible:**
```
- Dashboard
- Employees (team only)
- Departments
- Payment Methods
- Payroll (view only)
- Attendance
- Leave Management
- Reports (team only)
- Notifications
- Settings
```

---

### HR_ADMIN (HR Administrator)
**Inherits:** All MANAGER access

**Additional Access:**
- View all employees company-wide
- Manage all leave types
- View all audit logs
- Configure documents
- Access compliance features
- View all payments (read-only)

**What they CANNOT see:**
- Disbursement initiation
- Payment provider configuration
- Financial reconciliation
- Payment rules management

**Quick Actions Available:**
- View Payment Methods
- Add Employee (all departments)
- Approve Leave (all employees)
- Generate Report (company-wide)

**Navigation Items Visible:**
```
- Dashboard
- Employees (all)
- Departments
- Payment Methods
- Payroll (view only)
- Attendance
- Leave Management
- Leave Types
- Salary Advances
- Reports (all)
- Organization
- Documents
- Notifications
- Settings
```

---

### FINANCE_LEAD (Finance Department Lead)
**Inherits:** All HR_ADMIN access

**Additional Access:**
- Initiate salary disbursement
- View payment batches & status
- Reconcile payments
- Upload bank statements
- Approve large transactions (>KES 1M)
- View detailed audit logs
- Manage payment rules

**What they CANNOT see:**
- Payment provider API configuration
- System-level settings

**Quick Actions Available:**
- View Payment Methods
- Add Employee
- Run Payroll
- **Disburse Salary** (ADMIN ONLY BUTTON)
- Approve Leave
- Generate Report

**Navigation Items Visible:**
```
- Dashboard
- Employees (all)
- Departments
- Payment Methods
- Payroll (all)
- Disbursement (FINANCE_LEAD ONLY)
- Attendance
- Leave Management
- Leave Types
- Salary Advances
- Compliance
- Reports (all)
- Organization
- Documents
- Notifications
- Settings
```

---

### CFO (Chief Financial Officer)
**Inherits:** All FINANCE_LEAD access

**Additional Access:**
- Configure payment providers
- Manage API credentials
- Set payment limits & rules
- Review all financial data
- Override payment transactions
- Approve reconciliation exceptions
- Generate compliance reports

**Quick Actions Available:**
- View Payment Methods
- Add Employee
- Run Payroll
- **Disburse Salary** (ADMIN ONLY BUTTON)
- Approve Leave
- Generate Report

**Navigation Items Visible:**
```
- Dashboard
- Employees (all)
- Departments
- Payment Methods
- Payroll (all)
- Disbursement (CFO ONLY)
- Attendance
- Leave Management
- Leave Types
- Salary Advances
- Compliance
- Reports (all)
- Organization
- Documents
- Notifications
- Settings
- **User Management** (CFO access)
```

---

### SUPER_ADMIN (System Administrator)
**Access:** FULL SYSTEM ACCESS

**Can:**
- Access everything
- Configure all settings
- Manage all users & roles
- Override any transaction
- Delete/modify data
- View all audit logs with full details
- Configure system-wide rules

**Quick Actions Available:**
- View Payment Methods
- Add Employee
- Run Payroll
- **Disburse Salary** (ADMIN ONLY BUTTON)
- Approve Leave
- Generate Report

**Navigation Items Visible:**
```
- Dashboard
- Employees (all)
- Departments
- Payment Methods
- Payroll (all)
- Disbursement (SUPER_ADMIN ONLY)
- Attendance
- Leave Management
- Leave Types
- Salary Advances
- Compliance
- Reports (all)
- Organization
- Documents
- Notifications
- Settings
- **User Management** (FULL)
```

---

## Payment Methods & Disbursement

### Who Can Add Payment Methods:
- **All roles** can add their own payment methods
- **ADMIN+ roles** can add payment methods for employees

### Who Can Initiate Disbursement:
- **FINANCE_LEAD**, **CFO**, **SUPER_ADMIN** only
- Button appears in "Disbursement" page (hidden from other roles)
- Requires approval from CFO/SUPER_ADMIN

### Who Can View Batch Status:
- **HR_ADMIN** and above (read-only)
- **FINANCE_LEAD** and above (can initiate & manage)

### Who Can Reconcile Payments:
- **FINANCE_LEAD** and above only

---

## API Endpoint Access Control

### GET /api/payments/methods
- **EMPLOYEE:** Own methods only (masked sensitive data)
- **ADMIN+:** Can view any employee's methods (full details)

### POST /api/payments/methods
- **EMPLOYEE:** Can add own methods only
- **ADMIN+:** Can add methods for any employee

### POST /api/payroll/:runId/disburse
- **FINANCE_LEAD, CFO, SUPER_ADMIN:** Allowed
- **Others:** 403 Forbidden

### GET /api/payroll/disburse/status
- **HR_ADMIN+:** Allowed (read-only)
- **Others:** 403 Forbidden

---

## Dashboard Visibility

### EMPLOYEE Dashboard Shows:
- Personal payslips
- Payment status
- Leave balance
- Upcoming scheduled payments

### MANAGER Dashboard Shows:
- Team overview
- Department payroll summary
- Team leave statistics
- Attendance metrics

### HR_ADMIN Dashboard Shows:
- Company-wide employee count
- Total payroll amount
- Leave utilization
- Payment success rate

### FINANCE_LEAD/CFO Dashboard Shows:
- All HR_ADMIN data
- Payment batches in progress
- Failed transactions count
- Next disbursement date

### SUPER_ADMIN Dashboard Shows:
- All data from all levels
- System health metrics
- API performance
- User activity

---

## Audit Logging

**All Actions Logged:** Every payment-related action is logged with:
- WHO: User ID & Role
- WHAT: Action performed
- WHEN: Timestamp
- WHERE: IP address
- WHY: Approval reason (if applicable)

**Who Can View Audit Logs:**
- **HR_ADMIN+:** Can view logs

**Who Can Export Audit Logs:**
- **CFO, SUPER_ADMIN:** Can export for compliance

---

## Data Masking Rules

### For EMPLOYEE Role:
- Account numbers shown as: `****1234` (last 4 digits only)
- M-Pesa numbers shown as: `****5678` (last 4 digits only)
- IBAN shown as: `****9012` (last 4 digits only)
- Other employees' data: NOT VISIBLE

### For MANAGER/HR_ADMIN:
- Full account numbers visible (after verification)
- Can see all employee data in their scope
- No data masking

### For FINANCE_LEAD/CFO/SUPER_ADMIN:
- Full access to all data
- No masking
- Tokenized logging only (account details not in logs)

---

## Implementation Examples

### Checking Role in Frontend:
```typescript
import { useNavItems, hasPermissionLevel } from "@/hooks/use-nav-items";

// Get navigation items for current user
const navItems = useNavItems(userRole);

// Check if user has minimum permission level
if (hasPermissionLevel(userRole, "FINANCE_LEAD")) {
  // Show disbursement button
}
```

### Using RoleGate Component:
```typescript
import { RoleGate } from "@/components/access/role-gate";

// Only FINANCE_LEAD and above can see this
<RoleGate requiredRoles={["FINANCE_LEAD", "CFO", "SUPER_ADMIN"]}>
  <DisbursementDashboard />
</RoleGate>
```

### API Route Protection:
```typescript
import { checkRoleMiddleware } from "@/lib/middleware/role-check";

// Only allow FINANCE_LEAD and above
const roleCheck = await checkRoleMiddleware(req, ["FINANCE_LEAD", "CFO", "SUPER_ADMIN"]);
if (!roleCheck.valid) return roleCheck.response!;
```

---

## Default Role Assignment

**Suggested Default Roles by Position:**
- HR Staff → HR_ADMIN
- Finance Staff → FINANCE_LEAD
- Finance Manager → CFO
- Department Managers → MANAGER
- Regular Employees → EMPLOYEE

**To Change a User's Role:**
1. Go to Admin Panel → User Management
2. Select employee
3. Edit role
4. Changes apply immediately (no restart needed)

---

## Security Best Practices

1. **Never trust client-side role checks** - Always validate on backend
2. **All sensitive data requires role verification** - Frontend AND backend
3. **Audit logs are immutable** - Cannot be deleted (5-year retention)
4. **Log all payment actions** - Even failed attempts
5. **Rate limit sensitive endpoints** - 100 req/min per IP
6. **Require 2FA for >KES 1M** - Even for authorized users

---

## Troubleshooting Access Issues

**User says "Access Denied" but should have access:**
1. Check user role in `/admin/users`
2. Check role hierarchy (may need higher role)
3. Check endpoint requirements (some features need FINANCE_LEAD+)
4. Clear browser cache & reload

**User can see button but can't click:**
1. Frontend may show button, but API will reject
2. Check role logs in audit trail
3. Verify user role matches endpoint requirements

**Payment method not showing for employee:**
1. Only their own methods visible
2. Accounts must be verified first
3. Check if account is marked as "deleted" -->
