"use client";

import { type FormEvent } from "react";
import { AlertTriangleIcon, SaveIcon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { categoryTotals, createDemoState, defaultMonth, money, monthLabel, monthlyTransactions } from "@/lib/demo-data";
import { BudgetRing } from "@/components/finance-charts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const BudgetsScreen = () => {
  const { state, month, update, notify } = useDemo();
  const limits = state.budgets[month] ?? createDemoState().budgets[defaultMonth];
  const spending = categoryTotals(monthlyTransactions(state.transactions, month));
  const budgetTotal = Object.values(limits).reduce((sum, limit) => sum + limit, 0);
  const spentTotal = spending.reduce((sum, s) => sum + s.value, 0);
  const warnings = spending.filter((s) => s.value >= limits[s.category] * 0.8);
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = { ...limits };
    for (const s of spending) {
      const value = Math.round(Number(form.get(s.category)) * 100);
      if (!Number.isSafeInteger(value) || value <= 0 || value > 100000000) { notify("Enter a budget between €0.01 and €1,000,000 for each category."); return; }
      next[s.category] = value;
    }
    update((s) => ({ ...s, budgets: { ...s.budgets, [month]: next } }));
    notify(`Budgets saved for ${monthLabel(month)}.`);
  };
  return <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Monthly budget remaining</p><p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{money(budgetTotal - spentTotal)}</p><p className="mt-2 text-sm text-muted-foreground">{money(spentTotal)} spent out of {money(budgetTotal)}</p></div><Badge variant="outline">{monthLabel(month)}</Badge></div>
    {warnings.length > 0 && <Alert><AlertTriangleIcon /><AlertTitle>Keep an eye on these categories</AlertTitle><AlertDescription>{warnings.map((s) => `${s.category}: ${Math.round(s.value / limits[s.category] * 100)}% used`).join(" · ")}. Alerts appear at 80% and 100% of a category budget.</AlertDescription></Alert>}
    <form key={month} onSubmit={save} className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{spending.map((s, index) => {
        const percent = Math.round(s.value / limits[s.category] * 100);
        return <Card key={s.category}><CardHeader><CardTitle>{s.category}</CardTitle><CardDescription>{money(s.value)} spent this month</CardDescription></CardHeader><CardContent><div className="flex items-center gap-4"><BudgetRing spent={s.value} limit={limits[s.category]} index={index} label={s.category} /><div className="flex flex-col gap-2"><Badge variant={percent >= 100 ? "destructive" : percent >= 80 ? "outline" : "secondary"}>{percent >= 100 ? "Over budget" : percent >= 80 ? "Near limit" : "On track"}</Badge><p className="text-xs text-muted-foreground">{money(Math.abs(limits[s.category] - s.value))} {s.value > limits[s.category] ? "over limit" : "remaining"}</p></div></div></CardContent><CardFooter><FieldGroup><Field><FieldLabel htmlFor={`budget-${s.category}`}>Monthly limit (€)</FieldLabel><Input id={`budget-${s.category}`} name={s.category} type="number" required min="0.01" max="1000000" step="0.01" defaultValue={limits[s.category] / 100} /></Field></FieldGroup></CardFooter></Card>;
      })}</div>
      <div className="flex justify-end"><Button type="submit"><SaveIcon data-icon="inline-start" />Save monthly budgets</Button></div>
    </form>
  </div>;
};
