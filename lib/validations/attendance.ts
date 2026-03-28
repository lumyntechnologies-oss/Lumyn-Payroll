import { z } from "zod";
import { AttendanceStatus } from "@/lib/generated/prisma";

export const clockInSchema = z.object({
  employeeId: z.string().min(1),
});

export const clockOutSchema = z.object({
  employeeId: z.string().min(1),
});

export const updateAttendanceSchema = z.object({
  status: z.nativeEnum(AttendanceStatus),
  overtime: z.number().min(0).optional(),
});

export type ClockInInput = z.infer<typeof clockInSchema>;

