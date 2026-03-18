import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "payroll-summary";
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    switch (type) {
      case "payroll-summary": {
        const runs = await prisma.payrollRun.findMany({
          where: { year },
          orderBy: { month: "asc" },
          select: { month: true, year: true, totalGross: true, totalNet: true, totalTax: true },
        });
        return successResponse(runs);
      }

      case "department-costs": {
        const depts = await prisma.department.findMany({
          include: {
            employees: {
              select: {
                payrollEntries: {
                  where: { payrollRun: { year } },
                  select: { grossSalary: true, netSalary: true },
                },
              },
            },
          },
        });
        const data = depts.map(dept => ({
          name: dept.name,
          gross: dept.employees.reduce((s, e) => s + e.payrollEntries.reduce((ps, pe) => ps + pe.grossSalary, 0), 0),
          net: dept.employees.reduce((s, e) => s + e.payrollEntries.reduce((ps, pe) => ps + pe.netSalary, 0), 0),
        }));
        return successResponse(data);
      }

      case "employee-demographics": {
        const employees = await prisma.employee.findMany({
          select: {
            gender: true,
            employmentType: true,
            dateOfBirth: true,
            departmentId: true,
            status: true,
          },
        });

        const genderBreakdown = employees.reduce((acc: Record<string, number>, e) => {
          const g = e.gender ?? "UNKNOWN";
          acc[g] = (acc[g] ?? 0) + 1;
          return acc;
        }, {});

        const typeBreakdown = employees.reduce((acc: Record<string, number>, e) => {
          acc[e.employmentType] = (acc[e.employmentType] ?? 0) + 1;
          return acc;
        }, {});

        const now = new Date();
        const ageGroups: Record<string, number> = { "18-25": 0, "26-35": 0, "36-45": 0, "46+": 0 };
        employees.forEach(e => {
          if (!e.dateOfBirth) return;
          const age = now.getFullYear() - new Date(e.dateOfBirth).getFullYear();
          if (age <= 25) ageGroups["18-25"]++;
          else if (age <= 35) ageGroups["26-35"]++;
          else if (age <= 45) ageGroups["36-45"]++;
          else ageGroups["46+"]++;
        });

        return successResponse({ genderBreakdown, typeBreakdown, ageGroups, total: employees.length });
      }

      case "leave-trends": {
        const requests = await prisma.leaveRequest.findMany({
          where: { startDate: { gte: new Date(`${year}-01-01`) } },
          include: { leaveType: true },
        });

        const byMonth: Record<number, Record<string, number>> = {};
        requests.forEach(r => {
          const m = new Date(r.startDate).getMonth() + 1;
          if (!byMonth[m]) byMonth[m] = {};
          byMonth[m][r.leaveType.name] = (byMonth[m][r.leaveType.name] ?? 0) + 1;
        });

        return successResponse(byMonth);
      }

      case "attendance-analytics": {
        const records = await prisma.attendance.findMany({
          where: { date: { gte: new Date(`${year}-01-01`) } },
          select: { status: true, overtime: true, date: true },
        });

        const byStatus = records.reduce((acc: Record<string, number>, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        }, {});

        const totalOvertime = records.reduce((s, r) => s + r.overtime, 0);
        return successResponse({ byStatus, totalOvertime, totalDays: records.length });
      }

      case "headcount": {
        const depts = await prisma.department.findMany({
          include: { employees: { select: { gender: true } } },
        });
        const data = depts.map(d => ({
          name: d.name,
          count: d.employees.length,
          male: d.employees.filter(e => e.gender === "MALE").length,
          female: d.employees.filter(e => e.gender === "FEMALE").length,
        }));
        return successResponse(data);
      }

      case "leave-utilization": {
        const balances = await prisma.leaveBalance.findMany({
          include: { leaveType: true },
          where: { year },
        });
        const data = balances.reduce((acc: Record<string, { type: string; used: number; total: number }>, b) => {
          const name = b.leaveType.name;
          if (!acc[name]) acc[name] = { type: name, used: 0, total: 0 };
          acc[name].used += b.used;
          acc[name].total += b.total;
          return acc;
        }, {});
        return successResponse(Object.values(data));
      }

      default:
        return errorResponse("Unknown report type", 400);
    }
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to generate report");
  }
}
