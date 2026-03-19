import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const employeeId = searchParams.get("employeeId");

    let where: any = {};
    if (category) where.category = category;
    if (employeeId) where.employeeId = employeeId;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });

    return successResponse(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return errorResponse("Failed to fetch documents");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.url || !body.category) {
      return errorResponse("Title, URL, and category are required", 400);
    }

    const document = await prisma.document.create({
      data: {
        title: body.title,
        description: body.description,
        url: body.url,
        category: body.category,
        fileType: body.fileType || "pdf",
        employeeId: body.employeeId || null,
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });

    return successResponse(document, 201);
  } catch (error) {
    console.error("Document creation error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create document",
      500
    );
  }
}
