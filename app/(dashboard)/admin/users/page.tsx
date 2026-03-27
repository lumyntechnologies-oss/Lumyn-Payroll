"use client";

import { useEffect, useState } from "react";
import { UserCog, Users, Mail, Clock, Shield, CheckCircle, Loader2 } from "lucide-react";

const ROLES = ["HR_ADMIN", "FINANCE", "MANAGER", "EMPLOYEE"] as const;
type Role = (typeof ROLES)[number] | "SUPER_ADMIN";

interface SystemUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  HR_ADMIN: "bg-blue-100 text-blue-700",
  FINANCE: "bg-green-100 text-green-700",
  MANAGER: "bg-amber-100 text-amber-700",
  EMPLOYEE: "bg-slate-100 text-slate-600",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "HR Admin",
  FINANCE: "Finance",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: "Full system access",
  HR_ADMIN: "Manages employees, leave, departments",
  FINANCE: "Handles payroll, disbursements, compliance",
  MANAGER: "Approves team leave, views team data",
  EMPLOYEE: "Self-service: payslips, leave, attendance",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ role: string; clerkId: string } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCurrentUser({ role: d.data.role, clerkId: d.data.clerkId });
      });

    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
        else setError(d.error ?? "Failed to load users");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: string, role: string) {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const d = await res.json();
      if (d.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: role as Role } : u)));
      } else {
        alert(d.error ?? "Failed to update role");
      }
    } catch {
      alert("Network error");
    } finally {
      setUpdating(null);
    }
  }

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const filtered = users.filter(
    (u) =>
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-7 h-7 text-blue-600" />
          User Management
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Everyone who signs in automatically appears here. Assign them a role to control their access.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["SUPER_ADMIN", "HR_ADMIN", "FINANCE", "MANAGER", "EMPLOYEE"] as Role[]).map((role) => (
          <div key={role} className={`rounded-xl p-3 text-center ${ROLE_STYLES[role]}`}>
            <p className="text-xl font-bold">{roleCounts[role] ?? 0}</p>
            <p className="text-xs font-medium mt-0.5">{ROLE_LABELS[role]}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <strong>How it works:</strong> When someone signs up, they choose their own role. You can override any role here.
            Roles determine what pages and actions they can access.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 ml-auto">{users.length} total users</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600 bg-red-50">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role Description</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                  {isSuperAdmin && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Change Role</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => {
                  const isSelf = user.clerkId === currentUser?.clerkId;
                  const isProtected = user.role === "SUPER_ADMIN";
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{user.name}</p>
                              {isSelf && (
                                <span className="flex items-center gap-0.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                  <CheckCircle className="w-3 h-3" /> You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[user.role]}`}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-xs">
                        {ROLE_DESCRIPTIONS[user.role] ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-4">
                          {isProtected ? (
                            <span className="text-xs text-slate-400 italic">Protected</span>
                          ) : updating === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-5 py-16 text-center text-slate-400">
                      {users.length === 0
                        ? "No users yet. Share the sign-up link so people can join."
                        : "No users match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Role Permissions Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROLES.map((role) => (
            <div key={role} className="bg-white rounded-lg p-3 border border-slate-200">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${ROLE_STYLES[role]}`}>
                {ROLE_LABELS[role]}
              </span>
              <p className="text-xs text-slate-500">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
