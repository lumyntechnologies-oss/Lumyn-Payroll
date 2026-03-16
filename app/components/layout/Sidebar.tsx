"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Shield,
  BarChart2,
  Building2,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [] },
  { href: "/employees", label: "Employees", icon: Users, roles: [] },
  { href: "/payroll", label: "Payroll", icon: DollarSign, roles: [] },
  { href: "/attendance", label: "Attendance", icon: Clock, roles: [] },
  { href: "/leave", label: "Leave Management", icon: Calendar, roles: [] },
  { href: "/advances", label: "Salary Advances", icon: TrendingUp, roles: [] },
  { href: "/compliance", label: "Compliance", icon: Shield, roles: [] },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart2, roles: [] },
  { href: "/organization", label: "Organization", icon: Building2, roles: [] },
  { href: "/documents", label: "Documents", icon: FileText, roles: [] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: [] },
  { href: "/settings", label: "Settings", icon: Settings, roles: [] },
  { href: "/admin/users", label: "User Management", icon: UserCog, roles: ["SUPER_ADMIN", "HR_ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.success) setUserRole(d.data.role); })
      .catch(() => {});
  }, []);

  const navItems = allNavItems.filter(
    (item) => item.roles.length === 0 || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">Lumyn</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const isAdmin = item.roles.length > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors mx-2 rounded-lg",
                active
                  ? "bg-blue-600 text-white"
                  : isAdmin
                  ? "text-amber-400 hover:bg-slate-800 hover:text-amber-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
