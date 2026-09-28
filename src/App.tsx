import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppMode, 
  DisplaySize, 
  DisplayTheme, 
  Participant, 
  BootcampTeam, 
  DraftLogItem 
} from './types';
import { CheckCircle2 } from 'lucide-react';
import { 
  createInitialBootcampTeams, 
  SAMPLE_BOOTCAMP_PARTICIPANTS,
  TEAM_COLOR_PALETTES 
} from './utils/defaultData';
import { shuffleArray } from './utils/persian';
import { sound } from './utils/sound';
import { DatashowHeader } from './components/DatashowHeader';
import { SimpleDraftView } from './components/SimpleDraftView';
import { AdvancedDashboard } from './components/AdvancedDashboard';
import { SmsModal } from './components/SmsModal';
import { AddParticipantsModal } from './components/AddParticipantsModal';

const STORAGE_KEY_PARTICIPANTS = 'bootcamp_live_participants_v2';
const STORAGE_KEY_TEAMS = 'bootcamp_live_teams_v2';
const STORAGE_KEY_SETTINGS = 'bootcamp_live_settings_v2';

export default function App() {
  // Load initial state from LocalStorage or defaults
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_BOOTCAMP_PARTICIPANTS;
  });

  const [teams, setTeams] = useState<BootcampTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return createInitialBootcampTeams(4);
  });

  const [mode, setMode] = useState<AppMode>('simple');
  const [displaySize, setDisplaySize] = useState<DisplaySize>('projector');
  const [displayTheme, setDisplayTheme] = useState<DisplayTheme>('dark-neon');
  const [draftLog, setDraftLog] = useState<DraftLogItem[]>([]);

  // Modals
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeamForSms, setSelectedTeamForSms] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    } catch {}
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    } catch {}
  }, [teams]);

  // Derived: All assigned participant IDs
  const assignedParticipantIds = new Set<string>();
  teams.forEach((t) => t.members.forEach((m) => assignedParticipantIds.add(m.id)));

  // Unassigned participants pool
  const unassigned = participants.filter((p) => !assignedParticipantIds.has(p.id));

  // Check if draft just completed to fire celebratory confetti
  const triggerCelebration = () => {
    sound.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);
  };

  // Assign participant to a team
  const handleAssignToTeam = (participantId: string, teamId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!participant || !targetTeam) return;

    // Check if already in target team
    if (targetTeam.members.some((m) => m.id === participantId)) return;

    // Remove from any current team
    const updatedTeams = teams.map((team) => {
      const filteredMembers = team.members.filter((m) => m.id !== participantId);
      if (team.id === teamId) {
        return {
          ...team,
          members: [...filteredMembers, participant],
        };
      }
      return {
        ...team,
        members: filteredMembers,
      };
    });

    setTeams(updatedTeams);

    // Toast feedback
    const previousTeam = teams.find((t) => t.members.some((m) => m.id === participantId));
    if (previousTeam) {
      showToast(`${participant.name} از «${previousTeam.name}» به «${targetTeam.name}» منتقل شد`);
    } else {
      showToast(`${participant.name} به «${targetTeam.name}» ملحق شد`);
    }

    // Draft log item
    const isLeader = targetTeam.members.length === 0;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setDraftLog((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        participantName: participant.name,
        teamName: targetTeam.name,
        teamColor: targetTeam.color,
        isLeader,
      },
      ...prev,
    ]);

    // Check if that was the last participant
    const remainingAfterThis = unassigned.filter((p) => p.id !== participantId).length;
    if (remainingAfterThis === 0) {
      triggerCelebration();
    }
  };

  // Remove member from team back to unassigned
  const handleRemoveMember = (teamId: string, participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            members: team.members.filter((m) => m.id !== participantId),
          };
        }
        return team;
      })
    );
    if (participant) {
      showToast(`${participant.name} به سالن بازگشت`);
    }
  };

  // Return member from any team directly to hall (e.g. via drop on roster)
  const handleReturnToHall = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    setTeams((prevTeams) =>
      prevTeams.map((team) => ({
        ...team,
        members: team.members.filter((m) => m.id !== participantId),
      }))
    );
    if (participant) {
      showToast(`${participant.name} به سالن بازگردانده شد`);
    }
  };

  // Promote a member to leader (index 0)
  const handlePromoteToLeader = (teamId: string, participantId: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          const memberIndex = team.members.findIndex((m) => m.id === participantId);
          if (memberIndex <= 0) return team;
          const member = team.members[memberIndex];
          const remaining = team.members.filter((m) => m.id !== participantId);
          return {
            ...team,
            members: [member, ...remaining],
          };
        }
        return team;
      })
    );
  };

  // Auto-fill remaining unassigned members randomly into teams
  const handleAutoFillRemaining = () => {
    if (unassigned.length === 0 || teams.length === 0) return;

    const shuffled = shuffleArray(unassigned);
    const newTeams = teams.map((t) => ({ ...t, members: [...t.members] }));

    // Greedy round-robin into teams with lowest member count
    shuffled.forEach((participant) => {
      // Find team with minimum members
      let minTeamIndex = 0;
      let minCount = Infinity;
      for (let i = 0; i < newTeams.length; i++) {
        if (newTeams[i].members.length < minCount) {
          minCount = newTeams[i].members.length;
          minTeamIndex = i;
        }
      }
      newTeams[minTeamIndex].members.push(participant);
    });

    setTeams(newTeams);
    triggerCelebration();
  };

  // Update team data (name, color, phone)
  const handleUpdateTeam = (updatedTeam: BootcampTeam) => {
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
  };

  // Update leader phone from SMS modal
  const handleUpdateTeamPhone = (teamId: string, phone: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, leaderPhone: phone } : t))
    );
  };

  // Change team count dynamically (2 to 8)
  const handleTeamsCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 8) return;

    if (newCount > teams.length) {
      // Add teams
      const additional: BootcampTeam[] = [];
      for (let i = teams.length; i < newCount; i++) {
        const palette = TEAM_COLOR_PALETTES[i % TEAM_COLOR_PALETTES.length];
        additional.push({
          id: `team-${i + 1}`,
          name: palette.defaultName,
          color: palette.color,
          badgeBg: palette.badgeBg,
          borderColor: palette.borderColor,
          textColor: palette.textColor,
          tableNumber: palette.defaultTable,
          leaderPhone: '',
          members: [],
          score: 0,
        });
      }
      setTeams([...teams, ...additional]);
    } else if (newCount < teams.length) {
      // Remove teams, returning their members to unassigned
      const kept = teams.slice(0, newCount);
      setTeams(kept);
    }
  };

  // Reset only the draft placements (everyone back to unassigned)
  const handleResetDraft = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, members: [] })));
    setDraftLog([]);
    showToast('یارکشی با موفقیت ریست شد و تمامی افراد به سالن بازگشتند');
  };

  // Reset everything (clear all participants)
  const handleResetEverything = () => {
    setParticipants([]);
    setTeams(createInitialBootcampTeams(4));
    setDraftLog([]);
    showToast('لیست اسامی پاکسازی شد');
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Vazirmatn',sans-serif] selection:bg-cyan-500 selection:text-slate-950 transition-colors ${
      displayTheme === 'dark-neon'
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Top Navigation & Projector Controls */}
      <DatashowHeader
        mode={mode}
        onModeChange={setMode}
        displaySize={displaySize}
        onDisplaySizeChange={setDisplaySize}
        displayTheme={displayTheme}
        onDisplayThemeChange={setDisplayTheme}
        teamsCount={teams.length}
        onTeamsCountChange={handleTeamsCountChange}
        unassignedCount={unassigned.length}
        totalParticipants={participants.length}
        onOpenSmsModal={() => {
          setSelectedTeamForSms(null);
          setIsSmsModalOpen(true);
        }}
        onOpenParticipantsModal={() => setIsAddModalOpen(true)}
        onAutoFillRemaining={handleAutoFillRemaining}
        onResetDraft={handleResetDraft}
      />

      {/* Main View Area: Either Simple Draft or Advanced Mode */}
      <main className="flex-1 flex flex-col min-h-0">
        {mode === 'simple' ? (
          <SimpleDraftView
            unassigned={unassigned}
            teams={teams}
            displaySize={displaySize}
            onAssignToTeam={handleAssignToTeam}
            onUpdateTeam={handleUpdateTeam}
            onRemoveMember={handleRemoveMember}
            onPromoteToLeader={handlePromoteToLeader}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenSmsForTeam={(team) => {
              setSelectedTeamForSms(team.id);
              setIsSmsModalOpen(true);
            }}
            onAutoFillRemaining={handleAutoFillRemaining}
            onReturnToHall={handleReturnToHall}
          />
        ) : (
          <AdvancedDashboard
            unassigned={unassigned}
            teams={teams}
            displaySize={displaySize}
            draftLog={draftLog}
            onAssignToTeam={handleAssignToTeam}
            onUpdateTeam={handleUpdateTeam}
            onRemoveMember={handleRemoveMember}
            onPromoteToLeader={handlePromoteToLeader}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenSmsForTeam={(team) => {
              setSelectedTeamForSms(team.id);
              setIsSmsModalOpen(true);
            }}
            onAutoFillRemaining={handleAutoFillRemaining}
            onReturnToHall={handleReturnToHall}
          />
        )}
      </main>

      {/* SMS Generator Modal */}
      <SmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        teams={teams}
        onUpdateTeamPhone={handleUpdateTeamPhone}
        selectedTeamId={selectedTeamForSms}
      />

      {/* Participant Manager & Bulk Add Modal */}
      <AddParticipantsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        participants={participants}
        onSetParticipants={setParticipants}
        onResetEverything={handleResetEverything}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
