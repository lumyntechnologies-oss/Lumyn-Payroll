"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, CheckCircle, AlertTriangle, ArrowLeft, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: string;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  entries: PayrollEntry[];
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    email: string;
    department: { name: string };
  };
  basicSalary: number;
  allowances: number;
  deductions: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  grossSalary: number;
  netSalary: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  bankCode?: string;
  accountNumber?: string;
  mpesaNumber?: string;
  primary: boolean;
}

export default function PayrollDisbursePage() {
  const [loading, setLoading] = useState(true);
  const [disbursing, setDisbursing] = useState(false);
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod[]>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLatestPayrollRun();
  }, []);

  const fetchLatestPayrollRun = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/runs?status=APPROVED&limit=1");
      if (res.ok) {
        const data = await res.json();
        if (data.runs && data.runs.length > 0) {
          const run = data.runs[0];
          setPayrollRun(run);
          setSelectedEntries(new Set(run.entries.map((e: PayrollEntry) => e.id)));
          await fetchPaymentMethods(run.entries);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payroll run:", error);
      setMessage({ type: "error", text: "Failed to load payroll data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async (entries: PayrollEntry[]) => {
    try {
      const employeeIds = [...new Set(entries.map(e => e.employeeId))];
      const methods: Record<string, PaymentMethod[]> = {};

      for (const empId of employeeIds) {
        const res = await fetch(`/api/payments/methods?employeeId=${empId}`);
        if (res.ok) {
          const data = await res.json();
          methods[empId] = data.methods || [];
        }
      }

      setPaymentMethods(methods);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  };

  const handleDisburse = async () => {
    if (!payrollRun) return;

    try {
      setDisbursing(true);
      const res = await fetch(`/api/payroll/disburse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payrollRunId: payrollRun.id,
          entryIds: Array.from(selectedEntries),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: `Successfully disbursed ${data.disbursedCount} payments` });
        fetchLatestPayrollRun();
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.message || "Disbursement failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Disbursement failed" });
    } finally {
      setDisbursing(false);
    }
  };

  const toggleEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const toggleAll = () => {
    if (!payrollRun) return;
    if (selectedEntries.size === payrollRun.entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(payrollRun.entries.map(e => e.id)));
    }
  };

  const getPaymentMethodDisplay = (employeeId: string) => {
    const methods = paymentMethods[employeeId] || [];
    const primary = methods.find(m => m.primary);
    if (!primary) return "No payment method";
    if (primary.type === "MPESA") return `M-Pesa: ${primary.mpesaNumber}`;
    if (primary.type === "BANK") return `Bank: ${primary.accountNumber}`;
    return primary.type;
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

if (loading) {
    return <PageSkeleton />;
  }

  if (!payrollRun) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payroll
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="w-8 h-8" />
              Payroll Disbursement
            </h1>
            <p className="text-gray-600">No approved payroll runs available for disbursement</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="w-8 h-8" />
              Payroll Disbursement
            </h1>
            <p className="text-gray-600">
              {new Date(payrollRun.year, payrollRun.month - 1).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLatestPayrollRun}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleDisburse} disabled={disbursing || selectedEntries.size === 0}>
            {disbursing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Disbursing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Disburse Selected ({selectedEntries.size})
              </>
            )}
          </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold">{payrollRun.entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Gross Payroll</p>
            <p className="text-2xl font-bold">{formatCurrency(payrollRun.totalGross)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Deductions</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(payrollRun.totalTax)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Net Payroll</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollRun.totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Entries</CardTitle>
          <CardDescription>Select employees to disburse payments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedEntries.size === payrollRun.entries.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRun.entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedEntries.has(entry.id)}
                      onChange={() => toggleEntry(entry.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.employee.firstName} {entry.employee.lastName}</p>
                      <p className="text-sm text-gray-500">{entry.employee.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{entry.employee.department.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getPaymentMethodDisplay(entry.employeeId)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{formatCurrency(entry.grossSalary)}</TableCell>
                  <TableCell className="font-mono text-red-600">
                    {formatCurrency(entry.paye + entry.nssf + entry.shif + entry.housingLevy + entry.deductions)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-green-600">
                    {formatCurrency(entry.netSalary)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disbursement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Selected Employees</p>
              <p className="text-xl font-bold">{selectedEntries.size} of {payrollRun.entries.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Net Pay</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(
                  payrollRun.entries
                    .filter(e => selectedEntries.has(e.id))
                    .reduce((sum, e) => sum + e.netSalary, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Methods</p>
              <p className="text-xl font-bold">
                {new Set(payrollRun.entries.filter(e => selectedEntries.has(e.id)).map(e => getPaymentMethodDisplay(e.employeeId))).size} types
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
