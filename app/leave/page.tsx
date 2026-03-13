"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Plus, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface LeaveRequest {
  id: string;
  days: number;
  reason?: string;
  status: string;
  startDate: string;
  endDate: string;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
  leaveType: { id: string; name: string };
}

interface LeaveBalance {
  id: string;
  total: number;
  used: number;
  remaining: number;
  leaveType: { name: string };
}

interface LeaveType { id: string; name: string; totalDays: number }

const STATUS_VARIANT: Record<string, "success" | "danger" | "warning"> = { APPROVED: "success", REJECTED: "danger", PENDING: "warning" };

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(statusFilter ? { status: statusFilter } : {});
    const res = await fetch(`/api/leave/requests?${params}`);
    const json = await res.json();
    if (json.success) setRequests(json.data.requests);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => {
    fetch("/api/leave/balances").then(r => r.json()).then(j => { if (j.success) setBalances(j.data); });
    fetch("/api/leave/types").then(r => r.json()).then(j => { if (j.success) setLeaveTypes(j.data); });
  }, []);

  async function reviewRequest(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/leave/requests/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) fetchRequests();
  }

  const uniqueBalances = Object.values(
    balances.reduce((acc: Record<string, LeaveBalance>, b) => {
      const name = b.leaveType.name;
      if (!acc[name]) acc[name] = { ...b, total: 0, used: 0, remaining: 0 };
      acc[name].total += b.total;
      acc[name].used += b.used;
      acc[name].remaining += b.remaining;
      return acc;
    }, {})
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage employee leave requests and balances</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> New Request</Button>
      </div>

      {uniqueBalances.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {uniqueBalances.slice(0, 4).map(b => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{b.leaveType.name}</p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-2xl font-bold text-slate-900">{b.remaining}</span>
                  <span className="text-sm text-slate-400 mb-0.5">/ {b.total} days</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${b.total > 0 ? (b.remaining / b.total) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{b.used} days used</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Leave Requests</CardTitle>
            <div className="flex gap-2">
              {["", "PENDING", "APPROVED", "REJECTED"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {s || "All"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Employee", "Leave Type", "Start Date", "End Date", "Duration", "Reason", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">No leave requests found</td></tr>
                ) : requests.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{row.employee.firstName} {row.employee.lastName}</p>
                      <p className="text-xs text-slate-400">{row.employee.employeeId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.leaveType.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(row.startDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(row.endDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.days} days</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 max-w-32 truncate">{row.reason ?? "-"}</td>
                    <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge></td>
                    <td className="px-5 py-3.5">
                      {row.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button onClick={() => reviewRequest(row.id, "APPROVED")} className="flex items-center gap-1 text-xs text-green-600 font-medium hover:text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => reviewRequest(row.id, "REJECTED")} className="flex items-center gap-1 text-xs text-red-600 font-medium hover:text-red-700">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showAdd && <LeaveRequestModal leaveTypes={leaveTypes} onClose={() => setShowAdd(false)} onSaved={fetchRequests} />}
    </div>
  );
}

function LeaveRequestModal({ leaveTypes, onClose, onSaved }: { leaveTypes: LeaveType[], onClose: () => void, onSaved: () => void }) {
  const [employees, setEmployees] = useState<{id: string; firstName: string; lastName: string}[]>([]);
  const [form, setForm] = useState({ employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/employees?limit=200").then(r => r.json()).then(j => { if (j.success) setEmployees(j.data.employees); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/leave/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    setSaving(false);
    if (json.success) { onSaved(); onClose(); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">New Leave Request</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
            <select required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Leave Type</label>
            <select required value={form.leaveTypeId} onChange={e => setForm(f => ({ ...f, leaveTypeId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select type...</option>
              {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
              <input type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
