"use client";

import { useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

const employees = [
  { id: "EMP001", name: "Alice Nyambura", dept: "Engineering", title: "Software Engineer", type: "Full-time", hireDate: "Jan 15, 2022", status: "Active" },
  { id: "EMP002", name: "David Mwangi", dept: "Sales", title: "Sales Executive", type: "Full-time", hireDate: "Mar 8, 2023", status: "Active" },
  { id: "EMP003", name: "Sarah Wanjiku", dept: "HR", title: "HR Officer", type: "Full-time", hireDate: "Jun 1, 2021", status: "Active" },
  { id: "EMP004", name: "James Otieno", dept: "Finance", title: "Accountant", type: "Full-time", hireDate: "Feb 14, 2022", status: "Active" },
  { id: "EMP005", name: "Grace Achieng", dept: "Operations", title: "Operations Coordinator", type: "Contract", hireDate: "Aug 20, 2023", status: "Active" },
  { id: "EMP006", name: "Peter Kamau", dept: "Engineering", title: "DevOps Engineer", type: "Full-time", hireDate: "Nov 3, 2021", status: "Active" },
  { id: "EMP007", name: "Mary Gathoni", dept: "Marketing", title: "Marketing Analyst", type: "Part-time", hireDate: "Apr 12, 2024", status: "Active" },
  { id: "EMP008", name: "John Njoroge", dept: "Sales", title: "Sales Manager", type: "Full-time", hireDate: "Sep 1, 2020", status: "On Leave" },
  { id: "EMP009", name: "Esther Mutua", dept: "Finance", title: "Finance Manager", type: "Full-time", hireDate: "Jul 7, 2019", status: "Active" },
  { id: "EMP010", name: "Brian Ochieng", dept: "Engineering", title: "Frontend Developer", type: "Contract", hireDate: "Jan 10, 2024", status: "Terminated" },
];

const departments = ["All Departments", "Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"];
const employmentTypes = ["All Types", "Full-time", "Part-time", "Contract"];

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [type, setType] = useState("All Types");

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All Departments" || e.dept === dept;
    const matchType = type === "All Types" || e.type === type;
    return matchSearch && matchDept && matchType;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">{employees.length} total employees</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {employmentTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Employee ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Full Name</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Job Title</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Hire Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-blue-600">{emp.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{emp.name.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{emp.dept}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{emp.title}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={emp.type === "Contract" ? "warning" : emp.type === "Part-time" ? "secondary" : "default"}>
                      {emp.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{emp.hireDate}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={emp.status === "Active" ? "success" : emp.status === "On Leave" ? "warning" : "danger"}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">Showing {filtered.length} of {employees.length} employees</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
            <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">1</span>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}
