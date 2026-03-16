"use client";

import { useEffect, useState } from "react";

const ROLES = ["SUPER_ADMIN", "HR_ADMIN", "FINANCE", "MANAGER", "EMPLOYEE"] as const;
type Role = (typeof ROLES)[number];

interface SystemUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  HR_ADMIN: "bg-blue-100 text-blue-700",
  FINANCE: "bg-green-100 text-green-700",
  MANAGER: "bg-amber-100 text-amber-700",
  EMPLOYEE: "bg-slate-100 text-slate-600",
};

function formatRole(r: string) {
  return r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ role: string; clerkId: string } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCurrentUser({ role: d.data.role, clerkId: d.data.clerkId }); });

    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
        else setError(d.error ?? "Failed to load users");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: string, role: Role) {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const d = await res.json();
      if (d.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">
          Manage system users and their access roles.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>How it works:</strong> Every person who signs into Lumyn via Clerk is automatically
        registered here. As Super Admin, you can assign each user a role to control what they can
        access. Share your Clerk User ID with users so they can sign up, then assign them a role below.
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-400">Loading users...</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 font-semibold text-slate-700">Name</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700">Email</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700">Current Role</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700">Clerk ID</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700">Joined</th>
                {isSuperAdmin && (
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Change Role</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.clerkId === currentUser?.clerkId;
                const isSuperAdminUser = user.role === "SUPER_ADMIN";
                return (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {user.clerkId}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        {isSuperAdminUser ? (
                          <span className="text-xs text-slate-400 italic">Protected</span>
                        ) : (
                          <select
                            value={user.role}
                            disabled={updating === user.id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                            className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {ROLES.filter((r) => r !== "SUPER_ADMIN").map((r) => (
                              <option key={r} value={r}>
                                {formatRole(r)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                    No users yet. Share the app URL so people can sign up.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
