/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';
import { Routine, Exercise, PlannedExercise, WorkoutSession, WorkoutSettings, BodyWeightEntry, ManualPRRecord, ThemeHue, LanguageCode } from './types';
import { EXERCISES } from './data/exercises';
import { DEFAULT_ROUTINES } from './data/routines';
import { Dashboard } from './components/Dashboard';
import { ActiveSession } from './components/ActiveSession';
import { ExerciseDetail } from './components/ExerciseDetail';
import { HistoryLog } from './components/HistoryLog';
import { ProgressStats } from './components/ProgressStats';
import { PoseIcon } from './components/PoseIcon';
import { ConfirmModal } from './components/ConfirmModal';
import { OnboardingTour, ONBOARDING_STEP_COUNT } from './components/OnboardingTour';
import { resolveDistanceSystem } from './data/unit-traits';
import { createTranslator, LANGUAGE_OPTIONS } from './data/localization';
import { LocalizationProvider } from './i18n';
import { ClipboardList, History, Trophy, TrendingUp, Settings, Calendar, Award, CheckCircle, Flame, Dumbbell, Sparkles, ArrowRight, ChevronRight, ChevronDown, Trash2, X, Play } from 'lucide-react';

const GYM_STORAGE_KEYS = [
  'gym_exercises',
  'gym_exercises_version',
  'gym_routines',
  'gym_routines_version',
  'gym_history',
  'gym_settings',
  'gym_schedule',
  'gym_manual_prs',
  'gym_bodyweight',
  'gym_active_session_data'
] as const;

const downloadTextFile = (filename: string, text: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`Ignoring corrupt localStorage value for ${key}.`);
    return fallback;
  }
}

const clampWeightIncrement = (value?: number) => {
  if (!Number.isFinite(value) || !value || value <= 0) return undefined;
  const snapped = Math.round(value / 0.25) * 0.25;
  return Math.min(25, Math.max(0.25, Number(snapped.toFixed(2))));
};

