import { AppRepository } from '../domain/repository';
import { User, Case, CaseStatus, TribunalSession, Schedule, Streak, Pack, Card, PartnerLink, Template, DistractionLog, DailyProgress } from '../domain/models';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockRemoteRepository implements AppRepository {
  private users: Map<string, User> = new Map();
  private cases: Map<string, Case> = new Map();
  private sessions: Map<string, TribunalSession> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private streaks: Map<string, Streak> = new Map();
  private partners: Map<string, PartnerLink> = new Map();
  private packs: Map<string, Pack> = new Map();
  private cards: Map<string, Card> = new Map();
  private templates: Map<string, Template> = new Map();
  private distractions: Map<string, DistractionLog> = new Map();
  private dailyProgress: Map<string, DailyProgress> = new Map();
  
  private currentUserId = "mock-user-1";

  private generateId(): string {
    return crypto.randomUUID();
  }

  async getOrCreateUser(): Promise<User> {
    await delay(300);
    if (!this.users.has(this.currentUserId)) {
      this.users.set(this.currentUserId, {
        id: this.currentUserId,
        createdAt: new Date().toISOString(),
        axioms: ["", "", ""],
        settings: {}
      });
    }
    return this.users.get(this.currentUserId)!;
  }

  async updateUser(patch: Partial<User>): Promise<User> {
    await delay(200);
    const existing = await this.getOrCreateUser();
    const updated = { ...existing, ...patch };
    this.users.set(this.currentUserId, updated);
    return updated;
  }

  async listCases(status?: CaseStatus): Promise<Case[]> {
    await delay(400);
    let all = Array.from(this.cases.values()).filter(c => c.userId === this.currentUserId);
    if (status) {
      all = all.filter(c => c.status === status);
    }
    return all;
  }

  async createCase(payload: Omit<Case, "id" | "userId" | "createdAt" | "updatedAt" | "delayCount">): Promise<Case> {
    await delay(300);
    const now = new Date().toISOString();
    const newCase: Case = {
      ...payload,
      id: this.generateId(),
      userId: this.currentUserId,
      createdAt: now,
      updatedAt: now,
      delayCount: 0
    };
    this.cases.set(newCase.id, newCase);
    return newCase;
  }

  async updateCase(id: string, patch: Partial<Case>): Promise<Case> {
    await delay(300);
    const existing = this.cases.get(id);
    if (!existing) throw new Error("Case not found");
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.cases.set(id, updated);
    return updated;
  }

  async deleteCase(id: string): Promise<void> {
    await delay(200);
    this.cases.delete(id);
  }

  async createSession(payload: Omit<TribunalSession, "id" | "userId" | "createdAt">): Promise<TribunalSession> {
    await delay(300);
    const session: TribunalSession = {
      ...payload,
      id: this.generateId(),
      userId: this.currentUserId,
      createdAt: new Date().toISOString()
    };
    this.sessions.set(session.id, session);
    
    if (payload.actionAttempted === 'delay') {
      const caseItem = this.cases.get(payload.caseId);
      if (caseItem) {
        caseItem.delayCount += 1;
        caseItem.updatedAt = new Date().toISOString();
      }
    }
    
    return session;
  }

  async listSessionsByDateRange(startISO: string, endISO: string): Promise<TribunalSession[]> {
    await delay(400);
    return Array.from(this.sessions.values()).filter(s => 
      s.userId === this.currentUserId && 
      s.createdAt >= startISO && 
      s.createdAt <= endISO
    );
  }

  async createSchedule(payload: Omit<Schedule, "id" | "userId" | "createdAt">): Promise<Schedule> {
    await delay(300);
    const schedule: Schedule = {
      ...payload,
      id: this.generateId(),
      userId: this.currentUserId,
      createdAt: new Date().toISOString()
    };
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async listSchedules(): Promise<Schedule[]> {
    await delay(300);
    return Array.from(this.schedules.values()).filter(s => s.userId === this.currentUserId);
  }

  async getStreak(): Promise<Streak> {
    await delay(200);
    if (!this.streaks.has(this.currentUserId)) {
      this.streaks.set(this.currentUserId, {
        userId: this.currentUserId,
        current: 0,
        best: 0,
        lastActiveDate: ""
      });
    }
    return this.streaks.get(this.currentUserId)!;
  }

  async updateStreak(activityDateISO: string): Promise<Streak> {
    await delay(200);
    const streak = await this.getStreak();
    const activityDate = activityDateISO.split('T')[0];
    
    if (streak.lastActiveDate === activityDate) return streak;
    
    const lastDate = new Date(streak.lastActiveDate);
    const currentDate = new Date(activityDate);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (streak.lastActiveDate === "" || diffDays === 1) {
      streak.current += 1;
    } else if (diffDays > 1) {
      streak.current = 1;
    }
    
    if (streak.current > streak.best) streak.best = streak.current;
    streak.lastActiveDate = activityDate;
    
    return streak;
  }

  async listPacks(): Promise<Pack[]> {
    await delay(200);
    return Array.from(this.packs.values());
  }

  async listCards(packIds?: string[]): Promise<Card[]> {
    await delay(200);
    const all = Array.from(this.cards.values());
    if (packIds && packIds.length > 0) {
      return all.filter(c => packIds.includes(c.packId));
    }
    return all;
  }

  async getPartnerLink(): Promise<PartnerLink | null> {
    await delay(200);
    return this.partners.get(this.currentUserId) || null;
  }

  async createPartnerLink(partnerEmail: string): Promise<PartnerLink> {
    await delay(300);
    const link: PartnerLink = {
      id: this.generateId(),
      userId: this.currentUserId,
      partnerEmail,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    this.partners.set(this.currentUserId, link);
    return link;
  }

  async seedPacksAndCards(packs: Pack[], cards: Card[]): Promise<void> {
    await delay(300);
    for (const p of packs) {
      this.packs.set(p.id, p);
    }
    for (const c of cards) {
      this.cards.set(c.id, c);
    }
  }

  async listTemplates(): Promise<Template[]> {
    await delay(200);
    return Array.from(this.templates.values());
  }

  async createTemplate(payload: Omit<Template, "id">): Promise<Template> {
    await delay(200);
    const template: Template = {
      ...payload,
      id: this.generateId()
    };
    this.templates.set(template.id, template);
    return template;
  }

  async listDistractionLogs(): Promise<DistractionLog[]> {
    await delay(200);
    return Array.from(this.distractions.values());
  }

  async createDistractionLog(payload: Omit<DistractionLog, "id" | "createdAt">): Promise<DistractionLog> {
    await delay(200);
    const log: DistractionLog = {
      ...payload,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    this.distractions.set(log.id, log);
    return log;
  }

  async getDailyProgress(date: string): Promise<DailyProgress | null> {
    await delay(100);
    const key = `${this.currentUserId}_${date}`;
    return this.dailyProgress.get(key) || null;
  }

  async saveDailyProgress(progress: DailyProgress): Promise<DailyProgress> {
    await delay(100);
    const toSave = { ...progress, id: `${this.currentUserId}_${progress.date}`, userId: this.currentUserId };
    this.dailyProgress.set(toSave.id, toSave);
    return toSave;
  }

  async listDailyProgressByRange(startDate: string, endDate: string): Promise<DailyProgress[]> {
    await delay(100);
    return Array.from(this.dailyProgress.values()).filter(p =>
      p.userId === this.currentUserId && p.date >= startDate && p.date <= endDate
    );
  }

  async saveEvent(event: any): Promise<void> {
    await delay(100);
  }

  async getPendingEvents(): Promise<any[]> {
    await delay(100);
    return [];
  }

  async markEventsSynced(eventIds: string[]): Promise<void> {
    await delay(100);
  }

  async listDebts(): Promise<any[]> {
    await delay(100);
    return [];
  }

  async createDebt(payload: any): Promise<any> {
    await delay(100);
    return { ...payload, id: this.generateId(), createdAt: new Date().toISOString() };
  }

  async updateDebt(id: string, patch: any): Promise<any> {
    await delay(100);
    return { id, ...patch };
  }
}
