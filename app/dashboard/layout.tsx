import type { Metadata } from "next";
import { cookies } from "next/headers";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession("/dashboard");
  const collapsed = (await cookies()).get("sidebar_state")?.value === "false";

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider
        defaultOpen={!collapsed}
        style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
      >
        <DashboardSidebar user={user} />
        <SidebarInset className="min-w-0">
          <DashboardTopbar user={user} />
          <div
            id="main"
            className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pt-6 pb-14 sm:px-8 sm:pt-8"
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
