"use client";

import type React from "react";

import { FinanceSidebar } from "@/components/finance-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface FinanceLayoutProps {
  children: React.ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] w-full overflow-hidden">
        <FinanceSidebar variant="inset" />
        <SidebarInset className="flex flex-1 flex-col min-h-0">
          <SiteHeader />
          <main
            className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
            style={{ overscrollBehaviorX: "none" }}
          >
            <div className="mx-auto w-full max-w-6xl px-3 md:pr-4 lg:pr-6 py-3 md:py-6">
              <div className="@container/main flex flex-1 flex-col gap-3 md:gap-6">
                {children}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
