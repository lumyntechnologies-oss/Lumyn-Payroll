import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  try {
    const types = await prisma.leaveType.findMany({ orderBy: { name: "asc" } });
    return successResponse(types);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch leave types");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = await prisma.leaveType.create({
      data: { name: body.name, totalDays: Number(body.totalDays), description: body.description },
    });
    return successResponse(type, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create leave type");
  }
}
