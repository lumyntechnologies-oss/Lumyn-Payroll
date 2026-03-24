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

    const settings = await settingsService.getEmployeeSettings(employee.id);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("[Settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const updates = await request.json();

    const result = await settingsService.updateEmployeeSettings(
      employee.id,
      updates
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
