/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { WorkoutSession } from '../types';
import { Flame } from 'lucide-react';
import { useI18n } from '../i18n';

interface StreakCalendarProps {
  history: WorkoutSession[];
  selectedDay?: string | null;
  onSelectDay?: (dayKey: string) => void;
}

// Dot grid geometry (px). DOT + GAP must stay in sync with the cell classes
// below so the absolutely-positioned month labels line up with their columns.
const DOT = 8;   // w-2 / h-2
const GAP = 4;   // gap-1
const STEP = DOT + GAP;

/**
 * GitHub-style year-view activity heatmap, rendered as a dot grid (53 weeks ×
 * 7 days) anchored on the Sunday that closes the current week. Auto-scrolls to
 * the most recent week on mount. Lives in the History tab.
 */
export const StreakCalendar: React.FC<StreakCalendarProps> = ({ history, selectedDay, onSelectDay }) => {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { calendarWeeks, activeDaysCount, monthTicks } = useMemo(() => {
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
    // Anchor on the Sunday closing this week, then walk back 52 full weeks.
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    const WEEKS = 53;
    type Cell = { date: Date; key: string; sets: number; workouts: number; isFuture: boolean; isToday: boolean };
    const weeks: Cell[][] = [];
    let active = 0;
    for (let w = WEEKS - 1; w >= 0; w--) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const cell = new Date(lastSunday);
        cell.setDate(lastSunday.getDate() - w * 7 + d);
        const key = dayKey(cell);
        const dayStats = counts.get(key) || { sets: 0, workouts: 0 };
        const isFuture = cell.getTime() > today.getTime();
        if (!isFuture && dayStats.workouts > 0) active++;
        col.push({
          date: cell,
          key,
          sets: dayStats.sets,
          workouts: dayStats.workouts,
          isFuture,
          isToday: cell.getTime() === today.getTime()
        });
      }
      weeks.push(col);
    }

    // Month labels: place one at the column where each new month begins (by its
    // top/Sunday cell), skip the leading partial month, and drop any tick that
    // would crowd the previous one. Absolute-positioned by column index so they
    // always sit exactly above the right week.
    const ticks: { col: number; label: string }[] = [];
    let prevMonth = -1;
    let lastLabelCol = -99;
    weeks.forEach((col, i) => {
      const m = col[0].date.getMonth();
      if (m !== prevMonth) {
        prevMonth = m;
        if (i >= 1 && i - lastLabelCol >= 3) {
          ticks.push({ col: i, label: col[0].date.toLocaleDateString(undefined, { month: 'short' }) });
          lastLabelCol = i;
        }
      }
    });

    return { calendarWeeks: weeks, activeDaysCount: active, monthTicks: ticks };
  }, [history]);

  // Default the scroll position to the far right — the latest week.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [calendarWeeks]);

  const dotClass = (sets: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent';
    if (sets <= 0) return 'bg-zinc-800/70';
    if (sets < 10) return 'bg-[rgb(var(--accent-900))]';
    if (sets < 20) return 'bg-[rgb(var(--accent-700))]';
    return 'bg-[rgb(var(--accent-500))]';
  };

  const gridWidth = calendarWeeks.length * STEP - GAP;

  return (
    <div id="streak-calendar" className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[rgb(var(--accent-400))]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('streak.calendar')}</h3>
        </div>
        <span className="text-[10px] tracking-wide text-zinc-500 uppercase font-semibold">{t('streak.activeDays', { count: activeDaysCount })}</span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <div className="relative" style={{ width: gridWidth }}>
          {/* Month tick row — absolutely aligned to its column */}
          <div className="relative h-3 mb-1">
            {monthTicks.map(t => (
              <span
                key={t.col}
                className="absolute top-0 text-[8px] leading-none text-zinc-500 font-semibold whitespace-nowrap"
                style={{ left: t.col * STEP }}
              >
                {t.label}
              </span>
            ))}
          </div>

          {/* 7 day-rows × N week-columns (transposed render) */}
          <div className="flex flex-col gap-1">
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
                      className={`w-2 h-2 rounded-full transition ${dotClass(cell.sets, cell.isFuture)} ${
                        isSelected
                          ? 'ring-2 ring-[rgb(var(--accent-300))] ring-offset-1 ring-offset-black'
                          : cell.isToday
                            ? 'ring-1 ring-[rgb(var(--accent-300))]'
                            : ''
                      } ${isSelectable ? 'cursor-pointer hover:ring-1 hover:ring-[rgb(var(--accent-300))]' : 'cursor-default disabled:opacity-100'}`}
                      title={cell.isFuture ? '' : t('streak.daySummary', { date: cell.date.toLocaleDateString(), sets: cell.sets, workouts: cell.workouts })}
                      aria-label={cell.isFuture ? t('streak.futureDate') : t('streak.daySummary', { date: cell.date.toLocaleDateString(), sets: cell.sets, workouts: cell.workouts })}
                      aria-pressed={isSelected}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[9px] text-zinc-600">{t('streak.fewerSets')}</span>
        <div className="w-2 h-2 rounded-full bg-zinc-800/70" />
        <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent-900))]" />
        <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent-700))]" />
        <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent-500))]" />
        <span className="text-[9px] text-zinc-600">{t('streak.moreSets')}</span>
      </div>
    </div>
  );
};
