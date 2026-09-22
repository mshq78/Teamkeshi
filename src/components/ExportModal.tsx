import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Download, 
  Check, 
  FileText, 
  FileCode, 
  Send,
  Sparkles
} from 'lucide-react';
import { Team, Player } from '../types';
import { formatTeamsForSharing, exportToTextFile, toPersianDigits } from '../utils/persian';
import { sound } from '../utils/sound';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  unassignedPlayers: Player[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  teams,
  unassignedPlayers,
}) => {
  const [copied, setCopied] = useState(false);
  const [customTitle, setCustomTitle] = useState('سامانه یارکشی و قرعه‌کشی بازی');

  if (!isOpen) return null;

  const formattedText = formatTeamsForSharing(teams, unassignedPlayers, customTitle);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    sound.playClick();
    exportToTextFile(formattedText, `teams-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const handleDownloadJson = () => {
    sound.playClick();
    const data = {
      title: customTitle,
      exportDate: new Date().toISOString(),
      teams,
      unassignedPlayers,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teams-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-indigo-500/30 w-full max-w-2xl rounded-3xl p-6 shadow-2xl shadow-indigo-950/60 text-right text-slate-100 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-export-modal"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">خروجی و اشتراک‌گذاری تیم‌ها</h2>
            <p className="text-xs text-slate-400">کپی متن شیک برای تلگرام و واتساپ یا دریافت فایل</p>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-3">
          <label className="text-xs text-slate-300 font-semibold block mb-1">عنوان خروجی:</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Text Preview Box */}
        <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap select-all custom-scrollbar max-h-72">
          {formattedText}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
          <div className="flex items-center gap-2">
            <button
              id="copy-formatted-text-btn"
              onClick={handleCopy}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد!' : 'کپی متن برای پیام‌رسان‌ها'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>فایل TXT</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>پشتیبان JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
