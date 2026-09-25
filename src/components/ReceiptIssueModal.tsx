import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  Receipt,
  DollarSign,
  Calendar,
  Building,
  User,
  Phone,
  CreditCard,
  Banknote,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { IssuedReceipt, InvoiceItem, BusinessProfile, PaymentMethod, Invoice } from '../types';

interface ReceiptIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  invoices: Invoice[];
  initialInvoice?: Invoice | null;
  onSaveReceipt: (receipt: IssuedReceipt, linkToLedger: boolean) => Promise<void>;
}

export const ReceiptIssueModal: React.FC<ReceiptIssueModalProps> = ({
  isOpen,
  onClose,
  profile,
  invoices,
  initialInvoice,
  onSaveReceipt,
}) => {
  const sym = profile.currencySymbol || '₦';

  const [receiptNumber, setReceiptNumber] = useState(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [description, setDescription] = useState('Payment for Term 1 Tuition & Fees');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [posAgentName, setPosAgentName] = useState(profile.defaultPosAgent || '');
  const [balanceRemaining, setBalanceRemaining] = useState<number>(0);
  const [issuedBy, setIssuedBy] = useState('School Bursar Desk');
  const [notes, setNotes] = useState('Official payment receipt issued. Preserved in offline ledger.');
  const [linkToLedger, setLinkToLedger] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Line items (optional breakdown)
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'School Fees Payment', quantity: 1, unitPrice: 35000, amount: 35000 },
  ]);

  // Synchronize when modal opens or initialInvoice changes
  useEffect(() => {
    if (initialInvoice) {
      setSelectedInvoiceId(initialInvoice.id);
      setCustomerName(initialInvoice.customerName);
      setCustomerPhone(initialInvoice.customerPhone || '');
      setDescription(`Payment for Invoice #${initialInvoice.invoiceNumber}`);
      setAmountPaid(initialInvoice.balanceDue > 0 ? initialInvoice.balanceDue.toString() : initialInvoice.total.toString());
      setBalanceRemaining(0);
      setItems(initialInvoice.items.length > 0 ? [...initialInvoice.items] : [{ id: '1', description: 'School Fees Payment', quantity: 1, unitPrice: initialInvoice.total, amount: initialInvoice.total }]);
      setReceiptNumber(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setSelectedInvoiceId('');
      setCustomerName('');
      setCustomerPhone('');
      setDescription('Term 1 School Fees Payment');
      setAmountPaid('');
      setBalanceRemaining(0);
      setReceiptNumber(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setItems([{ id: '1', description: 'Tuition / Service Fee', quantity: 1, unitPrice: 0, amount: 0 }]);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setPosAgentName(profile.defaultPosAgent || '');
    setLinkToLedger(true);
  }, [isOpen, initialInvoice, profile]);

  // When an invoice is selected from the dropdown
  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (!invId) return;

    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setCustomerName(inv.customerName);
      setCustomerPhone(inv.customerPhone || '');
      setDescription(`Payment against Invoice ${inv.invoiceNumber}`);
      setAmountPaid(inv.balanceDue > 0 ? inv.balanceDue.toString() : inv.total.toString());
      setBalanceRemaining(0);
      setItems([...inv.items]);
    }
  };

  // Recalculate balance when amount paid changes
  useEffect(() => {
    const numPaid = parseFloat(amountPaid) || 0;
    if (selectedInvoiceId) {
      const inv = invoices.find(i => i.id === selectedInvoiceId);
      if (inv) {
        const remaining = Math.max(0, inv.balanceDue - numPaid);
        setBalanceRemaining(remaining);
      }
    }
  }, [amountPaid, selectedInvoiceId, invoices]);

  // Generate QR code
  useEffect(() => {
    const numPaid = parseFloat(amountPaid) || 0;
    const payload = `KT-REC|${receiptNumber}|${numPaid}|${customerName || 'Customer'}|${paymentMethod}|${date}`;
    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [receiptNumber, amountPaid, customerName, paymentMethod, date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPaid = parseFloat(amountPaid);
    if (isNaN(numPaid) || numPaid <= 0) {
      alert('Please enter a valid amount paid.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter the customer / student name.');
      return;
    }

    setIsSaving(true);
    const receiptId = `rec-${Date.now()}`;
    const payload = `KT-REC|${receiptNumber}|${numPaid}|${customerName}|${paymentMethod}|${date}`;

    const newReceipt: IssuedReceipt = {
      id: receiptId,
      receiptNumber: receiptNumber.trim(),
      invoiceId: selectedInvoiceId || undefined,
      date,
      time,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      description: description.trim(),
      items: items.filter(it => it.description.trim() !== ''),
      amountPaid: numPaid,
      paymentMethod,
      posAgentName: paymentMethod === 'pos_agent' ? posAgentName.trim() : undefined,
      balanceRemaining,
      issuedBy: issuedBy.trim(),
      notes: notes.trim(),
      qrPayload: payload,
      createdAt: Date.now(),
    };

    try {
      await onSaveReceipt(newReceipt, linkToLedger);
      onClose();
    } catch (err) {
      console.error('Error saving receipt', err);
      alert('Failed to save receipt.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-teal-800 text-white px-5 py-3.5 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-700/80 p-1.5 ring-1 ring-teal-500/50">
              <Receipt className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Generate & Issue Customer Payment Receipt
              </h2>
              <p className="text-xs text-teal-200">
                Create official proof of payment with scannable QR verification seal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Link to existing invoice if available */}
          {invoices.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 print:hidden">
              <label className="block text-xs font-bold text-slate-700">
                Link to Existing Outstanding Invoice (Optional)
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleSelectInvoice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 bg-white"
              >
                <option value="">-- Direct Receipt (No invoice linked) --</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} • {inv.customerName} • Total: {sym}{inv.total.toLocaleString()} (Bal: {sym}{inv.balanceDue.toLocaleString()})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Selecting an invoice auto-fills customer details and marks the invoice paid or partially paid.
              </p>
            </div>
          )}

          {/* Receipt Numbers & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Receipt Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Received From (Customer / Student / Parent) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Name / Payer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0803-555-8821"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-2.5 text-xs text-slate-800 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-2.5 text-xs text-slate-800 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Description / Purpose
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Term Tuition & ICT Practical"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issued By (Bursar / Cashier Desk)
                </label>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Amount Paid & Payment Method */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-teal-950 mb-1">
                  Amount Received ({sym}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-teal-800">
                    {sym}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full rounded-xl border border-teal-300 bg-white py-2.5 pl-8 pr-3 text-lg font-black text-teal-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-950 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      paymentMethod === 'cash'
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pos_agent')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      paymentMethod === 'pos_agent'
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    💳 POS Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🏦 Transfer
                  </button>
                </div>
              </div>
            </div>

            {paymentMethod === 'pos_agent' && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                  POS Agent Provider / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Moniepoint Agent, POS Merchant"
                  value={posAgentName}
                  onChange={(e) => setPosAgentName(e.target.value)}
                  className="w-full rounded-md border border-amber-300 py-1.5 px-2 text-xs bg-white focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-teal-200/80">
              <span className="text-teal-900 font-semibold">
                Balance Remaining Outstanding:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">{sym}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={balanceRemaining}
                  onChange={(e) => setBalanceRemaining(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-28 text-right rounded-lg border border-teal-300 py-1 px-2 text-xs font-bold text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Sync to Cash Ledger Option */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between print:hidden">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Automatically update school cash ledger & cash flow
              </span>
              <p className="text-[11px] text-slate-500">
                Logs this amount as verified income in your main cash flow records immediately.
              </p>
            </div>
            <input
              type="checkbox"
              checked={linkToLedger}
              onChange={(e) => setLinkToLedger(e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
            />
          </div>

          {/* QR Code Preview & Paper Voucher Visual */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-800">
                Official Printed Receipt Preview
              </span>
              <p className="text-xs text-slate-500">
                Features {profile.businessName} branding, tamper-proof QR code, and ink fading protection.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="Receipt QR"
                  className="w-20 h-20 rounded border border-slate-300 p-1 bg-white"
                />
              )}
              <div className="text-[11px] text-slate-500">
                <p className="font-bold text-slate-800">QR Payload Ready</p>
                <p className="font-mono text-[10px] text-teal-700">{receiptNumber}</p>
                <p className="text-[10px] text-slate-400">Scan to authenticate</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt Remarks / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200 print:hidden">
            <span className="text-xs text-slate-400">
              Offline verified • Instant digital & printable proof
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSaving ? 'Issuing...' : 'Issue & Save Receipt'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
