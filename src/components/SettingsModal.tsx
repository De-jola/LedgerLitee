import React, { useState } from 'react';
import {
  X,
  Building,
  DollarSign,
  Download,
  Upload,
  CheckCircle,
  Shield,
  HelpCircle,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';
import { BusinessProfile, TeacherStaff, Transaction, Invoice, IssuedReceipt } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  staffList: TeacherStaff[];
  transactions: Transaction[];
  invoices: Invoice[];
  issuedReceipts: IssuedReceipt[];
  onSaveProfile: (profile: BusinessProfile) => void;
  onExportBackup: () => void;
  onRestoreBackup: (importedData: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  staffList,
  transactions,
  invoices,
  issuedReceipts,
  onSaveProfile,
  onExportBackup,
  onRestoreBackup,
}) => {
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName || '');
  const [businessType, setBusinessType] = useState<BusinessProfile['businessType']>(profile.businessType || 'general');
  const [tagline, setTagline] = useState(profile.tagline);
  const [communityLocation, setCommunityLocation] = useState(profile.communityLocation);
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(profile.currency);
  const [termOrPeriod, setTermOrPeriod] = useState(profile.termOrPeriod);
  const [defaultPosAgent, setDefaultPosAgent] = useState(profile.defaultPosAgent);
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [bankAccountDetails, setBankAccountDetails] = useState(profile.bankAccountDetails || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      businessName: businessName.trim(),
      ownerName: ownerName.trim() || 'Business Owner',
      businessType,
      tagline: tagline.trim(),
      communityLocation: communityLocation.trim(),
      currency: currencyCode,
      currencySymbol,
      termOrPeriod: termOrPeriod.trim(),
      defaultPosAgent: defaultPosAgent.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bankAccountDetails: bankAccountDetails.trim(),
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        onRestoreBackup(json);
        alert('Data successfully restored from backup!');
        onClose();
      } catch (err) {
        alert('Invalid backup file. Please provide a valid LedgerLite JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCurrencySelect = (code: string, sym: string) => {
    setCurrencyCode(code);
    setCurrencySymbol(sym);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 text-white px-5 py-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold">Business & Invoice Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* School Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Institution & Community Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Owner’s Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. John Doe / Business Owner"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type of Business
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 bg-white focus:border-teal-500"
                >
                  <option value="school">School / Academy</option>
                  <option value="shop">Retail Store / Shop</option>
                  <option value="services">Services / Trades</option>
                  <option value="general">General Commerce</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Community / Location
                </label>
                <input
                  type="text"
                  value={communityLocation}
                  onChange={(e) => setCommunityLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Term / Session
                </label>
                <input
                  type="text"
                  value={termOrPeriod}
                  onChange={(e) => setTermOrPeriod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              You can update these details later.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Contact (For Invoices & Slips)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0802-334-5510"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@example.com"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Bank Account Settlement Details
              </label>
              <input
                type="text"
                value={bankAccountDetails}
                onChange={(e) => setBankAccountDetails(e.target.value)}
                placeholder="e.g. First Bank • 0123456789 • My Business"
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Printed on customer invoices as payment instructions for your customers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default POS Agent Point
              </label>
              <input
                type="text"
                value={defaultPosAgent}
                onChange={(e) => setDefaultPosAgent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleCurrencySelect('NGN', '₦')}
                className={`py-2 px-3 rounded-xl border font-bold transition text-left ${
                  currencySymbol === '₦'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ₦ NGN (Naira)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencySelect('GHS', 'GH₵')}
                className={`py-2 px-3 rounded-xl border font-bold transition text-left ${
                  currencySymbol === 'GH₵'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                GH₵ GHS (Cedi)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencySelect('KES', 'KSh')}
                className={`py-2 px-3 rounded-xl border font-bold transition text-left ${
                  currencySymbol === 'KSh'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                KSh KES (Shilling)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencySelect('USD', '$')}
                className={`py-2 px-3 rounded-xl border font-bold transition text-left ${
                  currencySymbol === '$'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                $ USD (Dollar)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencySelect('ZAR', 'R')}
                className={`py-2 px-3 rounded-xl border font-bold transition text-left ${
                  currencySymbol === 'R'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                R ZAR (Rand)
              </button>
              <button
                type="button"
                onClick={() => handleCurrencySelect('INR', '₹')}
                className={`py-2 px-3 rounded-xl border font-bold transition text-left ${
                  currencySymbol === '₹'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ₹ INR (Rupee)
              </button>
            </div>
          </div>

          {/* Backup & Offline Data Storage */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Offline Storage & Data Security
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Backup to File (.json)</span>
              </button>

              <label className="cursor-pointer flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
