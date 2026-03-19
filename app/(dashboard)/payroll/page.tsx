"use client";

import { useEffect, useState } from "react";
import { DollarSign, Download, Eye, Send, CheckCircle, Play, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface PayrollEntry {
  id: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  grossSalary: number;
  netSalary: number;
  employee: { firstName: string; lastName: string; department: { name: string } };
}

interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: string;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  _count: { entries: number };
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_VARIANT: Record<string, "warning" | "success" | "default"> = { DRAFT: "warning", APPROVED: "success", DISBURSED: "default" };

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/payroll/runs").then(r => r.json()).then(j => {
      if (j.success) {
        setRuns(j.data.runs);
        if (j.data.runs.length > 0) selectRun(j.data.runs[0]);
      }
      setLoading(false);
    });
  }, []);

  async function selectRun(run: PayrollRun) {
    setSelectedRun(run);
    setEntriesLoading(true);
    const res = await fetch(`/api/payroll/entries?payrollRunId=${run.id}`);
    const json = await res.json();
    if (json.success) setEntries(json.data);
    setEntriesLoading(false);
  }

  async function createPayrollRun() {
    setRunning(true);
    const now = new Date();
    const res = await fetch("/api/payroll/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: now.getMonth() + 1, year: now.getFullYear() }),
    });
    const json = await res.json();
    if (json.success) {
      const newRuns = [json.data, ...runs];
      setRuns(newRuns);
      selectRun(json.data);
    }
    setRunning(false);
  }

  async function approveRun() {
    if (!selectedRun) return;
    const res = await fetch(`/api/payroll/runs/${selectedRun.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    const json = await res.json();
    if (json.success) {
      setRuns(runs.map(r => r.id === selectedRun.id ? { ...r, status: "APPROVED" } : r));
      setSelectedRun(r => r ? { ...r, status: "APPROVED" } : r);
    }
  }

  async function exportPayroll(format: "csv" | "json") {
    if (!selectedRun) return;
    setExporting(true);
    try {
      const url = `/api/payroll/export?payrollRunId=${selectedRun.id}&format=${format}`;
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `payroll_${selectedRun.month}_${selectedRun.year}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-80"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {selectedRun ? `${MONTH_NAMES[selectedRun.month - 1]} ${selectedRun.year} Payroll` : "No payroll run selected"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedRun && <Badge variant={STATUS_VARIANT[selectedRun.status]}>{selectedRun.status}</Badge>}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedEntry(entries.length > 0 ? entries[0] : null)}
          >
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportPayroll("csv")}
            disabled={exporting || !selectedRun}
          >
            <Download className="w-4 h-4" /> {exporting ? "Exporting..." : "CSV"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportPayroll("json")}
            disabled={exporting || !selectedRun}
          >
            <Download className="w-4 h-4" /> JSON
          </Button>
          {selectedRun?.status === "DRAFT" && (
            <Button variant="outline" size="sm" onClick={approveRun}><CheckCircle className="w-4 h-4" /> Approve</Button>
          )}
          <Button onClick={createPayrollRun} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Payroll
          </Button>
        </div>
      </div>

      {runs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {runs.map(run => (
            <button key={run.id} onClick={() => selectRun(run)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedRun?.id === run.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}>
              {MONTH_NAMES[run.month - 1]} {run.year}
            </button>
          ))}
        </div>
      )}

      {runs.length === 0 && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <AlertTriangle className="w-10 h-10" />
            <p className="text-sm">No payroll runs yet. Click &quot;Run Payroll&quot; to generate the first payroll.</p>
          </CardContent>
        </Card>
      )}

      {selectedRun && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Payroll Cost", value: `KES ${(selectedRun.totalGross / 1000000).toFixed(2)}M`, color: "blue" },
              { label: "Tax Deductions", value: `KES ${(selectedRun.totalTax / 1000).toFixed(0)}K`, color: "red" },
              { label: "Net Salary Payout", value: `KES ${(selectedRun.totalNet / 1000000).toFixed(2)}M`, color: "green" },
            ].map(card => (
              <Card key={card.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                      <DollarSign className={`w-5 h-5 text-${card.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{card.label}</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedRun._count.entries} employees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Payroll Register</CardTitle>
                <Button variant="outline" size="sm"><Send className="w-4 h-4" /> Send Payslips</Button>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              {entriesLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Employee", "Dept", "Basic Salary", "Allowances", "Deductions", "PAYE", "NSSF", "SHIF", "Housing Levy", "Net Pay"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {entries.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{row.employee.firstName} {row.employee.lastName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{row.employee.department.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{row.basicSalary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{row.allowances.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{row.deductions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{row.paye.toFixed(0)}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{row.nssf.toFixed(0)}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{row.shif.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{row.housingLevy.toFixed(0)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{row.netSalary.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}

      {selectedEntry && selectedRun && (
        <PayslipPreview
          entry={selectedEntry}
          payrollRun={selectedRun}
          onClose={() => setSelectedEntry(null)}
          entries={entries}
          onNavigate={(entry) => setSelectedEntry(entry)}
        />
      )}
    </div>
  );
}

function PayslipPreview({
  entry,
  payrollRun,
  onClose,
  entries,
  onNavigate,
}: {
  entry: PayrollEntry;
  payrollRun: PayrollRun;
  onClose: () => void;
  entries: PayrollEntry[];
  onNavigate: (entry: PayrollEntry) => void;
}) {
  const currentIndex = entries.findIndex((e) => e.id === entry.id);
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Payslip Preview</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 bg-white max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Payslip</h3>
            <p className="text-sm text-slate-600">{MONTH_NAMES[payrollRun.month - 1]} {payrollRun.year}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">EMPLOYEE</p>
              <p className="text-sm font-semibold text-slate-900">{entry.employee.firstName} {entry.employee.lastName}</p>
              <p className="text-xs text-slate-600">{entry.employee.department.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold mb-1">PERIOD</p>
              <p className="text-sm font-semibold text-slate-900">{MONTH_NAMES[payrollRun.month - 1]} {payrollRun.year}</p>
            </div>
          </div>

          <table className="w-full mb-8 text-sm">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 text-slate-600">Basic Salary</td>
                <td className="py-2 text-right font-semibold">KES {entry.basicSalary.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600">Allowances</td>
                <td className="py-2 text-right font-semibold">KES {entry.allowances.toLocaleString()}</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 font-semibold text-slate-900">Gross Salary</td>
                <td className="py-2 text-right font-bold text-slate-900">KES {entry.grossSalary.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-600">PAYE Tax</td>
                <td className="py-3 text-right">-KES {entry.paye.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-600">NSSF</td>
                <td className="py-3 text-right">-KES {entry.nssf.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-600">NHIF</td>
                <td className="py-3 text-right">-KES {entry.shif.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-600">Housing Levy</td>
                <td className="py-3 text-right">-KES {entry.housingLevy.toLocaleString()}</td>
              </tr>
              {entry.deductions > 0 && (
                <tr>
                  <td className="py-3 text-slate-600">Other Deductions</td>
                  <td className="py-3 text-right">-KES {entry.deductions.toLocaleString()}</td>
                </tr>
              )}
              <tr className="bg-green-50">
                <td className="py-3 font-bold text-slate-900">Net Salary</td>
                <td className="py-3 text-right font-bold text-green-700">KES {entry.netSalary.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div className="flex gap-2">
              <button
                onClick={() => currentIndex > 0 && onNavigate(entries[currentIndex - 1])}
                disabled={currentIndex <= 0}
                className="px-3 py-1 text-sm rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-slate-600">
                {currentIndex + 1} of {entries.length}
              </span>
              <button
                onClick={() => currentIndex < entries.length - 1 && onNavigate(entries[currentIndex + 1])}
                disabled={currentIndex >= entries.length - 1}
                className="px-3 py-1 text-sm rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200"
              >
                Next
              </button>
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
