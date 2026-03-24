import { getCurrentDbUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { walletService } from "@/lib/wallet/wallet-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Find employee by email
    const employee = await prisma.employee.findFirst({
      where: { email: dbUser.email },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    // Initiate Pesapal payment
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/wallet/callback/pesapal`;

    const paymentInitiation = await walletService.initiateWalletTopup(
      employee.id,
      `${employee.firstName} ${employee.lastName}`,
      employee.email,
      employee.phone || "0700000000",
      amount,
      callbackUrl
    );

    return NextResponse.json(paymentInitiation);
  } catch (error) {
    console.error("[Wallet Topup] Error:", error);
    return NextResponse.json(
      { error: "Failed to initiate topup" },
      { status: 500 }
    );
  }
}
