import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const payrollRunId = searchParams.get("payrollRunId");
    const format = searchParams.get("format") || "csv";

    if (!payrollRunId) {
      return new Response("Payroll run ID is required", { status: 400 });
    }

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        entries: {
          include: {
            employee: { include: { department: true } },
          },
        },
      },
    });

    if (!payrollRun) {
      return new Response("Payroll run not found", { status: 404 });
    }

    if (format === "csv") {
      return exportCSV(payrollRun);
    } else if (format === "json") {
      return exportJSON(payrollRun);
    }

    return new Response("Invalid format", { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return new Response("Failed to export payroll", { status: 500 });
  }
}

function exportCSV(payrollRun: any) {
  const headers = [
    "Employee ID",
    "Name",
    "Department",
    "Basic Salary",
    "Allowances",
    "Gross Salary",
    "PAYE",
    "NSSF",
    "NHIF",
    "Housing Levy",
    "Deductions",
    "Net Salary",
  ];

  const rows = payrollRun.entries.map((entry: any) => [
    entry.employee.employeeId,
    `${entry.employee.firstName} ${entry.employee.lastName}`,
    entry.employee.department.name,
    entry.basicSalary,
    entry.allowances,
    entry.grossSalary,
    entry.paye,
    entry.nssf,
    entry.shif,
    entry.housingLevy,
    entry.deductions,
    entry.netSalary,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payroll_${payrollRun.month}_${payrollRun.year}.csv"`,
    },
  });
}

function exportJSON(payrollRun: any) {
  const json = {
    period: `${payrollRun.month}/${payrollRun.year}`,
    totalGross: payrollRun.totalGross,
    totalTax: payrollRun.totalTax,
    totalNet: payrollRun.totalNet,
    entries: payrollRun.entries.map((entry: any) => ({
      employeeId: entry.employee.employeeId,
      name: `${entry.employee.firstName} ${entry.employee.lastName}`,
      department: entry.employee.department.name,
      basicSalary: entry.basicSalary,
      allowances: entry.allowances,
      grossSalary: entry.grossSalary,
      paye: entry.paye,
      nssf: entry.nssf,
      nhif: entry.shif,
      housingLevy: entry.housingLevy,
      deductions: entry.deductions,
      netSalary: entry.netSalary,
    })),
  };

  return new Response(JSON.stringify(json, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="payroll_${payrollRun.month}_${payrollRun.year}.json"`,
    },
  });
}
