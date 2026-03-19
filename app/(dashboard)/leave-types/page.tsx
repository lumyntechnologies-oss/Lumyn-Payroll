"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface LeaveType {
  id: string;
  name: string;
  allowedDays: number;
  description?: string;
  isPaid: boolean;
  requiresApproval: boolean;
  carryoverAllowed: boolean;
  _count: { requests: number };
}

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    allowedDays: 10,
    description: "",
    isPaid: true,
    requiresApproval: true,
    carryoverAllowed: false,
  });

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leave/manage-types");
      const data = await response.json();
      if (data.success) {
        setLeaveTypes(data.data);
      }
    } catch (error) {
      console.error("Failed to load leave types:", error);
      setMessage({ type: "error", text: "Failed to load leave types" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/leave/manage-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "Leave type saved successfully" });
        loadLeaveTypes();
        setShowModal(false);
        resetForm();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error saving leave type" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      allowedDays: 10,
      description: "",
      isPaid: true,
      requiresApproval: true,
      carryoverAllowed: false,
    });
    setEditingId(null);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Types</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage leave types and entitlements</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Leave Type
        </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaveTypes.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{type.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{type.allowedDays} days</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {type.description && <p className="text-xs text-slate-600">{type.description}</p>}
              
              <div className="space-y-1 text-xs text-slate-600">
                <p>Paid: {type.isPaid ? "Yes" : "No"}</p>
                <p>Requires Approval: {type.requiresApproval ? "Yes" : "No"}</p>
                <p>Carryover Allowed: {type.carryoverAllowed ? "Yes" : "No"}</p>
                <p className="text-slate-500">Used: {type._count.requests} times</p>
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setFormData({
                      name: type.name,
                      allowedDays: type.allowedDays,
                      description: type.description || "",
                      isPaid: type.isPaid,
                      requiresApproval: type.requiresApproval,
                      carryoverAllowed: type.carryoverAllowed,
                    });
                    setEditingId(type.id);
                    setShowModal(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-base">{editingId ? "Edit Leave Type" : "Add Leave Type"}</CardTitle>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Leave Type Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Annual Leave"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Allowed Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.allowedDays}
                    onChange={(e) => setFormData({ ...formData, allowedDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Standard annual leave entitlement"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Paid Leave</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Requires Manager Approval</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.carryoverAllowed}
                      onChange={(e) => setFormData({ ...formData, carryoverAllowed: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Carryover Allowed</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
