import React, { useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageSquare, 
  Shuffle, 
  Users, 
  RotateCcw,
  Zap,
  Rocket,
  Sun,
  Moon,
  Plus,
  Minus
} from 'lucide-react';
import { AppMode, DisplaySize, DisplayTheme } from '../types';
import { sound } from '../utils/sound';
import { toPersianDigits } from '../utils/persian';

interface DatashowHeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  displaySize: DisplaySize;
  onDisplaySizeChange: (size: DisplaySize) => void;
  displayTheme: DisplayTheme;
  onDisplayThemeChange: (theme: DisplayTheme) => void;
  teamsCount: number;
  onTeamsCountChange: (count: number) => void;
  unassignedCount: number;
  totalParticipants: number;
  onOpenSmsModal: () => void;
  onOpenParticipantsModal: () => void;
  onAutoFillRemaining: () => void;
  onResetDraft: () => void;
}

export const DatashowHeader: React.FC<DatashowHeaderProps> = ({
  mode,
  onModeChange,
  displaySize,
  onDisplaySizeChange,
  displayTheme,
  onDisplayThemeChange,
  teamsCount,
  onTeamsCountChange,
  unassignedCount,
  totalParticipants,
  onOpenSmsModal,
  onOpenParticipantsModal,
  onAutoFillRemaining,
  onResetDraft,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(!sound.enabled);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setIsSoundMuted(!sound.enabled);
    if (sound.enabled) sound.playClick();
  };

  const isProjectorMode = displaySize !== 'normal';

  return (
    <header className={`border-b transition-colors select-none ${
      displayTheme === 'dark-neon'
        ? 'bg-slate-900/95 border-slate-800 backdrop-blur-md text-slate-100'
        : 'bg-white border-slate-300 text-slate-900 shadow-sm'
    }`}>
      {/* Top Main Bar */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight">
                  یارکشی زنده بوت‌کمپ
                </h1>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                  isProjectorMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {displaySize === 'normal' ? 'نسخه استاندارد' : displaySize === 'projector' ? 'پروژکتور بزرگ' : 'سالن آمفی‌تئاتر'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                مخصوص افتتاحیه، انتخاب سرگروه و نمایش بزرگ روی پرده
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs (Simple vs Advanced) */}
          <div className="hidden lg:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 mr-2">
            <button
              onClick={() => {
                sound.playClick();
                onModeChange('simple');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'simple'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ ساده و سریع</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onModeChange('advanced');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'advanced'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>🚀 پیشرفته (با تایمر و لاگ)</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            unassignedCount > 0 
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          }`}>
            <span>منتظر انتخاب:</span>
            <span className="text-base sm:text-lg font-black font-mono">
              {toPersianDigits(unassignedCount)}
            </span>
            <span className="text-xs text-slate-400">از {toPersianDigits(totalParticipants)}</span>
          </div>

          {/* Team count quick controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-2 py-1">
            <span className="text-xs text-slate-400 font-medium ml-1">تعداد تیم:</span>
            <button
              onClick={() => {
                sound.playClick();
                onTeamsCountChange(Math.max(2, teamsCount - 1));
              }}
              disabled={teamsCount <= 2}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent"
              title="کاهش تعداد تیم‌ها"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-cyan-400 px-1.5 font-mono">{toPersianDigits(teamsCount)}</span>
            <button
              onClick={() => {
                sound.playClick();
                onTeamsCountChange(Math.min(8, teamsCount + 1));
              }}
              disabled={teamsCount >= 8}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent"
              title="افزایش تعداد تیم‌ها"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Auto fill remaining if any left */}
          {unassignedCount > 0 && (
            <button
              onClick={() => {
                sound.playShuffle();
                onAutoFillRemaining();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title="توزیع تصادفی و عادلانه افراد باقیمانده بین تیم‌ها"
            >
              <Shuffle className="w-4 h-4" />
              <span>توزیع تصادفی باقیمانده</span>
            </button>
          )}

          {/* SMS for Leaders button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSmsModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            title="تولید و ارسال پیامک فوق خلاصه و کم‌هزینه برای سرگروه‌ها"
          >
            <MessageSquare className="w-4 h-4" />
            <span>پیامک سرگروه‌ها</span>
          </button>

          {/* Manage Participants */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenParticipantsModal();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            title="ویرایش اسامی و لیست شرکت‌کنندگان"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">مدیریت اسامی</span>
          </button>

          {/* Datashow Screen Settings (Font Scaling) */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => {
                sound.playClick();
                onDisplaySizeChange('normal');
              }}
              className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                displaySize === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="اندازه معمولی مناسب لپ‌تاپ و گوشی"
            >
              عادی
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onDisplaySizeChange('projector');
              }}
              className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                displaySize === 'projector' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="پرده دیتاشو بزرگ"
            >
              پروژکتور
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onDisplaySizeChange('auditorium');
              }}
              className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                displaySize === 'auditorium' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="سالن آمفی‌تئاتر خیلی بزرگ (حداکثر درشتی)"
            >
              سالن بزرگ
            </button>
          </div>

          {/* Theme contrast toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onDisplayThemeChange(displayTheme === 'dark-neon' ? 'bright-stage' : 'dark-neon');
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="تغییر کنتراست رنگ‌ها (حالت سالن روشن / سالن تاریک)"
          >
            {displayTheme === 'dark-neon' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title={isSoundMuted ? 'فعال‌سازی افکت‌های صوتی' : 'بی‌صدا کردن'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors hidden sm:flex"
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام صفحه روی پرده دیتاشو'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowResetConfirm(true);
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="ریست و بازگشت همه به سالن"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* In-App Confirmation Modal for Reset Draft */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">ریست و بازگشت تمام افراد به سالن</h3>
                <p className="text-xs text-slate-400 mt-0.5">تمام اعضای تیم‌ها خالی شده و به لیست افراد منتظر انتخاب برمی‌گردند.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  sound.playWhistle();
                  onResetDraft();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                بله، ریست کن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-around border-t border-slate-800 px-3 py-1.5 bg-slate-950/60">
        <button
          onClick={() => {
            sound.playClick();
            onModeChange('simple');
          }}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
            mode === 'simple' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
          }`}
        >
          ⚡ نسخه ساده و سریع
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onModeChange('advanced');
          }}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
            mode === 'advanced' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'
          }`}
        >
          🚀 نسخه پیشرفته (تایمر و لاگ)
        </button>
      </div>
    </header>
  );
};
