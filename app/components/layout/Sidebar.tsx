"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/payroll", label: "Payroll", icon: DollarSign },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/leave", label: "Leave Management", icon: Calendar },
  { href: "/advances", label: "Salary Advances", icon: TrendingUp },
  { href: "/compliance", label: "Compliance", icon: Shield },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart2 },
  { href: "/organization", label: "Organization", icon: Building2 },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors mx-2 rounded-lg",
                active
                  ? "bg-blue-600 text-white"
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

      <div className="p-4 border-t border-slate-700/50">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">JK</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Jane Kimani</p>
              <p className="text-slate-400 text-xs truncate">HR Admin</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-bold">JK</span>
          </div>
        )}
      </div>
    </aside>
  );
}
