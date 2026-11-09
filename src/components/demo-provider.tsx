"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { createDemoState, defaultMonth, demoMonths, isDemoState, type DemoState, type Transaction } from "@/lib/demo-data";

const storageKey = "aipfa-demo-v1";
type DemoContext = {
  state: DemoState; month: string; setMonth: (month: string) => void;
  months: string[]; isReady: boolean; message: string;
  notify: (message: string) => void;
  update: (fn: (state: DemoState) => DemoState) => void;
  saveTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  reset: () => void;
};
const Context = createContext<DemoContext | null>(null);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DemoState>(createDemoState);
  const [month, setMonth] = useState(defaultMonth);
  const [isReady, setIsReady] = useState(false);
  const [message, notify] = useState("");
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isDemoState(parsed)) setState(parsed);
        else setStorageError("Saved demo data could not be read. The original sample data has been restored.");
      }
    } catch { setStorageError("Browser storage is unavailable. Changes will only last for this visit."); }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { setStorageError("Changes could not be saved in this browser. Export a CSV to keep a copy."); }
  }, [state, isReady]);

  const saveTransaction = (transaction: Transaction) => {
    setState((s) => ({ ...s, transactions: [...s.transactions.filter((t) => t.id !== transaction.id), transaction] }));
    setMonth(transaction.date.slice(0, 7));
    notify("Transaction saved. Your statistics have been updated.");
  };
  const removeTransaction = (id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
    notify("Transaction deleted. Your statistics have been updated.");
  };
  const reset = () => { setState(createDemoState()); setMonth(defaultMonth); notify("Demo reset to the original six months of sample data."); };
  const months = [...new Set([...demoMonths, month, ...state.transactions.map((t) => t.date.slice(0, 7))])].sort().reverse();

  return (
    <Context.Provider value={{ state, month, setMonth, months, isReady, message, notify, update: setState, saveTransaction, removeTransaction, reset }}>
      {storageError && <Alert className="mx-auto mt-4 max-w-5xl"><InfoIcon /><AlertTitle>Local storage</AlertTitle><AlertDescription>{storageError}</AlertDescription></Alert>}
      {children}
    </Context.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(Context);
  if (!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
};

export const DemoNotice = () => {
  const { message } = useDemo();
  return (
    <div className="mb-7 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">Demo workspace</Badge>
        <span>Fictional data · Changes saved in this browser only</span>
      </div>
      <p role="status" aria-live="polite" className={message ? "text-sm text-muted-foreground" : "sr-only"}>{message}</p>
    </div>
  );
};
