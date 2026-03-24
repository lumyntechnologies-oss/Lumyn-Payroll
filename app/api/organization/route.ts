import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/organization
 * Returns the company org chart: departments with their employees and managers.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          where: { status: "ACTIVE" },
          orderBy: { hireDate: "asc" },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            employmentType: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    console.error("[Organization] Error:", error);
    return NextResponse.json({ error: "Failed to fetch organization data" }, { status: 500 });
  }
}
