import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Get user's employee record if no employeeId provided
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

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: targetEmployeeId,
        year,
      },
      include: {
        leaveType: true,
      },
      orderBy: {
        leaveType: { name: "asc" },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        employeeId: targetEmployeeId,
        year,
        balances,
      },
    });
  } catch (error) {
    console.error("[Leave Balance] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave balance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SUPER_ADMIN or HR_ADMIN can create balances
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !["SUPER_ADMIN", "HR_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { employeeId, leaveTypeId, year, total } = await request.json();

    // Check if balance already exists
    const existing = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveTypeId,
        year,
      },
    });

    if (existing) {
      // Update existing balance
      const updated = await prisma.leaveBalance.update({
        where: { id: existing.id },
        data: {
          total,
          remaining: total - existing.used,
        },
        include: { leaveType: true },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Leave balance updated",
      });
    }

    // Create new balance
    const balance = await prisma.leaveBalance.create({
      data: {
        employeeId,
        leaveTypeId,
        year,
        total,
        remaining: total,
      },
      include: { leaveType: true },
    });

    return NextResponse.json({
      success: true,
      data: balance,
      message: "Leave balance created",
    }, { status: 201 });
  } catch (error) {
    console.error("[Leave Balance] Error:", error);
    return NextResponse.json(
      { error: "Failed to manage leave balance" },
      { status: 500 }
    );
  }
}
