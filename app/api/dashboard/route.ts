import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EmployeeStatus, RequestStatus, ComplianceStatus } from "@/lib/generated/prisma";

export async function GET() {
  try {
    // Set timeout for individual queries
    const queryTimeout = 5000;

    // Execute queries in smaller, optimized batches
    const [totalEmployees, activeEmployees] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "employees"` as Promise<[{ count: bigint }]>,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "employees" WHERE status = ${'ACTIVE'}` as Promise<[{ count: bigint }]>,
    ]);

    const [latestPayroll, pendingLeave, activeAdvances] = await Promise.all([
      prisma.payrollRun.findFirst({
        orderBy: [{ year: "desc" }, { month: "desc" }],
        select: { month: true, year: true, totalGross: true, totalNet: true },
      }),
      prisma.leaveRequest.count({ where: { status: RequestStatus.PENDING } }),
      prisma.salaryAdvance.aggregate({
        where: { status: RequestStatus.APPROVED },
        _sum: { amount: true },
      }),
    ]);

    const [complianceRecords, recentNotifications] = await Promise.all([
      prisma.complianceRecord.findMany({
        where: {
          status: { in: [ComplianceStatus.PENDING, ComplianceStatus.DUE_SOON, ComplianceStatus.OVERDUE] },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const [payrollTrend, deptHeadcount] = await Promise.all([
      prisma.payrollRun.findMany({
        orderBy: [{ year: "asc" }, { month: "asc" }],
        take: 12,
        select: { month: true, year: true, totalGross: true, totalNet: true },
      }),
      prisma.department.findMany({
        select: {
          name: true,
          _count: { select: { employees: { where: { status: EmployeeStatus.ACTIVE } } } },
        },
      }),
    ]);

    const advancesOutstanding = activeAdvances._sum.amount ?? 0;
    const totalEmp = Number(totalEmployees[0]?.count ?? 0);
    const activeEmp = Number(activeEmployees[0]?.count ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalEmployees: totalEmp,
          activeEmployees: activeEmp,
          payrollThisMonth: latestPayroll?.totalNet ?? 0,
          pendingLeave,
          advancesOutstanding,
          complianceStatus: complianceRecords.some(c => c.status === ComplianceStatus.OVERDUE) ? "Overdue" : "Compliant",
          complianceDueCount: complianceRecords.filter(c => c.status === ComplianceStatus.DUE_SOON).length,
        },
        payrollTrend: payrollTrend || [],
        deptHeadcount: deptHeadcount.map(d => ({ dept: d.name, count: d._count.employees })),
        complianceAlerts: complianceRecords,
        recentNotifications,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard",
        data: {
          kpi: {
            totalEmployees: 0,
            activeEmployees: 0,
            payrollThisMonth: 0,
            pendingLeave: 0,
            advancesOutstanding: 0,
            complianceStatus: "Unknown",
            complianceDueCount: 0,
          },
          payrollTrend: [],
          deptHeadcount: [],
          complianceAlerts: [],
          recentNotifications: [],
        },
      },
      { status: 500 }
    );
  }
}
