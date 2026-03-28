
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 12);
    const skip = (page - 1) * limit;

    const [runs, total] = await Promise.all([
      prisma.payrollRun.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: limit,
        skip,
        include: { _count: { select: { entries: true } } },
      }),
      prisma.payrollRun.count(),
    ]);

    return successResponse({ runs, pagination: { page, limit, total } });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch payroll runs");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
import { createPayrollRunSchema, CreatePayrollRunInput } from "@/lib/validations/payroll";

  const bodyData: CreatePayrollRunInput = await req.json();
  const data = createPayrollRunSchema.parse(bodyData);
  const { month, year } = data;

  console.log("Payroll creation request:", { month, year, bodyData });

  const existing = await prisma.payrollRun.findUnique({
    where: { 
      month_year: { 
        month,
        year 
      } 
    },
  });

    if (existing) {
      console.error("Payroll run already exists for period:", { month, year, existingId: existing.id });
      return errorResponse("Payroll run already exists for this period", 400);
    }

    const employees = await prisma.employee.findMany({
      where: { status: EmployeeStatus.ACTIVE },
      select: { id: true, basicSalary: true },
    });

    if (employees.length === 0) {
      console.error("No active employees found for payroll");
      return errorResponse("No active employees found for payroll", 400);
    }

    const run = await prisma.payrollRun.create({
      data: {
        month,
        year,
        status: "DRAFT",
      },
    });

    try {
      // Get approved salary advances for employees
      const advances = await prisma.salaryAdvance.findMany({
        where: { status: "APPROVED" },
        select: { employeeId: true, amount: true },
      });

      const advancesByEmployee = advances.reduce(
        (acc: Record<string, number>, a) => {
          acc[a.employeeId] = (acc[a.employeeId] ?? 0) + a.amount;
          return acc;
        },
        {}
      );

      const entries = employees.map((emp) => {
        const basic = Math.max(0, emp.basicSalary);
        const allowances = basic * 0.2;
        const grossSalary = basic + allowances;

        const paye = calculatePAYE(grossSalary);
        const nssf = Math.min(2160, basic * 0.06);
        const shif = 500;
        const housingLevy = grossSalary * 0.015;
        const advanceDeduction = advancesByEmployee[emp.id] ?? 0;
        const deductions = advanceDeduction;
        const netSalary = Math.max(0, grossSalary - paye - nssf - shif - housingLevy - deductions);

        return {
          payrollRunId: run.id,
          employeeId: emp.id,
          basicSalary: basic,
          allowances,
          deductions,
          paye,
          nssf,
          shif,
          housingLevy,
          grossSalary,
          netSalary,
        };
      });

      if (entries.length === 0) {
        throw new Error("No payroll entries could be generated");
      }

      await prisma.payrollEntry.createMany({ data: entries });

      const totalGross = entries.reduce((s, e) => s + e.grossSalary, 0);
      const totalTax = entries.reduce((s, e) => s + e.paye + e.nssf + e.shif + e.housingLevy, 0);
      const totalNet = entries.reduce((s, e) => s + e.netSalary, 0);

      const updatedRun = await prisma.payrollRun.update({
        where: { id: run.id },
        data: { totalGross, totalTax, totalNet },
        include: { _count: { select: { entries: true } } },
      });

      return successResponse(updatedRun, 201);
    } catch (error) {
      // Clean up if payroll entry creation fails
      await prisma.payrollRun.delete({ where: { id: run.id } });
      throw error;
    }
  } catch (error) {
    console.error("Payroll creation error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create payroll run",
      500
    );
  }
}


    { limit: 288000, rate: 0.1 },
    { limit: 100000, rate: 0.25 },
    { limit: Infinity, rate: 0.3 },
  ];
  let remaining = annual;
  for (const band of bands) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, band.limit);
    tax += taxable * band.rate;
    remaining -= taxable;
  }
  const personalRelief = 28800;
  return Math.max(0, (tax - personalRelief) / 12);
}
