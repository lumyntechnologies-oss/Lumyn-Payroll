"use client";

import { CheckCircle, AlertTriangle, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const complianceItems = [
  { title: "PAYE", description: "Pay As You Earn - KRA iTax", dueDate: "Mar 20, 2026", amount: "KES 892,400", status: "Filed", filedDate: "Mar 5, 2026" },
  { title: "NSSF", description: "National Social Security Fund", dueDate: "Mar 15, 2026", amount: "KES 371,520", status: "Due Soon", filedDate: "-" },
  { title: "SHIF", description: "Social Health Insurance Fund", dueDate: "Mar 15, 2026", amount: "KES 86,000", status: "Due Soon", filedDate: "-" },
  { title: "Housing Levy", description: "Affordable Housing Levy", dueDate: "Mar 20, 2026", amount: "KES 244,080", status: "Pending", filedDate: "-" },
];

const timeline = [
  { event: "PAYE Return Filed", date: "Mar 5, 2026", status: "done" },
  { event: "NSSF Remittance Due", date: "Mar 15, 2026", status: "upcoming" },
  { event: "SHIF Remittance Due", date: "Mar 15, 2026", status: "upcoming" },
  { event: "Housing Levy Due", date: "Mar 20, 2026", status: "pending" },
  { event: "PAYE Monthly Return", date: "Mar 20, 2026", status: "pending" },
];

export default function CompliancePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Statutory compliance tracking and filing status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceItems.map((item) => (
          <Card key={item.title} className={item.status === "Due Soon" ? "border-amber-200 bg-amber-50" : ""}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg text-slate-900">{item.title}</span>
                {item.status === "Filed" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : item.status === "Due Soon" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">{item.description}</p>
              <p className="text-base font-semibold text-slate-800">{item.amount}</p>
              <div className="flex items-center justify-between mt-3">
                <Badge variant={item.status === "Filed" ? "success" : item.status === "Due Soon" ? "warning" : "secondary"}>
                  {item.status}
                </Badge>
                <span className="text-xs text-slate-400">Due: {item.dueDate}</span>
              </div>
              {item.status !== "Filed" && (
                <Button size="sm" className="w-full mt-3" variant={item.status === "Due Soon" ? "default" : "outline"}>
                  File Now
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Compliance Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${item.status === "done" ? "bg-green-500" : item.status === "upcoming" ? "bg-amber-400" : "bg-slate-200"}`} />
                <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium text-slate-800">{item.event}</span>
                  <span className="text-sm text-slate-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