const normalizeSettings = (settings: WorkoutSettings): WorkoutSettings => ({
  ...settings,
  distanceUnit: settings.distanceUnit ?? (settings.weightUnit === 'lbs' ? 'mi' : 'km'),
  autoStartRest: settings.autoStartRest ?? true,
  language: settings.language ?? 'en',
  weightIncrement: clampWeightIncrement(settings.weightIncrement),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isStringifiedJsonArray = (value: string) => {
  try {
    return Array.isArray(JSON.parse(value));
  } catch {
    return false;
  }
};

const isStringifiedJsonObject = (value: string) => {
  try {
    return isRecord(JSON.parse(value));
  } catch {
    return false;
  }
};

const validateImportValue = (key: typeof GYM_STORAGE_KEYS[number], value: string) => {
  if (key.endsWith('_version')) return /^\d+$/.test(value);
  if (key === 'gym_settings' || key === 'gym_schedule' || key === 'gym_manual_prs' || key === 'gym_active_session_data') {
    return isStringifiedJsonObject(value);
  }
  return isStringifiedJsonArray(value);
};

const ONBOARDING_TAB_SEQUENCE: Array<{
  tab: 'workout' | 'history' | 'progress' | 'settings';
  subTab?: 'routines' | 'library';
}> = [
  { tab: 'workout', subTab: 'routines' },
  { tab: 'workout', subTab: 'library' },
  { tab: 'workout', subTab: 'routines' },
  { tab: 'history' },
  { tab: 'progress' },
  { tab: 'settings' }
];

const HUE_OPTIONS: Array<{
  id: ThemeHue;
  label: string;
  swatch: string;
  selected: string;
}> = [
  { id: 'violet', label: 'Violet', swatch: 'bg-violet-500', selected: 'border-violet-500 text-violet-200 bg-violet-950/20' },
  { id: 'emerald', label: 'Emerald', swatch: 'bg-emerald-500', selected: 'border-emerald-500 text-emerald-200 bg-emerald-950/20' },
  { id: 'rose', label: 'Rose', swatch: 'bg-rose-500', selected: 'border-rose-500 text-rose-200 bg-rose-950/20' },
  { id: 'sky', label: 'Sky', swatch: 'bg-sky-500', selected: 'border-sky-500 text-sky-200 bg-sky-950/20' },
  { id: 'amber', label: 'Amber', swatch: 'bg-amber-500', selected: 'border-amber-500 text-amber-200 bg-amber-950/20' },
];

// iOS-style sliding toggle — replaces the small checkbox for on/off settings.
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-500))] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
        checked ? 'bg-[rgb(var(--accent-600))]' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function App() {
  // Screen views: 'dashboard' (shows bottom tabs), 'active-session', or 'exercise-detail'
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'active-session' | 'exercise-detail'>('dashboard');
  
  // Dashboard bottom nav tabs: 'workout' | 'history' | 'progress' | 'stats' | 'settings' (Screen 1 matches these exactly!)
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'progress' | 'settings'>('workout');
  const [dashboardSubTab, setDashboardSubTab] = useState<'routines' | 'library'>('routines');

  // Core Persistent State
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [bodyWeightLog, setBodyWeightLog] = useState<BodyWeightEntry[]>([]);
  const [manualPRs, setManualPRs] = useState<Record<string, ManualPRRecord>>(() => {
    try {
      const stored = localStorage.getItem('gym_manual_prs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [settings, setSettings] = useState<WorkoutSettings>({
    weightUnit: 'kg',
    distanceUnit: 'km',
    defaultRestDuration: 90,
    soundEnabled: true,
    vibrationEnabled: true,
    autoStartRest: true,
    maxWorkoutDuration: 120,
    language: 'en'
  });

  const [autologMessage, setAutologMessage] = useState<string | null>(null);

  // Calendar Planner Event Mapping State (Weekday -> Routine ID)
  const [plannedSchedule, setPlannedSchedule] = useState<Record<string, string>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Active items mapping
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [activeDetailEx, setActiveDetailEx] = useState<Exercise | null>(null);
  // When the detail sheet is opened from a routine's planned card, this carries
  // which routine + exercise so the sheet can edit that plan's targets in place.
  const [detailPlannedCtx, setDetailPlannedCtx] = useState<{ routineId: string; exerciseId: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastLoggedSession, setLastLoggedSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const [resumableRoutine, setResumableRoutine] = useState<Routine | null>(null);
  const [resumeElapsed, setResumeElapsed] = useState<number>(0);
  const [highlightRoutineId, setHighlightRoutineId] = useState<string | null>(null);
  const effectiveDistanceUnit = resolveDistanceSystem(settings.distanceUnit, settings.weightUnit);
  const measurementPreset = settings.weightUnit === 'kg' && effectiveDistanceUnit === 'km'
    ? 'metric'
    : settings.weightUnit === 'lbs' && effectiveDistanceUnit === 'mi'
      ? 'imperial'
      : 'custom';
  const distanceUnitLabel = effectiveDistanceUnit === 'mi' ? 'miles' : 'kilometres';
  const accentHue = settings.accentHue || 'violet';
  const language = settings.language || 'en';
  const t = createTranslator(language);

  useEffect(() => {
    document.documentElement.dataset.accent = accentHue;
  }, [accentHue]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.translate = false;
  }, [language]);

  const applyOnboardingStep = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), ONBOARDING_STEP_COUNT - 1);
    const target = ONBOARDING_TAB_SEQUENCE[safeIndex] || ONBOARDING_TAB_SEQUENCE[0];
    setCurrentScreen('dashboard');
    setActiveTab(target.tab);
    if (target.subTab) setDashboardSubTab(target.subTab);
    setOnboardingStep(safeIndex);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 60);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
    applyOnboardingStep(0);
  };

  useEffect(() => {
    if (!localStorage.getItem('gym_onboarding_seen') && !localStorage.getItem('gym_active_session_data')) {
      startOnboarding();
    }
  }, []);

  const handleDismissOnboarding = () => {
    localStorage.setItem('gym_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const handleNextOnboarding = () => {
    if (onboardingStep >= ONBOARDING_STEP_COUNT - 1) {
      handleDismissOnboarding();
      return;
    }
    applyOnboardingStep(onboardingStep + 1);
  };

  const handleBackOnboarding = () => {
    applyOnboardingStep(onboardingStep - 1);
  };

  // Sync default selected workout blueprint
  useEffect(() => {
    if (routines.length > 0 && !selectedRoutineId) {
      setSelectedRoutineId(routines[0].id);
    }
  }, [routines, selectedRoutineId]);

  // 1. Load starting database from localStorage or seed initial defaults
  useEffect(() => {
    // a. Exercises Custom seeds.
    //    Bumped to v5 after wiring dedicated per-exercise pose icons across
    //    the whole catalogue (v4 covered the three bench-press variants; the
    //    expanded catalogue + category audit landed in v3); existing installs
    //    need their built-in entries refreshed.
    //    Any custom-* exercises the user created are preserved.
    const EXERCISES_SEED_VERSION = 5;
    const storedVersion = parseInt(localStorage.getItem('gym_exercises_version') || '0', 10);
    const storedExercises = safeParse<Exercise[] | null>('gym_exercises', null);

    if (storedExercises && storedVersion >= EXERCISES_SEED_VERSION) {
      setExercisesList(storedExercises);
    } else {
      // Preserve user-created custom exercises while re-seeding the built-ins.
      let preservedCustoms: Exercise[] = [];
      if (storedExercises) {
        preservedCustoms = storedExercises.filter(e => typeof e.id === 'string' && e.id.startsWith('custom-'));
      }
      const merged: Exercise[] = [...EXERCISES, ...preservedCustoms];
      setExercisesList(merged);
      localStorage.setItem('gym_exercises', JSON.stringify(merged));
      localStorage.setItem('gym_exercises_version', String(EXERCISES_SEED_VERSION));
    }

    // b. Workout Settings Setup
    const storedSettings = safeParse<Partial<WorkoutSettings> | null>('gym_settings', null);
    if (storedSettings) {
      setSettings(prev => normalizeSettings({
        ...prev,
        ...storedSettings,
      }));
    }

    // c. Scheduled Planner Days
    const storedSchedule = safeParse<Record<string, string> | null>('gym_schedule', null);
    if (storedSchedule) {
      setPlannedSchedule(storedSchedule);
    } else {
      // Default standard planner
      const initialSched = {
        'Monday': 'push-day',
        'Wednesday': 'pull-day',
        'Friday': 'leg-day'
      };
      setPlannedSchedule(initialSched);
      localStorage.setItem('gym_schedule', JSON.stringify(initialSched));
    }

    // d. Historical gym sessions
    const storedHistory = safeParse<WorkoutSession[] | null>('gym_history', null);
    if (storedHistory) {
      setHistory(storedHistory);
    }

    // d2. Body-weight log (progress tracking)
    const storedBodyWeight = safeParse<BodyWeightEntry[] | null>('gym_bodyweight', null);
    if (storedBodyWeight) {
      setBodyWeightLog(storedBodyWeight);
    }

    // e. Workout routines
    const ROUTINES_SEED_VERSION = 1;
    const storedRoutines = safeParse<Routine[] | null>('gym_routines', null);
    const storedRoutinesVersion = parseInt(localStorage.getItem('gym_routines_version') || '0', 10);

    if (storedRoutines && storedRoutinesVersion >= ROUTINES_SEED_VERSION) {
      setRoutines(storedRoutines);
    } else {
      let preservedCustoms: Routine[] = [];
      if (storedRoutines) {
        preservedCustoms = storedRoutines.filter(r => typeof r.id === 'string' && r.id.startsWith('routine-'));
      }

      const merged = [...DEFAULT_ROUTINES, ...preservedCustoms];
      setRoutines(merged);
      localStorage.setItem('gym_routines', JSON.stringify(merged));
      localStorage.setItem('gym_routines_version', String(ROUTINES_SEED_VERSION));
    }
  }, []);

  // Active session restoration & background tracker autologging checker
  useEffect(() => {
    if (routines.length === 0) return;

    const storedActive = localStorage.getItem('gym_active_session_data');
    if (storedActive) {
      try {
        const saved = JSON.parse(storedActive);
        const savedRoutine = routines.find(r => r.id === saved.routineId);
        if (savedRoutine) {
          const maxLimitMinutes = settings.maxWorkoutDuration || 120;
          const maxLimitSeconds = maxLimitMinutes * 60;
          
          let elapsed = saved.pausedElapsedSeconds || 0;
          if (!saved.isSessionPaused && saved.sessionStartTime) {
            elapsed = Math.floor((Date.now() - saved.sessionStartTime) / 1000);
          }

          if (elapsed >= maxLimitSeconds) {
            // Auto finalize the session!
            const autoSession = {
              id: `autosession-${Date.now()}`,
              routineId: savedRoutine.id,
              routineName: savedRoutine.name || 'Auto-logged Session',
              startTime: saved.sessionStartTime || (Date.now() - (elapsed * 1000)),
              endTime: Date.now(),
              elapsedSeconds: maxLimitSeconds,
              exercises: saved.loggedExercises || [],
              notes: (saved.notes || '') + ' \n[Auto-logged on refresh: Reached safety timer limit]'
            };

            const storedHistory = localStorage.getItem('gym_history');
            const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
            const updatedHistory = [autoSession, ...parsedHistory];
            setHistory(updatedHistory);
            localStorage.setItem('gym_history', JSON.stringify(updatedHistory));

            localStorage.removeItem('gym_active_session_data');
            
            setAutologMessage(t('autolog.message.previous', { name: savedRoutine.name, minutes: maxLimitMinutes }));
            setCurrentScreen('dashboard');
            setActiveTab('history');
          } else {
            setActiveRoutine(savedRoutine);
            setCurrentScreen('active-session');
          }
        }
      } catch (err) {
        console.error("Failed to restore previous session on load", err);
      }
    }
  }, [routines]);

  useEffect(() => {
    if (currentScreen !== 'dashboard') {
      setResumableRoutine(null);
      setResumeElapsed(0);
      return;
    }

    const storedActive = localStorage.getItem('gym_active_session_data');
    if (!storedActive) {
      setResumableRoutine(null);
      setResumeElapsed(0);
      return;
    }

    try {
      const saved = JSON.parse(storedActive);
      const savedRoutine = routines.find(r => r.id === saved.routineId);
      if (!savedRoutine) {
        setResumableRoutine(null);
        setResumeElapsed(0);
        return;
      }

      const calculateElapsed = () => {
        if (saved.isSessionPaused || !saved.sessionStartTime) {
          return saved.pausedElapsedSeconds || 0;
        }
        return Math.max(0, Math.floor((Date.now() - saved.sessionStartTime) / 1000));
      };

      setResumableRoutine(savedRoutine);
      setResumeElapsed(calculateElapsed());

      if (saved.isSessionPaused) return;

      const tick = window.setInterval(() => {
        setResumeElapsed(calculateElapsed());
      }, 1000);

      return () => window.clearInterval(tick);
    } catch (err) {
      console.error('Failed to parse saved active session', err);
      setResumableRoutine(null);
      setResumeElapsed(0);
    }
  }, [currentScreen, routines]);

  // Sync state transitions to browser localStorage
  const handleUpdateRoutines = (updated: Routine[]) => {
    setRoutines(updated);
    localStorage.setItem('gym_routines', JSON.stringify(updated));
  };

  const handleUpdateExercises = (updated: Exercise[]) => {
    setExercisesList(updated);
    localStorage.setItem('gym_exercises', JSON.stringify(updated));
  };

  const handleUpdateSettings = (updated: WorkoutSettings) => {
    const normalized = normalizeSettings(updated);
    setSettings(normalized);
    localStorage.setItem('gym_settings', JSON.stringify(normalized));
  };

  const handleScheduleRoutine = (day: string, routineId: string) => {
    const updated = { ...plannedSchedule, [day]: routineId };
    setPlannedSchedule(updated);
    localStorage.setItem('gym_schedule', JSON.stringify(updated));
  };

  // Delete workout history
  const handleDeleteSession = (id: string) => {
    const updated = history.filter(s => s.id !== id);
    setHistory(updated);
    localStorage.setItem('gym_history', JSON.stringify(updated));
  };

  // Persist body-weight log changes (add / remove entries)
  const handleUpdateBodyWeight = (updated: BodyWeightEntry[]) => {
    setBodyWeightLog(updated);
    localStorage.setItem('gym_bodyweight', JSON.stringify(updated));
  };

  const handleSaveManualPr = (exerciseId: string, value: number, reps: number, unit: string) => {
    const updated = {
      ...manualPRs,
      [exerciseId]: reps > 0 ? { value, reps, unit } : { value, unit }
    };
    setManualPRs(updated);
    localStorage.setItem('gym_manual_prs', JSON.stringify(updated));
  };

  const handleExportData = () => {
    const bundle = {
      app: 'GymBuddy-2',
      exportedAt: new Date().toISOString(),
      data: Object.fromEntries(GYM_STORAGE_KEYS.map(key => [key, localStorage.getItem(key)]))
    };
    downloadTextFile(
      `gymbuddy-data-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(bundle, null, 2),
      'application/json'
    );
  };

  const handleImportData = async (file: File) => {
    const raw = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(t('import.invalidJson'));
    }

    if (!isRecord(parsed) || !isRecord(parsed.data)) {
      throw new Error('Invalid GymBuddy data bundle.');
    }

    Object.entries(parsed.data).forEach(([key, value]) => {
      if (!GYM_STORAGE_KEYS.includes(key as typeof GYM_STORAGE_KEYS[number])) return;
      if (value === null) {
        localStorage.removeItem(key);
        return;
      }
      if (typeof value !== 'string') {
        throw new Error(`Invalid value for ${key}.`);
      }
      if (!validateImportValue(key as typeof GYM_STORAGE_KEYS[number], value)) {
        throw new Error(`Invalid data shape for ${key}.`);
      }
      localStorage.setItem(key, value);
    });

    window.location.reload();
  };

  const handleExportExerciseCsv = () => {
    const rows = [
      ['sessionId', 'date', 'routine', 'exerciseId', 'exerciseName', 'set', 'completed', 'weight', 'reps', 'distanceKm', 'durationMinutes']
    ];
    history
      .slice()
      .sort((a, b) => a.startTime - b.startTime)
      .forEach(session => {
        session.exercises.forEach(logged => {
          const ex = exercisesList.find(item => item.id === logged.exerciseId);
          logged.sets.forEach((set, index) => {
            rows.push([
              session.id,
              new Date(session.startTime).toISOString(),
              session.routineName,
              logged.exerciseId,
              ex?.name || logged.exerciseId,
              String(index + 1),
              set.completed ? 'yes' : 'no',
              String(set.weight ?? ''),
              String(set.reps ?? ''),
              set.distance != null ? String(set.distance) : '',
              set.durationMinutes != null ? String(set.durationMinutes) : ''
            ]);
          });
        });
      });

    const csv = rows
      .map(row => row.map(cell => {
        let s = String(cell);
        // Neutralize spreadsheet formula injection: a cell opening with one of
        // these characters could execute as a formula in Excel/Sheets.
        if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
        return `"${s.replace(/"/g, '""')}"`;
      }).join(','))
      .join('\n');
    downloadTextFile(
      `gymbuddy-exercise-history-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv'
    );
  };

  // Launch Active Workout Workout Session
  const handleStartWorkout = (routine: Routine) => {
    setActiveRoutine(routine);
    setCurrentScreen('active-session');
  };

  // Handle Finished Session Submission
  const handleFinishWorkout = (session: WorkoutSession) => {
    const updatedHistory = [session, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('gym_history', JSON.stringify(updatedHistory));
    setResumableRoutine(null);
    setResumeElapsed(0);
    
    setCurrentScreen('dashboard');
    setActiveTab('history'); // route to log history

    if (session.id.startsWith('autosession-')) {
      setAutologMessage(t('autolog.message.current', { name: session.routineName, minutes: settings.maxWorkoutDuration || 120 }));
      setLastLoggedSession(null);
      setShowCelebration(false);
    } else {
      setLastLoggedSession(session);
      setShowCelebration(true); // trigger beautiful fireworks card
    }
  };

  // Open specs sheet. An optional planned context lets the sheet also edit the
  // exercise's targets within a specific routine (tapped from a planned card).
  const handleOpenDetailEx = (ex: Exercise, ctx?: { routineId: string; exerciseId: string }) => {
    setActiveDetailEx(ex);
    setDetailPlannedCtx(ctx || null);
    setCurrentScreen('exercise-detail');
  };

  // Patch a planned exercise's targets (sets/reps/unit/working weight) in place
  // from the detail sheet, persisting straight back to the owning routine.
  const handleUpdatePlannedConfig = (patch: Partial<PlannedExercise>) => {
    if (!detailPlannedCtx) return;
    const { routineId, exerciseId } = detailPlannedCtx;
    const updated = routines.map(r =>
      r.id === routineId
        ? { ...r, exercises: r.exercises.map(pe => (pe.exerciseId === exerciseId ? { ...pe, ...patch } : pe)) }
        : r
    );
    handleUpdateRoutines(updated);
  };

  const handleRemovePlannedConfig = () => {
    if (!detailPlannedCtx) return;
    const { routineId, exerciseId } = detailPlannedCtx;
    const updated = routines.map(r =>
      r.id === routineId
        ? { ...r, exercises: r.exercises.filter(pe => pe.exerciseId !== exerciseId) }
        : r
    );
    handleUpdateRoutines(updated);
    setDetailPlannedCtx(null);
    setCurrentScreen('dashboard');
    setActiveTab('workout');
  };

  // Determine current active scheduled day
  const getTodayPlannedRoutine = () => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdays[new Date().getDay()];
    const plannedId = plannedSchedule[todayName];
    return routines.find(r => r.id === plannedId) || routines[0];
  };

  const activeScheduled = getTodayPlannedRoutine();
  const selectedWorkoutRoutine = routines.find(r => r.id === selectedRoutineId) || activeScheduled || routines[0];
  const selectedWorkoutHasExercises = !!selectedWorkoutRoutine && selectedWorkoutRoutine.exercises.length > 0;

  // Tapping the "Next Scheduled Routine" card selects that routine, drops the
  // dashboard onto the routines sub-tab, and scrolls its planned-exercise
  // config into view — a preview before committing to "Start".
  const handlePreviewScheduledRoutine = () => {
    if (!activeScheduled) return;
    setSelectedRoutineId(activeScheduled.id);
    setDashboardSubTab('routines');
    // Wait a frame for the routines view + selection to render, then reveal it.
    setTimeout(() => {
      document
        .getElementById(`routine-box-${activeScheduled.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightRoutineId(activeScheduled.id);
      window.setTimeout(() => setHighlightRoutineId(null), 550);
    }, 80);
  };

  const formatResumeTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LocalizationProvider language={language}>
    <div className="notranslate min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative antialiased selection:bg-[rgb(var(--accent-600))] selection:text-white" id="gym-notepad-app">
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-[rgb(var(--accent-600)/0.1)] via-[rgb(var(--accent-500)/0.05)] to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />

      {/* VIEW CONDITIONAL RENDERING */}

      {currentScreen === 'active-session' && activeRoutine && (
        <ActiveSession
          routine={activeRoutine}
          exercisesList={exercisesList}
          settings={settings}
          onFinish={handleFinishWorkout}
          onCancel={() => {
            setCurrentScreen('dashboard');
          }}
        />
      )}

      {currentScreen === 'exercise-detail' && activeDetailEx && (
        <ExerciseDetail
          exercise={activeDetailEx}
          plannedConfig={
            detailPlannedCtx
              ? routines
                  .find(r => r.id === detailPlannedCtx.routineId)
                  ?.exercises.find(pe => pe.exerciseId === detailPlannedCtx.exerciseId)
              : undefined
          }
          routineName={detailPlannedCtx ? routines.find(r => r.id === detailPlannedCtx.routineId)?.name : undefined}
          onUpdatePlannedConfig={detailPlannedCtx ? handleUpdatePlannedConfig : undefined}
          onRemovePlannedConfig={detailPlannedCtx ? handleRemovePlannedConfig : undefined}
          manualPRs={manualPRs}
          onSaveManualPr={handleSaveManualPr}
          showExerciseImage={settings.showExerciseImage ?? false}
          showHelpText={settings.showHelpText ?? true}
          onBack={() => { setCurrentScreen('dashboard'); setDetailPlannedCtx(null); }}
          onEdit={(updatedEx) => {
            const updated = exercisesList.map(e => e.id === updatedEx.id ? updatedEx : e);
            handleUpdateExercises(updated);
            setActiveDetailEx(updatedEx);
          }}
        />
      )}

      {currentScreen === 'dashboard' && (
        <div className="flex-grow flex flex-col">
          {/* Header Dashboard panel strictly aligned with Screen 1 */}
          <header className="px-6 pt-7 pb-4 max-w-lg mx-auto w-full flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-20">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[rgb(var(--accent-500))] uppercase">{t('app.brand')}</span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {activeTab === 'workout' && t('screen.workout')}
                {activeTab === 'history' && t('screen.history')}
                {activeTab === 'progress' && t('screen.progress')}
                {activeTab === 'settings' && t('screen.settings')}
              </h1>
            </div>

            {/* Scheduler event configuration */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="p-3 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-300 hover:text-[rgb(var(--accent-400))] shadow shadow-black transition-all"
              title={t('app.configureSchedule')}
              aria-label={t('app.configureSchedule')}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </header>

          {/* Main layout container */}
          <main className="flex-grow px-5 py-2 overflow-y-auto w-full max-w-lg mx-auto">
            {activeTab === 'workout' && activeScheduled && (
              <div className="space-y-6">
                {/* Active day indicator badge */}
                <div className="bg-gradient-to-r from-[rgb(var(--accent-950)/0.2)] to-zinc-900/40 border border-[rgb(var(--accent-900)/0.3)] p-4 rounded-3xl flex items-center justify-between gap-3 shadow-lg">
                  <button
                    onClick={handlePreviewScheduledRoutine}
                    className="text-left space-y-0.5 min-w-0 flex-1 group cursor-pointer"
                    title={t('app.previewScheduled')}
                  >
                    <span className="text-[9px] font-extrabold text-[rgb(var(--accent-300))] uppercase tracking-widest block">{t('app.nextScheduledRoutine')}</span>
                    <h3 className="text-sm font-bold text-white tracking-wide inline-flex items-center gap-1 max-w-full group-hover:text-[rgb(var(--accent-200))] transition-colors">
                      <span className="truncate">{activeScheduled.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[rgb(var(--accent-300))] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </h3>
                  </button>
                  {!resumableRoutine && (
                    <button
                      onClick={() => handleStartWorkout(activeScheduled)}
                      disabled={activeScheduled.exercises.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2.5 shrink-0 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-500))] hover:from-[rgb(var(--accent-500))] rounded-xl text-xs font-bold text-white shadow shadow-black/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {activeScheduled.exercises.length === 0 ? t('startWorkout.empty') : t('startWorkout.short')} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dashboard logic mapping tabs */}
                <Dashboard
                  routines={routines}
                  exercisesList={exercisesList}
                  settings={settings}
                  history={history}
                  onStartRoutine={handleStartWorkout}
                  onViewExercise={handleOpenDetailEx}
                  onUpdateRoutines={handleUpdateRoutines}
                  onUpdateExercises={handleUpdateExercises}
                  onUpdateSettings={handleUpdateSettings}
                  manualPRs={manualPRs}
                  onSaveManualPr={handleSaveManualPr}
                  onOpenCalendarPlanner={() => setShowScheduleModal(true)}
                  selectedRoutineId={selectedRoutineId}
                  onSelectRoutineId={setSelectedRoutineId}
                  activeTab={dashboardSubTab}
                  onActiveTabChange={setDashboardSubTab}
                  highlightRoutineId={highlightRoutineId}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <HistoryLog
                history={history}
                exercisesList={exercisesList}
                weightUnit={settings.weightUnit}
                onDeleteSession={handleDeleteSession}
                showHelpText={settings.showHelpText ?? true}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressStats
                history={history}
                exercisesList={exercisesList}
                weightUnit={settings.weightUnit}
                distanceUnit={settings.distanceUnit}
                bodyWeightLog={bodyWeightLog}
                onUpdateBodyWeight={handleUpdateBodyWeight}
                showHelpText={settings.showHelpText ?? true}
              />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-5 max-w-lg mx-auto w-full pb-12">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('settings.preferences')}</h2>
                  <span className="text-[10px] text-zinc-400 font-medium font-sans">{t('settings.preferences.subtitle')}</span>
                </div>

                {/* ── UNITS ───────────────────────────────────────────────── */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[rgb(var(--accent-400))]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('settings.units')}</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.measurementSystem')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.measurementSystem.help')}</span>
                      {measurementPreset === 'custom' && (
                        <span className="text-[9px] text-[rgb(var(--accent-400))] font-black uppercase tracking-widest">{t('settings.customUnits', { weightUnit: settings.weightUnit, distanceUnit: effectiveDistanceUnit })}</span>
                      )}
                    </div>

                    <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-xl text-xs shrink-0">
                      <button
                        onClick={() => handleUpdateSettings({ ...settings, weightUnit: 'kg', distanceUnit: 'km' })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          measurementPreset === 'metric' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {t('settings.metric')}
                      </button>
                      <button
                        onClick={() => handleUpdateSettings({ ...settings, weightUnit: 'lbs', distanceUnit: 'mi' })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          measurementPreset === 'imperial' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {t('settings.imperial')}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-600 leading-relaxed border-t border-zinc-900/60 pt-3">
                    {t('settings.units.note', { weightUnit: settings.weightUnit, distanceUnit: distanceUnitLabel })}
                  </p>
                </div>

                {/* ── WORKOUT BEHAVIOUR ───────────────────────────────────── */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-[rgb(var(--accent-400))] fill-current" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('settings.workoutBehaviour')}</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.restTimer')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.restTimer.help')}</span>
                    </div>

                    <select
                      value={settings.defaultRestDuration}
                      onChange={(e) => handleUpdateSettings({ ...settings, defaultRestDuration: parseInt(e.target.value) })}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] shrink-0"
                    >
                      <option value={45}>{t('duration.seconds', { count: 45 })}</option>
                      <option value={60}>{t('duration.seconds', { count: 60 })}</option>
                      <option value={90}>{t('duration.seconds', { count: 90 })}</option>
                      <option value={120}>{t('duration.minutes', { count: 2 })}</option>
                      <option value={180}>{t('duration.minutes', { count: 3 })}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.autoStartRest')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.autoStartRest.help')}</span>
                    </div>
                    <ToggleSwitch
                      label={t('settings.autoStartRest')}
                      checked={settings.autoStartRest ?? true}
                      onChange={(next) => handleUpdateSettings({ ...settings, autoStartRest: next })}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.soundAlerts')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.soundAlerts.help')}</span>
                    </div>
                    <ToggleSwitch
                      label={t('settings.soundAlerts')}
                      checked={settings.soundEnabled}
                      onChange={(next) => handleUpdateSettings({ ...settings, soundEnabled: next })}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.vibrationAlerts')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.vibrationAlerts.help')}</span>
                    </div>
                    <ToggleSwitch
                      label={t('settings.vibrationAlerts')}
                      checked={settings.vibrationEnabled}
                      onChange={(next) => handleUpdateSettings({ ...settings, vibrationEnabled: next })}
                    />
                  </div>
                </div>

                {/* ── DISPLAY ─────────────────────────────────────────────── */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[rgb(var(--accent-400))]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('settings.display')}</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.accentHue')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.accentHue.help')}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {HUE_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleUpdateSettings({ ...settings, accentHue: option.id })}
                          className={`rounded-xl border px-1.5 py-2 text-[9px] font-black uppercase tracking-wider transition flex flex-col items-center gap-1 ${
                            accentHue === option.id
                              ? option.selected
                              : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${option.swatch}`} />
                          {t(`hue.${option.id}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-zinc-900/60 pt-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.language')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.language.help')}</span>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => handleUpdateSettings({ ...settings, language: e.target.value as LanguageCode })}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] shrink-0"
                    >
                      {LANGUAGE_OPTIONS.map(option => (
                        <option key={option.id} value={option.id}>{option.nativeLabel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.visualizer')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.visualizer.help')}</span>
                    </div>
                    <ToggleSwitch
                      label={t('settings.visualizer')}
                      checked={settings.showExerciseImage ?? false}
                      onChange={(next) => handleUpdateSettings({ ...settings, showExerciseImage: next })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-zinc-900/60 pt-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.helperDescriptions')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.helperDescriptions.help')}</span>
                    </div>
                    <ToggleSwitch
                      label={t('settings.helperDescriptions')}
                      checked={settings.showHelpText ?? true}
                      onChange={(next) => handleUpdateSettings({ ...settings, showHelpText: next })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-zinc-900/60 pt-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.howItWorks')}</span>
                      <span className="text-[10px] text-zinc-500 block">{t('settings.howItWorks.help')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={startOnboarding}
                      className="shrink-0 px-3 py-2 rounded-xl border border-[rgb(var(--accent-500)/0.25)] bg-[rgb(var(--accent-600)/0.12)] text-[10px] font-black uppercase tracking-wider text-[rgb(var(--accent-300))] hover:bg-[rgb(var(--accent-600)/0.20)] hover:text-white transition"
                    >
                      {t('settings.replay')}
                    </button>
                  </div>

                  <div className="flex items-start gap-2 border-t border-zinc-900/60 pt-4">
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-700 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                      {t('settings.minimalistNote')}
                    </p>
                  </div>
                </div>

                {/* ── ADVANCED (collapsible) ──────────────────────────────── */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl overflow-hidden">
                  <button
                    onClick={() => setShowAdvancedSettings(v => !v)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/30 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[rgb(var(--accent-400))]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('settings.advanced')}</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                  </button>

                  {showAdvancedSettings && (
                    <div className="px-5 pb-5 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4">
                        <div className="pr-3">
                          <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.maxSessionDuration')}</span>
                          <span className="text-[10px] text-zinc-500 block">{t('settings.maxSessionDuration.help')}</span>
                        </div>

                        <select
                          value={settings.maxWorkoutDuration || 120}
                          onChange={(e) => handleUpdateSettings({ ...settings, maxWorkoutDuration: parseInt(e.target.value) })}
                          className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] shrink-0"
                        >
                          <option value={45}>{t('duration.minutes', { count: 45 })}</option>
                          <option value={60}>{t('duration.hour')}</option>
                          <option value={90}>{t('duration.hours', { count: 1.5 })}</option>
                          <option value={120}>{t('duration.hours', { count: 2 })}</option>
                          <option value={180}>{t('duration.hours', { count: 3 })}</option>
                          <option value={240}>{t('duration.hours', { count: 4 })}</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4">
                        <div className="pr-3">
                          <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.weightStep')}</span>
                          <span className="text-[10px] text-zinc-500 block">{t('settings.weightStep.help', { amount: settings.weightUnit === 'lbs' ? '5 lb' : '2.5 kg' })}</span>
                        </div>

                        <input
                          type="number"
                          min={0.25}
                          max={25}
                          step="0.25"
                          value={settings.weightIncrement ?? ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            handleUpdateSettings({
                              ...settings,
                              weightIncrement: Number.isFinite(value) && value > 0 ? value : undefined
                            });
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            handleUpdateSettings({
                              ...settings,
                              weightIncrement: clampWeightIncrement(value)
                            });
                          }}
                          placeholder={settings.weightUnit === 'lbs' ? '5' : '2.5'}
                          className="w-20 bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] text-center"
                        />
                      </div>

                      <div className="border-t border-zinc-900/60 pt-4 space-y-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('settings.unitOverrides')}</span>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{t('settings.unitOverrides.help')}</p>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="pr-3">
                            <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.weightUnit')}</span>
                            <span className="text-[10px] text-zinc-500 block">{t('settings.weightUnit.help')}</span>
                          </div>

                          <select
                            value={settings.weightUnit}
                            onChange={(e) => handleUpdateSettings({ ...settings, weightUnit: e.target.value as 'kg' | 'lbs' })}
                            className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] shrink-0"
                          >
                            <option value="kg">kg</option>
                            <option value="lbs">lb</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="pr-3">
                            <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.distanceUnit')}</span>
                            <span className="text-[10px] text-zinc-500 block">{t('settings.distanceUnit.help')}</span>
                          </div>

                          <select
                            value={effectiveDistanceUnit}
                            onChange={(e) => handleUpdateSettings({ ...settings, distanceUnit: e.target.value as 'km' | 'mi' })}
                            className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] shrink-0"
                          >
                            <option value="km">km</option>
                            <option value="mi">mi</option>
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900/60 pt-4 space-y-3">
                        <div>
                          <span className="text-sm font-bold text-zinc-200 block font-sans">{t('settings.dataPortability')}</span>
                          <span className="text-[10px] text-zinc-500 block">{t('settings.dataPortability.help')}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={handleExportData}
                            className="bg-zinc-950 border border-zinc-800 hover:border-[rgb(var(--accent-700))] text-zinc-300 hover:text-white rounded-xl px-2 py-2 text-[9px] font-black uppercase tracking-wider transition"
                          >
                            {t('settings.exportData')}
                          </button>
                          <button
                            type="button"
                            onClick={() => importFileRef.current?.click()}
                            className="bg-zinc-950 border border-zinc-800 hover:border-[rgb(var(--accent-700))] text-zinc-300 hover:text-white rounded-xl px-2 py-2 text-[9px] font-black uppercase tracking-wider transition"
                          >
                            {t('settings.importData')}
                          </button>
                          <button
                            type="button"
                            onClick={handleExportExerciseCsv}
                            className="bg-zinc-950 border border-zinc-800 hover:border-[rgb(var(--accent-700))] text-zinc-300 hover:text-white rounded-xl px-2 py-2 text-[9px] font-black uppercase tracking-wider transition"
                          >
                            {t('settings.csvHistory')}
                          </button>
                        </div>
                        <input
                          ref={importFileRef}
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (!file) return;
                            handleImportData(file).catch(err => {
                              setAutologMessage(err instanceof Error ? err.message : t('import.failed'));
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── DANGER ZONE ─────────────────────────────────────────── */}
                <div className="border border-red-900/30 bg-red-950/10 p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs font-bold text-red-400 tracking-wider uppercase flex items-center gap-2 font-sans">
                    <Trash2 className="w-4 h-4" /> {t('settings.dangerZone')}
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    {t('settings.danger.help')}
                  </p>
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {t('settings.eraseAllData')}
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Persistent Start Workout Button above tabs */}
          {resumableRoutine && (
            <div className="sticky bottom-16 px-5 py-3 w-full max-w-lg mx-auto z-20">
              <button
                onClick={() => {
                  setActiveRoutine(resumableRoutine);
                  setCurrentScreen('active-session');
                }}
                className="w-full bg-zinc-950/95 border border-zinc-900 border-l-4 border-l-[rgb(var(--accent-500))] rounded-2xl py-3 px-4 shadow-xl shadow-black/40 flex items-center justify-between gap-3 text-left active:scale-[0.99] transition"
              >
                <span className="min-w-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent-500))] animate-pulse shrink-0" />
                  <span className="min-w-0 text-xs font-bold text-zinc-200 truncate">
                    {t('activeWorkout', { name: resumableRoutine.name })}
                  </span>
                  <span className="text-zinc-700 shrink-0">•</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 shrink-0">{formatResumeTime(resumeElapsed)}</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[rgb(var(--accent-300))] shrink-0">
                  {t('resume')} <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          )}

          {activeTab === 'workout' && !resumableRoutine && (
            <div className="sticky bottom-16 bg-zinc-950/95 border-b border-t border-zinc-900/60 backdrop-blur-md px-5 py-3 w-full max-w-lg mx-auto z-20 flex gap-2">
              <button
                onClick={() => {
                  if (selectedWorkoutRoutine && selectedWorkoutHasExercises) {
                    handleStartWorkout(selectedWorkoutRoutine);
                  }
                }}
                disabled={!selectedWorkoutHasExercises}
                className="w-full py-4 bg-gradient-to-r from-[rgb(var(--accent-600))] via-[rgb(var(--accent-500))] to-[rgb(var(--accent-700))] hover:from-[rgb(var(--accent-500))] hover:to-[rgb(var(--accent-600))] text-white rounded-2xl text-xs font-black tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 duration-200 cursor-pointer uppercase disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {/* Play icon vertically centered across BOTH lines of the
                    text column on its right. */}
                <Play className="w-5 h-5 fill-current stroke-0 shrink-0" />
                <span className="flex flex-col items-center leading-tight gap-0.5">
                  <span>{selectedWorkoutHasExercises ? t('startWorkout') : t('startWorkout.empty')}</span>
                  <span className="max-w-[240px] text-[9px] font-bold tracking-normal normal-case text-[rgb(var(--accent-100)/0.8)] truncate">
                    {selectedWorkoutRoutine?.name}
                  </span>
                </span>
              </button>
            </div>
          )}

          {/* Master Bottom iOS style Tab Bar Navigation exactly aligned with Screen 1 */}
          <nav id="bottom-bar-nav" className="sticky bottom-0 bg-zinc-950/95 border-t border-zinc-900/80 backdrop-blur z-30 pt-1.5 pb-2.5 px-4 w-full max-w-lg mx-auto flex items-center justify-around h-16">
            <button
              onClick={() => { setActiveTab('workout'); setCurrentScreen('dashboard'); }}
              aria-label={t('nav.workout')}
              aria-current={activeTab === 'workout' ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'workout' ? 'text-[rgb(var(--accent-300))] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{t('nav.workout')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('history'); setCurrentScreen('dashboard'); }}
              aria-label={t('nav.history')}
              aria-current={activeTab === 'history' ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'history' ? 'text-[rgb(var(--accent-300))] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{t('nav.history')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('progress'); setCurrentScreen('dashboard'); }}
              aria-label={t('nav.progress')}
              aria-current={activeTab === 'progress' ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'progress' ? 'text-[rgb(var(--accent-300))] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{t('nav.progress')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setCurrentScreen('dashboard'); }}
              aria-label={t('nav.settings')}
              aria-current={activeTab === 'settings' ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'settings' ? 'text-[rgb(var(--accent-300))] scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{t('nav.settings')}</span>
            </button>
          </nav>
        </div>
      )}

      {/* POPUP MODAL: WEEKLY SCHEDULER */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="font-extrabold text-white tracking-wide text-base">{t('schedule.configure')}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-zinc-500 hover:text-white" aria-label={t('schedule.close')}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const checkedId = plannedSchedule[day];
                return (
                  <div key={day} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-2xl border border-zinc-900">
                    <span className="text-xs font-bold text-zinc-300">{t(`day.${day}`)}</span>
                    <select
                      value={checkedId || ''}
                      onChange={(e) => handleScheduleRoutine(day, e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-xl focus:outline-none"
                    >
                      <option value="">{t('schedule.restDay')}</option>
                      {routines.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-zinc-900 bg-zinc-950">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-full py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-500))] hover:from-[rgb(var(--accent-500))] hover:to-[rgb(var(--accent-600))] text-white rounded-xl text-xs font-extrabold tracking-wide"
              >
                {t('schedule.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: WORKOUT COMPLETE CELEBRATION */}
      {showCelebration && lastLoggedSession && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-950 border border-[rgb(var(--accent-800)/0.6)] w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative">
            
            {/* Ambient visual sparkle flares */}
            <div className="absolute top-4 left-6 text-[rgb(var(--accent-500))] animate-pulse"><Sparkles className="w-5 h-5" /></div>
            <div className="absolute bottom-8 right-6 text-[rgb(var(--accent-400))] animate-bounce"><Award className="w-6 h-6" /></div>

            <div className="flex flex-col items-center justify-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-[rgb(var(--accent-600)/0.2)] border-2 border-[rgb(var(--accent-500))] flex items-center justify-center text-[rgb(var(--accent-400))] shadow shadow-[rgb(var(--accent-500)/0.5)] animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-white tracking-wide">{t('celebration.title')}</h2>
                <p className="text-xs font-semibold text-[rgb(var(--accent-400))] uppercase tracking-widest">{t('celebration.subtitle')}</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-900 p-3.5 rounded-2xl w-full text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-bold">{t('celebration.routine')}</span>
                  <span className="text-zinc-200 font-black">{lastLoggedSession.routineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-bold">{t('celebration.duration')}</span>
                  <span className="text-zinc-200 font-black font-mono">
                    {t('celebration.minutes', { count: Math.floor(lastLoggedSession.elapsedSeconds / 60) })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-bold">{t('celebration.totalSets')}</span>
                  <span className="text-zinc-200 font-black font-mono">
                    {t('celebration.setsFinished', { count: lastLoggedSession.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0) })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 italic">
                "{t('celebration.quote')}"
              </p>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-4 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-500))] hover:from-[rgb(var(--accent-500))] text-white rounded-2xl text-xs font-extrabold tracking-wider shadow shadow-[rgb(var(--accent-800)/0.5)] transition-all border border-[rgb(var(--accent-500)/0.1)]"
              >
                {t('celebration.continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO-LOGGED SAFETY LIMIT OVERLAY */}
      {autologMessage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="bg-zinc-950 border border-[rgb(var(--accent-800)/0.4)] w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative animate-scale-up space-y-5">
            <div className="w-16 h-16 rounded-full bg-[rgb(var(--accent-600)/0.15)] border border-[rgb(var(--accent-500)/0.2)] text-[rgb(var(--accent-400))] flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight">{t('autolog.title')}</h3>
              <p className="text-[10px] text-[rgb(var(--accent-400))] font-black uppercase tracking-widest">{t('autolog.eyebrow')}</p>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
              {autologMessage}
            </p>

            <button
              onClick={() => setAutologMessage(null)}
              className="w-full py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-500))] hover:from-[rgb(var(--accent-500))] text-white rounded-xl text-xs font-black tracking-widest transition duration-150"
            >
              {t('autolog.acknowledge')}
            </button>
          </div>
        </div>
      )}

      <OnboardingTour
        open={showOnboarding}
        stepIndex={onboardingStep}
        onBack={handleBackOnboarding}
        onNext={handleNextOnboarding}
        onSkip={handleDismissOnboarding}
      />

      <ConfirmModal
        open={showWipeConfirm}
        title={t('confirm.erase.title')}
        eyebrow={t('confirm.erase.eyebrow')}
        message={t('confirm.erase.message')}
        confirmLabel={t('confirm.erase.action')}
        tone="danger"
        onConfirm={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onCancel={() => setShowWipeConfirm(false)}
      />
    </div>
    </LocalizationProvider>
  );
}
