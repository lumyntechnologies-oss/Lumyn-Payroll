import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { documentService } from "@/lib/documents/document-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
    });

    const result = await documentService.getDocumentStats(employee?.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Document Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document stats" },
      { status: 500 }
    );
  }
}
