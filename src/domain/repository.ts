import { User, Case, CaseStatus, TribunalSession, Schedule, Streak, Pack, Card, PartnerLink, Template, DistractionLog, DailyProgress, UserEvent, DebtItem } from './models';


export interface AppRepository {
  getOrCreateUser(): Promise<User>;
  updateUser(patch: Partial<User>): Promise<User>;
  listCases(status?: CaseStatus): Promise<Case[]>;
  createCase(payload: Omit<Case, "id" | "userId" | "createdAt" | "updatedAt" | "delayCount">): Promise<Case>;
  updateCase(id: string, patch: Partial<Case>): Promise<Case>;
  deleteCase(id: string): Promise<void>;
  createSession(payload: Omit<TribunalSession, "id" | "userId" | "createdAt">): Promise<TribunalSession>;
  listSessionsByDateRange(startISO: string, endISO: string): Promise<TribunalSession[]>;
  createSchedule(payload: Omit<Schedule, "id" | "userId" | "createdAt">): Promise<Schedule>;
  listSchedules(): Promise<Schedule[]>;
  getStreak(): Promise<Streak>;
  updateStreak(activityDateISO: string): Promise<Streak>;
  listPacks(): Promise<Pack[]>;
  listCards(packIds?: string[]): Promise<Card[]>;
  getPartnerLink(): Promise<PartnerLink | null>;
  createPartnerLink(partnerEmail: string): Promise<PartnerLink>;
  seedPacksAndCards(packs: Pack[], cards: Card[]): Promise<void>;
  listTemplates(): Promise<Template[]>;
  createTemplate(payload: Omit<Template, "id">): Promise<Template>;
  listDistractionLogs(): Promise<DistractionLog[]>;
  createDistractionLog(payload: Omit<DistractionLog, "id" | "createdAt">): Promise<DistractionLog>;
  getDailyProgress(date: string): Promise<DailyProgress | null>;
  saveDailyProgress(progress: DailyProgress): Promise<DailyProgress>;
  listDailyProgressByRange(startDate: string, endDate: string): Promise<DailyProgress[]>;
  saveEvent(event: UserEvent): Promise<void>;
  getPendingEvents(): Promise<UserEvent[]>;
  markEventsSynced(eventIds: string[]): Promise<void>;
  listDebts(): Promise<DebtItem[]>;
  createDebt(payload: Omit<DebtItem, "id" | "createdAt">): Promise<DebtItem>;
  updateDebt(id: string, patch: Partial<DebtItem>): Promise<DebtItem>;
}
