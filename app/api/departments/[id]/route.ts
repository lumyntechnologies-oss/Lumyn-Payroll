import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse, validationError } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } }, employees: { select: { id: true, firstName: true, lastName: true, jobTitle: true } } },
    });

    if (!dept) return notFoundResponse("Department");
    return successResponse(dept);
  } catch (error) {
    console.error("Failed to fetch department:", error);
    return errorResponse("Failed to fetch department");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) return notFoundResponse("Department");

    const body = await req.json();

    if (body.name) {
      const name = body.name.trim();
      if (name.length < 2) return validationError("Department name must be at least 2 characters", "name");
      if (name.length > 100) return validationError("Department name must not exceed 100 characters", "name");

      const existing = await prisma.department.findUnique({ where: { name } });
      if (existing && existing.id !== id) {
        return validationError("Department with this name already exists", "name");
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        description: body.description?.trim() || null,
      },
      include: { _count: { select: { employees: true } } },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Department update error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to update department",
      500
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { employees: true } } },
    });

    if (!dept) return notFoundResponse("Department");

    if (dept._count.employees > 0) {
      return errorResponse(`Cannot delete department with ${dept._count.employees} employees. Reassign employees first.`, 400);
    }

    await prisma.department.delete({ where: { id } });
    return successResponse({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Department deletion error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to delete department",
      500
    );
  }
}
