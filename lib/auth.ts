import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    const superAdminId = process.env.SUPER_ADMIN_CLERK_ID;
    if (superAdminId && userId === superAdminId) {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          name:
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            "Super Admin",
          role: Role.SUPER_ADMIN,
        },
      });
    } else {
      return null;
    }
  }

  const superAdminId = process.env.SUPER_ADMIN_CLERK_ID;
  if (superAdminId && userId === superAdminId && user.role !== Role.SUPER_ADMIN) {
    user = await prisma.user.update({
      where: { clerkId: userId },
      data: { role: Role.SUPER_ADMIN },
    });
  }

  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await getCurrentDbUser();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
}

export function isSuperAdmin(clerkId: string) {
  return process.env.SUPER_ADMIN_CLERK_ID === clerkId;
}
