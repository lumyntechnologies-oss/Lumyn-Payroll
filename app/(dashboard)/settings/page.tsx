"use client";

import { useEffect, useState } from "react";
import { User, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import PersonalSettings from "./personal/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

const tabs = [
  { id: "personal", label: "Personal Settings", icon: User },
];

interface CompanyData {
  id: string;
  name: string;
  registrationNumber: string;
  kraPin: string;
  nssfNumber: string;
  nhifNumber: string;
  shilNumber?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

interface PayrollData {
  id: string;
  paymentFrequency: string;
  paymentDate: number;
  taxYear: number;
  nssfContribution: number;
  nhifContribution: number;
  shilfContribution: number;
  housingLevyRate: number;
  defaultOvertime: number;
}

interface LeaveData {
  id: string;
  annualLeaveDays: number;
  sickLeaveDays: number;
  maternityDays: number;
  paternityDays: number;
  carryoverDays: number;
  carryoverExpiry: number;
  requiresApproval: boolean;
}

interface AttendanceData {
  id: string;
  workStartTime: string;
  workEndTime: string;
  lateThreshold: number;
  absentThreshold: number;
  overtimeMultiplier: number;
  autoMarkAttendance: boolean;
}

interface RoleData {
  id: string;
  role: string;
  resource: string;
  action: string;
  granted: boolean;
}

interface IntegrationData {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  webhookUrl?: string;
  lastSyncAt?: string;
  syncInterval: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [payroll, setPayroll] = useState<PayrollData | null>(null);
  const [leave, setLeave] = useState<LeaveData | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [compData, payData, leaveData, attData, rolesData, intData] = await Promise.all([
        fetch("/api/settings/company").then(r => r.json()),
        fetch("/api/settings/payroll").then(r => r.json()),
        fetch("/api/settings/leave").then(r => r.json()),
        fetch("/api/settings/attendance").then(r => r.json()),
        fetch("/api/settings/roles").then(r => r.json()),
        fetch("/api/settings/integrations").then(r => r.json()),
      ]);

      if (compData.success) setCompany(compData.data);
      if (payData.success) setPayroll(payData.data);
      if (leaveData.success) setLeave(leaveData.data);
      if (attData.success) setAttendance(attData.data);
      if (rolesData.success) setRoles(rolesData.data);
      if (intData.success) setIntegrations(intData.data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (endpoint: string, data: any) => {
    // Disabled for employee role - read-only view
    setMessage({ type: "error", text: "Contact HR to update company settings" });
    return;
  };

  const handleCompanySave = () => {
    if (!company) return;
    saveSettings("/api/settings/company", company);
  };

  const handlePayrollSave = () => {
    if (!payroll) return;
    saveSettings("/api/settings/payroll", payroll);
  };

  const handleLeaveSave = () => {
    if (!leave) return;
    saveSettings("/api/settings/leave", leave);
  };

  const handleAttendanceSave = () => {
    if (!attendance) return;
    saveSettings("/api/settings/attendance", attendance);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
<h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">View company configuration and manage personal preferences</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
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
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          {activeTab === "personal" && (
            <div>
              <PersonalSettings />
            </div>
          )}

          {activeTab === "payroll" && payroll && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Payroll Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Frequency</label>
                    <select
                      value={payroll.paymentFrequency}
                      onChange={(e) => setPayroll({ ...payroll, paymentFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>MONTHLY</option>
                      <option>BI-WEEKLY</option>
                      <option>WEEKLY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Date (Day of Month)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={payroll.paymentDate}
                      onChange={(e) => setPayroll({ ...payroll, paymentDate: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tax Year</label>
                    <input
                      type="number"
                      value={payroll.taxYear}
                      onChange={(e) => setPayroll({ ...payroll, taxYear: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NSSF Contribution (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payroll.nssfContribution}
                      onChange={(e) => setPayroll({ ...payroll, nssfContribution: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">NHIF Contribution (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payroll.nhifContribution}
                      onChange={(e) => setPayroll({ ...payroll, nhifContribution: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">SHIF Contribution (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payroll.shilfContribution}
                      onChange={(e) => setPayroll({ ...payroll, shilfContribution: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Housing Levy Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payroll.housingLevyRate}
                      onChange={(e) => setPayroll({ ...payroll, housingLevyRate: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Default Overtime Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={payroll.defaultOvertime}
                      onChange={(e) => setPayroll({ ...payroll, defaultOvertime: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Button onClick={handlePayrollSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "leave" && leave && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Leave Policies</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Annual Leave Days</label>
                    <input
                      type="number"
                      value={leave.annualLeaveDays}
                      onChange={(e) => setLeave({ ...leave, annualLeaveDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sick Leave Days</label>
                    <input
                      type="number"
                      value={leave.sickLeaveDays}
                      onChange={(e) => setLeave({ ...leave, sickLeaveDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Maternity Leave Days</label>
                    <input
                      type="number"
                      value={leave.maternityDays}
                      onChange={(e) => setLeave({ ...leave, maternityDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Paternity Leave Days</label>
                    <input
                      type="number"
                      value={leave.paternityDays}
                      onChange={(e) => setLeave({ ...leave, paternityDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Carryover Days Allowed</label>
                    <input
                      type="number"
                      value={leave.carryoverDays}
                      onChange={(e) => setLeave({ ...leave, carryoverDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Carryover Expiry (Months)</label>
                    <input
                      type="number"
                      value={leave.carryoverExpiry}
                      onChange={(e) => setLeave({ ...leave, carryoverExpiry: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={leave.requiresApproval}
                    onChange={(e) => setLeave({ ...leave, requiresApproval: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="requiresApproval" className="text-sm text-slate-700 cursor-pointer">Leave requests require manager approval</label>
                </div>
                <Button onClick={handleLeaveSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "attendance" && attendance && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Attendance Rules</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Work Start Time</label>
                    <input
                      type="time"
                      value={attendance.workStartTime}
                      onChange={(e) => setAttendance({ ...attendance, workStartTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Work End Time</label>
                    <input
                      type="time"
                      value={attendance.workEndTime}
                      onChange={(e) => setAttendance({ ...attendance, workEndTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Late Threshold (Minutes)</label>
                    <input
                      type="number"
                      value={attendance.lateThreshold}
                      onChange={(e) => setAttendance({ ...attendance, lateThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Absent Threshold (Days)</label>
                    <input
                      type="number"
                      value={attendance.absentThreshold}
                      onChange={(e) => setAttendance({ ...attendance, absentThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overtime Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={attendance.overtimeMultiplier}
                      onChange={(e) => setAttendance({ ...attendance, overtimeMultiplier: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoMarkAttendance"
                    checked={attendance.autoMarkAttendance}
                    onChange={(e) => setAttendance({ ...attendance, autoMarkAttendance: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="autoMarkAttendance" className="text-sm text-slate-700 cursor-pointer">Auto-mark employees present at work start time</label>
                </div>
                <Button onClick={handleAttendanceSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "roles" && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Roles & Permissions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {roles.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">No roles configured yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Role</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Resource</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Action</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.slice(0, 10).map((role) => (
                          <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 px-3">{role.role}</td>
                            <td className="py-2 px-3">{role.resource}</td>
                            <td className="py-2 px-3">{role.action}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${role.granted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {role.granted ? "Granted" : "Denied"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {roles.length > 10 && <p className="text-xs text-slate-500 mt-2">Showing 10 of {roles.length} permissions</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Integrations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {integrations.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">No integrations configured yet</p>
                  </div>
                ) : (
                  integrations.map((intg) => (
                    <div key={intg.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{intg.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Type: {intg.type}</p>
                        {intg.lastSyncAt && <p className="text-xs text-slate-500">Last synced: {new Date(intg.lastSyncAt).toLocaleDateString()}</p>}
                      </div>
                      <Button variant={intg.isActive ? "outline" : "default"} size="sm">
                        {intg.isActive ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
