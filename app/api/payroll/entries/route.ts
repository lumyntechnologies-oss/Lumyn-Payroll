import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payrollRunId = searchParams.get("payrollRunId");
    const employeeId = searchParams.get("employeeId");

    const entries = await prisma.payrollEntry.findMany({
      where: {
        ...(payrollRunId ? { payrollRunId } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        employee: {
          include: { department: { select: { name: true } } },
        },
        payrollRun: { select: { month: true, year: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(entries);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch payroll entries");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, allowances, deductions } = body;

    const entry = await prisma.payrollEntry.findUnique({ where: { id } });
    if (!entry) return errorResponse("Entry not found", 404);

    const grossSalary = entry.basicSalary + (allowances ?? entry.allowances);
    const paye = entry.paye;
    const nssf = entry.nssf;
    const shif = entry.shif;
    const housingLevy = grossSalary * 0.015;
    const netSalary = grossSalary - paye - nssf - shif - housingLevy - (deductions ?? entry.deductions);

    const updated = await prisma.payrollEntry.update({
      where: { id },
      data: { allowances, deductions, grossSalary, housingLevy, netSalary },
    });
    return successResponse(updated);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update payroll entry");
  }
}
