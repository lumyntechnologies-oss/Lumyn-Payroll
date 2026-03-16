"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface ComplianceRecord {
  id: string;
  type: string;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  filedDate?: string;
  status: string;
  reference?: string;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_VARIANT: Record<string, "success" | "danger" | "warning" | "secondary"> = {
  FILED: "success", OVERDUE: "danger", DUE_SOON: "warning", PENDING: "secondary"
};

const TYPE_LABELS: Record<string, string> = {
  PAYE: "PAYE (KRA)",
  NSSF: "NSSF",
  SHIF: "SHIF",
  HOUSING_LEVY: "Housing Levy",
};

export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/compliance?month=${month}&year=${year}`).then(r => r.json()).then(j => {
      if (j.success) setRecords(j.data);
      setLoading(false);
    });
  }, [month, year]);

  async function fileRecord(id: string) {
    const res = await fetch(`/api/compliance/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FILED", filedDate: new Date().toISOString().split("T")[0] }),
    });
    const json = await res.json();
    if (json.success) setRecords(records.map(r => r.id === id ? json.data : r));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Statutory compliance tracking and filing status</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <p className="text-sm">No compliance records for this period. Add records or run payroll first.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {records.map(item => (
              <Card key={item.id} className={item.status === "DUE_SOON" ? "border-amber-200 bg-amber-50/50" : item.status === "OVERDUE" ? "border-red-200 bg-red-50/50" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-slate-900">{item.type.replace("_", " ")}</span>
                    {item.status === "FILED" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                      item.status === "OVERDUE" ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                        item.status === "DUE_SOON" ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                          <Clock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{TYPE_LABELS[item.type]}</p>
                  <p className="text-base font-semibold text-slate-800">KES {item.amount.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant={STATUS_VARIANT[item.status]}>{item.status.replace("_", " ")}</Badge>
                    <span className="text-xs text-slate-400">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                  {item.filedDate && <p className="text-xs text-green-600 mt-1">Filed: {new Date(item.filedDate).toLocaleDateString()}</p>}
                  {item.status !== "FILED" && (
                    <Button size="sm" className="w-full mt-3" variant={item.status === "DUE_SOON" || item.status === "OVERDUE" ? "default" : "outline"} onClick={() => fileRecord(item.id)}>
                      File Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Compliance Timeline — {MONTH_NAMES[month - 1]} {year}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${item.status === "FILED" ? "bg-green-500" : item.status === "DUE_SOON" ? "bg-amber-400" : item.status === "OVERDUE" ? "bg-red-500" : "bg-slate-200"}`} />
                    <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <span className="text-sm font-medium text-slate-800">{TYPE_LABELS[item.type]} — {item.type.replace("_", " ")}</span>
                        <p className="text-xs text-slate-500 mt-0.5">KES {item.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-slate-500">{new Date(item.dueDate).toLocaleDateString()}</span>
                        <p className="text-xs mt-0.5"><Badge variant={STATUS_VARIANT[item.status]}>{item.status.replace("_", " ")}</Badge></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
