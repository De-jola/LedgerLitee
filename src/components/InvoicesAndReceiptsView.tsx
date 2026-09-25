import React, { useState, useMemo } from 'react';
import {
  FileText,
  Receipt,
  Plus,
  Search,
  Printer,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  DollarSign,
  Download,
  Calendar,
  Hash,
} from 'lucide-react';
import { Invoice, IssuedReceipt, BusinessProfile } from '../types';
import { getBusinessCopy } from '../utils/businessCopy';

interface InvoicesAndReceiptsViewProps {
  invoices: Invoice[];
  issuedReceipts: IssuedReceipt[];
  profile: BusinessProfile;
  onCreateInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onIssueReceipt: (forInvoice?: Invoice) => void;
  onViewIssuedReceipt: (receipt: IssuedReceipt) => void;
  onDeleteIssuedReceipt: (id: string) => void;
  onOpenManualReceiptLogger?: () => void;
}

export const InvoicesAndReceiptsView: React.FC<InvoicesAndReceiptsViewProps> = ({
  invoices,
  issuedReceipts,
  profile,
  onCreateInvoice,
  onEditInvoice,
  onViewInvoice,
  onDeleteInvoice,
  onIssueReceipt,
  onViewIssuedReceipt,
  onDeleteIssuedReceipt,
  onOpenManualReceiptLogger,
}) => {
  const [subTab, setSubTab] = useState<'invoices' | 'receipts'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partially_paid' | 'paid'>('all');

  const sym = profile.currencySymbol || '₦';
  const copy = getBusinessCopy(profile);

  // Filter Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = inv.customerName.toLowerCase().includes(q);
        const matchesNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesAddress = inv.customerAddress?.toLowerCase().includes(q);
        return matchesName || matchesNumber || matchesAddress;
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Filter Receipts
  const filteredReceipts = useMemo(() => {
    return issuedReceipts.filter((rec) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.customerName.toLowerCase().includes(q);
        const matchesNumber = rec.receiptNumber.toLowerCase().includes(q);
        const matchesDesc = rec.description.toLowerCase().includes(q);
        return matchesName || matchesNumber || matchesDesc;
      }
      return true;
    });
  }, [issuedReceipts, searchQuery]);

  // Total metrics
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const totalReceiptsIssued = issuedReceipts.reduce((acc, r) => acc + r.amountPaid, 0);

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Metrics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Customer Invoices & Payment Receipts
              </h2>
              <p className="text-xs text-slate-500">
                Create professional invoices and payment receipts for your customers, with QR verification codes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenManualReceiptLogger && (
            <button
              onClick={onOpenManualReceiptLogger}
              className="flex items-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold px-3 py-2 text-xs shadow-2xs transition active:scale-95"
              title="Manually log receipt with transaction or reference number"
            >
              <Hash className="w-4 h-4 text-teal-700" />
              <span>Log by Txn #</span>
            </button>
          )}
          <button
            onClick={onCreateInvoice}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 text-xs shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
          <button
            onClick={() => onIssueReceipt()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 text-xs shadow-xs transition active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>Issue Receipt</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Total Invoiced Amount
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {sym}{totalInvoiced.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {invoices.length} invoices generated
          </span>
        </div>

        <div className="rounded-xl border border-rose-100 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase">
            Outstanding Customer Balances
          </span>
          <div className="text-xl font-black text-rose-700 mt-1">
            {sym}{totalOutstanding.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Awaiting customer settlements
          </span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">
            Total Cleared on Receipts
          </span>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {sym}{totalReceiptsIssued.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            {issuedReceipts.length} verified official receipts issued
          </span>
        </div>
      </div>

      {/* Segment Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setSubTab('invoices')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
              subTab === 'invoices'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoices ({invoices.length})</span>
          </button>
          <button
            onClick={() => setSubTab('receipts')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
              subTab === 'receipts'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Issued Receipts ({issuedReceipts.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={subTab === 'invoices' ? 'Search invoices by customer name, ref...' : 'Search receipts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Sub-Tab 1: INVOICES LIST */}
      {subTab === 'invoices' && (
        <div className="space-y-3">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1 rounded-xl transition ${
                statusFilter === 'unpaid'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Unpaid ({invoices.filter(i => i.status === 'unpaid').length})
            </button>
            <button
              onClick={() => setStatusFilter('partially_paid')}
              className={`px-3 py-1 rounded-xl transition ${
                statusFilter === 'partially_paid'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Partially Paid ({invoices.filter(i => i.status === 'partially_paid').length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-xl transition ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Fully Settled ({invoices.filter(i => i.status === 'paid').length})
            </button>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No invoices found</p>
              <p className="text-xs text-slate-400 mt-1">
                Create an invoice for {copy.customerLabel.toLowerCase()}s with customized line items.
              </p>
              <button
                onClick={onCreateInvoice}
                className="mt-3 rounded-xl bg-teal-600 text-white text-xs font-bold px-4 py-2 hover:bg-teal-700 transition"
              >
                Create First Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-400 transition"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                        {inv.invoiceNumber}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {inv.customerName}
                      </h4>
                      {inv.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {inv.status === 'partially_paid' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Part Paid
                        </span>
                      )}
                      {inv.status === 'unpaid' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                      <span>Date: {inv.date}</span>
                      <span>Due: <span className="font-medium text-rose-700">{inv.dueDate}</span></span>
                      {inv.customerAddress && <span>Ref: {inv.customerAddress}</span>}
                    </div>

                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      {inv.items.map(it => `${it.quantity}x ${it.description}`).join(' • ')}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 gap-1.5 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        {sym}{inv.total.toLocaleString()}
                      </div>
                      {inv.balanceDue > 0 ? (
                        <span className="text-[11px] font-bold text-rose-600">
                          Due: {sym}{inv.balanceDue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700">
                          Cleared
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => onIssueReceipt(inv)}
                          className="flex items-center gap-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 px-2.5 py-1 text-[11px] font-bold transition"
                          title="Record payment & print receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Pay & Issue Receipt</span>
                        </button>
                      )}
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition shadow-2xs"
                        title="View and print commercial invoice"
                      >
                        <Printer className="w-3.5 h-3.5 text-teal-600" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => onEditInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="Edit Invoice"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this invoice?')) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Invoice"
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
      )}

      {/* Sub-Tab 2: ISSUED RECEIPTS LIST */}
      {subTab === 'receipts' && (
        <div className="space-y-3">
          {filteredReceipts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No payment receipts issued yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Issue a receipt whenever a customer pays in cash, by transfer, or through a POS agent.
              </p>
              <button
                onClick={() => onIssueReceipt()}
                className="mt-3 rounded-xl bg-emerald-600 text-white text-xs font-bold px-4 py-2 hover:bg-emerald-700 transition"
              >
                Issue First Receipt
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReceipts.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-400 transition"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                        {rec.receiptNumber}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {rec.customerName}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                        {rec.paymentMethod === 'pos_agent' ? `POS Slip (${rec.posAgentName || 'Agent'})` : 'Cash in Hand'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{rec.description}</p>

                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                      <span>Date: {rec.date} {rec.time ? `• ${rec.time}` : ''}</span>
                      {rec.issuedBy && <span>By: {rec.issuedBy}</span>}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 gap-1.5 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-700">
                        +{sym}{rec.amountPaid.toLocaleString()}
                      </div>
                      {typeof rec.balanceRemaining === 'number' && rec.balanceRemaining > 0 ? (
                        <span className="text-[11px] text-rose-600 font-semibold">
                          Bal remaining: {sym}{rec.balanceRemaining.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Settled in full
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewIssuedReceipt(rec)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold transition"
                        title="View and print official slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Slip</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this issued receipt record?')) {
                            onDeleteIssuedReceipt(rec.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Receipt"
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
      )}
    </div>
  );
};
