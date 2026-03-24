import { walletService } from "@/lib/wallet/wallet-service";
import { NextResponse } from "next/server";

/**
 * Pesapal IPN (Instant Payment Notification) callback handler
 * This endpoint receives payment status updates from Pesapal
 */
export async function POST(request: Request) {
  try {
    const { order_tracking_id, merchant_reference, notification_type } =
      await request.json();

    console.log("[Pesapal Callback] Received:", {
      order_tracking_id,
      merchant_reference,
      notification_type,
    });

    if (!order_tracking_id || !merchant_reference) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify and process the payment
    const result = await walletService.verifyAndProcessPayment(
      order_tracking_id,
      merchant_reference
    );

    if (result.success) {
      console.log("[Pesapal Callback] Payment processed:", {
        merchant_reference,
        walletBalance: result.walletBalance,
      });

      return NextResponse.json({
        status: "success",
        message: result.message,
        walletBalance: result.walletBalance,
      });
    } else {
      return NextResponse.json(
        {
          status: "failed",
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Pesapal Callback] Error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for Pesapal redirect after payment
 * User is redirected here after payment attempt on Pesapal's platform
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get("order_tracking_id");
    const merchantReference = searchParams.get("merchant_reference");

    if (!orderTrackingId || !merchantReference) {
      return NextResponse.json(
        { error: "Missing payment parameters" },
        { status: 400 }
      );
    }

    // Verify payment status
    const result = await walletService.verifyAndProcessPayment(
      orderTrackingId,
      merchantReference
    );

    // Redirect user to wallet page with status
    const redirectUrl = new URL(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/wallet`
    );
    redirectUrl.searchParams.set("status", result.success ? "success" : "failed");
    redirectUrl.searchParams.set("message", result.message);
    if (result.walletBalance !== undefined) {
      redirectUrl.searchParams.set("balance", result.walletBalance.toString());
    }

    return Response.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("[Pesapal Redirect] Error:", error);
    const redirectUrl = new URL(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/wallet`
    );
    redirectUrl.searchParams.set("status", "error");
    redirectUrl.searchParams.set("message", "Payment processing failed");

    return Response.redirect(redirectUrl.toString());
  }
}
