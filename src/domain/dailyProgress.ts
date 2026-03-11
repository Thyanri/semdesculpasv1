import { DailyProgress, MinimumType, PlusOneTag, TribunalSession } from './models';
import { AppRepository } from './repository';

// Helper: get today as YYYY-MM-DD in local time
export function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: get YYYY-MM-DD for N days ago in local time
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if the daily minimum was fulfilled by an event type
export function eventMatchesMinimum(eventType: string, minimumSetting?: MinimumType): boolean {
  if (!minimumSetting) return false;
  return eventType === minimumSetting;
}

// Mark the daily minimum as done for today
export async function markMinimumDone(
  repo: AppRepository,
  minimumType: MinimumType
): Promise<DailyProgress> {
  const date = todayStr();
  const existing = await repo.getDailyProgress(date);
  const progress: DailyProgress = existing || {
    id: date,
    userId: '',
    date,
    minimumDone: false,
  };
  progress.minimumDone = true;
  progress.minimumType = minimumType;
  return repo.saveDailyProgress(progress);
}

// Save +1 tag for today (one per day)
export async function markPlusOne(
  repo: AppRepository,
  tag: PlusOneTag
): Promise<DailyProgress> {
  const date = todayStr();
  const existing = await repo.getDailyProgress(date);
  const progress: DailyProgress = existing || {
    id: date,
    userId: '',
    date,
    minimumDone: false,
  };
  progress.plusOneTag = tag;
  return repo.saveDailyProgress(progress);
}

// Compute quality streak from daily progress list (must be sorted by date desc)
export function computeQualityStreak(progressList: DailyProgress[]): number {
  // Sort descending
  const sorted = [...progressList].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = todayStr();
  const maxDays = 90; // Don't check more than reasonable amount

  for (let i = 0; i < maxDays; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const year = expected.getFullYear();
    const month = String(expected.getMonth() + 1).padStart(2, '0');
    const day = String(expected.getDate()).padStart(2, '0');
    const expectedStr = `${year}-${month}-${day}`;

    const entry = sorted.find(p => p.date === expectedStr);
    if (!entry || !entry.minimumDone || !entry.plusOneTag) {
      // If today is missing, check if we're still in the day (allow today to be incomplete)
      if (i === 0 && expectedStr === today) continue;
      break;
    }
    streak++;
  }
  return streak;
}

// Compute evolution score for a single day (0-3)
export function computeEvolutionScore(progress: DailyProgress): number {
  let score = 0;
  if (progress.minimumDone) score++;
  if ((progress.facedDelayCount || 0) > 0) score++;
  if (progress.hadClarityEdit) score++;
  return Math.min(score, 3);
}

// Update faced delay count for today
export async function incrementFacedDelay(repo: AppRepository): Promise<DailyProgress> {
  const date = todayStr();
  const existing = await repo.getDailyProgress(date);
  const progress: DailyProgress = existing || {
    id: date,
    userId: '',
    date,
    minimumDone: false,
  };
  progress.facedDelayCount = (progress.facedDelayCount || 0) + 1;
  return repo.saveDailyProgress(progress);
}

// Mark clarity edit for today
export async function markClarityEdit(repo: AppRepository): Promise<DailyProgress> {
  const date = todayStr();
  const existing = await repo.getDailyProgress(date);
  const progress: DailyProgress = existing || {
    id: date,
    userId: '',
    date,
    minimumDone: false,
  };
  progress.hadClarityEdit = true;
  return repo.saveDailyProgress(progress);
}

// Get dominant +1 tag from a list of progress entries
export function getDominantPlusOneTag(progressList: DailyProgress[]): { tag: PlusOneTag; count: number } | null {
  const counts: Record<string, number> = {};
  progressList.forEach(p => {
    if (p.plusOneTag) {
      counts[p.plusOneTag] = (counts[p.plusOneTag] || 0) + 1;
    }
  });
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { tag: entries[0][0] as PlusOneTag, count: entries[0][1] };
}

// Compute average evolution score for a date range
export function computeAverageEvolution(progressList: DailyProgress[]): number {
  if (progressList.length === 0) return 0;
  const total = progressList.reduce((sum, p) => sum + computeEvolutionScore(p), 0);
  return total / progressList.length;
}
