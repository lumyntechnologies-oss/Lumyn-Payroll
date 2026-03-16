import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 });
  }
}
