"use client";

import { useState, type FormEvent } from "react";
import { DownloadIcon, RotateCcwIcon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { exportTransactions } from "@/lib/csv";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const SettingsScreen = () => {
  const { state, update, notify, reset } = useDemo();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    if (!name || !email) return;
    update((s) => ({ ...s, profile: { ...s.profile, name, email } }));
    notify("Workspace profile saved locally.");
  };
  return <div className="grid items-start gap-6 lg:grid-cols-2">
    <Card><CardHeader><CardTitle>Your profile</CardTitle><CardDescription>A demo identity for your personal workspace.</CardDescription></CardHeader><form key={`${state.profile.name}|${state.profile.email}`} onSubmit={saveProfile}><CardContent><FieldGroup><Field><FieldLabel htmlFor="profile-name">Name</FieldLabel><Input id="profile-name" name="name" required maxLength={80} defaultValue={state.profile.name} /></Field><Field><FieldLabel htmlFor="profile-email">Email</FieldLabel><Input id="profile-email" name="email" type="email" required maxLength={160} defaultValue={state.profile.email} /><FieldDescription>No emails are sent in demo mode.</FieldDescription></Field></FieldGroup></CardContent><CardFooter className="mt-5 justify-end"><Button type="submit">Save profile</Button></CardFooter></form></Card>
    <div className="flex flex-col gap-6"><Card><CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Make this demo workspace yours.</CardDescription></CardHeader><CardContent><Field orientation="horizontal"><div className="flex flex-col gap-1"><FieldLabel htmlFor="insights-enabled">Demo insights</FieldLabel><FieldDescription>Show example spending summaries based on your records.</FieldDescription></div><Switch id="insights-enabled" checked={state.profile.insights} onCheckedChange={(checked) => { update((s) => ({ ...s, profile: { ...s.profile, insights: checked } })); notify(`Demo insights ${checked ? "enabled" : "disabled"}.`); }} /></Field></CardContent></Card>
    <Card><CardHeader><CardTitle>Your demo data</CardTitle><CardDescription>Stored only in this browser. No account or server is connected.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">{state.transactions.length} transactions · Currency EUR</p></CardContent><CardFooter className="flex-wrap gap-2"><Button variant="outline" onClick={() => exportTransactions(state.transactions)}><DownloadIcon data-icon="inline-start" />Export all transactions</Button><Button variant="ghost" onClick={() => setIsResetOpen(true)}><RotateCcwIcon data-icon="inline-start" />Reset demo</Button></CardFooter></Card></div>
    <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}><DialogContent><DialogHeader><DialogTitle>Reset the demo workspace?</DialogTitle><DialogDescription>This replaces your local transactions, budgets and profile with the original sample data. Export a CSV first if you want to keep your transactions.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsResetOpen(false)}>Cancel</Button><Button variant="destructive" onClick={() => { reset(); setIsResetOpen(false); }}>Reset demo data</Button></DialogFooter></DialogContent></Dialog>
  </div>;
};
