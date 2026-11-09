"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside data-slot="sidebar" data-testid="sidebar" className="flex shrink-0 flex-col gap-[14px] border border-line bg-white p-6 md:sticky md:top-0 md:h-dvh md:min-h-[700px] md:w-[232px]" aria-label="Workspace">
      <Link href="/" aria-label="AIPFA home" className="flex h-[70px] shrink-0 items-start gap-[10px]">
        <span className="rounded-[11px] bg-ink p-[7px]">
          {/* Assets retain the original Figma dimensions. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/mark.svg" width="20" height="20" alt="" />
        </span>
        <span className="text-[25px] leading-[1.4] font-semibold">aipfa</span>
      </Link>
      <nav aria-label="Main navigation" className="flex gap-[14px] overflow-x-auto md:flex-col">
        {navigation.map(({ href, label, icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex h-[46px] shrink-0 items-start gap-3 rounded-xl p-3 text-sm leading-[1.4] transition-colors hover:bg-selected ${pathname === href ? "bg-selected font-semibold" : "bg-white font-normal"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/figma/${icon}.svg`} width="20" height="20" alt="" />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="hidden min-h-6 flex-1 md:block" />
      <div className="flex items-start justify-between gap-[14px] md:flex-col">
        <Link href="/settings" aria-current={pathname === "/settings" ? "page" : undefined} className="flex h-11 items-start gap-3 rounded-md text-sm leading-[1.4] hover:text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/settings.svg" width="20" height="20" alt="" />
          Settings
        </Link>
        <div className="h-12 leading-[1.4]">
          <p className="text-[13px] font-medium">Ulysse Couchoud</p>
          <p className="text-[11px] text-muted">Personal workspace</p>
        </div>
      </div>
    </aside>
  );
};
