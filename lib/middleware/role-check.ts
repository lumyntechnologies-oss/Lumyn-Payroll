import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

import { Role } from "@/lib/rbac"; 
export type UserRole = Role;

export interface RoleContext {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  departmentId?: string;
}

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<RoleContext | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) return null;

    const employee = await prisma.employee.findFirst({
      where: { email: user.email },
      include: { department: true },
    });

    return {
      userId,
      email: user.email,
      role: user.role as UserRole,
      employeeId: employee?.id,
      departmentId: employee?.departmentId,
    };
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Check if user has required role(s)
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Role-based access control definitions
 */
export const ROLE_PERMISSIONS = {
  EMPLOYEE: {
    canViewOwnPayslips: true,
    canViewOwnPaymentMethods: true,
    canAddPaymentMethod: true,
    canViewOwnTransactionHistory: true,
    canViewOwnProfile: true,
    canViewPayroll: false,
    canApproveDisbursement: false,
    canViewAllPayments: false,
    canReconcile: false,
    canManageProviders: false,
    canViewAuditLog: false,
    canManagePaymentRules: false,
  },
  MANAGER: {
    canViewOwnPayslips: true,
    canViewOwnPaymentMethods: true,
    canAddPaymentMethod: true,
    canViewOwnTransactionHistory: true,
    canViewOwnProfile: true,
    canViewPayroll: true,
    canViewTeamPayroll: true,
    canApproveDisbursement: false,
    canViewAllPayments: false,
    canReconcile: false,
    canManageProviders: false,
    canViewAuditLog: false,
    canManagePaymentRules: false,
  },
  HR_ADMIN: {
    canViewOwnPayslips: true,
    canViewOwnPaymentMethods: true,
    canAddPaymentMethod: true,
    canViewOwnTransactionHistory: true,
    canViewOwnProfile: true,
    canViewPayroll: true,
    canViewTeamPayroll: true,
    canViewAllPayments: true,
    canApproveDisbursement: false,
    canReconcile: false,
    canManageProviders: false,
    canViewAuditLog: true,
    canManagePaymentRules: false,
  },
  FINANCE: {
    canViewOwnPayslips: true,
    canViewOwnPaymentMethods: true,
    canAddPaymentMethod: true,
    canViewOwnTransactionHistory: true,
    canViewOwnProfile: true,
    canViewPayroll: true,
    canViewAllPayments: true,
    canApproveDisbursement: true,
    canReconcile: true,
    canManageProviders: true,
    canViewAuditLog: true,
    canManagePaymentRules: true,
  },
  SUPER_ADMIN: {
    canViewOwnPayslips: true,
    canViewOwnPaymentMethods: true,
    canAddPaymentMethod: true,
    canViewOwnTransactionHistory: true,
    canViewOwnProfile: true,
    canViewPayroll: true,
    canViewAllPayments: true,
    canApproveDisbursement: true,
    canReconcile: true,
    canManageProviders: true,
    canViewAuditLog: true,
    canManagePaymentRules: true,
  },
};

/**
 * Check if user can perform an action
 */
export function canPerformAction(
  userRole: UserRole,
  action: keyof typeof ROLE_PERMISSIONS["EMPLOYEE"]
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return (permissions[action] as boolean) || false;
}

/**
 * API middleware to check role
 */
export async function checkRoleMiddleware(
  req: NextRequest,
  requiredRoles: UserRole[]
): Promise<{ valid: boolean; context?: RoleContext; response?: NextResponse }> {
  const { userId } = await auth();

  if (!userId) {
    return {
      valid: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const context = await getUserRole(userId);
  if (!context) {
    return {
      valid: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  if (!hasRole(context.role, requiredRoles)) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return { valid: true, context };
}

/**
 * Filter data based on user role
 */
export function filterDataByRole(data: any[], userRole: UserRole, userId: string): any[] {
  if (userRole === "SUPER_ADMIN" || userRole === "FINANCE") {
    return data; // Full access
  }

  if (userRole === "EMPLOYEE") {
    // Employees only see their own data
    return data.filter((item) => item.employeeId === userId || item.createdById === userId);
  }

  // Managers and HR see their department's data
  return data;
}
