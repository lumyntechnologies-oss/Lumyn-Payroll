"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Bell,
  Lock,
  User,
  Building2,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  role?: "admin" | "user";
}

interface EmployeeSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  leaveReminders: boolean;
  payslipNotifications: boolean;
  complianceAlerts: boolean;
  attendanceReminders: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [settings, setSettings] = useState<Partial<EmployeeSettings>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/employee");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
      } else if (res.status === 404) {
        // Employee not found - user may not be onboarded yet
        setMessage({ type: "error", text: "Employee profile not found. Please complete onboarding first." });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          leaveReminders: settings.leaveReminders,
          payslipNotifications: settings.payslipNotifications,
          complianceAlerts: settings.complianceAlerts,
          attendanceReminders: settings.attendanceReminders,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: "Notification settings saved" });
        setSettings(data.settings);
      } else if (res.status === 404) {
        setMessage({ type: "error", text: "Employee profile not found. Please complete onboarding first." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: settings.theme,
          language: settings.language,
          timezone: settings.timezone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: "Preferences saved" });
        setSettings(data.settings);
      } else if (res.status === 404) {
        setMessage({ type: "error", text: "Employee profile not found. Please complete onboarding first." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  };

  const userSettings: SettingsOption[] = [
    {
      id: "profile",
      title: "Profile Settings",
      description: "Update your personal information",
      icon: <User className="w-6 h-6" />,
      href: "/settings/personal",
      role: "user",
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Manage notification preferences",
      icon: <Bell className="w-6 h-6" />,
      href: "/settings/notifications",
      role: "user",
    },
    {
      id: "security",
      title: "Security",
      description: "Security settings and activity",
      icon: <Lock className="w-6 h-6" />,
      href: "/settings/security",
      role: "user",
    },
  ];

  const adminSettings: SettingsOption[] = [
    {
      id: "company",
      title: "Company Settings",
      description: "Configure company information",
      icon: <Building2 className="w-6 h-6" />,
      href: "/settings/company",
      role: "admin",
    },
    {
      id: "payroll",
      title: "Payroll Configuration",
      description: "Set up payroll rules and tax rates",
      icon: <Settings className="w-6 h-6" />,
      href: "/settings/payroll",
      role: "admin",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <Settings className="w-8 h-8 text-primary" />
      </div>

      {/* Message */}
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

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications ?? true}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications ?? false}
                onChange={(e) =>
                  setSettings({ ...settings, smsNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Leave Reminders</p>
                <p className="text-sm text-gray-600">Notify about leave requests</p>
              </div>
              <input
                type="checkbox"
                checked={settings.leaveReminders ?? true}
                onChange={(e) =>
                  setSettings({ ...settings, leaveReminders: e.target.checked })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Payslip Notifications</p>
                <p className="text-sm text-gray-600">Notify when payslip is ready</p>
              </div>
              <input
                type="checkbox"
                checked={settings.payslipNotifications ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payslipNotifications: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Compliance Alerts</p>
                <p className="text-sm text-gray-600">Tax and compliance reminders</p>
              </div>
              <input
                type="checkbox"
                checked={settings.complianceAlerts ?? true}
                onChange={(e) =>
                  setSettings({ ...settings, complianceAlerts: e.target.checked })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Attendance Reminders</p>
                <p className="text-sm text-gray-600">Notify about attendance issues</p>
              </div>
              <input
                type="checkbox"
                checked={settings.attendanceReminders ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    attendanceReminders: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveNotifications}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Notification Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={settings.theme || "light"}
              onChange={(e) =>
                setSettings({ ...settings, theme: e.target.value as any })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={settings.language || "en"}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={settings.timezone || "Africa/Nairobi"}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Africa/Nairobi">Africa/Nairobi (Kenya)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <Button
            onClick={handleSavePreferences}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* User Settings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userSettings.map((setting) => (
            <Link key={setting.id} href={setting.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {setting.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{setting.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Administrator Settings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Administrator Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminSettings.map((setting) => (
            <Link key={setting.id} href={setting.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full opacity-50 hover:opacity-100">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        {setting.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{setting.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Documentation</p>
              <p className="text-sm text-gray-600">View system documentation</p>
            </div>
            <Button variant="ghost">View</Button>
          </div>
          <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Contact Support</p>
              <p className="text-sm text-gray-600">Get help from our team</p>
            </div>
            <Button variant="ghost">Contact</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
