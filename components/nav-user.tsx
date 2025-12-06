"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, MoreVerticalIcon, UserCircleIcon } from "lucide-react";

import { supabase, signOut } from "@/lib";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";

type UserProfile = {
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setProfile({
            fullName:
              (user.user_metadata as any)?.full_name ?? user.email ?? null,
            email: user.email ?? null,
            avatarUrl:
              (user.user_metadata as any)?.avatar_url ??
              (user.user_metadata as any)?.avatar ??
              null,
          });
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to load user profile for sidebar:", error);
        setProfile(null);
      }
    };

    fetchUser();
  }, []);

  const displayName =
    profile?.fullName || profile?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out from sidebar failed:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {profile?.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {profile ? initials : <UserCircleIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                {profile?.email ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </span>
                ) : null}
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {profile?.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {profile ? (
                      initials
                    ) : (
                      <UserCircleIcon className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  {profile?.email ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {profile.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleSignOut}
      />
    </SidebarMenu>
  );
}
