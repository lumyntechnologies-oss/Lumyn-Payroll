import { auth } from "@clerk/nextjs/server";
import { complianceService } from "@/lib/compliance/compliance-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await complianceService.getComplianceAlerts();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Compliance Alerts] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance alerts" },
      { status: 500 }
    );
  }
}
