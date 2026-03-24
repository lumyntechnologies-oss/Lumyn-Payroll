import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findFirst({
      where: { email: dbUser.email },
      include: { wallet: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Create wallet if it doesn't exist
    let wallet = employee.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          employeeId: employee.id,
          balance: 0,
        },
      });
    }

    return NextResponse.json({
      walletId: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency || "KES",
      lastTopupAt: wallet.lastTopupAt,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    });
  } catch (error) {
    console.error("[Wallet Balance]", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}

