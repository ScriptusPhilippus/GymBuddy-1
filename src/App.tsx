/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routine, Exercise, WorkoutSession, WorkoutSettings } from './types';
import { EXERCISES } from './data/exercises';
import { Dashboard } from './components/Dashboard';
import { ActiveSession } from './components/ActiveSession';
import { ExerciseDetail } from './components/ExerciseDetail';
import { HistoryLog } from './components/HistoryLog';
import { ProgressStats } from './components/ProgressStats';
import { PoseIcon } from './components/PoseIcon';
import { ConfirmModal } from './components/ConfirmModal';
import { ClipboardList, History, Trophy, TrendingUp, Settings, Calendar, Award, CheckCircle, Flame, Dumbbell, Sparkles, ArrowRight, Trash2, X, Play } from 'lucide-react';

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
  const [settings, setSettings] = useState<WorkoutSettings>({
    weightUnit: 'kg',
    defaultRestDuration: 90,
    soundEnabled: true,
    vibrationEnabled: true,
    maxWorkoutDuration: 120
  });

  const [autologMessage, setAutologMessage] = useState<string | null>(null);

  // Calendar Planner Event Mapping State (Weekday -> Routine ID)
  const [plannedSchedule, setPlannedSchedule] = useState<Record<string, string>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Active items mapping
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [activeDetailEx, setActiveDetailEx] = useState<Exercise | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastLoggedSession, setLastLoggedSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [resumableRoutine, setResumableRoutine] = useState<Routine | null>(null);
  const [resumeElapsed, setResumeElapsed] = useState<number>(0);

  // Sync default selected workout blueprint
  useEffect(() => {
    if (routines.length > 0 && !selectedRoutineId) {
      setSelectedRoutineId(routines[0].id);
    }
  }, [routines, selectedRoutineId]);

  // 1. Load starting database from localStorage or seed initial defaults
  useEffect(() => {
    // a. Exercises Custom seeds
    const storedExercises = localStorage.getItem('gym_exercises');
    if (storedExercises) {
      setExercisesList(JSON.parse(storedExercises));
    } else {
      setExercisesList(EXERCISES);
      localStorage.setItem('gym_exercises', JSON.stringify(EXERCISES));
    }

    // b. Workout Settings Setup
    const storedSettings = localStorage.getItem('gym_settings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setSettings(prev => ({
        ...prev,
        ...parsed
      }));
    }

    // c. Scheduled Planner Days
    const storedSchedule = localStorage.getItem('gym_schedule');
    if (storedSchedule) {
      setPlannedSchedule(JSON.parse(storedSchedule));
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
    const storedHistory = localStorage.getItem('gym_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }

    // e. Workout routines
    const storedRoutines = localStorage.getItem('gym_routines');
    if (storedRoutines) {
      setRoutines(JSON.parse(storedRoutines));
    } else {
      // Seed robust default workout plans aligned with PoseIcons
      const defaults: Routine[] = [
        {
          id: 'push-day',
          name: 'Hypertrophy Push Day',
          exercises: [
            { id: 'bp-1', exerciseId: 'bench-press', sets: 4, reps: '6-10' },
            { id: 'op-1', exerciseId: 'overhead-press', sets: 3, reps: '8-10' },
            { id: 'dp-1', exerciseId: 'dip', sets: 3, reps: '8-12' },
            { id: 'lr-1', exerciseId: 'lateral-raise', sets: 4, reps: '12-15' },
            { id: 'cf-1', exerciseId: 'chest-fly', sets: 3, reps: '10-12' }
          ]
        },
        {
          id: 'pull-day',
          name: 'Power Back & Arms',
          exercises: [
            { id: 'pu-1', exerciseId: 'pull-up', sets: 4, reps: '6-10' },
            { id: 'rw-1', exerciseId: 'row', sets: 4, reps: '6-10' },
            { id: 'pd-1', exerciseId: 'pulldown', sets: 3, reps: '8-12' },
            { id: 'cl-1', exerciseId: 'curl', sets: 3, reps: '10-12' },
            { id: 'fp-1', exerciseId: 'face-pull', sets: 3, reps: '12-15' }
          ]
        },
        {
          id: 'leg-day',
          name: 'Leg Complex & Glutes',
          exercises: [
            { id: 'sq-1', exerciseId: 'squat', sets: 4, reps: '6-10' },
            { id: 'dl-1', exerciseId: 'deadlift', sets: 3, reps: '5' },
            { id: 'ht-1', exerciseId: 'hip-thrust', sets: 4, reps: '8-12' },
            { id: 'le-1', exerciseId: 'leg-extension', sets: 3, reps: '12-15' },
            { id: 'cr-1', exerciseId: 'calf-raise', sets: 3, reps: '15-20' }
          ]
        }
      ];
      setRoutines(defaults);
      localStorage.setItem('gym_routines', JSON.stringify(defaults));
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
            
            setAutologMessage(`Your previous workout session on "${savedRoutine.name}" has been completed and saved securely because it reached the maximum workout timer limit of ${maxLimitMinutes} minutes.`);
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
    setSettings(updated);
    localStorage.setItem('gym_settings', JSON.stringify(updated));
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
      setAutologMessage(`Your workout session on "${session.routineName}" was completed and saved because it reached the maximum workout timer limit of ${settings.maxWorkoutDuration || 120} minutes.`);
      setLastLoggedSession(null);
      setShowCelebration(false);
    } else {
      setLastLoggedSession(session);
      setShowCelebration(true); // trigger beautiful fireworks card
    }
  };

  // Open specs sheet
  const handleOpenDetailEx = (ex: Exercise) => {
    setActiveDetailEx(ex);
    setCurrentScreen('exercise-detail');
  };

  // Determine current active scheduled day
  const getTodayPlannedRoutine = () => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdays[new Date().getDay()];
    const plannedId = plannedSchedule[todayName];
    return routines.find(r => r.id === plannedId) || routines[0];
  };

  const activeScheduled = getTodayPlannedRoutine();

  const formatResumeTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative antialiased selection:bg-violet-600 selection:text-white" id="gym-notepad-app">
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-violet-600/10 via-indigo-600/5 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />

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
          onBack={() => setCurrentScreen('dashboard')}
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
              <span className="text-[10px] font-black tracking-widest text-violet-500 uppercase">AESTHETIC FITNESS LOG</span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {activeTab === 'workout' && 'Workout Plan'}
                {activeTab === 'history' && 'Activity Logs'}
                {activeTab === 'progress' && 'Performance Tracker'}
                {activeTab === 'settings' && 'User Settings'}
              </h1>
            </div>

            {/* Scheduler event configuration */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="p-3 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-300 hover:text-violet-400 shadow shadow-black transition-all"
              title="Configure weekly planner schedule"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </header>

          {/* Main layout container */}
          <main className="flex-grow px-5 py-2 overflow-y-auto w-full max-w-lg mx-auto">
            {activeTab === 'workout' && activeScheduled && (
              <div className="space-y-6">
                {/* Active day indicator badge */}
                <div className="bg-gradient-to-r from-violet-950/20 to-zinc-900/40 border border-violet-900/30 p-4 rounded-3xl flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold text-violet-400 uppercase tracking-widest block">Next Scheduled Routine</span>
                    <h3 className="text-sm font-bold text-white tracking-wide">{activeScheduled.name}</h3>
                  </div>
                  {!resumableRoutine && (
                    <button
                      onClick={() => handleStartWorkout(activeScheduled)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 rounded-xl text-xs font-bold text-white shadow shadow-violet-950/40 active:scale-95 transition-all"
                    >
                      Start <ArrowRight className="w-3.5 h-3.5" />
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
                  onOpenCalendarPlanner={() => setShowScheduleModal(true)}
                  selectedRoutineId={selectedRoutineId}
                  onSelectRoutineId={setSelectedRoutineId}
                  activeTab={dashboardSubTab}
                  onActiveTabChange={setDashboardSubTab}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <HistoryLog
                history={history}
                exercisesList={exercisesList}
                weightUnit={settings.weightUnit}
                onDeleteSession={handleDeleteSession}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressStats
                history={history}
                exercisesList={exercisesList}
                weightUnit={settings.weightUnit}
              />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-lg mx-auto w-full pb-12">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Log Preferences</h2>
                  <span className="text-[10px] text-zinc-400 font-medium font-sans">Fine-tune training variables</span>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-5 divide-y divide-zinc-900/60">
                  {/* 1. Unit layout toggles */}
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">Weight Unit</span>
                      <span className="text-[10px] text-zinc-500 block">Choose globally displayed unit</span>
                    </div>
                    
                    <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-xl text-xs">
                      <button
                        onClick={() => handleUpdateSettings({ ...settings, weightUnit: 'kg' })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          settings.weightUnit === 'kg' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        KG
                      </button>
                      <button
                        onClick={() => handleUpdateSettings({ ...settings, weightUnit: 'lbs' })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          settings.weightUnit === 'lbs' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        LBS
                      </button>
                    </div>
                  </div>

                  {/* 2. Rest timer variables */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block font-sans">Rest Timer Countdown</span>
                      <span className="text-[10px] text-zinc-500 block">Suggested duration between completed sets</span>
                    </div>
                    
                    <select
                      value={settings.defaultRestDuration}
                      onChange={(e) => handleUpdateSettings({ ...settings, defaultRestDuration: parseInt(e.target.value) })}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none"
                    >
                      <option value={45}>45 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                      <option value={120}>2 minutes</option>
                      <option value={180}>3 minutes</option>
                    </select>
                  </div>

                  {/* Max Workout Session Duration Limiter */}
                  <div className="flex items-center justify-between py-4 border-t border-zinc-900/60 font-sans">
                    <div>
                      <span className="text-sm font-bold text-zinc-200 block">Max Session Duration Limit</span>
                      <span className="text-[10px] text-zinc-500 block">Autologs session to prevent forgot-to-close runs</span>
                    </div>
                    
                    <select
                      value={settings.maxWorkoutDuration || 120}
                      onChange={(e) => handleUpdateSettings({ ...settings, maxWorkoutDuration: parseInt(e.target.value) })}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-violet-600"
                    >
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>

                  {/* 3. Feedback indicators */}
                  <div className="space-y-4 pt-4">
                    <span className="text-xs font-bold uppercase text-zinc-500 tracking-widest font-sans">Sound & Vibration Feedback</span>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-300 block font-semibold">Sound Alerts</span>
                        <span className="text-[10px] text-zinc-500 block">Chime at completed rest timers</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => handleUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                        className="rounded border-zinc-800 text-violet-600 focus:ring-violet-600 bg-zinc-950 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between font-sans">
                      <div>
                        <span className="text-xs text-zinc-300 block font-semibold">Vibrational Alerts</span>
                        <span className="text-[10px] text-zinc-500 block">Haptic feedback on checklist ticking</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.vibrationEnabled}
                        onChange={(e) => handleUpdateSettings({ ...settings, vibrationEnabled: e.target.checked })}
                        className="rounded border-zinc-800 text-violet-600 focus:ring-violet-600 bg-zinc-950 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Database clear variables */}
                <div className="border border-red-900/30 bg-red-950/10 p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs font-bold text-red-400 tracking-wider uppercase flex items-center gap-2 font-sans">
                    <Trash2 className="w-4 h-4" /> Danger Zone
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    Once cleared, all custom workout blueprints, history logs, and profile records will be permanently erased.
                  </p>
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Wipe Database Logs
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
                className="w-full bg-zinc-950/95 border border-zinc-900 border-l-4 border-l-violet-500 rounded-2xl py-3 px-4 shadow-xl shadow-black/40 flex items-center justify-between gap-3 text-left active:scale-[0.99] transition"
              >
                <span className="min-w-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
                  <span className="min-w-0 text-xs font-bold text-zinc-200 truncate">
                    Active workout: {resumableRoutine.name}
                  </span>
                  <span className="text-zinc-700 shrink-0">•</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 shrink-0">{formatResumeTime(resumeElapsed)}</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-violet-300 shrink-0">
                  Resume <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          )}

          {activeTab === 'workout' && !resumableRoutine && (
            <div className="sticky bottom-16 bg-zinc-950/95 border-b border-t border-zinc-900/60 backdrop-blur-md px-5 py-3 w-full max-w-lg mx-auto z-20 flex gap-2">
              <button
                onClick={() => {
                  const targetRoutine = routines.find(r => r.id === selectedRoutineId) || activeScheduled || routines[0];
                  if (targetRoutine) {
                    handleStartWorkout(targetRoutine);
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black tracking-widest shadow-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 duration-200 cursor-pointer uppercase"
              >
                <span className="flex items-center justify-center gap-2 leading-tight">
                  <Play className="w-4 h-4 fill-current stroke-0 shrink-0" />
                  <span>START WORKOUT</span>
                </span>
                <span className="max-w-[260px] text-[9px] font-bold tracking-normal normal-case text-violet-100/80 truncate">
                  {(routines.find(r => r.id === selectedRoutineId) || activeScheduled || routines[0])?.name}
                </span>
              </button>
            </div>
          )}

          {/* Master Bottom iOS style Tab Bar Navigation exactly aligned with Screen 1 */}
          <nav id="bottom-bar-nav" className="sticky bottom-0 bg-zinc-950/95 border-t border-zinc-900/80 backdrop-blur z-30 pt-1.5 pb-2.5 px-4 w-full max-w-lg mx-auto flex items-center justify-around h-16">
            <button
              onClick={() => { setActiveTab('workout'); setCurrentScreen('dashboard'); }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'workout' ? 'text-violet-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">Workout</span>
            </button>

            <button
              onClick={() => { setActiveTab('history'); setCurrentScreen('dashboard'); }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'history' ? 'text-violet-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">History</span>
            </button>

            <button
              onClick={() => { setActiveTab('progress'); setCurrentScreen('dashboard'); }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'progress' ? 'text-violet-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">Progress</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setCurrentScreen('dashboard'); }}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 text-center flex-1 transition-all ${
                activeTab === 'settings' ? 'text-violet-400 scale-105 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">Settings</span>
            </button>
          </nav>
        </div>
      )}

      {/* POPUP MODAL: WEEKLY SCHEDULER */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="font-extrabold text-white tracking-wide text-base">Configure Weekly Schedule</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const checkedId = plannedSchedule[day];
                return (
                  <div key={day} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-2xl border border-zinc-900">
                    <span className="text-xs font-bold text-zinc-300">{day}</span>
                    <select
                      value={checkedId || ''}
                      onChange={(e) => handleScheduleRoutine(day, e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-xl focus:outline-none"
                    >
                      <option value="">Rest Day</option>
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
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold tracking-wide"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: WORKOUT COMPLETE CELEBRATION */}
      {showCelebration && lastLoggedSession && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-950 border border-violet-800/60 w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative">
            
            {/* Ambient visual sparkle flares */}
            <div className="absolute top-4 left-6 text-violet-500 animate-pulse"><Sparkles className="w-5 h-5" /></div>
            <div className="absolute bottom-8 right-6 text-indigo-500 animate-bounce"><Award className="w-6 h-6" /></div>

            <div className="flex flex-col items-center justify-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500 flex items-center justify-center text-violet-400 shadow shadow-violet-500/50 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-white tracking-wide">Awesome Job!</h2>
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">WORKOUT RECORDED SUCCESSFULLY</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-900 p-3.5 rounded-2xl w-full text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-bold">Routine:</span>
                  <span className="text-zinc-200 font-black">{lastLoggedSession.routineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-bold">Gym Duration:</span>
                  <span className="text-zinc-200 font-black font-mono">
                    {Math.floor(lastLoggedSession.elapsedSeconds / 60)} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-bold">Total Sets:</span>
                  <span className="text-zinc-200 font-black font-mono">
                    {lastLoggedSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} sets finished
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 italic">
                "Small consistencies lead to great physical bounds."
              </p>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white rounded-2xl text-xs font-extrabold tracking-wider shadow shadow-violet-800/50 transition-all border border-violet-500/10"
              >
                CONTINUE TRACKING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO-LOGGED SAFETY LIMIT OVERLAY */}
      {autologMessage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="bg-zinc-950 border border-violet-800/40 w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative animate-scale-up space-y-5">
            <div className="w-16 h-16 rounded-full bg-violet-600/15 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight">Session Auto-Logged</h3>
              <p className="text-[10px] text-violet-400 font-black uppercase tracking-widest">Forgot-to-Close Preventer</p>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
              {autologMessage}
            </p>

            <button
              onClick={() => setAutologMessage(null)}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white rounded-xl text-xs font-black tracking-widest transition duration-150"
            >
              ACKNOWLEDGE LOG
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showWipeConfirm}
        title="Wipe Database?"
        eyebrow="Danger Zone"
        message="This permanently clears your entire history, workout routines, exercise database, schedule, and local settings."
        confirmLabel="Wipe Everything"
        tone="danger"
        onConfirm={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onCancel={() => setShowWipeConfirm(false)}
      />
    </div>
  );
}
