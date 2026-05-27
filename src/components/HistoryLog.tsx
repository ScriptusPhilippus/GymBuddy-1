/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { PoseIcon } from './PoseIcon';
import { Clock, Calendar, ChevronDown, ChevronUp, BarChart2, Hash, Award, Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface HistoryLogProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  weightUnit: 'kg' | 'lbs';
  onDeleteSession?: (id: string) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  history,
  exercisesList,
  weightUnit,
  onDeleteSession
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);

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

  // Generate a mini-calendar grid of active days representing the current month
  const renderCalendarHabits = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

    // Map history to active day strings
    const activeDatesSet = new Set<string>();
    history.forEach(session => {
      const sDate = new Date(session.startTime);
      activeDatesSet.add(sDate.toDateString());
    });

    const days = [];
    // Spacing offsets for first-day alignment
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="w-6 h-6" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDayDate = new Date(now.getFullYear(), now.getMonth(), d);
      const isActive = activeDatesSet.has(thisDayDate.toDateString());
      const isToday = thisDayDate.toDateString() === now.toDateString();

      days.push(
        <div
          key={`day-${d}`}
          className={`w-6 h-6 rounded-lg text-[9px] font-bold flex items-center justify-center relative ${
            isActive
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow shadow-violet-900/40 font-black'
              : 'bg-zinc-900/40 text-zinc-500 border border-zinc-900'
          } ${isToday ? 'ring-1 ring-violet-400' : ''}`}
          title={isActive ? `Workout logged on ${thisDayDate.toDateString()}` : undefined}
        >
          {d}
          {isActive && (
            <span className="absolute bottom-0 w-1 h-1 rounded-full bg-white block" />
          )}
        </div>
      );
    }

    return (
      <div id="calendar-habits" className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Streak Calendar ({now.toLocaleString('default', { month: 'short' })})</h3>
          </div>
          <span className="text-[10px] font-semibold text-zinc-500">{activeDatesSet.size} active days logged</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 justify-items-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <span key={idx} className="text-[9px] font-bold text-zinc-600 uppercase w-6 text-center">{day}</span>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div id="history-panel" className="space-y-6 max-w-lg mx-auto w-full pb-12">
      
      {renderCalendarHabits()}

      {/* History log listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Completed Sessions</h2>
          <span className="text-xs font-semibold text-zinc-400">{history.length} workouts logged</span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 p-5">
            <Clock className="w-8 h-8 text-zinc-700" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-300">No workout sessions logged yet</h3>
              <p className="text-xs text-zinc-500">Pick a routine and hit "Start Workout" to begin logging dates.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session) => {
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
                        <span>{volume.toLocaleString()} tonnage</span>
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
