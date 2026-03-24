import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export type NotificationType =
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "PAYSLIP_AVAILABLE"
  | "COMPLIANCE_DUE"
  | "ATTENDANCE_ALERT"
  | "DOCUMENT_RECEIVED"
  | "SALARY_PAID";

export interface NotificationPayload {
  type: NotificationType;
  employeeId: string;
  subject: string;
  message: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendSMS?: boolean;
}

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize email transporter (using Gmail as example)
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * Send notification (create record and dispatch)
   */
  async sendNotification(payload: NotificationPayload): Promise<{
    success: boolean;
    message: string;
    notificationId?: string;
  }> {
    try {
      // Get employee
      const employee = await prisma.employee.findUnique({
        where: { id: payload.employeeId },
      });

      if (!employee) {
        return {
          success: false,
          message: "Employee not found",
        };
      }

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          employeeId: payload.employeeId,
          type: payload.type,
          subject: payload.subject,
          message: payload.message,
          data: payload.data,
          read: false,
        },
      });

      // Send email if requested
      if (payload.sendEmail && employee.email) {
        await this.sendEmail(
          employee.email,
          employee.firstName,
          payload.subject,
          payload.message,
          payload.data
        );
      }

      // Send SMS if requested
      if (payload.sendSMS && employee.phoneNumber) {
        await this.sendSMS(
          employee.phoneNumber,
          payload.message,
          payload.data
        );
      }

      console.log("[Notification] Sent:", {
        id: notification.id,
        type: payload.type,
        employeeId: payload.employeeId,
      });

      return {
        success: true,
        message: "Notification sent successfully",
        notificationId: notification.id,
      };
    } catch (error) {
      console.error("[Notification] Error:", error);
      return {
        success: false,
        message: "Failed to send notification",
      };
    }
  }

  /**
   * Send email
   */
  private async sendEmail(
    to: string,
    name: string,
    subject: string,
    message: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    if (!this.transporter) {
      console.warn("[Email] SMTP not configured");
      return false;
    }

    try {
      const htmlContent = this.generateEmailHTML(name, subject, message, data);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@company.com",
        to,
        subject,
        html: htmlContent,
      });

      console.log("[Email] Sent to:", to);
      return true;
    } catch (error) {
      console.error("[Email] Error sending:", error);
      return false;
    }
  }

  /**
   * Send SMS
   */
  private async sendSMS(
    phoneNumber: string,
    message: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Using Twilio as example SMS provider
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.warn("[SMS] Twilio not configured");
        return false;
      }

      // Build SMS message
      const smsText = this.buildSMSMessage(message, data);

      // Example implementation with Twilio (would need twilio package)
      // const twilio = require("twilio");
      // const client = twilio(
      //   process.env.TWILIO_ACCOUNT_SID,
      //   process.env.TWILIO_AUTH_TOKEN
      // );
      // await client.messages.create({
      //   body: smsText,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber,
      // });

      console.log("[SMS] Would send to:", phoneNumber);
      return true;
    } catch (error) {
      console.error("[SMS] Error sending:", error);
      return false;
    }
  }

  /**
   * Generate email HTML
   */
  private generateEmailHTML(
    name: string,
    subject: string,
    message: string,
    data?: Record<string, any>
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background-color: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${subject}</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>${message}</p>
              ${data ? this.formatEmailData(data) : ""}
              <p>If you have any questions, please contact our HR team.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Format email data
   */
  private formatEmailData(data: Record<string, any>): string {
    let html = "<table style='width: 100%; margin: 15px 0;'>";
    for (const [key, value] of Object.entries(data)) {
      html += `
        <tr>
          <td style='padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;'>${this.formatKey(key)}</td>
          <td style='padding: 8px; border-bottom: 1px solid #e5e7eb;'>${value}</td>
        </tr>
      `;
    }
    html += "</table>";
    return html;
  }

  /**
   * Build SMS message
   */
  private buildSMSMessage(
    message: string,
    data?: Record<string, any>
  ): string {
    let sms = message;
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        sms += `\n${this.formatKey(key)}: ${value}`;
      }
    }
    return sms;
  }

  /**
   * Format key (camelCase to Title Case)
   */
  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  /**
   * Get notifications for employee
   */
  async getNotifications(
    employeeId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { employeeId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({ where: { employeeId } }),
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
  async markAsRead(notificationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true, readAt: new Date() },
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
  async deleteNotification(notificationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
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

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    employeeIds: string[],
    payload: Omit<NotificationPayload, "employeeId">
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const employeeId of employeeIds) {
      const result = await this.sendNotification({
        ...payload,
        employeeId,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log("[Notification] Bulk send:", { sent, failed });

    return { success: failed === 0, sent, failed };
  }
}

export const notificationService = new NotificationService();
