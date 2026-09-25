import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Eye,
  Printer,
  Trash2,
  Edit2,
  CheckCircle2,
  Download,
  ShieldCheck,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { Transaction, BusinessProfile } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  profile: BusinessProfile;
  onViewReceipt: (tx: Transaction) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCSV: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  profile,
  onViewReceipt,
  onEditTransaction,
  onDeleteTransaction,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'pos' | 'cash' | 'archived'>('all');

  const sym = profile.currencySymbol || '₦';

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter tab
      if (filterType === 'income' && t.type !== 'income') return false;
      if (filterType === 'expense' && t.type !== 'expense') return false;
      if (filterType === 'pos' && t.paymentMethod !== 'pos_agent') return false;
      if (filterType === 'cash' && t.paymentMethod !== 'cash') return false;
      if (filterType === 'archived' && !t.receiptPhotoUrl && !t.barcodeOrQrCode) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesPayer = t.payerOrPayee?.toLowerCase().includes(q);
        const matchesRef = t.referenceNumber?.toLowerCase().includes(q);
        const matchesAgent = t.posAgentName?.toLowerCase().includes(q);
        const matchesCat = t.category?.toLowerCase().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q);
        return matchesTitle || matchesPayer || matchesRef || matchesAgent || matchesCat || matchesNotes;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, receipt #, POS agent, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Export CSV button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold shadow-2xs transition active:scale-95"
            title="Export spreadsheet for school board / audit"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filterType === 'income'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Fees / Income ({transactions.filter((t) => t.type === 'income').length})
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filterType === 'expense'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Expenses & Salaries ({transactions.filter((t) => t.type === 'expense').length})
        </button>
        <button
          onClick={() => setFilterType('pos')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
            filterType === 'pos'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3 h-3" /> POS Agent Slips
        </button>
        <button
          onClick={() => setFilterType('cash')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
            filterType === 'cash'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Banknote className="w-3 h-3" /> Cash in Hand
        </button>
        <button
          onClick={() => setFilterType('archived')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
            filterType === 'archived'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-amber-500" /> Ink Guarded ({transactions.filter((t) => t.receiptPhotoUrl || t.barcodeOrQrCode).length})
        </button>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700">No records found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? 'Try changing your search terms or filter criteria.'
              : 'Start by scanning a receipt barcode or recording a cash fee.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-400 transition"
            >
              {/* Left Column: Icon + Description */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`rounded-xl p-2.5 shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {tx.title}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 capitalize">
                      {tx.category.replace(/_/g, ' ')}
                    </span>
                    {tx.paymentMethod === 'pos_agent' && (
                      <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        💳 {tx.posAgentName || 'POS Agent'}
                      </span>
                    )}
                    {tx.paymentMethod === 'cash' && (
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        💵 Cash
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                    {tx.payerOrPayee && (
                      <span className="font-medium text-slate-700">
                        {tx.type === 'income' ? 'From: ' : 'To: '}
                        {tx.payerOrPayee}
                      </span>
                    )}
                    <span>Ref: <span className="font-mono text-slate-600">{tx.referenceNumber}</span></span>
                    <span>{tx.date}</span>
                  </div>

                  {/* Faded Ink Protection Badges */}
                  {(tx.receiptPhotoUrl || tx.barcodeOrQrCode) && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        {tx.receiptPhotoUrl ? 'Photo Archived (Ink-Safe)' : 'Barcode Verified'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Amount + Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 shrink-0 gap-1.5">
                <div
                  className={`text-base sm:text-lg font-black ${
                    tx.type === 'income' ? 'text-teal-700' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {sym}
                  {tx.amount.toLocaleString()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewReceipt(tx)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-800 px-2 py-1 text-[11px] font-bold transition shadow-2xs"
                    title="View & Print Digital Receipt Slip"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  <button
                    onClick={() => onEditTransaction(tx)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Record"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this transaction record?')) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
