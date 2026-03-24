import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { settingsService } from "@/lib/settings/settings-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const securitySettings = await settingsService.getSecuritySettings(employee.id);
    const auditLog = await settingsService.getAuditLog(employee.id);

    return NextResponse.json({
      success: true,
      security: securitySettings,
      auditLog: auditLog.logs,
    });
  } catch (error) {
    console.error("[Security Settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security settings" },
      { status: 500 }
    );
  }
}
