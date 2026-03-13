import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, paginate } from "@/lib/api-helpers";
import { AttendanceStatus } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 50);
    const employeeId = searchParams.get("employeeId");
    const date = searchParams.get("date");
    const { take, skip } = paginate(page, limit);

    const where = {
      ...(employeeId ? { employeeId } : {}),
      ...(date ? { date: new Date(date) } : {}),
    };

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        take,
        skip,
        orderBy: { date: "desc" },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } },
          },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [present, absent, late] = await Promise.all([
      prisma.attendance.count({ where: { date: today, status: AttendanceStatus.PRESENT } }),
      prisma.attendance.count({ where: { date: today, status: AttendanceStatus.ABSENT } }),
      prisma.attendance.count({ where: { date: today, status: AttendanceStatus.LATE } }),
    ]);

    return successResponse({ records, pagination: { page, limit: take, total }, summary: { present, absent, late } });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch attendance");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const record = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: body.employeeId,
          date: new Date(body.date),
        },
      },
      update: {
        clockIn: body.clockIn ? new Date(body.clockIn) : undefined,
        clockOut: body.clockOut ? new Date(body.clockOut) : undefined,
        status: body.status,
        overtime: body.overtime ?? 0,
      },
      create: {
        employeeId: body.employeeId,
        date: new Date(body.date),
        clockIn: body.clockIn ? new Date(body.clockIn) : undefined,
        clockOut: body.clockOut ? new Date(body.clockOut) : undefined,
        status: body.status ?? "PRESENT",
        overtime: body.overtime ?? 0,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return successResponse(record, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to record attendance");
  }
}
