import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Building,
  User,
  Phone,
  MapPin,
  Sparkles,
  Percent,
} from 'lucide-react';
import { Invoice, InvoiceItem, BusinessProfile } from '../types';
import { getBusinessCopy } from '../utils/businessCopy';

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onSaveInvoice: (invoice: Invoice) => Promise<void>;
  editInvoice?: Invoice | null;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveInvoice,
  editInvoice,
}) => {
  const sym = profile.currencySymbol || '₦';
  const copy = getBusinessCopy(profile);

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks default
    return d.toISOString().split('T')[0];
  });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState(`Payment is required according to the agreed terms. Thank you for choosing ${profile.businessName || 'our business'}.`);
  const [paymentInstructions, setPaymentInstructions] = useState(
    profile.bankAccountDetails
      ? `Pay by cash or transfer to: ${profile.bankAccountDetails}.`
      : 'Pay by cash, transfer, or another agreed method.'
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Product or service', quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (editInvoice) {
      setInvoiceNumber(editInvoice.invoiceNumber);
      setDate(editInvoice.date);
      setDueDate(editInvoice.dueDate);
      setCustomerName(editInvoice.customerName);
      setCustomerPhone(editInvoice.customerPhone || '');
      setCustomerAddress(editInvoice.customerAddress || '');
      setItems(editInvoice.items.length > 0 ? editInvoice.items : [{ id: '1', description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
      setDiscount(editInvoice.discount || 0);
      setNotes(editInvoice.notes || '');
      setPaymentInstructions(editInvoice.paymentInstructions || '');
    } else {
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().split('T')[0]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDiscount(0);
      setItems([
        { id: '1', description: copy.invoiceItem, quantity: 1, unitPrice: 0, amount: 0 },
      ]);
      setNotes(`Payment is required according to the agreed terms. Thank you for choosing ${profile.businessName || 'our business'}.`);
      setPaymentInstructions(
        profile.bankAccountDetails
          ? `Pay by cash or transfer to: ${profile.bankAccountDetails}.`
          : 'Pay by cash, transfer, or another agreed method.'
      );
    }
  }, [isOpen, editInvoice, profile]);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const total = Math.max(0, subtotal - (discount || 0));

  // Generate live QR code for invoice
  useEffect(() => {
    const payload = `KT-INV|${invoiceNumber}|${total}|${customerName || 'Customer'}|${date}|${dueDate}`;
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
  }, [invoiceNumber, total, customerName, date, dueDate]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'description') {
      item.description = value;
    } else if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(value) || 1);
      item.amount = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = Math.max(0, parseFloat(value) || 0);
      item.amount = item.quantity * item.unitPrice;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Quick templates are tailored to the registered business type.
  const handleApplyPreset = (type: 'tuition' | 'admission' | 'books' | 'uniform') => {
    if (profile.businessType !== 'school') {
      setItems([{ id: '1', description: copy.invoiceItem, quantity: 1, unitPrice: 0, amount: 0 }]);
    } else if (type === 'tuition') {
      setItems([
        { id: '1', description: 'First Term Tuition & Examination Fee', quantity: 1, unitPrice: 35000, amount: 35000 },
        { id: '2', description: 'PTA & Infrastructure Levy', quantity: 1, unitPrice: 3000, amount: 3000 },
        { id: '3', description: 'Computer Lab Practical Test Session', quantity: 1, unitPrice: 4000, amount: 4000 },
      ]);
    } else if (type === 'admission') {
      setItems([
        { id: '1', description: 'New Student Admission & Registration Form', quantity: 1, unitPrice: 10000, amount: 10000 },
        { id: '2', description: 'Term 1 Tuition Package', quantity: 1, unitPrice: 35000, amount: 35000 },
        { id: '3', description: 'School Crest, ID Card & Diary', quantity: 1, unitPrice: 5000, amount: 5000 },
      ]);
    } else if (type === 'books') {
      setItems([
        { id: '1', description: 'Core Textbooks (Math, English, Science Set)', quantity: 1, unitPrice: 18000, amount: 18000 },
        { id: '2', description: 'Custom Exercise Workbooks (10 Copies)', quantity: 1, unitPrice: 6000, amount: 6000 },
      ]);
    } else if (type === 'uniform') {
      setItems([
        { id: '1', description: 'Complete School Uniform (2 Pairs + Badge)', quantity: 1, unitPrice: 14000, amount: 14000 },
        { id: '2', description: 'Sports Wear & Socks Set', quantity: 1, unitPrice: 6500, amount: 6500 },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert(`Please enter the ${copy.customerLabel.toLowerCase()} name.`);
      return;
    }
    if (items.length === 0 || total <= 0) {
      alert('Please add at least one line item with a valid amount.');
      return;
    }

    setIsSaving(true);
    const invoiceId = editInvoice?.id || `inv-${Date.now()}`;
    const payload = `KT-INV|${invoiceNumber}|${total}|${customerName}|${date}|${dueDate}`;

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber: invoiceNumber.trim(),
      date,
      dueDate,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      items,
      subtotal,
      discount: discount || 0,
      total,
      amountPaid: editInvoice ? editInvoice.amountPaid : 0,
      balanceDue: editInvoice ? Math.max(0, total - editInvoice.amountPaid) : total,
      status: editInvoice
        ? editInvoice.amountPaid >= total
          ? 'paid'
          : editInvoice.amountPaid > 0
          ? 'partially_paid'
          : 'unpaid'
        : 'unpaid',
      notes: notes.trim(),
      paymentInstructions: paymentInstructions.trim(),
      qrPayload: payload,
      createdAt: editInvoice?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await onSaveInvoice(newInvoice);
      onClose();
    } catch (err) {
      console.error('Error saving invoice', err);
      alert('Failed to save invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-teal-800 text-white px-5 py-3.5 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-700/80 p-1.5 ring-1 ring-teal-500/50">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {editInvoice ? 'Edit Customer Invoice' : 'Create & Generate Customer Invoice'}
              </h2>
              <p className="text-xs text-teal-200">
                Official billing statement for {copy.customerLabel.toLowerCase()}s, products, or services
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
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area with Split Layout for Live Visual Invoice on Print */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Presets for fast entry */}
          <div className="print:hidden flex flex-wrap items-center gap-2 bg-teal-50/70 border border-teal-200 p-3 rounded-xl text-xs">
            <span className="font-bold text-teal-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Templates:
            </span>
            {profile.businessType === 'school' ? (
              <>
                <button type="button" onClick={() => handleApplyPreset('tuition')} className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 font-semibold transition">Term Tuition Package</button>
                <button type="button" onClick={() => handleApplyPreset('admission')} className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 font-semibold transition">New Admission Fee</button>
                <button type="button" onClick={() => handleApplyPreset('books')} className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 font-semibold transition">Books & Stationery</button>
                <button type="button" onClick={() => handleApplyPreset('uniform')} className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 font-semibold transition">Uniform & Sports Set</button>
              </>
            ) : (
              <button type="button" onClick={() => handleApplyPreset('tuition')} className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-100 font-semibold transition">
                Add {copy.invoiceItem}
              </button>
            )}
          </div>

          {/* Invoice Document Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 pb-5">
            {/* Sender / Business Information */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                From (Issuer / Institution)
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {profile.businessName}
              </h3>
              <p className="text-xs text-slate-600 font-medium">{profile.tagline}</p>
              <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.communityLocation}
                </p>
                {profile.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile.phone}
                  </p>
                )}
                <p className="text-teal-700 font-semibold">{profile.termOrPeriod}</p>
              </div>
            </div>

            {/* Invoice Meta Numbers */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Invoice Details
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Invoice # <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs font-mono font-bold text-slate-800 focus:border-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs text-slate-800 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs text-slate-800 focus:border-teal-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Customer / Student Bill-To Details */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" /> Billed To ({copy.customerLabel})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {copy.customerLabel} Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Name / Client"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0803-123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class / Location / Delivery Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary 4 Class • Ward 2"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Invoice Line Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Price ({sym})</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total ({sym})</th>
                    <th className="py-2.5 px-2 w-10 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          required
                          placeholder={`e.g. ${copy.invoiceItem}`}
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 py-1 px-2 text-xs text-slate-800 focus:border-teal-500"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-16 mx-auto rounded-lg border border-slate-200 py-1 px-2 text-center text-xs text-slate-800 focus:border-teal-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-28 text-right rounded-lg border border-slate-200 py-1 px-2 text-xs font-semibold text-slate-800 focus:border-teal-500 ml-auto"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {sym}{(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-center print:hidden">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Calculations */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bank / Payment Settlement Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-700 bg-slate-50 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Invoice Notes / Terms
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-700 bg-slate-50 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs shrink-0">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    {sym}{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 gap-2">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-slate-400" /> Discount / Concession ({sym}):
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 text-right rounded-lg border border-slate-300 py-1 px-2 text-xs font-semibold text-slate-800 bg-white"
                  />
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Amount Due:</span>
                  <span className="text-teal-800 text-base">
                    {sym}{total.toLocaleString()}
                  </span>
                </div>

                {/* QR Code Embed for physical printed paper verification */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Offline QR Seal
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Scan to verify or pay via phone
                    </span>
                  </div>
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="Invoice QR"
                      className="w-16 h-16 rounded border border-slate-300 bg-white p-0.5 shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200 print:hidden">
            <span className="text-xs text-slate-400">
              Automatically saved to offline database
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
                <span>{isSaving ? 'Saving...' : editInvoice ? 'Update Invoice' : 'Generate & Issue Invoice'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
