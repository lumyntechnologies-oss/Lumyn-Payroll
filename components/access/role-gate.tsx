"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { UserRole } from "@/hooks/use-nav-items";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface RoleGateProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Component that only renders children if user has required role
 * Used to gate access to sensitive pages/features
 */
export function RoleGate({ children, requiredRoles, fallback }: RoleGateProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const role = d.data.role as UserRole;
          if (!requiredRoles.includes(role)) {
            // Unauthorized - show access denied
            setUserRole(null);
          } else {
            setUserRole(role);
          }
        }
      })
      .catch(() => {
        setUserRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [requiredRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!userRole) {
    if (fallback) {
      return fallback;
    }

    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Lock className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Access Denied</h3>
              <p className="text-sm text-slate-500">You don't have permission to view this page.</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return children;
}

/**
 * Higher-order component for pages that need role-based access
 */
export function withRoleGate<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: UserRole[]
) {
  return function RoleGatedComponent(props: P) {
    return (
      <RoleGate requiredRoles={requiredRoles}>
        <Component {...props} />
      </RoleGate>
    );
  };
}
