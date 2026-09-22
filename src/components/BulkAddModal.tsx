import React, { useState } from 'react';
import { X, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { Player, SkillLevel } from '../types';
import { sound } from '../utils/sound';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayers: (newPlayers: Player[]) => void;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onAddPlayers }) => {
  const [text, setText] = useState('');
  const [defaultSkill, setDefaultSkill] = useState<SkillLevel>(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text
      .split(/[\n,،\r]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const newPlayers: Player[] = lines.map((name, index) => ({
      id: `p-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      skill: defaultSkill,
      role: 'none',
      isPresent: true,
    }));

    onAddPlayers(newPlayers);
    sound.playPop();
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-indigo-500/30 w-full max-w-lg rounded-3xl p-6 shadow-2xl shadow-purple-950/50 text-right text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-bulk-modal"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">افزودن دسته‌ای بازیکنان</h2>
            <p className="text-xs text-slate-400">اسامی را با خط جدید (Enter) یا کاما وارد کنید</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              لیست اسامی بازیکنان:
            </label>
            <textarea
              id="bulk-players-textarea"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="علی رضایی&#10;محمد حسینی&#10;سارا کریمی&#10;مهدی نوری..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              سطح مهارت اولیه برای افراد جدید:
            </span>
            <div className="flex items-center gap-1">
              {([1, 2, 3, 4, 5] as SkillLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setDefaultSkill(lvl)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    defaultSkill === lvl
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}★
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              انصراف
            </button>
            <button
              id="submit-bulk-players-btn"
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت و اضافه به لیست</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
