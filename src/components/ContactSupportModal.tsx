import React, { useState } from 'react';
import { X, Mail, Check, Copy, ExternalLink, Send, ShieldCheck, Heart } from 'lucide-react';
import { soundSynth } from '../utils/audio';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [subjectText, setSubjectText] = useState('Feedback & Academic Support');
  const [messageText, setMessageText] = useState('');

  if (!isOpen) return null;

  const supportEmail = 'goditor77@gmail.com';

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      soundSynth.playBeep(900, 100);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
      `[JEE 2027 Command] ${subjectText}`
    )}&body=${encodeURIComponent(messageText)}`;
    window.location.href = mailtoUrl;
    soundSynth.playVictory();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Contact & Support</h3>
              <p className="text-xs text-zinc-400">Official Creator & Community Desk</p>
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
          {/* Email Card */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="font-semibold text-white uppercase tracking-wider">Official Support Desk</span>
              <span className="text-zinc-500">24/7 Academic Inquiries</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3 py-2 rounded-lg flex-1 truncate select-all">
                {supportEmail}
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${supportEmail}?subject=JEE%202027%20Master%20Command%20Support`}
                className="px-3.5 py-2 bg-white text-black hover:bg-zinc-200 font-semibold rounded-lg transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Quick Message Form */}
          <form onSubmit={handleSendEmail} className="space-y-3">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Send Direct Feedback or Problem Report
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Inquiry Topic</label>
              <select
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 font-mono"
              >
                <option value="Feedback & Academic Support">General Feedback & Academic Support</option>
                <option value="Bug Report or Feature Request">Bug Report or Feature Request</option>
                <option value="Coaching Schedule Import Inquiry">Coaching Timetable Import Help</option>
                <option value="Offline PWA Support">Offline Android PWA Setup Assistance</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-mono block mb-1">Message</label>
              <textarea
                required
                rows={3}
                placeholder="Share your questions, suggestions, or doubts directly with the author..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg p-3 font-mono resize-none focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Email to goditor77@gmail.com</span>
            </button>
          </form>

          {/* Open & Free Access Policy */}
          <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1.5 text-zinc-400 text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Free & Open JEE 2027 Initiative</span>
            </div>
            <p>
              This app is completely free and open for every IIT-JEE 2027 aspirant. No paywalls, no mandatory signups. Share the link with study groups, classmates, and coaching peers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
            Built for JEE 2027 Aspirants with <Heart className="w-3 h-3 text-zinc-400 fill-zinc-400 inline" />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
