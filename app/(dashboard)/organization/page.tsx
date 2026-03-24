"use client";

import { Users, ChevronDown, ChevronRight, Loader2, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { useState, useEffect } from "react";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  employmentType: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  employees: Employee[];
}

function DepartmentCard({ dept }: { dept: Department }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex flex-col items-center bg-white border-2 border-blue-400 rounded-xl px-5 py-3 shadow-sm min-w-44 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-2">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <p className="font-semibold text-sm text-slate-900 whitespace-nowrap">{dept.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{dept.employees.length} employee{dept.employees.length !== 1 ? "s" : ""}</p>
        <div className="mt-1 text-slate-400">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </div>

      {expanded && dept.employees.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t-2 border-slate-200">
          {dept.employees.map((emp) => (
            <div
              key={emp.id}
              className="flex flex-col items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm min-w-36 text-center"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-slate-500" />
              </div>
              <p className="font-medium text-sm text-slate-900 whitespace-nowrap">
                {emp.firstName} {emp.lastName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{emp.jobTitle}</p>
              <p className="text-xs text-blue-600 mt-0.5 font-mono">{emp.employeeId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/organization")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDepartments(d.data);
        else setError(d.error || "Failed to load organization data");
      })
      .catch(() => setError("Network error loading organization"))
      .finally(() => setLoading(false));
  }, []);

  const totalEmployees = departments.reduce((sum, d) => sum + d.employees.length, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Structure</h1>
        <p className="text-slate-500 text-sm mt-0.5">Company departments and team members</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
                <p className="text-xs text-slate-500 mt-1">Departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{totalEmployees}</p>
                <p className="text-xs text-slate-500 mt-1">Active Employees</p>
              </CardContent>
            </Card>
          </div>

          {departments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No departments found</p>
                <p className="text-sm mt-1">Add departments and employees to see the org chart</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Department Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex flex-wrap gap-8 p-4 min-w-max justify-center">
                    {departments.map((dept) => (
                      <DepartmentCard key={dept.id} dept={dept} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
