import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { attendanceService } from "@/lib/attendance/attendance-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");

    let targetEmployeeId = employeeId;

    if (!targetEmployeeId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const employee = await prisma.employee.findFirst({
        where: { email: user.email },
      });

      if (!employee) {
        return NextResponse.json(
          { error: "Employee profile not found" },
          { status: 404 }
        );
      }

      targetEmployeeId = employee.id;
    }

    // Default to current month if dates not provided
    const today = new Date();
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const result = await attendanceService.getAttendance(
      targetEmployeeId,
      startDate,
      endDate
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Attendance History] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance history" },
      { status: 500 }
    );
  }
}
