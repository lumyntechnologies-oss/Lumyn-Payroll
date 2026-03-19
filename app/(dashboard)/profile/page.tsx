"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Lock, User, FileText, Download } from "lucide-react";

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your personal information and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "personal"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Security
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          My Documents
        </button>
      </div>

      {activeTab === "personal" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile?.name || ""}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={profile?.employeeId || "N/A"}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={profile?.department?.name || "N/A"}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Contact HR to update personal information</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                Password and authentication are managed through your account settings. Click below to manage your Clerk account.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Manage Account Security
            </Button>
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-600 mb-4">
                Enable 2FA for additional security when accessing sensitive features like salary disbursement approvals.
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-900">My Payslips</p>
                    <p className="text-xs text-slate-500">View and download your salary records</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-medium text-slate-900">P9 Tax Form</p>
                    <p className="text-xs text-slate-500">Annual tax withholding statement</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="font-medium text-slate-900">Employment Certificate</p>
                    <p className="text-xs text-slate-500">Official employment verification letter</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
