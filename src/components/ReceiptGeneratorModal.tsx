import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Sparkles,
  QrCode,
  Download,
  School,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { printElement } from '../utils/printHelper';

interface ReceiptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onQuickLog: (slipData: any) => void;
}

export const ReceiptGeneratorModal: React.FC<ReceiptGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onQuickLog,
}) => {
  const [studentName, setStudentName] = useState('Chidera Obi');
  const [studentClass, setStudentClass] = useState('Primary 3 A');
  const [amount, setAmount] = useState('35000');
  const [purpose, setPurpose] = useState('First Term Tuition & Examination Fee');
  const [paymentChannel, setPaymentChannel] = useState('POS Slip (Moniepoint)');
  const [receiptNumber, setReceiptNumber] = useState(
    `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const voucherPrintRef = useRef<HTMLDivElement>(null);

  const sym = profile.currencySymbol || '₦';

  // Construct standard payload
  const payloadString = `LL-REC|${receiptNumber}|${amount}|${studentName} (${studentClass})|${paymentChannel}|tuition_fees`;

  useEffect(() => {
    QRCode.toDataURL(payloadString, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generator error', err));
  }, [studentName, studentClass, amount, receiptNumber, paymentChannel]);

  if (!isOpen) return null;

  const handlePrint = () => {
    printElement(voucherPrintRef.current, `LedgerLite-Voucher-${receiptNumber}`);
  };

  const handleLogDirectly = () => {
    onQuickLog({
      studentName: `${studentName} (${studentClass})`,
      amount: parseFloat(amount) || 0,
      purpose,
      receiptNumber,
      paymentMethod: paymentChannel.includes('POS') ? 'pos_agent' : 'cash',
      posAgentName: paymentChannel,
      qrPayload: payloadString,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-teal-800 text-white px-5 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-teal-200" />
            <div>
              <h2 className="text-base font-bold">School Fee Slip & Barcode Generator</h2>
              <p className="text-xs text-teal-200">
                Create official printable slips with scannable QR codes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left: Input Form Controls (Hidden during window.print) */}
          <div className="p-5 space-y-3.5 print:hidden">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fee Voucher Parameters
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class / Grade
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount ({sym})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fee Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentChannel}
                onChange={(e) => setPaymentChannel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option value="POS Slip (Moniepoint Agent)">POS Slip (Moniepoint Agent)</option>
                <option value="POS Slip (OPay Agent)">POS Slip (OPay Agent)</option>
                <option value="Cash at Bursary Desk">Cash at Bursary Desk</option>
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save Voucher
              </button>

              <button
                type="button"
                onClick={handleLogDirectly}
                className="w-full rounded-xl bg-teal-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Log Directly to Ledger
              </button>
            </div>
          </div>

          {/* Right: Live Slip Preview with QR Code */}
          <div className="p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
            <div
              ref={voucherPrintRef}
              className="w-full max-w-xs rounded-xl bg-white border border-slate-300 p-5 shadow-sm space-y-3 printable-card"
            >
              <div className="border-b border-dashed border-slate-300 pb-3">
                <p className="text-xs font-extrabold uppercase text-slate-900">
                  {profile.businessName}
                </p>
                <p className="text-[10px] text-slate-500">{profile.communityLocation}</p>
                <p className="text-[10px] font-bold text-teal-800 mt-0.5">
                  OFFICIAL PAYMENT SLIP
                </p>
              </div>

              <div className="text-xs space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span className="font-semibold text-slate-800">{studentClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-black text-teal-800">
                    {sym}{parseFloat(amount || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref #:</span>
                  <span className="font-mono text-[10px] text-slate-700">{receiptNumber}</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center pt-2 border-t border-dashed border-slate-200">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Slip Scannable Code"
                    className="w-36 h-36 border border-slate-200 rounded p-1 bg-white"
                  />
                )}
                <span className="text-[9px] font-mono text-slate-400 mt-1">
                  Point scanner at this QR code
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 max-w-xs">
              💡 You can point your phone's camera at this preview on screen right now to test live QR scanning!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
