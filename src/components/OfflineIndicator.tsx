import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl ring-1 ring-amber-700/50 backdrop-blur">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <div>
        <p className="font-semibold leading-tight">Working 100% Offline</p>
        <p className="text-[11px] text-amber-100 flex items-center gap-1 mt-0.5">
          <Database className="w-3 h-3" /> Records safely saved to phone storage
        </p>
      </div>
    </div>
  );
};
