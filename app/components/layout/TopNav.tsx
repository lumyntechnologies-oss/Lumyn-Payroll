"use client";

import { Bell, Search, ChevronDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";

const quickActions = [
  { label: "Add Employee", href: "/employees" },
  { label: "Run Payroll", href: "/payroll" },
  { label: "Approve Leave", href: "/leave" },
  { label: "Generate Report", href: "/reports" },
];

export function TopNav() {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { user } = useUser();
  const [role, setRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRole(d.data.role); })
      .catch(() => {});
  }, []);

  function formatRole(r: string) {
    return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, payroll, reports..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <Plus className="w-3.5 h-3.5" />
            Quick Action
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          {showQuickActions && (
            <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-48 z-50">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    router.push(action.href);
                    setShowQuickActions(false);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-2">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800 leading-none">
                {user.fullName ?? user.emailAddresses[0]?.emailAddress}
              </p>
              {role && <p className="text-xs text-slate-500 mt-0.5">{formatRole(role)}</p>}
            </div>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
