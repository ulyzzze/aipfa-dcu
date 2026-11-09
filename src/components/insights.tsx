"use client";

import Link from "next/link";
import { useState } from "react";
import { LightbulbIcon, SparklesIcon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { categoryTotals, createDemoState, defaultMonth, money, monthLabel, monthlyTransactions, totals } from "@/lib/demo-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export const InsightsScreen = () => {
  const { state, month } = useDemo();
  const [question, setQuestion] = useState("summary");
  const [answer, setAnswer] = useState("");
  const summary = totals(monthlyTransactions(state.transactions, month));
  const spending = categoryTotals(monthlyTransactions(state.transactions, month)).sort((a, b) => b.value - a.value);
  const limits = state.budgets[month] ?? createDemoState().budgets[defaultMonth];
  const alerts = spending.filter((s) => s.value >= limits[s.category] * 0.8);
  const flexible = spending.filter((s) => s.category === "Shopping" || s.category === "Leisure").reduce((sum, s) => sum + s.value, 0);
  const top = spending[0];
  const largest = top.value > 0 ? `${top.category} is your largest expense at ${money(top.value)}, accounting for ${(top.value / summary.expenses * 100).toFixed(0)}% of your spending.` : "There are no expenses in this month yet. Add a transaction to see a spending breakdown.";
  const savings = `Your income of ${money(summary.income)} minus expenses of ${money(summary.expenses)} leaves ${money(summary.savings)} in net savings this month.`;
  const budgets = alerts.length ? `Categories to watch: ${alerts.map((s) => `${s.category} (${Math.round(s.value / limits[s.category] * 100)}% used)`).join(", ")}. Review these monthly limits on the Budgets page.` : "All your categories are below 80% of their budget limits this month.";
  const savingIdea = flexible > 0 ? `Shopping and leisure total ${money(flexible)}. Reducing that total by 10% would leave an extra ${money(Math.round(flexible * 0.1))}. This is an example scenario, not a forecast.` : "Record shopping or leisure expenses to explore a simple savings scenario.";

  if (!state.profile.insights) return <Empty><EmptyHeader><EmptyTitle>Demo insights are turned off</EmptyTitle><EmptyDescription>You can enable them again in your workspace preferences.</EmptyDescription></EmptyHeader><Button render={<Link href="/settings" />} nativeButton={false}>Open settings</Button></Empty>;
  return <div className="flex flex-col gap-6">
    <div className="grid gap-4 lg:grid-cols-3">{[
      { title: "Your biggest category", text: largest }, { title: "The bigger picture", text: savings }, { title: "Room to save", text: savingIdea },
    ].map((insight) => <Card key={insight.title}><CardHeader><CardTitle className="flex items-center gap-2"><LightbulbIcon className="size-4" />{insight.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{insight.text}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><SparklesIcon className="size-4" />Explore your finances</CardTitle><CardDescription>Example assistant responses calculated from your demo records for {monthLabel(month)}.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><FieldGroup><Field><FieldLabel htmlFor="insight-question">What would you like to understand?</FieldLabel><div className="flex flex-wrap gap-2"><NativeSelect id="insight-question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full sm:w-auto"><NativeSelectOption value="summary">Summarise my spending</NativeSelectOption><NativeSelectOption value="saving">Where could I save?</NativeSelectOption><NativeSelectOption value="budgets">How are my budgets doing?</NativeSelectOption></NativeSelect><Button onClick={() => setAnswer(question === "summary" ? `${savings} ${largest}` : question === "saving" ? savingIdea : budgets)}>Show demo answer</Button></div></Field></FieldGroup>{answer && <div role="status" className="flex flex-col gap-3 rounded-lg bg-muted p-5"><Badge variant="outline" className="w-fit">Simulated response</Badge><p className="max-w-3xl text-sm leading-relaxed">{answer}</p></div>}</CardContent><CardFooter><p className="text-xs leading-relaxed text-muted-foreground">Demo mode: no AI service is connected and no financial data leaves your browser. General spending information, not financial advice.</p></CardFooter></Card>
  </div>;
};
