import React from 'react';
import { 
  Dices, 
  Sparkles, 
  Users, 
  Trophy, 
  Timer, 
  Volume2, 
  VolumeX, 
  Share2, 
  RotateCcw,
  Swords,
  Flame,
  UtensilsCrossed,
  ShieldAlert,
  Zap,
  Layers,
  Tv
} from 'lucide-react';
import { GamePreset, AppMode } from '../types';
import { sound } from '../utils/sound';

interface NavbarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  gamePreset: GamePreset;
  setGamePreset: (preset: GamePreset) => void;
  onOpenRoulette: () => void;
  onOpenDraft: () => void;
  onOpenTimer: () => void;
  onOpenTournament: () => void;
  onOpenExport: () => void;
  onResetAll: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  gamePreset,
  setGamePreset,
  onOpenRoulette,
  onOpenDraft,
  onOpenTimer,
  onOpenTournament,
  onOpenExport,
  onResetAll,
  soundEnabled,
  setSoundEnabled,
}) => {
  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playClick();
  };

  const handlePresetChange = (preset: GamePreset) => {
    setGamePreset(preset);
    sound.playClick();
  };

  const handleModeToggle = (mode: AppMode) => {
    setAppMode(mode);
    sound.playClick();
  };

  return (
    <header className="bg-slate-900 border-b-2 border-indigo-500/30 sticky top-0 z-40 px-3 sm:px-5 py-3 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/40">
            <Dices className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white">
                سامانه هوشمند یارکشی بازی
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Tv className="w-3 h-3" />
                نمایش پرده
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium hidden sm:block">
              سازگار با ویدئوپروژکتور • فونت‌های درشت و خوانا • رنگ‌های پرکنتراست
            </p>
          </div>
        </div>

        {/* 2-Mode Switcher: Simple (ساده) vs Advanced (پیشرفته) */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border-2 border-indigo-500/40 shadow-inner">
          <button
            id="switch-mode-simple-btn"
            onClick={() => handleModeToggle('simple')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              appMode === 'simple'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>نسخه ساده و سریع ⚡</span>
          </button>

          <button
            id="switch-mode-advanced-btn"
            onClick={() => handleModeToggle('advanced')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              appMode === 'advanced'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>نسخه پیشرفته 🚀</span>
          </button>
        </div>

        {/* Advanced Mode Specific Presets & Feature Buttons */}
        {appMode === 'advanced' && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              id="preset-general-btn"
              onClick={() => handlePresetChange('general')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                gamePreset === 'general'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>عمومی</span>
            </button>
            <button
              id="preset-football-btn"
              onClick={() => handlePresetChange('football')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                gamePreset === 'football'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>فوتبال</span>
            </button>
            <button
              id="preset-mafia-btn"
              onClick={() => handlePresetChange('mafia')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                gamePreset === 'mafia'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>مافیا</span>
            </button>
            <button
              id="preset-food-btn"
              onClick={() => handlePresetChange('food_chores')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                gamePreset === 'food_chores'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>غذا و نظافت</span>
            </button>
          </div>
        )}

        {/* Feature Buttons */}
        <div className="flex items-center gap-2">
          {appMode === 'advanced' && (
            <>
              {/* Roulette / Wheel */}
              <button
                id="open-roulette-btn"
                onClick={() => {
                  sound.playClick();
                  onOpenRoulette();
                }}
                title="گردونه شانس و قرعه‌کشی هیجانی"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 border border-purple-400/40 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>گردونه هیجانی</span>
              </button>

              {/* Captain Draft */}
              <button
                id="open-draft-btn"
                onClick={() => {
                  sound.playClick();
                  onOpenDraft();
                }}
                title="یارکشی کاپیتانی نوبتی"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <Swords className="w-3.5 h-3.5 text-indigo-400" />
                <span>کاپیتانی</span>
              </button>

              {/* Match Timer */}
              <button
                id="open-timer-btn"
                onClick={() => {
                  sound.playClick();
                  onOpenTimer();
                }}
                title="تایمر مسابقه و ثبت امتیازات"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">تایمر بازی</span>
              </button>

              {/* Tournament Bracket */}
              <button
                id="open-tournament-btn"
                onClick={() => {
                  sound.playClick();
                  onOpenTournament();
                }}
                title="جدول مسابقات و براکت حذفی"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>جدول مسابقات</span>
              </button>
            </>
          )}

          {/* Export */}
          <button
            id="open-export-btn"
            onClick={() => {
              sound.playClick();
              onOpenExport();
            }}
            title="اشتراک‌گذاری و خروجی"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>خروجی</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'قطع صدا' : 'وصل صدا'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset All */}
          <button
            id="reset-all-btn"
            onClick={() => {
              sound.playClick();
              onResetAll();
            }}
            title="خالی کردن تیم‌ها"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

