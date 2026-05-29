/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Routine, Exercise, WorkoutSession, LoggedExercise, LoggedSet, WorkoutSettings } from '../types';
import { PoseIcon } from './PoseIcon';
import { Play, Pause, Trash2, Check, Timer, ArrowLeft, PlusCircle, AlertCircle, Plus } from 'lucide-react';
import { getUnitTraits } from '../data/unit-traits';

export type ExerciseMetricType = 'weight-reps' | 'bodyweight-reps' | 'cardio-distance';

/**
 * Pick the input layout for a logged set. If the planned exercise has a
 * non-default `unit`, prefer that — a planned `kms` always means cardio,
 * a planned `kgs`/`lbs` always means weight+reps, regardless of the
 * exercise's category. Falls back to the exercise's category/equipment
 * heuristic for legacy plans that only used the default `reps` unit.
 */
export function getExerciseMetricType(exercise: Exercise, plannedUnit?: string): ExerciseMetricType {
  if (plannedUnit && plannedUnit !== 'reps') {
    const traits = getUnitTraits(plannedUnit);
    if (traits.metric === 'cardio-distance' || traits.metric === 'cardio-duration') {
      return 'cardio-distance';
    }
    if (traits.metric === 'weight-reps') return 'weight-reps';
  }
  const equip = exercise.equipment?.toLowerCase() || '';
  const cat = exercise.category?.toLowerCase() || '';
  if (equip === 'cardio' || cat === 'cardio') return 'cardio-distance';
  if (equip === 'bodyweight') return 'bodyweight-reps';
  return 'weight-reps';
}

interface ActiveSessionProps {
  routine: Routine;
  exercisesList: Exercise[];
  settings: WorkoutSettings;
  onFinish: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  routine,
  exercisesList,
  settings,
  onFinish,
  onCancel
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [notes, setNotes] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const skipPersistRef = useRef(false);
  const latestSessionRef = useRef({
    elapsedSeconds: 0,
    loggedExercises: [] as LoggedExercise[],
    notes: '',
    isPlaying: true
  });
  
  // Rest Timer State
  const [restDuration, setRestDuration] = useState(0); // active countdown in seconds
  const [showRestTimer, setShowRestTimer] = useState(false);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session with current routine sets
  useEffect(() => {
    // Check if there is an active running session saved in localStorage for this active session
    const storedActive = localStorage.getItem('gym_active_session_data');
    if (storedActive) {
      try {
        const saved = JSON.parse(storedActive);
        if (saved.routineId === routine.id || !saved.routineId) {
          // Restore exact state variables
          setNotes(saved.notes || '');
          setLoggedExercises(saved.loggedExercises || []);
          setIsPlaying(!saved.isSessionPaused);
          
          let seconds = saved.pausedElapsedSeconds || 0;
          if (!saved.isSessionPaused && saved.sessionStartTime) {
            seconds = Math.floor((Date.now() - saved.sessionStartTime) / 1000);
          }
          setElapsedSeconds(seconds);
          return;
        }
      } catch (err) {
        console.error("Failed to restore saved active session, starting afresh.", err);
      }
    }

    // Otherwise, generate standard clean starting tracker sets
    const initialLogged: LoggedExercise[] = routine.exercises.map(planned => {
      const exerciseEx = exercisesList.find(e => e.id === planned.exerciseId);
      const traits = getUnitTraits(planned.unit);
      const metricType = exerciseEx ? getExerciseMetricType(exerciseEx, planned.unit) : 'weight-reps';

      // Cardio-without-sets exercises always render exactly one tracked set.
      const setCount = traits.supportsSets ? planned.sets : 1;
      const sets: LoggedSet[] = [];
      const defaultWeight = settings.weightUnit === 'lbs' ? 100 : 50;
      const plannedNumeric = parseFloat(planned.reps.split('-')[0]);
      const plannedReps = Number.isFinite(plannedNumeric) ? plannedNumeric : 10;

      // Seed distance / duration straight from the planned value when
      // the planned unit IS distance / duration. Otherwise pick sane defaults.
      const seedDistance = traits.metric === 'cardio-distance'
        ? plannedReps
        : 5.0;
      const seedDuration = traits.metric === 'cardio-duration'
        ? plannedReps
        : (traits.metric === 'cardio-distance' ? 15 : 15);

      for (let i = 0; i < setCount; i++) {
        sets.push({
          id: `${planned.id || planned.exerciseId}-set-${i}-${Math.random()}`,
          weight: defaultWeight,
          reps: Math.round(plannedReps),
          completed: false,
          distance: metricType === 'cardio-distance' ? seedDistance : undefined,
          durationMinutes: metricType === 'cardio-distance' ? seedDuration : undefined
        });
      }

      return {
        exerciseId: planned.exerciseId,
        sets
      };
    });

    setLoggedExercises(initialLogged);
    setElapsedSeconds(0);
    setIsPlaying(true);
  }, [routine, settings]);

