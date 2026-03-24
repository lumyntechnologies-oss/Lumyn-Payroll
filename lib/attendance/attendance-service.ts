import { prisma } from "@/lib/prisma";

export interface AttendanceData {
  employeeId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
}

export class AttendanceService {
  /**
   * Record clock in for employee
   */
  async clockIn(employeeId: string, timestamp?: Date): Promise<{
    success: boolean;
    message: string;
    clockInTime?: Date;
  }> {
    try {
      const date = new Date();
      const todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // Check if attendance record exists for today
      let attendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,
            date: todayDate,
          },
        },
      });

      if (attendance?.clockIn) {
        return {
          success: false,
          message: "Already clocked in today",
          clockInTime: attendance.clockIn,
        };
      }

      if (!attendance) {
        // Create new attendance record
        attendance = await prisma.attendance.create({
          data: {
            employeeId,
            date: todayDate,
            clockIn: timestamp || date,
            status: "PRESENT",
          },
        });
      } else {
        // Update existing record with clock in
        attendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            clockIn: timestamp || date,
            status: "PRESENT",
          },
        });
      }

      console.log("[Attendance] Clock in:", {
        employeeId,
        clockInTime: attendance.clockIn,
      });

      return {
        success: true,
        message: "Clock in successful",
        clockInTime: attendance.clockIn,
      };
    } catch (error) {
      console.error("[Attendance] Clock in error:", error);
      return {
        success: false,
        message: "Failed to clock in",
      };
    }
  }

  /**
   * Record clock out for employee
   */
  async clockOut(employeeId: string, timestamp?: Date): Promise<{
    success: boolean;
    message: string;
    clockOutTime?: Date;
    overtime?: number;
  }> {
    try {
      const date = new Date();
      const todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const attendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,
            date: todayDate,
          },
        },
      });

      if (!attendance) {
        return {
          success: false,
          message: "No clock in record found for today",
        };
      }

      if (!attendance.clockIn) {
        return {
          success: false,
          message: "Please clock in first",
        };
      }

      if (attendance.clockOut) {
        return {
          success: false,
          message: "Already clocked out today",
          clockOutTime: attendance.clockOut,
        };
      }

      const clockOutTime = timestamp || date;
      const workDuration = (clockOutTime.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60); // in hours

      // Calculate overtime (assuming 8-hour workday)
      const standardHours = 8;
      const overtime = Math.max(0, workDuration - standardHours);

      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOut: clockOutTime,
          overtime: overtime > 0 ? overtime : 0,
        },
      });

      console.log("[Attendance] Clock out:", {
        employeeId,
        clockOutTime,
        overtime,
      });

      return {
        success: true,
        message: "Clock out successful",
        clockOutTime: updated.clockOut || undefined,
        overtime,
      };
    } catch (error) {
      console.error("[Attendance] Clock out error:", error);
      return {
        success: false,
        message: "Failed to clock out",
      };
    }
  }

  /**
   * Mark attendance for a specific date
   */
  async markAttendance(
    employeeId: string,
    date: Date,
    status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE",
    clockIn?: Date,
    clockOut?: Date
  ): Promise<{ success: boolean; message: string }> {
    try {
      const attendanceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const existing = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,
            date: attendanceDate,
          },
        },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status,
            clockIn: clockIn || existing.clockIn,
            clockOut: clockOut || existing.clockOut,
          },
        });
      } else {
        await prisma.attendance.create({
          data: {
            employeeId,
            date: attendanceDate,
            status,
            clockIn,
            clockOut,
          },
        });
      }

      console.log("[Attendance] Marked:", {
        employeeId,
        date: attendanceDate,
        status,
      });

      return {
        success: true,
        message: `Attendance marked as ${status}`,
      };
    } catch (error) {
      console.error("[Attendance] Mark error:", error);
      return {
        success: false,
        message: "Failed to mark attendance",
      };
    }
  }

  /**
   * Get attendance for employee
   */
  async getAttendance(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const attendances = await prisma.attendance.findMany({
        where: {
          employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      });

      const summary = {
        total: attendances.length,
        present: attendances.filter((a) => a.status === "PRESENT").length,
        absent: attendances.filter((a) => a.status === "ABSENT").length,
        late: attendances.filter((a) => a.status === "LATE").length,
        halfDay: attendances.filter((a) => a.status === "HALF_DAY").length,
        onLeave: attendances.filter((a) => a.status === "ON_LEAVE").length,
        totalOvertimeHours: attendances.reduce((sum, a) => sum + a.overtime, 0),
      };

      return {
        success: true,
        attendances,
        summary,
      };
    } catch (error) {
      console.error("[Attendance] Get error:", error);
      return {
        success: false,
        attendances: [],
        summary: {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          onLeave: 0,
          totalOvertimeHours: 0,
        },
      };
    }
  }

  /**
   * Get attendance summary for date range
   */
  async getAttendanceSummary(
    startDate: Date,
    endDate: Date,
    departmentId?: string
  ) {
    try {
      const attendances = await prisma.attendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          ...(departmentId && {
            employee: { departmentId },
          }),
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              departmentId: true,
            },
          },
        },
      });

      const grouped = new Map<string, any>();

      for (const attendance of attendances) {
        const empId = attendance.employeeId;
        if (!grouped.has(empId)) {
          grouped.set(empId, {
            employee: attendance.employee,
            attendances: [],
            summary: {
              present: 0,
              absent: 0,
              late: 0,
              halfDay: 0,
              onLeave: 0,
              totalOvertime: 0,
            },
          });
        }

        const data = grouped.get(empId);
        data.attendances.push(attendance);

        switch (attendance.status) {
          case "PRESENT":
            data.summary.present++;
            break;
          case "ABSENT":
            data.summary.absent++;
            break;
          case "LATE":
            data.summary.late++;
            break;
          case "HALF_DAY":
            data.summary.halfDay++;
            break;
          case "ON_LEAVE":
            data.summary.onLeave++;
            break;
        }

        data.summary.totalOvertime += attendance.overtime;
      }

      return {
        success: true,
        data: Array.from(grouped.values()),
      };
    } catch (error) {
      console.error("[Attendance] Summary error:", error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get current day status for employee
   */
  async getTodayStatus(employeeId: string) {
    try {
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const attendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId,
            date: todayDate,
          },
        },
      });

      return {
        success: true,
        hasClockedIn: !!attendance?.clockIn,
        hasClockedOut: !!attendance?.clockOut,
        clockInTime: attendance?.clockIn,
        clockOutTime: attendance?.clockOut,
        status: attendance?.status || "NOT_MARKED",
        overtime: attendance?.overtime || 0,
      };
    } catch (error) {
      console.error("[Attendance] Today status error:", error);
      return {
        success: false,
        hasClockedIn: false,
        hasClockedOut: false,
        status: "ERROR",
      };
    }
  }
}

export const attendanceService = new AttendanceService();
