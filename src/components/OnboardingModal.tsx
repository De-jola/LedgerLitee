import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Phone,
  Mail,
  MapPin,
  Coins,
  User,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  QrCode,
  FileText,
  CheckCircle2,
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  Users,
  Shield,
  ArrowLeft,
  DollarSign,
  Briefcase,
  Store,
} from 'lucide-react';
import { BusinessProfile, UserAccount, UserRole, TeacherStaff } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  currentAccount?: UserAccount;
  onSaveProfile: (profile: BusinessProfile) => void;
  onSaveAccount: (account: UserAccount) => void;
  onAddStaffMember?: (staff: TeacherStaff) => void;
  onSelectFirstAction: (action: 'sale' | 'expense' | 'scan' | 'invoice') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentAccount,
  onSaveProfile,
  onSaveAccount,
  onAddStaffMember,
  onSelectFirstAction,
}) => {
  // Step state: 1 (Account Creation), 2 (Business Setup), 3 (Staff Access), 4 (Ready & First Record)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: User Account & Security
  const [fullName, setFullName] = useState(currentAccount?.fullName || profile.ownerName || '');
  const [emailOrPhone, setEmailOrPhone] = useState(currentAccount?.emailOrPhone || profile.phone || '');
  const [role, setRole] = useState<UserRole>(currentAccount?.role || 'owner');
  const [pin, setPin] = useState(currentAccount?.pin || '1234');
  const [confirmPin, setConfirmPin] = useState(currentAccount?.pin || '1234');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Step 2: Business Profile
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [businessType, setBusinessType] = useState<BusinessProfile['businessType']>(profile.businessType || 'general');
  const [communityLocation, setCommunityLocation] = useState(profile.communityLocation || '');
  const [currency, setCurrency] = useState(profile.currency || 'NGN');
  const [startingCash, setStartingCash] = useState<string>('');

  // Step 3: Optional Staff Member
  const [addStaffOption, setAddStaffOption] = useState<'solo' | 'add'>('solo');
  const [staffName, setStaffName] = useState('');
  const [staffRoleTitle, setStaffRoleTitle] = useState('Sales Cashier');
  const [staffRoleType, setStaffRoleType] = useState<UserRole>('cashier');
  const [staffWage, setStaffWage] = useState('35000');
  const [staffPhone, setStaffPhone] = useState('');

  if (!isOpen) return null;

  // Handle Step 1 -> Step 2
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setPinError('Please enter at least 4 digits for your security PIN.');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('Security PINs do not match. Please re-enter.');
      return;
    }
    setPinError('');
    setStep(2);
  };

  // Handle Step 2 -> Step 3
  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  // Handle Step 3 -> Step 4 (Save Account and Business Profile)
  const handleFinalizeSetup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const currencySymbols: Record<string, string> = {
      NGN: '₦',
      GHS: 'GH₵',
      KES: 'KSh',
      USD: '$',
      GBP: '£',
      EUR: '€',
    };

    // 1. Save Profile
    const updatedProfile: BusinessProfile = {
      ...profile,
      businessName: businessName.trim() || 'My Business',
      ownerName: fullName.trim() || 'Business Owner',
      businessType,
      phone: emailOrPhone.trim(),
      communityLocation: communityLocation.trim() || 'Community Town',
      currency,
      currencySymbol: currencySymbols[currency] || '₦',
      openingCash: Math.max(0, parseFloat(startingCash) || 0),
    };
    onSaveProfile(updatedProfile);

    // 2. Save User Account
    const newAccount: UserAccount = {
      id: currentAccount?.id || `acc-${Date.now()}`,
      fullName: fullName.trim() || 'Business Owner',
      emailOrPhone: emailOrPhone.trim(),
      role,
      pin,
      businessName: businessName.trim() || 'My Business',
      createdAt: currentAccount?.createdAt || Date.now(),
      lastLoginAt: Date.now(),
    };
    onSaveAccount(newAccount);

    // 3. Add Staff member if requested
    if (addStaffOption === 'add' && staffName.trim() && onAddStaffMember) {
      const newStaff: TeacherStaff = {
        id: `staff-${Date.now()}`,
        name: staffName.trim(),
        role: staffRoleTitle.trim() || 'Staff Assistant',
        roleType: staffRoleType,
        monthlySalary: parseFloat(staffWage) || 0,
        phone: staffPhone.trim(),
        status: 'active',
      };
      onAddStaffMember(newStaff);
    }

    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Step Indicator Header Bar */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">
                LedgerLite Onboarding
              </span>
              <span className="text-slate-400 text-[11px] block">
                {step === 1 && 'Step 1 of 4: Create Your Account'}
                {step === 2 && 'Step 2 of 4: Business Profile & Currency'}
                {step === 3 && 'Step 3 of 4: Staff & Permission Roles'}
                {step === 4 && 'Step 4 of 4: Ready to Keep Records'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs transition ${
                  step === s
                    ? 'bg-teal-500 text-white font-black'
                    : step > s
                    ? 'bg-teal-900 text-teal-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
            <button
              onClick={onClose}
              className="ml-3 text-slate-400 hover:text-white p-1 rounded-lg transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: Account Creation & Security PIN */}
        {step === 1 && (
          <form onSubmit={handleAccountSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Create your business account
                </h2>
                <p className="text-xs text-slate-500">
                  Set up your owner credentials and a 4-digit PIN for quick local access.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name / Owner Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe / Business Owner"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Phone or Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number or Email Address
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. 0802-334-5510 or owner@business.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Account Role */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Primary Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      role === 'owner'
                        ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-black text-xs block text-purple-900">Owner</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Full access to records & settings
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('manager')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      role === 'manager'
                        ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-black text-xs block text-blue-900">Manager</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Manage records & staff
                    </span>
                  </button>
                </div>
              </div>

              {/* 4-Digit Security PIN */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                    <span>Create 4-Digit Security PIN</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPin ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Enter PIN</span>
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-full text-center tracking-widest text-base font-black py-2 rounded-lg border border-slate-300 bg-white focus:border-teal-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Confirm PIN</span>
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-full text-center tracking-widest text-base font-black py-2 rounded-lg border border-slate-300 bg-white focus:border-teal-600 outline-hidden"
                    />
                  </div>
                </div>

                {pinError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">{pinError}</p>
                )}
                <p className="text-[10px] text-slate-400">
                  This PIN secures your offline books and allows you to lock and unlock LedgerLite.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Step 1 of 4</span>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-6 py-2.5 text-xs shadow-md transition"
              >
                <span>Next: Business Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Business Profile & Currency */}
        {step === 2 && (
          <form onSubmit={handleBusinessSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Tell us about your business
                </h2>
                <p className="text-xs text-slate-500">
                  Personalize your invoices, receipt vouchers, and currency.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Business Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Enterprises / Central Retail Store"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Type of Business & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type of business</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs bg-white font-semibold focus:border-teal-600 outline-hidden"
                  >
                    <option value="school">School / Academy</option>
                    <option value="shop">Retail Shop / Store</option>
                    <option value="services">Services / Trades</option>
                    <option value="general">General Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-teal-600" /> Main currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs bg-white font-semibold focus:border-teal-600 outline-hidden"
                  >
                    <option value="NGN">Nigerian Naira (NGN • ₦)</option>
                    <option value="GHS">Ghanaian Cedi (GHS • GH₵)</option>
                    <option value="KES">Kenyan Shilling (KES • KSh)</option>
                    <option value="USD">US Dollar (USD • $)</option>
                    <option value="GBP">British Pound (GBP • £)</option>
                    <option value="EUR">Euro (EUR • €)</option>
                  </select>
                </div>
              </div>

              {/* Community Location */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> Location / Community
                </label>
                <input
                  type="text"
                  required
                  value={communityLocation}
                  onChange={(e) => setCommunityLocation(e.target.value)}
                  placeholder="e.g. Ikorodu Rural Ward 4, Lagos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-teal-600 outline-hidden"
                />
              </div>

              {/* Optional Starting Cash */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  Starting Cash in Drawer / Petty Cash (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={startingCash}
                    onChange={(e) => setStartingCash(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold focus:border-teal-600 outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Enter your physical cash balance on hand to start tracking cash flow accurately.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-6 py-2.5 text-xs shadow-md transition"
              >
                <span>Next: Staff Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Staff & Permission Roles */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Staff & Role Permissions
                </h2>
                <p className="text-xs text-slate-500">
                  Let your staff help without losing control of confidential records.
                </p>
              </div>
            </div>

            {/* Option: Solo vs Add Staff */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setAddStaffOption('solo')}
                className={`p-3 rounded-xl border text-left transition ${
                  addStaffOption === 'solo'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-teal-700" />
                  <span className="font-black text-xs">I manage it myself</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  You are the sole user for now. You can add staff at any time later.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAddStaffOption('add')}
                className={`p-3 rounded-xl border text-left transition ${
                  addStaffOption === 'add'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="w-4 h-4 text-teal-700" />
                  <span className="font-black text-xs">Add a staff member</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Add a cashier, clerk, or manager with designated permissions.
                </p>
              </button>
            </div>

            {/* If Adding a Staff Member */}
            {addStaffOption === 'add' && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Staff Name</label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Mr. Emmanuel Okon"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-teal-600 outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Staff Role Type</label>
                    <select
                      value={staffRoleType}
                      onChange={(e) => setStaffRoleType(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold focus:border-teal-600 outline-hidden"
                    >
                      <option value="cashier">Cashier — Record sales & issue receipts</option>
                      <option value="manager">Manager — Records, staff, invoices</option>
                      <option value="viewer">Viewer — Read-only selected records</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Title / Department</label>
                    <input
                      type="text"
                      value={staffRoleTitle}
                      onChange={(e) => setStaffRoleTitle(e.target.value)}
                      placeholder="e.g. Sales Cashier / Primary 4 Teacher"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-teal-600 outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Monthly Wage (₦)</label>
                    <input
                      type="number"
                      value={staffWage}
                      onChange={(e) => setStaffWage(e.target.value)}
                      placeholder="40000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-teal-600 outline-hidden font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Permissions Summary Banner */}
            <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 space-y-1.5 text-xs text-teal-900">
              <span className="font-bold text-teal-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>How LedgerLite Protects Your Business</span>
              </span>
              <p className="text-[11px] text-teal-800/80 leading-relaxed">
                Only the <strong>Owner</strong> can view complete profit summaries and delete past ledger entries. Cashiers are restricted to recording daily sales and printing customer payment slips.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinalizeSetup}
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-6 py-2.5 text-xs shadow-md transition"
              >
                <span>Finish & Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Ready & First Record Choice */}
        {step === 4 && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-amber-300" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Account created successfully!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Welcome, <strong>{fullName}</strong>. Your business records for <strong>{businessName}</strong> are safely initialized.
              </p>
            </div>

            {/* Account Card Badge */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-black flex items-center justify-center text-xs">
                  {fullName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{fullName}</span>
                  <span className="text-[11px] text-teal-800 font-semibold flex items-center gap-1">
                    <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                      {role}
                    </span>
                    <span>• {businessName}</span>
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                PIN: ••••
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                What would you like to record first?
              </h4>
              <p className="text-[11px] text-slate-500">
                Choose an action to immediately add to your books:
              </p>
            </div>

            {/* 4 Action Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectFirstAction('sale');
                }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition active:scale-95 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 group-hover:scale-105 transition">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-emerald-950">I made a sale</h5>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Record money received from a student or customer.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectFirstAction('expense');
                }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 text-left transition active:scale-95 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 group-hover:scale-105 transition">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-rose-950">I spent money</h5>
                  <p className="text-[11px] text-rose-800/80 mt-0.5">
                    Log staff wages, generator fuel, chalk, or supplies.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectFirstAction('scan');
                }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 text-left transition active:scale-95 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 group-hover:scale-105 transition">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-amber-950">I want to scan a receipt</h5>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    Scan a POS slip or paper voucher to preserve faded ink.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectFirstAction('invoice');
                }}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition active:scale-95 group shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 group-hover:scale-105 transition">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-indigo-950">I want to create an invoice</h5>
                  <p className="text-[11px] text-indigo-800/80 mt-0.5">
                    Send a professional bill to a customer or parent.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                You can access all tools anytime from the menu.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition"
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Security Statement Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-2.5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Your records are yours. Your business information is stored securely on your device.</span>
        </div>
      </div>
    </div>
  );
};
