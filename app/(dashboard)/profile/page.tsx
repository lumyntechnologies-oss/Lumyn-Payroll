"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, Calendar, Loader2, CreditCard, DollarSign, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string | null;
  jobTitle: string | null;
  department: string | null;
  phone: string | null;
  hireDate: string | null;
  employmentType: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "HR Administrator",
  FINANCE: "Finance",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

const ROLE_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "secondary"> = {
  SUPER_ADMIN: "danger",
  HR_ADMIN: "default",
  FINANCE: "success",
  MANAGER: "warning",
  EMPLOYEE: "secondary",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProfile(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
        <User className="w-10 h-10" />
        <p className="text-sm">Could not load profile. Please refresh.</p>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              {initials}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            {profile.jobTitle && (
              <p className="text-sm text-slate-500 mt-0.5">{profile.jobTitle}</p>
            )}
            <div className="mt-3">
              <Badge variant={ROLE_COLORS[profile.role] ?? "secondary"}>
                {ROLE_LABELS[profile.role] ?? profile.role}
              </Badge>
            </div>
            {profile.department && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
                {profile.department}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone ?? "Not set"} />
              <InfoRow icon={Shield} label="System Role" value={ROLE_LABELS[profile.role] ?? profile.role} />
              {profile.employeeId && (
                <InfoRow icon={User} label="Employee ID" value={profile.employeeId} mono />
              )}
              {profile.hireDate && (
                <InfoRow
                  icon={Calendar}
                  label="Hire Date"
                  value={new Date(profile.hireDate).toLocaleDateString("en-KE", { dateStyle: "long" })}
                />
              )}
              {profile.employmentType && (
                <InfoRow icon={Building2} label="Employment Type" value={profile.employmentType.replace("_", " ")} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: User, label: "Profile", desc: "Account verified", color: "bg-blue-100 text-blue-600" },
          { icon: DollarSign, label: "Payroll", desc: profile.employeeId ? "Enrolled in payroll" : "Not yet added to payroll", color: "bg-green-100 text-green-600" },
          { icon: CreditCard, label: "Payments", desc: "Manage in Payment Methods", color: "bg-purple-100 text-purple-600" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className={`text-sm text-slate-800 font-medium truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
