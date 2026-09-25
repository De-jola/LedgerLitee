import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  Upload,
  Receipt,
  Building,
  User,
  Hash,
  FileText,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  IncomeCategory,
  ExpenseCategory,
  TeacherStaff,
  BusinessProfile,
  ScannedReceiptData,
} from '../types';
import { getBusinessCopy } from '../utils/businessCopy';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction, receiptPhotoUrl?: string) => Promise<void>;
  initialType?: TransactionType;
  initialScannedData?: ScannedReceiptData | null;
  initialPhotoUrl?: string | null;
  staffList: TeacherStaff[];
  profile: BusinessProfile;
  editTransaction?: Transaction | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'income',
  initialScannedData,
  initialPhotoUrl,
  staffList,
  profile,
  editTransaction,
}) => {
  const copy = getBusinessCopy(profile);
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('tuition_fees');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [payerOrPayee, setPayerOrPayee] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [posAgentName, setPosAgentName] = useState<string>(profile.defaultPosAgent || 'Moniepoint Agent');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [barcodeOrQr, setBarcodeOrQr] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial data when modal opens
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setTitle(editTransaction.title);
      setCategory(editTransaction.category);
      setPaymentMethod(editTransaction.paymentMethod);
      setPayerOrPayee(editTransaction.payerOrPayee);
      setReferenceNumber(editTransaction.referenceNumber);
      setPosAgentName(editTransaction.posAgentName || '');
      setDate(editTransaction.date);
      setNotes(editTransaction.notes || '');
      setPhotoUrl(editTransaction.receiptPhotoUrl || null);
      setBarcodeOrQr(editTransaction.barcodeOrQrCode || '');
    } else if (initialScannedData) {
      setType('income');
      setAmount(initialScannedData.amount ? initialScannedData.amount.toString() : '');
      setCategory(initialScannedData.category || 'tuition_fees');
      setPaymentMethod(initialScannedData.paymentMethod || 'pos_agent');
      setPayerOrPayee(initialScannedData.payerName || '');
      setReferenceNumber(initialScannedData.receiptNumber || 'POS-' + Math.floor(100000 + Math.random() * 900000));
      setPosAgentName(initialScannedData.posAgentName || profile.defaultPosAgent || 'Moniepoint Agent');
      setTitle(
        initialScannedData.payerName
          ? `${copy.incomeTitle} - ${initialScannedData.payerName}`
          : copy.incomeTitle
      );
      setNotes(initialScannedData.notes || 'Scanned from receipt barcode');
      setBarcodeOrQr(initialScannedData.rawPayload || '');
      setPhotoUrl(initialPhotoUrl || null);
      setDate(initialScannedData.date || new Date().toISOString().split('T')[0]);
    } else {
      setType(initialType);
      setAmount('');
      setCategory(initialType === 'income' ? 'tuition_fees' : 'teacher_salaries');
      setPaymentMethod('cash');
      setPayerOrPayee('');
      setReferenceNumber('REC-' + Math.floor(1000 + Math.random() * 9000));
      setPosAgentName(profile.defaultPosAgent || '');
      setTitle('');
      setNotes('');
      setPhotoUrl(initialPhotoUrl || null);
      setBarcodeOrQr('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, editTransaction, initialScannedData, initialPhotoUrl, initialType, profile]);

  // When category changes to teacher salaries, auto-populate title
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (newCat === 'teacher_salaries' && staffList.length > 0 && !payerOrPayee) {
      const firstStaff = staffList[0];
      setPayerOrPayee(firstStaff.name);
      setAmount(firstStaff.monthlySalary.toString());
      setTitle(`Monthly Salary - ${firstStaff.name} (${firstStaff.role})`);
    }
  };

  // If user selects a teacher from quick select
  const handleSelectStaff = (staffId: string) => {
    const st = staffList.find(s => s.id === staffId);
    if (st) {
      setPayerOrPayee(st.name);
      setAmount(st.monthlySalary.toString());
      setTitle(`Monthly Salary - ${st.name} (${st.role})`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setIsSaving(true);
    const txId = editTransaction?.id || `tx-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      type,
      amount: numAmount,
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: title.trim() || (type === 'income' ? 'Cash/Fee Inflow' : 'Operational Expense'),
      category,
      paymentMethod,
      payerOrPayee: payerOrPayee.trim(),
      referenceNumber: referenceNumber.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      posAgentName: paymentMethod === 'pos_agent' ? posAgentName.trim() : undefined,
      notes: notes.trim(),
      receiptPhotoUrl: photoUrl || undefined,
      barcodeOrQrCode: barcodeOrQr || undefined,
      verified: true,
      createdAt: editTransaction?.createdAt || Date.now(),
    };

    try {
      await onSave(newTx, photoUrl || undefined);
      // Trigger satisfying confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0d9488', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
      onClose();
    } catch (err) {
      console.error('Error saving transaction', err);
      alert('Could not save transaction. Please check storage.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const sym = profile.currencySymbol || '₦';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 text-white ${
          type === 'income' ? 'bg-teal-700' : 'bg-rose-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white/20 p-2">
              {type === 'income' ? (
                <ArrowDownLeft className="w-5 h-5 text-emerald-200" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-rose-200" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editTransaction
                  ? 'Edit Transaction Record'
                  : type === 'income'
                  ? `Log ${copy.incomeLabel}`
                  : 'Log Business & Salary Expense'}
              </h2>
              <p className="text-xs text-white/80">
                {barcodeOrQr ? 'Scanned receipt verified • Ink-safe storage' : 'Manual cash flow entry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector if creating new */}
        {!editTransaction && (
          <div className="grid grid-cols-2 p-3 bg-slate-100 gap-2 border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('tuition_fees');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                type === 'income'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Income / Fees Collected
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('teacher_salaries');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> {copy.expenseLabel}
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount ({sym}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  {sym}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-3 text-base font-bold text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>

          {/* Payment Method toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === 'cash'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                💵 Cash in Hand
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('pos_agent')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === 'pos_agent'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                💳 POS Agent Slip
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                🏦 Bank / USSD
              </button>
            </div>
          </div>

          {/* POS Agent Name if pos_agent */}
          {paymentMethod === 'pos_agent' && (
            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                POS Agent Provider / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Moniepoint Agent, OPay POS Terminal, Bank Agent"
                value={posAgentName}
                onChange={(e) => setPosAgentName(e.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-white py-2 px-3 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[11px] text-amber-700 mt-1">
                Identifies which POS agent collected the payment so you can balance agent settlement records.
              </p>
            </div>
          )}

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white"
              >
                {type === 'income' ? (
                  <>
                    <option value="tuition_fees">Tuition & Term Fees</option>
                    <option value="registration_admission">Admission & Registration</option>
                    <option value="books_uniforms">Books, Uniforms & Badges</option>
                    <option value="pta_levy">PTA Levy / Development</option>
                    <option value="exam_fees">Examination / Test Fees</option>
                    <option value="lesson_extra">Extra-mural Lessons</option>
                    <option value="donation_grant">Donations & Community Grants</option>
                    <option value="other_income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="teacher_salaries">Teacher & Headmistress Salaries</option>
                    <option value="support_staff_wages">Security & Support Wages</option>
                    <option value="stationery_chalk">Classroom Chalk & Exam Stationery</option>
                    <option value="fuel_electricity">Generator Fuel & Utilities</option>
                    <option value="repairs_maintenance">Desk Repairs & Facility Maintenance</option>
                    <option value="water_sanitation">Water Borehole & Sanitation</option>
                    <option value="food_nutrition">Student Feeding & Refreshments</option>
                    <option value="inspection_levies">Govt Levies & Inspection Dues</option>
                    <option value="emergency_other">Emergency / Other Expense</option>
                  </>
                )}
              </select>
            </div>

            {/* Quick Staff Selection if Teacher Salary */}
            {type === 'expense' && (category === 'teacher_salaries' || category === 'support_staff_wages') ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Staff Member
                </label>
                <select
                  onChange={(e) => handleSelectStaff(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white"
                >
                  <option value="">-- Choose from Staff Directory --</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.role}) - {sym}{st.monthlySalary.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {type === 'income' ? copy.customerLabel : 'Recipient / Vendor'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={type === 'income' ? 'e.g. Customer Name / Payer' : 'e.g. Vendor / Payee'}
                    value={payerOrPayee}
                    onChange={(e) => setPayerOrPayee(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Title & Reference # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Record Title / Description
              </label>
              <input
                type="text"
                placeholder={type === 'income' ? `${copy.incomeTitle} or sale` : 'e.g. Stock, rent, or fuel'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt / Reference Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. REC-9921 or POS RRN"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs font-mono text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>
            </div>
          </div>

          {/* Permanent Receipt Snapshot (Ink Loss Protection) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-600" /> Receipt Photo & Ink Preservation
              </span>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                <img
                  src={photoUrl}
                  alt="Receipt snapshot"
                  className="h-28 w-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                  Permanently Archived (Faded Ink Proof)
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition active:scale-95">
                  <Camera className="w-4 h-4 text-teal-600" /> Snap / Upload Receipt
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <span className="text-[11px] text-slate-500">
                  Saves digital copy before POS thermal paper fades off.
                </span>
              </div>
            )}

            {barcodeOrQr && (
              <p className="text-[10px] font-mono text-teal-700 bg-teal-50/80 p-1.5 rounded truncate">
                Scanned payload: {barcodeOrQr}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Notes / Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Paid in 2 cash installments; parent requested manual voucher"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 flex items-center gap-2 ${
                type === 'income'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {isSaving ? 'Saving...' : editTransaction ? 'Update Record' : 'Save & Record Inflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
