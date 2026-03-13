"use client";

import { Download } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

const payrollSummary = [
  { month: "Oct", gross: 4.1, net: 3.4 },
  { month: "Nov", gross: 4.0, net: 3.3 },
  { month: "Dec", gross: 4.3, net: 3.6 },
  { month: "Jan", gross: 4.2, net: 3.5 },
  { month: "Feb", gross: 4.5, net: 3.75 },
  { month: "Mar", gross: 4.6, net: 3.82 },
];

const deptCost = [
  { dept: "Engineering", cost: 1.8 },
  { dept: "Sales", cost: 1.2 },
  { dept: "Finance", cost: 0.9 },
  { dept: "HR", cost: 0.6 },
  { dept: "Ops", cost: 0.8 },
  { dept: "Marketing", cost: 0.7 },
];

const demographics = [
  { name: "18-25", value: 22, color: "#3b82f6" },
  { name: "26-35", value: 48, color: "#8b5cf6" },
  { name: "36-45", value: 28, color: "#10b981" },
  { name: "46+", value: 12, color: "#f59e0b" },
];

const leaveTrends = [
  { month: "Oct", annual: 32, sick: 18, other: 8 },
  { month: "Nov", annual: 28, sick: 22, other: 10 },
  { month: "Dec", annual: 45, sick: 12, other: 6 },
  { month: "Jan", annual: 20, sick: 25, other: 7 },
  { month: "Feb", annual: 30, sick: 16, other: 9 },
  { month: "Mar", annual: 35, sick: 14, other: 8 },
];

const reports = [
  "Payroll Summary Report",
  "Tax Deductions Report",
  "Employee Demographics Report",
  "Attendance Analytics Report",
  "Leave Trends Report",
  "Department Payroll Costs",
  "Employee Turnover Report",
];

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Comprehensive HR and payroll analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Payroll Summary (KES M)</CardTitle>
              <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={payrollSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip />
                <Line type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} name="Gross" />
                <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Net" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Department Payroll Costs (KES M)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Employee Age Demographics</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={demographics} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                  {demographics.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {demographics.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-sm text-slate-600">{d.name} years</span>
                  <span className="text-sm font-medium text-slate-800 ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leave Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leaveTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="annual" fill="#3b82f6" stackId="a" name="Annual" />
                <Bar dataKey="sick" fill="#f59e0b" stackId="a" name="Sick" />
                <Bar dataKey="other" fill="#10b981" stackId="a" name="Other" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reports.map((report) => (
              <div key={report} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                <span className="text-sm text-slate-700 font-medium">{report}</span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
