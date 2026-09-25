import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  FileText,
  Receipt,
  Users,
  Wallet,
  TrendingUp,
  BarChart3,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Building2,
  Database,
  UserCheck,
} from 'lucide-react';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenOnboarding: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  isAuthenticated: boolean;
  userBusinessName?: string;
  userFullName?: string;
  userEmail?: string | null;
  isAdmin?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenOnboarding,
  onOpenLogin,
  onOpenAdmin,
  isAuthenticated,
  userBusinessName,
  userFullName,
  userEmail,
  isAdmin = false,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Landing Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                LedgerLite
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smart Business Ledger & Invoicing
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-700 transition">
              How It Works
            </a>
            <a href="#security" className="hover:text-teal-700 transition">
              Security & Cloud
            </a>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-slate-600 hover:text-teal-700 transition font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {userFullName || 'Business Owner'}
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium truncate max-w-[120px]">
                    {userBusinessName || 'Active Account'}
                  </span>
                </div>
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 text-xs shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={onOpenOnboarding}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-100" />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1 space-y-20 py-10 sm:py-16">
        {/* HERO SECTION */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>Modern Business Ledger • Cloud Backed • Offline Ready</span>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Your business records,{' '}
              <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                safely in one place.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
              Record daily sales and expenses, scan paper POS receipts before they fade, issue verified customer receipts, and track outstanding debts—personalized for your business.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {isAuthenticated ? (
              <button
                onClick={onOpenDashboard}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-7 py-3.5 text-sm shadow-lg shadow-teal-700/20 transition cursor-pointer"
              >
                <span>Go to Your Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenOnboarding}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-6 py-3.5 text-sm shadow-lg shadow-teal-700/20 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-100" />
                  <span>Start Onboarding Free</span>
                </button>
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold px-5 py-3.5 text-sm shadow-2xs transition cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>Log In to Account</span>
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium">
            ✓ No complicated accounting jargon • Works on phones and laptops • Instant Setup
          </p>

          {/* Dashboard Preview Mockup Card */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xl text-left space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Live Dashboard Preview
                  </span>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Customized for Your Business
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Today's Sales
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    ₦45,000
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    ✓ Verified Customer Payments
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Today's Expenses
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    ₦12,500
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Stock & Supplies
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Estimated Profit
                  </span>
                  <div className="text-xl font-black text-teal-900">
                    +₦32,500
                  </div>
                  <span className="text-[10px] text-teal-700 font-bold block">
                    Real-time Balance
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-5 h-5 text-teal-700" />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">
                      Instant Thermal POS Receipt Scanner
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Archive paper slips before the ink fades forever
                    </span>
                  </div>
                </div>
                <button
                  onClick={onOpenOnboarding}
                  className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 text-xs shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Get Yours Ready
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES SECTION */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything your business needs
            </h2>
            <p className="text-sm text-slate-600 font-normal">
              Built specifically for micro-businesses, private schools, retail stores, and service agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                POS Receipt Scanner
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan faded Moniepoint, OPay, and bank POS slips instantly with your camera. Stores the payment reference and amount automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Invoices & Customer Debts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate professional bills and track unpaid customer balances. Never forget who owes you or let school fees slip away.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Printable Receipt Slips
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Issue clean, verified receipt slips with QR verification codes for customers and parents with one click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Multi-Role Staff Access
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protect sensitive business profits with role-based security. Cashiers can log sales while Owner sees the full financial picture.
              </p>
            </div>
          </div>
        </section>

        {/* HOW ONBOARDING WORKS */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl space-y-10">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                Simple 3-Step Onboarding
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                How LedgerLite Personalizes Your Experience
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                From registration to your first sale record in under 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-base font-bold text-white">Create Profile</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your business name, trade type (school, shop, services), community location, and preferred currency.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-base font-bold text-white">Security & Roles</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Set your 4-digit master PIN or connect your Google Cloud account so only authorized personnel can access cash records.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-base font-bold text-white">Personalized Dashboard</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your dashboard immediately activates customized with your business identity, live sales cards, and invoicing tools.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onOpenOnboarding}
                className="rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black px-6 py-3.5 text-xs shadow-md transition cursor-pointer"
              >
                Start Onboarding Now
              </button>
            </div>
          </div>
        </section>

        {/* CLOUD & SECURITY BANNER */}
        <section id="security" className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  Google Cloud Firestore Persistence
                </h3>
                <p className="text-xs text-slate-500">
                  Your business records are replicated to secure Google Cloud storage with real-time sync across all your devices.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>
        </section>

        {/* BOTTOM FINAL CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to take control of your business records?
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Join hundreds of business owners who keep their sales, invoices, and debt records safe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenOnboarding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 py-3.5 text-sm shadow-md transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-100" />
              <span>Create Your Business Account</span>
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 text-sm shadow-2xs transition cursor-pointer"
            >
              Sign In to Existing Account
            </button>
          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-teal-700" />
            <span className="font-bold text-slate-800">LedgerLite</span>
            <span>• Business Records, Safely In One Place</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <button
              onClick={onOpenAdmin}
              className="hover:text-teal-700 transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Admin Registry</span>
            </button>
            <span>•</span>
            <button
              onClick={onOpenLogin}
              className="hover:text-teal-700 transition"
            >
              User Login
            </button>
            <span>•</span>
            <button
              onClick={onOpenOnboarding}
              className="hover:text-teal-700 transition"
            >
              Onboarding
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
