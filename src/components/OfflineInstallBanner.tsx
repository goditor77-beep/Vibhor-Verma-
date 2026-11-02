import React, { useState } from 'react';
import { Smartphone, Download, ArrowRight } from 'lucide-react';
import { AndroidInstallModal } from './AndroidInstallModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { soundSynth } from '../utils/audio';

export const OfflineInstallBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="font-bold text-white text-sm">Download on Android</span>
              <span>·</span>
              <span>100% Offline Capability</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Installs into your Android app drawer. Runs without mobile data or Wi-Fi.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundSynth.playBell();
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Android Setup Link</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <AndroidInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
