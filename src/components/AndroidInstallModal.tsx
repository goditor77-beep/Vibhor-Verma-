import React, { useState } from 'react';
import { X, Smartphone, Download, Check, Copy, ShieldCheck, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundSynth } from '../utils/audio';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      soundSynth.playBeep(900, 100);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectInstall = async () => {
    soundSynth.playBell();
    const success = await install();
    if (success) {
      soundSynth.playVictory();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Download on Android
              </h3>
              <p className="text-xs text-zinc-400">
                100% Offline Progressive Web App
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 font-sans text-xs">
          {/* Direct Install Button */}
          {isInstallable && (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
              <div className="font-semibold text-white">Direct Installation Detected</div>
              <p className="text-zinc-400">
                Install JEE 2027 Command AI directly into your Android app drawer.
              </p>
              <button
                onClick={handleDirectInstall}
                className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition flex items-center justify-center gap-2 mt-2"
              >
                <Download className="w-4 h-4" />
                <span>Install Directly on Android</span>
              </button>
            </div>
          )}

          {/* Share / Open on Android Phone */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-mono text-zinc-400 block">
              Android Installation Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 px-3 py-2 rounded-lg flex-1 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3 Step Android Guide */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">
              Installation Steps (10 Seconds)
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-zinc-300">
                  Open this link in <strong>Google Chrome</strong> on your Android phone.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="text-zinc-300">
                  Tap the three dots (<strong>⋮</strong>) in the top-right corner of Chrome and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="text-zinc-300">
                  Launch the app from your home screen. It opens in distraction-free full screen and functions completely offline.
                </p>
              </div>
            </div>
          </div>

          {/* Offline Guarantee */}
          <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Offline Verified</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              All timers, alarms, countdown calculations, error logs, and formula vault sheets are cached locally by the Service Worker and execute with zero mobile data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