  // Main Session Stopwatch ticking
  useEffect(() => {
    let watch: NodeJS.Timeout;
    if (isPlaying) {
      watch = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(watch);
  }, [isPlaying]);

  latestSessionRef.current = {
    elapsedSeconds,
    loggedExercises,
    notes,
    isPlaying
  };

  const persistActiveSession = () => {
    if (skipPersistRef.current || latestSessionRef.current.loggedExercises.length === 0) return;

    const snapshot = latestSessionRef.current;
    const dataToSave = {
      routineId: routine.id,
      notes: snapshot.notes,
      loggedExercises: snapshot.loggedExercises,
      isSessionPaused: !snapshot.isPlaying,
      pausedElapsedSeconds: snapshot.elapsedSeconds,
      sessionStartTime: Date.now() - (snapshot.elapsedSeconds * 1000)
    };
    localStorage.setItem('gym_active_session_data', JSON.stringify(dataToSave));
  };

  // Persist stopwatch timing only when play/pause changes and when the session view unmounts.
  useEffect(() => {
    persistActiveSession();
    return () => persistActiveSession();
  }, [isPlaying, routine.id]);

  // Persist content changes without writing on every elapsed-second tick.
  useEffect(() => {
    persistActiveSession();
  }, [loggedExercises, notes, routine.id]);

  // Real-time Max Workout Timer limit checking and auto-logging trigger
  useEffect(() => {
    const maxLimitMinutes = settings.maxWorkoutDuration || 120;
    const maxLimitSeconds = maxLimitMinutes * 60;

    if (elapsedSeconds >= maxLimitSeconds) {
      // Auto-compile completed exercises
      const finalizedSession: WorkoutSession = {
        id: `autosession-${Date.now()}`,
        routineId: routine.id,
        routineName: routine.name || 'Auto-logged Session',
        startTime: Date.now() - (elapsedSeconds * 1000),
        endTime: Date.now(),
        elapsedSeconds: maxLimitSeconds,
        exercises: loggedExercises.filter(le => le.sets.length > 0),
        notes: (notes.trim() ? notes.trim() + ' \n' : '') + `[Auto-logged after reaching the maximum limit of ${maxLimitMinutes} minutes]`
      };

      // Clear the live tracking buffer
      skipPersistRef.current = true;
      localStorage.removeItem('gym_active_session_data');
      
      // Submit callback and let App show the user-facing auto-log notice.
      onFinish(finalizedSession);
    }
  }, [elapsedSeconds, routine, loggedExercises, notes, settings.maxWorkoutDuration, onFinish]);

  // Plays a short two-tone beep using the WebAudio API. No external file,
  // no dependency. Wrapped in a try/catch because some mobile browsers
  // block AudioContext until a user gesture — we attempt anyway, swallow.
  const playRestCue = () => {
    try {
      const Ctx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      const tone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      };
      tone(880, 0, 0.18);
      tone(1320, 0.22, 0.22);
      setTimeout(() => ctx.close().catch(() => undefined), 600);
    } catch {
      /* audio blocked / unsupported — silently ignore */
    }
  };

  // Rest Timer countdown logic. When it expires, fire the configured
  // sound + vibration cues if the user has them enabled in Settings.
  useEffect(() => {
    if (restDuration > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestDuration(prev => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current!);
            setShowRestTimer(false);
            if (settings.soundEnabled) playRestCue();
            if (settings.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate([120, 80, 120]); } catch { /* ignore */ }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restDuration, settings.soundEnabled, settings.vibrationEnabled]);

  // Format stopwatch digits
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Rest timer interface trigger
  const triggerRestTimer = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestDuration(settings.defaultRestDuration);
    setShowRestTimer(true);
  };

