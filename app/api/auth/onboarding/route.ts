import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

const ALLOWED_SELF_ROLES: Role[] = [Role.EMPLOYEE, Role.MANAGER, Role.HR_ADMIN, Role.FINANCE];

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  return NextResponse.json({ exists: !!user, role: user?.role ?? null });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { role } = body;

  if (!role || !ALLOWED_SELF_ROLES.includes(role as Role)) {
    return NextResponse.json(
      { error: `Invalid role. Allowed: ${ALLOWED_SELF_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) {
    return NextResponse.json({ success: true, user: existing, alreadyExists: true });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Clerk user not found" }, { status: 404 });
  }

  const superAdminId = process.env.SUPER_ADMIN_CLERK_ID;
  const finalRole: Role = superAdminId && userId === superAdminId ? Role.SUPER_ADMIN : (role as Role);

  const user = await prisma.user.create({
    data: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "New User",
      role: finalRole,
    },
  });

  return NextResponse.json({ success: true, user });
}
