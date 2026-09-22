import React, { useState } from 'react';
import { 
  X, 
  Swords, 
  Crown, 
  Star, 
  Check, 
  UserPlus, 
  CheckCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Player, Team } from '../types';
import { toPersianDigits } from '../utils/persian';
import { sound } from '../utils/sound';

interface CaptainDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlayers: Player[];
  teams: Team[];
  onApplyDraft: (updatedTeams: Team[]) => void;
}

export const CaptainDraftModal: React.FC<CaptainDraftModalProps> = ({
  isOpen,
  onClose,
  availablePlayers,
  teams,
  onApplyDraft,
}) => {
  const [draftTeams, setDraftTeams] = useState<Team[]>(() => {
    return teams.map((t) => ({ ...t, members: [...t.members] }));
  });
  const [pool, setPool] = useState<Player[]>(() => {
    return availablePlayers.filter((p) => p.isPresent);
  });
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Initialize or reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraftTeams(teams.map((t) => ({ ...t, members: [...t.members] })));
      // Filter out players already inside draftTeams
      const assignedIds = new Set(teams.flatMap((t) => t.members.map((m) => m.id)));
      setPool(availablePlayers.filter((p) => p.isPresent && !assignedIds.has(p.id)));
      setCurrentTurnIndex(0);
    }
  }, [isOpen, teams, availablePlayers]);

  if (!isOpen) return null;

  const currentTeam = draftTeams[currentTurnIndex % draftTeams.length];

  const handlePickPlayer = (player: Player) => {
    sound.playPop();

    // Add to current team
    const updatedTeams = draftTeams.map((t, idx) => {
      if (idx === (currentTurnIndex % draftTeams.length)) {
        return { ...t, members: [...t.members, player] };
      }
      return t;
    });

    setDraftTeams(updatedTeams);
    setPool((prev) => prev.filter((p) => p.id !== player.id));
    setCurrentTurnIndex((prev) => prev + 1);
  };

  const handleFinish = () => {
    sound.playFanfare();
    onApplyDraft(draftTeams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-indigo-500/30 w-full max-w-4xl rounded-3xl p-6 shadow-2xl shadow-indigo-950/60 text-right text-slate-100 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-draft-modal"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">یارکشی کاپیتانی (نوبتی - Draft Mode)</h2>
            <p className="text-xs text-slate-400">کاپیتان‌ها به نوبت بازیکنان آزاد را برای تیم خود انتخاب می‌کنند</p>
          </div>
        </div>

        {/* Turn Status Banner */}
        {pool.length > 0 && currentTeam && (
          <div 
            className="p-3.5 rounded-2xl mb-4 border flex items-center justify-between transition-all"
            style={{ 
              backgroundColor: `${currentTeam.color}15`, 
              borderColor: `${currentTeam.color}50` 
            }}
          >
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5" style={{ color: currentTeam.color }} />
              <div>
                <span className="text-xs text-slate-300 block">نوبت انتخاب:</span>
                <span className="text-base font-extrabold" style={{ color: currentTeam.color }}>
                  {currentTeam.name}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/10">
              باقیمانده در لیست آزاد: <span className="font-bold text-white">{toPersianDigits(pool.length)}</span> نفر
            </div>
          </div>
        )}

        {/* Main Content Layout: Pool vs Current Teams */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden min-h-0">
          {/* Available Pool */}
          <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-slate-200">بازیکنان آزاد برای انتخاب</span>
              <span className="text-[11px] text-slate-400">{toPersianDigits(pool.length)} نفر</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {pool.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 py-10">
                  همه بازیکنان انتخاب شدند!
                </div>
              ) : (
                pool.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span>{player.name}</span>
                        {player.role === 'captain' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded">
                            کاپیتان
                          </span>
                        )}
                        {player.role === 'goalkeeper' && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded">
                            گلر
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 text-[10px] mt-0.5">
                        {Array.from({ length: player.skill }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePickPlayer(player)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>انتخاب به تیم</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Teams Status */}
          <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-2xl p-3 overflow-y-auto space-y-3 custom-scrollbar">
            <span className="text-xs font-bold text-slate-200 pb-2 border-b border-slate-800 block">
              ترکیب تیم‌ها در حین یارکشی:
            </span>

            {draftTeams.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl border transition-all text-xs"
                style={{
                  backgroundColor: `${t.color}10`,
                  borderColor: `${t.color}35`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold" style={{ color: t.color }}>
                    {t.name}
                  </span>
                  <span className="text-[11px] text-slate-300 font-bold">
                    {toPersianDigits(t.members.length)} عضو
                  </span>
                </div>

                <div className="space-y-1">
                  {t.members.length === 0 ? (
                    <span className="text-[11px] text-slate-500">هنوز بازیکنی انتخاب نشده</span>
                  ) : (
                    t.members.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/60 text-slate-200 text-[11px]"
                      >
                        <span>
                          {toPersianDigits(idx + 1)}. {m.name}
                        </span>
                        <div className="flex items-center text-amber-400 text-[10px]">
                          {'★'.repeat(m.skill)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            انصراف
          </button>
          <button
            id="apply-draft-btn"
            onClick={handleFinish}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ثبت و اعمال نهایی در صفحه اصلی</span>
          </button>
        </div>
      </div>
    </div>
  );
};
