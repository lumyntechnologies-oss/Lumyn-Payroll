"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Calendar, Users, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ReportSummary {
  type: string;
  period: string;
  value: number;
  trend: number;
}

const mockReports = [
  { type: 'Total Payroll', period: 'This Month', value: 1250000, trend: 12 },
  { type: 'Tax Withheld', period: 'This Month', value: 245000, trend: 8 },
  { type: 'Attendance Rate', period: 'This Month', value: 96, trend: 2 },
  { type: 'Leave Requests', period: 'This Month', value: 15, trend: -3 },
];

const chartData = [
  { month: 'Jan', payroll: 850000, tax: 165000 },
  { month: 'Feb', payroll: 920000, tax: 180000 },
  { month: 'Mar', payroll: 1100000, tax: 215000 },
  { month: 'Apr', payroll: 1250000, tax: 245000 },
  { month: 'May', payroll: 1320000, tax: 260000 },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = async (type: string) => {
    setLoading(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert(`Exported ${type} report`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Payroll, attendance, and compliance insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('payroll')} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exporting...' : 'Export All'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockReports.map((report, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{report.type}</CardTitle>
                <CardDescription>{report.period}</CardDescription>
              </div>
              {report.trend >= 0 ? (
                <Badge className="bg-green-50 text-green-700">+{report.trend}%</Badge>
              ) : (
                <Badge className="bg-red-50 text-red-700">{report.trend}%</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {report.value >= 1000 ? `KES ${ (report.value/1000).toLocaleString() }K` : report.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="payroll" fill="#3b82f6" name="Payroll" />
                <Bar dataKey="tax" fill="#ef4444" name="Tax" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Report Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Employee Roster</h3>
                <p className="text-sm text-muted-foreground">Current employees and departments</p>
              </div>
              <Button size="sm" className="ml-auto" onClick={() => handleExport('roster')}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Payslip Batch</h3>
                <p className="text-sm text-muted-foreground">Generate payslips for selected period</p>
              </div>
              <Button size="sm" className="ml-auto" onClick={() => handleExport('payslips')}>
                <Download className="w-4 h-4 mr-1" />
                ZIP
              </Button>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Compliance Report</h3>
                <p className="text-sm text-muted-foreground">PAYE, NSSF, NHIF summary</p>
              </div>
              <Button size="sm" className="ml-auto" onClick={() => handleExport('compliance')}>
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium">Attendance Report</h3>
                <p className="text-sm text-muted-foreground">Monthly attendance and overtime</p>
              </div>
              <Button size="sm" className="ml-auto" onClick={() => handleExport('attendance')}>
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
Name
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">April Payroll Summary</TableCell>
                <TableCell><Badge>Payroll</Badge></TableCell>
                <TableCell>April 2024</TableCell>
                <TableCell>2 days ago</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
              {/* More rows */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

