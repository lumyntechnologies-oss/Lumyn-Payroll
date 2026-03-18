import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get("name");

    if (name) {
      const integration = await prisma.integration.findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          webhookUrl: true,
          lastSyncAt: true,
          syncInterval: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!integration) {
        return NextResponse.json(
          { success: false, error: "Integration not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: integration });
    }

    const integrations = await prisma.integration.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        webhookUrl: true,
        lastSyncAt: true,
        syncInterval: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: integrations });
  } catch (error) {
    console.error("Integrations fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, apiKey, webhookUrl, syncInterval } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, type" },
        { status: 400 }
      );
    }

    const existing = await prisma.integration.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Integration with this name already exists" },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.create({
      data: {
        name,
        type,
        isActive: false,
        apiKey: apiKey ? Buffer.from(apiKey).toString("base64") : null,
        webhookUrl: webhookUrl || null,
        syncInterval: syncInterval || 3600,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        webhookUrl: true,
        syncInterval: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: integration });
  } catch (error) {
    console.error("Integration creation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create integration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, apiKey, webhookUrl, syncInterval } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Integration ID is required" },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        apiKey: apiKey ? Buffer.from(apiKey).toString("base64") : undefined,
        webhookUrl: webhookUrl !== undefined ? webhookUrl : undefined,
        syncInterval: syncInterval || undefined,
        lastSyncAt: isActive ? new Date() : undefined,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        webhookUrl: true,
        lastSyncAt: true,
        syncInterval: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: integration });
  } catch (error) {
    console.error("Integration update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update integration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Integration ID is required" },
        { status: 400 }
      );
    }

    await prisma.integration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Integration deleted" });
  } catch (error) {
    console.error("Integration delete error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete integration" },
      { status: 500 }
    );
  }
}
