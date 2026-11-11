import { categories, categoryTotals, createDemoState, defaultMonth, money, monthLabel, monthlyTransactions, totals, type DemoState } from "./demo-data";

// Local, deterministic responses. No model, network calls or data transmission.
export const getDemoReply = (question: string, state: DemoState, month: string, previousQuestion = "") => {
  const normalise = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const input = normalise(question);
  const text = /^(and |what about|et |pourquoi|why|tell me more|more details)/.test(input) ? `${normalise(previousQuestion)} ${input}` : input;
  const rows = monthlyTransactions(state.transactions, month);
  const summary = totals(rows);
  const spending = categoryTotals(rows).sort((a, b) => b.value - a.value);
  const limits = state.budgets[month] ?? createDemoState().budgets[defaultMonth];
  const period = monthLabel(month);
  const categoryWords = {
    Housing: /housing|rent|loyer|logement/,
    Groceries: /grocer|food|courses|alimentation/,
    Transport: /transport|bus|train/,
    Shopping: /shopping|achats/,
    Leisure: /leisure|loisirs|entertainment/,
    Bills: /bills|factures|utilities/,
  };
  const category = categories.find((name) => categoryWords[name].test(input));
  const intro = `For ${period}, based on your demo records`;
  if (/^(hi|hello|hey|bonjour|salut)[!.\s]*$/.test(input)) return `Hello! I can help you explore your fictional finances for ${period}. Ask about your spending, budgets, savings or how this month compares with the previous one.`;
  if (!rows.length) return `There are no transactions for ${period} yet. Add a transaction or import the sample CSV, then ask me again. I only use records in this demo workspace.`;
  if (category) {
    const amount = spending.find((item) => item.category === category)!.value;
    const limit = limits[category];
    const count = rows.filter((row) => row.category === category).length;
    return `${intro}, you spent ${money(amount)} on ${category.toLowerCase()} across ${count} transaction${count === 1 ? "" : "s"}.\n\nYour monthly limit is ${money(limit)}, so you have used ${Math.round(amount / limit * 100)}% of it. ${amount > limit ? `You are ${money(amount - limit)} over this budget.` : `You have ${money(limit - amount)} remaining in this category.`}\n\nYou can review the individual records in Transactions or adjust this limit in Budgets.`;
  }
  if (/compar|last month|previous|trend|dernier|precedent|tendance/.test(text)) {
    const date = new Date(`${month}-01T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - 1);
    const previousMonth = date.toISOString().slice(0, 7);
    const previousRows = monthlyTransactions(state.transactions, previousMonth);
    if (!previousRows.length) return `I can see ${money(summary.expenses)} of expenses for ${period}, but there are no records for ${monthLabel(previousMonth)} to compare against. Import that month's transactions to make a comparison.`;
    const previous = totals(previousRows);
    const difference = summary.expenses - previous.expenses;
    return `Your expenses are ${money(summary.expenses)} in ${period}, compared with ${money(previous.expenses)} in ${monthLabel(previousMonth)}.\n\n${difference === 0 ? "Spending is unchanged." : `That is ${money(Math.abs(difference))} ${difference > 0 ? "more" : "less"}${previous.expenses > 0 ? ` (${(Math.abs(difference) / previous.expenses * 100).toFixed(1)}%)` : ""}.`} These are complete sample months, rather than a forecast.`;
  }
  if (/budget|limit|alert|avert|depasse/.test(text)) {
    const warnings = spending.filter((item) => item.value >= limits[item.category] * 0.8);
    return `${intro}:\n\n${spending.map((item) => `• ${item.category}: ${money(item.value)} of ${money(limits[item.category])} (${Math.round(item.value / limits[item.category] * 100)}%)`).join("\n")}\n\n${warnings.length ? `Keep an eye on ${warnings.map((item) => item.category).join(", ")}: ${warnings.length === 1 ? "this category has" : "these categories have"} reached at least 80% of the monthly limit.` : "All categories are below 80% of their limits."} You can change these limits on the Budgets page.`;
  }
  if (/sav|econom|epargn|reduc|cut|afford/.test(text)) {
    const flexible = spending.filter((item) => item.category === "Shopping" || item.category === "Leisure").reduce((sum, item) => sum + item.value, 0);
    return `${intro}, income is ${money(summary.income)} and expenses are ${money(summary.expenses)}, leaving ${money(summary.savings)} in net savings.\n\n${flexible > 0 ? `Shopping and leisure account for ${money(flexible)}. Reducing those expenses by 10% would leave an extra ${money(Math.round(flexible * 0.1))} this month. Try setting a smaller limit in Budgets and see how it compares with your spending.` : "There are no shopping or leisure expenses recorded to build a reduction scenario from."}\n\nThis is an illustrative scenario using fictional data, not a prediction or financial advice.`;
  }
  if (/spend|summary|summari|overview|depens|resum|income|revenu|money/.test(text)) return `${intro}:\n\n• Income: ${money(summary.income)}\n• Expenses: ${money(summary.expenses)}\n• Net savings: ${money(summary.savings)}\n\n${summary.expenses > 0 ? `${spending[0].category} is your largest expense at ${money(spending[0].value)}, accounting for ${Math.round(spending[0].value / summary.expenses * 100)}% of spending.` : "You have not recorded any expenses this month."}\n\nWould you like to explore a category, check your budgets or compare with last month?`;
  return `I’m a simulated finance assistant, so I can answer questions about the fictional transactions in this workspace. Try “Summarise my spending”, “How are my budgets doing?”, “Where could I save?” or ask about a category such as groceries.\n\nI can’t answer general questions or connect to a bank. My current view is ${period}.`;
};
