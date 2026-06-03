/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { WorkoutSession } from '../types';
import { Flame } from 'lucide-react';

interface StreakCalendarProps {
  history: WorkoutSession[];
  selectedDay?: string | null;
  onSelectDay?: (dayKey: string) => void;
}

/**
 * GitHub-style year-view activity heatmap (53 weeks × 7 days), anchored on the
 * Sunday that closes the current week. Lives in the History tab — the natural
 * home for a visual index of when you trained. The Progress tab shows the
 * streak as numbers instead, so the two surfaces complement rather than repeat.
 */
export const StreakCalendar: React.FC<StreakCalendarProps> = ({ history, selectedDay, onSelectDay }) => {
  const { calendarWeeks, activeDaysCount } = useMemo(() => {
    const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const counts = new Map<string, { sets: number; workouts: number }>();
    history.forEach(s => {
      const d = new Date(s.startTime);
      const key = dayKey(d);
      const completedSets = s.exercises.reduce(
        (sum, exercise) => sum + exercise.sets.filter(set => set.completed).length,
        0
      );
      const prev = counts.get(key) || { sets: 0, workouts: 0 };
      counts.set(key, { sets: prev.sets + completedSets, workouts: prev.workouts + 1 });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Anchor on the Sunday ending this week, then walk back 52 full weeks.
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    const WEEKS = 53;
    type Cell = { date: Date; key: string; sets: number; workouts: number; isFuture: boolean; isToday: boolean; monthLabel: string | null };
    const weeks: Cell[][] = [];
    let active = 0;
    let lastMonth = -1;
    for (let w = WEEKS - 1; w >= 0; w--) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const cell = new Date(lastSunday);
        cell.setDate(lastSunday.getDate() - w * 7 + d);
        const key = dayKey(cell);
        const dayStats = counts.get(key) || { sets: 0, workouts: 0 };
        const isFuture = cell.getTime() > today.getTime();
        if (!isFuture && dayStats.workouts > 0) active++;
        // Tag a column header with a month label when its top cell crosses into
        // a new month. Skip the leading partial month so its label doesn't
        // collide with the first full month's tick.
        let monthLabel: string | null = null;
        if (d === 0 && cell.getMonth() !== lastMonth) {
          if (lastMonth !== -1) {
            monthLabel = cell.toLocaleDateString(undefined, { month: 'short' });
          }
          lastMonth = cell.getMonth();
        }
        col.push({
          date: cell,
          key,
          sets: dayStats.sets,
          workouts: dayStats.workouts,
          isFuture,
          isToday: cell.getTime() === today.getTime(),
          monthLabel
        });
      }
      weeks.push(col);
    }
    return { calendarWeeks: weeks, activeDaysCount: active };
  }, [history]);

  const cellClass = (sets: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent';
    if (sets <= 0) return 'bg-zinc-900';
    if (sets < 10) return 'bg-[rgb(var(--accent-900))]';
    if (sets < 20) return 'bg-[rgb(var(--accent-700))]';
    return 'bg-[rgb(var(--accent-500))]';
  };

  return (
    <div id="streak-calendar" className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[rgb(var(--accent-400))]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Streak Calendar</h3>
        </div>
        <span className="text-[10px] tracking-wide text-zinc-500 uppercase font-semibold">{activeDaysCount} active days</span>
      </div>

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Sparse month tick row */}
          <div className="flex gap-1">
            {calendarWeeks.map((week, wi) => (
              <div key={wi} className="w-2.5 h-2 text-[7px] leading-none text-zinc-600 font-semibold whitespace-nowrap">
                {week[0].monthLabel || ''}
              </div>
            ))}
          </div>
          {/* 7 day-rows × 53 week-columns (transposed render) */}
          {[0, 1, 2, 3, 4, 5, 6].map(dayRow => (
            <div key={dayRow} className="flex gap-1">
              {calendarWeeks.map((week, wi) => {
                const cell = week[dayRow];
                const isSelectable = !cell.isFuture && cell.workouts > 0 && !!onSelectDay;
                const isSelected = selectedDay === cell.key;
                return (
                  <button
                    key={wi}
                    type="button"
                    disabled={!isSelectable}
                    onClick={() => onSelectDay?.(cell.key)}
                    className={`w-2.5 h-2.5 rounded-sm transition ${cellClass(cell.sets, cell.isFuture)} ${
                      isSelected
                        ? 'ring-2 ring-[rgb(var(--accent-300))] ring-offset-1 ring-offset-black'
                        : cell.isToday
                          ? 'ring-1 ring-[rgb(var(--accent-300))]'
                          : ''
                    } ${isSelectable ? 'cursor-pointer hover:ring-1 hover:ring-[rgb(var(--accent-300))]' : 'cursor-default disabled:opacity-100'}`}
                    title={cell.isFuture ? '' : `${cell.date.toLocaleDateString()} — ${cell.sets} set${cell.sets === 1 ? '' : 's'} across ${cell.workouts} workout${cell.workouts === 1 ? '' : 's'}`}
                    aria-label={cell.isFuture ? 'Future date' : `${cell.date.toLocaleDateString()} — ${cell.sets} sets across ${cell.workouts} workouts`}
                    aria-pressed={isSelected}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[9px] text-zinc-600">Fewer sets</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900" />
        <div className="w-2.5 h-2.5 rounded-sm bg-[rgb(var(--accent-900))]" />
        <div className="w-2.5 h-2.5 rounded-sm bg-[rgb(var(--accent-700))]" />
        <div className="w-2.5 h-2.5 rounded-sm bg-[rgb(var(--accent-500))]" />
        <span className="text-[9px] text-zinc-600">More sets</span>
      </div>
    </div>
  );
};
