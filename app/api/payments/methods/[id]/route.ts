import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { checkRoleMiddleware } from "@/lib/middleware/role-check";

/**
 * DELETE /api/payments/methods/[id]
 * Delete payment method
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleCheck = await checkRoleMiddleware(req, ["EMPLOYEE", "MANAGER", "HR_ADMIN", "FINANCE", "SUPER_ADMIN"]);
  if (!roleCheck.valid) return roleCheck.response!;

  const context = roleCheck.context!;
  const { id } = params;

  try {
    const method = await prisma.paymentMethod.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!method) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    // Authorization: own or admin
    if (context.role === "EMPLOYEE" && method.employeeId !== context.employeeId) {
      return NextResponse.json({ error: "Unauthorized to delete this payment method" }, { status: 403 });
    }

    await prisma.paymentMethod.delete({ where: { id } });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_METHOD_DELETED",
        actor: context.userId,
        resource: "PaymentMethod",
        resourceId: id,
        details: JSON.stringify({ employeeId: method.employeeId }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 });
  }
}

/**
 * PATCH /api/payments/methods/[id]
 * Update payment method (set primary, verify)
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleCheck = await checkRoleMiddleware(req, ["EMPLOYEE", "MANAGER", "HR_ADMIN", "FINANCE", "SUPER_ADMIN"]);
  if (!roleCheck.valid) return roleCheck.response!;

  const context = roleCheck.context!;
  const { id } = params;
  const body = await req.json();

  try {
    const method = await prisma.paymentMethod.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!method) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    // Authorization check
    if (context.role === "EMPLOYEE" && method.employeeId !== context.employeeId) {
      return NextResponse.json({ error: "Unauthorized to update this payment method" }, { status: 403 });
    }

    // Handle set primary: make others non-primary for same employee
    if (body.primary !== undefined) {
      if (body.primary) {
        await prisma.paymentMethod.updateMany({
          where: { employeeId: method.employeeId, id: { not: id } },
          data: { primary: false }
        });
      }
      await prisma.paymentMethod.update({
        where: { id },
        data: { primary: body.primary }
      });
    }

    // Handle verification (admin only)
    if (body.verified !== undefined && ["HR_ADMIN", "FINANCE", "SUPER_ADMIN"].includes(context.role)) {
      await prisma.paymentMethod.update({
        where: { id },
        data: { verified: body.verified }
      });
    }

    const updated = await prisma.paymentMethod.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true } } }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 });
  }
}

