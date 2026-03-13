import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const request = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true, leaveType: true },
    });
    if (!request) return notFoundResponse("Leave request");
    return successResponse(request);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch leave request");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reviewNote } = body;

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: { status, reviewNote, reviewedAt: new Date() },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        leaveType: true,
      },
    });

    if (status === "APPROVED") {
      const currentYear = new Date().getFullYear();
      const balance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year: currentYear,
          },
        },
      });
      if (balance) {
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: { increment: request.days },
            remaining: { decrement: request.days },
          },
        });
      }
    }

    return successResponse(request);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update leave request");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.leaveRequest.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to delete leave request");
  }
}
