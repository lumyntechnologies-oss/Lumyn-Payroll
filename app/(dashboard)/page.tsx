"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, DollarSign, Clock, Calendar, TrendingUp, CheckCircle, Clock as ClockIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  payrollRuns: number;
  pendingLeaves: number;
  attendanceRate: number;
  avgSalary: number;
}

interface RecentActivity {
  id: string;
  title: string;
  type: 'payroll' | 'leave' | 'attendance' | 'advance';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  employee?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/notifications/list?limit=5') // Reuse notifications for activity
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { month: 'Jan', payroll: 12000 },
    { month: 'Feb', payroll: 15000 },
    { month: 'Mar', payroll: 18000 },
    { month: 'Apr', payroll: 16000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LayoutDashboard className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="w-6 h-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats ? `${Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% active` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <DollarSign className="w-6 h-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.payrollRuns || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <ClockIcon className="w-6 h-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
            <Progress value={stats?.attendanceRate || 0} className="w-full h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingLeaves || 0}</div>
            <p className="text-xs text-muted-foreground">Waiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell><Badge variant={item.status === 'approved' || item.status === 'completed' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                      <TableCell className="text-sm">{item.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payroll Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Trends</CardTitle>
            <CardDescription>This month's payroll vs previous</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="payroll" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="w-full h-16 flex flex-col items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Employees
          </Button>
          <Button className="w-full h-16 flex flex-col items-center gap-2">
            <DollarSign className="w-5 h-5" />
            New Payroll Run
          </Button>
          <Button className="w-full h-16 flex flex-col items-center gap-2">
            <Clock className="w-5 h-5" />
            Clock In/Out
          </Button>
          <Button className="w-full h-16 flex flex-col items-center gap-2" variant="outline">
            <TrendingUp className="w-5 h-5" />
            Salary Advance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

