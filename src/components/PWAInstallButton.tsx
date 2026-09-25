import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-medium shadow-sm transition active:scale-95"
        title="Install app to your phone for offline use"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 px-3 py-1.5 text-xs font-medium hover:bg-teal-100 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span>Install (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-600" /> Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Tap the Share button</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      Located in the Safari bottom bar <Share2 className="w-3.5 h-3.5 text-teal-600 inline" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Tap "Add to Home Screen"</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      Scroll down and look for <PlusSquare className="w-3.5 h-3.5 text-teal-600 inline" /> icon.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
