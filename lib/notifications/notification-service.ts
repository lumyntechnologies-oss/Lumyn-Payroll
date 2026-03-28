import prisma from "@/lib/prisma";
import { NotificationType } from "@/lib/generated/prisma";

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
}

export class NotificationService {
  /**
   * Get notifications 
   */
  static async getNotifications(
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count(),
      ]);

      return {
        success: true,
        notifications,
        total,
        unread: notifications.filter((n) => !n.read).length,
      };
    } catch (error) {
      console.error("[Notification] Error fetching:", error);
      return {
        success: false,
        notifications: [],
        total: 0,
        unread: 0,
      };
    }
  }

  /**
   * Create new notification
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          read: false,
        },
      });

      console.log("[Notification] Created:", data.title);
      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error("[Notification] Error creating:", error);
      return {
        success: false,
        message: "Failed to create notification",
      };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      return {
        success: true,
        message: "Notification marked as read",
      };
    } catch (error) {
      console.error("[Notification] Error marking as read:", error);
      return {
        success: false,
        message: "Failed to mark as read",
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    try {
      const result = await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });

      return {
        success: true,
        markedCount: result.count,
      };
    } catch (error) {
      console.error("[Notification] Error marking all as read:", error);
      return {
        success: false,
        message: "Failed to mark notifications as read",
      };
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string) {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return {
        success: true,
        message: "Notification deleted",
      };
    } catch (error) {
      console.error("[Notification] Error deleting:", error);
      return {
        success: false,
        message: "Failed to delete notification",
      };
    }
  }
}

export const notificationService = NotificationService;

