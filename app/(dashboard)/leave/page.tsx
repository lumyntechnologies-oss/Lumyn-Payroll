"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, CheckCircle, XCircle, Plus, Loader2, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

type Tab = "requests" | "balances" | "types";

interface LeaveRequest {
  id: string;
  employeeName?: string;
  leaveType: { name: string } | string;
  startDate: string;
  endDate: string;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;
}

interface LeaveBalance {
  id: string;
  leaveType: { name: string };
  total: number;
  used: number;
  remaining: number;
  year: number;
}

interface LeaveType {
  id: string;
  name: string;
  totalDays: number;
  description?: string;
}

interface UserProfile {
  role: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

function getTypeName(lt: { name: string } | string): string {
  if (typeof lt === "string") return lt;
  return lt?.name ?? "—";
}

export default function LeavePage() {
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const canManage = userProfile && ["MANAGER", "HR_ADMIN", "FINANCE", "SUPER_ADMIN"].includes(userProfile.role);
  const canManageTypes = userProfile && ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"].includes(userProfile.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, reqRes, balRes, typesRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/leave/requests"),
        fetch("/api/leave/balance"),
        fetch("/api/leave/types"),
      ]);
      if (profileRes.ok) {
        const d = await profileRes.json();
        if (d.success) setUserProfile({ role: d.data.role });
      }
if (reqRes.ok) {
        const d = await reqRes.json();
        if (d.success) {
          setRequests(Array.isArray(d.data) ? d.data : d.requests ?? []);
        } else {
          setRequests(Array.isArray(d) ? d : d.requests ?? d.data ?? []);
        }
      }
      if (balRes.ok) {
        const d = await balRes.json();
        setBalances(Array.isArray(d) ? d : d.balances ?? d.data ?? []);
      }
      if (typesRes.ok) {
        const d = await typesRes.json();
        setLeaveTypes(Array.isArray(d) ? d : d.types ?? d.data ?? []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function approve(id: string) {
    await fetch(`/api/leave/requests/${id}/approve`, { method: "POST" });
    fetchData();
  }

  async function reject(id: string) {
    await fetch(`/api/leave/requests/${id}/reject`, { method: "POST" });
    fetchData();
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/leave/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (res.ok || d.success) {
        setShowRequest(false);
        setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
        fetchData();
      } else {
        setFormError(d.error ?? "Failed to submit request.");
      }
    } catch {
      setFormError("Network error.");
    }
    setSaving(false);
  }

const pending = (requests ?? []).filter((r) => r.status === "PENDING").length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "requests", label: "Requests", count: pending },
    { key: "balances", label: "My Balances" },
    ...(canManageTypes ? [{ key: "types" as Tab, label: "Leave Types" }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Leave Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage leave requests and balances</p>
        </div>
        <Button onClick={() => setShowRequest(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Request Leave
        </Button>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : tab === "requests" ? (
        <Card>
          <CardHeader><CardTitle className="text-sm">Leave Requests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {canManage && <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Employee</th>}
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Days</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    {canManage && <th className="px-5 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      {canManage && <td className="px-5 py-3.5 font-medium text-slate-800">{req.employeeName ?? "—"}</td>}
                      <td className="px-5 py-3.5 text-slate-600">{getTypeName(req.leaveType)}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">{req.days}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={STATUS_STYLES[req.status] as any}>{req.status}</Badge>
                      </td>
                      {canManage && (
                        <td className="px-5 py-3.5">
                          {req.status === "PENDING" && (
                            <div className="flex gap-2">
                              <button onClick={() => approve(req.id)} className="flex items-center gap-1 text-xs text-green-600 font-medium hover:underline">
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button onClick={() => reject(req.id)} className="flex items-center gap-1 text-xs text-red-500 font-medium hover:underline">
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={canManage ? 6 : 4} className="px-5 py-12 text-center text-slate-400">No leave requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : tab === "balances" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <p className="font-semibold text-slate-800">{b.leaveType?.name}</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{b.remaining}</p>
                <p className="text-xs text-slate-400 mt-1">days remaining</p>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${b.total > 0 ? (b.remaining / b.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{b.used} used of {b.total} total</p>
              </CardContent>
            </Card>
          ))}
          {balances.length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400">No leave balances found</div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Leave Types</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Days</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaveTypes.map((lt) => (
                  <tr key={lt.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{lt.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{lt.totalDays}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{lt.description ?? "—"}</td>
                  </tr>
                ))}
                {leaveTypes.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-400">No leave types defined yet</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {showRequest && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Request Leave</h2>
              <button onClick={() => setShowRequest(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Leave Type</label>
                <select
                  required
                  value={form.leaveTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select leave type...</option>
                  {leaveTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reason (optional)</label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRequest(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
