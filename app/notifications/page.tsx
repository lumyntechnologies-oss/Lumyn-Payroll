"use client";

import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const notifications = [
  { type: "warning", title: "NSSF Filing Due in 2 Days", message: "Monthly NSSF remittance of KES 371,520 is due on March 15, 2026.", time: "1 hour ago", read: false },
  { type: "warning", title: "SHIF Payment Due Soon", message: "SHIF contribution of KES 86,000 must be remitted by March 15, 2026.", time: "1 hour ago", read: false },
  { type: "info", title: "Leave Request Submitted", message: "Alice Nyambura has submitted an annual leave request for Mar 20-26.", time: "3 hours ago", read: false },
  { type: "success", title: "Payroll Approved", message: "February 2026 payroll has been approved and disbursed to 172 employees.", time: "1 day ago", read: true },
  { type: "info", title: "New Employee Onboarded", message: "David Mwangi has been successfully onboarded to the system.", time: "2 days ago", read: true },
  { type: "success", title: "PAYE Return Filed", message: "Monthly PAYE return for February 2026 successfully submitted to KRA iTax.", time: "3 days ago", read: true },
];

const icons: Record<string, React.ReactNode> = {
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">System alerts and updates</p>
        </div>
        <Button variant="outline" size="sm">Mark all as read</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              All Notifications
            </CardTitle>
            <Badge variant="danger">{notifications.filter(n => !n.read).length} unread</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {notifications.map((notif, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${notif.read ? "bg-slate-50" : "bg-blue-50 border border-blue-100"}`}
            >
              <div className="shrink-0 mt-0.5">{icons[notif.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${notif.read ? "text-slate-700" : "text-slate-900"}`}>{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
