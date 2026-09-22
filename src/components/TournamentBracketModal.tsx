import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Swords, 
  Medal, 
  CheckCircle, 
  Plus, 
  Minus, 
  Sparkles,
  Shuffle
} from 'lucide-react';
import { Team, MatchPairing } from '../types';
import { toPersianDigits, shuffleArray } from '../utils/persian';
import { sound } from '../utils/sound';

interface TournamentBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
}

export const TournamentBracketModal: React.FC<TournamentBracketModalProps> = ({
  isOpen,
  onClose,
  teams,
}) => {
  const [matches, setMatches] = useState<MatchPairing[]>([]);
  const [format, setFormat] = useState<'round_robin' | 'knockout'>('round_robin');

  // Generate Matchups
  const generateMatches = (fmt = format) => {
    sound.playShuffle();
    const activeTeams = teams.filter((t) => t.members.length > 0);
    const newMatches: MatchPairing[] = [];

    if (fmt === 'round_robin') {
      // Every team plays every other team
      let matchIdx = 1;
      for (let i = 0; i < activeTeams.length; i++) {
        for (let j = i + 1; j < activeTeams.length; j++) {
          newMatches.push({
            id: `m-${matchIdx}`,
            teamA: activeTeams[i].name,
            teamB: activeTeams[j].name,
            scoreA: 0,
            scoreB: 0,
            round: 1,
            isCompleted: false,
          });
          matchIdx++;
        }
      }
    } else {
      // Knockout bracket
      const shuffled = shuffleArray(activeTeams);
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
          newMatches.push({
            id: `m-ko-${i / 2 + 1}`,
            teamA: shuffled[i].name,
            teamB: shuffled[i + 1].name,
            scoreA: 0,
            scoreB: 0,
            round: 1,
            isCompleted: false,
          });
        }
      }
    }

    setMatches(newMatches);
  };

  useEffect(() => {
    if (isOpen && matches.length === 0) {
      generateMatches(format);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScoreUpdate = (matchId: string, side: 'A' | 'B', delta: number) => {
    sound.playClick();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          if (side === 'A') {
            const nextScore = Math.max(0, (m.scoreA || 0) + delta);
            return { ...m, scoreA: nextScore };
          } else {
            const nextScore = Math.max(0, (m.scoreB || 0) + delta);
            return { ...m, scoreB: nextScore };
          }
        }
        return m;
      })
    );
  };

  const toggleComplete = (matchId: string) => {
    sound.playPop();
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, isCompleted: !m.isCompleted } : m))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-amber-500/30 w-full max-w-3xl rounded-3xl p-6 shadow-2xl shadow-amber-950/60 text-right text-slate-100 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-tournament-modal"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">جدول مسابقات و بازی‌های رو در رو</h2>
              <p className="text-xs text-slate-400">برنامه‌ریزی مسابقات دوره‌ای یا حذفی بین تیم‌ها</p>
            </div>
          </div>

          {/* Regenerate / Format Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextFmt = format === 'round_robin' ? 'knockout' : 'round_robin';
                setFormat(nextFmt);
                generateMatches(nextFmt);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{format === 'round_robin' ? 'حالت: دوره‌ای (همه با همه)' : 'حالت: حذفی (تک‌حذفی)'}</span>
            </button>
          </div>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-[220px]">
          {matches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              تیم‌های حاضر عضوی ندارند. ابتدا بازیکنان را در تیم‌ها تقسیم کنید.
            </div>
          ) : (
            matches.map((match, idx) => (
              <div
                key={match.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  match.isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Match Number */}
                <span className="text-xs font-bold text-slate-400 w-12">
                  بازی {toPersianDigits(idx + 1)}
                </span>

                {/* Team A */}
                <div className="flex-1 flex items-center justify-end gap-2 text-left">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {match.teamA}
                  </span>
                  <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 px-1 py-0.5">
                    <button
                      onClick={() => handleScoreUpdate(match.id, 'A', -1)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-sm font-extrabold text-amber-300 px-2 min-w-[20px] text-center font-mono">
                      {toPersianDigits(match.scoreA || 0)}
                    </span>
                    <button
                      onClick={() => handleScoreUpdate(match.id, 'A', 1)}
                      className="p-1 text-slate-400 hover:text-emerald-400"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                    VS
                  </span>
                </div>

                {/* Team B */}
                <div className="flex-1 flex items-center justify-start gap-2">
                  <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 px-1 py-0.5">
                    <button
                      onClick={() => handleScoreUpdate(match.id, 'B', -1)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-sm font-extrabold text-amber-300 px-2 min-w-[20px] text-center font-mono">
                      {toPersianDigits(match.scoreB || 0)}
                    </span>
                    <button
                      onClick={() => handleScoreUpdate(match.id, 'B', 1)}
                      className="p-1 text-slate-400 hover:text-emerald-400"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {match.teamB}
                  </span>
                </div>

                {/* Complete Status */}
                <button
                  onClick={() => toggleComplete(match.id)}
                  title={match.isCompleted ? 'تغییر به در حال انجام' : 'پایان مسابقه'}
                  className={`p-2 rounded-xl border transition-all ${
                    match.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto">
          <button
            onClick={() => generateMatches(format)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>قرعه‌کشی مجدد مسابقات</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
