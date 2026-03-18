import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.payrollConfig.findFirst();
    
    if (!config) {
      config = await prisma.payrollConfig.create({
        data: {
          paymentFrequency: "MONTHLY",
          paymentDate: 25,
          taxYear: new Date().getFullYear(),
          nssfContribution: 6.0,
          nhifContribution: 1.75,
          shilfContribution: 0.5,
          housingLevyRate: 1.5,
          defaultOvertime: 1.5,
        },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Payroll config fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payroll configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentFrequency,
      paymentDate,
      taxYear,
      nssfContribution,
      nhifContribution,
      shilfContribution,
      housingLevyRate,
      defaultOvertime,
    } = body;

    // Validate numeric fields
    const errors: string[] = [];
    if (paymentDate && (isNaN(paymentDate) || paymentDate < 1 || paymentDate > 31)) {
      errors.push("Payment date must be between 1 and 31");
    }
    if (nssfContribution && isNaN(nssfContribution)) errors.push("Invalid NSSF contribution percentage");
    if (nhifContribution && isNaN(nhifContribution)) errors.push("Invalid NHIF contribution percentage");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    let config = await prisma.payrollConfig.findFirst();

    if (config) {
      config = await prisma.payrollConfig.update({
        where: { id: config.id },
        data: {
          paymentFrequency: paymentFrequency || config.paymentFrequency,
          paymentDate: paymentDate !== undefined ? paymentDate : config.paymentDate,
          taxYear: taxYear || config.taxYear,
          nssfContribution: nssfContribution !== undefined ? nssfContribution : config.nssfContribution,
          nhifContribution: nhifContribution !== undefined ? nhifContribution : config.nhifContribution,
          shilfContribution: shilfContribution !== undefined ? shilfContribution : config.shilfContribution,
          housingLevyRate: housingLevyRate !== undefined ? housingLevyRate : config.housingLevyRate,
          defaultOvertime: defaultOvertime !== undefined ? defaultOvertime : config.defaultOvertime,
        },
      });
    } else {
      config = await prisma.payrollConfig.create({
        data: {
          paymentFrequency: paymentFrequency || "MONTHLY",
          paymentDate: paymentDate || 25,
          taxYear: taxYear || new Date().getFullYear(),
          nssfContribution: nssfContribution ?? 6.0,
          nhifContribution: nhifContribution ?? 1.75,
          shilfContribution: shilfContribution ?? 0.5,
          housingLevyRate: housingLevyRate ?? 1.5,
          defaultOvertime: defaultOvertime ?? 1.5,
        },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("Payroll config update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update payroll configuration" },
      { status: 500 }
    );
  }
}
