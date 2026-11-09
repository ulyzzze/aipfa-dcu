"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRoundIcon } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { useDemo } from "@/components/demo-provider";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";

export const AppSidebar = () => {
  const pathname = usePathname();
  const { state } = useDemo();
  const { setOpenMobile } = useSidebar();
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon" aria-label="Workspace" data-testid="workspace-sidebar">
      <SidebarHeader className="px-2 py-5">
        <Link href="/" onClick={closeMobile} aria-label="AIPFA home" className="flex h-8 items-center gap-3 overflow-hidden rounded-lg px-2 group-data-[collapsible=icon]:px-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Image src="/figma/mark.svg" width={20} height={20} alt="" />
          </span>
          <span className="text-2xl font-semibold tracking-tight group-data-[collapsible=icon]:hidden">aipfa</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Personal finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Main navigation">
              <SidebarMenu className="gap-1">
                {navigation.map(({ href, label, icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton render={<Link href={href} />} isActive={pathname === href} aria-current={pathname === href ? "page" : undefined} tooltip={label} onClick={closeMobile} className="h-10 gap-3">
                      <Image src={`/figma/${icon}.svg`} width={20} height={20} alt="" className="shrink-0" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />} isActive={pathname === "/settings"} aria-current={pathname === "/settings" ? "page" : undefined} tooltip="Settings" onClick={closeMobile} className="h-10 gap-3">
              <Image src="/figma/settings.svg" width={20} height={20} alt="" className="shrink-0" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />} size="lg" tooltip={`${state.profile.name} · Personal workspace`} aria-label={`${state.profile.name} · Personal workspace`} onClick={closeMobile}>
              <UserRoundIcon aria-hidden="true" />
              <span className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{state.profile.name}</span>
                <span className="truncate text-xs text-muted-foreground">Personal workspace</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
