import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Phone,
  CreditCard,
  Banknote,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { IssuedReceipt, BusinessProfile } from '../types';
import { printElement } from '../utils/printHelper';

interface IssuedReceiptViewModalProps {
  receipt: IssuedReceipt | null;
  profile: BusinessProfile;
  onClose: () => void;
}

export const IssuedReceiptViewModal: React.FC<IssuedReceiptViewModalProps> = ({
  receipt,
  profile,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const receiptPrintRef = useRef<HTMLDivElement>(null);
  const sym = profile.currencySymbol || '₦';

  useEffect(() => {
    if (!receipt) return;
    const payload =
      receipt.qrPayload ||
      `LL-REC|${receipt.receiptNumber}|${receipt.amountPaid}|${receipt.customerName}|${receipt.paymentMethod}|${receipt.date}`;

    QRCode.toDataURL(payload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation error', err));
  }, [receipt]);

  if (!receipt) return null;

  const handlePrint = () => {
    printElement(receiptPrintRef.current, `LedgerLite-Receipt-${receipt.receiptNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during window.print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Verified Payment Receipt Slip
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition"
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

        {/* Printable Official Receipt Body */}
        <div
          ref={receiptPrintRef}
          className="p-6 bg-white space-y-4 text-slate-900 font-sans overflow-y-auto printable-document"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <div className="inline-block rounded bg-teal-100 text-teal-900 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider mb-1">
              Official Payment Receipt
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
              {profile.businessName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{profile.tagline}</p>
            <p className="text-[11px] text-slate-500">{profile.communityLocation}</p>
            {profile.phone && <p className="text-[11px] text-slate-500">Contact: {profile.phone}</p>}
            <div className="inline-block mt-2 rounded bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
              {profile.termOrPeriod}
            </div>
          </div>

          {/* Amount Paid Callout */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Amount Paid & Cleared
            </span>
            <div className="text-3xl font-black text-emerald-800 mt-0.5">
              {sym}{receipt.amountPaid.toLocaleString()}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-emerald-700 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Payment Successfully Received
            </div>
          </div>

          {/* Key Payment Meta Information */}
          <div className="space-y-2 text-xs border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt Ref Number:</span>
              <span className="font-mono font-bold text-slate-900">{receipt.receiptNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Received From:</span>
              <span className="font-bold text-slate-900 text-right">{receipt.customerName}</span>
            </div>

            {receipt.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-700">{receipt.customerPhone}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Payment Purpose:</span>
              <span className="font-semibold text-slate-800 text-right">{receipt.description}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-slate-800 text-right capitalize">
                {receipt.paymentMethod === 'pos_agent'
                  ? `POS Agent Slip (${receipt.posAgentName || 'Agent Point'})`
                  : receipt.paymentMethod === 'cash'
                  ? 'Cash in Hand (Desk)'
                  : 'Bank Transfer'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span className="text-slate-700 text-right">
                {receipt.date} {receipt.time ? `• ${receipt.time}` : ''}
              </span>
            </div>

            {typeof receipt.balanceRemaining === 'number' && (
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Remaining Balance:</span>
                <span className={`font-mono font-bold ${
                  receipt.balanceRemaining > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {receipt.balanceRemaining > 0
                    ? `${sym}${receipt.balanceRemaining.toLocaleString()}`
                    : '₦0.00 (Fully Settled)'}
                </span>
              </div>
            )}

            {receipt.issuedBy && (
              <div className="flex justify-between">
                <span className="text-slate-500">Issued By:</span>
                <span className="font-medium text-slate-700">{receipt.issuedBy}</span>
              </div>
            )}
          </div>

          {/* Breakdown if items exist */}
          {receipt.items && receipt.items.length > 0 && (
            <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Itemized Summary:
              </span>
              {receipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span>{it.quantity}x {it.description}</span>
                  <span className="font-mono">{sym}{(it.amount || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* QR Code Verification Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Receipt QR Code"
                className="w-32 h-32 border border-slate-300 rounded-lg p-1 bg-white"
              />
            ) : (
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-mono mt-1.5 text-center">
              Scan with phone camera to verify official payment validity
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
            LedgerLite • Lightweight Financial Ledger & Faded-Ink Proof System
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
