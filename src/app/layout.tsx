import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/sidebar";
import { WorkspaceHeader } from "@/components/workspace-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/components/demo-provider";

export const metadata: Metadata = {
  title: "AIPFA · Personal Finance",
  description: "AI Personal Finance Assistant · Group G · DCU",
  icons: { icon: "/figma/insights.svg" },
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body className="font-sans antialiased">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
      <DemoProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-w-0">
            <WorkspaceHeader />
            <div id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 outline-none md:px-10 md:py-12">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
      </DemoProvider>
    </body>
  </html>
);

export default RootLayout;
