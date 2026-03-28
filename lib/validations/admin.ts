import { z } from "zod";
import { Role } from "@/lib/generated/prisma";

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.nativeEnum(Role, {
    message: "Invalid role",
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
