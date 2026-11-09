"use client";

import Link from "next/link";
import { UploadIcon } from "lucide-react";
import { DemoNotice, useDemo } from "@/components/demo-provider";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { monthLabel } from "@/lib/demo-data";
import { Overview } from "@/components/overview";
import { TransactionsScreen } from "@/components/transactions";
import { BudgetsScreen } from "@/components/budgets";
import { ImportScreen } from "@/components/import-data";
import { InsightsScreen } from "@/components/insights";
import { SettingsScreen } from "@/components/settings";

const screens = {
  overview: { title: "Overview", description: "A clearer picture of your money, all in one place.", Component: Overview },
  transactions: { title: "Transactions", description: "Keep track of the money coming in and going out.", Component: TransactionsScreen },
  budgets: { title: "Budgets", description: "Give every category a budget that works for you.", Component: BudgetsScreen },
  insights: { title: "AI insights", description: "Understand your spending habits and find opportunities to save.", Component: InsightsScreen },
  import: { title: "Import data", description: "Bring your bank transactions together with a CSV import.", Component: ImportScreen },
  settings: { title: "Settings", description: "Manage your personal workspace and preferences.", Component: SettingsScreen },
};
export type Screen = keyof typeof screens;

export const FinanceScreen = ({ section }: { section: Screen }) => {
  const { month, setMonth, months, isReady } = useDemo();
  const { title, description, Component } = screens[section];
  return <>
    <DemoNotice />
    <div className="mb-8"><PageHeader title={title} description={description}>
      {section !== "settings" && <NativeSelect aria-label="Select month" value={month} onChange={(e) => setMonth(e.target.value)}>{months.map((m) => <NativeSelectOption key={m} value={m}>{monthLabel(m)}</NativeSelectOption>)}</NativeSelect>}
      {section === "overview" && <Button render={<Link href="/import" />} nativeButton={false}><UploadIcon data-icon="inline-start" />Import data</Button>}
    </PageHeader></div>
    {isReady ? <Component key={section === "insights" ? month : section} /> : <div aria-label="Loading your demo workspace" className="flex flex-col gap-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-80 w-full" /></div>}
  </>;
};
