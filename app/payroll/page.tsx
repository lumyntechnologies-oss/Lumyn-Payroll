"use client";

import { DollarSign, Download, Eye, Send, CheckCircle, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const payrollData = [
  { employee: "Alice Nyambura", basic: 120000, allowances: 25000, deductions: 5000, paye: 28500, nssf: 2160, shif: 500, housingLevy: 1800, net: 107040 },
  { employee: "David Mwangi", basic: 85000, allowances: 18000, deductions: 3000, paye: 18400, nssf: 2160, shif: 500, housingLevy: 1275, net: 77665 },
  { employee: "Sarah Wanjiku", basic: 75000, allowances: 15000, deductions: 2000, paye: 14500, nssf: 2160, shif: 500, housingLevy: 1125, net: 69715 },
  { employee: "James Otieno", basic: 95000, allowances: 20000, deductions: 4000, paye: 22000, nssf: 2160, shif: 500, housingLevy: 1425, net: 84915 },
  { employee: "Grace Achieng", basic: 65000, allowances: 12000, deductions: 2000, paye: 11500, nssf: 2160, shif: 500, housingLevy: 975, net: 59865 },
  { employee: "Peter Kamau", basic: 130000, allowances: 28000, deductions: 6000, paye: 32000, nssf: 2160, shif: 500, housingLevy: 1950, net: 115390 },
];

export default function PayrollPage() {
  const totalGross = payrollData.reduce((s, e) => s + e.basic + e.allowances, 0);
  const totalTax = payrollData.reduce((s, e) => s + e.paye + e.nssf + e.shif + e.housingLevy, 0);
  const totalNet = payrollData.reduce((s, e) => s + e.net, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">March 2026 Payroll</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning">Draft</Badge>
          <Button variant="outline" size="sm"><Eye className="w-4 h-4" /> Preview Payslips</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4" /> Export</Button>
          <Button><Play className="w-4 h-4" /> Run Payroll</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Payroll Cost", value: `KES ${(totalGross / 1000).toFixed(0)}K`, icon: DollarSign, color: "blue" },
          { label: "Tax Deductions", value: `KES ${(totalTax / 1000).toFixed(0)}K`, icon: DollarSign, color: "red" },
          { label: "Net Salary Payout", value: `KES ${(totalNet / 1000).toFixed(0)}K`, icon: DollarSign, color: "green" },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">172 employees · March 2026</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Payroll Register</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><CheckCircle className="w-4 h-4" /> Approve Payroll</Button>
              <Button variant="outline" size="sm"><Send className="w-4 h-4" /> Send Payslips</Button>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "Basic Salary", "Allowances", "Deductions", "PAYE", "NSSF", "SHIF", "Housing Levy", "Net Pay"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payrollData.map((row) => (
                <tr key={row.employee} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{row.employee}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.basic.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.allowances.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.deductions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{row.paye.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{row.nssf.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{row.shif.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{row.housingLevy.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">{row.net.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 text-sm font-bold text-slate-800">Total</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-800">{payrollData.reduce((s, e) => s + e.basic, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-800">{payrollData.reduce((s, e) => s + e.allowances, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-800">{payrollData.reduce((s, e) => s + e.deductions, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{payrollData.reduce((s, e) => s + e.paye, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{payrollData.reduce((s, e) => s + e.nssf, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{payrollData.reduce((s, e) => s + e.shif, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{payrollData.reduce((s, e) => s + e.housingLevy, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">{payrollData.reduce((s, e) => s + e.net, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
