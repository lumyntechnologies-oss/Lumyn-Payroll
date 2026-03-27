export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HR_ADMIN: "HR_ADMIN",
  FINANCE: "FINANCE",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type Role = typeof Roles[keyof typeof Roles];

export const PERMISSIONS = {
  [Roles.EMPLOYEE]: {
    dashboard: ["view:own"],
    employees: ["view:own"],
    payroll: ["view:own"],
    payments: ["view:own", "add:payment-method", "view:own-transactions"],
    leave: ["view:own", "request"],
    attendance: ["view:own"],
    documents: ["view:public"],
    settings: ["view:own"],
  },

  [Roles.MANAGER]: {
    dashboard: ["view:all", "view:own-dept"],
    employees: ["view:all", "view:own-dept"],
    payroll: ["view:all", "view:own-dept"],
    payments: ["view:all", "view:own-dept"],
    leave: ["view:all", "approve:own-dept"],
    attendance: ["view:all", "view:own-dept"],
    documents: ["view:all"],
    settings: ["view:own"],
    reports: ["view:own-dept"],
  },

  [Roles.FINANCE]: {
    dashboard: ["view:all"],
    employees: ["view:all"],
    payroll: ["view:all", "create", "edit:draft", "approve"],
    payments: [
      "view:all",
      "disburse",
      "reconcile",
      "retry",
      "view:transactions",
      "view:batches",
      "configure:providers",
    ],
    leave: ["view:all", "approve"],
    attendance: ["view:all"],
    documents: ["view:all"],
    reports: ["view:all", "export"],
    settings: ["view:own", "configure:payment-rules"],
  },

  [Roles.HR_ADMIN]: {
    dashboard: ["view:all"],
    employees: ["view:all", "create", "edit", "deactivate"],
    payroll: ["view:all"],
    payments: ["view:all", "view:transactions"],
    leave: ["view:all", "create:types", "approve"],
    attendance: ["view:all", "edit"],
    departments: ["view:all", "create", "edit", "delete"],
    documents: ["view:all", "upload", "delete"],
    reports: ["view:all", "export"],
    settings: ["view:own", "configure:leave-policies", "configure:attendance-rules"],
  },

  [Roles.SUPER_ADMIN]: {
    "*": ["*"],
  },
} as const;

export type Permission = string;

export function hasPermission(
  role: Role,
  feature: string,
  action: string
): boolean {
  const rolePerms = PERMISSIONS[role as keyof typeof PERMISSIONS];
  if (!rolePerms) return false;

  if (role === Roles.SUPER_ADMIN) return true;

  const featurePerms = rolePerms[feature as keyof typeof rolePerms];
  if (!featurePerms) return false;

  return (featurePerms as readonly string[]).includes(action);
}

export function canView(role: Role, resource: string): boolean {
  return (
    hasPermission(role, resource, "view:all") ||
    hasPermission(role, resource, "view:own") ||
    hasPermission(role, resource, "view:own-dept")
  );
}

export function canEdit(role: Role, resource: string): boolean {
  return (
    hasPermission(role, resource, "edit") ||
    hasPermission(role, resource, "edit:draft")
  );
}

export function canCreate(role: Role, resource: string): boolean {
  return hasPermission(role, resource, "create");
}

export function canApprove(role: Role, resource: string): boolean {
  return hasPermission(role, resource, "approve");
}

export function canDisburse(role: Role): boolean {
  return hasPermission(role, "payments", "disburse");
}

export function canReconcile(role: Role): boolean {
  return hasPermission(role, "payments", "reconcile");
}

export function canManagePaymentMethods(role: Role): boolean {
  return hasPermission(role, "payments", "add:payment-method");
}

export function getVisibilityFilter(
  role: Role,
  userId: string,
  deptId?: string
) {
  switch (role) {
    case Roles.EMPLOYEE:
      return { userId };
    case Roles.MANAGER:
      return deptId ? { departmentId: deptId } : { userId };
    case Roles.HR_ADMIN:
    case Roles.FINANCE:
    case Roles.SUPER_ADMIN:
      return {};
    default:
      return { userId };
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  [Roles.EMPLOYEE]: "Employee",
  [Roles.MANAGER]: "Manager",
  [Roles.FINANCE]: "Finance",
  [Roles.HR_ADMIN]: "HR Admin",
  [Roles.SUPER_ADMIN]: "Super Admin",
} as const;

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Roles.EMPLOYEE]: "Can view own data, submit requests, manage payment methods",
  [Roles.MANAGER]: "Can view team data, approve team requests, view department reports",
  [Roles.FINANCE]: "Can manage payroll, disburse salaries, reconcile payments, view all reports",
  [Roles.HR_ADMIN]: "Can manage employees, departments, leave policies, compliance settings",
  [Roles.SUPER_ADMIN]: "Full system access",
} as const;
