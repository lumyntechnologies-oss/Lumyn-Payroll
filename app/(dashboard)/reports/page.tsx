"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Calendar, Users, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const summaryCards = [
  { label: "Total Payroll", period: "This Month", value: "KES 1.25M", trend: 12, icon: DollarSign, color: "blue" },
  { label: "Tax Withheld", period: "This Month", value: "KES 245K", trend: 8, icon: FileText, color: "purple" },
  { label: "Attendance Rate", period: "This Month", value: "96%", trend: 2, icon: Users, color: "green" },
  { label: "Leave Requests", period: "This Month", value: "15", trend: -3, icon: Calendar, color: "amber" },
];

const chartData = [
  { month: "Jan", payroll: 850000, tax: 165000 },
  { month: "Feb", payroll: 920000, tax: 180000 },
  { month: "Mar", payroll: 1100000, tax: 215000 },
  { month: "Apr", payroll: 1250000, tax: 245000 },
  { month: "May", payroll: 1320000, tax: 260000 },
];

const ICON_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-700",
};

const reportActions = [
  { label: "Employee Roster", desc: "Current employees and departments", format: "PDF", icon: Users },
  { label: "Payslip Batch", desc: "Generate payslips for selected period", format: "ZIP", icon: DollarSign },
  { label: "Compliance Report", desc: "PAYE, NSSF, SHIF summary", format: "Excel", icon: FileText },
  { label: "Attendance Report", desc: "Monthly attendance and overtime", format: "CSV", icon: Calendar },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(null);
    alert(`Exported ${type} report`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Payroll, attendance, and compliance insights</p>
        </div>
        <Button onClick={() => handleExport("all")} disabled={!!loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading === "all" ? "Exporting..." : "Export All"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${ICON_COLORS[card.color]} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${card.trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {card.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(card.trend)}%
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.label} · {card.period}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle className="text-sm">Payroll Cost Trend (KES)</CardTitle></CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip formatter={(v: unknown) => `KES ${(Number(v) / 1000).toFixed(0)}K`} />
                <Legend />
                <Bar dataKey="payroll" fill="#3b82f6" name="Payroll" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tax" fill="#a78bfa" name="Tax" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Generate Reports</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reportActions.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{action.label}</p>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading === action.label}
                    onClick={() => handleExport(action.label)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    {action.format}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Reports</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Period</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Generated</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">March 2026 Payroll Summary</td>
                <td className="px-5 py-3.5"><Badge variant="default">Payroll</Badge></td>
                <td className="px-5 py-3.5 text-slate-500">March 2026</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">2 days ago</td>
                <td className="px-5 py-3.5">
                  <Button size="sm" variant="outline" onClick={() => handleExport("march-payroll")}>
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
