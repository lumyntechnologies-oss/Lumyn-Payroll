import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const superAdminId = process.env.SUPER_ADMIN_CLERK_ID;
  const isSuperAdmin = superAdminId && userId === superAdminId;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        email: clerkUser.emailAddresses[0]?.emailAddress ?? existing.email,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || existing.name,
        ...(isSuperAdmin ? { role: Role.SUPER_ADMIN } : {}),
      },
    });
    return NextResponse.json({ success: true, user: updated });
  }

  const role: Role = isSuperAdmin ? Role.SUPER_ADMIN : Role.EMPLOYEE;
  const created = await prisma.user.create({
    data: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      role,
    },
  });

  return NextResponse.json({ success: true, user: created });
}
