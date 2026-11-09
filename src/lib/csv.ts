import Papa from "papaparse";
import { isCategory, isTransaction, type Transaction } from "./demo-data";

export const downloadFile = (contents: string, filename: string, mime = "text/csv;charset=utf-8;") => {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
export const exportTransactions = (transactions: Transaction[]) => downloadFile(Papa.unparse(transactions.map((t) => ({ date: t.date, description: t.description, amount: (t.amount / 100).toFixed(2), category: t.category })), { escapeFormulae: true }), "aipfa-transactions.csv");
export const transactionKey = (t: Transaction) => `${t.date}|${t.description.trim().toLowerCase()}|${t.amount}|${t.category}`;

export const parseImport = (csv: string, existing: Transaction[]) => {
  const result = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: "greedy", transformHeader: (h) => h.trim().toLowerCase() });
  if (result.errors.length) throw new Error(`Invalid CSV: ${result.errors[0].message}`);
  if (!["date", "description", "amount", "category"].every((h) => result.meta.fields?.includes(h))) throw new Error("CSV must contain date, description, amount and category columns.");
  if (result.data.length === 0) throw new Error("This CSV has no transactions.");
  if (result.data.length > 1000) throw new Error("Import up to 1,000 rows at a time.");
  const keys = new Set(existing.map(transactionKey));
  let duplicates = 0;
  const transactions: Transaction[] = [];
  for (const [index, row] of result.data.entries()) {
    const amountText = row.amount?.trim() ?? "";
    if (!/^-?\d+(\.\d{1,2})?$/.test(amountText)) throw new Error(`Row ${index + 2}: use an amount such as -24.50, with a decimal point.`);
    const amount = Math.round(Number(amountText) * 100);
    const category = row.category?.trim();
    if (!(isCategory(category) || category === "Income")) throw new Error(`Row ${index + 2}: unrecognised category.`);
    const t: Transaction = { id: crypto.randomUUID(), date: row.date?.trim(), description: row.description?.trim(), amount, category };
    if (!isTransaction(t)) throw new Error(`Row ${index + 2}: check the date (YYYY-MM-DD), description, amount and category. Positive amounts must use Income.`);
    const key = transactionKey(t);
    if (keys.has(key)) { duplicates++; continue; }
    keys.add(key); transactions.push(t);
  }
  return { transactions, duplicates };
};

export const sampleCsv = (month: string) => `date,description,amount,category\n${month}-09,Weekend market,-28.50,Groceries\n${month}-10,Design workshop,-35.00,Leisure\n${month}-11,Freelance illustration,125.00,Income\n`;
