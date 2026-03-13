import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const advance = await prisma.salaryAdvance.update({
      where: { id },
      data: {
        status: body.status,
        schedule: body.schedule,
        reviewedAt: new Date(),
      },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
    return successResponse(advance);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update advance");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.salaryAdvance.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error(error);
    return notFoundResponse("Advance");
  }
}
