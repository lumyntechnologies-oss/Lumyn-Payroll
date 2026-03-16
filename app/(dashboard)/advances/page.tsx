"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, DollarSign, Clock, AlertTriangle, Loader2, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface Advance {
  id: string;
  amount: number;
  reason: string;
  status: string;
  schedule?: string;
  createdAt: string;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
}

interface Summary { totalIssued: number; pendingCount: number }

const STATUS_VARIANT: Record<string, "success" | "danger" | "warning"> = { APPROVED: "success", REJECTED: "danger", PENDING: "warning" };

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIssued: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(statusFilter ? { status: statusFilter } : {});
    const res = await fetch(`/api/advances?${params}`);
    const json = await res.json();
    if (json.success) {
      setAdvances(json.data.advances);
      setSummary(json.data.summary);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/advances/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) fetchData();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary Advances</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage employee salary advance requests</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> New Request</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Advances Issued", value: `KES ${(summary.totalIssued / 1000).toFixed(0)}K`, icon: DollarSign, color: "blue" },
          { label: "Pending Approvals", value: String(summary.pendingCount), icon: Clock, color: "amber" },
          { label: "Outstanding Repayments", value: `KES ${(summary.totalIssued / 1000).toFixed(0)}K`, icon: AlertTriangle, color: "red" },
        ].map(card => {
          const Icon = card.icon;
          const colors: Record<string, string> = { blue: "bg-blue-100 text-blue-600", amber: "bg-amber-100 text-amber-600", red: "bg-red-100 text-red-600" };
          return (
            <Card key={card.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colors[card.color]} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Advance Requests</CardTitle>
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
                  {["Employee", "Amount", "Reason", "Request Date", "Status", "Repayment", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {advances.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">No advance requests found</td></tr>
                ) : advances.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{row.employee.firstName} {row.employee.lastName}</p>
                      <p className="text-xs text-slate-400">{row.employee.employeeId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">KES {row.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.reason}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge></td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.schedule ?? "-"}</td>
                    <td className="px-5 py-3.5">
                      {row.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button onClick={() => review(row.id, "APPROVED")} className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => review(row.id, "REJECTED")} className="flex items-center gap-1 text-xs text-red-600 font-medium">
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

      {showAdd && <AdvanceModal onClose={() => setShowAdd(false)} onSaved={fetchData} />}
    </div>
  );
}

function AdvanceModal({ onClose, onSaved }: { onClose: () => void, onSaved: () => void }) {
  const [employees, setEmployees] = useState<{id: string; firstName: string; lastName: string}[]>([]);
  const [form, setForm] = useState({ employeeId: "", amount: "", reason: "", schedule: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/employees?limit=200").then(r => r.json()).then(j => { if (j.success) setEmployees(j.data.employees); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/advances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    setSaving(false);
    if (json.success) { onSaved(); onClose(); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">New Advance Request</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
            <select required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Amount (KES)</label>
            <input type="number" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
            <textarea required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div><label className="block text-xs font-medium text-slate-600 mb-1">Repayment Schedule</label>
            <input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} placeholder="e.g. 3 months"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
