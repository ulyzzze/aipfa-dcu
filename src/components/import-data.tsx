"use client";

import { useRef, useState } from "react";
import { DownloadIcon, FileSpreadsheetIcon, UploadIcon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { parseImport, sampleCsv, downloadFile, transactionKey } from "@/lib/csv";
import { categories, type Transaction } from "@/lib/demo-data";
import { TransactionTable } from "@/components/transactions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export const ImportScreen = () => {
  const { state, month, update, setMonth, notify } = useDemo();
  const [preview, setPreview] = useState<Transaction[]>([]);
  const [duplicates, setDuplicates] = useState(0);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const prepare = (csv: string, name: string) => {
    try { const parsed = parseImport(csv, state.transactions); setPreview(parsed.transactions); setDuplicates(parsed.duplicates); setFilename(name); setError(""); }
    catch (err) { setPreview([]); setFilename(""); setError(err instanceof Error ? err.message : "Could not read this CSV."); }
  };
  const importRows = () => {
    const existing = new Set(state.transactions.map(transactionKey));
    const rows = preview.filter((t) => !existing.has(transactionKey(t)));
    update((s) => ({ ...s, transactions: [...s.transactions, ...rows] }));
    if (rows[0]) setMonth(rows[0].date.slice(0, 7));
    notify(`${rows.length} transactions imported. Duplicate records were skipped.`);
    setPreview([]); setFilename(""); if (fileRef.current) fileRef.current.value = "";
  };
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Bring your transactions together</CardTitle><CardDescription>Try the sample statement or choose a CSV from your computer.</CardDescription></CardHeader><CardContent className="flex flex-col items-center gap-5 rounded-lg py-8"><FileSpreadsheetIcon className="size-10 text-muted-foreground" /><div className="flex flex-wrap justify-center gap-2"><Button onClick={() => prepare(sampleCsv(month), "Sample statement.csv")}><UploadIcon data-icon="inline-start" />Preview sample import</Button><Button variant="outline" onClick={() => fileRef.current?.click()}>Choose CSV file</Button></div><Field className="max-w-xs"><FieldLabel htmlFor="csv-file" className="sr-only">Upload CSV statement</FieldLabel><Input ref={fileRef} id="csv-file" type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (file.size > 1000000) { setError("Choose a CSV smaller than 1 MB."); setPreview([]); setFilename(""); return; }
        try { prepare(await file.text(), file.name); } catch { setError("Could not open this file. Try another CSV."); setPreview([]); setFilename(""); }
        if (fileRef.current) fileRef.current.value = "";
      }} /></Field><p className="text-xs text-muted-foreground">CSV only · Up to 1 MB / 1,000 rows · Processed in your browser</p></CardContent><CardFooter><Button variant="ghost" onClick={() => downloadFile(sampleCsv(month), "aipfa-sample.csv")}><DownloadIcon data-icon="inline-start" />Download sample CSV</Button></CardFooter></Card>
      <Card><CardHeader><CardTitle>CSV format</CardTitle><CardDescription>One transaction per row</CardDescription></CardHeader><CardContent className="flex flex-col gap-4 text-sm"><p>Columns: <code className="text-xs">date, description, amount, category</code></p><p className="text-muted-foreground">Dates use YYYY-MM-DD. Amounts are in euros: negative for expenses, positive for Income.</p><p className="text-xs leading-relaxed text-muted-foreground">Categories: {categories.join(", ")}, Income.</p><p className="text-xs text-muted-foreground">Same date, description, amount and category? We skip the duplicate.</p></CardContent></Card>
    </div>
    {error && <Alert variant="destructive"><AlertTitle>Import could not be prepared</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
    {filename && <Card><CardHeader><CardTitle>Import preview</CardTitle><CardDescription>{filename} · {preview.length} new transactions · {duplicates} duplicates skipped</CardDescription></CardHeader><CardContent>{preview.length ? <><TransactionTable transactions={preview.slice(0, 10)} />{preview.length > 10 && <p className="mt-3 text-xs text-muted-foreground">Showing the first 10 of {preview.length} rows.</p>}</> : <Badge variant="secondary">All rows are already in your workspace</Badge>}</CardContent><CardFooter className="justify-end gap-2"><Button variant="outline" onClick={() => { setPreview([]); setFilename(""); }}>Cancel</Button><Button disabled={preview.length === 0} onClick={importRows}>Import {preview.length} transactions</Button></CardFooter></Card>}
  </div>;
};
