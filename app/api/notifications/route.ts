import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const read = searchParams.get("read");
    const limit = Number(searchParams.get("limit") ?? 20);

    const notifications = await prisma.notification.findMany({
      where: read !== null ? { read: read === "true" } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({ where: { read: false } });
    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch notifications");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.markAllRead) {
      await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
      return successResponse({ updated: true });
    }

    const notification = await prisma.notification.create({
      data: {
        title: body.title,
        message: body.message,
        type: body.type ?? "INFO",
      },
    });
    return successResponse(notification, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create notification");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.id) {
      await prisma.notification.update({ where: { id: body.id }, data: { read: true } });
    } else {
      await prisma.notification.updateMany({ data: { read: true } });
    }
    return successResponse({ updated: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to update notification");
  }
}
