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

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId: body.employeeId,
        leaveTypeId: body.leaveTypeId,
        startDate,
        endDate,
        days,
        reason: body.reason,
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
