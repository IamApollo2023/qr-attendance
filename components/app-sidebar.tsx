"use client";

import * as React from "react";
import Image from "next/image";
import {
  CameraIcon,
  ClipboardListIcon,
  MapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  CalendarIcon,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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

const data = {
  // Primary admin navigation – map directly to your real routes.
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Members",
      url: "/admin/members",
      icon: UsersIcon,
    },
    {
      title: "Attendance",
      url: "/admin/attendance",
      icon: ClipboardListIcon,
    },
    {
      title: "Activities",
      url: "/admin/activities",
      icon: CalendarIcon,
    },
    {
      title: "Geo Map",
      url: "/admin/geo",
      icon: MapIcon,
    },
    {
      title: "Scanner",
      url: "/scanner",
      icon: CameraIcon,
    },
  ],
  // Quick links section – keep it simple and relevant to this app.
  documents: [
    {
      name: "Members List",
      url: "/admin/members",
      icon: UsersIcon,
    },
    {
      name: "Attendance Records",
      url: "/admin/attendance",
      icon: ClipboardListIcon,
    },
    {
      name: "QR Scanner",
      url: "/scanner",
      icon: CameraIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SettingsIcon,
    },
    {
      title: "Help & Support",
      url: "/admin/help",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "/admin/search",
      icon: SearchIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="text-base font-semibold">
                    JIL Luna Admin
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
