"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, XCircle } from "lucide-react";

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("requests");

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [reqRes, balRes] = await Promise.all([
        fetch("/api/leave/requests"),
        fetch("/api/leave/balance"),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (balRes.ok) setBalances(await balRes.json());
    } catch (error) {
      console.error("Failed to fetch leave data:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string) => {
    try {
      await fetch(`/api/leave/requests/${id}/approve`, { method: "POST" });
      fetchLeaveData();
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      await fetch(`/api/leave/requests/${id}/reject`, { method: "POST" });
      fetchLeaveData();
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "secondary" as const,
      APPROVED: "default" as const,
      REJECTED: "destructive" as const,
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading leave data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Calendar className="w-8 h-8" />
          Leave Management
        </h1>
        <p className="text-muted-foreground">Manage leave requests and balances</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="requests">Requests ({requests.filter(r => r.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.employeeName}</TableCell>
                      <TableCell>{req.leaveType}</TableCell>
                      <TableCell>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{req.days}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        {req.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => approveRequest(req.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectRequest(req.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No leave requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balances.map((balance) => (
              <Card key={balance.leaveType}>
                <CardHeader>
                  <CardTitle>{balance.leaveType}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">{balance.remaining}</div>
                  <p className="text-muted-foreground">
                    Used: {balance.used} / {balance.total} days
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round((balance.remaining / balance.total) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

