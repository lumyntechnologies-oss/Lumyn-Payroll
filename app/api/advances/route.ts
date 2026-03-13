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

    const [advances, total] = await Promise.all([
      prisma.salaryAdvance.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
        },
      }),
      prisma.salaryAdvance.count({ where }),
    ]);

    const [totalIssued, pendingCount] = await Promise.all([
      prisma.salaryAdvance.aggregate({
        where: { status: RequestStatus.APPROVED },
        _sum: { amount: true },
      }),
      prisma.salaryAdvance.count({ where: { status: RequestStatus.PENDING } }),
    ]);

    return successResponse({
      advances,
      pagination: { page, limit: take, total },
      summary: {
        totalIssued: totalIssued._sum.amount ?? 0,
        pendingCount,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch advances");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const advance = await prisma.salaryAdvance.create({
      data: {
        employeeId: body.employeeId,
        amount: Number(body.amount),
        reason: body.reason,
        schedule: body.schedule,
        status: "PENDING",
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
    return successResponse(advance, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create advance request");
  }
}
