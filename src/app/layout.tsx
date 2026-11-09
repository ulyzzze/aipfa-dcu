import type { Metadata } from "next";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "AIPFA · Personal Finance",
  description: "AI Personal Finance Assistant · Group G · DCU",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body className="font-sans antialiased">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <div className="min-h-dvh md:flex">
        <Sidebar />
        <main id="main-content" className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
      </div>
    </body>
  </html>
);

export default RootLayout;
