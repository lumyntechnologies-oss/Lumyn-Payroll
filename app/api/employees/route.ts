import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, paginate } from "@/lib/api-helpers";
import { EmployeeStatus, EmploymentType } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const search = searchParams.get("search") ?? "";
    const departmentId = searchParams.get("departmentId");
    const employmentType = searchParams.get("employmentType") as EmploymentType | null;
    const status = searchParams.get("status") as EmployeeStatus | null;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" as const } },
                { lastName: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { employeeId: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        departmentId ? { departmentId } : {},
        employmentType ? { employmentType } : {},
        status ? { status } : {},
      ],
    };

    const { take, skip } = paginate(page, limit);

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: { department: { select: { id: true, name: true } } },
      }),
      prisma.employee.count({ where }),
    ]);

    return successResponse({
      employees,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch employees");
  }
}

import { createEmployeeSchema, CreateEmployeeInput } from "@/lib/validations/employees";

export async function POST(req: NextRequest) {
  try {
    const body: CreateEmployeeInput = await req.json();

    const data = createEmployeeSchema.parse(body);

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existingEmployee) {
      return errorResponse("Employee with this email already exists", 400);
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    const count = await prisma.employee.count();
    const employeeId = `EMP${String(count + 1).padStart(3, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim(),
        nationalId: data.nationalId?.trim(),
        kraPin: data.kraPin?.trim(),
        nssfNumber: data.nssfNumber?.trim(),
        nhifNumber: data.nhifNumber?.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        departmentId: data.departmentId,
        jobTitle: data.jobTitle.trim(),
        employmentType: data.employmentType,
        hireDate: data.hireDate,
        status: "ACTIVE",
        basicSalary: data.basicSalary,
        bankName: data.bankName?.trim(),
        bankAccount: data.bankAccount?.trim(),
        bankBranch: data.bankBranch?.trim(),
        mpesaNumber: data.mpesaNumber?.trim(),
      },
      include: { department: true },
    });

    return successResponse(employee, 201);
  } catch (error) {
    console.error("Employee creation error:", error);
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON in request body", 400);
    }
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create employee",
      500
    );
  }
}
