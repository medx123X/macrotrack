import type { DailyLog } from '@/types';
import { addDays, todayStr } from './date';

function hasAnyEntries(log: DailyLog | undefined): boolean {
  if (!log) return false;
  return Object.values(log.meals).some((entries) => entries.length > 0);
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  daysLogged: number;
}

/** Computes streaks purely from real dailyLogs — no hardcoded numbers. */
export function computeStreaks(logs: DailyLog[]): StreakStats {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const loggedDates = logs.filter(hasAnyEntries).map((l) => l.date).sort();
  const daysLogged = loggedDates.length;

  if (daysLogged === 0) {
    return { currentStreak: 0, longestStreak: 0, daysLogged: 0 };
  }

  // longest streak: walk sorted unique dates, count consecutive-day runs
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < loggedDates.length; i++) {
    const prev = loggedDates[i - 1];
    const cur = loggedDates[i];
    if (addDays(prev, 1) === cur) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
  }

  // current streak: walk backwards from today (or yesterday, if today not logged yet)
  let currentStreak = 0;
  let cursor = todayStr();
  if (!hasAnyEntries(byDate.get(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (hasAnyEntries(byDate.get(cursor))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  return { currentStreak, longestStreak, daysLogged };
}

export function computeProteinGoalStreak(logs: DailyLog[], proteinTarget: number, totalsFn: (log: DailyLog) => { protein: number }): number {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const log of sorted) {
    if (!hasAnyEntries(log)) break;
    if (totalsFn(log).protein >= proteinTarget * 0.95) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
