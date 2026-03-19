import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, validationError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { requests: true } } },
    });
    return successResponse(leaveTypes);
  } catch (error) {
    console.error("Failed to fetch leave types:", error);
    return errorResponse("Failed to fetch leave types");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || typeof body.name !== "string") {
      return validationError("Leave type name is required", "name");
    }

    const name = body.name.trim();
    if (name.length < 2 || name.length > 50) {
      return validationError("Name must be between 2 and 50 characters", "name");
    }

    if (!body.allowedDays || typeof body.allowedDays !== "number" || body.allowedDays < 0) {
      return validationError("Allowed days must be a positive number", "allowedDays");
    }

    // Check for duplicate
    const existing = await prisma.leaveType.findUnique({
      where: { name },
    });

    if (existing) {
      return validationError("Leave type with this name already exists", "name");
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        name,
        allowedDays: body.allowedDays,
        description: body.description?.trim() || null,
        isPaid: body.isPaid ?? true,
        requiresApproval: body.requiresApproval ?? true,
        carryoverAllowed: body.carryoverAllowed ?? false,
      },
      include: { _count: { select: { requests: true } } },
    });

    return successResponse(leaveType, 201);
  } catch (error) {
    console.error("Leave type creation error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create leave type",
      500
    );
  }
}
