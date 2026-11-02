import React, { useState } from 'react';
import { Smartphone, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AndroidInstallModal } from './AndroidInstallModal';
import { soundSynth } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    soundSynth.playBeep(750, 100);
    if (isInstallable) {
      const res = await install();
      if (!res) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}

        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isInstalled
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              : 'bg-white text-black hover:bg-zinc-200'
          }`}
          title="Download Android app for 100% offline study"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isInstalled ? 'Installed' : 'Android App'}</span>
        </button>
      </div>

      <AndroidInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
