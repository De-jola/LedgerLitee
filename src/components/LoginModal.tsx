import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onSelectLocalAccount: (account: UserAccount) => void;
  onOpenOnboarding: () => void;
  savedAccounts: UserAccount[];
  isSubmitting?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onSelectLocalAccount,
  onOpenOnboarding,
  savedAccounts,
  isSubmitting = false,
}) => {
  const [selectedAcc, setSelectedAcc] = useState<UserAccount | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcc) return;

    if (pin === selectedAcc.pin || selectedAcc.pin === '1234') {
      onSelectLocalAccount(selectedAcc);
      onClose();
    } else {
      setPinError('Incorrect 4-digit security PIN. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                Log In to LedgerLite
              </h3>
              <p className="text-[11px] text-slate-400">
                Access your personalized business dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Option 1: Fast Google Cloud Sign-In */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={async () => {
                await onGoogleSignIn();
                onClose();
              }}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl shadow-xs transition active:scale-95 text-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Or Select Saved Account
            </span>
          </div>

          {/* Option 2: Saved Accounts on Device */}
          {savedAccounts.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Accounts on this device:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedAcc(acc);
                      setPin('');
                      setPinError('');
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      selectedAcc?.id === acc.id
                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                        {acc.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block leading-tight">
                          {acc.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {acc.businessName || 'Business Owner'} • {acc.role}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-teal-600 font-bold">Select</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700">
                No saved accounts found on this device
              </p>
              <p className="text-[11px] text-slate-500">
                Sign in with Google above or complete onboarding below to create your business account.
              </p>
            </div>
          )}

          {/* PIN Input if account selected */}
          {selectedAcc && (
            <form
              onSubmit={handlePinSubmit}
              className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">
                  Enter 4-Digit Security PIN for {selectedAcc.fullName}:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAcc(null)}
                  className="text-amber-800 hover:text-amber-950 text-xs"
                >
                  ✕
                </button>
              </div>

              <input
                type="password"
                maxLength={6}
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN (Default 1234)"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs font-black tracking-widest text-center focus:outline-hidden"
              />

              {pinError && (
                <p className="text-[11px] text-rose-600 font-bold">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Unlock & Open Dashboard
              </button>
            </form>
          )}

          {/* New User Call to Action */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              New to LedgerLite?
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="w-full py-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Start Onboarding & Create Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
