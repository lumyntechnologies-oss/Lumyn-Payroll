import { auth } from "@clerk/nextjs/server";
import { taxService } from "@/lib/compliance/tax-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      basicSalary,
      allowances = 0,
      nssfContributionRate,
      nhifContributionRate,
      shilfContributionRate,
      housingLevyRate,
    } = await request.json();

    if (!basicSalary || basicSalary <= 0) {
      return NextResponse.json(
        { error: "Invalid basic salary" },
        { status: 400 }
      );
    }

    const result = taxService.calculateDeductions({
      basicSalary,
      allowances,
      grossSalary: basicSalary + allowances,
      nssfContributionRate,
      nhifContributionRate,
      shilfContributionRate,
      housingLevyRate,
    });

    const validation = taxService.validateCalculation(result);

    return NextResponse.json({
      success: validation.valid,
      data: result,
      validation,
    });
  } catch (error) {
    console.error("[Tax Calculation] Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate taxes" },
      { status: 500 }
    );
  }
}
