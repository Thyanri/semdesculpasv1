import { AppRepository } from '../domain/repository';
import { User, Case, CaseStatus, TribunalSession, Schedule, Streak, Pack, Card, PartnerLink, Template, DistractionLog, DailyProgress, UserEvent, DebtItem } from '../domain/models';

const DB_NAME = 'SemDesculpasDB';
const DB_VERSION = 5; // Incremented for dailyProgress + events + debts stores

// Helper to wrap IDB requests in Promises
function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class LocalRepository implements AppRepository {
  private dbPromise: Promise<IDBDatabase>;
  private currentUserId = "local-user-1"; // Hardcoded for local single-user mode

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('cases')) db.createObjectStore('cases', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('streaks')) db.createObjectStore('streaks', { keyPath: 'userId' });
        if (!db.objectStoreNames.contains('schedules')) db.createObjectStore('schedules', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('packs')) db.createObjectStore('packs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('cards')) db.createObjectStore('cards', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('partners')) db.createObjectStore('partners', { keyPath: 'userId' });
        if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('distractions')) db.createObjectStore('distractions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('dailyProgress')) db.createObjectStore('dailyProgress', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('debts')) db.createObjectStore('debts', { keyPath: 'id' });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  async getOrCreateUser(): Promise<User> {
    const store = await this.getStore('users', 'readwrite');
    const user = await requestToPromise(store.get(this.currentUserId));
    
    if (user) return user;

    const newUser: User = {
      id: this.currentUserId,
      createdAt: new Date().toISOString(),
      axioms: ["", "", ""],
      settings: {}
    };
    
    await requestToPromise(store.put(newUser));
    return newUser;
  }

  async updateUser(patch: Partial<User>): Promise<User> {
    const existing = await this.getOrCreateUser();
    const store = await this.getStore('users', 'readwrite');
    const updated = { ...existing, ...patch };
    await requestToPromise(store.put(updated));
    return updated;
  }

  async listCases(status?: CaseStatus): Promise<Case[]> {
    const store = await this.getStore('cases');
    const allCases: Case[] = await requestToPromise(store.getAll());
    let cases = allCases.filter(c => c.userId === this.currentUserId);
    if (status) {
      cases = cases.filter(c => c.status === status);
    }
    return cases;
  }

  async createCase(payload: Omit<Case, "id" | "userId" | "createdAt" | "updatedAt" | "delayCount">): Promise<Case> {
    const store = await this.getStore('cases', 'readwrite');
    const now = new Date().toISOString();
    const newCase: Case = {
      ...payload,
      id: this.generateId(),
      userId: this.currentUserId,
      createdAt: now,
      updatedAt: now,
      delayCount: 0
    };
    await requestToPromise(store.put(newCase));
    return newCase;
  }

  async updateCase(id: string, patch: Partial<Case>): Promise<Case> {
    const store = await this.getStore('cases', 'readwrite');
    const existing = await requestToPromise(store.get(id));
    if (!existing) throw new Error("Case not found");
    
    const updated: Case = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    await requestToPromise(store.put(updated));
    return updated;
  }

  async deleteCase(id: string): Promise<void> {
    const store = await this.getStore('cases', 'readwrite');
    await requestToPromise(store.delete(id));
  }

  async createSession(payload: Omit<TribunalSession, "id" | "userId" | "createdAt">): Promise<TribunalSession> {
    const store = await this.getStore('sessions', 'readwrite');
    const session: TribunalSession = {
      ...payload,
      id: this.generateId(),
      userId: this.currentUserId,
      createdAt: new Date().toISOString()
    };
    await requestToPromise(store.put(session));
    
    if (payload.actionAttempted === 'delay') {
      const caseStore = await this.getStore('cases', 'readwrite');
      const caseItem = await requestToPromise(caseStore.get(payload.caseId));
      if (caseItem) {
        caseItem.delayCount += 1;
        caseItem.updatedAt = new Date().toISOString();
        await requestToPromise(caseStore.put(caseItem));
      }
    }
    
    return session;
  }

  async listSessionsByDateRange(startISO: string, endISO: string): Promise<TribunalSession[]> {
    const store = await this.getStore('sessions');
    const all: TribunalSession[] = await requestToPromise(store.getAll());
    return all.filter(s => s.userId === this.currentUserId && s.createdAt >= startISO && s.createdAt <= endISO);
  }

  async createSchedule(payload: Omit<Schedule, "id" | "userId" | "createdAt">): Promise<Schedule> {
    const store = await this.getStore('schedules', 'readwrite');
    const schedule: Schedule = {
      ...payload,
      id: this.generateId(),
      userId: this.currentUserId,
      createdAt: new Date().toISOString()
    };
    await requestToPromise(store.put(schedule));
    return schedule;
  }

  async listSchedules(): Promise<Schedule[]> {
    const store = await this.getStore('schedules');
    const all: Schedule[] = await requestToPromise(store.getAll());
    return all.filter(s => s.userId === this.currentUserId);
  }

  async getStreak(): Promise<Streak> {
    const store = await this.getStore('streaks', 'readwrite');
    let streak = await requestToPromise(store.get(this.currentUserId));
    if (!streak) {
      streak = {
        userId: this.currentUserId,
        current: 0,
        best: 0,
        lastActiveDate: ""
      };
      await requestToPromise(store.put(streak));
    }
    return streak;
  }

  async updateStreak(activityDateISO: string): Promise<Streak> {
    const streak = await this.getStreak();
    
    const d = new Date(activityDateISO);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const activityDate = `${year}-${month}-${dayStr}`;
    
    if (streak.lastActiveDate === activityDate) {
      return streak; // Already updated today
    }
    
    const lastDate = new Date(streak.lastActiveDate);
    const currentDate = new Date(activityDate);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (streak.lastActiveDate === "" || diffDays === 1) {
      streak.current += 1;
    } else if (diffDays > 1) {
      streak.current = 1;
    }
    
    if (streak.current > streak.best) {
      streak.best = streak.current;
    }
    
    streak.lastActiveDate = activityDate;
    
    const store = await this.getStore('streaks', 'readwrite');
    await requestToPromise(store.put(streak));
    return streak;
  }

  async listPacks(): Promise<Pack[]> {
    const store = await this.getStore('packs');
    return requestToPromise(store.getAll());
  }

  async listCards(packIds?: string[]): Promise<Card[]> {
    const store = await this.getStore('cards');
    const all: Card[] = await requestToPromise(store.getAll());
    if (packIds && packIds.length > 0) {
      return all.filter(c => packIds.includes(c.packId));
    }
    return all;
  }

  async getPartnerLink(): Promise<PartnerLink | null> {
    const store = await this.getStore('partners');
    const link = await requestToPromise(store.get(this.currentUserId));
    return link || null;
  }

  async createPartnerLink(partnerEmail: string): Promise<PartnerLink> {
    const store = await this.getStore('partners', 'readwrite');
    const link: PartnerLink = {
      id: this.generateId(),
      userId: this.currentUserId,
      partnerEmail,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    await requestToPromise(store.put(link));
    return link;
  }

  async seedPacksAndCards(packs: Pack[], cards: Card[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['packs', 'cards'], 'readwrite');
    const packStore = tx.objectStore('packs');
    const cardStore = tx.objectStore('cards');

    for (const pack of packs) {
      packStore.put(pack);
    }
    for (const card of cards) {
      cardStore.put(card);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listTemplates(): Promise<Template[]> {
    const store = await this.getStore('templates');
    return requestToPromise(store.getAll());
  }

  async createTemplate(payload: Omit<Template, "id">): Promise<Template> {
    const store = await this.getStore('templates', 'readwrite');
    const template: Template = {
      ...payload,
      id: this.generateId()
    };
    await requestToPromise(store.put(template));
    return template;
  }

  async listDistractionLogs(): Promise<DistractionLog[]> {
    const store = await this.getStore('distractions');
    const all: DistractionLog[] = await requestToPromise(store.getAll());
    return all; // Add user filtering if needed, but distractions are linked to cases
  }

  async createDistractionLog(payload: Omit<DistractionLog, "id" | "createdAt">): Promise<DistractionLog> {
    const store = await this.getStore('distractions', 'readwrite');
    const log: DistractionLog = {
      ...payload,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    await requestToPromise(store.put(log));
    return log;
  }

  async getDailyProgress(date: string): Promise<DailyProgress | null> {
    const store = await this.getStore('dailyProgress');
    const key = `${this.currentUserId}_${date}`;
    const result = await requestToPromise(store.get(key));
    return result || null;
  }

  async saveDailyProgress(progress: DailyProgress): Promise<DailyProgress> {
    const store = await this.getStore('dailyProgress', 'readwrite');
    const toSave = { ...progress, id: `${this.currentUserId}_${progress.date}`, userId: this.currentUserId };
    await requestToPromise(store.put(toSave));
    return toSave;
  }

  async listDailyProgressByRange(startDate: string, endDate: string): Promise<DailyProgress[]> {
    const store = await this.getStore('dailyProgress');
    const all: DailyProgress[] = await requestToPromise(store.getAll());
    return all.filter(p => p.userId === this.currentUserId && p.date >= startDate && p.date <= endDate);
  }

  async saveEvent(event: UserEvent): Promise<void> {
    const store = await this.getStore('events', 'readwrite');
    await requestToPromise(store.put(event));
  }

  async getPendingEvents(): Promise<UserEvent[]> {
    const store = await this.getStore('events');
    const allEvents: UserEvent[] = await requestToPromise(store.getAll());
    return allEvents.filter(e => !e.synced);
  }

  async markEventsSynced(eventIds: string[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    
    for (const id of eventIds) {
      const event: UserEvent = await requestToPromise(store.get(id));
      if (event) {
        event.synced = true;
        store.put(event);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listDebts(): Promise<DebtItem[]> {
    const store = await this.getStore('debts');
    return requestToPromise(store.getAll());
  }

  async createDebt(payload: Omit<DebtItem, "id" | "createdAt">): Promise<DebtItem> {
    const store = await this.getStore('debts', 'readwrite');
    const debt: DebtItem = {
      ...payload,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    await requestToPromise(store.put(debt));
    return debt;
  }

  async updateDebt(id: string, patch: Partial<DebtItem>): Promise<DebtItem> {
    const store = await this.getStore('debts', 'readwrite');
    const existing: DebtItem = await requestToPromise(store.get(id));
    if (!existing) throw new Error("Debt not found");
    
    const updated: DebtItem = {
      ...existing,
      ...patch
    };
    await requestToPromise(store.put(updated));
    return updated;
  }
}
