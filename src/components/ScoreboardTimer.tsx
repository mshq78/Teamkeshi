import React, { useState, useEffect } from 'react';
import { 
  X, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Volume2, 
  Trophy, 
  Swords, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Team } from '../types';
import { toPersianDigits } from '../utils/persian';
import { sound } from '../utils/sound';

interface ScoreboardTimerProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onUpdateTeamScore: (teamId: string, newScore: number) => void;
}

export const ScoreboardTimer: React.FC<ScoreboardTimerProps> = ({
  isOpen,
  onClose,
  teams,
  onUpdateTeamScore,
}) => {
  const [teamAId, setTeamAId] = useState<string>(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState<string>(teams[1]?.id || '');
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes default
  const [initialDuration, setInitialDuration] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [matchLog, setMatchLog] = useState<{ time: string; text: string }[]>([]);

  useEffect(() => {
    if (teams.length >= 2) {
      if (!teamAId || !teams.find((t) => t.id === teamAId)) setTeamAId(teams[0].id);
      if (!teamBId || !teams.find((t) => t.id === teamBId)) setTeamBId(teams[1].id);
    }
  }, [teams, teamAId, teamBId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            sound.playWhistle();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const teamA = teams.find((t) => t.id === teamAId) || teams[0];
  const teamB = teams.find((t) => t.id === teamBId) || teams[1];

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setTimerPreset = (mins: number) => {
    sound.playClick();
    setIsRunning(false);
    setInitialDuration(mins * 60);
    setSecondsLeft(mins * 60);
  };

  const handleScore = (team: Team, delta: number) => {
    const currentScore = team.score || 0;
    const newScore = Math.max(0, currentScore + delta);
    onUpdateTeamScore(team.id, newScore);

    if (delta > 0) {
      sound.playFanfare();
      const timeStr = formatTime(initialDuration - secondsLeft);
      setMatchLog((prev) => [
        {
          time: toPersianDigits(timeStr),
          text: `⚽ گل برای ${team.name} (امتیاز ${toPersianDigits(newScore)})`,
        },
        ...prev,
      ]);
    } else {
      sound.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-cyan-500/30 w-full max-w-3xl rounded-3xl p-6 shadow-2xl shadow-cyan-950/60 text-right text-slate-100 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-timer-modal"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">تایمر و تابلوی زنده مسابقه</h2>
            <p className="text-xs text-slate-400">ثبت زنده گل‌ها/امتیازات و مدیریت زمان بازی‌ها</p>
          </div>
        </div>

        {/* Team Matchup Selector */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">تیم اول (میزبان):</label>
            <select
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({toPersianDigits(t.members.length)} نفر)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-semibold">تیم دوم (میهمان):</label>
            <select
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({toPersianDigits(t.members.length)} نفر)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scoreboard Arena Display */}
        <div className="bg-slate-950/90 border border-cyan-500/20 rounded-3xl p-5 mb-4 shadow-inner">
          <div className="flex items-center justify-between gap-4">
            {/* Team A */}
            {teamA && (
              <div className="flex-1 flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-sm font-extrabold truncate max-w-[140px]" style={{ color: teamA.color }}>
                  {teamA.name}
                </span>
                <span className="text-4xl sm:text-5xl font-black text-white my-2 font-mono">
                  {toPersianDigits(teamA.score || 0)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScore(teamA, 1)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                    title="افزایش امتیاز"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleScore(teamA, -1)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="کاهش امتیاز"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Match Clock in Center */}
            <div className="flex flex-col items-center justify-center px-4">
              <span className="text-[11px] text-slate-400 font-semibold mb-1">زمان باقیمانده</span>
              <div className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono tracking-wider bg-slate-900 px-4 py-2 rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-950/50">
                {toPersianDigits(formatTime(secondsLeft))}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  id="toggle-timer-running-btn"
                  onClick={() => {
                    sound.playClick();
                    setIsRunning(!isRunning);
                  }}
                  className={`p-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                    isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsRunning(false);
                    setSecondsLeft(initialDuration);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  title="ریست زمان"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sound.playWhistle()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 transition-all"
                  title="سوت داور!"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Team B */}
            {teamB && (
              <div className="flex-1 flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-sm font-extrabold truncate max-w-[140px]" style={{ color: teamB.color }}>
                  {teamB.name}
                </span>
                <span className="text-4xl sm:text-5xl font-black text-white my-2 font-mono">
                  {toPersianDigits(teamB.score || 0)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScore(teamB, 1)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                    title="افزایش امتیاز"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleScore(teamB, -1)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="کاهش امتیاز"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Durations */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">تنظیم سریع:</span>
            {[3, 5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimerPreset(mins)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  initialDuration === mins * 60
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {toPersianDigits(mins)} دقیقه
              </button>
            ))}
          </div>
        </div>

        {/* Live Event Log */}
        {matchLog.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs custom-scrollbar max-h-28">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">گزارش رویدادهای بازی:</span>
            {matchLog.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span>{log.text}</span>
                <span className="text-slate-500 font-mono text-[10px]">{log.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 mt-auto">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
