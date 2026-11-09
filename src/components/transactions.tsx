"use client";

import { useState, type FormEvent } from "react";
import { DownloadIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { categories, dateLabel, isTransaction, money, monthlyTransactions, type Category, type Transaction } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { exportTransactions } from "@/lib/csv";

export const TransactionTable = ({ transactions, onEdit, onDelete }: { transactions: Transaction[]; onEdit?: (t: Transaction) => void; onDelete?: (t: Transaction) => void }) => (
  <Table>
    <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead>{onEdit && <TableHead className="text-right">Actions</TableHead>}</TableRow></TableHeader>
    <TableBody>{transactions.map((t) => <TableRow key={t.id}>
      <TableCell className="max-w-52 truncate font-medium">{t.description}</TableCell>
      <TableCell className="text-muted-foreground">{dateLabel(t.date)}</TableCell>
      <TableCell><Badge variant="secondary">{t.category}</Badge></TableCell>
      <TableCell className="text-right font-medium tabular-nums">{t.amount > 0 ? "+" : "−"}{money(Math.abs(t.amount))}</TableCell>
      {onEdit && <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" aria-label={`Edit ${t.description}`} onClick={() => onEdit(t)}><PencilIcon /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete ${t.description}`} onClick={() => onDelete?.(t)}><Trash2Icon /></Button></div></TableCell>}
    </TableRow>)}</TableBody>
  </Table>
);

const TransactionForm = ({ transaction, onClose }: { transaction?: Transaction; onClose: () => void }) => {
  const { saveTransaction, month } = useDemo();
  const [type, setType] = useState(transaction && transaction.amount > 0 ? "income" : "expense");
  const [error, setError] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const t: Transaction = { id: transaction?.id ?? crypto.randomUUID(), description: String(form.get("description")).trim(), date: String(form.get("date")), amount: Math.round(Number(form.get("amount")) * 100) * (type === "income" ? 1 : -1), category: type === "income" ? "Income" : form.get("category") as Category };
    if (!isTransaction(t)) { setError("Enter a valid date, description and an amount between €0.01 and €1,000,000."); return; }
    saveTransaction(t); onClose();
  };
  return <form onSubmit={handleSubmit} className="flex flex-col gap-5">
    <FieldGroup>
      <Field><FieldLabel htmlFor="transaction-description">Description</FieldLabel><Input id="transaction-description" name="description" required maxLength={160} defaultValue={transaction?.description} placeholder="e.g. Weekly groceries" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field><FieldLabel htmlFor="transaction-amount">Amount (€)</FieldLabel><Input id="transaction-amount" name="amount" type="number" step="0.01" min="0.01" max="1000000" required defaultValue={transaction ? Math.abs(transaction.amount) / 100 : undefined} placeholder="0.00" /></Field>
        <Field><FieldLabel htmlFor="transaction-date">Date</FieldLabel><Input id="transaction-date" name="date" type="date" min="2000-01-01" max="2099-12-31" required defaultValue={transaction?.date ?? `${month}-09`} /></Field>
      </div>
      <Field><FieldLabel htmlFor="transaction-type">Type</FieldLabel><NativeSelect id="transaction-type" value={type} onChange={(e) => setType(e.target.value)} className="w-full"><NativeSelectOption value="expense">Expense</NativeSelectOption><NativeSelectOption value="income">Income</NativeSelectOption></NativeSelect></Field>
      {type === "expense" && <Field><FieldLabel htmlFor="transaction-category">Category</FieldLabel><NativeSelect id="transaction-category" name="category" defaultValue={transaction?.category === "Income" ? "Groceries" : transaction?.category ?? "Groceries"} className="w-full">{categories.map((category) => <NativeSelectOption key={category}>{category}</NativeSelectOption>)}</NativeSelect></Field>}
      {error && <FieldError role="alert">{error}</FieldError>}
    </FieldGroup>
    <DialogFooter><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit">Save transaction</Button></DialogFooter>
  </form>;
};

export const TransactionsScreen = () => {
  const { state, month, removeTransaction } = useDemo();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction>();
  const [deleting, setDeleting] = useState<Transaction>();
  const filtered = monthlyTransactions(state.transactions, month).filter((t) => t.description.toLowerCase().includes(search.toLowerCase()) && (category === "all" || t.category === category));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount - 1);
  const openNew = () => { setEditing(undefined); setIsOpen(true); };

  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center gap-3">
      <Input aria-label="Search transactions" placeholder="Search transactions…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="sm:max-w-72" />
      <NativeSelect aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}><NativeSelectOption value="all">All categories</NativeSelectOption>{[...categories, "Income"].map((c) => <NativeSelectOption key={c}>{c}</NativeSelectOption>)}</NativeSelect>
      <div className="ml-auto flex gap-2"><Button variant="outline" disabled={filtered.length === 0} onClick={() => exportTransactions(filtered)}><DownloadIcon data-icon="inline-start" />Export</Button><Button onClick={openNew}><PlusIcon data-icon="inline-start" />Add transaction</Button></div>
    </div>
    <div className="min-w-0 rounded-xl border">
      {filtered.length ? <TransactionTable transactions={filtered.slice(currentPage * 10, currentPage * 10 + 10)} onEdit={(t) => { setEditing(t); setIsOpen(true); }} onDelete={setDeleting} /> : <Empty><EmptyHeader><EmptyTitle>No transactions found</EmptyTitle><EmptyDescription>Try a different search, change the month or add your first transaction.</EmptyDescription></EmptyHeader><Button variant="outline" onClick={openNew}>Add transaction</Button></Empty>}
    </div>
    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{filtered.length} transactions · Page {currentPage + 1} of {pageCount}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div>
    <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle><DialogDescription>Update your demo records. Changes stay in this browser.</DialogDescription></DialogHeader>{isOpen && <TransactionForm key={editing?.id ?? "new"} transaction={editing} onClose={() => setIsOpen(false)} />}</DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(undefined); }}><DialogContent><DialogHeader><DialogTitle>Delete transaction?</DialogTitle><DialogDescription>Remove “{deleting?.description}” from your demo records? Your totals will be recalculated.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleting(undefined)}>Cancel</Button><Button variant="destructive" onClick={() => { if (deleting) removeTransaction(deleting.id); setDeleting(undefined); }}>Delete transaction</Button></DialogFooter></DialogContent></Dialog>
  </div>;
};
