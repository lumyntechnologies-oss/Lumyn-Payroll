import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { TopNav } from "@/app/components/layout/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 flex-col lg:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
