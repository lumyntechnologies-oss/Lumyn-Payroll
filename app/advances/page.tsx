"use client";

import { CheckCircle, XCircle, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const advances = [
  { employee: "Peter Kamau", amount: 50000, reason: "Medical Emergency", date: "Mar 10, 2026", status: "Pending", schedule: "3 months" },
  { employee: "Grace Achieng", amount: 30000, reason: "School Fees", date: "Mar 5, 2026", status: "Approved", schedule: "2 months" },
  { employee: "Mary Gathoni", amount: 20000, reason: "House Deposit", date: "Feb 28, 2026", status: "Approved", schedule: "4 months" },
  { employee: "David Mwangi", amount: 15000, reason: "Vehicle Repair", date: "Feb 20, 2026", status: "Rejected", schedule: "-" },
  { employee: "Brian Ochieng", amount: 40000, reason: "Medical", date: "Mar 12, 2026", status: "Pending", schedule: "2 months" },
];

export default function AdvancesPage() {
  const totalIssued = advances.filter(a => a.status === "Approved").reduce((s, a) => s + a.amount, 0);
  const totalPending = advances.filter(a => a.status === "Pending").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Salary Advances</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage employee salary advance requests</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Advances Issued", value: `KES ${(totalIssued / 1000).toFixed(0)}K`, icon: DollarSign, color: "blue" },
          { label: "Pending Approvals", value: totalPending.toString(), icon: Clock, color: "amber" },
          { label: "Outstanding Repayments", value: "KES 420K", icon: AlertTriangle, color: "red" },
        ].map((card) => {
          const Icon = card.icon;
          const colors: Record<string, string> = { blue: "bg-blue-100 text-blue-600", amber: "bg-amber-100 text-amber-600", red: "bg-red-100 text-red-600" };
          return (
            <Card key={card.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colors[card.color]} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Advance Requests</CardTitle>
            <Button size="sm">+ New Request</Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "Request Amount", "Reason", "Request Date", "Status", "Repayment Schedule", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {advances.map((row) => (
                <tr key={`${row.employee}-${row.date}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{row.employee}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">KES {row.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.reason}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={row.status === "Approved" ? "success" : row.status === "Rejected" ? "danger" : "warning"}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{row.schedule}</td>
                  <td className="px-5 py-3.5">
                    {row.status === "Pending" && (
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button className="flex items-center gap-1 text-xs text-red-600 font-medium">
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
