import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_PERMISSIONS = [
  { role: "SUPER_ADMIN", resource: "*", action: "*", granted: true },
  { role: "HR_ADMIN", resource: "employees", action: "read", granted: true },
  { role: "HR_ADMIN", resource: "employees", action: "create", granted: true },
  { role: "HR_ADMIN", resource: "employees", action: "update", granted: true },
  { role: "HR_ADMIN", resource: "leave", action: "read", granted: true },
  { role: "HR_ADMIN", resource: "leave", action: "approve", granted: true },
  { role: "HR_ADMIN", resource: "attendance", action: "read", granted: true },
  { role: "HR_ADMIN", resource: "attendance", action: "update", granted: true },
  { role: "FINANCE", resource: "payroll", action: "read", granted: true },
  { role: "FINANCE", resource: "payroll", action: "create", granted: true },
  { role: "FINANCE", resource: "payroll", action: "approve", granted: true },
  { role: "FINANCE", resource: "reports", action: "read", granted: true },
  { role: "MANAGER", resource: "employees", action: "read", granted: true },
  { role: "MANAGER", resource: "attendance", action: "read", granted: true },
  { role: "MANAGER", resource: "leave", action: "read", granted: true },
  { role: "MANAGER", resource: "leave", action: "approve", granted: true },
  { role: "EMPLOYEE", resource: "profile", action: "read", granted: true },
  { role: "EMPLOYEE", resource: "profile", action: "update", granted: true },
  { role: "EMPLOYEE", resource: "leave", action: "read", granted: true },
  { role: "EMPLOYEE", resource: "leave", action: "create", granted: true },
  { role: "EMPLOYEE", resource: "payroll", action: "read", granted: true },
];

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");

    if (role) {
      const permissions = await prisma.rolePermission.findMany({
        where: { role },
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      });
      return NextResponse.json({ success: true, data: permissions });
    }

    const permissions = await prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { resource: "asc" }, { action: "asc" }],
    });
    return NextResponse.json({ success: true, data: permissions });
  } catch (error) {
    console.error("Roles fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, resource, action, granted } = body;

    if (!role || !resource || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: role, resource, action" },
        { status: 400 }
      );
    }

    const existing = await prisma.rolePermission.findFirst({
      where: { role, resource, action },
    });

    let permission;
    if (existing) {
      permission = await prisma.rolePermission.update({
        where: { id: existing.id },
        data: { granted: granted !== undefined ? granted : true },
      });
    } else {
      permission = await prisma.rolePermission.create({
        data: {
          role,
          resource,
          action,
          granted: granted !== undefined ? granted : true,
        },
      });
    }

    return NextResponse.json({ success: true, data: permission });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Permission ID is required" },
        { status: 400 }
      );
    }

    await prisma.rolePermission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Permission deleted" });
  } catch (error) {
    console.error("Permission delete error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete permission" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "init-defaults") {
      const existing = await prisma.rolePermission.findMany();
      if (existing.length === 0) {
        await prisma.rolePermission.createMany({
          data: DEFAULT_PERMISSIONS,
        });
      }
      return NextResponse.json({ success: true, message: "Default permissions initialized" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Init defaults error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize defaults" },
      { status: 500 }
    );
  }
}
