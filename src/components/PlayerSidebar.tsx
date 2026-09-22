import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  Upload, 
  Search, 
  Trash2, 
  Star, 
  Crown, 
  Shield, 
  Dices, 
  Scale, 
  Shuffle, 
  FolderPlus, 
  Check, 
  X, 
  Users,
  Sparkles,
  GripVertical,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { Player, SkillLevel, PlayerRole } from '../types';
import { toPersianDigits } from '../utils/persian';
import { sound } from '../utils/sound';
import { PRESET_PLAYER_PACKS } from '../utils/defaultData';

interface PlayerSidebarProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
  onClearAll: () => void;
  onOpenBulkAdd: () => void;
  onRandomDraw: () => void;
  onBalancedDraw: () => void;
  onLoadPack: (packKey: string) => void;
  onImportTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({
  players,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onClearAll,
  onOpenBulkAdd,
  onRandomDraw,
  onBalancedDraw,
  onLoadPack,
  onImportTxt,
}) => {
  const [newName, setNewName] = useState('');
  const [newSkill, setNewSkill] = useState<SkillLevel>(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [showPacksMenu, setShowPacksMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newName.trim(),
      skill: newSkill,
      role: 'none',
      isPresent: true,
    };

    onAddPlayer(newPlayer);
    sound.playPop();
    setNewName('');
  };

  const handleStartEdit = (p: Player) => {
    setEditingId(p.id);
    setEditNameValue(p.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editNameValue.trim()) {
      onUpdatePlayer(id, { name: editNameValue.trim() });
    }
    setEditingId(null);
  };

  const handleRoleToggle = (player: Player) => {
    sound.playClick();
    let nextRole: PlayerRole = 'none';
    if (player.role === 'none') nextRole = 'captain';
    else if (player.role === 'captain') nextRole = 'goalkeeper';
    else nextRole = 'none';

    onUpdatePlayer(player.id, { role: nextRole });
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'PLAYER', player }));
    e.dataTransfer.effectAllowed = 'move';
    sound.playClick();
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const presentCount = players.filter((p) => p.isPresent).length;

  return (
    <aside className="w-full lg:w-96 flex flex-col bg-slate-900/90 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-4 shadow-xl shadow-slate-950/60 lg:h-[calc(100vh-5.5rem)] lg:sticky lg:top-20 text-slate-100">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              لیست بازیکنان
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                {toPersianDigits(players.length)} نفر
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {toPersianDigits(presentCount)} حاضر در قرعه‌کشی
            </p>
          </div>
        </div>

        {/* Top Mini Actions */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              id="preset-packs-btn"
              onClick={() => setShowPacksMenu(!showPacksMenu)}
              title="بارگذاری لیست‌های آماده"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">لیست‌های آماده</span>
            </button>

            {showPacksMenu && (
              <div 
                className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn text-right"
                onClick={() => setShowPacksMenu(false)}
              >
                <div className="text-[11px] font-semibold text-slate-400 px-2.5 py-1">انتخاب نمونه آماده:</div>
                {Object.entries(PRESET_PLAYER_PACKS).map(([key, pack]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onLoadPack(key);
                      sound.playPop();
                    }}
                    className="w-full text-right p-2 rounded-xl hover:bg-slate-800 transition-colors flex flex-col text-xs"
                  >
                    <span className="font-bold text-white">{pack.title}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{pack.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            id="clear-all-players-btn"
            onClick={onClearAll}
            title="حذف همه بازیکنان"
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddSingle} className="mt-3 space-y-2">
        <div className="relative flex items-center">
          <input
            id="player-name-input"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="نام بازیکن جدید (مثلا: سینا)..."
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-20 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            id="add-single-player-btn"
            type="submit"
            disabled={!newName.trim()}
            className="absolute left-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>افزودن</span>
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="open-bulk-add-btn"
            type="button"
            onClick={onOpenBulkAdd}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/60 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>افزودن دسته‌ای</span>
          </button>

          <label
            htmlFor="file-upload-input"
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/60 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>فایل TXT اسامی</span>
            <input
              id="file-upload-input"
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={onImportTxt}
              className="hidden"
            />
          </label>
        </div>
      </form>

      {/* Search Input */}
      <div className="relative mt-3">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
        <input
          id="search-players-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجو در نام‌ها..."
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pr-8 pl-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute left-2.5 top-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Players List (Scrollable) */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 pl-1 space-y-1.5 custom-scrollbar min-h-[160px] max-h-[46vh] lg:max-h-none">
        {filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs text-center border border-dashed border-slate-800 rounded-2xl p-4">
            <Users className="w-8 h-8 mb-2 opacity-40" />
            <span>هیچ بازیکنی یافت نشد!</span>
            <span className="text-[10px] mt-1 text-slate-600">نام بازیکن جدید وارد کنید یا از فایل بارگذاری نمایید</span>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              draggable
              onDragStart={(e) => handleDragStart(e, player)}
              className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                player.isPresent
                  ? 'bg-slate-950/70 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-950 shadow-sm'
                  : 'bg-slate-950/30 border-slate-900 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                
                {/* Presence Toggle */}
                <button
                  onClick={() => onUpdatePlayer(player.id, { isPresent: !player.isPresent })}
                  title={player.isPresent ? 'تغییر به غایب' : 'تغییر به حاضر'}
                  className="flex-shrink-0"
                >
                  {player.isPresent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Name / Inline Edit */}
                {editingId === player.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(player.id)}
                      className="bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white w-28 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(player.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span
                    onDoubleClick={() => handleStartEdit(player)}
                    title="برای ویرایش دوبار کلیک کنید"
                    className={`text-sm font-bold truncate ${
                      player.isPresent ? 'text-white' : 'text-slate-500 line-through'
                    }`}
                  >
                    {player.name}
                  </span>
                )}
              </div>

              {/* Badges, Skills & Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Role Toggle Pill */}
                <button
                  onClick={() => handleRoleToggle(player)}
                  title="تغییر نقش (کاپیتان / گلر / عادی)"
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border flex items-center gap-0.5 transition-all ${
                    player.role === 'captain'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : player.role === 'goalkeeper'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/40 hover:bg-slate-800'
                  }`}
                >
                  {player.role === 'captain' && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                  {player.role === 'goalkeeper' && <Shield className="w-2.5 h-2.5 text-cyan-400" />}
                  <span>
                    {player.role === 'captain'
                      ? 'کاپیتان'
                      : player.role === 'goalkeeper'
                      ? 'گلر'
                      : 'عادی'}
                  </span>
                </button>

                {/* Skill Stars (Clickable to change) */}
                <div className="flex items-center gap-0.5 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-800">
                  {([1, 2, 3, 4, 5] as SkillLevel[]).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onUpdatePlayer(player.id, { skill: star })}
                      title={`قدرت: ${toPersianDigits(star)} از ۵`}
                      className="p-0.5 text-slate-600 hover:text-amber-400 focus:outline-none"
                    >
                      <Star
                        className={`w-2.5 h-2.5 ${
                          star <= player.skill
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    sound.playPop();
                    onRemovePlayer(player.id);
                  }}
                  title="حذف بازیکن"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Draw Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
        <button
          id="random-draw-btn"
          onClick={() => {
            sound.playFanfare();
            onRandomDraw();
          }}
          disabled={presentCount < 2}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Dices className="w-4 h-4 text-yellow-300" />
          <span>یارکشی کاملاً تصادفی (Random)</span>
        </button>

        <button
          id="balanced-draw-btn"
          onClick={() => {
            sound.playFanfare();
            onBalancedDraw();
          }}
          disabled={presentCount < 2}
          title="تقسیم هوشمند بر اساس ستاره‌های مهارت و پخش متوازن کاپیتان‌ها"
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>یارکشی عادلانه و متوازن (بر اساس ستاره‌ها)</span>
        </button>
      </div>
    </aside>
  );
};
