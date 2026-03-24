"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";

interface ComplianceRecord {
  id: string;
  type: string;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  filedDate?: string;
  status: "PENDING" | "FILED" | "OVERDUE";
  reference?: string;
}

interface ComplianceAlert {
  id: string;
  type: string;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  status: string;
  daysUntilDue: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  severity: "critical" | "warning" | "info";
}

interface TaxResult {
  grossSalary: number;
  basicSalary: number;
  allowances: number;
  paye: number;
  nssf: number;
  nhif: number;
  shilf: number;
  housingLevy: number;
  totalDeductions: number;
  netSalary: number;
}

export default function ComplianceManagerPage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [taxCalculation, setTaxCalculation] = useState<TaxResult | null>(null);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);

  // Tax calculator form
  const [basicSalary, setBasicSalary] = useState<string>("");
  const [allowances, setAllowances] = useState<string>("0");
  const [calculatingTax, setCalculatingTax] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchComplianceData();
  }, [currentMonth, currentYear]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);

      const [summaryRes, alertsRes] = await Promise.all([
        fetch(`/api/compliance/summary?month=${currentMonth}&year=${currentYear}`),
        fetch("/api/compliance/alerts"),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setRecords(data.data?.records || []);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Failed to fetch compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateTax = async () => {
    if (!basicSalary) {
      alert("Please enter basic salary");
      return;
    }

    try {
      setCalculatingTax(true);

      const res = await fetch("/api/compliance/tax-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicSalary: parseFloat(basicSalary),
          allowances: parseFloat(allowances) || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTaxCalculation(data.data);
      }
    } catch (error) {
      console.error("Failed to calculate tax:", error);
    } finally {
      setCalculatingTax(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-600 bg-red-50 border-red-200",
      warning: "text-orange-600 bg-orange-50 border-orange-200",
      info: "text-blue-600 bg-blue-50 border-blue-200",
    };
    return colors[severity] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Manager</h1>
          <p className="text-gray-600">Track tax and regulatory compliance</p>
        </div>
        <FileText className="w-8 h-8 text-primary" />
      </div>

      {/* Compliance Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              Compliance Alerts
            </CardTitle>
            <CardDescription className="text-red-700">
              {alerts.filter((a) => a.severity === "critical").length} critical,{" "}
              {alerts.filter((a) => a.severity === "warning").length} warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {alert.type} - {alert.month}/{alert.year}
                    </p>
                    <p className="text-sm">
                      Amount: {formatCurrency(alert.amount)}
                    </p>
                    <p className="text-sm">
                      {alert.isOverdue
                        ? `Overdue by ${Math.abs(alert.daysUntilDue)} days`
                        : `Due in ${alert.daysUntilDue} days`}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Mark Filed
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Month Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentMonth}/{currentYear} Compliance Status
          </CardTitle>
          <CardDescription>
            Monthly tax and statutory compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No compliance records for this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{record.type}</h3>
                    <p className="text-sm text-gray-600">
                      Amount: {formatCurrency(record.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(record.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {record.status === "FILED" ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        FILED
                      </Badge>
                    ) : record.status === "OVERDUE" ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        OVERDUE
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        PENDING
                      </Badge>
                    )}
                    {record.status === "PENDING" && (
                      <Button size="sm">Mark Filed</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tax & Deduction Calculator
          </CardTitle>
          <CardDescription>
            Calculate PAYE, NSSF, NHIF, and other deductions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Basic Salary (KES)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="Enter basic salary"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Allowances (KES)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                placeholder="Enter allowances (optional)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculateTax}
            disabled={calculatingTax || !basicSalary}
            className="w-full"
          >
            {calculatingTax && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Calculate Deductions
          </Button>

          {taxCalculation && (
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold">Calculation Results</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Gross Salary</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(taxCalculation.grossSalary)}
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Net Salary</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(taxCalculation.netSalary)}
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">PAYE Tax</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(taxCalculation.paye)}
                  </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">NSSF (6%)</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(taxCalculation.nssf)}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">NHIF</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(taxCalculation.nhif)}
                  </p>
                </div>

                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Housing Levy (1.5%)</p>
                  <p className="text-lg font-bold text-teal-600">
                    {formatCurrency(taxCalculation.housingLevy)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(taxCalculation.totalDeductions)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(
                    (taxCalculation.totalDeductions / taxCalculation.grossSalary) *
                    100
                  ).toFixed(1)}
                  % of gross salary
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Kenya 2026 Tax Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">PAYE (Pay As You Earn)</p>
            <p className="text-gray-600">
              Progressive tax on employment income. Personal relief: 2,400/year
            </p>
          </div>
          <div>
            <p className="font-medium">NSSF (National Social Security Fund)</p>
            <p className="text-gray-600">6% contribution on basic salary</p>
          </div>
          <div>
            <p className="font-medium">NHIF (National Health Insurance Fund)</p>
            <p className="text-gray-600">
              Tiered contributions based on salary bands
            </p>
          </div>
          <div>
            <p className="font-medium">Housing Levy</p>
            <p className="text-gray-600">1.5% contribution on gross salary</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
