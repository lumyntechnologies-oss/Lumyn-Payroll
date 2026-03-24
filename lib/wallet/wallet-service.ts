import prisma from "@/lib/prisma";

export interface PesapalPaymentInitiation {
  order_type: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  redirect_url: string;
  invoice_number: string;
  billing_details: {
    email_address: string;
    phone_number: string;
    first_name: string;
    last_name: string;
  };
}

export interface PesapalTransaction {
  id: string;
  reference: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
}

export class PesapalWalletService {
  private consumerKey: string;
  private consumerSecret: string;
  private apiUrl: string;
  private testMode: boolean;

  constructor() {
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || "test_key";
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || "test_secret";
    this.testMode = process.env.NODE_ENV !== "production";
    this.apiUrl = this.testMode
      ? "https://sandbox.pesapal.com/api/v3"
      : "https://api.pesapal.com/api/v3";
  }

  /**
   * Initiate a wallet topup payment with Pesapal
   */
  async initiateWalletTopup(
    employeeId: string,
    employeeName: string,
    email: string,
    phone: string,
    amount: number,
    callbackUrl: string
  ): Promise<{
    order_tracking_id: string;
    merchant_reference: string;
    url: string;
    status: string;
  }> {
    try {
      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { employeeId },
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            employeeId,
            balance: 0,
          },
        });
      }

      const merchantReference = `TOPUP-${employeeId}-${Date.now()}`;
      const [firstName, ...lastNameParts] = employeeName.split(" ");
      const lastName = lastNameParts.join(" ") || "Employee";

      const paymentData: PesapalPaymentInitiation = {
        order_type: "MERCHANT",
        currency: "KES",
        amount,
        description: `Wallet Top-up for ${employeeName}`,
        callback_url: callbackUrl,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/wallet?status=pending&ref=${merchantReference}`,
        invoice_number: merchantReference,
        billing_details: {
          email_address: email,
          phone_number: phone,
          first_name: firstName,
          last_name: lastName,
        },
      };

      console.log("[Pesapal] Initiating wallet topup:", {
        employeeId,
        amount,
        merchantReference,
      });

      // Mock Pesapal response - in production, call actual API
      const orderTrackingId = `PESAPAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const pesapalUrl = this.testMode
        ? `https://sandbox.pesapal.com/api/v3/checkout?order_tracking_id=${orderTrackingId}`
        : `https://api.pesapal.com/api/v3/checkout?order_tracking_id=${orderTrackingId}`;

      // Create initial transaction record
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "TOPUP",
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance,
          status: "PENDING",
          paymentReference: merchantReference,
          pesapalReference: orderTrackingId,
          description: `Pesapal wallet top-up initiated`,
        },
      });

      return {
        order_tracking_id: orderTrackingId,
        merchant_reference: merchantReference,
        url: pesapalUrl,
        status: "PENDING",
      };
    } catch (error) {
      console.error("[Pesapal] Error initiating topup:", error);
      throw error;
    }
  }

  /**
   * Verify and process Pesapal callback
   */
  async verifyAndProcessPayment(
    orderTrackingId: string,
    merchantReference: string
  ): Promise<{
    success: boolean;
    message: string;
    walletBalance?: number;
  }> {
    try {
      // Find transaction by references
      const transaction = await prisma.walletTransaction.findFirst({
        where: {
          pesapalReference: orderTrackingId,
          paymentReference: merchantReference,
        },
        include: { wallet: true },
      });

      if (!transaction) {
        return {
          success: false,
          message: "Transaction not found",
        };
      }

      // In production, verify with Pesapal API using order_tracking_id
      // For now, simulate successful verification
      const paymentSuccessful = Math.random() > 0.05; // 95% success rate

      if (paymentSuccessful) {
        // Update transaction status
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "SUCCESS",
            updatedAt: new Date(),
          },
        });

        // Update wallet balance
        const newBalance = transaction.wallet.balance + transaction.amount;
        await prisma.wallet.update({
          where: { id: transaction.walletId },
          data: {
            balance: newBalance,
            lastTopupAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log("[Pesapal] Payment verified successfully:", {
          merchantReference,
          amount: transaction.amount,
          newBalance,
        });

        return {
          success: true,
          message: "Payment processed successfully",
          walletBalance: newBalance,
        };
      } else {
        // Mark as failed
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "FAILED",
            updatedAt: new Date(),
          },
        });

        return {
          success: false,
          message: "Payment verification failed",
        };
      }
    } catch (error) {
      console.error("[Pesapal] Error verifying payment:", error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(employeeId: string): Promise<{
    balance: number;
    currency: string;
    lastTopup?: Date;
  } | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { employeeId },
      select: {
        balance: true,
        currency: true,
        lastTopupAt: true,
      },
    });

    return wallet || null;
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(
    employeeId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const wallet = await prisma.wallet.findUnique({
      where: { employeeId },
    });

    if (!wallet) return { transactions: [], total: 0 };

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return { transactions, total };
  }

  /**
   * Withdraw from wallet (for disbursement)
   */
  async withdrawFromWallet(
    employeeId: string,
    amount: number,
    description: string = "Wallet withdrawal"
  ): Promise<{
    success: boolean;
    message: string;
    newBalance?: number;
  }> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { employeeId },
      });

      if (!wallet) {
        return {
          success: false,
          message: "Wallet not found",
        };
      }

      if (wallet.balance < amount) {
        return {
          success: false,
          message: "Insufficient wallet balance",
        };
      }

      const newBalance = wallet.balance - amount;

      // Create transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "WITHDRAWAL",
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          status: "SUCCESS",
          description,
        },
      });

      // Update wallet
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Withdrawal successful",
        newBalance,
      };
    } catch (error) {
      console.error("[Wallet] Error withdrawing:", error);
      return {
        success: false,
        message: "Withdrawal failed",
      };
    }
  }

  /**
   * Create wallet for new employee
   */
  async createWalletForEmployee(employeeId: string): Promise<string> {
    const wallet = await prisma.wallet.create({
      data: {
        employeeId,
        balance: 0,
      },
    });

    return wallet.id;
  }
}

// Export singleton instance
export const walletService = new PesapalWalletService();
