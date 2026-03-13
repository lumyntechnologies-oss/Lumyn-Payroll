import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { employees: true } } },
    });
    return successResponse(departments);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch departments");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dept = await prisma.department.create({
      data: { name: body.name, description: body.description },
    });
    return successResponse(dept, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create department");
  }
}
