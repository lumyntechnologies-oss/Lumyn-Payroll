import { z } from "zod";
import { PayrollStatus } from "@/lib/generated/prisma";

export const createPayrollRunSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024),
  entries: z.array(z.object({
    employeeId: z.string().min(1),
    basicSalary: z.number().positive(),
    allowances: z.number().min(0).default(0),
    deductions: z.number().min(0).default(0),
  })).min(1),
});

export const updatePayrollRunSchema = z.object({
  status: z.nativeEnum(PayrollStatus).optional(),
  approvedAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const payrollEntrySchema = z.object({
  employeeId: z.string(),
  basicSalary: z.number().positive(),
  allowances: z.number().min(0),
  deductions: z.number().min(0),
});

export type CreatePayrollRunInput = z.infer<typeof createPayrollRunSchema>;
export type UpdatePayrollRunInput = z.infer<typeof updatePayrollRunSchema>;

