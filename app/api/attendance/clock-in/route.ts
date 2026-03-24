import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { attendanceService } from "@/lib/attendance/attendance-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const result = await attendanceService.clockIn(employee.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Clock In] Error:", error);
    return NextResponse.json(
      { error: "Failed to clock in" },
      { status: 500 }
    );
  }
}
