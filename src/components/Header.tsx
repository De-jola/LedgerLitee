import React from 'react';
import {
  QrCode,
  Sparkles,
  Users,
  Settings,
  Wallet,
  FileText,
  BarChart3,
  UserCheck,
  Hash,
} from 'lucide-react';
import { BusinessProfile, UserRole, UserAccount } from '../types';
import { AppTab, canAccessTab } from '../utils/permissions';

export type { AppTab } from '../utils/permissions';

interface HeaderProps {
  profile: BusinessProfile;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenAccountModal?: () => void;
  onOpenLanding?: () => void;
  onOpenManualReceiptLogger?: () => void;
  currentAccount?: UserAccount;
  currentRole: UserRole;
  unpaidDebtsCount?: number;
  invoiceCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenSettings,
  onOpenOnboarding,
  onOpenAccountModal,
  onOpenLanding,
  onOpenManualReceiptLogger,
  currentAccount,
  currentRole,
  unpaidDebtsCount = 0,
  invoiceCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between min-h-16 py-2 gap-2 sm:gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={onOpenLanding}
            className="flex items-center gap-3 cursor-pointer group"
            title="View Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
              <Wallet className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition">
                  LedgerLite
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5">
                  Offline-Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                {profile.businessName || 'My Business'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-bold text-slate-600">
            {canAccessTab(currentRole, 'ledger') && <button
              onClick={() => onSelectTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'ledger'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" /> Ledger
            </button>}
            {canAccessTab(currentRole, 'debts') && <button
              onClick={() => onSelectTab('debts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'debts'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" /> Debts
              {unpaidDebtsCount > 0 && (
                <span className="ml-0.5 rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px]">
                  {unpaidDebtsCount}
                </span>
              )}
            </button>}
            {canAccessTab(currentRole, 'reports') && <button
              onClick={() => onSelectTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'reports'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" /> Simple Reports
            </button>}
            {canAccessTab(currentRole, 'invoices') && <button
              onClick={() => onSelectTab('invoices')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'invoices'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" /> Invoices & Receipts
              {invoiceCount > 0 && (
                <span className="ml-0.5 rounded-full bg-teal-100 text-teal-800 px-1.5 py-0.2 text-[10px]">
                  {invoiceCount}
                </span>
              )}
            </button>}
            {canAccessTab(currentRole, 'payroll') && <button
              onClick={() => onSelectTab('payroll')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'payroll'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Manage Staff
            </button>}
            {canAccessTab(currentRole, 'suggestions') && <button
              onClick={() => onSelectTab('suggestions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'suggestions'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Suggestions
            </button>}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Real Cloud Backend Status */}
            <button
              onClick={onOpenAccountModal}
              className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-900 transition shadow-2xs"
              title="Real Cloud Firestore Database Connected (pocketly-1843c)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xl:inline">Cloud Live</span>
              <span className="xl:hidden">Cloud</span>
            </button>

            {/* Active Account Pill / Switcher */}
            <button
              onClick={onOpenAccountModal}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2 py-1.5 text-xs font-bold transition shadow-2xs"
              title="Account & Security Access"
            >
              <div className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-black">
                {(currentAccount?.fullName || profile.ownerName || 'G').charAt(0)}
              </div>
              <span className="hidden md:inline text-slate-800 font-bold max-w-[90px] truncate">
                {currentAccount?.fullName || profile.ownerName || 'Owner'}
              </span>
              <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 capitalize font-bold">
                {currentRole}
              </span>
            </button>

            {/* Quick Tour / Setup */}
            <button
              onClick={onOpenOnboarding}
              className={`hidden sm:flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-2 text-xs font-bold transition ${currentRole !== 'owner' ? 'hidden' : ''}`}
              title="Welcome Tour & Business Setup"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Setup</span>
            </button>

            {/* Quick Log Receipt via Txn # */}
            {onOpenManualReceiptLogger && (
              <button
                onClick={onOpenManualReceiptLogger}
                className="hidden lg:flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-900 font-bold px-3 py-2 text-xs transition shadow-2xs"
                title="Log payment receipt via transaction number"
              >
                <Hash className="w-3.5 h-3.5 text-teal-700" />
                <span>Log Txn #</span>
              </button>
            )}

            {/* Quick Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-2.5 py-2 text-xs shadow-xs transition active:scale-95"
              title="Scan receipt QR or barcode"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Scan Receipt</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className={`rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition ${currentRole !== 'owner' ? 'hidden' : ''}`}
              title="Settings & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (scrollable) */}
        <div className="flex lg:hidden min-w-0 border-t border-slate-100 py-2 gap-1 overflow-x-auto text-[11px] font-bold scrollbar-none">
          {([
            ['ledger', 'Ledger'],
            ['debts', `Debts${unpaidDebtsCount > 0 ? ` (${unpaidDebtsCount})` : ''}`],
            ['reports', 'Reports'],
            ['invoices', 'Invoices & Receipts'],
            ['payroll', 'Staff'],
            ['suggestions', 'Suggestions'],
          ] as [AppTab, string][]).filter(([tab]) => canAccessTab(currentRole, tab)).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === tab ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
