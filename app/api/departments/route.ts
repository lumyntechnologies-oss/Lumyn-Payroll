import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, validationError } from "@/lib/api-helpers";

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

    // Validation
    if (!body.name || typeof body.name !== "string") {
      return validationError("Department name is required and must be a string", "name");
    }

    const name = body.name.trim();
    if (name.length === 0) {
      return validationError("Department name cannot be empty", "name");
    }

    if (name.length < 2) {
      return validationError("Department name must be at least 2 characters", "name");
    }

    if (name.length > 100) {
      return validationError("Department name must not exceed 100 characters", "name");
    }

    // Check for duplicate
    const existing = await prisma.department.findUnique({
      where: { name: name },
    });

    if (existing) {
      return validationError("Department with this name already exists", "name");
    }

    const dept = await prisma.department.create({
      data: {
        name: name,
        description: body.description?.trim() || null,
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
