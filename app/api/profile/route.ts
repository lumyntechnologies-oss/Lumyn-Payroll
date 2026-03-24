import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
      include: { department: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: employee?.employeeId ?? null,
        jobTitle: employee?.jobTitle ?? null,
        department: employee?.department?.name ?? null,
        phone: employee?.phone ?? null,
        hireDate: employee?.hireDate ?? null,
        employmentType: employee?.employmentType ?? null,
        nationalId: employee?.nationalId ?? null,
        kraPin: employee?.kraPin ?? null,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 });
  }
}
