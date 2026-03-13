"use client";

import {
  Users, DollarSign, Calendar, TrendingUp, Shield, AlertTriangle,
  ArrowUpRight, ArrowDownRight, CheckCircle, Clock
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const payrollTrend = [
  { month: "Sep", cost: 3200000 },
  { month: "Oct", cost: 3400000 },
  { month: "Nov", cost: 3350000 },
  { month: "Dec", cost: 3600000 },
  { month: "Jan", cost: 3500000 },
  { month: "Feb", cost: 3750000 },
  { month: "Mar", cost: 3820000 },
];

const employeeGrowth = [
  { month: "Sep", count: 145 },
  { month: "Oct", count: 152 },
  { month: "Nov", count: 156 },
  { month: "Dec", count: 158 },
  { month: "Jan", count: 163 },
  { month: "Feb", count: 168 },
  { month: "Mar", count: 172 },
];

const leaveDistribution = [
  { name: "Annual Leave", value: 45, color: "#3b82f6" },
  { name: "Sick Leave", value: 28, color: "#f59e0b" },
  { name: "Maternity", value: 12, color: "#10b981" },
  { name: "Paternity", value: 8, color: "#8b5cf6" },
  { name: "Unpaid", value: 7, color: "#ef4444" },
];

const deptHeadcount = [
  { dept: "Engineering", count: 42 },
  { dept: "Sales", count: 35 },
  { dept: "HR", count: 18 },
  { dept: "Finance", count: 22 },
  { dept: "Operations", count: 31 },
  { dept: "Marketing", count: 24 },
];

const recentActivity = [
  { action: "New employee onboarded", name: "David Mwangi", time: "2 hours ago", type: "employee" },
  { action: "Leave request approved", name: "Sarah Wanjiku", time: "4 hours ago", type: "leave" },
  { action: "Payroll processed", name: "February 2026", time: "1 day ago", type: "payroll" },
  { action: "Salary advance approved", name: "James Otieno", time: "2 days ago", type: "advance" },
  { action: "PAYE filing submitted", name: "KRA iTax", time: "3 days ago", type: "compliance" },
];

const pendingApprovals = [
  { type: "Leave Request", employee: "Alice Nyambura", detail: "Annual Leave • 5 days", urgent: false },
  { type: "Salary Advance", employee: "Peter Kamau", detail: "KES 50,000 • Medical", urgent: true },
  { type: "Overtime Claim", employee: "Grace Achieng", detail: "12 hours • March 10-12", urgent: false },
];

const complianceAlerts = [
  { title: "NSSF Filing Due", date: "Mar 15, 2026", status: "warning" },
  { title: "SHIF Remittance", date: "Mar 15, 2026", status: "warning" },
  { title: "PAYE Return", date: "Mar 20, 2026", status: "ok" },
  { title: "Housing Levy", date: "Mar 20, 2026", status: "ok" },
];

const kpiCards = [
  {
    title: "Total Employees",
    value: "172",
    change: "+4",
    changeLabel: "this month",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: "up",
  },
  {
    title: "Active Employees",
    value: "168",
    change: "97.7%",
    changeLabel: "active rate",
    icon: Users,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    trend: "up",
  },
  {
    title: "Payroll This Month",
    value: "KES 3.82M",
    change: "+1.9%",
    changeLabel: "vs last month",
    icon: DollarSign,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    trend: "up",
  },
  {
    title: "Pending Leave",
    value: "14",
    change: "-3",
    changeLabel: "vs last week",
    icon: Calendar,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    trend: "down",
  },
  {
    title: "Salary Advances",
    value: "KES 420K",
    change: "8 active",
    changeLabel: "outstanding",
    icon: TrendingUp,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    trend: "neutral",
  },
  {
    title: "Compliance Status",
    value: "Compliant",
    change: "2 due",
    changeLabel: "this week",
    icon: Shield,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    trend: "up",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Jane. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4" />
          <span>March 13, 2026</span>
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
                  {kpi.trend === "down" && <ArrowDownRight className="w-3 h-3 text-amber-500" />}
                  <span className="text-xs text-slate-500">
                    <span className={kpi.trend === "up" ? "text-green-600 font-medium" : kpi.trend === "down" ? "text-amber-600 font-medium" : "text-slate-600 font-medium"}>
                      {kpi.change}
                    </span>{" "}
                    {kpi.changeLabel}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payroll Cost Trend (KES)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [`KES ${(v / 1000000).toFixed(2)}M`, "Cost"]} />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Employee Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={employeeGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leave Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={leaveDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {leaveDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {leaveDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Department Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptHeadcount} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent HR Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.name} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pending Approvals</CardTitle>
              <Badge variant="warning">{pendingApprovals.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800">{item.employee}</p>
                      {item.urgent && <Badge variant="danger">Urgent</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.detail}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="default">Approve</Button>
                    <Button size="sm" variant="outline">Reject</Button>
                  </div>
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
            <div className="space-y-3">
              {complianceAlerts.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    {item.status === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">Due: {item.date}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === "warning" ? "warning" : "success"}>
                    {item.status === "warning" ? "Due Soon" : "On Track"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
