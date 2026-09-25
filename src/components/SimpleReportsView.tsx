import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { Transaction, Invoice, BusinessProfile } from '../types';

interface SimpleReportsViewProps {
  transactions: Transaction[];
  invoices: Invoice[];
  profile: BusinessProfile;
  onExportCSV: () => void;
}

export const SimpleReportsView: React.FC<SimpleReportsViewProps> = ({
  transactions,
  invoices,
  profile,
  onExportCSV,
}) => {
  const sym = profile.currencySymbol || '₦';
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter transactions based on date
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Compute start of week (Sunday or Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Compute start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (timeFilter === 'today') {
        return tx.date === todayStr;
      }
      if (timeFilter === 'week') {
        return txDate >= startOfWeek;
      }
      if (timeFilter === 'month') {
        return txDate >= startOfMonth;
      }
      return true;
    });
  }, [transactions, timeFilter]);

  // Calculations
  const moneyReceived = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const moneySpent = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const estimatedProfit = moneyReceived - moneySpent;

  // Unpaid customer debts from invoices
  const unpaidCustomerDebts = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + i.balanceDue, 0);

  // Best-selling items / revenue streams
  const bestSellingItems = useMemo(() => {
    const itemsMap: Record<string, { count: number; total: number; title: string }> = {};

    filteredTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        // Group by title simplified or category
        const key = t.title.split('-')[0].trim() || t.category;
        if (!itemsMap[key]) {
          itemsMap[key] = { count: 0, total: 0, title: key };
        }
        itemsMap[key].count += 1;
        itemsMap[key].total += t.amount;
      });

    return Object.values(itemsMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const totalExp = moneySpent || 1;

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category.replace(/_/g, ' ');
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / totalExp) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, moneySpent]);

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
            Executive Summary
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Understand your business without difficult calculations.
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            See a simple summary of your sales, expenses, and estimated profit for today, this week, or this month.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'today' ? 'bg-white text-teal-800 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'week' ? 'bg-white text-teal-800 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              This week
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'month' ? 'bg-white text-teal-800 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              This month
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeFilter === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              All time
            </button>
          </div>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold shadow-2xs transition"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 4 Core Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Money received */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Money received
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {sym}{moneyReceived.toLocaleString()}
          </div>
          <p className="mt-2 text-[11px] text-emerald-700 font-medium border-t border-slate-100 pt-2">
            Total sales & income recorded
          </p>
        </div>

        {/* Card 2: Money spent */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Money spent
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {sym}{moneySpent.toLocaleString()}
          </div>
          <p className="mt-2 text-[11px] text-rose-700 font-medium border-t border-slate-100 pt-2">
            Staff payroll, supplies & overheads
          </p>
        </div>

        {/* Card 3: Estimated profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimated profit
            </span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-black ${
              estimatedProfit >= 0 ? 'text-teal-700' : 'text-rose-600'
            }`}
          >
            {sym}{estimatedProfit.toLocaleString()}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Sales minus expenses ({estimatedProfit >= 0 ? 'Surplus' : 'Deficit'})
          </p>
        </div>

        {/* Card 4: Unpaid customer debts */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Unpaid customer debts
            </span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-950">
            {sym}{unpaidCustomerDebts.toLocaleString()}
          </div>
          <p className="mt-2 text-[11px] text-amber-800 font-medium border-t border-amber-100 pt-2">
            Total pending credit sales
          </p>
        </div>
      </div>

      {/* 2 Detailed Breakdown Cards: Best-selling items & Expenses by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 5: Best-selling items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Best-selling items</h3>
            </div>
            <span className="text-xs text-slate-400">Top revenue items</span>
          </div>

          {bestSellingItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No sales recorded for this period yet.
            </div>
          ) : (
            <div className="space-y-3">
              {bestSellingItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 capitalize truncate max-w-[220px]">
                      {item.title}
                    </span>
                    <span className="font-mono font-bold text-teal-800">
                      {sym}{item.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((item.total / (moneyReceived || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 6: Expenses by category */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Expenses by category</h3>
            </div>
            <span className="text-xs text-slate-400">Cost distribution</span>
          </div>

          {expensesByCategory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No expenses recorded for this period yet.
            </div>
          ) : (
            <div className="space-y-3">
              {expensesByCategory.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 capitalize">
                      {cat.category}
                    </span>
                    <span className="font-mono text-slate-600">
                      {sym}{cat.amount.toLocaleString()}{' '}
                      <span className="text-slate-400 text-[10px]">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
