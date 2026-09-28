export type AppMode = 'simple' | 'advanced';

export type DisplaySize = 'normal' | 'projector' | 'auditorium';

export type DisplayTheme = 'dark-neon' | 'bright-stage';

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  pickedAt?: number;
}

export interface BootcampTeam {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  tableNumber?: string;
  leaderPhone?: string;
  members: Participant[];
  score?: number;
}

export interface DraftLogItem {
  id: string;
  timestamp: string;
  participantName: string;
  teamName: string;
  teamColor: string;
  isLeader: boolean;
}

export interface SmsTemplateOption {
  id: 'ultra_cheap' | 'compact' | 'standard';
  title: string;
  description: string;
  maxPartHint: string;
}
