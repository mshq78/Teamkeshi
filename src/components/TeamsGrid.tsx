import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  Shield, 
  Star, 
  Plus, 
  Minus, 
  Copy, 
  Trash2, 
  X, 
  Zap, 
  Flame, 
  Waves, 
  Sun, 
  Sparkles, 
  Target, 
  Edit2, 
  Check, 
  MoveRight,
  GripVertical,
  Award,
  Layers
} from 'lucide-react';
import { Team, Player } from '../types';
import { toPersianDigits } from '../utils/persian';
import { sound } from '../utils/sound';

interface TeamsGridProps {
  teams: Team[];
  teamCount: number;
  onTeamCountChange: (count: number) => void;
  onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
  onMoveMember: (playerId: string, targetTeamId: string | null) => void;
  onClearTeam: (teamId: string) => void;
  onSwapTeams?: (teamAId: string, teamBId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Waves: <Waves className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
};

export const TeamsGrid: React.FC<TeamsGridProps> = ({
  teams,
  teamCount,
  onTeamCountChange,
  onUpdateTeam,
  onMoveMember,
  onClearTeam,
}) => {
  const [dragOverTeamId, setDragOverTeamId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, teamId: string) => {
    e.preventDefault();
    setDragOverTeamId(teamId);
  };

  const handleDragLeave = (teamId: string) => {
    if (dragOverTeamId === teamId) {
      setDragOverTeamId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, teamId: string) => {
    e.preventDefault();
    setDragOverTeamId(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.type === 'PLAYER' && data.player?.id) {
        onMoveMember(data.player.id, teamId);
        sound.playPop();
      }
    } catch {
      // ignore
    }
  };

  const handleDragStartMember = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'PLAYER', player }));
    e.dataTransfer.effectAllowed = 'move';
    sound.playClick();
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditNameValue(team.name);
  };

  const saveEditTeam = (teamId: string) => {
    if (editNameValue.trim()) {
      onUpdateTeam(teamId, { name: editNameValue.trim() });
    }
    setEditingTeamId(null);
  };

  const copyTeamMembers = (team: Team) => {
    const text = `${team.name}:\n` + team.members.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedTeamId(team.id);
    sound.playClick();
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  const handleScoreChange = (team: Team, delta: number) => {
    const newScore = Math.max(0, (team.score || 0) + delta);
    onUpdateTeam(team.id, { score: newScore });
    sound.playClick();
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Control Bar: Team Count Selector */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">تعداد تیم‌ها / گروه‌ها</h3>
            <p className="text-xs text-slate-400">تعداد تیم‌های مورد نظر برای قرعه‌کشی را انتخاب کنید</p>
          </div>
        </div>

        {/* Quick Team Count Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[2, 3, 4, 5, 6, 8].map((count) => (
            <button
              key={count}
              id={`team-count-btn-${count}`}
              onClick={() => {
                sound.playClick();
                onTeamCountChange(count);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                teamCount === count
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {toPersianDigits(count)} تیم
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {teams.slice(0, teamCount).map((team) => {
          const totalSkill = team.members.reduce((acc, m) => acc + m.skill, 0);
          const avgSkill = team.members.length ? (totalSkill / team.members.length).toFixed(1) : '۰';
          const isOver = dragOverTeamId === team.id;

          return (
            <div
              key={team.id}
              onDragOver={(e) => handleDragOver(e, team.id)}
              onDragLeave={() => handleDragLeave(team.id)}
              onDrop={(e) => handleDrop(e, team.id)}
              className={`flex flex-col bg-gradient-to-b ${team.bgGradient} backdrop-blur-md rounded-3xl border ${
                isOver
                  ? 'border-cyan-400 ring-4 ring-cyan-400/20 scale-[1.02] shadow-2xl shadow-cyan-500/30'
                  : team.borderColor
              } p-4 transition-all duration-200 min-h-[320px] shadow-xl relative group/team`}
            >
              {/* Team Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: `${team.color}25`, color: team.color }}
                  >
                    {ICON_MAP[team.iconName] || <Zap className="w-4 h-4" />}
                  </div>

                  {/* Team Name / Edit */}
                  {editingTeamId === team.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditTeam(team.id)}
                        className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm font-bold text-white w-36 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditTeam(team.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 cursor-pointer" onClick={() => startEditTeam(team)}>
                      <h4 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-1.5">
                        {team.name}
                        <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/team:opacity-100 transition-opacity" />
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <span className="font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-md border border-white/10">
                          {toPersianDigits(team.members.length)} نفر
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="flex items-center gap-0.5 text-amber-300">
                          <Star className="w-3 h-3 fill-amber-300" />
                          قدرت: {toPersianDigits(avgSkill)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Quick Actions: Copy & Clear & Score */}
                <div className="flex items-center gap-1">
                  {/* Match Score Counter */}
                  <div className="flex items-center bg-slate-950/70 rounded-xl border border-white/10 px-1 py-0.5">
                    <button
                      onClick={() => handleScoreChange(team, -1)}
                      title="کاهش امتیاز"
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-bold text-amber-400 px-1.5 min-w-[20px] text-center">
                      {toPersianDigits(team.score || 0)}
                    </span>
                    <button
                      onClick={() => handleScoreChange(team, 1)}
                      title="افزایش امتیاز"
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Copy Team List */}
                  <button
                    onClick={() => copyTeamMembers(team)}
                    title="کپی اسامی این تیم"
                    className="p-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all text-xs"
                  >
                    {copiedTeamId === team.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Clear Team */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClearTeam(team.id);
                    }}
                    title="خالی کردن اعضای این تیم"
                    className="p-1.5 rounded-lg bg-slate-950/50 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-white/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Members Drop Area */}
              <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-0.5 pl-0.5 custom-scrollbar min-h-[180px]">
                {team.members.length === 0 ? (
                  <div
                    className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                      isOver
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                        : 'border-white/10 bg-slate-950/20 text-slate-400'
                    }`}
                  >
                    <Users className="w-7 h-7 mb-1.5 opacity-40" />
                    <span className="text-xs font-medium">هیچ بازیکنی نیست</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      بازیکنان را بکشید و رها کنید یا قرعه‌کشی را بزنید
                    </span>
                  </div>
                ) : (
                  team.members.map((member, index) => (
                    <div
                      key={member.id}
                      draggable
                      onDragStart={(e) => handleDragStartMember(e, member)}
                      className="group/member flex items-center justify-between p-3 rounded-2xl bg-slate-950 border-2 border-white/10 hover:border-white/40 hover:bg-slate-950/90 transition-all cursor-grab active:cursor-grabbing select-none shadow-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-black text-slate-400 w-5 text-center">
                          {toPersianDigits(index + 1)}
                        </span>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-black text-white truncate tracking-wide">
                              {member.name}
                            </span>
                            {member.role === 'captain' && (
                              <span
                                title="کاپیتان تیم"
                                className="flex items-center gap-0.5 text-xs font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md shadow-sm"
                              >
                                <Crown className="w-3 h-3" />
                                <span>کاپیتان</span>
                              </span>
                            )}
                            {member.role === 'goalkeeper' && (
                              <span
                                title="دروازه‌بان"
                                className="flex items-center gap-0.5 text-xs font-black bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded-md shadow-sm"
                              >
                                <Shield className="w-3 h-3" />
                                <span>گلر</span>
                              </span>
                            )}
                          </div>

                          {/* Member Stars */}
                          <div className="flex items-center gap-0.5 text-amber-400 text-xs mt-0.5">
                            {Array.from({ length: member.skill }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Return to Free Players */}
                      <button
                        onClick={() => {
                          sound.playClick();
                          onMoveMember(member.id, null);
                        }}
                        title="برگرداندن به لیست آزاد"
                        className="opacity-0 group-hover/member:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/60 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Team Footer Banner */}
              <div className="pt-2 mt-auto border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{team.slogan || 'آماده برای مسابقه'}</span>
                <span className="font-mono text-[10px] opacity-75">{team.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
