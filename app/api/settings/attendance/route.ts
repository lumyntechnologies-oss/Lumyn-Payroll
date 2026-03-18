import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let rule = await prisma.attendanceRule.findFirst();
    
    if (!rule) {
      rule = await prisma.attendanceRule.create({
        data: {
          workStartTime: "09:00",
          workEndTime: "17:00",
          lateThreshold: 15,
          absentThreshold: 30,
          overtimeMultiplier: 1.5,
          autoMarkAttendance: false,
        },
      });
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error("Attendance rule fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workStartTime,
      workEndTime,
      lateThreshold,
      absentThreshold,
      overtimeMultiplier,
      autoMarkAttendance,
    } = body;

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const errors: string[] = [];

    if (workStartTime && !timeRegex.test(workStartTime)) {
      errors.push("Work start time must be in HH:MM format");
    }
    if (workEndTime && !timeRegex.test(workEndTime)) {
      errors.push("Work end time must be in HH:MM format");
    }
    if (lateThreshold !== undefined && (isNaN(lateThreshold) || lateThreshold < 0 || lateThreshold > 480)) {
      errors.push("Late threshold must be between 0 and 480 minutes");
    }
    if (absentThreshold !== undefined && (isNaN(absentThreshold) || absentThreshold < 0)) {
      errors.push("Absent threshold must be a positive number");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    let rule = await prisma.attendanceRule.findFirst();

    if (rule) {
      rule = await prisma.attendanceRule.update({
        where: { id: rule.id },
        data: {
          workStartTime: workStartTime || rule.workStartTime,
          workEndTime: workEndTime || rule.workEndTime,
          lateThreshold: lateThreshold !== undefined ? lateThreshold : rule.lateThreshold,
          absentThreshold: absentThreshold !== undefined ? absentThreshold : rule.absentThreshold,
          overtimeMultiplier: overtimeMultiplier !== undefined ? overtimeMultiplier : rule.overtimeMultiplier,
          autoMarkAttendance: autoMarkAttendance !== undefined ? autoMarkAttendance : rule.autoMarkAttendance,
        },
      });
    } else {
      rule = await prisma.attendanceRule.create({
        data: {
          workStartTime: workStartTime || "09:00",
          workEndTime: workEndTime || "17:00",
          lateThreshold: lateThreshold ?? 15,
          absentThreshold: absentThreshold ?? 30,
          overtimeMultiplier: overtimeMultiplier ?? 1.5,
          autoMarkAttendance: autoMarkAttendance ?? false,
        },
      });
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error("Attendance rule update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update attendance rules" },
      { status: 500 }
    );
  }
}
