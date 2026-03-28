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

    // Check if user has permission to reject
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
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewNote: reviewNote || "",
      },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Leave request rejected",
    });
  } catch (error) {
    console.error("[Leave Rejection] Error:", error);
    return NextResponse.json(
      { error: "Failed to reject leave request" },
      { status: 500 }
    );
  }
}
