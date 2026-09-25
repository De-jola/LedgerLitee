import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  FileText,
  DollarSign,
  Calendar,
  Building,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  CreditCard,
  Banknote,
  Receipt,
  Download,
} from 'lucide-react';
import { Invoice, BusinessProfile } from '../types';
import { printElement } from '../utils/printHelper';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  profile: BusinessProfile;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  profile,
  onClose,
  onRecordPayment,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const invoicePrintRef = useRef<HTMLDivElement>(null);
  const sym = profile.currencySymbol || '₦';

  useEffect(() => {
    if (!invoice) return;
    const payload =
      invoice.qrPayload ||
      `LL-INV|${invoice.invoiceNumber}|${invoice.total}|${invoice.customerName}|${invoice.date}|${invoice.dueDate}`;

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
  }, [invoice]);

  if (!invoice) return null;

  const handlePrint = () => {
    printElement(invoicePrintRef.current, `LedgerLite-Invoice-${invoice.invoiceNumber}`);
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Partially Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" /> Unpaid / Outstanding
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[92vh]">
        {/* Action Header (Hidden during window.print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <div>
              <span className="text-sm font-bold text-slate-800">
                Invoice {invoice.invoiceNumber}
              </span>
              <span className="text-xs text-slate-500 ml-2">({invoice.customerName})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Record Payment & Issue Receipt</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div
          ref={invoicePrintRef}
          className="p-6 sm:p-8 bg-white space-y-6 text-slate-900 font-sans overflow-y-auto printable-document"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="inline-block rounded-md bg-teal-100 text-teal-900 font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider mb-1">
                Official Commercial Invoice
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {profile.businessName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">{profile.tagline}</p>
              <div className="text-xs text-slate-500 space-y-0.5 mt-2">
                <p>{profile.communityLocation}</p>
                {profile.phone && <p>Tel: {profile.phone}</p>}
                {profile.email && <p>Email: {profile.email}</p>}
              </div>
            </div>

            <div className="text-left sm:text-right space-y-2">
              <div className="text-2xl font-black text-teal-800 font-mono">
                {invoice.invoiceNumber}
              </div>
              <div>{getStatusBadge()}</div>
              <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                <p>Date Issued: <span className="font-semibold text-slate-800">{invoice.date}</span></p>
                <p>Due Date: <span className="font-semibold text-rose-700">{invoice.dueDate}</span></p>
                <p className="text-[11px] text-teal-700 font-semibold">{profile.termOrPeriod}</p>
              </div>
            </div>
          </div>

          {/* Billed To Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Billed To (Customer / Student / Parent):
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {invoice.customerName}
              </h3>
              {invoice.customerPhone && (
                <p className="text-xs text-slate-600 mt-0.5 font-mono">
                  Phone: {invoice.customerPhone}
                </p>
              )}
              {invoice.customerAddress && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Class / Location: {invoice.customerAddress}
                </p>
              )}
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Balance Outstanding:
              </span>
              <div className="text-2xl font-black text-rose-700 mt-0.5">
                {sym}{invoice.balanceDue.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">
                Total Invoice: {sym}{invoice.total.toLocaleString()} • Paid: {sym}{invoice.amountPaid.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item & Description</th>
                  <th className="py-2.5 px-3 text-center w-20">Quantity</th>
                  <th className="py-2.5 px-4 text-right w-32">Unit Price</th>
                  <th className="py-2.5 px-4 text-right w-36">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      {sym}{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {sym}{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & QR Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-5">
            {/* Left: Payment Instructions & Terms */}
            <div className="flex-1 space-y-3">
              {invoice.paymentInstructions && (
                <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 block">
                    Payment & Settlement Instructions:
                  </span>
                  <p className="text-amber-800 leading-relaxed">
                    {invoice.paymentInstructions}
                  </p>
                </div>
              )}

              {invoice.notes && (
                <div className="text-xs text-slate-500 italic">
                  Note: "{invoice.notes}"
                </div>
              )}
            </div>

            {/* Right: Totals Breakdown */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {sym}{invoice.subtotal.toLocaleString()}
                </span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount / Concession:</span>
                  <span className="font-semibold font-mono">
                    -{sym}{invoice.discount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                <span>Total Amount:</span>
                <span className="font-mono text-teal-800">
                  {sym}{invoice.total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-semibold font-mono text-emerald-700">
                  {sym}{invoice.amountPaid.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-rose-700 font-black border-t border-slate-200 pt-2 text-base">
                <span>Balance Due:</span>
                <span className="font-mono">
                  {sym}{invoice.balanceDue.toLocaleString()}
                </span>
              </div>

              {/* QR Verification Seal */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Verified Digital Seal
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Scan with phone camera to verify invoice
                  </span>
                </div>
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="Invoice QR Verification"
                    className="w-16 h-16 rounded border border-slate-300 p-0.5 bg-white shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-dashed border-slate-200">
            LedgerLite • Lightweight Financial Ledger, Invoicing & Ink-Guard System
          </div>
        </div>

        {/* Modal Bottom Buttons (Hidden on Print) */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-400">
            Press Ctrl+P or tap Print to produce physical copies for parents
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
