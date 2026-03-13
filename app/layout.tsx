import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { TopNav } from "@/app/components/layout/TopNav";

export const metadata: Metadata = {
  title: "Lumyn Payroll - HR & Payroll Management",
  description: "Modern HR and Payroll Management Platform for Kenyan SMBs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
