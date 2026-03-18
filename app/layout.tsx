import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}