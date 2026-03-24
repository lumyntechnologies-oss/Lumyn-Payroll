"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewNote?: string;
  reviewedAt?: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  leaveType: {
    id: string;
    name: string;
  };
}

interface LeaveBalance {
  id: string;
  total: number;
  used: number;
  remaining: number;
  year: number;
  leaveType: {
    name: string;
  };
}

interface LeaveType {
  id: string;
  name: string;
  totalDays: number;
  description?: string;
}

export default function LeaveManagementPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<string>("");

  // Form state for new request
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const [requestsRes, balancesRes, typesRes] = await Promise.all([
        fetch(`/api/leave/requests?${params}`),
        fetch("/api/leave/balance"),
        fetch("/api/leave/types"),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.data?.requests || []);
      }

      if (balancesRes.ok) {
        const data = await balancesRes.json();
        setBalances(data.data?.balances || []);
      }

      if (typesRes.ok) {
        const data = await typesRes.json();
        setLeaveTypes(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch leave data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/leave/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowNewRequest(false);
        setFormData({
          leaveTypeId: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to submit leave request:", error);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setApprovingId(requestId);
      const res = await fetch(`/api/leave/requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNote }),
      });

      if (res.ok) {
        setReviewNote("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to approve leave:", error);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setRejectingId(requestId);
      const res = await fetch(`/api/leave/requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNote }),
      });

      if (res.ok) {
        setReviewNote("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to reject leave:", error);
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };

    const icons: Record<string, JSX.Element> = {
      PENDING: <Clock className="w-3 h-3" />,
      APPROVED: <CheckCircle className="w-3 h-3" />,
      REJECTED: <XCircle className="w-3 h-3" />,
    };

    return (
      <Badge variant={variants[status]} className="gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600">Manage leave requests and balances</p>
        </div>
        <Button onClick={() => setShowNewRequest(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* New Request Form */}
      {showNewRequest && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Submit New Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={formData.leaveTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, leaveTypeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.totalDays} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Leave reason"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Submit Request</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewRequest(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Balances ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No leave balances found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <div
                  key={balance.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <h3 className="font-semibold">{balance.leaveType.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Days:</span>
                      <span className="font-medium">{balance.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used:</span>
                      <span className="font-medium text-orange-600">
                        {balance.used}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-green-600">
                        {balance.remaining}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            balance.total > 0
                              ? (balance.remaining / balance.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
          (status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          )
        )}
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>View and manage all leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {request.employee.firstName} {request.employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.leaveType.name} - {request.days} days
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">From:</span>
                      <p className="font-medium">{formatDate(request.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">To:</span>
                      <p className="font-medium">{formatDate(request.endDate)}</p>
                    </div>
                  </div>

                  {request.reason && (
                    <div>
                      <span className="text-sm text-gray-600">Reason:</span>
                      <p className="text-sm">{request.reason}</p>
                    </div>
                  )}

                  {request.status === "PENDING" && (
                    <div className="space-y-2 pt-2 border-t">
                      <textarea
                        placeholder="Add review note (optional)"
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={approvingId === request.id}
                          className="gap-1"
                        >
                          {approvingId === request.id && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={rejectingId === request.id}
                          className="gap-1"
                        >
                          {rejectingId === request.id && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {request.reviewNote && (
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Reviewer Note:</span>
                      <p>{request.reviewNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
