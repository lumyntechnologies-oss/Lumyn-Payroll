import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { documentService } from "@/lib/documents/document-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("type") as string;
    const employeeId = formData.get("employeeId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: "Document type required" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // In production, upload to Vercel Blob
    // For now, create a mock URL
    const mockUrl = `/documents/${Date.now()}-${file.name}`;

    // Create document record
    const result = await documentService.createDocumentRecord({
      name: file.name,
      type: documentType as any,
      url: mockUrl,
      size: file.size,
      employeeId: employeeId || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      document: result.document,
    });
  } catch (error) {
    console.error("[Document Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
