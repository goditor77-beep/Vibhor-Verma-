import React from 'react';
import { Mail, Calendar, Smartphone, ShieldCheck, Heart } from 'lucide-react';
import { NavTab } from './Header';

interface FooterProps {
  onTabChange: (tab: NavTab) => void;
  onOpenContact: () => void;
  onOpenAndroid: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenContact, onOpenAndroid }) => {
  return (
    <footer className="border-t border-zinc-800/80 bg-black mt-16 py-8 text-xs font-mono text-zinc-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Mission */}
        <div className="space-y-1 text-center md:text-left">
          <div className="text-white font-bold text-sm tracking-tight flex items-center justify-center md:justify-start gap-2">
            <span>JEE 2027 MASTER COMMAND AI</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-sans">
            Free & Open High-Yield Academic Workspace for IIT-JEE 2027 Aspirants
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={() => onTabChange('overview')}
            className="hover:text-white transition"
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('planner')}
            className="hover:text-white transition"
          >
            Planner & OCR
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className="hover:text-white transition"
          >
            Progress Dashboard
          </button>
          <button
            onClick={() => onTabChange('mock-exam')}
            className="hover:text-white transition"
          >
            Mock Studio
          </button>
        </div>

        {/* Contact and Support trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAndroid}
            className="text-zinc-400 hover:text-white transition flex items-center gap-1.5"
            title="Download on Android"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android PWA</span>
          </button>

          <span>·</span>

          <button
            onClick={onOpenContact}
            className="text-white hover:underline transition flex items-center gap-1.5 font-semibold"
            title="Contact Developer & Academic Support"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Support: goditor77@gmail.com</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
