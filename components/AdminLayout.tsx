"use client";

import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Admin shell now reuses the shadcn dashboard-01 sidebar/header layout.
// We render whatever admin page content you have into the main content column.
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-1 flex-col min-h-0">
          <SiteHeader />
          <main
            className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
            style={{ overscrollBehaviorX: "none" }}
          >
            <div className="mx-auto w-full max-w-6xl pr-4 lg:pr-6 py-4 md:py-6">
              <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
                {children}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
