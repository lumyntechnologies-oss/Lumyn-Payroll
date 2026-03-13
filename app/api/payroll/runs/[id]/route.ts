import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        entries: {
          include: { employee: { include: { department: { select: { name: true } } } } },
        },
      },
    });
    if (!run) return notFoundResponse("Payroll run");
    return successResponse(run);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch payroll run");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const run = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: body.status,
        approvedAt: body.status === "APPROVED" ? new Date() : undefined,
        disbursedAt: body.status === "DISBURSED" ? new Date() : undefined,
      },
    });
    return successResponse(run);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update payroll run");
  }
}
