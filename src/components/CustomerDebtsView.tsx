import React, { useState } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowRight,
  FileText,
  Printer,
  Receipt,
  MessageSquare,
  Search,
  PlusCircle,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { Invoice, BusinessProfile } from '../types';

interface CustomerDebtsViewProps {
  invoices: Invoice[];
  profile: BusinessProfile;
  onCreateInvoice: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const CustomerDebtsView: React.FC<CustomerDebtsViewProps> = ({
  invoices,
  profile,
  onCreateInvoice,
  onRecordPayment,
  onViewInvoice,
}) => {
  const sym = profile.currencySymbol || '₦';
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only unpaid or partially paid invoices (unsettled debt)
  const debtInvoices = invoices.filter(
    (inv) => (inv.status === 'unpaid' || inv.status === 'partially_paid') && inv.balanceDue > 0
  );

  const totalDebt = debtInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const filteredDebts = debtInvoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    return (
      inv.customerName.toLowerCase().includes(term) ||
      inv.invoiceNumber.toLowerCase().includes(term) ||
      (inv.customerPhone && inv.customerPhone.includes(term))
    );
  });

  const handleShareReminder = (invoice: Invoice) => {
    const text = `Hello ${invoice.customerName},\n\nThis is a friendly reminder from ${profile.businessName} regarding outstanding invoice #${invoice.invoiceNumber}. Outstanding balance due is ${sym}${invoice.balanceDue.toLocaleString()}.\n\nThank you for your prompt payment!`;
    const encoded = encodeURIComponent(text);
    if (invoice.customerPhone) {
      const cleanPhone = invoice.customerPhone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    } else {
      navigator.clipboard.writeText(text);
      alert('Reminder message copied to clipboard!');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Money customers owe you</span>
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Know who owes your business.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Record credit sales and keep track of unpaid invoices. See outstanding balances so you can follow up at the right time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="rounded-xl bg-white border border-amber-200 p-3 shadow-xs text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Unpaid Debts
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-900">
                {sym}{totalDebt.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onCreateInvoice}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-3 text-xs shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Credit Sale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, or invoice #..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-teal-500 font-medium"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>{filteredDebts.length} outstanding customer debt{filteredDebts.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Empty State */}
      {filteredDebts.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchTerm ? 'No matching customer debts found' : 'No unpaid customer balances.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Create an invoice or record a credit sale to start tracking debts.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateInvoice}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 text-xs shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Invoice / Credit Sale</span>
            </button>
          )}
        </div>
      )}

      {/* Debt List Cards */}
      {filteredDebts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{inv.customerName}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'partially_paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inv.status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {inv.invoiceNumber} • Due {inv.dueDate}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                    Balance Due
                  </span>
                  <span className="text-lg font-black text-rose-700">
                    {sym}{inv.balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Breakdown & Note */}
              <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between text-[11px]">
                  <span>Total Bill:</span>
                  <span className="font-semibold text-slate-800">{sym}{inv.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Amount Received:</span>
                  <span className="font-semibold text-emerald-700">{sym}{inv.amountPaid.toLocaleString()}</span>
                </div>
                {inv.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200 truncate">
                    "{inv.notes}"
                  </p>
                )}
              </div>

              {/* Actions: Follow up, Record Payment, View Invoice */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                <button
                  onClick={() => onViewInvoice(inv)}
                  className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 transition"
                  title="View and print bill"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Print / View Bill</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareReminder(inv)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 font-bold transition"
                    title="Send WhatsApp or SMS reminder"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reminder</span>
                  </button>
                  <button
                    onClick={() => onRecordPayment(inv)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 font-bold shadow-2xs transition active:scale-95"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Pay & Issue Receipt</span>
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
