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
  Wallet,
} from "lucide-react";

export type UserRole = "EMPLOYEE" | "MANAGER" | "HR_ADMIN" | "FINANCE" | "SUPER_ADMIN";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export function useNavItems(userRole?: UserRole): NavItem[] {
  return useMemo(() => {
    const allItems: NavItem[] = [
      // ─── Everyone ───
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [] },
      { href: "/leave", label: "Leave", icon: Calendar, roles: [] },
      { href: "/attendance", label: "Attendance", icon: Clock, roles: [] },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: [] },
      { href: "/profile", label: "Profile", icon: UserCog, roles: [] },
      { href: "/settings", label: "Settings", icon: Settings, roles: [] },

      // ─── Employee-specific ───
      { href: "/payment-methods", label: "Payment Methods", icon: CreditCard, roles: ["EMPLOYEE"] },
      { href: "/wallet", label: "Wallet", icon: Wallet, roles: ["EMPLOYEE"] },

      // ─── Manager & above ───
      { href: "/employees", label: "Employees", icon: Users, roles: ["MANAGER", "HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },
      { href: "/reports", label: "Reports", icon: BarChart2, roles: ["MANAGER", "HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },

      // ─── HR Admin & above ───
      { href: "/departments", label: "Departments", icon: Building2, roles: ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },
      { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },
      { href: "/advances", label: "Salary Advances", icon: TrendingUp, roles: ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },
      { href: "/documents", label: "Documents", icon: FileText, roles: ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },
      { href: "/organization", label: "Organization", icon: Building2, roles: ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"] },

      // ─── Finance & above ───
      { href: "/compliance", label: "Compliance", icon: Shield, roles: ["FINANCE", "SUPER_ADMIN"] },

      // ─── Super Admin only ───
      { href: "/admin/users", label: "User Management", icon: UserCog, roles: ["SUPER_ADMIN"] },
    ];

    if (!userRole) return [];

    return allItems.filter(
      (item) => item.roles.length === 0 || item.roles.includes(userRole)
    );
  }, [userRole]);
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  HR_ADMIN: 2,
  FINANCE: 3,
  SUPER_ADMIN: 4,
};

export function hasPermissionLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    EMPLOYEE: "Employee",
    MANAGER: "Manager",
    HR_ADMIN: "HR Administrator",
    FINANCE: "Finance",
    SUPER_ADMIN: "Super Administrator",
  };
  return labels[role] || role;
}