  // Modify individual set values with full immutability supporting weight, reps, distance, and duration
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'distance' | 'durationMinutes',
    value: number
  ) => {
    setLoggedExercises(prev =>
      prev.map((item, exIdx) => {
        if (exIdx !== exerciseIndex) return item;
        return {
          ...item,
          sets: item.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            return {
              ...set,
              [field]: value
            };
          })
        };
      })
    );
  };

  // Check if an exercise is completed
  const isExCompleted = (loggedEx: LoggedExercise): boolean => {
    return loggedEx.sets.length > 0 && loggedEx.sets.every(s => s.completed);
  };

  // Fast checkoff/toggle for entire exercise sets to solve "i cant mark the exercises i finish"
  const handleToggleAllSets = (exerciseIndex: number) => {
    setLoggedExercises(prev => {
      const targetEx = prev[exerciseIndex];
      const allCompleted = isExCompleted(targetEx);
      const nextState = prev.map((item, exIdx) => {
        if (exIdx !== exerciseIndex) return item;
        return {
          ...item,
          sets: item.sets.map(s => ({
            ...s,
            completed: !allCompleted
          }))
        };
      });

      // trigger rest timer on complete check
      if (!allCompleted) {
        triggerRestTimer();
      }

      return nextState;
    });
  };

  // Mark set as logged (Immutably and ensures instant UI reaction)
  const handleToggleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    setLoggedExercises(prev => {
      const targetSet = prev[exerciseIndex].sets[setIndex];
      const nextCompleted = !targetSet.completed;
      const nextState = prev.map((item, exIdx) => {
        if (exIdx !== exerciseIndex) return item;
        return {
          ...item,
          sets: item.sets.map((s, sIdx) => {
            if (sIdx !== setIndex) return s;
            return {
              ...s,
              completed: nextCompleted
            };
          })
        };
      });

      if (nextCompleted) {
        triggerRestTimer();
      }

      return nextState;
    });
  };

  // Add a new set to an active exercise (100% immutable - fixes duplicating sets strict mode bug)
  const handleAddSet = (exerciseIndex: number) => {
    setLoggedExercises(prev =>
      prev.map((item, exIdx) => {
        if (exIdx !== exerciseIndex) return item;
        const exerciseEx = exercisesList.find(e => e.id === item.exerciseId);
        const metricType = exerciseEx ? getExerciseMetricType(exerciseEx) : 'weight-reps';
        const sets = item.sets;
        const lastSet = sets[sets.length - 1];

        const newSet: LoggedSet = {
          id: `custom-set-${Date.now()}-${Math.random()}`,
          weight: lastSet ? lastSet.weight : (settings.weightUnit === 'lbs' ? 100 : 50),
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          distance: metricType === 'cardio-distance' ? (lastSet?.distance ?? 5.0) : undefined,
          durationMinutes: metricType === 'cardio-distance' ? (lastSet?.durationMinutes ?? 15) : undefined
        };

        return {
          ...item,
          sets: [...sets, newSet]
        };
      })
    );
  };

  // Remove set (Immutably)
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setLoggedExercises(prev =>
      prev.map((item, exIdx) => {
        if (exIdx !== exerciseIndex) return item;
        return {
          ...item,
          sets: item.sets.filter((_, sIdx) => sIdx !== setIndex)
        };
      })
    );
  };

  // Support adding a brand new exercise on-the-fly to the logged session
  const [showAddExModal, setShowAddExModal] = useState(false);
  const handleAddExerciseToSession = (exerciseId: string) => {
    const exerciseEx = exercisesList.find(e => e.id === exerciseId);
    const metricType = exerciseEx ? getExerciseMetricType(exerciseEx) : 'weight-reps';

    setLoggedExercises(prev => {
      if (prev.some(logged => logged.exerciseId === exerciseId)) return prev;

      return [
        ...prev,
        {
          exerciseId,
          sets: [
            {
              id: `onfly-${exerciseId}-${Date.now()}`,
              weight: settings.weightUnit === 'lbs' ? 100 : 50,
              reps: 10,
              completed: false,
              distance: metricType === 'cardio-distance' ? 5.0 : undefined,
              durationMinutes: metricType === 'cardio-distance' ? 15 : undefined
            }
          ]
        }
      ];
    });
    setShowAddExModal(false);
  };

  // Submit session
  const handleCompleteSession = () => {
    // Clear live run flag
    skipPersistRef.current = true;
    localStorage.removeItem('gym_active_session_data');

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name || 'Custom Session',
      startTime: Date.now() - (elapsedSeconds * 1000),
      endTime: Date.now(),
      elapsedSeconds,
      exercises: loggedExercises.filter(le => le.sets.length > 0),
      notes: notes.trim()
    };
    onFinish(session);
  };

  return (
    <div id="active-session-container" className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 pb-36 relative">
      
      {/* Sticky top bar — tight on mobile.
          Layout: [Back] [Routine name + sublabel] ........... [Discard] [FINISH]
          The session timer + pause/play moved to a floating pill at the
          bottom of the screen so the FINISH action always has room here. */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 z-30 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onCancel}
            className="p-2 -ml-1 shrink-0 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all duration-200"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-zinc-100 leading-tight truncate">{routine.name || 'Active Session'}</h1>
            <span className="text-[9px] font-extrabold text-violet-500 uppercase tracking-wider">Logging Workout</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-2 py-2 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-all duration-150"
          >
            Discard
          </button>
          <button
            onClick={handleCompleteSession}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[11px] font-black tracking-wide shadow-md shadow-emerald-950/30 active:scale-95 transition-all"
          >
            FINISH
          </button>
        </div>
      </div>

      {/* Main session feed */}
      <div className="px-5 py-5 space-y-6 max-w-lg mx-auto w-full flex-grow">
        
        {/* Max Timer Safety notice banner overlay */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-3.5 px-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
          <div className="text-[10px] text-zinc-500 font-bold leading-relaxed">
            Persistence tracking is turned on. Session runs in background! Max Limit: <span className="text-violet-400 font-black">{settings.maxWorkoutDuration || 120} mins</span>. After this, it auto-logs sets for your safety.
          </div>
        </div>

        {/* Session overall notes — multi-line for real comments. */}
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-4 space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 block">Session Workout Notes</label>
          <textarea
            rows={2}
            placeholder="Feeling energetic? Key hydration remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition resize-none"
          />
        </div>

        {/* Exercises list with inline sets log */}
        {loggedExercises.map((logged, exIdx) => {
          const exerciseRef = exercisesList.find(e => e.id === logged.exerciseId);
          if (!exerciseRef) return null;

          const allDone = isExCompleted(logged);
          const metricType = getExerciseMetricType(exerciseRef);

          // Universal color-coded category border theme
          const borderThemes: Record<string, string> = {
            chest: 'border-l-rose-500/80',
            back: 'border-l-emerald-500/80',
            legs: 'border-l-blue-500/80',
            shoulders: 'border-l-amber-500/80',
            arms: 'border-l-violet-500/80',
            core: 'border-l-cyan-500/80',
            cardio: 'border-l-indigo-500/80'
          };
          const cardBorderColor = borderThemes[exerciseRef.category] || 'border-l-zinc-700';

          return (
            <div
              key={logged.exerciseId}
              className={`bg-zinc-900/20 border border-zinc-900 border-l-4 ${cardBorderColor} rounded-3xl overflow-hidden shadow-lg transition duration-200 ${
                allDone ? 'border-emerald-900/30' : ''
              }`}
            >
              {/* Exercise information bar */}
              <div className="px-4 py-3 border-b border-zinc-900/80 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  
                  {/* Dynamic Fast Master Completion Switch - solves checkoff speed issue */}
                  <button
                    onClick={() => handleToggleAllSets(exIdx)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition focus:outline-none ${
                      allDone 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40' 
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-500 text-transparent hover:text-zinc-500'
                    }`}
                    title={allDone ? "Unmark entire exercise" : "Mark entire exercise completed"}
                  >
                    <Check className="w-3.5 h-3.5 text-current stroke-[3.5px]" />
                  </button>

                  <PoseIcon name={exerciseRef.poseIcon} size={36} className="shrink-0 opacity-80" />
                  <div>
                    <h3 className={`text-xs font-black tracking-tight leading-none transition-colors ${
                      allDone ? 'text-zinc-500 line-through' : 'text-zinc-200'
                    }`}>
                      {exerciseRef.name}
                    </h3>
                    {(() => {
                      const categoryTextColors: Record<string, string> = {
                        chest: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
                        back: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
                        legs: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
                        shoulders: 'text-amber-400 bg-amber-500/5 border-amber-500/10',
                        arms: 'text-violet-400 bg-violet-500/5 border-violet-500/10',
                        core: 'text-cyan-400 bg-cyan-500/5 border-cyan-500/10',
                        cardio: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10'
                      };
                      const badgeClass = categoryTextColors[exerciseRef.category] || 'text-zinc-400 bg-zinc-900 border-zinc-800';
                      return (
                        <p className="text-[9px] font-bold text-zinc-500 mt-1 flex items-center gap-1.5 capitalize">
                          <span>{exerciseRef.equipment}</span>
                          <span className="text-zinc-800 font-extrabold">•</span>
                          <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase tracking-wider border ${badgeClass}`}>{exerciseRef.category}</span>
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Set completion counter */}
                  <span className={`text-[8.5px] font-mono font-black px-2 py-0.5 rounded-full ${
                    allDone ? 'bg-emerald-950/30 text-emerald-400' : 'bg-zinc-950 text-zinc-500'
                  }`}>
                    {logged.sets.filter(s => s.completed).length}/{logged.sets.length} sets
                  </span>

                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Add Set
                  </button>
                </div>
              </div>

              {/* Set list header based on exercise metric type */}
              <div className="px-4 py-2 bg-zinc-950/30 grid grid-cols-12 text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 border-b border-zinc-900/60">
                <span className="col-span-2 text-center">Set</span>
                {metricType === 'weight-reps' && (
                  <>
                    <span className="col-span-4 text-center">Weight ({settings.weightUnit})</span>
                    <span className="col-span-3 text-center">Reps</span>
                  </>
                )}
                {metricType === 'bodyweight-reps' && (
                  <>
                    <span className="col-span-4 text-center">Load</span>
                    <span className="col-span-3 text-center">Reps</span>
                  </>
                )}
                {metricType === 'cardio-distance' && (
                  <>
                    <span className="col-span-4 text-center">Distance</span>
                    <span className="col-span-3 text-center">Duration</span>
                  </>
                )}
                <span className="col-span-3 text-right pr-2">Done</span>
              </div>

              {/* Sets Log List */}
              <div className="divide-y divide-zinc-900/40 bg-zinc-950/10">
                {logged.sets.map((set, setIdx) => (
                  <div
                    key={set.id}
                    className={`px-4 py-2.5 grid grid-cols-12 items-center text-center transition duration-150 ${
                      set.completed ? 'bg-zinc-900/5 text-zinc-400' : ''
                    }`}
                  >
                    {/* Index & Delete anchor */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      {logged.sets.length > 1 && (
                        <button
                          onClick={() => handleRemoveSet(exIdx, setIdx)}
                          className="p-1 hover:text-red-400 rounded transition text-zinc-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className={`font-mono text-xs font-bold leading-none ${
                        set.completed ? 'text-zinc-600' : 'text-zinc-400'
                      }`}>{setIdx + 1}</span>
                    </div>

                    {/* Weight Control Input with responsive step buttons */}
                    {metricType === 'weight-reps' && (
                      <div className="col-span-4 px-1.5 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', Math.max(0, set.weight - (settings.weightUnit === 'lbs' ? 5 : 2.5)))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={set.weight}
                          disabled={set.completed}
                          step={settings.weightUnit === 'lbs' ? 5 : 2.5}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-12 bg-zinc-900/45 border border-zinc-800 focus:border-violet-600 rounded px-1 py-0.5 text-xs text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', set.weight + (settings.weightUnit === 'lbs' ? 5 : 2.5))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {metricType === 'bodyweight-reps' && (
                      <div className="col-span-4 flex items-center justify-center">
                        <span className="text-[9px] uppercase font-black text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full tracking-wider">
                          Bodyweight
                        </span>
                      </div>
                    )}

                    {metricType === 'cardio-distance' && (
                      <div className="col-span-4 px-1 flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'distance', Math.max(0, parseFloat(((set.distance ?? 5.0) - 0.5).toFixed(1))))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 api-adjustment-trigger flex items-center justify-center text-[8px] font-black"
                        >
                          -
                        </button>
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={set.distance ?? 5.0}
                            disabled={set.completed}
                            step={0.5}
                            className="w-10 bg-zinc-900/45 border border-zinc-800 focus:border-violet-600 rounded px-1 py-0.5 text-[11px] text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                            onChange={(e) => handleUpdateSet(exIdx, setIdx, 'distance', parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-[8px] font-bold text-zinc-500">km</span>
                        </div>
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'distance', parseFloat(((set.distance ?? 5.0) + 0.5).toFixed(1)))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[8px] font-black"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* COLUMN 3: reps or duration based on type */}
                    {metricType !== 'cardio-distance' ? (
                      <div className="col-span-3 px-1.5 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', Math.max(0, set.reps - 1))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={set.reps}
                          disabled={set.completed}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-9 bg-zinc-900/45 border border-zinc-800 focus:border-violet-600 rounded px-1 py-0.5 text-xs text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', set.reps + 1)}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="col-span-3 px-1 flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'durationMinutes', Math.max(0, (set.durationMinutes ?? 15) - 1))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[8px] font-black"
                        >
                          -
                        </button>
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={set.durationMinutes ?? 15}
                            disabled={set.completed}
                            className="w-8 bg-zinc-900/45 border border-zinc-800 focus:border-violet-600 rounded px-1 py-0.5 text-[11px] text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                            onChange={(e) => handleUpdateSet(exIdx, setIdx, 'durationMinutes', parseInt(e.target.value) || 0)}
                          />
                          <span className="text-[8px] font-bold text-zinc-500">min</span>
                        </div>
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'durationMinutes', (set.durationMinutes ?? 15) + 1)}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[8px] font-black"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Completion Checklist Box */}
                    <div className="col-span-3 flex justify-end pr-2">
                      <button
                        onClick={() => handleToggleCompleteSet(exIdx, setIdx)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-150 focus:outline-none ${
                          set.completed
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white shadow shadow-emerald-950/20'
                            : 'border-zinc-800 hover:border-zinc-600 text-transparent hover:text-zinc-600 bg-zinc-950/40'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-current stroke-[3px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add non-routine exercise dynamically */}
        <button
          onClick={() => setShowAddExModal(true)}
          className="w-full py-4 border border-dashed border-zinc-800 rounded-3xl hover:border-violet-700/60 hover:bg-violet-950/5 flex items-center justify-center gap-2 text-zinc-500 hover:text-violet-400 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Integrate Unplanned Exercise</span>
        </button>
      </div>

      {/* Floating bottom timer stack.
          Bottom pill: session stopwatch + pause/play (always visible).
          Above it: rest countdown (only when active). Both centered, both
          live on top of the page so they're reachable on any scroll. */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
        {showRestTimer && restDuration > 0 && (
          <div className="bg-zinc-950/95 border border-violet-700/40 text-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl shadow-black backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="flex flex-col leading-tight">
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Rest Countdown</span>
              <span className="font-mono text-sm font-black text-violet-400">
                {restDuration}s <span className="text-zinc-500 font-bold lowercase text-[10px]">left</span>
              </span>
            </div>
            <button
              onClick={() => { setRestDuration(0); setShowRestTimer(false); }}
              className="text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white font-extrabold"
            >
              Skip
            </button>
          </div>
        )}

        <div className="bg-zinc-950/95 border border-zinc-800 text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-xl shadow-black backdrop-blur-md pointer-events-auto select-none">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-full transition-all duration-150 ${
              isPlaying
                ? 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-violet-600/30 text-violet-200 hover:bg-violet-600/50'
            }`}
            title={isPlaying ? 'Pause session' : 'Resume session'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <Timer className={`w-3.5 h-3.5 ${isPlaying ? 'text-violet-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="font-mono text-sm font-black text-white tracking-widest leading-none pr-2">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* MODAL: ADD UNPLANNED EXERCISE ON FLY */}
      {showAddExModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden animate-slide-up shadow-2xl">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/20">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Add Dynamic Exercise</h3>
                <p className="text-[9px] text-zinc-500 font-bold">Inject unplanned item to this live session list</p>
              </div>
              <button 
                onClick={() => setShowAddExModal(false)}
                className="text-zinc-400 hover:text-white pr-1"
              >
                Cancel
              </button>
            </div>
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-1">
              {exercisesList
                .filter(ex => !loggedExercises.some(le => le.exerciseId === ex.id))
                .map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseToSession(ex.id)}
                    className="w-full text-left p-3 bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-900 rounded-2xl flex items-center gap-3 transition"
                  >
                    <PoseIcon name={ex.poseIcon} size={30} className="shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">{ex.name}</span>
                      <span className="text-[9px] uppercase font-bold text-zinc-500 capitalize">{ex.equipment} • {ex.category}</span>
                    </div>
                  </button>
                ))
              }
              {exercisesList.filter(ex => !loggedExercises.some(le => le.exerciseId === ex.id)).length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-xs font-bold">All catalog exercises already listed!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Discard Confirmation Dialog Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="bg-zinc-950 border border-rose-800/40 w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative animate-scale-up space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-600/15 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight">Discard Progress?</h3>
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Active session is running</p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
              Warning: Discarding will wipe your active workout state, delete logs for completed sets, and return you back to the main menu. Are you sure you want to stop tracking?
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  skipPersistRef.current = true;
                  localStorage.removeItem('gym_active_session_data');
                  onCancel();
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black tracking-widest transition duration-150"
              >
                DISCARD AND EXIT
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-black tracking-widest transition duration-150"
              >
                RESUME WORKOUT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
