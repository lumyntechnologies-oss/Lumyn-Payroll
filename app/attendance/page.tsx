"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, UserX, Clock, TrendingUp, Loader2, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: string;
  overtime: number;
  employee: { id: string; firstName: string; lastName: string; employeeId: string; department: { name: string } };
}

interface Summary { present: number; absent: number; late: number }

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  PRESENT: "success", ABSENT: "danger", LATE: "warning", HALF_DAY: "secondary", ON_LEAVE: "secondary"
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({ present: 0, absent: 0, late: 0 });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ date });
    const res = await fetch(`/api/attendance?${params}`);
    const json = await res.json();
    if (json.success) {
      setRecords(json.data.records);
      setSummary(json.data.summary);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const metrics = [
    { label: "Present Today", value: summary.present, icon: Users, color: "green" },
    { label: "Absent", value: summary.absent, icon: UserX, color: "red" },
    { label: "Late Arrivals", value: summary.late, icon: Clock, color: "amber" },
    { label: "Overtime Hours", value: records.reduce((s, r) => s + r.overtime, 0).toFixed(1) + "h", icon: TrendingUp, color: "blue" },
  ];

  const colorMap: Record<string, string> = { green: "bg-green-100 text-green-600", red: "bg-red-100 text-red-600", amber: "bg-amber-100 text-amber-600", blue: "bg-blue-100 text-blue-600" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{new Date(date).toLocaleDateString("en-KE", { dateStyle: "full" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Record Attendance</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colorMap[m.color]} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{m.value}</p>
                  <p className="text-xs text-slate-500">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Attendance Log</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Employee", "Dept", "Date", "Clock In", "Clock Out", "Hours", "Overtime", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">No attendance records for this date</td></tr>
                ) : records.map(row => {
                  const clockIn = row.clockIn ? new Date(row.clockIn) : null;
                  const clockOut = row.clockOut ? new Date(row.clockOut) : null;
                  const hours = clockIn && clockOut ? ((clockOut.getTime() - clockIn.getTime()) / 3600000).toFixed(1) + "h" : "-";
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{row.employee.firstName} {row.employee.lastName}</p>
                          <p className="text-xs text-slate-400">{row.employee.employeeId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{row.employee.department.name}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{clockIn ? clockIn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{clockOut ? clockOut.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{hours}</td>
                      <td className="px-5 py-3.5 text-sm text-blue-600 font-medium">{row.overtime > 0 ? `${row.overtime}h` : "-"}</td>
                      <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[row.status]}>{row.status.replace("_", " ")}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showAdd && <AttendanceModal date={date} onClose={() => setShowAdd(false)} onSaved={fetchData} />}
    </div>
  );
}

function AttendanceModal({ date, onClose, onSaved }: { date: string, onClose: () => void, onSaved: () => void }) {
  const [employees, setEmployees] = useState<{id: string; firstName: string; lastName: string}[]>([]);
  const [form, setForm] = useState({ employeeId: "", date, clockIn: "", clockOut: "", status: "PRESENT", overtime: "0" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/employees?limit=200").then(r => r.json()).then(j => { if (j.success) setEmployees(j.data.employees); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const body = {
      employeeId: form.employeeId,
      date: form.date,
      clockIn: form.clockIn ? `${form.date}T${form.clockIn}` : undefined,
      clockOut: form.clockOut ? `${form.date}T${form.clockOut}` : undefined,
      status: form.status,
      overtime: Number(form.overtime),
    };
    const res = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    setSaving(false);
    if (json.success) { onSaved(); onClose(); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Record Attendance</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
            <select required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Clock In</label>
              <input type="time" value={form.clockIn} onChange={e => setForm(f => ({ ...f, clockIn: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Clock Out</label>
              <input type="time" value={form.clockOut} onChange={e => setForm(f => ({ ...f, clockOut: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["PRESENT","ABSENT","LATE","HALF_DAY","ON_LEAVE"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Overtime (hrs)</label>
              <input type="number" min="0" step="0.5" value={form.overtime} onChange={e => setForm(f => ({ ...f, overtime: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
