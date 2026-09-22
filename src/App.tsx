import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { PlayerSidebar } from './components/PlayerSidebar';
import { TeamsGrid } from './components/TeamsGrid';
import { SimpleModeView } from './components/SimpleModeView';
import { BulkAddModal } from './components/BulkAddModal';
import { RouletteModal } from './components/RouletteModal';
import { CaptainDraftModal } from './components/CaptainDraftModal';
import { ScoreboardTimer } from './components/ScoreboardTimer';
import { TournamentBracketModal } from './components/TournamentBracketModal';
import { ExportModal } from './components/ExportModal';

import { Player, Team, GamePreset, AppMode } from './types';
import { 
  createInitialTeams, 
  INITIAL_SAMPLE_PLAYERS, 
  PRESET_PLAYER_PACKS 
} from './utils/defaultData';
import { balanceTeamsBySkill, shuffleArray } from './utils/persian';
import { sound } from './utils/sound';

const STORAGE_KEY_MODE = 'TEAM_APP_MODE_V2';
const STORAGE_KEY_PLAYERS = 'TEAM_APP_PLAYERS_V2';
const STORAGE_KEY_TEAMS = 'TEAM_APP_TEAMS_V2';
const STORAGE_KEY_COUNT = 'TEAM_APP_COUNT_V2';
const STORAGE_KEY_PRESET = 'TEAM_APP_PRESET_V2';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MODE) as AppMode;
    return saved || 'simple';
  });

  // Load Initial State from LocalStorage or Defaults
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SAMPLE_PLAYERS;
      }
    }
    return INITIAL_SAMPLE_PLAYERS;
  });

  const [gamePreset, setGamePreset] = useState<GamePreset>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRESET) as GamePreset;
    return saved || 'general';
  });

  const [teamCount, setTeamCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COUNT);
    return saved ? parseInt(saved, 10) : 4;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createInitialTeams(8, 'general');
      }
    }
    return createInitialTeams(8, 'general');
  });

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isTournamentOpen, setIsTournamentOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODE, appMode);
  }, [appMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COUNT, teamCount.toString());
  }, [teamCount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRESET, gamePreset);
  }, [gamePreset]);

  // Handle Preset Change
  const handlePresetChange = (preset: GamePreset) => {
    setGamePreset(preset);
    const updatedInitialTeams = createInitialTeams(8, preset);
    // Keep members if already assigned
    setTeams((prevTeams) =>
      updatedInitialTeams.map((newT, idx) => ({
        ...newT,
        members: prevTeams[idx]?.members || [],
        score: prevTeams[idx]?.score || 0,
      }))
    );
  };

  // Player Handlers
  const handleAddPlayer = (player: Player) => {
    setPlayers((prev) => [player, ...prev]);
  };

  const handleAddMultiplePlayers = (newPlayers: Player[]) => {
    setPlayers((prev) => [...newPlayers, ...prev]);
  };

  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    // Also check if player is in any team
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        members: t.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }))
    );
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        members: t.members.filter((m) => m.id !== id),
      }))
    );
  };

  const handleClearAll = () => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید تمام بازیکنان حذف شوند؟')) return;
    sound.playClick();
    setPlayers([]);
    setTeams((prev) => prev.map((t) => ({ ...t, members: [], score: 0 })));
  };

  // Reset all team members back to free players
  const handleResetAllToFree = () => {
    if (!window.confirm('آیا می‌خواهید همه بازیکنان از تیم‌ها خارج شده و به لیست آزاد برگردند؟')) return;
    sound.playClick();
    const assignedPlayers = teams.flatMap((t) => t.members);
    // Merge back uniquely
    const existingIds = new Set(players.map((p) => p.id));
    const toAdd = assignedPlayers.filter((p) => !existingIds.has(p.id));

    setPlayers((prev) => [...prev, ...toAdd]);
    setTeams((prev) => prev.map((t) => ({ ...t, members: [] })));
  };

  // Load Preset Pack
  const handleLoadPack = (packKey: string) => {
    const pack = PRESET_PLAYER_PACKS[packKey];
    if (!pack) return;
    const newItems: Player[] = pack.players.map((name, i) => ({
      id: `pack-${packKey}-${i}-${Date.now()}`,
      name,
      skill: (Math.floor(Math.random() * 3) + 3) as 3 | 4 | 5,
      role: i === 0 || i === 1 ? 'captain' : i === 2 || i === 3 ? 'goalkeeper' : 'none',
      isPresent: true,
    }));
    setPlayers(newItems);
    // Clear current teams
    setTeams((prev) => prev.map((t) => ({ ...t, members: [], score: 0 })));
  };

  // Import TXT File
  const handleImportTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      lines.sort((a, b) => a.localeCompare(b, 'fa', { sensitivity: 'base' }));

      const loadedPlayers: Player[] = lines.map((name, idx) => ({
        id: `txt-${Date.now()}-${idx}`,
        name,
        skill: 3,
        role: 'none',
        isPresent: true,
      }));

      setPlayers(loadedPlayers);
      setTeams((prev) => prev.map((t) => ({ ...t, members: [], score: 0 })));
      sound.playFanfare();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Move member between free pool and teams or between teams
  const handleMoveMember = (playerId: string, targetTeamId: string | null) => {
    // Find player in free list or in teams
    let movingPlayer: Player | undefined = players.find((p) => p.id === playerId);
    if (!movingPlayer) {
      for (const t of teams) {
        movingPlayer = t.members.find((m) => m.id === playerId);
        if (movingPlayer) break;
      }
    }

    if (!movingPlayer) return;

    // Remove from free list
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));

    // Remove from all teams
    let updatedTeams = teams.map((t) => ({
      ...t,
      members: t.members.filter((m) => m.id !== playerId),
    }));

    // If target is a team, add to that team
    if (targetTeamId) {
      updatedTeams = updatedTeams.map((t) => {
        if (t.id === targetTeamId) {
          return { ...t, members: [...t.members, movingPlayer!] };
        }
        return t;
      });
    } else {
      // Returned to free list
      setPlayers((prev) => [movingPlayer!, ...prev]);
    }

    setTeams(updatedTeams);
  };

  // Clear single team members
  const handleClearTeam = (teamId: string) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam || targetTeam.members.length === 0) return;

    const membersToReturn = targetTeam.members;
    setPlayers((prev) => [...prev, ...membersToReturn]);
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: [] } : t))
    );
  };

  // Draw Mode 1: Pure Random Draw
  const handleRandomDraw = () => {
    const active = players.filter((p) => p.isPresent);
    if (active.length < 2) return;

    const shuffled = shuffleArray(active);
    const activeTeamsCount = teamCount;

    const newTeamMembers: Player[][] = Array.from({ length: activeTeamsCount }, () => []);

    shuffled.forEach((player, idx) => {
      newTeamMembers[idx % activeTeamsCount].push(player);
    });

    setTeams((prev) =>
      prev.map((team, idx) => {
        if (idx < activeTeamsCount) {
          return { ...team, members: newTeamMembers[idx] || [] };
        }
        return { ...team, members: [] };
      })
    );

    // Keep only absent players in free list
    setPlayers((prev) => prev.filter((p) => !p.isPresent));

    // Confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Draw Mode 2: Balanced Draw (Fair Play by Skill Stars & Roles)
  const handleBalancedDraw = () => {
    const active = players.filter((p) => p.isPresent);
    if (active.length < 2) return;

    const balancedGroups = balanceTeamsBySkill(active, teamCount);

    setTeams((prev) =>
      prev.map((team, idx) => {
        if (idx < teamCount) {
          return { ...team, members: balancedGroups[idx] || [] };
        }
        return { ...team, members: [] };
      })
    );

    // Keep only absent players in free list
    setPlayers((prev) => prev.filter((p) => !p.isPresent));

    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Roulette result finish
  const handleFinishRoulette = (assignments: { playerId: string; teamId: string }[]) => {
    const assignedPlayerIds = new Set(assignments.map((a) => a.playerId));
    const allKnownPlayers = [...players, ...teams.flatMap((t) => t.members)];

    const updatedTeams = teams.map((team) => {
      const assignedToThisTeam = assignments
        .filter((a) => a.teamId === team.id)
        .map((a) => allKnownPlayers.find((p) => p.id === a.playerId))
        .filter((p): p is Player => Boolean(p));

      return {
        ...team,
        members: assignedToThisTeam,
      };
    });

    setTeams(updatedTeams);
    setPlayers((prev) => prev.filter((p) => !assignedPlayerIds.has(p.id)));
  };

  // Draft apply
  const handleApplyDraft = (updatedTeams: Team[]) => {
    const assignedIds = new Set(updatedTeams.flatMap((t) => t.members.map((m) => m.id)));
    setTeams(updatedTeams);
    setPlayers((prev) => prev.filter((p) => !assignedIds.has(p.id)));
  };

  // Team score update
  const handleUpdateTeamScore = (teamId: string, newScore: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: newScore } : t))
    );
  };

  const handleUpdateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        gamePreset={gamePreset}
        setGamePreset={handlePresetChange}
        onOpenRoulette={() => setIsRouletteOpen(true)}
        onOpenDraft={() => setIsDraftOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenTournament={() => setIsTournamentOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onResetAll={handleResetAllToFree}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col">
        {appMode === 'simple' ? (
          /* Simple & Fast Mode - Optimized for Projector Screen */
          <SimpleModeView
            players={players}
            teams={teams}
            teamCount={teamCount}
            onTeamCountChange={(cnt) => setTeamCount(cnt)}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onClearAllPlayers={handleClearAll}
            onResetToFree={handleResetAllToFree}
            onMoveMember={handleMoveMember}
            onRandomDraw={handleRandomDraw}
            onImportTxt={handleImportTxt}
            onOpenBulkAdd={() => setIsBulkAddOpen(true)}
          />
        ) : (
          /* Advanced Pro Mode */
          <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
            {/* Sidebar: Players Management & Quick Draw */}
            <PlayerSidebar
              players={players}
              onAddPlayer={handleAddPlayer}
              onUpdatePlayer={handleUpdatePlayer}
              onRemovePlayer={handleRemovePlayer}
              onClearAll={handleClearAll}
              onOpenBulkAdd={() => setIsBulkAddOpen(true)}
              onRandomDraw={handleRandomDraw}
              onBalancedDraw={handleBalancedDraw}
              onLoadPack={handleLoadPack}
              onImportTxt={handleImportTxt}
            />

            {/* Center/Main: Interactive Teams Grid */}
            <TeamsGrid
              teams={teams}
              teamCount={teamCount}
              onTeamCountChange={(cnt) => setTeamCount(cnt)}
              onUpdateTeam={handleUpdateTeam}
              onMoveMember={handleMoveMember}
              onClearTeam={handleClearTeam}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-slate-900 bg-slate-950 py-3 px-6 text-center text-xs font-semibold text-slate-400">
        سامانه هوشمند یارکشی بازی • نسخه ساده ⚡ و نسخه پیشرفته 🚀 • سازگار با پروژکتور و پرده نمایش
      </footer>

      {/* Modals */}
      <BulkAddModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onAddPlayers={handleAddMultiplePlayers}
      />

      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        availablePlayers={players}
        teams={teams.slice(0, teamCount)}
        onFinishRoulette={handleFinishRoulette}
      />

      <CaptainDraftModal
        isOpen={isDraftOpen}
        onClose={() => setIsDraftOpen(false)}
        availablePlayers={players}
        teams={teams.slice(0, teamCount)}
        onApplyDraft={handleApplyDraft}
      />

      <ScoreboardTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        teams={teams.slice(0, teamCount)}
        onUpdateTeamScore={handleUpdateTeamScore}
      />

      <TournamentBracketModal
        isOpen={isTournamentOpen}
        onClose={() => setIsTournamentOpen(false)}
        teams={teams.slice(0, teamCount)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        teams={teams.slice(0, teamCount)}
        unassignedPlayers={players}
      />
    </div>
  );
}

