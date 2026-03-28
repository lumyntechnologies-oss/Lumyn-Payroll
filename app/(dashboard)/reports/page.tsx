"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { BarChart3, Download, FileText, Calendar, Users, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DashboardData {
  kpi: {
    totalEmployees: number;
    activeEmployees: number;
    payrollThisMonth: number;
    pendingLeave: number;
    advancesOutstanding: number;
    complianceStatus: string;
    complianceDueCount: number;
  };
  recentPayroll: {
    month: number;
    year: number;
    totalGross: number;
    totalTax: number;
    totalNet: number;
  }[];
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  period: string;
  generatedAt: string;
  url?: string;
}

const ICON_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-700",
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentReports, setRecentReports] = useState<ReportData[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentReports();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const res = await fetch("/api/reports?limit=5");
      if (res.ok) {
        const data = await res.json();
        setRecentReports(data.reports || []);
      }
    } catch (error) {
      console.error("Failed to fetch recent reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      setExporting(type);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
        }
        fetchRecentReports();
      }
    } catch (error) {
      console.error("Failed to export report:", error);
    } finally {
      setExporting(null);
    }
  };

  const summaryCards = dashboardData ? [
    { 
      label: "Total Payroll", 
      period: "This Month", 
      value: `KES ${(dashboardData.kpi.payrollThisMonth / 1000000).toFixed(2)}M`, 
      trend: 12, 
      icon: DollarSign, 
      color: "blue" 
    },
    { 
      label: "Tax Withheld", 
      period: "This Month", 
      value: `KES ${((dashboardData.recentPayroll?.[0]?.totalTax ?? 0) / 1000).toFixed(0)}K`, 
      trend: 8, 
      icon: FileText, 
      color: "purple" 
    },
    { 
      label: "Active Employees", 
      period: "Current", 
      value: dashboardData.kpi.activeEmployees.toString(), 
      trend: 2, 
      icon: Users, 
      color: "green" 
    },
    { 
      label: "Pending Leave", 
      period: "Requests", 
      value: dashboardData.kpi.pendingLeave.toString(), 
      trend: -3, 
      icon: Calendar, 
      color: "amber" 
    },
  ] : [];

  const chartData = dashboardData?.recentPayroll?.map(run => ({
    month: new Date(run.year, run.month - 1).toLocaleDateString('en-KE', { month: 'short' }),
    payroll: run.totalGross,
    tax: run.totalTax,
  })) || [];

  const reportActions = [
    { label: "Employee Roster", desc: "Current employees and departments", format: "PDF", icon: Users },
    { label: "Payslip Batch", desc: "Generate payslips for selected period", format: "ZIP", icon: DollarSign },
    { label: "Compliance Report", desc: "PAYE, NSSF, SHIF summary", format: "Excel", icon: FileText },
    { label: "Attendance Report", desc: "Monthly attendance and overtime", format: "CSV", icon: Calendar },
  ];

if (loading) {
    return <PageSkeleton />;
  }

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
        <Button onClick={() => handleExport("all")} disabled={!!exporting}>
          <Download className="w-4 h-4 mr-2" />
          {exporting === "all" ? "Exporting..." : "Export All"}
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
            {chartData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No payroll data available
              </div>
            )}
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
                    disabled={exporting === action.label}
                    onClick={() => handleExport(action.label)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    {exporting === action.label ? "..." : action.format}
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
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No reports generated yet
            </div>
          ) : (
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
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{report.name}</td>
                    <td className="px-5 py-3.5"><Badge variant="default">{report.type}</Badge></td>
                    <td className="px-5 py-3.5 text-slate-500">{report.period}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {report.url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(report.url, "_blank")}>
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
