"use client";

import * as React from "react";
import Image from "next/image";
import {
  DashboardOutlined,
  PeopleOutlined,
  ChecklistOutlined,
  DescriptionOutlined,
  CalendarTodayOutlined,
  MapOutlined,
  HelpOutline,
} from "@mui/icons-material";

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
      icon: DashboardOutlined,
    },
    {
      title: "Members",
      url: "/admin/members",
      icon: PeopleOutlined,
    },
    {
      title: "Attendance",
      url: "/admin/attendance",
      icon: ChecklistOutlined,
    },
    {
      title: "Report",
      url: "/admin/report",
      icon: DescriptionOutlined,
    },
    {
      title: "Activities",
      url: null, // Group title, not clickable
      icon: CalendarTodayOutlined,
      items: [
        {
          title: "Life Group",
          url: "/admin/activities/life-group",
        },
        {
          title: "iCare",
          url: "/admin/activities/icare",
        },
        {
          title: "Water Baptism",
          url: "/admin/activities/water-baptism",
        },
        {
          title: "House Blessings",
          url: "/admin/activities/house-blessings",
        },
        {
          title: "Necro Services",
          url: "/admin/activities/necros-services",
        },
        {
          title: "Non JIL related activities",
          url: "/admin/activities/non-jil-related",
        },
      ],
    },
    {
      title: "Geo Map",
      url: "/admin/geo",
      icon: MapOutlined,
    },
    {
      title: "Help & Tutorials",
      url: "/admin/help",
      icon: HelpOutline,
    },
  ],
  navSecondary: [],
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
                  <span className="text-base sm:text-base font-semibold">
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
