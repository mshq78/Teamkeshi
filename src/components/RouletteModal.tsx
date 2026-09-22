import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  Play, 
  Pause, 
  FastForward, 
  Dices, 
  Trophy, 
  User, 
  Star, 
  CheckCircle,
  Crown
} from 'lucide-react';
import { Player, Team } from '../types';
import { toPersianDigits, shuffleArray } from '../utils/persian';
import { sound } from '../utils/sound';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlayers: Player[];
  teams: Team[];
  onFinishRoulette: (assignments: { playerId: string; teamId: string }[]) => void;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  availablePlayers,
  teams,
  onFinishRoulette,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledPlayers, setShuffledPlayers] = useState<Player[]>([]);
  const [currentCandidateTeam, setCurrentCandidateTeam] = useState<number>(0);
  const [assignments, setAssignments] = useState<{ playerId: string; teamId: string }[]>([]);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  useEffect(() => {
    if (isOpen) {
      const active = availablePlayers.filter((p) => p.isPresent);
      setShuffledPlayers(shuffleArray(active));
      setCurrentIndex(0);
      setAssignments([]);
      setIsRunning(false);
    }
  }, [isOpen, availablePlayers]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && currentIndex < shuffledPlayers.length) {
      const stepDuration = speed === 'slow' ? 1400 : speed === 'fast' ? 300 : 700;
      let tickCount = 0;
      const totalTicks = speed === 'slow' ? 12 : speed === 'fast' ? 4 : 8;

      // Cycle animation for the slot effect
      const spinInterval = setInterval(() => {
        setCurrentCandidateTeam((prev) => (prev + 1) % teams.length);
        sound.playTick();
        tickCount++;

        if (tickCount >= totalTicks) {
          clearInterval(spinInterval);
          // Determine assigned team index based on round robin or team balance
          const assignedTeamIdx = assignments.length % teams.length;
          setCurrentCandidateTeam(assignedTeamIdx);
          sound.playPop();

          const currentPlayer = shuffledPlayers[currentIndex];
          const newAssignment = {
            playerId: currentPlayer.id,
            teamId: teams[assignedTeamIdx].id,
          };

          setAssignments((prev) => [...prev, newAssignment]);
          setCurrentIndex((idx) => idx + 1);
        }
      }, stepDuration / totalTicks);

      return () => {
        clearInterval(spinInterval);
      };
    } else if (isRunning && currentIndex >= shuffledPlayers.length && shuffledPlayers.length > 0) {
      setIsRunning(false);
      sound.playFanfare();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentIndex, shuffledPlayers, speed, teams, assignments.length]);

  if (!isOpen) return null;

  const handleApply = () => {
    onFinishRoulette(assignments);
    sound.playClick();
    onClose();
  };

  const handleFastComplete = () => {
    const unassigned = shuffledPlayers.slice(assignments.length);
    const completeAssignments = [...assignments];
    unassigned.forEach((p, idx) => {
      const teamIdx = (completeAssignments.length) % teams.length;
      completeAssignments.push({
        playerId: p.id,
        teamId: teams[teamIdx].id,
      });
    });
    setAssignments(completeAssignments);
    setCurrentIndex(shuffledPlayers.length);
    setIsRunning(false);
    sound.playFanfare();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const currentPlayer = currentIndex < shuffledPlayers.length ? shuffledPlayers[currentIndex] : null;
  const isFinished = assignments.length === shuffledPlayers.length && shuffledPlayers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-purple-500/40 w-full max-w-2xl rounded-3xl p-6 shadow-2xl shadow-purple-950/70 text-right text-slate-100 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-roulette-modal"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              گردونه هیجانی قرعه‌کشی و یارکشی زنده
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {toPersianDigits(assignments.length)} از {toPersianDigits(shuffledPlayers.length)}
              </span>
            </h2>
            <p className="text-xs text-slate-400">نمایش زنده یارکشی با جلوه‌های صوتی و تصویری ویژه</p>
          </div>
        </div>

        {/* Main Stage Arena */}
        <div className="flex-1 flex flex-col items-center justify-center my-4 p-6 rounded-3xl bg-slate-950/80 border border-purple-500/20 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-pink-600/5 to-transparent pointer-events-none" />

          {isFinished ? (
            <div className="text-center py-6 animate-scaleUp z-10">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-yellow-500/30 ring-4 ring-yellow-400/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white mb-1">قرعه‌کشی تمام شد! 🎉</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mb-4">
                همه بازیکنان با موفقیت در تیم‌ها قرار گرفتند. برای ثبت نهایی دکمه زیر را بزنید.
              </p>
            </div>
          ) : currentPlayer ? (
            <div className="w-full flex flex-col items-center gap-5 z-10">
              {/* Active Player Showcase */}
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  در حال قرعه‌کشی برای:
                </span>
                <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 shadow-lg text-lg font-bold text-white flex items-center gap-2">
                  <span>{currentPlayer.name}</span>
                  {currentPlayer.role === 'captain' && (
                    <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Crown className="w-3 h-3 text-amber-400" /> کاپیتان
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {Array.from({ length: currentPlayer.skill }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Slot Target Team Box */}
              <div className="w-full max-w-sm p-4 rounded-2xl bg-slate-900 border-2 border-dashed border-purple-500/50 flex items-center justify-center text-center shadow-inner">
                {teams[currentCandidateTeam] && (
                  <div className="animate-fadeIn">
                    <span className="text-[11px] text-slate-400 block mb-1">تیم منتخب:</span>
                    <span
                      className="text-base font-extrabold"
                      style={{ color: teams[currentCandidateTeam].color }}
                    >
                      {teams[currentCandidateTeam].name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <Dices className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <span>برای شروع قرعه‌کشی دکمه «شروع یارکشی» را بزنید</span>
            </div>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-2 mt-4 text-xs z-10">
            <span className="text-slate-400 text-[11px]">سرعت:</span>
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  speed === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'slow' ? 'هیجانی (آرام)' : s === 'normal' ? 'متوسط' : 'سریع'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Assignment Preview List */}
        <div className="max-h-28 overflow-y-auto space-y-1 pr-1 custom-scrollbar text-xs">
          {assignments.map((item, idx) => {
            const p = shuffledPlayers.find((x) => x.id === item.playerId);
            const t = teams.find((x) => x.id === item.teamId);
            if (!p || !t) return null;
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">{p.name}</span>
                </div>
                <span className="font-bold text-xs" style={{ color: t.color }}>
                  {t.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800 mt-3">
          <div className="flex items-center gap-2">
            {!isFinished && (
              <>
                <button
                  id="start-pause-roulette-btn"
                  onClick={() => {
                    sound.playClick();
                    setIsRunning(!isRunning);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'توقف موقت' : 'شروع قرعه‌کشی'}</span>
                </button>

                <button
                  id="fast-complete-roulette-btn"
                  onClick={handleFastComplete}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <FastForward className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تکمیل فوری همه</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              بستن
            </button>
            {assignments.length > 0 && (
              <button
                id="apply-roulette-teams-btn"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>اعمال در جدول تیم‌ها</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
