"use client";

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { chartCssVars, defaultScatterColors } from "@/components/charts/chart-context";
import { balanceSeries, categoryTotals, money, monthLabel, monthlyTransactions, totals, type Transaction } from "@/lib/demo-data";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export const NoChartData = () => <Empty><EmptyHeader><EmptyTitle>No spending yet</EmptyTitle><EmptyDescription>Add an expense or import sample transactions to see your breakdown.</EmptyDescription></EmptyHeader></Empty>;
export const categoryColors = [...defaultScatterColors, chartCssVars.foregroundMuted];

export const BalanceChart = ({ transactions, month }: { transactions: Transaction[]; month: string }) => {
  const data = useMemo(() => balanceSeries(transactions, month), [transactions, month]);
  const isReducedMotion = useReducedMotion();
  return (
    <figure aria-label={`Daily account balance for ${monthLabel(month)}. Closing balance ${money(data.at(-1)!.balance * 100)}.`}>
      <AreaChart data={data} aspectRatio="auto" className="h-64" margin={{ top: 20, right: 12, bottom: 32, left: 12 }} animationDuration={isReducedMotion ? 0 : 1100}>
        <Grid horizontal numTicksRows={4} />
        <Area dataKey="balance" fill={chartCssVars.linePrimary} fillOpacity={0.16} strokeWidth={2} />
        <XAxis />
        <ChartTooltip content={({ point }) => <div className="flex flex-col gap-1 rounded-lg bg-popover p-3 text-sm text-popover-foreground"><span>Account balance</span><strong>{money(Number(point.balance) * 100)}</strong></div>} />
      </AreaChart>
    </figure>
  );
};

export const CashflowChart = ({ transactions, months }: { transactions: Transaction[]; months: string[] }) => {
  const data = useMemo(() => months.map((month) => {
    const summary = totals(monthlyTransactions(transactions, month));
    return { month: new Intl.DateTimeFormat("en-IE", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`)), income: summary.income / 100, expenses: summary.expenses / 100 };
  }), [transactions, months]);
  const isReducedMotion = useReducedMotion();
  return (
    <figure aria-label="Monthly income compared with expenses">
      <BarChart data={data} xDataKey="month" className="h-64" aspectRatio="auto" margin={{ top: 20, right: 12, bottom: 32, left: 12 }} animationDuration={isReducedMotion ? 0 : 1100}>
        <Grid horizontal numTicksRows={4} />
        <Bar dataKey="income" fill={chartCssVars.linePrimary} />
        <Bar dataKey="expenses" fill={chartCssVars.lineSecondary} />
        <BarXAxis maxLabels={{ base: 3, sm: 6 }} />
        <ChartTooltip showDatePill={false} content={({ point }) => <div className="flex flex-col gap-1 rounded-lg bg-popover p-3 text-sm text-popover-foreground"><strong>{String(point.month)}</strong><span>Income {money(Number(point.income) * 100)}</span><span>Expenses {money(Number(point.expenses) * 100)}</span></div>} />
      </BarChart>
      <figcaption className="mt-3 flex gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-chart-1" />Income</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-chart-2" />Expenses</span></figcaption>
      <table className="sr-only"><caption>Monthly cash flow in euros</caption><thead><tr><th>Month</th><th>Income</th><th>Expenses</th></tr></thead><tbody>{data.map((d) => <tr key={d.month}><th>{d.month}</th><td>{d.income.toFixed(2)}</td><td>{d.expenses.toFixed(2)}</td></tr>)}</tbody></table>
    </figure>
  );
};

export const SpendingChart = ({ transactions }: { transactions: Transaction[] }) => {
  const data = useMemo(() => categoryTotals(transactions).map((d, i) => ({ label: d.category, value: d.value / 100, color: categoryColors[i] })).filter((d) => d.value > 0), [transactions]);
  const isReducedMotion = useReducedMotion();
  if (data.length === 0) return <NoChartData />;
  return (
    <figure aria-label="Expense breakdown by category" className="flex flex-col items-center gap-4">
      <PieChart data={data} size={230} innerRadius={77} padAngle={0.035} cornerRadius={4}>
        {data.map((d, index) => <PieSlice key={d.label} index={index} animate={!isReducedMotion} />)}
        <PieCenter defaultLabel="Total spent">{({ value, label }) => <div className="flex flex-col items-center gap-2"><span className="text-xl font-semibold tabular-nums">{money(Math.round(value * 100))}</span><span className="text-xs text-muted-foreground">{label}</span></div>}</PieCenter>
      </PieChart>
      <figcaption className="grid w-full grid-cols-2 gap-x-5 gap-y-3 text-xs">{data.map((d) => <div className="flex min-w-0 items-center gap-2" key={d.label}><span className="size-2 shrink-0 rounded-full" style={{ background: d.color }} /><span className="truncate text-muted-foreground">{d.label}</span><span className="ml-auto tabular-nums">{money(d.value * 100)}</span></div>)}</figcaption>
    </figure>
  );
};

export const BudgetRing = ({ spent, limit, index, label }: { spent: number; limit: number; index: number; label: string }) => {
  const isReducedMotion = useReducedMotion();
  const percent = Math.round(spent / limit * 100);
  return <figure className="relative size-28 shrink-0" aria-label={`${label}: ${percent}% used, ${money(spent)} out of ${money(limit)}`}>
    <RingChart data={[{ label, value: Math.min(spent, limit), maxValue: limit, color: categoryColors[index] }]} size={112} strokeWidth={8} baseInnerRadius={34}>
      <Ring index={0} animate={!isReducedMotion} showGlow={false} />
    </RingChart>
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums">{percent}%</div>
  </figure>;
};
