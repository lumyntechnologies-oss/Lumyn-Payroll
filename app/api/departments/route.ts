import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, validationError } from "@/lib/api-helpers";
import { createDepartmentSchema } from "@/lib/validations/departments";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { employees: true } } },
    });
    return successResponse(departments);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return errorResponse("Failed to fetch departments");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = createDepartmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;

    // Check for duplicate
    const existing = await prisma.department.findUnique({
      where: { name },
    });

    if (existing) {
      return validationError("Department with this name already exists", "name");
    }

    const dept = await prisma.department.create({
      data: {
        name,
        description: description || null,
      },
      include: { _count: { select: { employees: true } } },
    });

    return successResponse(dept, 201);
  } catch (error) {
    console.error("Department creation error:", error);
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON in request body", 400);
    }
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create department",
      500
    );
  }
}
