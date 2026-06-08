/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Routine, Exercise, WorkoutSession, LoggedExercise, LoggedSet, WorkoutSettings } from '../types';
import { PoseIcon } from './PoseIcon';
import { Modal } from './Modal';
import { ConfirmModal } from './ConfirmModal';
import { Play, Pause, Trash2, Check, Timer, ArrowLeft, PlusCircle, AlertCircle, Plus, Search } from 'lucide-react';
import { displayToKm, distanceUnitFor, durationDisplayToMinutes, getDefaultUnit, getUnitTraits, kmToDisplay, minutesToDurationDisplay, resolveDistanceSystem } from '../data/unit-traits';
import { getCategoryTheme } from '../data/category-theme';
import { categoryLabel, equipmentLabel } from '../data/localization';
import { useI18n } from '../i18n';

export type ExerciseMetricType = 'weight-reps' | 'bodyweight-reps' | 'cardio-distance' | 'cardio-duration';

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
    if (traits.metric === 'cardio-distance') return 'cardio-distance';
    if (traits.metric === 'cardio-duration') return 'cardio-duration';
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
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [notes, setNotes] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showEmptyFinishConfirm, setShowEmptyFinishConfirm] = useState(false);
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
  const distanceSystem = resolveDistanceSystem(settings.distanceUnit, settings.weightUnit);
  const distanceUnit = distanceUnitFor(distanceSystem);
  const distanceTraits = getUnitTraits(distanceUnit);
  const weightTraits = getUnitTraits(settings.weightUnit === 'lbs' ? 'lbs' : 'kgs');
  const weightStep = settings.weightIncrement && settings.weightIncrement > 0
    ? settings.weightIncrement
    : weightTraits.step;
  const defaultDistanceKm = displayToKm(parseFloat(distanceTraits.defaultValue), distanceSystem);
  const getDisplayDistance = (km?: number) => Number(kmToDisplay(km ?? defaultDistanceKm, distanceSystem).toFixed(1));
  const handleUpdateDisplayDistance = (exerciseIndex: number, setIndex: number, value: number) => {
    handleUpdateSet(exerciseIndex, setIndex, 'distance', displayToKm(value, distanceSystem));
  };
  const getDisplayDuration = (minutes?: number, unit?: string | null) => {
    const traits = getUnitTraits(unit);
    const fallback = durationDisplayToMinutes(parseFloat(traits.defaultValue), unit);
    return Number(minutesToDurationDisplay(minutes ?? fallback, unit).toFixed(unit === 'sec' ? 0 : 1));
  };
  const handleUpdateDisplayDuration = (exerciseIndex: number, setIndex: number, value: number, unit?: string | null) => {
    handleUpdateSet(exerciseIndex, setIndex, 'durationMinutes', durationDisplayToMinutes(value, unit));
  };

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
      const seedWeight = traits.metric === 'weight-reps' && planned.targetWeight && planned.targetWeight > 0
        ? planned.targetWeight
        : defaultWeight;
      const plannedNumeric = parseFloat(planned.reps.split('-')[0]);
      const plannedReps = Number.isFinite(plannedNumeric) ? plannedNumeric : 10;

      // Seed distance / duration straight from the planned value when
      // the planned unit IS distance / duration. Otherwise pick sane defaults.
      const seedDistance = traits.metric === 'cardio-distance'
        ? displayToKm(plannedReps, planned.unit === 'miles' ? 'lbs' : 'kg')
        : defaultDistanceKm;
      const seedDuration = traits.metric === 'cardio-duration'
        ? durationDisplayToMinutes(plannedReps, planned.unit)
        : 15;

      for (let i = 0; i < setCount; i++) {
        sets.push({
          id: `${planned.id || planned.exerciseId}-set-${i}-${Math.random()}`,
          weight: seedWeight,
          reps: Math.round(plannedReps),
          completed: false,
          distance: metricType === 'cardio-distance' ? seedDistance : undefined,
          durationMinutes: metricType === 'cardio-duration' ? seedDuration : undefined
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
  }, [routine, settings, defaultDistanceKm]);

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
      if (!allCompleted && (settings.autoStartRest ?? true)) {
        triggerRestTimer();
      }

      return nextState;
    });
  };

  // Mark set as logged (Immutably and ensures instant UI reaction).
  // Sets are sequential, so completion cascades: ticking set N also ticks
  // every set before it (you can't do set 3 without 1 and 2), and un-ticking
  // set N clears N and every set after it (re-opening an earlier set drops
  // the ones that came later).
  const handleToggleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    setLoggedExercises(prev => {
      const targetSet = prev[exerciseIndex].sets[setIndex];
      const nextCompleted = !targetSet.completed;
      const nextState = prev.map((item, exIdx) => {
        if (exIdx !== exerciseIndex) return item;
        return {
          ...item,
          sets: item.sets.map((s, sIdx) => {
            const shouldComplete = nextCompleted ? sIdx <= setIndex : sIdx < setIndex;
            return s.completed === shouldComplete ? s : { ...s, completed: shouldComplete };
          })
        };
      });

      if (nextCompleted && (settings.autoStartRest ?? true)) {
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
        const plannedUnit = routine.exercises.find(p => p.exerciseId === item.exerciseId)?.unit
          ?? (exerciseEx ? getDefaultUnit(exerciseEx, distanceSystem) : undefined);
        const metricType = exerciseEx ? getExerciseMetricType(exerciseEx, plannedUnit) : 'weight-reps';
        const plannedTraits = getUnitTraits(plannedUnit);
        const sets = item.sets;
        const lastSet = sets[sets.length - 1];
        const defaultDuration = plannedTraits.metric === 'cardio-duration'
          ? durationDisplayToMinutes(parseFloat(plannedTraits.defaultValue), plannedUnit)
          : 15;

        const newSet: LoggedSet = {
          id: `custom-set-${Date.now()}-${Math.random()}`,
          weight: lastSet ? lastSet.weight : (settings.weightUnit === 'lbs' ? 100 : 50),
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          distance: metricType === 'cardio-distance' ? (lastSet?.distance ?? defaultDistanceKm) : undefined,
          durationMinutes: metricType === 'cardio-duration' ? (lastSet?.durationMinutes ?? defaultDuration) : undefined
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
  const [addExerciseSearch, setAddExerciseSearch] = useState('');
  // Available exercises grouped by muscle category (same order/coloring as the
  // library) instead of a flat alphabetical list, alphabetical within each group.
  const addExerciseGroups = useMemo(() => {
    const order: Exercise['category'][] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];
    const q = addExerciseSearch.trim().toLowerCase();
    const available = exercisesList
      .filter(ex => !loggedExercises.some(le => le.exerciseId === ex.id))
      .filter(ex => {
        if (!q) return true;
        const muscleStr = ex.primaryMuscles.join(' ').replace(/-/g, ' ').toLowerCase();
        return ex.name.toLowerCase().includes(q)
          || muscleStr.includes(q)
          || ex.category.toLowerCase().includes(q)
          || ex.equipment.toLowerCase().includes(q);
      });
    return order
      .map(category => ({
        category,
        exercises: available.filter(ex => ex.category === category).sort((a, b) => a.name.localeCompare(b.name))
      }))
      .filter(group => group.exercises.length > 0);
  }, [addExerciseSearch, exercisesList, loggedExercises]);
  const addExerciseCount = useMemo(() => addExerciseGroups.reduce((sum, g) => sum + g.exercises.length, 0), [addExerciseGroups]);
  const closeAddExerciseModal = () => {
    setShowAddExModal(false);
    setAddExerciseSearch('');
  };
  const handleAddExerciseToSession = (exerciseId: string) => {
    const exerciseEx = exercisesList.find(e => e.id === exerciseId);
    const defaultUnit = exerciseEx ? getDefaultUnit(exerciseEx, distanceSystem) : undefined;
    const metricType = exerciseEx ? getExerciseMetricType(exerciseEx, defaultUnit) : 'weight-reps';
    const defaultTraits = getUnitTraits(defaultUnit);
    const defaultDuration = defaultTraits.metric === 'cardio-duration'
      ? durationDisplayToMinutes(parseFloat(defaultTraits.defaultValue), defaultUnit)
      : durationDisplayToMinutes(parseFloat(getUnitTraits('min').defaultValue), 'min');

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
              distance: metricType === 'cardio-distance' ? defaultDistanceKm : undefined,
              durationMinutes: metricType === 'cardio-duration' ? defaultDuration : undefined
            }
          ]
        }
      ];
    });
    closeAddExerciseModal();
  };

  // Submit session
  const finalizeSession = () => {
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

  const handleCompleteSession = () => {
    const completedCount = loggedExercises.reduce(
      (sum, exercise) => sum + exercise.sets.filter(set => set.completed).length,
      0
    );
    if (completedCount === 0) {
      setShowEmptyFinishConfirm(true);
      return;
    }
    finalizeSession();
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
            title={t('active.back')}
            aria-label={t('active.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-zinc-100 leading-tight truncate">{routine.name || t('active.session')}</h1>
            <span className="text-[9px] font-extrabold text-[rgb(var(--accent-500))] uppercase tracking-wider">{t('active.loggingWorkout')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-2 py-2 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-red-400 hover:bg-red-950/10 transition-all duration-150"
          >
            {t('active.discard')}
          </button>
          <button
            onClick={handleCompleteSession}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[11px] font-black tracking-wide shadow-md shadow-emerald-950/30 active:scale-95 transition-all"
          >
            {t('active.finish')}
          </button>
        </div>
      </div>

      {/* Main session feed */}
      <div className="px-5 py-5 space-y-6 max-w-lg mx-auto w-full flex-grow">
        
        {/* Max Timer Safety notice banner overlay */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-3.5 px-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[rgb(var(--accent-400))] mt-0.5 shrink-0" />
          <div className="text-[10px] text-zinc-500 font-bold leading-relaxed">
            {t('active.persistence', { minutes: settings.maxWorkoutDuration || 120 })}
          </div>
        </div>

        {/* Session overall notes — multi-line for real comments. */}
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-4 space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 block">{t('active.notes')}</label>
          <textarea
            rows={2}
            placeholder={t('active.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600))] transition resize-none"
          />
        </div>

        {/* Exercises list with inline sets log */}
        {loggedExercises.map((logged, exIdx) => {
          const exerciseRef = exercisesList.find(e => e.id === logged.exerciseId);
          if (!exerciseRef) return null;

          const allDone = isExCompleted(logged);
          const plannedUnit = routine.exercises.find(p => p.exerciseId === logged.exerciseId)?.unit
            ?? getDefaultUnit(exerciseRef, distanceSystem);
          const plannedTraits = getUnitTraits(plannedUnit);
          const metricType = getExerciseMetricType(exerciseRef, plannedUnit);

          const cardBorderColor = getCategoryTheme(exerciseRef.category).cardBorder;

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
                    aria-label={allDone ? t('active.unmarkExercise') : t('active.markExercise')}
                    aria-pressed={allDone}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition focus:outline-none ${
                      allDone 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40' 
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-500 text-transparent hover:text-zinc-500'
                    }`}
                    title={allDone ? t('active.unmarkExercise') : t('active.markExercise')}
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
                      const badgeClass = getCategoryTheme(exerciseRef.category).chip;
                      return (
                        <p className="text-[9px] font-bold text-zinc-500 mt-1 flex items-center gap-1.5 capitalize">
                          <span>{equipmentLabel(t, exerciseRef.equipment)}</span>
                          <span className="text-zinc-800 font-extrabold">•</span>
                          <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider border ${badgeClass}`}>{categoryLabel(t, exerciseRef.category)}</span>
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Set completion counter */}
                  <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                    allDone ? 'bg-emerald-950/30 text-emerald-400' : 'bg-zinc-950 text-zinc-500'
                  }`}>
                    {logged.sets.filter(s => s.completed).length}/{logged.sets.length} {t('unit.sets')}
                  </span>

                  {metricType !== 'cardio-distance' && (
                    <button
                      onClick={() => handleAddSet(exIdx)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      {t('active.addSet')}
                    </button>
                  )}
                </div>
              </div>

              {/* Set list header based on exercise metric type */}
              <div className="px-4 py-2 bg-zinc-950/30 grid grid-cols-12 text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 border-b border-zinc-900/60">
                <span className="col-span-2 text-center">{t('active.set')}</span>
                {metricType === 'weight-reps' && (
                  <>
                    <span className="col-span-4 text-center">{t('active.weight')} ({settings.weightUnit})</span>
                    <span className="col-span-3 text-center">{t('unit.reps')}</span>
                  </>
                )}
                {metricType === 'bodyweight-reps' && (
                  <>
                    <span className="col-span-4 text-center">{t('active.load')}</span>
                    <span className="col-span-3 text-center">{t('unit.reps')}</span>
                  </>
                )}
                {metricType === 'cardio-distance' && (
                  <>
                    <span className="col-span-7 text-center">{t('active.distance')} ({distanceTraits.shortLabel})</span>
                  </>
                )}
                {metricType === 'cardio-duration' && (
                  <>
                    <span className="col-span-7 text-center">{t('active.duration')} ({plannedTraits.shortLabel})</span>
                  </>
                )}
                <span className="col-span-3 text-right pr-2">{t('active.done')}</span>
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
                          aria-label={t('active.removeSet', { number: setIdx + 1 })}
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
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', Math.max(0, set.weight - weightStep))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                          aria-label={t('active.decreaseWeight', { amount: weightStep })}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={set.weight}
                          disabled={set.completed}
                          step={weightStep}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-12 bg-zinc-900/45 border border-zinc-800 focus:border-[rgb(var(--accent-600))] rounded px-1 py-0.5 text-xs text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'weight', set.weight + weightStep)}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                          aria-label={t('active.increaseWeight', { amount: weightStep })}
                        >
                          +
                        </button>
                      </div>
                    )}

                    {metricType === 'bodyweight-reps' && (
                      <div className="col-span-4 flex items-center justify-center">
                        <span className="text-[9px] uppercase font-black text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full tracking-wider">
                          {t('active.bodyweight')}
                        </span>
                      </div>
                    )}

                    {metricType === 'cardio-distance' && (
                      <div className="col-span-7 px-1 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateDisplayDistance(exIdx, setIdx, Math.max(0, parseFloat((getDisplayDistance(set.distance) - distanceTraits.step).toFixed(1))))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 api-adjustment-trigger flex items-center justify-center text-[9px] font-black"
                          aria-label={t('active.decreaseDistance', { amount: distanceTraits.step, unit: distanceTraits.shortLabel })}
                        >
                          -
                        </button>
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={getDisplayDistance(set.distance)}
                            disabled={set.completed}
                            step={distanceTraits.step}
                            className="w-10 bg-zinc-900/45 border border-zinc-800 focus:border-[rgb(var(--accent-600))] rounded px-1 py-0.5 text-[11px] text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                            onChange={(e) => handleUpdateDisplayDistance(exIdx, setIdx, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-[9px] font-bold text-zinc-500">{distanceTraits.shortLabel}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateDisplayDistance(exIdx, setIdx, parseFloat((getDisplayDistance(set.distance) + distanceTraits.step).toFixed(1)))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[9px] font-black"
                          aria-label={t('active.increaseDistance', { amount: distanceTraits.step, unit: distanceTraits.shortLabel })}
                        >
                          +
                        </button>
                      </div>
                    )}

                    {metricType === 'cardio-duration' && (
                      <div className="col-span-7 px-1 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateDisplayDuration(
                            exIdx,
                            setIdx,
                            Math.max(0, parseFloat((getDisplayDuration(set.durationMinutes, plannedUnit) - plannedTraits.step).toFixed(plannedUnit === 'sec' ? 0 : 1))),
                            plannedUnit
                          )}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[9px] font-black"
                          aria-label={t('active.decreaseDuration', { amount: plannedTraits.step, unit: plannedTraits.shortLabel })}
                        >
                          -
                        </button>
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            value={getDisplayDuration(set.durationMinutes, plannedUnit)}
                            disabled={set.completed}
                            step={plannedTraits.step}
                            className="w-12 bg-zinc-900/45 border border-zinc-800 focus:border-[rgb(var(--accent-600))] rounded px-1 py-0.5 text-[11px] text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                            onChange={(e) => handleUpdateDisplayDuration(exIdx, setIdx, parseFloat(e.target.value) || 0, plannedUnit)}
                          />
                          <span className="text-[9px] font-bold text-zinc-500">{plannedTraits.shortLabel}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateDisplayDuration(
                            exIdx,
                            setIdx,
                            parseFloat((getDisplayDuration(set.durationMinutes, plannedUnit) + plannedTraits.step).toFixed(plannedUnit === 'sec' ? 0 : 1)),
                            plannedUnit
                          )}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[9px] font-black"
                          aria-label={t('active.increaseDuration', { amount: plannedTraits.step, unit: plannedTraits.shortLabel })}
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* COLUMN 3: reps for rep-based types */}
                    {(metricType === 'weight-reps' || metricType === 'bodyweight-reps') && (
                      <div className="col-span-3 px-1.5 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', Math.max(0, set.reps - 1))}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                          aria-label={t('active.decreaseReps')}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={set.reps}
                          disabled={set.completed}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-9 bg-zinc-900/45 border border-zinc-800 focus:border-[rgb(var(--accent-600))] rounded px-1 py-0.5 text-xs text-center text-zinc-200 font-mono disabled:opacity-45 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateSet(exIdx, setIdx, 'reps', set.reps + 1)}
                          disabled={set.completed}
                          className="w-4 h-4 rounded hover:bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center text-[10px] font-black"
                          aria-label={t('active.increaseReps')}
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Completion Checklist Box */}
                    <div className="col-span-3 flex justify-end pr-2">
                      <button
                        onClick={() => handleToggleCompleteSet(exIdx, setIdx)}
                        aria-label={set.completed ? t('active.unmarkSet', { number: setIdx + 1 }) : t('active.markSet', { number: setIdx + 1 })}
                        aria-pressed={set.completed}
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
          className="w-full py-4 border border-dashed border-zinc-800 rounded-3xl hover:border-[rgb(var(--accent-700)/0.60)] hover:bg-[rgb(var(--accent-950)/0.05)] flex items-center justify-center gap-2 text-zinc-500 hover:text-[rgb(var(--accent-400))] transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">{t('active.integrateUnplanned')}</span>
        </button>
      </div>

      {/* Floating bottom timer stack.
          Bottom pill: session stopwatch + pause/play (always visible).
          Above it: rest countdown (only when active). Both centered, both
          live on top of the page so they're reachable on any scroll. */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
        {showRestTimer && restDuration > 0 && (
          <div className="bg-zinc-950/95 border border-[rgb(var(--accent-700)/0.40)] text-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl shadow-black backdrop-blur-md animate-fade-in pointer-events-auto">
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{t('active.restCountdown')}</span>
              <span className="font-mono text-sm font-black text-[rgb(var(--accent-400))]">
                {restDuration}s <span className="text-zinc-500 font-bold lowercase text-[10px]">{t('unit.left')}</span>
              </span>
            </div>
            <button
              onClick={() => { setRestDuration(0); setShowRestTimer(false); }}
              className="text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white font-extrabold"
            >
              {t('active.skip')}
            </button>
          </div>
        )}

        <div className="bg-zinc-950/95 border border-zinc-800 text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-xl shadow-black backdrop-blur-md pointer-events-auto select-none">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-full transition-all duration-150 ${
              isPlaying
                ? 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-[rgb(var(--accent-600)/0.30)] text-[rgb(var(--accent-200))] hover:bg-[rgb(var(--accent-600)/0.50)]'
            }`}
            title={isPlaying ? t('active.pause') : t('active.resume')}
            aria-label={isPlaying ? t('active.pause') : t('active.resume')}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <Timer className={`w-3.5 h-3.5 ${isPlaying ? 'text-[rgb(var(--accent-400))] animate-pulse' : 'text-zinc-500'}`} />
          <span className="font-mono text-sm font-black text-white tracking-widest leading-none pr-2">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* MODAL: ADD UNPLANNED EXERCISE ON FLY */}
      {showAddExModal && (
        <Modal
          open={showAddExModal}
          onClose={closeAddExerciseModal}
          labelledBy="add-exercise-title"
        >
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/20">
              <div>
                <h3 id="add-exercise-title" className="text-xs font-black uppercase tracking-wider text-white">{t('active.addDynamicExercise')}</h3>
                <p className="text-[9px] text-zinc-500 font-bold">{t('active.addDynamicHelp')}</p>
              </div>
              <button 
                onClick={closeAddExerciseModal}
                className="text-zinc-400 hover:text-white pr-1"
                aria-label={t('active.closeAddExercise')}
              >
                {t('common.cancel')}
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addExerciseSearch}
                  onChange={(e) => setAddExerciseSearch(e.target.value)}
                  placeholder={t('active.searchPlaceholder')}
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600)/0.30)] transition pl-10 pr-3 py-3 text-xs rounded-2xl text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="max-h-[330px] overflow-y-auto space-y-1.5 pr-1">
                {addExerciseGroups.map(group => (
                  <div key={group.category} className="space-y-1.5">
                    <div className="flex items-center gap-2 px-1 sticky top-0 bg-zinc-950 py-1 z-10">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${getCategoryTheme(group.category).text}`}>{categoryLabel(t, group.category)}</span>
                      <span className="text-[9px] text-zinc-600 font-bold">{group.exercises.length}</span>
                      <span className="flex-1 h-px bg-zinc-900" />
                    </div>
                    {group.exercises.map(ex => {
                      const theme = getCategoryTheme(ex.category);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => handleAddExerciseToSession(ex.id)}
                          className={`w-full text-left p-3 bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-900 border-l-4 ${theme.cardBorder} rounded-2xl flex items-center gap-3 transition group`}
                        >
                          <PoseIcon name={ex.poseIcon} size={30} className="shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-zinc-200 block truncate group-hover:text-white">{ex.name}</span>
                            <span className="text-[9px] uppercase font-bold text-zinc-500">{equipmentLabel(t, ex.equipment)}</span>
                          </div>
                          <span className={`text-[9px] border font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${theme.chip}`}>
                            {categoryLabel(t, ex.category)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
                {addExerciseCount === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-xs font-bold">
                    {addExerciseSearch ? t('active.noSearch') : t('active.allListed')}
                  </div>
                )}
              </div>
            </div>
        </Modal>
      )}

      {/* Visual Discard Confirmation Dialog Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="bg-zinc-950 border border-rose-800/40 w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative animate-scale-up space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-600/15 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight">{t('active.discardTitle')}</h3>
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">{t('active.discardEyebrow')}</p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
              {t('active.discardWarning')}
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
                {t('active.discardConfirm')}
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-black tracking-widest transition duration-150"
              >
                {t('active.resumeWorkout')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showEmptyFinishConfirm}
        title={t('active.noSetsTitle')}
        eyebrow={t('active.finishWorkout')}
        message={t('active.noSetsMessage')}
        confirmLabel={t('active.saveAnyway')}
        cancelLabel={t('active.keepLogging')}
        onConfirm={() => {
          setShowEmptyFinishConfirm(false);
          finalizeSession();
        }}
        onCancel={() => setShowEmptyFinishConfirm(false)}
      />

    </div>
  );
};
