import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  Share2,
} from 'lucide-react';
import { Transaction, BusinessProfile } from '../types';
import { printElement } from '../utils/printHelper';

interface ReceiptDetailModalProps {
  transaction: Transaction | null;
  profile: BusinessProfile;
  onClose: () => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  transaction,
  profile,
  onClose,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transaction) return;

    // Generate high-resolution QR code
    const payload =
      transaction.barcodeOrQrCode ||
      `LL-REC|${transaction.id}|${transaction.amount}|${transaction.payerOrPayee || 'Payer'}|${transaction.referenceNumber || 'N/A'}`;

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation error', err));
  }, [transaction]);

  if (!transaction) return null;

  const sym = profile.currencySymbol || '₦';

  const handlePrint = () => {
    printElement(receiptPrintRef.current, `LedgerLite-Receipt-${transaction.referenceNumber || transaction.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col">
        {/* Top Control Bar (Hidden during window.print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Verified Digital Record Slip
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          ref={receiptPrintRef}
          className="p-6 bg-white space-y-4 text-slate-900 font-sans"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
              {profile.businessName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{profile.tagline}</p>
            <p className="text-[11px] text-slate-500">{profile.communityLocation}</p>
            <div className="inline-block mt-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
              {profile.termOrPeriod}
            </div>
          </div>

          {/* Amount Display */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {transaction.type === 'income' ? 'Amount Received' : 'Amount Paid'}
            </span>
            <div className="text-2xl font-black text-teal-800">
              {sym}{transaction.amount.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-600 font-medium capitalize mt-0.5">
              {transaction.category.replace(/_/g, ' ')}
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">
                {transaction.type === 'income' ? 'Student / Payer:' : 'Recipient:'}
              </span>
              <span className="font-bold text-slate-900 text-right">
                {transaction.payerOrPayee || 'General Record'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Record Title:</span>
              <span className="font-semibold text-slate-800 text-right">
                {transaction.title}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Receipt Ref #:</span>
              <span className="font-mono font-bold text-slate-800 text-right">
                {transaction.referenceNumber}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-slate-800 capitalize text-right">
                {transaction.paymentMethod === 'pos_agent'
                  ? `POS Slip (${transaction.posAgentName || 'Agent'})`
                  : transaction.paymentMethod === 'cash'
                  ? 'Cash in Hand'
                  : 'Bank Transfer'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="text-slate-700 text-right">
                {transaction.date} {transaction.time ? `• ${transaction.time}` : ''}
              </span>
            </div>

            {transaction.notes && (
              <div className="pt-1 text-[11px] text-slate-500 italic">
                "{transaction.notes}"
              </div>
            )}
          </div>

          {/* QR Code Verification Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Receipt Verification QR"
                className="w-32 h-32 border border-slate-200 rounded-lg p-1 bg-white"
              />
            ) : (
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                Loading QR...
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-mono mt-1.5 text-center">
              Scan with camera to verify receipt authenticity
            </p>
          </div>

          {/* Preserved Receipt Photo (Faded Ink Proof) */}
          {transaction.receiptPhotoUrl && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Original Receipt Photo (Saved Against Fading Ink)</span>
              </div>
              <img
                src={transaction.receiptPhotoUrl}
                alt="Preserved thermal receipt slip"
                className="w-full max-h-48 object-cover rounded-lg border border-amber-300"
              />
              <p className="text-[10px] text-amber-700">
                Paper receipt ink may fade, but this high-resolution photo is permanently stored in the school's offline database.
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            LedgerLite • Lightweight Financial Ledger System
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-end print:hidden">
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
