"use client";

import { Users, UserX, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

const attendanceData = [
  { employee: "Alice Nyambura", date: "Mar 13", clockIn: "08:02", clockOut: "17:05", hours: "9h 03m", overtime: "1h 03m", status: "Present" },
  { employee: "David Mwangi", date: "Mar 13", clockIn: "09:15", clockOut: "17:00", hours: "7h 45m", overtime: "-", status: "Late" },
  { employee: "Sarah Wanjiku", date: "Mar 13", clockIn: "-", clockOut: "-", hours: "-", overtime: "-", status: "Absent" },
  { employee: "James Otieno", date: "Mar 13", clockIn: "07:58", clockOut: "18:30", hours: "10h 32m", overtime: "2h 32m", status: "Present" },
  { employee: "Grace Achieng", date: "Mar 13", clockIn: "08:00", clockOut: "17:00", hours: "9h 00m", overtime: "-", status: "Present" },
  { employee: "Peter Kamau", date: "Mar 13", clockIn: "08:30", clockOut: "17:30", hours: "9h 00m", overtime: "1h 00m", status: "Present" },
];

const metrics = [
  { label: "Present Today", value: "158", icon: Users, color: "green" },
  { label: "Absent", value: "8", icon: UserX, color: "red" },
  { label: "Late Arrivals", value: "6", icon: Clock, color: "amber" },
  { label: "Overtime Hours", value: "47h", icon: TrendingUp, color: "blue" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">Today — March 13, 2026</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const colors: Record<string, string> = { green: "bg-green-100 text-green-600", red: "bg-red-100 text-red-600", amber: "bg-amber-100 text-amber-600", blue: "bg-blue-100 text-blue-600" };
          return (
            <Card key={m.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colors[m.color]} flex items-center justify-center`}>
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
        <CardHeader>
          <CardTitle className="text-sm">Daily Attendance Log</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "Date", "Clock In", "Clock Out", "Hours Worked", "Overtime", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceData.map((row) => (
                <tr key={row.employee} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{row.employee}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.date}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.clockIn}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.clockOut}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.hours}</td>
                  <td className="px-5 py-3.5 text-sm text-blue-600 font-medium">{row.overtime}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={row.status === "Present" ? "success" : row.status === "Late" ? "warning" : "danger"}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
