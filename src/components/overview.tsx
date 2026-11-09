"use client";

import Link from "next/link";
import { ArrowDownLeftIcon, ArrowUpRightIcon, PiggyBankIcon, WalletIcon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { balanceAtMonth, money, monthLabel, monthlyTransactions, totals } from "@/lib/demo-data";
import { BalanceChart, CashflowChart, SpendingChart } from "@/components/finance-charts";
import { TransactionTable } from "@/components/transactions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export const Overview = () => {
  const { state, month, months } = useDemo();
  const transactions = monthlyTransactions(state.transactions, month);
  const summary = totals(transactions);
  const previous = months.filter((m) => m < month).sort().at(-1);
  const previousSummary = previous ? totals(monthlyTransactions(state.transactions, previous)) : null;
  const expenseChange = previousSummary && previousSummary.expenses > 0 ? (summary.expenses - previousSummary.expenses) / previousSummary.expenses * 100 : null;
  const metrics = [
    { title: "Account balance", value: balanceAtMonth(state.transactions, month), caption: "Opening balance + recorded transactions", icon: WalletIcon },
    { title: "Income", value: summary.income, caption: "Salary and other income this month", icon: ArrowDownLeftIcon },
    { title: "Expenses", value: summary.expenses, caption: expenseChange === null ? "All expenses this month" : `${Math.abs(expenseChange).toFixed(1)}% ${expenseChange <= 0 ? "less" : "more"} than ${monthLabel(previous!)}`, icon: ArrowUpRightIcon },
    { title: "Net savings", value: summary.savings, caption: `${summary.rate.toFixed(1)}% of this month’s income`, icon: PiggyBankIcon },
  ];
  const trendMonths = months.filter((m) => m <= month).sort().slice(-6);
  return <div className="flex flex-col gap-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ title, value, caption, icon: Icon }) => <Card key={title}><CardHeader><CardDescription>{title}</CardDescription><CardAction><Icon className="size-4 text-muted-foreground" aria-hidden="true" /></CardAction></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight tabular-nums">{money(value)}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption}</p></CardContent></Card>)}</div>
    <div className="grid min-w-0 gap-6 xl:grid-cols-5">
      <Card className="min-w-0 xl:col-span-3"><CardHeader><CardTitle>Balance over time</CardTitle><CardDescription>Your daily balance · {monthLabel(month)}</CardDescription><CardAction><Badge variant="outline">EUR</Badge></CardAction></CardHeader><CardContent><BalanceChart transactions={state.transactions} month={month} /></CardContent><CardFooter><p className="text-xs text-muted-foreground">Includes a fictional opening balance of €3,250.</p></CardFooter></Card>
      <Card className="min-w-0 xl:col-span-2"><CardHeader><CardTitle>Where your money goes</CardTitle><CardDescription>Expenses by category this month</CardDescription></CardHeader><CardContent><SpendingChart transactions={transactions} /></CardContent></Card>
    </div>
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <Card className="min-w-0"><CardHeader><CardTitle>Income vs. expenses</CardTitle><CardDescription>The last {trendMonths.length} months in your workspace</CardDescription></CardHeader><CardContent><CashflowChart transactions={state.transactions} months={trendMonths} /></CardContent></Card>
      <Card className="min-w-0"><CardHeader><CardTitle>Recent transactions</CardTitle><CardDescription>Your latest activity in {monthLabel(month)}</CardDescription><CardAction><Button variant="ghost" size="sm" render={<Link href="/transactions" />} nativeButton={false}>View all <ArrowUpRightIcon data-icon="inline-end" /></Button></CardAction></CardHeader><CardContent>{transactions.length ? <TransactionTable transactions={transactions.slice(0, 5)} /> : <Empty><EmptyHeader><EmptyTitle>No transactions this month</EmptyTitle></EmptyHeader></Empty>}</CardContent></Card>
    </div>
  </div>;
};
