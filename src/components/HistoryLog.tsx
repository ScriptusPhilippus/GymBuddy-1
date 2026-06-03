/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { PoseIcon } from './PoseIcon';
import { Clock, Calendar, ChevronDown, ChevronUp, BarChart2, Hash, Trash2, Flame, Award } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { StreakCalendar } from './StreakCalendar';

interface HistoryLogProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  weightUnit: 'kg' | 'lbs';
  onDeleteSession?: (id: string) => void;
  showHelpText?: boolean;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  history,
  exercisesList,
  weightUnit,
  onDeleteSession,
  showHelpText = true
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const consistency = useMemo(() => {
    const DAY = 86400000;
    const activeDays = new Set<string>();
    history.forEach(s => {
      const d = new Date(s.startTime);
      d.setHours(0, 0, 0, 0);
      activeDays.add(dayKey(d));
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = 0;
    const cursor = new Date(today);
    if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(dayKey(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const sortedDays = [...activeDays]
      .map(k => {
        const [y, m, dd] = k.split('-').map(Number);
        return new Date(y, m, dd).getTime();
      })
      .sort((a, b) => a - b);
    let longest = 0;
    let run = 0;
    let prev = 0;
    sortedDays.forEach(ts => {
      run = prev && Math.round((ts - prev) / DAY) === 1 ? run + 1 : 1;
      if (run > longest) longest = run;
      prev = ts;
    });

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    let thisWeek = 0;
    let thisMonth = 0;
    history.forEach(s => {
      if (s.startTime >= weekStart.getTime()) thisWeek++;
      if (s.startTime >= monthStart) thisMonth++;
    });

    return { current, longest, thisWeek, thisMonth };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!selectedDay) return history;
    return history.filter(session => dayKey(new Date(session.startTime)) === selectedDay);
  }, [history, selectedDay]);

  const selectedDayLabel = useMemo(() => {
    if (!selectedDay) return null;
    const [year, month, day] = selectedDay.split('-').map(Number);
    return new Date(year, month, day).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, [selectedDay]);

  // Compute stats for a historical session
  const getSessionStats = (session: WorkoutSession) => {
    let totalVolume = 0;
    let totalCompletedSets = 0;

    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalVolume += (set.weight * set.reps);
          totalCompletedSets += 1;
        }
      });
    });

    return {
      volume: totalVolume,
      completedSets: totalCompletedSets
    };
  };

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatClockTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div id="history-panel" className="space-y-6 max-w-lg mx-auto w-full pb-12">

      <div className="space-y-3">
        <StreakCalendar
          history={history}
          selectedDay={selectedDay}
          onSelectDay={(key) => setSelectedDay(prev => (prev === key ? null : key))}
        />

        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[rgb(var(--accent-400))]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Training Consistency</h3>
                {showHelpText && (
                  <p className="text-[10px] text-zinc-500">Current streak, longest streak, and recent workout rhythm.</p>
                )}
              </div>
            </div>
            <span className="text-[10px] tracking-wide text-zinc-500 uppercase font-semibold">{history.length} total</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Current Streak</span>
              <span className="text-lg font-black text-white">{consistency.current} <span className="text-xs font-semibold text-zinc-500">day{consistency.current === 1 ? '' : 's'}</span></span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Longest Streak</span>
              <span className="text-lg font-black text-white">{consistency.longest} <span className="text-xs font-semibold text-zinc-500">day{consistency.longest === 1 ? '' : 's'}</span></span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">This Week</span>
              <span className="text-lg font-black text-white">{consistency.thisWeek} <span className="text-xs font-semibold text-zinc-500">session{consistency.thisWeek === 1 ? '' : 's'}</span></span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">This Month</span>
              <span className="text-lg font-black text-white">{consistency.thisMonth} <span className="text-xs font-semibold text-zinc-500">session{consistency.thisMonth === 1 ? '' : 's'}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* History log listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Completed Sessions</h2>
          <span className="text-xs font-semibold text-zinc-400">{filteredHistory.length} of {history.length} shown</span>
        </div>

        {selectedDay && selectedDayLabel && (
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--accent-500)/0.25)] bg-[rgb(var(--accent-600)/0.08)] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[rgb(var(--accent-300))] hover:bg-[rgb(var(--accent-600)/0.14)] transition"
          >
            Showing {selectedDayLabel} · Show all
          </button>
        )}

        {history.length === 0 ? (
          <div className="py-12 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 p-5">
            <Clock className="w-8 h-8 text-zinc-700" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-300">No workout sessions logged yet</h3>
              {showHelpText && (
                <p className="text-xs text-zinc-500">Pick a routine and hit "Start Workout" to begin logging dates.</p>
              )}
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 p-5">
            <Clock className="w-8 h-8 text-zinc-700" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-300">No sessions on this day</h3>
              {showHelpText && (
                <p className="text-xs text-zinc-500">Clear the day filter to return to the full history.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((session) => {
              const { volume, completedSets } = getSessionStats(session);
              const isExpanded = expandedSessionId === session.id;

              return (
                <div
                  key={session.id}
                  id={`history-card-${session.id}`}
                  className="bg-zinc-900/40 border border-zinc-900 rounded-3xl overflow-hidden transition-all duration-300 hover:border-zinc-800"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(session.id)}
                    className="p-5 flex flex-col space-y-2 cursor-pointer select-none hover:bg-zinc-900/20 active:bg-zinc-900/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{formatDate(session.startTime)}</span>
                        <span className="text-zinc-700">•</span>
                        <span>{formatClockTime(session.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {onDeleteSession && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDeleteId(session.id);
                            }}
                            className="p-2 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition mr-1"
                            title="Delete record"
                            aria-label={`Delete ${session.routineName} record`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-zinc-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">{session.routineName}</h3>

                    {/* Meta stats pills aligned nicely */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        <span>{formatDuration(session.elapsedSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800">
                        <Hash className="w-3.5 h-3.5 text-blue-400" />
                        <span>{completedSets} Completed sets</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800">
                        <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vol {volume.toLocaleString()} {weightUnit}·rep</span>
                      </div>
                    </div>

                    {session.notes && (
                      <p className="text-xs text-zinc-500 bg-zinc-950/40 px-3 py-1.5 rounded-xl border border-zinc-900 italic mt-2">
                        "{session.notes}"
                      </p>
                    )}
                  </div>

                  {/* Expanded lists */}
                  {isExpanded && (
                    <div className="bg-zinc-950/40 border-t border-zinc-900 px-5 py-4 space-y-4">
                      {session.exercises.map((se) => {
                        const fullEx = exercisesList.find(e => e.id === se.exerciseId);
                        if (!fullEx) return null;

                        return (
                          <div key={se.exerciseId} className="flex gap-4">
                            <PoseIcon name={fullEx.poseIcon} size={40} className="shrink-0" />
                            <div className="flex-grow space-y-1 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-900">
                              <h4 className="text-xs font-bold text-white">{fullEx.name}</h4>
                              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                                {se.sets.map((set, setIdx) => (
                                  <span
                                    key={set.id}
                                    className={`px-2 py-1 rounded font-mono text-[10px] ${
                                      set.completed
                                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                                        : 'bg-red-950/20 border border-red-900/30 text-zinc-600 line-through'
                                    }`}
                                  >
                                    S{setIdx + 1}: {set.weight}{weightUnit} x {set.reps}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!sessionToDeleteId}
        title="Delete Record?"
        eyebrow="Workout history"
        message="This permanently removes the selected workout session from your history."
        confirmLabel="Delete Record"
        tone="danger"
        onConfirm={() => {
          if (sessionToDeleteId) {
            onDeleteSession?.(sessionToDeleteId);
          }
          setSessionToDeleteId(null);
        }}
        onCancel={() => setSessionToDeleteId(null)}
      />
    </div>
  );
};
