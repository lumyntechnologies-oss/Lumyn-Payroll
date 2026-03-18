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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const count = await prisma.employee.count({});
    const employeeId = `EMP${String(count + 1).padStart(3, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        nationalId: body.nationalId,
        kraPin: body.kraPin,
        nssfNumber: body.nssfNumber,
        nhifNumber: body.nhifNumber,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        departmentId: body.departmentId,
        jobTitle: body.jobTitle,
        employmentType: body.employmentType ?? "FULL_TIME",
        hireDate: new Date(body.hireDate),
        status: "ACTIVE",
        basicSalary: Number(body.basicSalary),
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankBranch: body.bankBranch,
        mpesaNumber: body.mpesaNumber,
      },
      include: { department: true },
    });

    return successResponse(employee, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create employee");
  }
}
