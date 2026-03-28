"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Settings, CheckCircle, AlertTriangle } from "lucide-react";

interface PayrollConfig {
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

export default function PayrollSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [config, setConfig] = useState<Partial<PayrollConfig>>({});

  useEffect(() => {
    fetchPayrollConfig();
  }, []);

  const fetchPayrollConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/payroll");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || {});
      }
    } catch (error) {
      console.error("Failed to load payroll config:", error);
      setMessage({ type: "error", text: "Failed to load payroll configuration" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setMessage({ type: "success", text: "Payroll configuration saved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to save payroll configuration" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save payroll configuration" });
    } finally {
      setSaving(false);
    }
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
            <Settings className="w-8 h-8" />
            Payroll Configuration
          </h1>
          <p className="text-gray-600">Set up payroll rules and tax rates</p>
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
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Configure payment frequency and dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select
                value={config.paymentFrequency || "MONTHLY"}
                onValueChange={(value) => setConfig({ ...config, paymentFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Day of Month</Label>
              <Input
                id="paymentDate"
                type="number"
                min={1}
                max={31}
                value={config.paymentDate || 25}
                onChange={(e) => setConfig({ ...config, paymentDate: parseInt(e.target.value) })}
                placeholder="Enter day (1-31)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxYear">Tax Year</Label>
            <Input
              id="taxYear"
              type="number"
              min={2020}
              max={2030}
              value={config.taxYear || 2026}
              onChange={(e) => setConfig({ ...config, taxYear: parseInt(e.target.value) })}
              placeholder="Enter tax year"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statutory Contributions</CardTitle>
          <CardDescription>Configure tax and contribution rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nssfContribution">NSSF Contribution (%)</Label>
              <Input
                id="nssfContribution"
                type="number"
                step={0.1}
                min={0}
                max={100}
                value={config.nssfContribution || 6.0}
                onChange={(e) => setConfig({ ...config, nssfContribution: parseFloat(e.target.value) })}
                placeholder="Enter NSSF rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nhifContribution">NHIF Contribution (%)</Label>
              <Input
                id="nhifContribution"
                type="number"
                step={0.01}
                min={0}
                max={100}
                value={config.nhifContribution || 1.75}
                onChange={(e) => setConfig({ ...config, nhifContribution: parseFloat(e.target.value) })}
                placeholder="Enter NHIF rate"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shilfContribution">SHIF Contribution (%)</Label>
              <Input
                id="shilfContribution"
                type="number"
                step={0.01}
                min={0}
                max={100}
                value={config.shilfContribution || 0.5}
                onChange={(e) => setConfig({ ...config, shilfContribution: parseFloat(e.target.value) })}
                placeholder="Enter SHIF rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housingLevyRate">Housing Levy (%)</Label>
              <Input
                id="housingLevyRate"
                type="number"
                step={0.01}
                min={0}
                max={100}
                value={config.housingLevyRate || 1.5}
                onChange={(e) => setConfig({ ...config, housingLevyRate: parseFloat(e.target.value) })}
                placeholder="Enter housing levy rate"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Settings</CardTitle>
          <CardDescription>Configure overtime calculation rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultOvertime">Default Overtime Multiplier</Label>
            <Input
              id="defaultOvertime"
              type="number"
              step={0.1}
              min={1}
              max={5}
              value={config.defaultOvertime || 1.5}
              onChange={(e) => setConfig({ ...config, defaultOvertime: parseFloat(e.target.value) })}
              placeholder="Enter overtime multiplier"
            />
            <p className="text-sm text-gray-500">
              Standard overtime rate is 1.5x (time and a half)
            </p>
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
            "Save Payroll Configuration"
          )}
        </Button>
      </div>
    </div>
  );
}
