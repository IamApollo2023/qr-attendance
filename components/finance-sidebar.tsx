"use client";

import * as React from "react";
import Image from "next/image";
import { LayoutDashboard, Coins, HandCoins, Handshake } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const financeNavData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/finance",
      icon: LayoutDashboard,
    },
    {
      title: "Tithes",
      url: "/finance/tithes",
      icon: Coins,
    },
    {
      title: "Offering",
      url: "/finance/offerings",
      icon: HandCoins,
    },
    {
      title: "Pledge",
      url: "/finance/pledges",
      icon: Handshake,
    },
  ],
};

export function FinanceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="flex items-center gap-2">
                  <span className="relative h-7 w-7 overflow-hidden rounded-full border border-sidebar-border bg-background">
                    <Image
                      src="/logo.png"
                      alt="Jesus Is Lord Luna"
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </span>
                  <span className="text-base sm:text-base font-semibold">
                    JIL Luna Finance
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={financeNavData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
