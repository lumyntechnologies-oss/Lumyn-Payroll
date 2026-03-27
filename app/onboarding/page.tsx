"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Zap, Users, Briefcase, Shield, TrendingUp, Loader2, CheckCircle } from "lucide-react";

const ROLES = [
  {
    value: "EMPLOYEE",
    label: "Employee",
    description: "I'm a staff member. I'll manage my leave, attendance, and payslips.",
    icon: Users,
    color: "blue",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "I lead a team. I'll approve leave requests and view team data.",
    icon: Briefcase,
    color: "amber",
  },
  {
    value: "HR_ADMIN",
    label: "HR Administrator",
    description: "I manage HR operations — employees, departments, and leave policies.",
    icon: Shield,
    color: "green",
  },
  {
    value: "FINANCE",
    label: "Finance / Payroll",
    description: "I handle payroll processing, disbursements, and financial compliance.",
    icon: TrendingUp,
    color: "purple",
  },
] as const;

const ICON_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

const BORDER_COLORS: Record<string, string> = {
  blue: "border-blue-500 bg-blue-50",
  amber: "border-amber-500 bg-amber-50",
  green: "border-green-500 bg-green-50",
  purple: "border-purple-500 bg-purple-50",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    fetch("/api/auth/onboarding")
      .then((r) => r.json())
      .then((d) => {
        if (d.exists) {
          router.replace("/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [isLoaded, router]);

  async function handleContinue() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace("/dashboard");
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSaving(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">Lumyn Payroll</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {user?.firstName ?? "there"}!
            </h1>
            <p className="text-slate-500 mt-2">
              Tell us your role so we can show you the right tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelected(role.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${BORDER_COLORS[role.color]} ring-2 ring-offset-1 ring-${role.color}-400`
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${ICON_COLORS[role.color]} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{role.label}</p>
                        {isSelected && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{role.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            Your administrator can adjust your role at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
