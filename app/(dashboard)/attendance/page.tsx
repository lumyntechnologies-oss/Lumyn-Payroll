"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Play, Pause, Calendar, TrendingUp } from "lucide-react";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: string;
  overtime: number;
}

interface TodayStats {
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number;
}

export default function AttendancePage() {
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [statsRes, recordsRes] = await Promise.all([
        fetch("/api/attendance/today"),
        fetch("/api/attendance/history?limit=20"),
      ]);
      if (statsRes.ok) setTodayStats(await statsRes.json());
      if (recordsRes.ok) setRecentRecords(await recordsRes.json());
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async () => {
    try {
      await fetch("/api/attendance/clock-in", { method: "POST" });
      fetchAttendanceData();
    } catch (error) {
      console.error("Clock in failed:", error);
    }
  };

  const clockOut = async () => {
    try {
      await fetch("/api/attendance/clock-out", { method: "POST" });
      fetchAttendanceData();
    } catch (error) {
      console.error("Clock out failed:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'PRESENT' ? "default" : status === 'LATE' ? "secondary" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading attendance...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="w-8 h-8" />
            Attendance
          </h1>
          <p className="text-muted-foreground">Track employee attendance and overtime</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clockOut} variant="outline">
            <Pause className="w-4 h-4 mr-2" />
            Clock Out
          </Button>
          <Button onClick={clockIn}>
            <Play className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Today</CardTitle>
            <Calendar className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats ? `${todayStats.rate}%` : '--'}</div>
            <Progress value={todayStats?.rate || 0} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              {todayStats ? `${todayStats.present}/${todayStats.total} present` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.present || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats?.late || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{todayStats?.absent || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Overtime (hrs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.clockIn || '-'}</TableCell>
                  <TableCell>{record.clockOut || '-'}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{record.overtime.toFixed(1)}</TableCell>
                </TableRow>
              ))}
              {recentRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overtime Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overtime Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">12.5</div>
              <p className="text-muted-foreground">Total hours this week</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">KES 3,750</div>
              <p className="text-muted-foreground">Pending payout</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">+15%</div>
              <p className="text-muted-foreground">vs last month</p>
              <TrendingUp className="w-8 h-8 mx-auto text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

