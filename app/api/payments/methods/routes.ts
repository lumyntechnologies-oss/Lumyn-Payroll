import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { checkRoleMiddleware } from "@/lib/middleware/role-check";

/**
 * GET /api/payments/methods
 * Get payment methods for authenticated user
 * EMPLOYEE: Only own methods
 * ADMIN+: All methods (with optional employee filter)
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleCheck = await checkRoleMiddleware(req, ["EMPLOYEE", "MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"]);
  if (!roleCheck.valid) return roleCheck.response!;

  const context = roleCheck.context!;
  const url = new URL(req.url);
  const employeeIdFilter = url.searchParams.get("employeeId");

  try {
    let whereClause: any = {};

    // EMPLOYEE: only their own methods
    if (context.role === "EMPLOYEE") {
      whereClause = { employeeId: context.employeeId };
    }
    // ADMIN+: can filter by employee
    else if (employeeIdFilter) {
      whereClause = { employeeId: employeeIdFilter };
    }

    const methods = await prisma.paymentMethod.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask sensitive data for employees
    if (context.role === "EMPLOYEE") {
      const maskedMethods = methods.map((m) => ({
        ...m,
        accountNumber: m.accountNumber ? `****${m.accountNumber.slice(-4)}` : null,
        mpesaNumber: m.mpesaNumber ? `****${m.mpesaNumber.slice(-4)}` : null,
        iban: m.iban ? `****${m.iban.slice(-4)}` : null,
      }));
      return NextResponse.json({ success: true, data: maskedMethods });
    }

    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
  }
}

/**
 * POST /api/payments/methods
 * Add payment method
 * EMPLOYEE: Only own methods
 * ADMIN+: For any employee
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleCheck = await checkRoleMiddleware(req, ["EMPLOYEE", "MANAGER", "HR_ADMIN", "FINANCE_LEAD", "CFO", "SUPER_ADMIN"]);
  if (!roleCheck.valid) return roleCheck.response!;

  const context = roleCheck.context!;
  const body = await req.json();

  try {
    const { type, bankCode, accountNumber, accountName, mpesaNumber, swiftCode, iban, employeeId } = body;

    // Validation
    if (!type || !["BANK", "MPESA", "INTERNATIONAL"].includes(type)) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    // Authorization check
    const targetEmployeeId = employeeId || context.employeeId;
    if (context.role === "EMPLOYEE" && targetEmployeeId !== context.employeeId) {
      return NextResponse.json({ error: "Cannot add payment methods for other employees" }, { status: 403 });
    }

    // Type-specific validation
    if (type === "BANK" && (!bankCode || !accountNumber)) {
      return NextResponse.json({ error: "Bank code and account number required" }, { status: 400 });
    }
    if (type === "MPESA" && !mpesaNumber) {
      return NextResponse.json({ error: "M-Pesa number required" }, { status: 400 });
    }
    if (type === "INTERNATIONAL" && (!swiftCode || !iban)) {
      return NextResponse.json({ error: "SWIFT code and IBAN required" }, { status: 400 });
    }

    // Create payment method
    const method = await prisma.paymentMethod.create({
      data: {
        employeeId: targetEmployeeId,
        type,
        bankCode: type === "BANK" ? bankCode : null,
        accountNumber: type === "BANK" ? accountNumber : null,
        accountName: accountName || null,
        mpesaNumber: type === "MPESA" ? mpesaNumber : null,
        swiftCode: type === "INTERNATIONAL" ? swiftCode : null,
        iban: type === "INTERNATIONAL" ? iban : null,
        primary: false,
        verified: false,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_METHOD_ADDED",
        actor: context.userId,
        resource: "PaymentMethod",
        resourceId: method.id,
        details: JSON.stringify({ type, employeeId: targetEmployeeId }),
      },
    });

    return NextResponse.json({ success: true, data: method }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 });
  }
}
