import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (!employeeId) {
      return errorResponse("Employee ID is required", 400);
    }

    const payrollRun = await prisma.payrollRun.findFirst({
      where: { month, year },
      include: {
        entries: {
          where: { employeeId },
          include: {
            employee: {
              include: { department: true },
            },
          },
        },
      },
    });

    if (!payrollRun || payrollRun.entries.length === 0) {
      return errorResponse("No payslip found for this period", 404);
    }

    const entry = payrollRun.entries[0];
    const company = await prisma.companyProfile.findFirst();
    const payrollConfig = await prisma.payrollConfig.findFirst();

    return successResponse({
      payslip: entry,
      payrollRun,
      company,
      payrollConfig,
    });
  } catch (error) {
    console.error("Failed to fetch payslip:", error);
    return errorResponse("Failed to fetch payslip");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payrollRunId, employeeId } = body;

    if (!payrollRunId || !employeeId) {
      return errorResponse("Payroll run ID and employee ID are required", 400);
    }

    const entry = await prisma.payrollEntry.findFirst({
      where: { payrollRunId, employeeId },
      include: {
        employee: { include: { department: true } },
        payrollRun: true,
      },
    });

    if (!entry) {
      return errorResponse("Payslip not found", 404);
    }

    const company = await prisma.companyProfile.findFirst();

    return successResponse({
      payslip: entry,
      company,
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to process payslip");
  }
}
