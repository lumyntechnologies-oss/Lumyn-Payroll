"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<string, React.ReactNode> = {
  WARNING: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  SUCCESS: <CheckCircle className="w-5 h-5 text-green-500" />,
  INFO: <Info className="w-5 h-5 text-blue-500" />,
  ERROR: <AlertTriangle className="w-5 h-5 text-red-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications?limit=50");
    const json = await res.json();
    if (json.success) {
      setNotifications(json.data.notifications);
      setUnreadCount(json.data.unreadCount);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifications();
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">System alerts and updates</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              All Notifications
            </CardTitle>
            {unreadCount > 0 && <Badge variant="danger">{unreadCount} unread</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No notifications</div>
          ) : notifications.map(notif => (
            <div key={notif.id} onClick={() => !notif.read && markRead(notif.id)}
              className={`flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer ${notif.read ? "bg-slate-50 hover:bg-slate-100" : "bg-blue-50 border border-blue-100 hover:bg-blue-100"}`}>
              <div className="shrink-0 mt-0.5">{ICONS[notif.type] ?? ICONS.INFO}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${notif.read ? "text-slate-700" : "text-slate-900"}`}>{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
