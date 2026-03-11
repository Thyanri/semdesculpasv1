import { TribunalSession, Case } from './models';

export interface ReportRange {
  startISO: string;
  endISO: string;
}

export interface Reports {
  topExcuses: Array<{ tag: string; count: number }>;
  delaysByHour: number[]; // Array of 24 elements
  mostDelayedCases: Array<{ caseId: string; title: string; delayCount: number }>;
  start2minRate: number; // 0 to 1
  totalSessions: number;
  do2minCount: number;
  totalDelayVerdicts: number;
  completedCasesByDay: Record<string, number>; // YYYY-MM-DD -> count
}

export function computeReports(
  sessions: TribunalSession[],
  cases: Case[],
  range: ReportRange
): Reports {
  // Filter sessions by range
  const filteredSessions = sessions.filter(
    s => s.createdAt >= range.startISO && s.createdAt <= range.endISO
  );

  // 1. topExcuses (count)
  const excuseCounts: Record<string, number> = {};
  filteredSessions.forEach(s => {
    if (s.excuseTag) {
      excuseCounts[s.excuseTag] = (excuseCounts[s.excuseTag] || 0) + 1;
    }
  });
  const topExcuses = Object.entries(excuseCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  // 2. delaysByHour (0-23)
  const delaysByHour = new Array(24).fill(0);
  filteredSessions.forEach(s => {
    if (s.actionAttempted === 'delay') {
      const date = new Date(s.createdAt);
      const hour = date.getHours();
      delaysByHour[hour]++;
    }
  });

  // 3. mostDelayedCases
  const caseMap = new Map(cases.map(c => [c.id, c]));
  const delayCountsByCase: Record<string, number> = {};
  
  filteredSessions.forEach(s => {
    if (s.actionAttempted === 'delay') {
      delayCountsByCase[s.caseId] = (delayCountsByCase[s.caseId] || 0) + 1;
    }
  });

  const mostDelayedCases = Object.entries(delayCountsByCase)
    .map(([caseId, delayCount]) => ({
      caseId,
      title: caseMap.get(caseId)?.title || 'Unknown Case',
      delayCount
    }))
    .sort((a, b) => b.delayCount - a.delayCount)
    .slice(0, 5); // Top 5

  // 4. start2minRate = do2min / (do2min + schedule + archiveLie) considerando sessões originadas de "delay"
  let do2min = 0;
  let schedule = 0;
  let archiveLie = 0;

  filteredSessions.forEach(s => {
    if (s.actionAttempted === 'delay') {
      if (s.verdict === 'do2min') do2min++;
      else if (s.verdict === 'schedule') schedule++;
      else if (s.verdict === 'archiveLie') archiveLie++;
    }
  });

  const totalDelayVerdicts = do2min + schedule + archiveLie;
  const start2minRate = totalDelayVerdicts > 0 ? do2min / totalDelayVerdicts : 0;

  // 5. totalSessions
  const totalSessions = filteredSessions.length;

  // 6. completedCasesByDay
  const completedCasesByDay: Record<string, number> = {};
  cases.forEach(c => {
    if (c.status === 'done' && c.updatedAt >= range.startISO && c.updatedAt <= range.endISO) {
      const d = new Date(c.updatedAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const day = `${year}-${month}-${dayStr}`;
      completedCasesByDay[day] = (completedCasesByDay[day] || 0) + 1;
    }
  });

  return {
    topExcuses,
    delaysByHour,
    mostDelayedCases,
    start2minRate,
    totalSessions,
    do2minCount: do2min,
    totalDelayVerdicts,
    completedCasesByDay
  };
}
