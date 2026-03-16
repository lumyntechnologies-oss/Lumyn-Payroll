"use client";

import { useEffect, useState } from "react";
import {
  Users, DollarSign, Calendar, TrendingUp, Shield, AlertTriangle,
  ArrowUpRight, ArrowDownRight, CheckCircle, Clock, Loader2
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS = ["#3b82f6","#f59e0b","#10b981","#8b5cf6","#ef4444"];

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
  payrollTrend: { month: number; year: number; totalGross: number; totalNet: number }[];
  deptHeadcount: { dept: string; count: number }[];
  complianceAlerts: { id: string; title: string; type: string; status: string; dueDate: string }[];
  recentNotifications: { id: string; title: string; message: string; type: string; createdAt: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-80 gap-3 text-slate-400">
      <AlertTriangle className="w-10 h-10" />
      <p className="text-sm">Failed to load dashboard. Please check your database connection.</p>
    </div>
  );

  const kpiCards = [
    { title: "Total Employees", value: String(data.kpi.totalEmployees), change: "", changeLabel: "total headcount", icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600", trend: "neutral" },
    { title: "Active Employees", value: String(data.kpi.activeEmployees), change: `${data.kpi.totalEmployees > 0 ? ((data.kpi.activeEmployees / data.kpi.totalEmployees) * 100).toFixed(1) : 0}%`, changeLabel: "active rate", icon: Users, iconBg: "bg-green-100", iconColor: "text-green-600", trend: "up" },
    { title: "Payroll This Month", value: `KES ${(data.kpi.payrollThisMonth / 1000000).toFixed(2)}M`, change: "", changeLabel: "net payout", icon: DollarSign, iconBg: "bg-purple-100", iconColor: "text-purple-600", trend: "neutral" },
    { title: "Pending Leave", value: String(data.kpi.pendingLeave), change: "", changeLabel: "awaiting approval", icon: Calendar, iconBg: "bg-amber-100", iconColor: "text-amber-600", trend: "neutral" },
    { title: "Salary Advances", value: `KES ${(data.kpi.advancesOutstanding / 1000).toFixed(0)}K`, change: "", changeLabel: "outstanding", icon: TrendingUp, iconBg: "bg-red-100", iconColor: "text-red-600", trend: "neutral" },
    { title: "Compliance Status", value: data.kpi.complianceStatus, change: String(data.kpi.complianceDueCount), changeLabel: "due this week", icon: Shield, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", trend: data.kpi.complianceStatus === "Compliant" ? "up" : "down" },
  ];

  const payrollTrendData = data.payrollTrend.map(r => ({
    month: MONTH_NAMES[r.month - 1],
    gross: r.totalGross / 1000000,
    net: r.totalNet / 1000000,
  }));

  const leaveDistribution = [
    { name: "Annual Leave", value: 45 },
    { name: "Sick Leave", value: 28 },
    { name: "Maternity", value: 12 },
    { name: "Paternity", value: 8 },
    { name: "Unpaid", value: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Jane. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <p className="text-xs text-slate-500 font-medium">{kpi.title}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                  {kpi.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                  <span className="text-xs text-slate-400">{kpi.change} {kpi.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle className="text-sm">Payroll Cost Trend (KES M)</CardTitle></CardHeader>
          <CardContent>
            {payrollTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={payrollTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} name="Gross" />
                  <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Net" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No payroll data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Department Headcount</CardTitle></CardHeader>
          <CardContent>
            {data.deptHeadcount.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.deptHeadcount} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No department data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Leave Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={leaveDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {leaveDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {leaveDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {data.complianceAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">All compliance obligations on track</div>
            ) : (
              <div className="space-y-3">
                {data.complianceAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      {item.status === "OVERDUE" ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : item.status === "DUE_SOON" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.type.replace("_", " ")}</p>
                        <p className="text-xs text-slate-500">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === "OVERDUE" ? "danger" : item.status === "DUE_SOON" ? "warning" : "success"}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {data.recentNotifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "WARNING" ? "bg-amber-400" : n.type === "SUCCESS" ? "bg-green-400" : "bg-blue-400"}`} />
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toRelativeString ? "" : new Date(n.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
