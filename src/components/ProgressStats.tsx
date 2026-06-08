/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useContext } from 'react';
import { WorkoutSession, Exercise, MuscleGroup, BodyWeightEntry } from '../types';
import { AnatomyModel, heatColor } from './AnatomyModel';
import { Modal } from './Modal';
import { Sparkles, BarChart2, Zap, Flame, Calendar, Award, TrendingUp, Activity, Scale, Plus, MapPin, Timer, Trash2, HelpCircle, Search, X, ChevronDown, Check } from 'lucide-react';
import { distanceUnitFor, getUnitTraits, kmToDisplay, resolveDistanceSystem } from '../data/unit-traits';
import { getCategoryTheme } from '../data/category-theme';
import { categoryLabel, equipmentLabel, muscleLabel } from '../data/localization';
import { useI18n } from '../i18n';

// Color semantics for this screen:
// - accent vars stay on chrome: section icons, toggles, buttons, and focus rings.
// - fixed data-viz colors stay on metrics/charts so hue changes never merge series.
// - heatColor is reserved for anatomical load intensity, independent of category colors.
// When false (Helper Descriptions off in Settings) SectionInfo hides its
// constant subtitle but keeps the on-demand "?" detail toggle. A context keeps
// it prop-drill-free and ready for a future global "Minimalist mode".
const HelpTextContext = React.createContext(true);

type LoadWindow = '7d' | '30d' | 'all';

const LOAD_WINDOWS: Array<{ id: LoadWindow; label: string }> = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: 'all', label: 'All' },
];

const ALL_MUSCLES: MuscleGroup[] = [
  'chest', 'lats', 'traps', 'front-delts', 'side-delts', 'rear-delts',
  'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lower-back',
  'glutes', 'quads', 'hamstrings', 'calves'
];

const LOAD_REGIONS = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'] as const;

const formatMuscleLabel = (muscle: MuscleGroup) =>
  muscle.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

interface ProgressStatsProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  weightUnit: 'kg' | 'lbs';
  distanceUnit?: 'km' | 'mi';
  bodyWeightLog: BodyWeightEntry[];
  onUpdateBodyWeight: (entries: BodyWeightEntry[]) => void;
  showHelpText?: boolean;
}

const shouldShowChartLabel = (totalPoints: number, index: number) => {
  if (totalPoints <= 6) return true;
  const stride = Math.ceil(totalPoints / 6);
  return index === 0 || index === totalPoints - 1 || index % stride === 0;
};

interface SectionInfoProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  detail?: string;
  trailing?: React.ReactNode;
}

