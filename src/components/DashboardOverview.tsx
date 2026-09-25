import React, { useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Users,
  CreditCard,
  Banknote,
  QrCode,
  PlusCircle,
  FileText,
  Receipt,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { CashFlowSummary } from '../utils/budgetEngine';
import { BusinessProfile, Transaction, Invoice } from '../types';

interface DashboardOverviewProps {
  summary: CashFlowSummary;
  profile: BusinessProfile;
  transactions: Transaction[];
  invoices: Invoice[];
  onOpenScanner: () => void;
  onOpenNewIncome: () => void;
  onOpenNewExpense: () => void;
  onOpenCreateInvoice: () => void;
  onOpenIssueReceipt: () => void;
  onOpenGenerator: () => void;
  onOpenManualReceiptLogger?: () => void;
  onSwitchTab: (tab: 'ledger' | 'suggestions' | 'payroll' | 'invoices' | 'receipts' | 'debts' | 'reports') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  profile,
  transactions,
  invoices,
  onOpenScanner,
  onOpenNewIncome,
  onOpenNewExpense,
  onOpenCreateInvoice,
  onOpenIssueReceipt,
  onOpenGenerator,
  onOpenManualReceiptLogger,
  onSwitchTab,
}) => {
  const sym = profile.currencySymbol || '₦';

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const ownerDisplayName = profile.ownerName || 'Business Owner';

  // Compute Today's sales and expenses
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayStats = useMemo(() => {
    const todayTxs = transactions.filter((t) => t.date === todayStr);
    const salesToday = todayTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expensesToday = todayTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const estimatedProfit = salesToday - expensesToday;

    return {
      salesToday,
      expensesToday,
      estimatedProfit,
      count: todayTxs.length,
    };
  }, [transactions, todayStr]);

  // Compute total unpaid customer debts from credit sales & invoices
  const totalCustomerDebt = useMemo(() => {
    return invoices
      .filter((i) => i.status !== 'paid')
      .reduce((sum, i) => sum + i.balanceDue, 0);
  }, [invoices]);

  const currentCashBalance = useMemo(() => {
    const movement = transactions.reduce(
      (balance, transaction) => balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
      0
    );
    return (profile.openingCash || 0) + movement;
  }, [profile.openingCash, transactions]);

  // Empty dashboard state check
  const isDashboardEmpty = transactions.length === 0;

  // Formatted date for dashboard header
  const formattedTodayDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Message Card - Appealing, spacious layout on desktop */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/70 to-teal-50/40 border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative watermark */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-teal-500/5 blur-2xl pointer-events-none" />
        <div className="absolute right-4 top-4 hidden md:block opacity-[0.04] pointer-events-none">
          <Wallet className="w-32 h-32 text-teal-900" />
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          {/* Top Metadata Row: Business identity & live status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 border border-teal-200/60 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {profile.businessName || 'Business'}
              </span>
              {profile.communityLocation && (
                <span className="text-xs text-slate-500 font-medium">
                  • {profile.communityLocation}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud Backend Live
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedTodayDate}
              </span>
            </div>
          </div>

          {/* Main Greeting & Action Bar: Text has ample breathing room and is never pushed */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Greeting and subtitle with full breathing room */}
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {greeting}, {ownerDisplayName}.
              </h2>
              <p className="text-sm text-slate-600 font-normal">
                Here is your real-time financial performance overview. Log daily transactions or create verified invoices and receipts.
              </p>
            </div>

            {/* Right: Structured action buttons with clear visual hierarchy */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Primary Direct Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenNewIncome}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-4 py-2.5 text-xs shadow-sm hover:shadow transition"
                  title="Track money received or spent"
                >
                  <PlusCircle className="w-4 h-4 text-teal-100" />
                  <span>Add a record</span>
                </button>
                <button
                  onClick={onOpenScanner}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold px-3.5 py-2.5 text-xs shadow-sm transition"
                  title="Scan thermal POS paper receipt"
                >
                  <QrCode className="w-4 h-4 text-slate-900" />
                  <span>Scan receipt</span>
                </button>
              </div>

              {/* Separator on desktop */}
              <div className="hidden sm:block h-6 w-px bg-slate-200" />

              {/* Document Tools */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={onOpenCreateInvoice}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-slate-900 font-bold px-3 py-2 text-xs shadow-2xs transition"
                  title="Create invoice for customer"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={onOpenIssueReceipt}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-slate-900 font-bold px-3 py-2 text-xs shadow-2xs transition"
                  title="Issue verified receipt"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Receipt</span>
                </button>
                {onOpenManualReceiptLogger && (
                  <button
                    onClick={onOpenManualReceiptLogger}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-200/80 bg-teal-50/70 hover:bg-teal-100 active:scale-95 text-teal-900 font-bold px-3 py-2 text-xs shadow-2xs transition"
                    title="Log receipt using POS or bank transaction number"
                  >
                    <Hash className="w-3.5 h-3.5 text-teal-700" />
                    <span>Log by Txn #</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty Transactions State helper banner if user is starting fresh */}
      {isDashboardEmpty && (
        <div className="rounded-2xl border-2 border-dashed border-teal-200/80 bg-teal-50/30 p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-2xs">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-slate-900">
              Ready for real business records
            </h3>
            <p className="text-xs text-slate-500">
              Your real backend is active and connected. Log your first sale, scan a receipt slip, or create an invoice to start building your ledger.
            </p>
          </div>
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={onOpenNewIncome}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 text-xs shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record first sale</span>
            </button>
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 text-xs transition"
            >
              <QrCode className="w-3.5 h-3.5 text-teal-600" />
              <span>Scan POS receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Standard Summary Cards specified in the brief */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sales today */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sales today
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {sym}{todayStats.salesToday.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Money received from customers</span>
          </div>
        </div>

        {/* 2. Expenses today */}
        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Expenses today
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {sym}{todayStats.expensesToday.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Money spent on the business</span>
          </div>
        </div>

        {/* 3. Estimated profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 transition">
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
              todayStats.estimatedProfit >= 0 ? 'text-teal-700' : 'text-rose-600'
            }`}
          >
            {sym}{todayStats.estimatedProfit.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Sales minus expenses</span>
          </div>
        </div>

        {/* 4. Cash balance */}
        <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Cash balance
            </span>
            <div className="rounded-xl bg-teal-100 p-2 text-teal-800">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-950">
            {sym}{currentCashBalance.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-teal-800 border-t border-teal-100 pt-2">
            <span>Opening cash plus recorded movement</span>
          </div>
        </div>

        {/* 5. Customers owing you */}
        <div
          onClick={() => onSwitchTab('debts')}
          className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs hover:shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Customers owing you
            </span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-950">
            {sym}{totalCustomerDebt.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-800 border-t border-amber-200/60 pt-2">
            <span>Total unpaid credit sales</span>
            <span className="font-bold underline text-amber-900">View debts →</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 px-2">Quick Navigation:</span>
          <button
            onClick={() => onSwitchTab('debts')}
            className="flex items-center gap-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-semibold transition"
          >
            <Users className="w-3.5 h-3.5 text-amber-700" /> Track Customer Debts
          </button>
          <button
            onClick={() => onSwitchTab('reports')}
            className="flex items-center gap-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 py-1.5 text-xs font-semibold transition"
          >
            <Wallet className="w-3.5 h-3.5 text-teal-600" /> Simple Reports
          </button>
          <button
            onClick={() => onSwitchTab('invoices')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" /> Invoices & Receipts
          </button>
          <button
            onClick={() => onSwitchTab('suggestions')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Smart Suggestions
          </button>
          <button
            onClick={() => onSwitchTab('payroll')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-semibold transition"
          >
            <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Staff & Wages
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-semibold transition active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Log Expense
          </button>
        </div>
      </div>
    </div>
  );
};
