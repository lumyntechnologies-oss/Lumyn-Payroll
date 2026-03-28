"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationalId?: string;
  kraPin?: string;
  nssfNumber?: string;
  nhifNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  departmentId: string;
  jobTitle: string;
  employmentType: string;
  hireDate: string;
  status: string;
  basicSalary: number;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  mpesaNumber?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function EmployeeEditPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [employee, setEmployee] = useState<Partial<Employee>>({});
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchEmployee();
    fetchDepartments();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employees/${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data.employee || {});
      } else {
        setMessage({ type: "error", text: "Failed to load employee" });
      }
    } catch (error) {
      console.error("Failed to fetch employee:", error);
      setMessage({ type: "error", text: "Failed to load employee" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (res.ok) {
        const data = await res.json();
        setEmployee(data.employee);
        setMessage({ type: "success", text: "Employee updated successfully" });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.message || "Failed to update employee" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update employee" });
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
        <div className="flex items-center gap-4">
          <Link href="/employees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="w-8 h-8" />
              Edit Employee
            </h1>
            <p className="text-gray-600">{employee.firstName} {employee.lastName}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Employee personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={employee.firstName || ""}
                  onChange={(e) => setEmployee({ ...employee, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={employee.lastName || ""}
                  onChange={(e) => setEmployee({ ...employee, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={employee.email || ""}
                onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={employee.phone || ""}
                onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={employee.nationalId || ""}
                  onChange={(e) => setEmployee({ ...employee, nationalId: e.target.value })}
                  placeholder="Enter national ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  value={employee.kraPin || ""}
                  onChange={(e) => setEmployee({ ...employee, kraPin: e.target.value })}
                  placeholder="Enter KRA PIN"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nssfNumber">NSSF Number</Label>
                <Input
                  id="nssfNumber"
                  value={employee.nssfNumber || ""}
                  onChange={(e) => setEmployee({ ...employee, nssfNumber: e.target.value })}
                  placeholder="Enter NSSF number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nhifNumber">NHIF Number</Label>
                <Input
                  id="nhifNumber"
                  value={employee.nhifNumber || ""}
                  onChange={(e) => setEmployee({ ...employee, nhifNumber: e.target.value })}
                  placeholder="Enter NHIF number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : ""}
                  onChange={(e) => setEmployee({ ...employee, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={employee.gender || ""}
                  onValueChange={(value) => setEmployee({ ...employee, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Job and department information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={employee.employeeId || ""}
                onChange={(e) => setEmployee({ ...employee, employeeId: e.target.value })}
                placeholder="Enter employee ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select
                value={employee.departmentId || ""}
                onValueChange={(value) => setEmployee({ ...employee, departmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={employee.jobTitle || ""}
                onChange={(e) => setEmployee({ ...employee, jobTitle: e.target.value })}
                placeholder="Enter job title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={employee.employmentType || "FULL_TIME"}
                  onValueChange={(value) => setEmployee({ ...employee, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERN">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={employee.status || "ACTIVE"}
                  onValueChange={(value) => setEmployee({ ...employee, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={employee.hireDate ? employee.hireDate.split('T')[0] : ""}
                  onChange={(e) => setEmployee({ ...employee, hireDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary (KES) *</Label>
                <Input
                  id="basicSalary"
                  type="number"
                  value={employee.basicSalary || ""}
                  onChange={(e) => setEmployee({ ...employee, basicSalary: parseFloat(e.target.value) })}
                  placeholder="Enter basic salary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Bank and M-Pesa details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={employee.bankName || ""}
                onChange={(e) => setEmployee({ ...employee, bankName: e.target.value })}
                placeholder="Enter bank name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Input
                  id="bankAccount"
                  value={employee.bankAccount || ""}
                  onChange={(e) => setEmployee({ ...employee, bankAccount: e.target.value })}
                  placeholder="Enter account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBranch">Bank Branch</Label>
                <Input
                  id="bankBranch"
                  value={employee.bankBranch || ""}
                  onChange={(e) => setEmployee({ ...employee, bankBranch: e.target.value })}
                  placeholder="Enter branch"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpesaNumber">M-Pesa Number</Label>
              <Input
                id="mpesaNumber"
                value={employee.mpesaNumber || ""}
                onChange={(e) => setEmployee({ ...employee, mpesaNumber: e.target.value })}
                placeholder="Enter M-Pesa number"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