const SectionInfo: React.FC<SectionInfoProps> = ({ icon, title, subtitle, detail, trailing }) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const showSubtitle = useContext(HelpTextContext);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="shrink-0 mt-0.5">{icon}</span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 leading-snug">{title}</h3>
            {showSubtitle && <p className="text-[10px] text-zinc-500 leading-snug">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {trailing}
          {detail && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              aria-label={expanded ? t('progress.section.hideExplanation', { title }) : t('progress.section.showExplanation', { title })}
              aria-expanded={expanded}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                expanded
                  ? 'border-[rgb(var(--accent-500)/0.45)] bg-[rgb(var(--accent-600)/0.15)] text-[rgb(var(--accent-300))]'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {expanded && detail && (
        <p className="rounded-2xl border border-zinc-900 bg-zinc-950/35 px-3 py-2 text-[10px] leading-relaxed text-zinc-400">
          {detail}
        </p>
      )}
    </div>
  );
};

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  history,
  exercisesList,
  weightUnit,
  distanceUnit: preferredDistanceUnit,
  bodyWeightLog,
  onUpdateBodyWeight,
  showHelpText = true
}) => {
  const { t } = useI18n();
  const [muscleView, setMuscleView] = useState<'front' | 'back'>('front');
  const [selected1rmExercise, setSelected1rmExercise] = useState<string>('');
  const [show1rmPicker, setShow1rmPicker] = useState(false);
  const [oneRmSearch, setOneRmSearch] = useState('');
  const [bwInput, setBwInput] = useState('');
  const [loadWindow, setLoadWindow] = useState<LoadWindow>('30d');
  const [selectedLoadMuscle, setSelectedLoadMuscle] = useState<MuscleGroup | null>(null);
  const [showAllMuscles, setShowAllMuscles] = useState(false);

  // Multi-dimensional Stats calculation
  const stats = useMemo(() => {
    let totalWorkouts = history.length;
    let totalSets = 0;
    let totalWeightHoisted = 0;
    let totalActiveSecs = 0;
    // Cardio aggregates (J): distance is stored in km, duration in minutes.
    let totalCardioDistance = 0;
    let totalCardioMinutes = 0;
    let cardioSessions = 0;
    let longestRun = 0;

    // Map of muscle loads (how many times a muscle has been hit)
    const muscleHits: Record<MuscleGroup, number> = {
      chest: 0, lats: 0, traps: 0, 'front-delts': 0, 'side-delts': 0, 'rear-delts': 0,
      biceps: 0, triceps: 0, forearms: 0, abs: 0, obliques: 0,
      'lower-back': 0, glutes: 0, quads: 0, hamstrings: 0, calves: 0
    };

    history.forEach(session => {
      totalActiveSecs += session.elapsedSeconds;
      let sessionHadCardio = false;

      session.exercises.forEach(se => {
        // Find matched exercise
        const ex = exercisesList.find(e => e.id === se.exerciseId);
        const completedSetsInExercise = se.sets.filter(s => s.completed);

        totalSets += completedSetsInExercise.length;

        // Calculate load hits
        if (ex && completedSetsInExercise.length > 0) {
          const multiplier = completedSetsInExercise.length;

          ex.primaryMuscles.forEach(m => {
            if (m in muscleHits) muscleHits[m] += multiplier * 2; // primary counts double
          });
          ex.secondaryMuscles.forEach(m => {
            if (m in muscleHits) muscleHits[m] += multiplier;
          });
        }

        completedSetsInExercise.forEach(set => {
          // A cardio set carries a distance and/or duration; everything else
          // is a strength set that contributes to total weight hoisted.
          const isCardio = set.distance != null || set.durationMinutes != null;
          if (isCardio) {
            sessionHadCardio = true;
            if (set.distance != null) {
              totalCardioDistance += set.distance;
              if (set.distance > longestRun) longestRun = set.distance;
            }
            if (set.durationMinutes != null) totalCardioMinutes += set.durationMinutes;
          } else {
            totalWeightHoisted += (set.weight * set.reps);
          }
        });
      });

      if (sessionHadCardio) cardioSessions++;
    });

    // Determine the most worked muscle
    let topMuscle: MuscleGroup = 'chest';
    let maxHits = 0;
    (Object.keys(muscleHits) as MuscleGroup[]).forEach(m => {
      if (muscleHits[m] > maxHits) {
        maxHits = muscleHits[m];
        topMuscle = m;
      }
    });

    const activeMins = Math.round(totalActiveSecs / 60);

    return {
      totalWorkouts,
      totalSets,
      totalWeightHoisted,
      activeMins,
      muscleHits,
      topMuscle: maxHits > 0 ? topMuscle : null,
      totalCardioDistance,
      totalCardioMinutes,
      cardioSessions,
      longestRun
    };
  }, [history, exercisesList]);

  const distanceSystem = resolveDistanceSystem(preferredDistanceUnit, weightUnit);
  const distanceUnit = distanceUnitFor(distanceSystem);
  const distanceLabel = getUnitTraits(distanceUnit).shortLabel;
  const totalDistanceDisplay = kmToDisplay(stats.totalCardioDistance, distanceSystem);
  const longestDistanceDisplay = kmToDisplay(stats.longestRun, distanceSystem);
  const averageDistanceDisplay = stats.cardioSessions > 0
    ? kmToDisplay(stats.totalCardioDistance / stats.cardioSessions, distanceSystem)
    : 0;

  const loadAnalysis = useMemo(() => {
    const now = Date.now();
    const windowStart = loadWindow === 'all'
      ? 0
      : now - (loadWindow === '7d' ? 7 : 30) * 86400000;
    const exerciseById = new Map(exercisesList.map(ex => [ex.id, ex]));
    const muscleHits = Object.fromEntries(ALL_MUSCLES.map(m => [m, 0])) as Record<MuscleGroup, number>;
    const contributorMaps = new Map<MuscleGroup, Map<string, number>>();
    const regionHits = Object.fromEntries(LOAD_REGIONS.map(region => [region, 0])) as Record<typeof LOAD_REGIONS[number], number>;
    let totalLoadPoints = 0;
    let completedSetsInWindow = 0;

    ALL_MUSCLES.forEach(m => contributorMaps.set(m, new Map<string, number>()));

    history
      .filter(session => session.startTime >= windowStart)
      .forEach(session => {
        session.exercises.forEach(se => {
          const ex = exerciseById.get(se.exerciseId);
          if (!ex) return;
          const completedSets = se.sets.filter(set => set.completed).length;
          if (completedSets === 0) return;
          completedSetsInWindow += completedSets;

          let exercisePoints = 0;
          const addMuscle = (muscle: MuscleGroup, weight: number) => {
            const points = completedSets * weight;
            muscleHits[muscle] += points;
            totalLoadPoints += points;
            exercisePoints += points;
            const existing = contributorMaps.get(muscle) || new Map<string, number>();
            existing.set(ex.name, (existing.get(ex.name) || 0) + completedSets);
            contributorMaps.set(muscle, existing);
          };

          ex.primaryMuscles.forEach(m => addMuscle(m, 2));
          ex.secondaryMuscles.forEach(m => addMuscle(m, 1));

          if (ex.category !== 'cardio' && ex.category in regionHits) {
            regionHits[ex.category as keyof typeof regionHits] += exercisePoints;
          }
        });
      });

    const maxHits = Math.max(...Object.values(muscleHits), 0);
    const intensities = Object.fromEntries(
      ALL_MUSCLES.map(m => [m, maxHits > 0 ? muscleHits[m] / maxHits : 0])
    ) as Record<MuscleGroup, number>;
    const rankedMuscles = ALL_MUSCLES
      .map(muscle => ({
        muscle,
        points: muscleHits[muscle],
        pct: totalLoadPoints > 0 ? (muscleHits[muscle] / totalLoadPoints) * 100 : 0,
        intensity: intensities[muscle],
        contributors: [...(contributorMaps.get(muscle) || new Map<string, number>()).entries()]
          .map(([exerciseName, sets]) => ({ exerciseName, sets }))
          .sort((a, b) => b.sets - a.sets || a.exerciseName.localeCompare(b.exerciseName))
      }))
      .sort((a, b) => b.points - a.points || a.muscle.localeCompare(b.muscle));

    const activeRegions = LOAD_REGIONS
      .map(region => ({ region, points: regionHits[region] }))
      .filter(region => region.points > 0)
      .sort((a, b) => b.points - a.points);
    // Purely descriptive most/least summary (no target, no "balance" verdict).
    const balanceInsight = completedSetsInWindow >= 4 && activeRegions.length >= 2
      ? t('progress.loadInsight', {
          most: categoryLabel(t, activeRegions[0].region),
          least: categoryLabel(t, activeRegions[activeRegions.length - 1].region)
        })
      : null;

    return {
      muscleHits,
      totalLoadPoints,
      completedSetsInWindow,
      intensities,
      rankedMuscles,
      balanceInsight
    };
  }, [history, loadWindow, exercisesList, t]);

  const selectedLoadDetail = selectedLoadMuscle
    ? loadAnalysis.rankedMuscles.find(item => item.muscle === selectedLoadMuscle)
    : null;

  // Generate coordinates for SVG connected training volume chart
  const volumeChartData = useMemo(() => {
    // Take up to previous 8 completed sessions in chronological alignment
    const sorted = [...history]
      .sort((a, b) => a.startTime - b.startTime)
      .slice(-8);

    const points = sorted.map(session => {
      let vol = 0;
      session.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) vol += (s.weight * s.reps);
        });
      });
      return {
        label: new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: vol
      };
    });

    return points;
  }, [history]);

  const maxVolumeVal = useMemo(() => {
    const vals = volumeChartData.map(d => d.value);
    return Math.max(...vals, 1000);
  }, [volumeChartData]);

  // ── Estimated 1RM trend (B) ─────────────────────────────────────────────
  // Exercises with at least one completed strength set, most-recent activity
  // first, so the picker surfaces the lifts actually worth charting.
  const strengthExerciseOptions = useMemo(() => {
    const lastSeen = new Map<string, number>();
    history.forEach(s => {
      s.exercises.forEach(se => {
        const hasStrength = se.sets.some(
          set => set.completed && set.distance == null && set.durationMinutes == null && set.weight > 0
        );
        if (hasStrength) {
          lastSeen.set(se.exerciseId, Math.max(lastSeen.get(se.exerciseId) || 0, s.startTime));
        }
      });
    });
    return [...lastSeen.entries()]
      .map(([id, lastSeenAt]) => ({
        id,
        lastSeenAt,
        exercise: exercisesList.find(ex => ex.id === id)
      }))
      .filter((item): item is { id: string; lastSeenAt: number; exercise: Exercise } => !!item.exercise)
      .sort((a, b) => b.lastSeenAt - a.lastSeenAt || a.exercise.name.localeCompare(b.exercise.name));
  }, [history, exercisesList]);

  const strengthExerciseIds = useMemo(
    () => strengthExerciseOptions.map(option => option.id),
    [strengthExerciseOptions]
  );

  const filtered1rmOptions = useMemo(() => {
    const q = oneRmSearch.trim().toLowerCase();
    if (!q) return strengthExerciseOptions;
    return strengthExerciseOptions.filter(({ exercise }) => {
      const muscleStr = [...exercise.primaryMuscles, ...exercise.secondaryMuscles]
        .join(' ')
        .replace(/-/g, ' ')
        .toLowerCase();
      return exercise.name.toLowerCase().includes(q)
        || exercise.category.toLowerCase().includes(q)
        || muscleStr.includes(q);
    });
  }, [oneRmSearch, strengthExerciseOptions]);

  const effective1rmId = selected1rmExercise && strengthExerciseIds.includes(selected1rmExercise)
    ? selected1rmExercise
    : (strengthExerciseIds[0] || '');

  // Epley estimate: w × (1 + reps/30). One best estimate per session.
  const oneRmTrend = useMemo(() => {
    if (!effective1rmId) return [] as { label: string; value: number }[];
    return [...history]
      .sort((a, b) => a.startTime - b.startTime)
      .map(session => {
        let best = 0;
        session.exercises
          .filter(se => se.exerciseId === effective1rmId)
          .forEach(se => {
            se.sets.forEach(set => {
              if (set.completed && set.distance == null && set.durationMinutes == null && set.weight > 0 && set.reps > 0) {
                const est = set.weight * (1 + set.reps / 30);
                if (est > best) best = est;
              }
            });
          });
        return best > 0
          ? { label: new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: Math.round(best) }
          : null;
      })
      .filter((p): p is { label: string; value: number } => p !== null);
  }, [history, effective1rmId]);

  // Cap the plotted series so dense histories stay readable; keep the full
  // series for the all-time best callout.
  const oneRmChart = useMemo(() => oneRmTrend.slice(-10), [oneRmTrend]);
  const max1rmVal = useMemo(() => Math.max(...oneRmChart.map(d => d.value), 1), [oneRmChart]);
  const allTimeBest1rm = useMemo(() => Math.max(...oneRmTrend.map(d => d.value), 0), [oneRmTrend]);

  // ── Body-weight log (Q) ─────────────────────────────────────────────────
  const bodyWeightSorted = useMemo(
    () => [...bodyWeightLog].sort((a, b) => a.date - b.date),
    [bodyWeightLog]
  );
  const bwChart = useMemo(
    () => bodyWeightSorted.slice(-12).map(e => ({
      label: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: e.weight
    })),
    [bodyWeightSorted]
  );
  const bwBounds = useMemo(() => {
    const vals = bwChart.map(d => d.value);
    if (vals.length === 0) return { min: 0, max: 1 };
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    // Pad so a near-flat line isn't crushed against the axis.
    const pad = Math.max((max - min) * 0.15, 1);
    return { min: min - pad, max: max + pad };
  }, [bwChart]);

  const latestBodyWeight = bodyWeightSorted[bodyWeightSorted.length - 1];
  const prevBodyWeight = bodyWeightSorted[bodyWeightSorted.length - 2];
  const bodyWeightDelta = latestBodyWeight && prevBodyWeight
    ? +(latestBodyWeight.weight - prevBodyWeight.weight).toFixed(1)
    : null;

  const handleAddBodyWeight = () => {
    const val = parseFloat(bwInput);
    if (!val || val <= 0) return;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTs = now.getTime();
    // One entry per day — replace today's if it already exists.
    const withoutToday = bodyWeightLog.filter(e => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() !== todayTs;
    });
    onUpdateBodyWeight([
      ...withoutToday,
      { id: `bw-${Date.now()}`, date: todayTs, weight: +val.toFixed(1) }
    ]);
    setBwInput('');
  };

  const handleRemoveBodyWeight = (id: string) => {
    onUpdateBodyWeight(bodyWeightLog.filter(e => e.id !== id));
  };

  // Pretty-print a minutes total as "Xh Ym" / "Ym Zs" / "Z sec".
  const formatDuration = (mins: number) => {
    const totalSeconds = Math.round(mins * 60);
    if (totalSeconds < 60) return `${totalSeconds} sec`;
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m < 60) return s === 0 ? `${m} min` : `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r === 0 ? `${h}h` : `${h}h ${r}m`;
  };

  const oneRmExerciseName = (id: string) => exercisesList.find(e => e.id === id)?.name || t('dashboard.exercises');
  const localizedMuscleLabel = (muscle: MuscleGroup) => muscleLabel(t, muscle);
  const hasWorkoutProgress = history.length > 0;

  return (
    <HelpTextContext.Provider value={showHelpText}>
    <div id="progress-stats-page" className="space-y-6 max-w-lg mx-auto w-full pb-12">
      
      {/* Overview numeric metric grids */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.totalLifted')}</span>
            <span className="text-xl font-black text-white">{stats.totalWeightHoisted.toLocaleString()} <span className="text-xs font-semibold text-zinc-500">{weightUnit}</span></span>
          </div>
          <span className="absolute -bottom-1 -right-1 text-zinc-950 stroke-zinc-900 font-bold select-none text-4xl -z-10">{weightUnit.toUpperCase()}</span>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <Flame className="w-5 h-5 text-rose-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.loggedGymDays')}</span>
            <span className="text-xl font-black text-white">{stats.totalWorkouts} <span className="text-xs font-semibold text-zinc-500">{t('unit.sessions')}</span></span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <Zap className="w-5 h-5 text-violet-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.setsLogged')}</span>
            <span className="text-xl font-black text-white">{stats.totalSets} <span className="text-xs font-semibold text-zinc-500">{t('unit.sets')}</span></span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <BarChart2 className="w-5 h-5 text-sky-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.gymMinutes')}</span>
            <span className="text-xl font-black text-white">{stats.activeMins} <span className="text-xs font-semibold text-zinc-500">{t('unit.mins')}</span></span>
          </div>
        </div>
      </div>

      {!hasWorkoutProgress ? (
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[rgb(var(--accent-400))]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white tracking-tight">{t('progress.emptyTitle')}</h3>
            {showHelpText && (
              <p className="text-xs text-zinc-500 leading-relaxed">
                {t('progress.emptyHelp')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Cardio output summary (J) */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <SectionInfo
          icon={<Activity className="w-4 h-4 text-[rgb(var(--accent-400))]" />}
          title={t('progress.cardioOutput')}
          subtitle={t('progress.cardio.subtitle')}
          detail={t('progress.cardio.detail')}
          trailing={<span className="text-[10px] tracking-wide text-zinc-500 uppercase font-semibold">{stats.cardioSessions} {t('unit.sessions')}</span>}
        />

        {stats.cardioSessions === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-2xl text-center p-4">
            <MapPin className="w-6 h-6 text-zinc-700" />
            <span className="text-xs text-zinc-500 mt-2">{t('progress.cardio.empty')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.totalDistance')}</span>
              <span className="text-lg font-black text-white">{totalDistanceDisplay.toFixed(1)} <span className="text-xs font-semibold text-zinc-500">{distanceLabel}</span></span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Timer className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.totalTime')}</span>
              <span className="text-lg font-black text-white">{formatDuration(stats.totalCardioMinutes)}</span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.longestDistance')}</span>
              <span className="text-lg font-black text-white">{longestDistanceDisplay.toFixed(1)} <span className="text-xs font-semibold text-zinc-500">{distanceLabel}</span></span>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-1">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('progress.avgSession')}</span>
              <span className="text-lg font-black text-white">{averageDistanceDisplay.toFixed(1)} <span className="text-xs font-semibold text-zinc-500">{distanceLabel}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Muscle Heat Accumulator layout */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <SectionInfo
          icon={<Sparkles className="w-4 h-4 text-[rgb(var(--accent-400))]" />}
          title={t('progress.anatomicalLoad')}
          subtitle={t('progress.load.subtitle')}
          detail={t('progress.load.detail')}
          trailing={(
            <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-full text-[10px]">
              {LOAD_WINDOWS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setLoadWindow(option.id);
                    setSelectedLoadMuscle(null);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    loadWindow === option.id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        />

        <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-full text-[10px] w-fit">
          <button
            type="button"
            onClick={() => setMuscleView('front')}
            className={`px-3 py-1 rounded-full transition-all ${
              muscleView === 'front' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t('progress.front')}
          </button>
          <button
            type="button"
            onClick={() => setMuscleView('back')}
            className={`px-3 py-1 rounded-full transition-all ${
              muscleView === 'back' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t('progress.back')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 items-stretch">
          {/* LEFT: body model + continuous legend underneath */}
          <div className="flex flex-col gap-2">
            <div className="w-full flex-1 min-h-[240px] p-2 bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden flex items-center justify-center relative">
              <AnatomyModel
                primaryMuscles={[]}
                secondaryMuscles={[]}
                intensities={loadAnalysis.intensities}
                interactive
                onMuscleClick={setSelectedLoadMuscle}
                selectedView={muscleView}
                className="w-full border-none p-0 bg-transparent scale-110"
              />
            </div>
            <div className="space-y-1">
              {/* Continuous least→most ramp (blue → fuchsia), same as the body fill. */}
              <div
                className="h-2 rounded-full border border-zinc-900"
                style={{ background: 'linear-gradient(to right, #3b82f6, #ec4899)' }}
              />
              <div className="flex justify-between text-[9px] uppercase tracking-wider text-zinc-600 font-bold">
                <span>{t('progress.least')}</span>
                <span>{t('progress.most')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: top dominant muscles, sized to the model (no inner scroll) */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{t('progress.dominant')}</h4>
              <span className="text-[9px] font-mono text-zinc-600">{loadAnalysis.totalLoadPoints} {t('progress.points')}</span>
            </div>
            {loadAnalysis.totalLoadPoints === 0 ? (
              <span className="text-xs text-zinc-500 block">{t('progress.load.empty')}</span>
            ) : (
              <div className="flex-1 flex flex-col justify-between gap-1.5">
                {loadAnalysis.rankedMuscles
                  .filter(item => item.points > 0)
                  .slice(0, 5)
                  .map(item => (
                    <button
                      key={item.muscle}
                      type="button"
                      onClick={() => setSelectedLoadMuscle(item.muscle)}
                      className={`w-full text-left space-y-1 rounded-xl px-2 py-1.5 transition ${
                        selectedLoadMuscle === item.muscle ? 'bg-zinc-950 border border-zinc-800' : 'hover:bg-zinc-950/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-semibold text-zinc-300 truncate">{localizedMuscleLabel(item.muscle)}</span>
                        <span className="font-mono shrink-0 leading-none">
                          <span className="text-xs font-black text-white">{item.pct.toFixed(0)}%</span>
                          <span className="text-[9px] text-zinc-500 ml-0.5">{item.points}{t('progress.points')}</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(3, item.intensity * 100)}%`, backgroundColor: heatColor(item.intensity) }}
                        />
                      </div>
                    </button>
                  ))}
              </div>
            )}
            {loadAnalysis.totalLoadPoints > 0 && (
              <button
                type="button"
                onClick={() => setShowAllMuscles(true)}
                className="mt-2 self-start text-[9px] font-black uppercase tracking-widest text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))] transition"
              >
                {t('progress.viewAllMuscles')} →
              </button>
            )}
          </div>
        </div>

        {/* Selected muscle — full width below both columns, with its own load bar */}
        {selectedLoadDetail && (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-4 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-black text-zinc-100">{localizedMuscleLabel(selectedLoadDetail.muscle)}</h4>
                <p className="text-[10px] text-zinc-500">
                  {t('progress.selectedLoadSummary', {
                    sets: selectedLoadDetail.contributors.reduce((sum, item) => sum + item.sets, 0),
                    percent: selectedLoadDetail.pct.toFixed(1)
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLoadMuscle(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition shrink-0"
                aria-label={t('progress.closeMuscleDetail')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(3, selectedLoadDetail.intensity * 100)}%`, backgroundColor: heatColor(selectedLoadDetail.intensity) }}
              />
            </div>
            {selectedLoadDetail.contributors.length > 0 ? (
              <div className="space-y-1.5">
                {selectedLoadDetail.contributors.map(item => (
                  <div key={item.exerciseName} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-zinc-300 font-semibold truncate">{item.exerciseName}</span>
                    <span className="text-zinc-500 font-mono shrink-0">{item.sets} {t('unit.sets')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500">{t('progress.noMuscleSets')}</p>
            )}
          </div>
        )}

        {loadAnalysis.balanceInsight && (
          <p className="text-[10px] leading-relaxed text-zinc-500 text-center">{loadAnalysis.balanceInsight}</p>
        )}

        {/* View-all-muscles deep dive */}
        {showAllMuscles && (
          <Modal
            open={showAllMuscles}
            onClose={() => setShowAllMuscles(false)}
            className="max-w-md max-h-[85vh] flex flex-col"
            labelledBy="all-muscles-title"
          >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
                <div>
                  <h3 id="all-muscles-title" className="text-sm font-black text-white">{t('progress.allMuscles')}</h3>
                  <p className="text-[10px] text-zinc-500">{t('progress.allMuscles.subtitle', { window: LOAD_WINDOWS.find(w => w.id === loadWindow)?.label || '' })}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllMuscles(false)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
                  aria-label={t('progress.closeAllMuscles')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                {loadAnalysis.rankedMuscles.map(item => (
                  <button
                    key={item.muscle}
                    type="button"
                    onClick={() => { setSelectedLoadMuscle(item.muscle); setShowAllMuscles(false); }}
                    className="w-full text-left space-y-1 rounded-xl px-2 py-2 hover:bg-zinc-900/50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-300">{localizedMuscleLabel(item.muscle)}</span>
                      <span className="font-mono shrink-0">
                        <span className="text-sm font-black text-white">{item.pct.toFixed(1)}%</span>
                        <span className="text-[10px] text-zinc-500 ml-1">{item.points} {t('progress.points')}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.intensity > 0 ? Math.max(3, item.intensity * 100) : 0}%`, backgroundColor: item.intensity > 0 ? heatColor(item.intensity) : 'transparent' }}
                      />
                    </div>
                  </button>
                ))}
              </div>
          </Modal>
        )}
      </div>

      {/* Training volume progression chart */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <SectionInfo
          icon={<Calendar className="w-4 h-4 text-[rgb(var(--accent-400))]" />}
          title={t('progress.volume')}
          subtitle={t('progress.volume.subtitle')}
          detail={t('progress.volume.detail')}
          trailing={<span className="text-[10px] tracking-wide text-zinc-500 uppercase font-semibold">{t('progress.last8Workouts')}</span>}
        />

        {volumeChartData.length < 2 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-2xl text-center p-4">
            <BarChart2 className="w-6 h-6 text-zinc-700" />
            <span className="text-xs text-zinc-500 mt-2">{t('progress.volume.empty')}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* SVG line-graph layout */}
            <div className="w-full h-44 relative bg-zinc-950/40 border border-zinc-900 p-3 rounded-2xl">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Visual gridlines */}
                {[0.25, 0.5, 0.75].map((ratio, index) => (
                  <line
                    key={index}
                    x1="20"
                    y1={150 - (120 * ratio)}
                    x2="380"
                    y2={150 - (120 * ratio)}
                    stroke="#1c1c1e"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Plot dynamic points and render paths */}
                <path
                  d={`M ${volumeChartData.map((d, idx) => {
                    const x = 30 + ((340 / (volumeChartData.length - 1)) * idx);
                    const y = 130 - ((d.value / maxVolumeVal) * 90);
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="url(#neon-emerald-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Dynamic dots and circles overlay */}
                {volumeChartData.map((d, idx) => {
                  const x = 30 + ((340 / (volumeChartData.length - 1)) * idx);
                  const y = 130 - ((d.value / maxVolumeVal) * 90);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#10b981" />
                      <circle cx={x} cy={y} r="10" fill="transparent" className="hover:fill-emerald-500/10 transition cursor-pointer" />
                      {/* Vertical ticks */}
                      {shouldShowChartLabel(volumeChartData.length, idx) && (
                        <text x={x} y="145" textAnchor="middle" fontSize="8" fill="#52525b" fontWeight="600">{d.label}</text>
                      )}
                      {/* Volume data floating numbers above spikes */}
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill="#10b981" fontWeight="bold">{(d.value / 1000).toFixed(1)}k</text>
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="neon-emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Estimated 1RM trend (B) */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <SectionInfo
          icon={<TrendingUp className="w-4 h-4 text-[rgb(var(--accent-400))]" />}
          title={t('progress.estimated1rm')}
          subtitle={t('progress.estimated1rm.subtitle')}
          detail={t('progress.estimated1rm.detail')}
          trailing={strengthExerciseIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShow1rmPicker(true)}
              className="max-w-40 min-w-0 bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] font-semibold rounded-full px-3 py-1.5 focus:outline-none focus:border-[rgb(var(--accent-500))] hover:text-white transition inline-flex items-center gap-1.5"
            >
              <span className="truncate">{oneRmExerciseName(effective1rmId)}</span>
              <ChevronDown className="w-3 h-3 shrink-0 text-zinc-500" />
            </button>
          )}
        />

        {strengthExerciseIds.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-2xl text-center p-4">
            <TrendingUp className="w-6 h-6 text-zinc-700" />
            <span className="text-xs text-zinc-500 mt-2">{t('progress.estimated1rm.empty')}</span>
          </div>
        ) : oneRmChart.length < 2 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-2xl text-center p-4">
            <TrendingUp className="w-6 h-6 text-zinc-700" />
            <span className="text-xs text-zinc-500 mt-2">{t('progress.estimated1rm.needsSessions', { name: oneRmExerciseName(effective1rmId) })}</span>
            {allTimeBest1rm > 0 && (
              <span className="text-[11px] text-violet-400 font-semibold mt-2">{t('progress.bestEstimate', { value: allTimeBest1rm, unit: weightUnit })}</span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">{t('progress.epleyEstimate')}</span>
              <span className="text-xs text-zinc-400">{t('progress.best')} <span className="text-violet-400 font-black">{allTimeBest1rm} {weightUnit}</span></span>
            </div>
            <div className="w-full h-44 relative bg-zinc-950/40 border border-zinc-900 p-3 rounded-2xl">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {[0.25, 0.5, 0.75].map((ratio, index) => (
                  <line key={index} x1="20" y1={150 - (120 * ratio)} x2="380" y2={150 - (120 * ratio)} stroke="#1c1c1e" strokeWidth="1" strokeDasharray="4,4" />
                ))}
                <path
                  d={`M ${oneRmChart.map((d, idx) => {
                    const x = 30 + ((340 / (oneRmChart.length - 1)) * idx);
                    const y = 130 - ((d.value / max1rmVal) * 90);
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="url(#neon-violet-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {oneRmChart.map((d, idx) => {
                  const x = 30 + ((340 / (oneRmChart.length - 1)) * idx);
                  const y = 130 - ((d.value / max1rmVal) * 90);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#8b5cf6" />
                      {shouldShowChartLabel(oneRmChart.length, idx) && (
                        <text x={x} y="145" textAnchor="middle" fontSize="8" fill="#52525b" fontWeight="600">{d.label}</text>
                      )}
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill="#8b5cf6" fontWeight="bold">{d.value}</text>
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="neon-violet-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Body-weight log (Q) */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <SectionInfo
          icon={<Scale className="w-4 h-4 text-[rgb(var(--accent-400))]" />}
          title={t('progress.bodyWeight')}
          subtitle={t('progress.bodyWeight.subtitle')}
          detail={t('progress.bodyWeight.detail')}
          trailing={latestBodyWeight && (
            <div className="text-right">
              <span className="text-sm font-black text-white">{latestBodyWeight.weight} <span className="text-[10px] font-semibold text-zinc-500">{weightUnit}</span></span>
              {bodyWeightDelta !== null && bodyWeightDelta !== 0 && (
                <span className="block text-[10px] font-semibold text-zinc-400">
                  {bodyWeightDelta > 0 ? '+' : ''}{bodyWeightDelta} {weightUnit} <span className="text-zinc-600">{t('progress.vsLast')}</span>
                </span>
              )}
            </div>
          )}
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={bwInput}
            onChange={e => setBwInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddBodyWeight(); }}
            placeholder={t('progress.todayWeight', { unit: weightUnit })}
            className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-full px-4 py-2.5 focus:outline-none focus:border-[rgb(var(--accent-500))] focus:ring-1 focus:ring-[rgb(var(--accent-600)/0.25)] placeholder:text-zinc-600"
          />
          <button
            onClick={handleAddBodyWeight}
            disabled={!bwInput || parseFloat(bwInput) <= 0}
            className="bg-zinc-950 border border-zinc-800 hover:border-[rgb(var(--accent-500)/0.45)] disabled:opacity-30 disabled:hover:border-zinc-800 text-[rgb(var(--accent-400))] p-2.5 rounded-full transition-colors shrink-0"
            aria-label={t('progress.addBodyWeight')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {bwChart.length >= 2 && (
          <div className="w-full h-44 relative bg-zinc-950/40 border border-zinc-900 p-3 rounded-2xl">
            <svg className="w-full h-full" viewBox="0 0 400 150">
              {[0.25, 0.5, 0.75].map((ratio, index) => (
                <line key={index} x1="20" y1={150 - (120 * ratio)} x2="380" y2={150 - (120 * ratio)} stroke="#1c1c1e" strokeWidth="1" strokeDasharray="4,4" />
              ))}
              <path
                d={`M ${bwChart.map((d, idx) => {
                  const x = 30 + ((340 / (bwChart.length - 1)) * idx);
                  const range = bwBounds.max - bwBounds.min || 1;
                  const y = 130 - (((d.value - bwBounds.min) / range) * 90);
                  return `${x} ${y}`;
                }).join(' L ')}`}
                fill="none"
                stroke="url(#neon-sky-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {bwChart.map((d, idx) => {
                const x = 30 + ((340 / (bwChart.length - 1)) * idx);
                const range = bwBounds.max - bwBounds.min || 1;
                const y = 130 - (((d.value - bwBounds.min) / range) * 90);
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="5" fill="#0ea5e9" />
                    {shouldShowChartLabel(bwChart.length, idx) && (
                      <text x={x} y="145" textAnchor="middle" fontSize="8" fill="#52525b" fontWeight="600">{d.label}</text>
                    )}
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill="#0ea5e9" fontWeight="bold">{d.value}</text>
                  </g>
                );
              })}
              <defs>
                <linearGradient id="neon-sky-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {bodyWeightSorted.length > 0 ? (
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {[...bodyWeightSorted].reverse().slice(0, 8).map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-zinc-950/40 border border-zinc-900 rounded-xl px-3 py-2">
                <span className="text-[11px] text-zinc-400 font-medium">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{entry.weight} <span className="text-[10px] text-zinc-500 font-medium">{weightUnit}</span></span>
                  <button onClick={() => handleRemoveBodyWeight(entry.id)} className="text-zinc-600 hover:text-rose-400 transition-colors" aria-label={t('progress.removeEntry')}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-zinc-500 block text-center py-2">{t('progress.bodyWeight.empty')}</span>
        )}
      </div>
        </>
      )}

      {show1rmPicker && (
        <Modal
          open={show1rmPicker}
          onClose={() => setShow1rmPicker(false)}
          labelledBy="one-rm-picker-title"
        >
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between gap-3">
              <div>
                <h3 id="one-rm-picker-title" className="text-xs font-black uppercase tracking-wider text-white">{t('progress.choose1rm')}</h3>
                <p className="text-[9px] text-zinc-500 font-bold">{t('progress.choose1rm.help')}</p>
              </div>
              <button
                type="button"
                onClick={() => setShow1rmPicker(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition"
                aria-label={t('progress.close1rmPicker')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={oneRmSearch}
                  onChange={(e) => setOneRmSearch(e.target.value)}
                  placeholder={t('progress.searchExercise')}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600)/0.30)] transition pl-10 pr-3 py-3 text-xs rounded-2xl text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
                {filtered1rmOptions.map(({ id, exercise }) => {
                  const theme = getCategoryTheme(exercise.category);
                  const selected = id === effective1rmId;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelected1rmExercise(id);
                        setShow1rmPicker(false);
                        setOneRmSearch('');
                      }}
                      className={`w-full text-left p-3 bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-900 border-l-4 ${theme.cardBorder} rounded-2xl flex items-center justify-between gap-3 transition group ${
                        selected ? 'ring-1 ring-[rgb(var(--accent-500)/0.50)]' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-zinc-200 block truncate group-hover:text-white">{exercise.name}</span>
                        <span className="text-[9px] uppercase font-bold text-zinc-500">{equipmentLabel(t, exercise.equipment)}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] border font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${theme.chip}`}>
                          {categoryLabel(t, exercise.category)}
                        </span>
                        {selected && <Check className="w-4 h-4 text-[rgb(var(--accent-400))]" />}
                      </div>
                    </button>
                  );
                })}
                {filtered1rmOptions.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-xs font-bold">{t('progress.noStrengthMatches')}</div>
                )}
              </div>
            </div>
        </Modal>
      )}
    </div>
    </HelpTextContext.Provider>
  );
};
