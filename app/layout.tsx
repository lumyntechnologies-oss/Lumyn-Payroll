import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
  },
  title: "Lumyn Payroll - HR & Payroll Management",
  description: "Modern HR and Payroll Management Platform for Kenyan SMBs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning={true}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}