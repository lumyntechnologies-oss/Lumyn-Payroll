"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Play, FileText, Download, Calendar } from "lucide-react";
interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: 'DRAFT' | 'APPROVED' | 'DISBURSED';
  totalGross: number;
  totalTax: number;
  totalNet: number;
  approvedAt?: string;
  disbursedAt?: string;
}

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({ month: "", year: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayrollRuns();
  }, [tab]);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/runs");
      const data = await res.json();
      setPayrollRuns(Array.isArray(data.runs) ? data.runs : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch payroll runs:", error);
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
  };


  const createPayrollRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payroll/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateDialog(false);
        setFormData({ month: "", year: "" });
        fetchPayrollRuns();
      } else {
        // Show error message from API
        setError(data.error || "Failed to create payroll run");
      }
    } catch (error) {
      console.error("Failed to create payroll run:", error);
      setError("Failed to create payroll run. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const approveRun = async (id: string) => {
    try {
      await fetch(`/api/payroll/runs/${id}/approve`, { method: "POST" });
      fetchPayrollRuns();
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const disburseRun = async (id: string) => {
    try {
      await fetch(`/api/payroll/runs/${id}/disburse`, { method: "POST" });
      fetchPayrollRuns();
    } catch (error) {
      console.error("Failed to disburse:", error);
    }
  };

  const filteredRuns = (payrollRuns || []).filter((run: PayrollRun) => {
    if (tab === "all") return true;
    return run.status.toLowerCase() === tab;
  });

  const getStatusBadge = (status: 'DRAFT' | 'APPROVED' | 'DISBURSED') => {
    const variant = status === "DISBURSED" ? "default" : status === "APPROVED" ? "secondary" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };


  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  if (loading) {
    return <div>Loading payroll...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Payroll
          </h1>
          <p className="text-muted-foreground">{payrollRuns.length} payroll runs</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setError(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Payroll Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Payroll Run</DialogTitle>
              <DialogDescription>Create a new payroll run for the specified month and year.</DialogDescription>
            </DialogHeader>
            <form onSubmit={createPayrollRun} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select onValueChange={(v) => setFormData({...formData, month: v})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString().padStart(2, '0')}>{new Date(0, i).toLocaleString('en-KE', { month: 'long' })}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" min="2024" max="2030" required onChange={(e) => setFormData({...formData, year: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Run"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="disbursed">Disbursed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>Manage payroll processing and disbursement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gross Payroll</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Net Payroll</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{new Date(run.year, run.month - 1).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</p>
                          <p className="text-sm text-muted-foreground">Run #{run.id.slice(-6)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(run.totalGross)}</TableCell>
                      <TableCell className="font-mono text-destructive">{formatCurrency(run.totalTax)}</TableCell>
                      <TableCell className="font-mono font-semibold">{formatCurrency(run.totalNet)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {run.status === 'DRAFT' && (
                            <Button size="sm" onClick={() => approveRun(run.id)}>
                              <Play className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {run.status === 'APPROVED' && (
                            <Button size="sm" variant="default" onClick={() => disburseRun(run.id)}>
                              <DollarSign className="w-4 h-4 mr-1" />
                              Disburse
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            Payslips
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRuns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No payroll runs {tab !== 'all' ? `in ${tab} status` : ''}. Create one above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

