"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: { id: string; name: string };
  jobTitle: string;
  employmentType: string;
  hireDate: string;
  status: string;
}

interface Department { id: string; name: string }

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  ACTIVE: "success", ON_LEAVE: "warning", SUSPENDED: "warning", TERMINATED: "danger"
};
const TYPE_VARIANT: Record<string, "default" | "warning" | "secondary"> = {
  FULL_TIME: "default", PART_TIME: "secondary", CONTRACT: "warning", INTERN: "secondary"
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    if (deptFilter) params.set("departmentId", deptFilter);
    if (typeFilter) params.set("employmentType", typeFilter);
    const res = await fetch(`/api/employees?${params}`);
    const json = await res.json();
    if (json.success) {
      setEmployees(json.data.employees);
      setTotal(json.data.pagination.total);
      setTotalPages(json.data.pagination.totalPages);
    }
    setLoading(false);
  }, [page, search, deptFilter, typeFilter]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => {
    fetch("/api/departments").then(r => r.json()).then(j => { if (j.success) setDepartments(j.data); });
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total employees</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by name, ID, email..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
                className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Types</option>
                {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"].map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" />Export</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee ID", "Full Name", "Department", "Job Title", "Type", "Hire Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">No employees found</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-blue-600">{emp.employeeId}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{emp.firstName[0]}{emp.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{emp.department.name}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{emp.jobTitle}</td>
                  <td className="px-5 py-3.5"><Badge variant={TYPE_VARIANT[emp.employmentType] ?? "secondary"}>{emp.employmentType.replace("_", " ")}</Badge></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(emp.hireDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[emp.status] ?? "secondary"}>{emp.status.replace("_", " ")}</Badge></td>
                  <td className="px-5 py-3.5 relative">
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === emp.id ? null : emp.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                    {showActionMenu === emp.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-40 z-40">
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setShowActionMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setShowActionMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Edit Details
                        </button>
                        <hr className="my-1" />
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {emp.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Terminate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">Showing {employees.length} of {total} employees</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
            <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">{page}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>
      </Card>

      {showAddModal && (
        <AddEmployeeModal departments={departments} onClose={() => setShowAddModal(false)} onSaved={fetchEmployees} />
      )}

      {selectedEmployee && (
        <EmployeeProfileModal
          employee={selectedEmployee}
          departments={departments}
          onClose={() => setSelectedEmployee(null)}
          onSaved={fetchEmployees}
        />
      )}
    </div>
  );
}

function AddEmployeeModal({ departments, onClose, onSaved }: { departments: Department[], onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", jobTitle: "", departmentId: "", employmentType: "FULL_TIME", hireDate: "", basicSalary: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    setSaving(false);
    if (json.success) { onSaved(); onClose(); }
    else setError(json.error ?? "Failed to save");
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Add New Employee</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            {[["firstName", "First Name"], ["lastName", "Last Name"]].map(([k, l]) => (
              <div key={k}><label className="block text-xs font-medium text-slate-600 mb-1">{l}</label>
                <input required value={(form as Record<string, string>)[k]} onChange={handle(k)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            ))}
          </div>
          {[["email", "Email", "email"], ["phone", "Phone", "text"], ["jobTitle", "Job Title", "text"]].map(([k, l, t]) => (
            <div key={k}><label className="block text-xs font-medium text-slate-600 mb-1">{l}</label>
              <input type={t} required={k === "email"} value={(form as Record<string, string>)[k]} onChange={handle(k)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <select required value={form.departmentId} onChange={handle("departmentId")} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Employment Type</label>
              <select value={form.employmentType} onChange={handle("employmentType")} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"].map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Hire Date</label>
              <input type="date" required value={form.hireDate} onChange={handle("hireDate")} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Basic Salary (KES)</label>
              <input type="number" required value={form.basicSalary} onChange={handle("basicSalary")} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Employee"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeProfileModal({ employee, departments, onClose, onSaved }: { employee: Employee, departments: Department[], onClose: () => void, onSaved: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-slate-900">Employee Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-5">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold">{employee.firstName[0]}{employee.lastName[0]}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h3>
              <p className="text-sm text-slate-600 mt-1">{employee.email}</p>
              <div className="flex gap-3 mt-3">
                <Badge variant={STATUS_VARIANT[employee.status] ?? "secondary"}>{employee.status.replace("_", " ")}</Badge>
                <Badge variant={TYPE_VARIANT[employee.employmentType] ?? "secondary"}>{employee.employmentType.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Employee Information</h4>
              <div className="space-y-2">
                <div><p className="text-xs text-slate-500">Employee ID</p><p className="text-sm font-mono text-blue-600">{employee.employeeId}</p></div>
                <div><p className="text-xs text-slate-500">Department</p><p className="text-sm text-slate-900">{employee.department.name}</p></div>
                <div><p className="text-xs text-slate-500">Job Title</p><p className="text-sm text-slate-900">{employee.jobTitle}</p></div>
                <div><p className="text-xs text-slate-500">Hire Date</p><p className="text-sm text-slate-900">{new Date(employee.hireDate).toLocaleDateString()}</p></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left">View Leave Requests</Button>
                <Button variant="outline" className="w-full justify-start text-left">View Payslips</Button>
                <Button variant="outline" className="w-full justify-start text-left">View Attendance</Button>
                <Button variant="outline" className="w-full justify-start text-left">Download Profile</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
