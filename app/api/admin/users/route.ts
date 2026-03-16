import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

const ALLOWED_ROLES: Role[] = [Role.SUPER_ADMIN, Role.HR_ADMIN];

export async function GET() {
  const currentUser = await getCurrentDbUser();
  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: users });
}

export async function PATCH(req: NextRequest) {
  const currentUser = await getCurrentDbUser();
  if (!currentUser || currentUser.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role || !Object.values(Role).includes(role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.clerkId === process.env.SUPER_ADMIN_CLERK_ID) {
    return NextResponse.json({ error: "Cannot change super admin role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
