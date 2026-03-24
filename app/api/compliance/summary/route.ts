import { auth } from "@clerk/nextjs/server";
import { complianceService } from "@/lib/compliance/compliance-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1 + "");
    const year = parseInt(searchParams.get("year") || new Date().getFullYear() + "");

    const result = await complianceService.getMonthlyCompliance(month, year);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Compliance Summary] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance summary" },
      { status: 500 }
    );
  }
}
