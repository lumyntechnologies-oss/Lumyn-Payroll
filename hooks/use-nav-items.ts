import { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Shield,
  BarChart2,
  FileText,
  Bell,
  Settings,
  UserCog,
  LucideIcon,
  CreditCard,
  CheckCircle,
  LogOut,
} from "lucide-react";

export type UserRole = "EMPLOYEE" | "MANAGER" | "HR_ADMIN" | "FINANCE_LEAD" | "CFO" | "SUPER_ADMIN";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

/**
 * Navigation items visible based on user role
 */
export function useNavItems(userRole?: UserRole): NavItem[] {
  return useMemo(() => {
    const allItems: NavItem[] = [
      // Common to all
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [] },
      { href: "/profile", label: "Profile", icon: UserCog, roles: [] },
      { href: "/settings", label: "Settings", icon: Settings, roles: [] },

      // Employee items
{ href: "/payment-methods", label: "Payment Methods", icon: CreditCard, roles: [] },
      { href: "/wallet", label: "Wallet", icon: DollarSign, roles: [] },

      // Manager & above
      { href: "/employees", label: "Employees", icon: Users, roles: ["MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/departments", label: "Departments", icon: Building2, roles: ["MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },

      // Payroll & Finance (not for basic employees)
      { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/disbursement", label: "Disbursement", icon: CheckCircle, roles: ["FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/attendance", label: "Attendance", icon: Clock, roles: ["MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },

      // Leave & HR
      { href: "/leave", label: "Leave Management", icon: Calendar, roles: ["MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/leave-types", label: "Leave Types", icon: Calendar, roles: ["HR_ADMIN", "CFO", "SUPER_ADMIN"] },

      // Admin items
      { href: "/advances", label: "Salary Advances", icon: TrendingUp, roles: ["HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/compliance", label: "Compliance", icon: Shield, roles: ["FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/reports", label: "Reports & Analytics", icon: BarChart2, roles: ["MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/organization", label: "Organization", icon: Building2, roles: ["HR_ADMIN", "CFO", "SUPER_ADMIN"] },
      { href: "/documents", label: "Documents", icon: FileText, roles: ["HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"] },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: [] },

      // Super admin
      { href: "/admin/users", label: "User Management", icon: UserCog, roles: ["SUPER_ADMIN", "CFO"] },
    ];

    if (!userRole) return [];

    // Filter items based on role
    // Items with empty roles array are visible to everyone
    // Items with specific roles are only visible if user role matches
    return allItems.filter((item) => item.roles.length === 0 || item.roles.includes(userRole));
  }, [userRole]);
}

/**
 * Role hierarchy (higher role has more permissions)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  HR_ADMIN: 2,
  FINANCE_LEAD: 3,
  CFO: 4,
  SUPER_ADMIN: 5,
};

/**
 * Check if user has required permission level
 */
export function hasPermissionLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    EMPLOYEE: "Employee",
    MANAGER: "Manager",
    HR_ADMIN: "HR Administrator",
    FINANCE_LEAD: "Finance Lead",
    CFO: "Chief Financial Officer",
    SUPER_ADMIN: "Super Administrator",
  };
  return labels[role] || role;
}
