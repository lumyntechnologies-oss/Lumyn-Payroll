"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const leaveRequests = [
  { employee: "Alice Nyambura", type: "Annual Leave", start: "Mar 20", end: "Mar 26", days: 5, status: "Pending" },
  { employee: "David Mwangi", type: "Sick Leave", start: "Mar 14", end: "Mar 15", days: 2, status: "Approved" },
  { employee: "John Njoroge", type: "Annual Leave", start: "Mar 10", end: "Apr 4", days: 20, status: "Approved" },
  { employee: "Mary Gathoni", type: "Maternity Leave", start: "Apr 1", end: "Jul 1", days: 90, status: "Pending" },
  { employee: "Brian Ochieng", type: "Unpaid Leave", start: "Mar 1", end: "Mar 7", days: 5, status: "Rejected" },
];

const balanceCards = [
  { type: "Annual Leave", total: 21, used: 8, remaining: 13 },
  { type: "Sick Leave", total: 10, used: 2, remaining: 8 },
  { type: "Maternity Leave", total: 90, used: 0, remaining: 90 },
  { type: "Paternity Leave", total: 14, used: 0, remaining: 14 },
];

export default function LeavePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage employee leave requests and balances</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {balanceCards.map((b) => (
          <Card key={b.type}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{b.type}</p>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-2xl font-bold text-slate-900">{b.remaining}</span>
                <span className="text-sm text-slate-400 mb-0.5">/ {b.total} days</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(b.remaining / b.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{b.used} days used</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Leave Requests</CardTitle>
            <Button size="sm">+ New Request</Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "Leave Type", "Start Date", "End Date", "Duration", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaveRequests.map((row) => (
                <tr key={`${row.employee}-${row.start}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{row.employee}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.type}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.start}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.end}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.days} days</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={row.status === "Approved" ? "success" : row.status === "Rejected" ? "danger" : "warning"}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    {row.status === "Pending" && (
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
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
