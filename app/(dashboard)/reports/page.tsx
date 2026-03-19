"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface PayrollSummaryRow { month: number; year: number; totalGross: number; totalNet: number; totalTax: number }
interface DeptCostRow { name: string; gross: number; net: number }
interface LeaveRow { type: string; used: number; total: number }
interface HeadcountRow { name: string; count: number; male: number; female: number }

export default function ReportsPage() {
  const year = new Date().getFullYear();
  const [payroll, setPayroll] = useState<PayrollSummaryRow[]>([]);
  const [deptCost, setDeptCost] = useState<DeptCostRow[]>([]);
  const [leave, setLeave] = useState<LeaveRow[]>([]);
  const [headcount, setHeadcount] = useState<HeadcountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/reports?type=payroll-summary&year=${year}`).then(r => r.json()),
      fetch(`/api/reports?type=department-costs&year=${year}`).then(r => r.json()),
      fetch(`/api/reports?type=leave-utilization`).then(r => r.json()),
      fetch(`/api/reports?type=headcount`).then(r => r.json()),
    ]).then(([p, d, l, h]) => {
      if (p.success) setPayroll(p.data);
      if (d.success) setDeptCost(d.data);
      if (l.success) setLeave(l.data);
      if (h.success) setHeadcount(h.data);
      setLoading(false);
    });
  }, [year]);

  const payrollChart = payroll.map(r => ({
    month: MONTH_NAMES[(r.month - 1) % 12],
    Gross: +(r.totalGross / 1000000).toFixed(2),
    Net: +(r.totalNet / 1000000).toFixed(2),
    Tax: +(r.totalTax / 1000000).toFixed(2),
  }));

  const deptChart = deptCost.map(d => ({
    dept: d.name,
    Gross: +(d.gross / 1000000).toFixed(2),
    Net: +(d.net / 1000000).toFixed(2),
  }));

  const leaveChart = leave.map(l => ({
    type: l.type,
    Used: l.used,
    Available: Math.max(0, l.total - l.used),
  }));

  const headcountChart = headcount.map(h => ({
    dept: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
    Count: h.count,
  }));

  const isEmpty = payroll.length === 0 && deptCost.length === 0;

  const exportReports = async (format: "csv" | "pdf") => {
    setExporting(true);
    try {
      const csv = generateCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reports-${year}.${format}`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const generateCSV = () => {
    let csv = "PAYROLL REPORT\n";
    csv += `Year: ${year}\n\n`;
    csv += "Month,Gross Salary,Net Salary,Tax\n";
    payroll.forEach((r) => {
      csv += `${MONTH_NAMES[r.month - 1]},${r.totalGross},${r.totalNet},${r.totalTax}\n`;
    });
    csv += "\n\nDEPARTMENT COSTS\n";
    csv += "Department,Gross,Net\n";
    deptCost.forEach((d) => {
      csv += `${d.name},${d.gross},${d.net}\n`;
    });
    csv += "\n\nLEAVE UTILIZATION\n";
    csv += "Leave Type,Used,Total\n";
    leave.forEach((l) => {
      csv += `${l.type},${l.used},${l.total}\n`;
    });
    return csv;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Payroll, HR, and compliance reports for {year}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportReports("csv")} disabled={exporting}>
            <Download className="w-4 h-4" /> {exporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReports("pdf")} disabled={exporting}>
            <FileText className="w-4 h-4" /> {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (
        <>
          {isEmpty && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700">
              No data yet — add employees, run payroll, and record attendance to populate reports.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader><CardTitle className="text-sm">Payroll Cost Trend (KES M)</CardTitle></CardHeader>
              <CardContent>
                {payrollChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={payrollChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip formatter={(v: number) => `KES ${v}M`} />
                      <Legend />
                      <Line type="monotone" dataKey="Gross" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Net" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Tax" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No payroll runs yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Department Payroll Cost (KES M)</CardTitle></CardHeader>
              <CardContent>
                {deptChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={deptChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={80} />
                      <Tooltip formatter={(v: number) => `KES ${v}M`} />
                      <Legend />
                      <Bar dataKey="Gross" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Net" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No department cost data yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Leave Utilization by Type</CardTitle></CardHeader>
              <CardContent>
                {leaveChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={leaveChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Used" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Available" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No leave data yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Headcount by Department</CardTitle></CardHeader>
              <CardContent>
                {headcountChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={headcountChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip />
                      <Bar dataKey="Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No employee data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Statutory Reports — Quick Generate</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { title: "Payroll Register", desc: "Monthly payslip register for all employees", icon: "📄" },
                  { title: "P9A Tax Summary", desc: "Annual employee tax deduction (KRA)", icon: "🏛️" },
                  { title: "NSSF Returns", desc: "Monthly NSSF contribution schedule", icon: "🛡️" },
                  { title: "SHIF Report", desc: "NHIF/SHIF deduction summary", icon: "🏥" },
                  { title: "Housing Levy", desc: "Monthly housing levy schedule (AHF)", icon: "🏠" },
                  { title: "Leave Summary", desc: "Leave balances and utilization report", icon: "📅" },
                  { title: "Headcount Report", desc: "Department-wise employee headcount", icon: "👥" },
                  { title: "Cost Analysis", desc: "Payroll cost trend by department", icon: "📊" },
                ].map(r => (
                  <button key={r.title}
                    className="text-left p-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group">
                    <span className="text-2xl">{r.icon}</span>
                    <p className="text-sm font-semibold text-slate-800 mt-2 group-hover:text-blue-700">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
