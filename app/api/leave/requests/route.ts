import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, paginate } from "@/lib/api-helpers";
import { RequestStatus } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const status = searchParams.get("status") as RequestStatus | null;
    const employeeId = searchParams.get("employeeId");
    const { take, skip } = paginate(page, limit);

    const where = {
      ...(status ? { status } : {}),
      ...(employeeId ? { employeeId } : {}),
    };

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
          leaveType: true,
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return successResponse({ requests, pagination: { page, limit: take, total } });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch leave requests");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Add leave request schema in lib/validations/leave.ts
    const { employeeId, leaveTypeId, startDate, endDate, reason } = body;
    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return errorResponse("Missing required fields: employeeId, leaveTypeId, startDate, endDate", 400);
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const days = Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: sDate,
        endDate: eDate,
        days,
        reason,
        status: "PENDING",
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        leaveType: true,
      },
    });
    return successResponse(request, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create leave request");
  }
}
