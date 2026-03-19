"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavItems, UserRole } from "@/hooks/use-nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | undefined>();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { 
        if (d.success) {
          setUserRole(d.data.role as UserRole);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = useNavItems(userRole);

  const sidebarClasses = cn(
    "flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 shrink-0 fixed lg:static h-screen lg:h-auto left-0 top-0 z-40",
    mobileOpen ? "w-60" : "w-0 lg:w-60",
    collapsed && "lg:w-16"
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">Lumyn</span>
            </div>
          )}
          {collapsed && !mobileOpen && (
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-white" />
            </div>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors ml-auto"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
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
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile menu button - shown in TopNav */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 z-30 p-3 rounded-lg bg-blue-600 text-white shadow-lg"
          title="Open menu"
        >
          <Zap className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
