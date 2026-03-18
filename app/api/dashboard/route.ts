import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EmployeeStatus, AttendanceStatus, RequestStatus, ComplianceStatus } from "@/lib/generated/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      latestPayroll,
      pendingLeave,
      activeAdvances,
      complianceRecords,
      recentNotifications,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: EmployeeStatus.ACTIVE } }),
      prisma.payrollRun.findFirst({
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
      prisma.leaveRequest.count({ where: { status: RequestStatus.PENDING } }),
      prisma.salaryAdvance.findMany({
        where: { status: RequestStatus.APPROVED },
        select: { amount: true },
      }),
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

    const advancesOutstanding = activeAdvances.reduce((s, a) => s + a.amount, 0);

    const payrollTrend = await prisma.payrollRun.findMany({
      orderBy: [{ year: "asc" }, { month: "asc" }],
      take: 7,
      select: { month: true, year: true, totalGross: true, totalNet: true },
    });

    const deptHeadcount = await prisma.department.findMany({
      select: {
        name: true,
        _count: { select: { employees: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalEmployees,
          activeEmployees,
          payrollThisMonth: latestPayroll?.totalNet ?? 0,
          pendingLeave,
          advancesOutstanding,
          complianceStatus: complianceRecords.some(c => c.status === ComplianceStatus.OVERDUE) ? "Overdue" : "Compliant",
          complianceDueCount: complianceRecords.filter(c => c.status === ComplianceStatus.DUE_SOON).length,
        },
        payrollTrend,
        deptHeadcount: deptHeadcount.map(d => ({ dept: d.name, count: d._count.employees })),
        complianceAlerts: complianceRecords,
        recentNotifications,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dashboard" }, { status: 500 });
  }
}
