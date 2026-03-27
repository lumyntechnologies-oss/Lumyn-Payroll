import prisma from "@/lib/prisma";

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

