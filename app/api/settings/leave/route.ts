import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let policy = await prisma.leavePolicy.findFirst();
    
    if (!policy) {
      policy = await prisma.leavePolicy.create({
        data: {
          annualLeaveDays: 20,
          sickLeaveDays: 10,
          maternityDays: 90,
          paternityDays: 7,
          carryoverDays: 5,
          carryoverExpiry: 12,
          requiresApproval: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    console.error("Leave policy fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave policy" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      annualLeaveDays,
      sickLeaveDays,
      maternityDays,
      paternityDays,
      carryoverDays,
      carryoverExpiry,
      requiresApproval,
    } = body;

    // Validate numeric fields
    const errors: string[] = [];
    if (annualLeaveDays !== undefined && (isNaN(annualLeaveDays) || annualLeaveDays < 0)) {
      errors.push("Annual leave days must be a positive number");
    }
    if (sickLeaveDays !== undefined && (isNaN(sickLeaveDays) || sickLeaveDays < 0)) {
      errors.push("Sick leave days must be a positive number");
    }
    if (carryoverDays !== undefined && (isNaN(carryoverDays) || carryoverDays < 0)) {
      errors.push("Carryover days must be a positive number");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    let policy = await prisma.leavePolicy.findFirst();

    if (policy) {
      policy = await prisma.leavePolicy.update({
        where: { id: policy.id },
        data: {
          annualLeaveDays: annualLeaveDays !== undefined ? annualLeaveDays : policy.annualLeaveDays,
          sickLeaveDays: sickLeaveDays !== undefined ? sickLeaveDays : policy.sickLeaveDays,
          maternityDays: maternityDays !== undefined ? maternityDays : policy.maternityDays,
          paternityDays: paternityDays !== undefined ? paternityDays : policy.paternityDays,
          carryoverDays: carryoverDays !== undefined ? carryoverDays : policy.carryoverDays,
          carryoverExpiry: carryoverExpiry !== undefined ? carryoverExpiry : policy.carryoverExpiry,
          requiresApproval: requiresApproval !== undefined ? requiresApproval : policy.requiresApproval,
        },
      });
    } else {
      policy = await prisma.leavePolicy.create({
        data: {
          annualLeaveDays: annualLeaveDays ?? 20,
          sickLeaveDays: sickLeaveDays ?? 10,
          maternityDays: maternityDays ?? 90,
          paternityDays: paternityDays ?? 7,
          carryoverDays: carryoverDays ?? 5,
          carryoverExpiry: carryoverExpiry ?? 12,
          requiresApproval: requiresApproval ?? true,
        },
      });
    }

    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    console.error("Leave policy update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update leave policy" },
      { status: 500 }
    );
  }
}
