export type CaseStatus = "active" | "done" | "archived" | "lie";
export type ActionAttempted = "start" | "delay";
export type Verdict = "do2min" | "schedule" | "archiveLie";
export type PenaltyType = "streak" | "lie_mark" | "internal_cost";
export type MinimumType = 'start2min' | 'tribunalVerdict' | 'debtPaid' | 'deepSession';
export type PlusOneTag = 'Clareza' | 'Coragem' | 'Consistência' | 'Dívida' | 'Foco';
export type PartnerStatus = "pending" | "active";
export type Mode = 'quick' | 'deep' | 'sprint' | 'chain' | 'no_escape';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'customDays';

export interface UserSettings {
  theme?: string;
  maxLineWidthChars?: number;
  soundsOn?: boolean;
  animationsOn?: boolean;
  keybindsOn?: boolean;
  penaltyTypeDefault?: PenaltyType;
  noNegotiationMode?: boolean;
  mode?: Mode;
  lastDailyReview?: string;
  dailyMinimum?: MinimumType;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  createdAt: string; // ISO date
  axioms: [string, string, string];
  settings: UserSettings;
}

export interface Case {
  id: string;
  userId: string;
  title: string;
  nextPhysicalStep: string;
  category?: string;
  status: CaseStatus;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  delayCount: number;
  recurrence?: Recurrence;
  nextDueDate?: string;
}

export interface TribunalSession {
  id: string;
  userId: string;
  caseId: string;
  actionAttempted: ActionAttempted;
  excuseTag: string;
  excuseText?: string;
  judgeCardId: string;
  verdict: Verdict;
  createdAt: string; // ISO date
  deepFocus?: boolean;
}

export interface Streak {
  userId: string;
  current: number;
  best: number;
  lastActiveDate: string; // ISO date (YYYY-MM-DD)
}

export interface Schedule {
  id: string;
  userId: string;
  caseId: string;
  scheduledAt: string; // ISO date
  penaltyType: PenaltyType;
  createdAt: string; // ISO date
}

export interface PartnerLink {
  id: string;
  userId: string;
  partnerEmail: string;
  status: PartnerStatus;
  createdAt: string; // ISO date
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO date
}

export interface Card {
  id: string;
  packId: string;
  title: string;
  question: string;
  followup?: string;
}

export interface Template {
  id: string;
  name: string;
  titlePrefix?: string;
  defaultNextStep?: string;
  category?: string;
}

export interface DistractionLog {
  id: string;
  caseId: string;
  text: string;
  createdAt: string;
  sessionId?: string;
}

export interface DailyProgress {
  id: string; // YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD
  minimumDone: boolean;
  minimumType?: MinimumType;
  plusOneTag?: PlusOneTag;
  evolutionScore?: number; // 0-3
  facedDelayCount?: number;
  hadClarityEdit?: boolean;
}

export type PrivacySetting = 'private' | 'friends' | 'public';

export interface UserProfile {
  uid: string;
  handle: string;
  displayName: string;
  photoURL: string;
  privacy: PrivacySetting;
  metrics: {
    streak: number;
    activeDays7d: number;
    starts7d: number;
    facedDelays7d: number;
    deepMinutes7d: number;
  };
  friends: string[]; // Array of UIDs
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'blocked';
  actionUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEvent {
  id: string;
  uid: string;
  type: 'start2min' | 'delayVerdict' | 'deepSession' | 'distractionLog';
  timestamp: string;
  data?: any;
  synced?: boolean; // Local only flag
}

export interface LeaderboardEntry {
  uid: string;
  category: 'streak' | 'consistency' | 'courage' | 'focus';
  period: 'weekly' | 'monthly' | 'allTime';
  score: number;
  rank: number;
  updatedAt: string;
}

// --- CO-OP SESSION ---
export type RoomMode = 2 | 5 | 25;
export type RoomStatus = 'active' | 'idle' | 'ended';
export type RoomVisibility = 'public' | 'friends' | 'private';
export type MemberPresence = 'active' | 'paused' | 'away';

export interface Room {
  id: string;
  hostUid: string;
  mode: RoomMode;
  status: RoomStatus;
  startAt: any; // serverTimestamp
  createdAt: any; // serverTimestamp
  visibility: RoomVisibility;
  maxParticipants: number;
}

export interface RoomMember {
  uid: string;
  joinedAt: any; // serverTimestamp
  presence: MemberPresence;
  lastPingAt: any; // serverTimestamp
}

// --- LIGAS SEMANAIS ---
export interface LeagueGroup {
  id: string;
  seasonWeekId: string;
  divisionId: string;
  members: string[]; // UIDs
}

export interface LeagueMember {
  uid: string;
  activeDays: number;
  facedDelays: number;
  score: number;
  rank: number;
}

// --- COMUNIDADE ---
export interface CommunityPack {
  id: string;
  authorUid: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: any;
  updatedAt: any;
  isPublic: boolean;
  stats: {
    installCount: number;
    likeCount: number;
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
  };
}

export interface CommunityTemplate {
  id: string;
  authorUid: string;
  name: string;
  titlePattern?: string;
  defaultNextStep: string;
  category?: string;
  tags: string[];
  createdAt: any;
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
  };
}

// --- DEBT LIST ---
export interface DebtItem {
  id: string;
  caseId?: string;
  title?: string;
  costInSessions?: number;
  scheduledAt?: string; // ISO date
  createdAt: string; // ISO date
  status: 'open' | 'paid' | 'expired' | 'pending';
  paidAt?: string; // ISO date
}

// --- DIAGNÓSTICO ---
export interface Insights {
  dominantExcuse: string;
  criticalHours: number[];
  frictionCases: string[];
  facedDelayRate: number;
  clarityScore: number;
}

// --- WEEKLY REPLAY ---
export interface WeeklyReplay {
  id: string;
  uid: string;
  weekId: string;
  metrics: {
    activeDays: number;
    streak: number;
    topExcuse: string;
    topHour: number;
    facedDelays: number;
    deepMinutes: number;
    bestDay: string; // YYYY-MM-DD
  };
  createdAt: string; // ISO date
}
