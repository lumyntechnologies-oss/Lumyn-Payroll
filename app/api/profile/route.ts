import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EmployeeStatus } from "@/lib/generated/prisma";

export async function GET() {
  try {
    // Demo HR profile: first active employee from seed (Alice Nyambura - adapt to real auth later)
    const profile = await prisma.employee.findFirst({
      where: { status: EmployeeStatus.ACTIVE },
      select: {
        firstName: true,
        lastName: true,
        employeeId: true,
        jobTitle: true,
        department: { select: { name: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "No profile found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: `${profile.firstName} ${profile.lastName}`,
        role: profile.jobTitle,
        employeeId: profile.employeeId,
        department: profile.department.name,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 });
  }
}

