"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: { name: string };
  jobTitle: string;
  basicSalary: number;
  status: "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED";
  hireDate: string;
}

interface Department {
  id: string;
  name: string;
}

const STATUS_VARIANTS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  ON_LEAVE: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  TERMINATED: "bg-slate-100 text-slate-600",
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  employeeId: "",
  departmentId: "",
  jobTitle: "",
  basicSalary: "",
  hireDate: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDept && selectedDept !== "all") params.append("departmentId", selectedDept);
      const res = await fetch(`/api/employees?${params}`);
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data?.employees ?? []);
        setTotal(json.data?.pagination?.total ?? 0);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDept]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments");
      const json = await res.json();
      if (json.success) setDepartments(json.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          basicSalary: Number(formData.basicSalary),
        }),
      });
      const json = await res.json();
      if (json.success || res.ok) {
        setShowAddDialog(false);
        setFormData({ ...emptyForm });
        fetchEmployees();
      } else {
        setFormError(json.error ?? "Failed to add employee.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Employees
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total employees</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={addEmployee} className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name *</Label>
                  <Input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Last Name *</Label>
                  <Input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Department *</Label>
                <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Job Title *</Label>
                <Input required value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Basic Salary (KES) *</Label>
                  <Input type="number" required value={formData.basicSalary} onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Hire Date *</Label>
                  <Input type="date" required value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
                </div>
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{formError}</p>}
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Add Employee
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, ID or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchEmployees()}
                className="pl-10"
              />
            </div>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employee List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hired</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-400 font-mono">{emp.employeeId}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{emp.department?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{emp.jobTitle}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-800">KES {emp.basicSalary?.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_VARIANTS[emp.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {emp.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(emp.hireDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteEmployee(emp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        No employees found. Add your first employee above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
