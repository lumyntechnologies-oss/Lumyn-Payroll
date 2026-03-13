import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        leaveBalances: { include: { leaveType: true } },
        salaryAdvances: { orderBy: { createdAt: "desc" }, take: 5 },
        documents: { orderBy: { uploadedAt: "desc" }, take: 10 },
      },
    });
    if (!employee) return notFoundResponse("Employee");
    return successResponse(employee);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch employee");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        nationalId: body.nationalId,
        kraPin: body.kraPin,
        jobTitle: body.jobTitle,
        departmentId: body.departmentId,
        employmentType: body.employmentType,
        basicSalary: body.basicSalary !== undefined ? Number(body.basicSalary) : undefined,
        status: body.status,
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankBranch: body.bankBranch,
        mpesaNumber: body.mpesaNumber,
        terminatedAt: body.terminatedAt ? new Date(body.terminatedAt) : undefined,
      },
      include: { department: true },
    });
    return successResponse(employee);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update employee");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to delete employee");
  }
}
