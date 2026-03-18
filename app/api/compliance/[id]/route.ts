import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const record = await prisma.complianceRecord.findUnique({ where: { id } });
    if (!record) return notFoundResponse("Compliance record");
    return successResponse(record);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch compliance record");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const record = await prisma.complianceRecord.update({
      where: { id },
      data: {
        status: body.status,
        filedDate: body.filedDate ? new Date(body.filedDate) : undefined,
        reference: body.reference,
      },
    });
    return successResponse(record);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update compliance record");
  }
}
