import React, { useState } from 'react';
import { 
  Dices, 
  RotateCcw, 
  Copy, 
  Upload, 
  Plus, 
  X, 
  Check, 
  Users, 
  FileText,
  Trash2
} from 'lucide-react';
import { Player, Team } from '../types';
import { toPersianDigits, formatTeamsForSharing } from '../utils/persian';
import { sound } from '../utils/sound';

interface SimpleModeViewProps {
  players: Player[];
  teams: Team[];
  teamCount: number;
  onTeamCountChange: (count: number) => void;
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
  onClearAllPlayers: () => void;
  onResetToFree: () => void;
  onMoveMember: (playerId: string, targetTeamId: string | null) => void;
  onRandomDraw: () => void;
  onImportTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBulkAdd: () => void;
}

export const SimpleModeView: React.FC<SimpleModeViewProps> = ({
  players,
  teams,
  teamCount,
  onTeamCountChange,
  onAddPlayer,
  onRemovePlayer,
  onClearAllPlayers,
  onResetToFree,
  onMoveMember,
  onRandomDraw,
  onImportTxt,
  onOpenBulkAdd,
}) => {
  const [inputName, setInputName] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOverTeamId, setDragOverTeamId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    onAddPlayer({
      id: `simple-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: inputName.trim(),
      skill: 3,
      isPresent: true,
      role: 'none',
    });
    sound.playPop();
    setInputName('');
  };

  const handleCopyAll = () => {
    const text = formatTeamsForSharing(teams.slice(0, teamCount), players);
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'PLAYER', player }));
    e.dataTransfer.effectAllowed = 'move';
    sound.playClick();
  };

  const handleDragOver = (e: React.DragEvent, teamId: string) => {
    e.preventDefault();
    setDragOverTeamId(teamId);
  };

  const handleDrop = (e: React.DragEvent, teamId: string) => {
    e.preventDefault();
    setDragOverTeamId(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'PLAYER' && data.player?.id) {
        onMoveMember(data.player.id, teamId);
        sound.playPop();
      }
    } catch {
      // ignore
    }
  };

  const activeTeams = teams.slice(0, teamCount);
  const assignedCount = activeTeams.reduce((acc, t) => acc + t.members.length, 0);
  const totalCount = players.length + assignedCount;

  return (
    <div className="w-full flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Big Action Bar Optimized for Projector */}
      <div className="bg-slate-900 border-2 border-indigo-500/40 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Team Count Controls */}
        <div className="flex items-center gap-3">
          <span className="text-base sm:text-lg font-extrabold text-white">تعداد تیم‌ها:</span>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-700">
            {[2, 3, 4, 6].map((count) => (
              <button
                key={count}
                id={`simple-team-count-${count}`}
                onClick={() => {
                  sound.playClick();
                  onTeamCountChange(count);
                }}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-black transition-all ${
                  teamCount === count
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {toPersianDigits(count)} تیم
              </button>
            ))}
          </div>
        </div>

        {/* Big Shuffle Button */}
        <div className="flex items-center gap-3">
          <button
            id="simple-random-draw-btn"
            onClick={() => {
              sound.playFanfare();
              onRandomDraw();
            }}
            disabled={players.length < 2 && assignedCount === 0}
            className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Dices className="w-6 h-6 text-slate-950" />
            <span>یارکشی سریع و تصادفی</span>
          </button>

          {/* Quick Copy */}
          <button
            id="simple-copy-btn"
            onClick={handleCopyAll}
            title="کپی متن نتایج"
            className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base rounded-2xl border border-slate-600 transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-indigo-400" />}
            <span className="hidden md:inline">{copied ? 'کپی شد!' : 'کپی نتایج'}</span>
          </button>

          {/* Reset */}
          <button
            id="simple-reset-btn"
            onClick={onResetToFree}
            title="خالی کردن تیم‌ها"
            className="p-3.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 font-bold rounded-2xl border border-slate-700 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar List + Large Team Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Right Sidebar: Large Simple Player List (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>لیست اسامی ({toPersianDigits(players.length)} نفر آزاد)</span>
            </h3>

            <button
              onClick={onClearAllPlayers}
              title="پاک کردن کل لیست"
              className="text-slate-500 hover:text-rose-400 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Input Add */}
          <form onSubmit={handleAdd} className="flex gap-2 mb-3">
            <input
              id="simple-add-input"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="نام شخص را بنویسید..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!inputName.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl disabled:opacity-40"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Import Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={onOpenBulkAdd}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>چسباندن متن (Paste)</span>
            </button>

            <label className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>فایل TXT</span>
              <input type="file" accept=".txt" onChange={onImportTxt} className="hidden" />
            </label>
          </div>

          {/* Big Player List */}
          <div className="overflow-y-auto space-y-2 max-h-[50vh] pr-1 custom-scrollbar">
            {players.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm font-semibold border-2 border-dashed border-slate-800 rounded-2xl">
                هیچ بازیکنی در لیست آزاد نیست.
                <br />
                <span className="text-xs text-slate-600 mt-1 block">
                  نام‌ها را اضافه کنید یا دکمه ریست را بزنید
                </span>
              </div>
            ) : (
              players.map((p, idx) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-400 text-white font-bold text-sm sm:text-base cursor-grab active:cursor-grabbing shadow-sm select-none transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-500 font-mono text-xs w-5 text-center">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playPop();
                      onRemovePlayer(p.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center/Left: Large High-Contrast Team Cards (8 cols on lg) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTeams.map((team, tIdx) => {
            const isOver = dragOverTeamId === team.id;
            return (
              <div
                key={team.id}
                onDragOver={(e) => handleDragOver(e, team.id)}
                onDragLeave={() => setDragOverTeamId(null)}
                onDrop={(e) => handleDrop(e, team.id)}
                className={`flex flex-col bg-slate-900/95 border-3 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-200 min-h-[300px] ${
                  isOver
                    ? 'border-yellow-400 ring-4 ring-yellow-400/30 scale-[1.02]'
                    : team.borderColor
                }`}
              >
                {/* Team Big Header */}
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-white/10 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-md"
                      style={{ backgroundColor: team.color, color: '#000' }}
                    >
                      {toPersianDigits(tIdx + 1)}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-xl font-black text-white">
                        {team.name}
                      </h4>
                      <span className="text-xs sm:text-sm font-bold text-slate-300">
                        تعداد اعضا: {toPersianDigits(team.members.length)} نفر
                      </span>
                    </div>
                  </div>

                  <span
                    className="px-3 py-1 rounded-full text-xs sm:text-sm font-black text-slate-950 shadow"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.name.split(' ')[1] || 'تیم'}
                  </span>
                </div>

                {/* Team Members List (Extra Large Text for Projector!) */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[160px]">
                  {team.members.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 text-center text-slate-500 text-sm font-semibold">
                      هیچ بازیکنی در این تیم نیست
                    </div>
                  ) : (
                    team.members.map((member, mIdx) => (
                      <div
                        key={member.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, member)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border-2 border-slate-800 hover:border-white text-white font-extrabold text-sm sm:text-lg shadow-md select-none cursor-grab active:cursor-grabbing transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-slate-950"
                            style={{ backgroundColor: team.color }}
                          >
                            {toPersianDigits(mIdx + 1)}
                          </span>
                          <span className="truncate tracking-wide">{member.name}</span>
                        </div>

                        <button
                          onClick={() => {
                            sound.playClick();
                            onMoveMember(member.id, null);
                          }}
                          title="خروج از تیم"
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
