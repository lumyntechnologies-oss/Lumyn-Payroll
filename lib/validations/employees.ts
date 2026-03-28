import { z } from "zod";
import { EmployeeStatus, EmploymentType, Gender } from "@/lib/generated/prisma";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email").toLowerCase(),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  kraPin: z.string().optional(),
  nssfNumber: z.string().optional(),
  nhifNumber: z.string().optional(),
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  gender: z.nativeEnum(Gender).optional(),
  departmentId: z.string().min(1, "Department is required"),
  jobTitle: z.string().min(1, "Job title is required").max(100),
  employmentType: z.nativeEnum(EmploymentType).default("FULL_TIME"),
  hireDate: z.string().transform((val) => new Date(val)),
  basicSalary: z.coerce.number().positive("Salary must be positive"),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankBranch: z.string().optional(),
  mpesaNumber: z.string().optional(),
}).refine((data) => data.hireDate <= new Date(), {
  message: "Hire date cannot be in the future",
  path: ["hireDate"],
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ 
  employmentType: true 
}).extend({
  status: z.nativeEnum(EmployeeStatus).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

