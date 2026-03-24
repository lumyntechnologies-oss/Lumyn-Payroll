import { auth } from "@clerk/nextjs/server";
import { notificationService } from "@/lib/notifications/notification-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 }
      );
    }

    const result = await notificationService.markAsRead(notificationId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Mark Read] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}
