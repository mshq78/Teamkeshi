export type AppMode = 'simple' | 'advanced';

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type PlayerRole = 'captain' | 'goalkeeper' | 'defender' | 'midfielder' | 'attacker' | 'mafia' | 'citizen' | 'chef' | 'cleaner' | 'none';

export interface Player {
  id: string;
  name: string;
  skill: SkillLevel;
  role?: PlayerRole;
  avatarColor?: string;
  isPresent: boolean;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  iconName: string;
  members: Player[];
  score: number;
  slogan?: string;
  customLogo?: string;
}

export type DrawMode = 'random' | 'balanced' | 'captain_draft' | 'wheel';

export type GamePreset = 'general' | 'football' | 'mafia' | 'food_chores' | 'tournament';

export interface MatchPairing {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  round: number;
  isCompleted: boolean;
}

export interface SavedPreset {
  id: string;
  title: string;
  createdAt: string;
  players: Player[];
  teamsCount: number;
  presetType: GamePreset;
}
