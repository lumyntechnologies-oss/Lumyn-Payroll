import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/payments/batches
 * Returns disbursement batch history derived from completed payroll runs.
 * A "batch" is represented by payroll runs that have been disbursed.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || !["SUPER_ADMIN", "HR_ADMIN", "FINANCE"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const disbursedRuns = await prisma.payrollRun.findMany({
      where: { status: { in: ["PAID", "DISBURSED", "COMPLETED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
        totalGross: true,
        totalNet: true,
        updatedAt: true,
        _count: { select: { entries: true } },
      },
    });

    const batches = disbursedRuns.map((run) => ({
      id: `batch_${run.id}`,
      payrollRunId: run.id,
      status: run.status === "PAID" ? "COMPLETED" : run.status,
      totalAmount: Number(run.totalNet),
      employeeCount: run._count.entries,
      sentAt: run.updatedAt,
      successCount: run._count.entries,
      failureCount: 0,
    }));

    return NextResponse.json({ success: true, data: batches });
  } catch (error) {
    console.error("[Payments/Batches] Error:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}
