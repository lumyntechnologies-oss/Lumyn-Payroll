import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const record = await prisma.attendance.findUnique({
      where: { id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } } },
    });
    if (!record) return notFoundResponse("Attendance record");
    return successResponse(record);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch attendance record");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const record = await prisma.attendance.update({
      where: { id },
      data: {
        clockIn: body.clockIn ? new Date(body.clockIn) : undefined,
        clockOut: body.clockOut ? new Date(body.clockOut) : undefined,
        status: body.status,
        overtime: body.overtime,
      },
    });
    return successResponse(record);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update attendance");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.attendance.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error(error);
    return notFoundResponse("Attendance record");
  }
}
