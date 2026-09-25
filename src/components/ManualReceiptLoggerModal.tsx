import React, { useState, useMemo } from 'react';
import {
  X,
  Receipt,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  CreditCard,
  Calendar,
  Clock,
  Printer,
  FileText,
  DollarSign,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { BusinessProfile, Invoice, IssuedReceipt, Transaction, PaymentMethod, IncomeCategory } from '../types';

interface ManualReceiptLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  invoices: Invoice[];
  existingTransactions: Transaction[];
  existingReceipts: IssuedReceipt[];
  onSaveManualReceipt: (
    receipt: IssuedReceipt,
    transaction: Transaction,
    linkedInvoiceId?: string
  ) => void;
}

export const ManualReceiptLoggerModal: React.FC<ManualReceiptLoggerModalProps> = ({
  isOpen,
  onClose,
  profile,
  invoices,
  existingTransactions,
  existingReceipts,
  onSaveManualReceipt,
}) => {
  // Form fields
  const [txnNumber, setTxnNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pos_agent');
  const [posAgentOrBank, setPosAgentOrBank] = useState(profile.defaultPosAgent || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [description, setDescription] = useState('Payment / Sale');
  const [category, setCategory] = useState<IncomeCategory>('general_sales');
  const [notes, setNotes] = useState('');

  // Invoice linking
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  const sym = profile.currencySymbol || '₦';

  // Check for duplicate transaction number across transactions and receipts
  const duplicateMatch = useMemo(() => {
    const trimmed = txnNumber.trim().toLowerCase();
    if (!trimmed) return null;

    const matchedTx = existingTransactions.find(
      (t) => t.referenceNumber && t.referenceNumber.toLowerCase() === trimmed
    );
    if (matchedTx) {
      return {
        type: 'transaction',
        title: matchedTx.title,
        amount: matchedTx.amount,
        date: matchedTx.date,
        payer: matchedTx.payerOrPayee,
      };
    }

    const matchedRec = existingReceipts.find(
      (r) => r.receiptNumber && r.receiptNumber.toLowerCase() === trimmed
    );
    if (matchedRec) {
      return {
        type: 'receipt',
        title: matchedRec.description,
        amount: matchedRec.amountPaid,
        date: matchedRec.date,
        payer: matchedRec.customerName,
      };
    }

    return null;
  }, [txnNumber, existingTransactions, existingReceipts]);

  // Unpaid or partially paid invoices for optional linking
  const outstandingInvoices = useMemo(() => {
    return invoices.filter((i) => i.status !== 'paid' && i.balanceDue > 0);
  }, [invoices]);

  const selectedInvoice = useMemo(() => {
    return invoices.find((i) => i.id === selectedInvoiceId) || null;
  }, [selectedInvoiceId, invoices]);

  // When selecting an invoice, autofill payer and suggested amount
  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (!invId) return;

    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      if (!payerName.trim()) setPayerName(inv.customerName);
      if (!payerPhone.trim() && inv.customerPhone) setPayerPhone(inv.customerPhone);
      if (!amount) setAmount(inv.balanceDue.toString());
      setDescription(`Settlement of Invoice ${inv.invoiceNumber} - ${inv.customerName}`);
    }
  };

  const handleGenerateSampleTxn = () => {
    const prefix = paymentMethod === 'pos_agent' ? 'POS' : paymentMethod === 'bank_transfer' ? 'NIP' : 'TXN';
    const rand = Math.floor(100000 + Math.random() * 900000);
    setTxnNumber(`${prefix}-${date.replace(/-/g, '')}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent, openPrint: boolean = true) => {
    e.preventDefault();

    const cleanTxnNumber = txnNumber.trim();
    if (!cleanTxnNumber) {
      alert('Please enter the Transaction / Reference Number from the payment slip.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const cleanPayer = payerName.trim() || 'Valued Customer';
    const now = Date.now();

    // 1. Create Verified Issued Receipt
    const newReceipt: IssuedReceipt = {
      id: `rec-manual-${now}`,
      receiptNumber: cleanTxnNumber,
      invoiceId: selectedInvoiceId || undefined,
      customerName: cleanPayer,
      customerPhone: payerPhone.trim() || undefined,
      date,
      time,
      amountPaid: parsedAmount,
      paymentMethod,
      posAgentName: (paymentMethod === 'pos_agent' || paymentMethod === 'bank_transfer') ? posAgentOrBank.trim() : undefined,
      description: description.trim() || 'Payment Receipt',
      notes: notes.trim() || undefined,
      qrPayload: `LL-REC|${cleanTxnNumber}|${parsedAmount}|${cleanPayer}|${paymentMethod}|${date}`,
      createdAt: now,
    };

    // 2. Create Ledger Transaction
    const newTx: Transaction = {
      id: `tx-log-${now}`,
      type: 'income',
      amount: parsedAmount,
      date,
      time,
      title: description.trim() || `Receipt #${cleanTxnNumber} - ${cleanPayer}`,
      category,
      paymentMethod,
      payerOrPayee: cleanPayer,
      referenceNumber: cleanTxnNumber,
      posAgentName: (paymentMethod === 'pos_agent' || paymentMethod === 'bank_transfer') ? posAgentOrBank.trim() : undefined,
      notes: notes.trim() ? `${notes.trim()} (Logged via Txn #${cleanTxnNumber})` : `Logged via Txn #${cleanTxnNumber}`,
      barcodeOrQrCode: newReceipt.qrPayload,
      verified: true,
      createdAt: now,
    };

    onSaveManualReceipt(newReceipt, newTx, selectedInvoiceId || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                <span>Log Payment Receipt via Transaction Number</span>
                <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full font-bold">
                  Ink-Guard
                </span>
              </h3>
              <p className="text-slate-400 text-[11px]">
                Capture bank transfer references, POS slips, or voucher numbers into your records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, true)} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Transaction Number Input Banner */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                <Hash className="w-4 h-4 text-teal-700" />
                <span>Transaction / Reference Number</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateSampleTxn}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
              >
                Auto-generate Ref
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={txnNumber}
                onChange={(e) => setTxnNumber(e.target.value.toUpperCase())}
                placeholder="e.g. POS-2026-98102, NIP-0918239, STAN-4412"
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-teal-300 bg-white text-sm font-mono font-black text-slate-900 tracking-wide focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">
                Reference
              </span>
            </div>

            {/* Duplicate detection warning */}
            {duplicateMatch && (
              <div className="p-2.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold">Notice:</span> A record with reference{' '}
                  <strong className="font-mono">{txnNumber}</strong> was already logged on{' '}
                  {duplicateMatch.date} for {sym}{duplicateMatch.amount.toLocaleString()} ({duplicateMatch.payer}).
                  Please double check the slip to prevent duplicate accounting.
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-500">
              Found on thermal POS receipts, bank mobile app receipts (STAN/RRN/Session ID), or bursary vouchers.
            </p>
          </div>

          {/* Amount & Payer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Amount Paid ({sym}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{sym}</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="35000"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-900 focus:border-teal-600 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Customer / Student Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Chidera Obi / Adebayo Lawal"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:border-teal-600 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Bank/POS Agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Payment Channel / Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-teal-600 outline-hidden"
              >
                <option value="pos_agent">POS Terminal / Agent Slip</option>
                <option value="bank_transfer">Direct Bank Transfer / NIP</option>
                <option value="cash">Cash Payment Voucher</option>
                <option value="other">Other Payment Channel</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Issuing POS Agent or Bank Name
              </label>
              <input
                type="text"
                value={posAgentOrBank}
                onChange={(e) => setPosAgentOrBank(e.target.value)}
                placeholder="e.g. Moniepoint, OPay, FirstBank, GTBank"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:border-teal-600 outline-hidden"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Payment Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:border-teal-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Time on Slip
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:border-teal-600 outline-hidden"
              />
            </div>
          </div>

          {/* Purpose & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Purpose / Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 1st Term School Fees, Store Sales"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:border-teal-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ledger Income Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-teal-600 outline-hidden"
              >
                <option value="tuition_fees">Tuition / School Fees</option>
                <option value="exam_fees">Exam & Registration Fees</option>
                <option value="books_uniforms">Books & Uniforms</option>
                <option value="registration_admission">Registration & Admission</option>
                <option value="donation_grant">Donations & Support</option>
                <option value="general_sales">General Commercial Sale</option>
                <option value="service_fee">Service Fee</option>
                <option value="other_income">Other Income</option>
              </select>
            </div>
          </div>

          {/* Optional: Link to Existing Customer Debt / Invoice */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-teal-700" />
                <span>Link to Unpaid Customer Invoice (Optional)</span>
              </label>
              {outstandingInvoices.length > 0 && (
                <span className="text-[10px] text-teal-700 font-semibold">
                  {outstandingInvoices.length} pending debts available
                </span>
              )}
            </div>

            <select
              value={selectedInvoiceId}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:border-teal-600 outline-hidden"
            >
              <option value="">-- No linked invoice (Direct Payment Record) --</option>
              {outstandingInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} • {inv.customerName} • Balance Due: {sym}
                  {inv.balanceDue.toLocaleString()} (Total: {sym}{inv.total.toLocaleString()})
                </option>
              ))}
            </select>

            {selectedInvoice && (
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-[11px]">
                <span>
                  Invoice <strong>{selectedInvoice.invoiceNumber}</strong>: Previous balance{' '}
                  <strong>{sym}{selectedInvoice.balanceDue.toLocaleString()}</strong>.
                </span>
                <span className="font-bold text-emerald-700">
                  New balance after payment:{' '}
                  {sym}
                  {Math.max(0, selectedInvoice.balanceDue - (parseFloat(amount) || 0)).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Remarks / Teller Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teller Remarks / Customer Phone (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via Moniepoint POS Terminal at market junction, Teller 04"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:border-teal-600 outline-hidden"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] text-slate-400">
              Preserves receipt record & generates QR verification.
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Log & Issue Printable Receipt</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
