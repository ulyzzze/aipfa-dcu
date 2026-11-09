import assert from 'node:assert/strict';
import test from 'node:test';
import { createDemoState, monthlyTransactions, totals, categoryTotals, balanceAtMonth, balanceSeries, isDemoState, isTransaction, isDate } from '../src/lib/demo-data.ts';

test('six months of sample records are valid and have unique IDs', () => {
  const state = createDemoState();
  assert.equal(state.transactions.length, 144);
  assert.equal(isDemoState(state), true);
  assert.equal(new Set(state.transactions.map(t => t.id)).size, 144);
});

test('November totals use integer cents and reconcile with categories', () => {
  const rows = monthlyTransactions(createDemoState().transactions, '2026-11');
  const summary = totals(rows);
  assert.equal(summary.income, 300000);
  assert.equal(summary.expenses, 172164);
  assert.equal(summary.savings, 127836);
  assert.equal(categoryTotals(rows).reduce((sum, c) => sum + c.value, 0), summary.expenses);
});

test('daily chart and account balance close at the same amount', () => {
  const { transactions } = createDemoState();
  for (const month of ['2026-06', '2026-10', '2026-11']) {
    const points = balanceSeries(transactions, month);
    assert.equal(points.length, month === '2026-10' ? 31 : 30);
    assert.equal(Math.round(points.at(-1).balance * 100), balanceAtMonth(transactions, month));
  }
});

test('adding and removing an expense updates totals and balances consistently', () => {
  const { transactions } = createDemoState();
  const expense = { id: 'test', description: 'Groceries', date: '2026-11-09', category: 'Groceries', amount: -2499 };
  const changed = [...transactions, expense];
  assert.equal(totals(monthlyTransactions(changed, '2026-11')).expenses, 172164 + 2499);
  assert.equal(balanceAtMonth(changed, '2026-11'), balanceAtMonth(transactions, '2026-11') - 2499);
  assert.deepEqual(changed.filter(t => t.id !== expense.id), transactions);
});

test('bad stored data, impossible dates and malformed amounts are rejected', () => {
  const state = createDemoState();
  assert.equal(isDemoState({ ...state, transactions: [...state.transactions, state.transactions[0]] }), false);
  assert.equal(isTransaction({ ...state.transactions[0], amount: Infinity }), false);
  assert.equal(isTransaction({ ...state.transactions[0], category: 'Groceries' }), false);
  assert.equal(isDate('2026-02-30'), false);
  assert.equal(isDate('2026-99-99'), false);
  assert.equal(isDate('2026-11-09'), true);
  assert.equal(isDemoState(null), false);
});

test('empty periods do not produce NaN or infinite savings rates', () => {
  assert.deepEqual(totals([]), { income: 0, expenses: 0, savings: 0, rate: 0 });
  assert.equal(monthlyTransactions(createDemoState().transactions, '2027-01').length, 0);
});
