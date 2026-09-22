import { Player, Team } from '../types';

export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Greedy balanced partition of players into N teams according to their skill level
 * Also respects captain / goalkeeper distribution if possible
 */
export function balanceTeamsBySkill(activePlayers: Player[], teamCount: number): Player[][] {
  const teams: Player[][] = Array.from({ length: teamCount }, () => []);
  const teamSkillSums: number[] = Array.from({ length: teamCount }, () => 0);

  // Separate captains, goalkeepers/special roles, and regular players
  const captains = activePlayers.filter(p => p.role === 'captain');
  const goalkeepers = activePlayers.filter(p => p.role === 'goalkeeper');
  const others = activePlayers.filter(p => p.role !== 'captain' && p.role !== 'goalkeeper');

  // Distribute captains first (randomized among teams)
  const shuffledCaptains = shuffleArray(captains);
  shuffledCaptains.forEach((cap, index) => {
    const teamIdx = index % teamCount;
    teams[teamIdx].push(cap);
    teamSkillSums[teamIdx] += cap.skill;
  });

  // Distribute goalkeepers
  const shuffledGK = shuffleArray(goalkeepers);
  shuffledGK.forEach((gk) => {
    // Pick team with lowest player count or lowest skill
    let bestTeamIdx = 0;
    let minScore = Infinity;
    for (let i = 0; i < teamCount; i++) {
      const hasGK = teams[i].some(p => p.role === 'goalkeeper');
      const score = (hasGK ? 1000 : 0) + teamSkillSums[i];
      if (score < minScore) {
        minScore = score;
        bestTeamIdx = i;
      }
    }
    teams[bestTeamIdx].push(gk);
    teamSkillSums[bestTeamIdx] += gk.skill;
  });

  // Sort other players by skill descending with slight random jitter to prevent deterministic results
  const sortedOthers = [...others].sort((a, b) => {
    if (b.skill !== a.skill) return b.skill - a.skill;
    return Math.random() - 0.5;
  });

  // Distribute remaining players to team with lowest current total skill sum
  for (const player of sortedOthers) {
    // Find team with minimum total skill that hasn't exceeded average capacity too much
    let minTeamIdx = 0;
    let minSkill = Infinity;

    // Find min player count to maintain size balance
    const minSize = Math.min(...teams.map(t => t.length));

    for (let i = 0; i < teamCount; i++) {
      // Prioritize teams that have fewer members
      if (teams[i].length <= minSize + 1) {
        if (teamSkillSums[i] < minSkill) {
          minSkill = teamSkillSums[i];
          minTeamIdx = i;
        }
      }
    }

    teams[minTeamIdx].push(player);
    teamSkillSums[minTeamIdx] += player.skill;
  }

  return teams;
}

export function formatTeamsForSharing(teams: Team[], unassigned: Player[], title?: string): string {
  const dateStr = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());

  let output = `🏆 ${title || 'سامانه یارکشی و قرعه‌کشی بازی'} 🏆\n`;
  output += `📅 تاریخ: ${toPersianDigits(dateStr)}\n`;
  output += `═══════════════════════════\n\n`;

  teams.forEach((team, idx) => {
    const totalSkill = team.members.reduce((acc, p) => acc + p.skill, 0);
    const avgSkill = team.members.length ? (totalSkill / team.members.length).toFixed(1) : '۰';
    
    output += `🚩 ${team.name} (${toPersianDigits(team.members.length)} نفر | قدرت: ${toPersianDigits(avgSkill)}⭐)\n`;
    if (team.members.length === 0) {
      output += `   (عضوی در این تیم حضور ندارد)\n`;
    } else {
      team.members.forEach((m, mIdx) => {
        const roleIcon = m.role === 'captain' ? '👑 ' : m.role === 'goalkeeper' ? '🧤 ' : '▫️ ';
        const stars = '★'.repeat(m.skill);
        output += `   ${roleIcon}${toPersianDigits(mIdx + 1)}. ${m.name} (${stars})\n`;
      });
    }
    output += `\n`;
  });

  if (unassigned.length > 0) {
    output += `👥 بازیکنان آزاد و ذخیره (${toPersianDigits(unassigned.length)} نفر):\n`;
    unassigned.forEach((u, uIdx) => {
      output += `   - ${u.name}\n`;
    });
    output += `\n`;
  }

  output += `✨ یارکشی شده توسط سامانه هوشمند یارکشی بازی ✨`;
  return output;
}

export function exportToTextFile(content: string, filename = 'teams-list.txt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
