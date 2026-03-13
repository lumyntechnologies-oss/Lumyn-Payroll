import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    const balances = await prisma.leaveBalance.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        year,
      },
      include: { leaveType: true, employee: { select: { id: true, firstName: true, lastName: true } } },
    });
    return successResponse(balances);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch leave balances");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const leaveType = await prisma.leaveType.findUnique({ where: { id: body.leaveTypeId } });
    if (!leaveType) return errorResponse("Leave type not found", 404);

    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: body.employeeId,
          leaveTypeId: body.leaveTypeId,
          year: body.year ?? new Date().getFullYear(),
        },
      },
      update: { total: body.total ?? leaveType.totalDays, remaining: body.remaining ?? leaveType.totalDays },
      create: {
        employeeId: body.employeeId,
        leaveTypeId: body.leaveTypeId,
        year: body.year ?? new Date().getFullYear(),
        total: body.total ?? leaveType.totalDays,
        used: 0,
        remaining: body.total ?? leaveType.totalDays,
      },
    });
    return successResponse(balance, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create leave balance");
  }
}
