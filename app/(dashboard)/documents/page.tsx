"use client";

import { FileText, Upload, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const documents = [
  { name: "Employment Contract - Alice Nyambura", type: "Contract", employee: "Alice Nyambura", date: "Jan 15, 2022", size: "245 KB" },
  { name: "P9 Form - 2025", type: "Tax", employee: "All Employees", date: "Jan 5, 2026", size: "1.2 MB" },
  { name: "NSSF Compliance Report - Q4 2025", type: "Compliance", employee: "Company", date: "Jan 10, 2026", size: "380 KB" },
  { name: "Leave Policy Handbook 2026", type: "Policy", employee: "All Employees", date: "Feb 1, 2026", size: "520 KB" },
  { name: "Payslip - Feb 2026 - Peter Kamau", type: "Payslip", employee: "Peter Kamau", date: "Feb 28, 2026", size: "85 KB" },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Company and employee documents</p>
        </div>
        <Button><Upload className="w-4 h-4" /> Upload Document</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">All Documents</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Document", "Type", "Employee", "Date", "Size", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-800">{doc.name}</span>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant="secondary">{doc.type}</Badge></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{doc.employee}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{doc.date}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{doc.size}</td>
                  <td className="px-5 py-3.5 flex gap-2">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg"><Download className="w-4 h-4 text-slate-400" /></button>
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
