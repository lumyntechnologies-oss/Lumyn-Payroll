import { prisma } from "@/lib/prisma";
import { ComplianceType, ComplianceStatus } from "@prisma/client";

export interface ComplianceData {
  type: ComplianceType;
  month: number;
  year: number;
  amount: number;
  dueDate: Date;
  reference?: string;
}

export class ComplianceService {
  /**
   * Create or update compliance record
   */
  async recordCompliance(data: ComplianceData): Promise<{
    success: boolean;
    message: string;
    record?: any;
  }> {
    try {
      const existing = await prisma.complianceRecord.findFirst({
        where: {
          type: data.type,
          month: data.month,
          year: data.year,
        },
      });

      let record;

      if (existing) {
        record = await prisma.complianceRecord.update({
          where: { id: existing.id },
          data: {
            amount: data.amount,
            dueDate: data.dueDate,
            reference: data.reference,
          },
        });
      } else {
        record = await prisma.complianceRecord.create({
          data: {
            type: data.type,
            month: data.month,
            year: data.year,
            amount: data.amount,
            dueDate: data.dueDate,
            reference: data.reference,
            status: "PENDING",
          },
        });
      }

      console.log("[Compliance] Recorded:", {
        type: data.type,
        month: data.month,
        year: data.year,
        amount: data.amount,
      });

      return {
        success: true,
        message: "Compliance record saved",
        record,
      };
    } catch (error) {
      console.error("[Compliance] Error recording:", error);
      return {
        success: false,
        message: "Failed to record compliance",
      };
    }
  }

  /**
   * Mark compliance as filed
   */
  async markAsFiledAsync(
    type: ComplianceType,
    month: number,
    year: number,
    reference?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const record = await prisma.complianceRecord.findFirst({
        where: { type, month, year },
      });

      if (!record) {
        return {
          success: false,
          message: "Compliance record not found",
        };
      }

      await prisma.complianceRecord.update({
        where: { id: record.id },
        data: {
          status: "FILED",
          filedDate: new Date(),
          reference: reference || record.reference,
        },
      });

      console.log("[Compliance] Marked as filed:", {
        type,
        month,
        year,
      });

      return {
        success: true,
        message: `${type} marked as filed`,
      };
    } catch (error) {
      console.error("[Compliance] Error filing:", error);
      return {
        success: false,
        message: "Failed to mark as filed",
      };
    }
  }

  /**
   * Get compliance status for month
   */
  async getMonthlyCompliance(month: number, year: number) {
    try {
      const records = await prisma.complianceRecord.findMany({
        where: { month, year },
        orderBy: { type: "asc" },
      });

      const summary = {
        month,
        year,
        totalAmount: 0,
        filedCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        records: records.map((r) => {
          if (r.status === "FILED") summary.filedCount++;
          if (r.status === "PENDING") summary.pendingCount++;
          if (r.status === "OVERDUE") summary.overdueCount++;
          summary.totalAmount += r.amount;

          return {
            id: r.id,
            type: r.type,
            amount: r.amount,
            dueDate: r.dueDate,
            filedDate: r.filedDate,
            status: r.status,
            reference: r.reference,
          };
        }),
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error("[Compliance] Error getting monthly:", error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get compliance alerts (overdue or due soon)
   */
  async getComplianceAlerts() {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const records = await prisma.complianceRecord.findMany({
        where: {
          OR: [
            {
              status: "PENDING",
              dueDate: {
                lte: today,
              },
            },
            {
              status: "PENDING",
              dueDate: {
                gte: today,
                lte: nextWeek,
              },
            },
            {
              status: "OVERDUE",
            },
          ],
        },
        orderBy: { dueDate: "asc" },
      });

      const alerts = records.map((r) => {
        const daysUntilDue = Math.ceil(
          (r.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: r.id,
          type: r.type,
          month: r.month,
          year: r.year,
          amount: r.amount,
          dueDate: r.dueDate,
          status: r.status,
          daysUntilDue,
          isOverdue: daysUntilDue < 0,
          isDueSoon: daysUntilDue >= 0 && daysUntilDue <= 7,
          severity:
            daysUntilDue < 0
              ? "critical"
              : daysUntilDue <= 3
                ? "warning"
                : "info",
        };
      });

      return {
        success: true,
        alerts,
        criticalCount: alerts.filter((a) => a.severity === "critical").length,
      };
    } catch (error) {
      console.error("[Compliance] Error getting alerts:", error);
      return {
        success: false,
        alerts: [],
        criticalCount: 0,
      };
    }
  }

  /**
   * Get compliance history
   */
  async getComplianceHistory(type?: ComplianceType, limit: number = 12) {
    try {
      const records = await prisma.complianceRecord.findMany({
        where: type ? { type } : {},
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return {
        success: true,
        records,
      };
    } catch (error) {
      console.error("[Compliance] Error getting history:", error);
      return {
        success: false,
        records: [],
      };
    }
  }

  /**
   * Generate annual compliance report
   */
  async getAnnualComplianceReport(year: number) {
    try {
      const records = await prisma.complianceRecord.findMany({
        where: { year },
        orderBy: [{ type: "asc" }, { month: "asc" }],
      });

      // Group by type
      const byType: Record<string, any> = {};

      for (const record of records) {
        if (!byType[record.type]) {
          byType[record.type] = {
            type: record.type,
            totalAmount: 0,
            filedCount: 0,
            pendingCount: 0,
            records: [],
          };
        }

        byType[record.type].totalAmount += record.amount;
        if (record.status === "FILED") byType[record.type].filedCount++;
        if (record.status === "PENDING") byType[record.type].pendingCount++;
        byType[record.type].records.push(record);
      }

      const summary = {
        year,
        complianceByType: Object.values(byType),
        totalAmount: Object.values(byType).reduce(
          (sum: number, t: any) => sum + t.totalAmount,
          0
        ),
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error("[Compliance] Error getting annual report:", error);
      return {
        success: false,
        data: null,
      };
    }
  }
}

export const complianceService = new ComplianceService();
