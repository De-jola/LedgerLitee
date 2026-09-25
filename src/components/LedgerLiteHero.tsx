import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  Calculator,
  Compass,
  ArrowRight,
  Sparkles,
  HelpCircle,
  QrCode,
  FileText,
  Receipt,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LedgerLiteHeroProps {
  onStartKeepingRecords: () => void;
  onOpenScanner: () => void;
  onOpenCreateInvoice: () => void;
  onOpenOnboarding: () => void;
}

export const LedgerLiteHero: React.FC<LedgerLiteHeroProps> = ({
  onStartKeepingRecords,
  onOpenScanner,
  onOpenCreateInvoice,
  onOpenOnboarding,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const headline = 'Your business records, safely in one place.';
  const subheadline =
    'Record daily sales and expenses, scan paper receipts, create invoices, and manage staff from your phone or computer. No more searching through notebooks to know how your business is doing.';

  return (
    <section className="rounded-2xl border border-teal-100 bg-gradient-to-b from-white via-teal-50/20 to-white shadow-xs overflow-hidden transition-all">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 px-4 sm:px-6 py-2.5 text-white flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="font-black text-amber-300 tracking-tight">LedgerLite</span>
          <span className="hidden sm:inline text-slate-400">• Simple Digital Financial Log for Small Businesses & Rural Schools</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenOnboarding}
            className="text-[11px] font-bold text-teal-300 hover:text-white flex items-center gap-1 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Create Account / Setup</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>{isExpanded ? 'Collapse Overview' : 'Why LedgerLite'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="p-5 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Headline & Subheadline - Option 1 */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Offline-first financial ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {headline}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {subheadline}
            </p>
          </div>

          {/* Primary CTA & Support Text */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <button
              onClick={onStartKeepingRecords}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-6 py-3.5 text-sm shadow-md shadow-teal-700/20 transition cursor-pointer"
            >
              <span>Start keeping records</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenOnboarding}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 text-sm shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-teal-600" />
              <span>Create free account</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium sm:pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Free to use - Works on phone and computer - Easy to learn</span>
            </div>
          </div>

          {/* Expandable Problem & How It Works Sections */}
          {isExpanded && (
            <div className="pt-6 border-t border-slate-200/80 space-y-8 animate-in fade-in duration-300">
              {/* Problem Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Paper Record Pain Points
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Still writing business records in a notebook?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    Paper records can get lost, damaged, forgotten, or difficult to understand later. When records are scattered, it becomes hard to know your real sales, expenses, and profit.
                    With <span className="font-bold text-teal-800">LedgerLite</span>, your daily business records stay organized and easy to find whenever you need them.
                  </p>
                </div>

                {/* Pain-Point Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 transition">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-2">
                      <FolderLock className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">No more lost records</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Keep sales, expenses, receipts, and customer records in one secure place.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 transition">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Know your daily performance</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      See how much money came in, how much went out, and what remains.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 transition">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-2">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Reduce calculation mistakes</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Let the app total your income and expenses for you.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 transition">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Access your records anywhere</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Check your business records from your phone at the shop, at home, or on the road.
                    </p>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Start in a few minutes</h3>
                  <p className="text-xs text-slate-500">How LedgerLite works in your everyday business routine:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] mb-1.5">
                      Step 1
                    </span>
                    <h5 className="font-bold text-slate-800">Create your business profile</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add your business name and choose the currency you use.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] mb-1.5">
                      Step 2
                    </span>
                    <h5 className="font-bold text-slate-800">Record your first sale or expense</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enter the amount, select a category, and save.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] mb-1.5">
                      Step 3
                    </span>
                    <h5 className="font-bold text-slate-800">Take photos of receipts</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Keep proof of purchases safely with each expense.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] mb-1.5">
                      Step 4
                    </span>
                    <h5 className="font-bold text-slate-800">Check your business summary</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      See your sales, spending, and profit without manual calculations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Free Plan Section & Included Features */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-teal-900 text-white shadow-sm">
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-700/60 text-teal-200 text-[10px] font-bold">
                    <span>100% Free Plan</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Free for businesses starting out</h4>
                  <p className="text-xs text-teal-100/90 leading-relaxed">
                    LedgerLite is free for now, so you can start moving your business records from paper to digital without paying anything.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-teal-200">
                    <span className="flex items-center gap-1">✓ Record income and expenses</span>
                    <span className="flex items-center gap-1">✓ Scan and store receipts</span>
                    <span className="flex items-center gap-1">✓ Create invoices & receipts</span>
                    <span className="flex items-center gap-1">✓ Track customer debts</span>
                    <span className="flex items-center gap-1">✓ View simple reports</span>
                    <span className="flex items-center gap-1">✓ Add staff members</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={onOpenOnboarding}
                    className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 text-xs shadow-md transition active:scale-95"
                  >
                    Create your free account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Statement Footer */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>
          <strong className="text-slate-800">Your records are yours.</strong> Your business information is stored securely and is only visible to you and the staff members you approve.
        </span>
      </div>
    </section>
  );
};
