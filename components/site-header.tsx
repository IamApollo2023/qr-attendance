"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function getPageTitle(pathname: string): string {
  // Finance routes
  if (pathname === "/finance" || pathname === "/finance/") {
    return "Dashboard";
  }
  if (pathname.startsWith("/finance/tithes")) {
    return "Tithes";
  }
  if (pathname.startsWith("/finance/offerings")) {
    return "Offerings";
  }
  if (pathname.startsWith("/finance/pledges")) {
    return "Pledges";
  }

  // Admin routes
  if (pathname === "/admin" || pathname === "/admin/") {
    return "Dashboard";
  }
  if (pathname.startsWith("/admin/members")) {
    return "Members";
  }
  if (pathname.startsWith("/admin/attendance")) {
    return "Attendance";
  }
  if (pathname.startsWith("/admin/activities/life-group")) {
    return "Life Group";
  }
  if (pathname.startsWith("/admin/activities/icare")) {
    return "iCare";
  }
  if (pathname.startsWith("/admin/activities/water-baptism")) {
    return "Water Baptism";
  }
  if (pathname.startsWith("/admin/activities/house-blessings")) {
    return "House Blessings";
  }
  if (pathname.startsWith("/admin/activities/necros-services")) {
    return "Necro Services";
  }
  if (pathname.startsWith("/admin/activities/non-jil-related")) {
    return "Non JIL Related";
  }
  if (pathname.startsWith("/admin/activities")) {
    return "Activities";
  }
  if (pathname.startsWith("/admin/geo")) {
    return "Geo Map";
  }
  if (pathname.startsWith("/admin/settings")) {
    return "Settings";
  }
  if (pathname.startsWith("/admin/help")) {
    return "Help & Support";
  }
  if (pathname.startsWith("/admin/search")) {
    return "Search";
  }

  // Default fallback
  return "Dashboard";
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className="sticky top-0 z-50 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear"
      style={{ overscrollBehaviorX: "none" }}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  );
}
