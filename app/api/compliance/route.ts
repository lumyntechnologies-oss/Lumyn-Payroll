import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ComplianceStatus, ComplianceType } from "@/lib/generated/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

    const records = await prisma.complianceRecord.findMany({
      where: {
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { type: "asc" }],
    });
    return successResponse(records);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch compliance records");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await prisma.complianceRecord.upsert({
      where: {
        type_month_year: {
          type: body.type as ComplianceType,
          month: Number(body.month),
          year: Number(body.year),
        },
      },
      update: {
        amount: Number(body.amount),
        dueDate: new Date(body.dueDate),
        status: body.status,
        filedDate: body.filedDate ? new Date(body.filedDate) : undefined,
        reference: body.reference,
      },
      create: {
        type: body.type as ComplianceType,
        month: Number(body.month),
        year: Number(body.year),
        amount: Number(body.amount),
        dueDate: new Date(body.dueDate),
        status: (body.status ?? "PENDING") as ComplianceStatus,
        reference: body.reference,
      },
    });
    return successResponse(record, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create compliance record");
  }
}
