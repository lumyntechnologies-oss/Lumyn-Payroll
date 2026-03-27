"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function DisbursementRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/payroll"); }, [router]);
  return null;
}
