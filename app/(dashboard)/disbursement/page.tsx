"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, AlertCircle, CheckCircle, Clock, DollarSign, Users } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: string;
  totalAmount: number;
  employeeCount: number;
  approvedAt: string;
}

interface PaymentBatch {
  id: string;
  payrollRunId: string;
  status: string;
  totalAmount: number;
  employeeCount: number;
  sentAt?: string;
  successCount?: number;
  failureCount?: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SENT: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  APPROVED: "bg-green-100 text-green-800",
};

export default function DisbursementPage() {
  const router = useRouter();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [disbursing, setDisbursing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPayrollRuns();
    loadBatches();
  }, []);

  const loadPayrollRuns = async () => {
    try {
      const response = await fetch("/api/payroll/runs");
      const data = await response.json();
      if (data.success) {
        // Filter only approved runs
        const approved = data.data.filter((r: PayrollRun) => r.status === "APPROVED");
        setPayrollRuns(approved);
      }
    } catch (err) {
      setError("Failed to load payroll runs");
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const response = await fetch("/api/payments/batches");
      const data = await response.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (err) {
      console.error("Failed to load batches:", err);
    }
  };

  const handleDisburse = async () => {
    if (!selectedRun) return;

    setDisbursing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/payroll/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          payrollRunId: selectedRun.id,
          methodPriorities: ["BANK", "MPESA", "INTERNATIONAL"]
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Disbursement initiated. Batch ID: ${data.data.batchId}`);
        setTimeout(() => loadBatches(), 2000);
        setSelectedRun(null);
      } else {
        setError(data.error || "Failed to initiate disbursement");
      }
    } catch (err) {
      setError("Error initiating disbursement");
    } finally {
      setDisbursing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Salary Disbursement</h1>
        <p className="text-slate-500 text-sm mt-0.5">Admin only: Initiate and track employee salary payments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">{message}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{payrollRuns.length}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Approved Payroll Runs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{batches.filter((b) => b.status === "PROCESSING").length}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{batches.filter((b) => b.status === "COMPLETED").length}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Payroll Runs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Available for Disbursement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
              </div>
            ) : payrollRuns.length === 0 ? (
              <p className="text-sm text-slate-500">No approved payroll runs available</p>
            ) : (
              payrollRuns.map((run) => (
                <button
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedRun?.id === run.id
                      ? "bg-blue-50 border border-blue-300"
                      : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-slate-900">
                      {new Date(2000, run.month - 1).toLocaleDateString("en-US", { month: "long" })} {run.year}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {run.employeeCount} emp
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      KES {(Number(run.totalAmount) / 1000).toFixed(0)}k
                    </span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Disbursement Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Disbursement Control</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRun ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    {new Date(2000, selectedRun.month - 1).toLocaleDateString("en-US", { month: "long" })} {selectedRun.year}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600">Total Amount</p>
                      <p className="text-lg font-bold text-slate-900">
                        KES {Number(selectedRun.totalAmount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Employees</p>
                      <p className="text-lg font-bold text-slate-900">{selectedRun.employeeCount}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mb-4">
                    <p>Status: <Badge className={STATUS_COLORS[selectedRun.status] || ""}>{selectedRun.status}</Badge></p>
                    <p className="mt-1">Approved: {new Date(selectedRun.approvedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium">Review before disbursing</p>
                    <p className="mt-1">Ensure all employee payment methods are verified and amounts are correct.</p>
                  </div>
                </div>

                <Button
                  onClick={handleDisburse}
                  disabled={disbursing}
                  className="w-full"
                  size="lg"
                >
                  {disbursing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Initiating Disbursement...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Initiate Disbursement
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Select a payroll run to begin disbursement</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Batches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Disbursement Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No disbursement batches yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Batch ID</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Status</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Amount</th>
                    <th className="text-center py-2 px-3 font-semibold text-slate-600">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-xs text-blue-600">{batch.id.slice(0, 8)}...</td>
                      <td className="py-2 px-3">
                        <Badge className={STATUS_COLORS[batch.status] || ""}>{batch.status}</Badge>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        KES {Number(batch.totalAmount).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center text-xs text-slate-600">
                        {batch.successCount || 0}/{batch.employeeCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
