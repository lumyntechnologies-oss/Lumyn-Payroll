import cron from 'node-cron';
import { prisma } from "@/lib/prisma";
import { ComplianceType, ComplianceStatus } from "@/lib/generated/prisma";
import { notificationService } from '@/lib/notifications/notification-service';

export class ComplianceReminderService {
  /**
   * Schedule daily compliance reminders at 8AM
   */
  static scheduleDailyReminders() {
    // Run daily at 8AM EAT
    cron.schedule('0 8 * * *', async () => {
      console.log('[ComplianceReminder] Running daily check...');
      await this.checkOverdueCompliance();
      await this.checkDueSoonCompliance();
    }, {
      timezone: "Africa/Nairobi"
    });
    
    console.log('[ComplianceReminder] Daily reminders scheduled');
  }

  /**
   * Check for overdue compliance and notify
   */
  static async checkOverdueCompliance() {
    const today = new Date();

    const overdueRecords = await prisma.complianceRecord.findMany({
      where: {
        status: {
          in: ['PENDING', 'OVERDUE'],
        },
        dueDate: {
          lt: today,
        },
      },
    });


    for (const record of overdueRecords) {
      // Mark as overdue if not already
      if (record.status !== 'OVERDUE') {
        await prisma.complianceRecord.update({
          where: { id: record.id },
          data: { status: 'OVERDUE' as ComplianceStatus },
        });
      }

      // Send notification to finance
      await notificationService.createNotification({
        title: `${record.type} Filing OVERDUE`,
        message: `${record.type} for ${record.month}/${record.year} (KES ${record.amount.toLocaleString()}) is overdue. Penalty risk: KES ${Math.round(record.amount * 0.05)}`,
        type: 'ERROR',
      });

    }
  }

  /**
   * Check for compliance due in next 7 days
   */
  static async checkDueSoonCompliance() {
    const today = new Date();
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueSoonRecords = await prisma.complianceRecord.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: next7Days,
        },
      },
    });

    for (const record of dueSoonRecords) {
      const daysLeft = Math.ceil((record.dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      
      await notificationService.createNotification({
        title: `${record.type} Due Soon`,
        message: `${record.type} for ${record.month}/${record.year} (KES ${record.amount.toLocaleString()}) due in ${daysLeft} days`,
        type: daysLeft <= 3 ? 'WARNING' : 'INFO',
      });

    }
  }
}

// Start scheduler (call in dev server startup)
ComplianceReminderService.scheduleDailyReminders();

export const complianceReminderService = ComplianceReminderService;

