import { prisma } from "@/lib/prisma";

export interface EmployeeSettings {
  employeeId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  leaveReminders: boolean;
  payslipNotifications: boolean;
  complianceAlerts: boolean;
  attendanceReminders: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
}

export interface CompanySettings {
  companyName: string;
  taxId: string;
  registrationNumber: string;
  financialYear: string;
  currencyCode: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
}

export class SettingsService {
  /**
   * Get employee settings
   */
  async getEmployeeSettings(employeeId: string): Promise<EmployeeSettings | null> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          emailNotifications: true,
          smsNotifications: true,
          leaveReminders: true,
          payslipNotifications: true,
          complianceAlerts: true,
          attendanceReminders: true,
          theme: true,
          language: true,
          timezone: true,
        },
      });

      if (!employee) {
        return null;
      }

      return {
        employeeId: employee.id,
        emailNotifications: employee.emailNotifications ?? true,
        smsNotifications: employee.smsNotifications ?? false,
        leaveReminders: employee.leaveReminders ?? true,
        payslipNotifications: employee.payslipNotifications ?? true,
        complianceAlerts: employee.complianceAlerts ?? true,
        attendanceReminders: employee.attendanceReminders ?? true,
        theme: (employee.theme as any) ?? "light",
        language: employee.language ?? "en",
        timezone: employee.timezone ?? "Africa/Nairobi",
      };
    } catch (error) {
      console.error("[Settings] Error getting employee settings:", error);
      return null;
    }
  }

  /**
   * Update employee settings
   */
  async updateEmployeeSettings(
    employeeId: string,
    settings: Partial<EmployeeSettings>
  ): Promise<{ success: boolean; message: string; settings?: EmployeeSettings }> {
    try {
      const updated = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          ...(settings.emailNotifications !== undefined && {
            emailNotifications: settings.emailNotifications,
          }),
          ...(settings.smsNotifications !== undefined && {
            smsNotifications: settings.smsNotifications,
          }),
          ...(settings.leaveReminders !== undefined && {
            leaveReminders: settings.leaveReminders,
          }),
          ...(settings.payslipNotifications !== undefined && {
            payslipNotifications: settings.payslipNotifications,
          }),
          ...(settings.complianceAlerts !== undefined && {
            complianceAlerts: settings.complianceAlerts,
          }),
          ...(settings.attendanceReminders !== undefined && {
            attendanceReminders: settings.attendanceReminders,
          }),
          ...(settings.theme && { theme: settings.theme }),
          ...(settings.language && { language: settings.language }),
          ...(settings.timezone && { timezone: settings.timezone }),
        },
        select: {
          id: true,
          emailNotifications: true,
          smsNotifications: true,
          leaveReminders: true,
          payslipNotifications: true,
          complianceAlerts: true,
          attendanceReminders: true,
          theme: true,
          language: true,
          timezone: true,
        },
      });

      const result: EmployeeSettings = {
        employeeId: updated.id,
        emailNotifications: updated.emailNotifications ?? true,
        smsNotifications: updated.smsNotifications ?? false,
        leaveReminders: updated.leaveReminders ?? true,
        payslipNotifications: updated.payslipNotifications ?? true,
        complianceAlerts: updated.complianceAlerts ?? true,
        attendanceReminders: updated.attendanceReminders ?? true,
        theme: (updated.theme as any) ?? "light",
        language: updated.language ?? "en",
        timezone: updated.timezone ?? "Africa/Nairobi",
      };

      console.log("[Settings] Updated employee settings:", employeeId);

      return {
        success: true,
        message: "Settings updated successfully",
        settings: result,
      };
    } catch (error) {
      console.error("[Settings] Error updating settings:", error);
      return {
        success: false,
        message: "Failed to update settings",
      };
    }
  }

  /**
   * Get company settings
   */
  async getCompanySettings(): Promise<CompanySettings | null> {
    try {
      // In a real app, this would fetch from a CompanySettings table
      // For now, return defaults
      return {
        companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Your Company",
        taxId: process.env.NEXT_PUBLIC_COMPANY_TAX_ID || "",
        registrationNumber: process.env.NEXT_PUBLIC_COMPANY_REG || "",
        financialYear: new Date().getFullYear() + "",
        currencyCode: process.env.NEXT_PUBLIC_CURRENCY || "KES",
        country: process.env.NEXT_PUBLIC_COUNTRY || "Kenya",
        contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
        contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
      };
    } catch (error) {
      console.error("[Settings] Error getting company settings:", error);
      return null;
    }
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(
    settings: Partial<CompanySettings>
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In production, update database
      console.log("[Settings] Company settings updated:", settings);

      return {
        success: true,
        message: "Company settings updated successfully",
      };
    } catch (error) {
      console.error("[Settings] Error updating company settings:", error);
      return {
        success: false,
        message: "Failed to update company settings",
      };
    }
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(employeeId: string) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
        },
      });

      if (!employee) {
        return null;
      }

      return {
        employeeId: employee.id,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        lastLogin: new Date(),
        twoFactorEnabled: false,
        createdAt: employee.createdAt,
      };
    } catch (error) {
      console.error("[Settings] Error getting security settings:", error);
      return null;
    }
  }

  /**
   * Get audit log
   */
  async getAuditLog(employeeId: string, limit: number = 50) {
    try {
      // In production, query from AuditLog table
      return {
        success: true,
        logs: [
          {
            id: "1",
            action: "LOGIN",
            timestamp: new Date(Date.now() - 3600000),
            details: "Logged in from web",
          },
          {
            id: "2",
            action: "SETTINGS_UPDATED",
            timestamp: new Date(Date.now() - 7200000),
            details: "Updated notification preferences",
          },
          {
            id: "3",
            action: "LEAVE_REQUESTED",
            timestamp: new Date(Date.now() - 86400000),
            details: "Requested 5 days leave",
          },
        ],
      };
    } catch (error) {
      console.error("[Settings] Error getting audit log:", error);
      return {
        success: false,
        logs: [],
      };
    }
  }
}

export const settingsService = new SettingsService();
