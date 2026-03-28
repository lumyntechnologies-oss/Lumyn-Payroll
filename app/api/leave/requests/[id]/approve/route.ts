import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to approve
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !["HR_ADMIN", "MANAGER", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { reviewNote } = await request.json();
    const { id: leaveRequest } = await params;

    // Update leave request
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequest },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewNote: reviewNote || "",
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    // Update leave balance
    const balanceKey = {
      employeeId: updated.employeeId,
      leaveTypeId: updated.leaveTypeId,
      year: new Date().getFullYear(),
    };

    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: balanceKey,
      },
    });

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: balance.used + updated.days,
          remaining: balance.remaining - updated.days,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Leave request approved",
    });
  } catch (error) {
    console.error("[Leave Approval] Error:", error);
    return NextResponse.json(
      { error: "Failed to approve leave request" },
      { status: 500 }
    );
  }
}
