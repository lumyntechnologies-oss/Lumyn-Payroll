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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");

    // Get user's employee ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    let result;

    if (type) {
      result = await documentService.getDocumentsByType(type as any, employee.id, limit);
    } else {
      result = await documentService.getEmployeeDocuments(employee.id, limit, offset);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Documents List] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
