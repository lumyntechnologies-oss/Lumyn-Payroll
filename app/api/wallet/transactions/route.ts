import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { walletService } from "@/lib/wallet/wallet-service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const employee = await prisma.employee.findFirst({
      where: { email: dbUser.email },
    });

    if (!employee) {
      return NextResponse.json({ transactions: [], total: 0 });
    }

    const result = await walletService.getWalletTransactions(employee.id, limit, offset);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Wallet Transactions]", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
