"use client";

import { useState } from "react";
import { Building2, DollarSign, Calendar, Clock, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

const tabs = [
  { id: "company", label: "Company Profile", icon: Building2 },
  { id: "payroll", label: "Payroll Configuration", icon: DollarSign },
  { id: "leave", label: "Leave Policies", icon: Calendar },
  { id: "attendance", label: "Attendance Rules", icon: Clock },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Zap },
];

const integrations = [
  { name: "M-Pesa Salary Payments", desc: "Disburse salaries via M-Pesa B2C", connected: false },
  { name: "KRA iTax", desc: "Automatic PAYE filing and returns", connected: true },
  { name: "NSSF Portal", desc: "NSSF contribution remittances", connected: false },
  { name: "SHIF Portal", desc: "Health insurance fund remittances", connected: false },
  { name: "SMS Notifications", desc: "Payslip and leave alerts via SMS", connected: true },
  { name: "Biometric Attendance", desc: "Fingerprint device integration", connected: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage system configuration and preferences</p>
      </div>

      <div className="flex gap-5">
        <div className="w-52 shrink-0">
          <Card>
            <CardContent className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {activeTab === "company" && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Company Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Company Name", value: "TechVentures Kenya Ltd" },
                  { label: "Registration Number", value: "CPR/2020/123456" },
                  { label: "KRA PIN", value: "P051234567X" },
                  { label: "NSSF Number", value: "3456789" },
                  { label: "NHIF Number", value: "9876543" },
                  { label: "Address", value: "Westlands, Nairobi" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{field.label}</label>
                    <input
                      defaultValue={field.value}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Integrations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {integrations.map((intg) => (
                  <div key={intg.name} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{intg.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{intg.desc}</p>
                    </div>
                    <Button
                      variant={intg.connected ? "outline" : "default"}
                      size="sm"
                    >
                      {intg.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!["company", "integrations"].includes(activeTab) && (
            <Card>
              <CardHeader><CardTitle className="text-sm">{tabs.find(t => t.id === activeTab)?.label}</CardTitle></CardHeader>
              <CardContent>
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm">Configuration options for this section will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
