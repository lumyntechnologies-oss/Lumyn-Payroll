"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, CheckCircle, AlertTriangle, Mail, MessageSquare, Calendar, DollarSign, FileText, Clock } from "lucide-react";

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  leaveReminders: boolean;
  payslipNotifications: boolean;
  complianceAlerts: boolean;
  attendanceReminders: boolean;
  payrollAlerts: boolean;
  documentAlerts: boolean;
}

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>({});

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/employee");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.settings || {});
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
      setMessage({ type: "error", text: "Failed to load notification preferences" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences(data.settings);
        setMessage({ type: "success", text: "Notification preferences saved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to save notification preferences" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save notification preferences" });
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notification Settings
          </h1>
          <p className="text-gray-600">Manage how you receive notifications</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <p className={`text-sm ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications ?? true}
              onChange={() => togglePreference("emailNotifications")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts via SMS</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.smsNotifications ?? false}
              onChange={() => togglePreference("smsNotifications")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium">Leave Reminders</p>
                <p className="text-sm text-gray-600">Notify about leave requests and approvals</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.leaveReminders ?? true}
              onChange={() => togglePreference("leaveReminders")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Payslip Notifications</p>
                <p className="text-sm text-gray-600">Notify when payslip is ready</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.payslipNotifications ?? true}
              onChange={() => togglePreference("payslipNotifications")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Payroll Alerts</p>
                <p className="text-sm text-gray-600">Notify about payroll runs and disbursements</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.payrollAlerts ?? true}
              onChange={() => togglePreference("payrollAlerts")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">Compliance Alerts</p>
                <p className="text-sm text-gray-600">Tax and compliance reminders</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.complianceAlerts ?? true}
              onChange={() => togglePreference("complianceAlerts")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">Attendance Reminders</p>
                <p className="text-sm text-gray-600">Notify about attendance issues</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.attendanceReminders ?? true}
              onChange={() => togglePreference("attendanceReminders")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Document Alerts</p>
                <p className="text-sm text-gray-600">Notify about new documents</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.documentAlerts ?? true}
              onChange={() => togglePreference("documentAlerts")}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Notification Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}
