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
  Bell,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Clock,
  Loader2,
  Filter,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
  data?: Record<string, any>;
}

type NotificationFilter = "all" | "unread" | "read";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications/list?limit=50");

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      LEAVE_APPROVED: <CheckCircle className="w-5 h-5 text-green-600" />,
      LEAVE_REJECTED: <AlertCircle className="w-5 h-5 text-red-600" />,
      PAYSLIP_AVAILABLE: <DollarSign className="w-5 h-5 text-green-600" />,
      COMPLIANCE_DUE: <AlertCircle className="w-5 h-5 text-orange-600" />,
      ATTENDANCE_ALERT: <Clock className="w-5 h-5 text-orange-600" />,
      DOCUMENT_RECEIVED: <FileText className="w-5 h-5 text-blue-600" />,
      SALARY_PAID: <DollarSign className="w-5 h-5 text-green-600" />,
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-600" />;
  };

  const getNotificationColor = (type: string): string => {
    const colors: Record<string, string> = {
      LEAVE_APPROVED: "bg-green-50 border-green-200",
      LEAVE_REJECTED: "bg-red-50 border-red-200",
      PAYSLIP_AVAILABLE: "bg-green-50 border-green-200",
      COMPLIANCE_DUE: "bg-orange-50 border-orange-200",
      ATTENDANCE_ALERT: "bg-orange-50 border-orange-200",
      DOCUMENT_RECEIVED: "bg-blue-50 border-blue-200",
      SALARY_PAID: "bg-green-50 border-green-200",
    };
    return colors[type] || "bg-gray-50 border-gray-200";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">Stay updated with important alerts</p>
        </div>
        <Bell className="w-8 h-8 text-primary" />
      </div>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">You have</p>
                <p className="text-2xl font-bold text-blue-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
              <Button onClick={() => setFilter("unread")}>View Unread</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          All
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
        >
          Read
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "all" && "All Notifications"}
            {filter === "unread" && "Unread Notifications"}
            {filter === "read" && "Read Notifications"}
          </CardTitle>
          <CardDescription>
            {filteredNotifications.length} notification{
              filteredNotifications.length !== 1 ? "s" : ""
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-screen overflow-y-auto">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-all ${
                    !notification.read
                      ? getNotificationColor(notification.type)
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              !notification.read
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>

                          {/* Data Display */}
                          {notification.data && (
                            <div className="mt-3 space-y-1 text-sm">
                              {Object.entries(notification.data).map(
                                ([key, value]) => (
                                  <p key={key} className="text-gray-600">
                                    <span className="font-medium">{key}:</span>{" "}
                                    {String(value)}
                                  </p>
                                )
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>

                        {/* Badge */}
                        <Badge
                          variant={notification.read ? "secondary" : "default"}
                          className="ml-2"
                        >
                          {notification.read ? "Read" : "New"}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleMarkAsRead(notification.id)
                            }
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Leave Approved</p>
                <p className="text-gray-600">Your leave request approved</p>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Leave Rejected</p>
                <p className="text-gray-600">Your leave request rejected</p>
              </div>
            </div>
            <div className="flex gap-2">
              <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Salary Paid</p>
                <p className="text-gray-600">Your salary has been processed</p>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Compliance Due</p>
                <p className="text-gray-600">Compliance deadline approaching</p>
              </div>
            </div>
            <div className="flex gap-2">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Document Received</p>
                <p className="text-gray-600">New document uploaded</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Attendance Alert</p>
                <p className="text-gray-600">Attendance issue detected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
