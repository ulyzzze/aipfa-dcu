"use client";

import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const WorkspaceHeader = () => {
  const pathname = usePathname();
  const title = pathname === "/settings" ? "Settings" : navigation.find(({ href }) => href === pathname)?.label;

  return (
    <header data-slot="workspace-header" className="flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-8">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4 data-vertical:self-center" />
      <div className="flex min-w-0 items-center gap-3 text-sm">
        <span className="hidden text-muted-foreground sm:inline">Personal workspace</span>
        <span aria-hidden="true" className="hidden text-muted-foreground/50 sm:inline">/</span>
        <span className="truncate font-medium">{title ?? "AIPFA"}</span>
      </div>
    </header>
  );
};
