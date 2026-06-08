/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Exercise, MuscleGroup, PlannedExercise, WorkoutSession, ManualPRRecord } from '../types';
import { AnatomyModel } from './AnatomyModel';
import { PoseIcon } from './PoseIcon';
import { getUnitTraits, UNIT_TRAITS, UnitId } from '../data/unit-traits';
import { Dumbbell, Target, Layers, Flame, Lightbulb, ChevronLeft, Edit2, X, Plus, Trash2, Check, SlidersHorizontal, Shield, Trophy } from 'lucide-react';
import { categoryLabel, equipmentLabel, muscleLabel } from '../data/localization';
import { useI18n } from '../i18n';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit?: (exercise: Exercise) => void;
  /** Planned targets for this exercise within a routine (when opened from a planned card). */
  plannedConfig?: PlannedExercise;
  /** Name of the routine the plan belongs to (header context). */
  routineName?: string;
  /** Persist a patch to the planned targets. Presence enables the editor. */
  onUpdatePlannedConfig?: (patch: Partial<PlannedExercise>) => void;
  /** Remove this exercise from the owning routine. */
  onRemovePlannedConfig?: () => void;
  /** App-owned manual PRs, persisted under gym_manual_prs. */
  manualPRs?: Record<string, ManualPRRecord>;
  /** Save a manual PR override from the detail sheet. */
  onSaveManualPr?: (exerciseId: string, value: number, reps: number, unit: string) => void;
  /** Show the photographic "visualizer" backdrop (archived/off by default). */
  showExerciseImage?: boolean;
  /** Hide constant helper notes when Settings turns helper descriptions off. */
  showHelpText?: boolean;
}

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'lats', 'traps', 'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lower-back', 'glutes', 'quads', 'hamstrings', 'calves'];

export const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exercise,
  onBack,
  onEdit,
  plannedConfig,
  routineName,
  onUpdatePlannedConfig,
  onRemovePlannedConfig,
  manualPRs = {},
  onSaveManualPr,
  showExerciseImage = false,
  showHelpText = true
}) => {
  const { t } = useI18n();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [isEditing, setIsEditing] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Always open the sheet at the top — without this the new screen inherits the
  // dashboard's scroll position and lands mid-page.
  useEffect(() => {
    // Reset to the very top. (Do NOT use scrollIntoView on the hero — that
    // would align it under the sticky header instead of the page top.)
    window.scrollTo({ top: 0 });
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [exercise.id]);

  // Working-weight typed entry. Free-form while typing, snapped to 0.25
  // increments on commit (so 5.25 is allowed, 5.20 is not).
  const [weightDraft, setWeightDraft] = useState<string>(
    plannedConfig?.targetWeight != null ? String(plannedConfig.targetWeight) : ''
  );
  useEffect(() => {
    setWeightDraft(plannedConfig?.targetWeight != null ? String(plannedConfig.targetWeight) : '');
  }, [plannedConfig?.targetWeight]);
  const commitWeightDraft = () => {
    const raw = parseFloat(weightDraft);
    if (!Number.isFinite(raw) || raw <= 0) {
      onUpdatePlannedConfig?.({ targetWeight: undefined });
      return;
    }
    const snapped = +(Math.round(raw / 0.25) * 0.25).toFixed(2);
    onUpdatePlannedConfig?.({ targetWeight: snapped });
  };

  // Change the planned unit, normalizing dependent fields the same way the
  // routine builder does: drop multi-sets for one-shot cardio units, and clear
  // any stale working weight when leaving a weight unit.
  const handleChangePlannedUnit = (unit: string) => {
    if (!onUpdatePlannedConfig) return;
    const t = getUnitTraits(unit);
    const patch: Partial<PlannedExercise> = { unit };
    if (!t.supportsSets) patch.sets = 1;
    if (t.metric !== 'weight-reps') patch.targetWeight = undefined;
    onUpdatePlannedConfig(patch);
  };

  // States for custom edit form
  const [editName, setEditName] = useState(exercise.name);
  const [editCategory, setEditCategory] = useState(exercise.category);
  const [editEquipment, setEditEquipment] = useState(exercise.equipment);
  const [editWhatItTrains, setEditWhatItTrains] = useState(exercise.whatItTrains);
  const [editCoachingTip, setEditCoachingTip] = useState(exercise.coachingTip);
  const [editSetup, setEditSetup] = useState<string[]>([...exercise.setup]);
  const [editHowToPerform, setEditHowToPerform] = useState<string[]>([...exercise.howToPerform]);
  const [editPrimaryMuscles, setEditPrimaryMuscles] = useState<MuscleGroup[]>([...exercise.primaryMuscles]);
  const [editSecondaryMuscles, setEditSecondaryMuscles] = useState<MuscleGroup[]>([...exercise.secondaryMuscles]);
  const [showPrEditor, setShowPrEditor] = useState(false);
  const [prValue, setPrValue] = useState(0);
  const [prReps, setPrReps] = useState(0);
  const [prUnit, setPrUnit] = useState<string>('kgs');

  // Convert muscle identifiers to standard printable text
  const formatMuscleName = (muscle: MuscleGroup) => muscleLabel(t, muscle);

  // Unsplash category and specific image map
  const getExerciseImage = (ex: Exercise) => {
    const categoryImages: Record<string, string> = {
      chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      back: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=800&auto=format&fit=crop',
      legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
      arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      core: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      cardio: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop',
    };

    return categoryImages[ex.category] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop';
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    const updated: Exercise = {
      ...exercise,
      name: editName.trim(),
      category: editCategory,
      equipment: editEquipment,
      whatItTrains: editWhatItTrains.trim(),
      coachingTip: editCoachingTip.trim(),
      setup: editSetup.filter(s => s.trim() !== ''),
      howToPerform: editHowToPerform.filter(h => h.trim() !== ''),
      primaryMuscles: editPrimaryMuscles,
      secondaryMuscles: editSecondaryMuscles
    };
    onEdit?.(updated);
    setIsEditing(false);
  };

  const addSetupStep = () => setEditSetup([...editSetup, '']);
  const removeSetupStep = (idx: number) => setEditSetup(editSetup.filter((_, i) => i !== idx));
  const updateSetupStep = (idx: number, val: string) => {
    const copy = [...editSetup];
    copy[idx] = val;
    setEditSetup(copy);
  };

  const addPerformStep = () => setEditHowToPerform([...editHowToPerform, '']);
  const removePerformStep = (idx: number) => setEditHowToPerform(editHowToPerform.filter((_, i) => i !== idx));
  const updatePerformStep = (idx: number, val: string) => {
    const copy = [...editHowToPerform];
    copy[idx] = val;
    setEditHowToPerform(copy);
  };

  const toggleEditMuscle = (
    muscle: MuscleGroup,
    selected: MuscleGroup[],
    setter: React.Dispatch<React.SetStateAction<MuscleGroup[]>>
  ) => {
    setter(selected.includes(muscle)
      ? selected.filter(item => item !== muscle)
      : [...selected, muscle]
    );
  };

  const routinePrSummary = useMemo(() => {
    const empty = { value: 0, reps: 0, unit: undefined as string | undefined };
    try {
      const manual = manualPRs[exercise.id];
      const summary = manual
        ? { value: manual.value, reps: manual.reps ?? 0, unit: manual.unit }
        : { ...empty };

      const historyRaw = localStorage.getItem('gym_history');
      const sessions = historyRaw ? JSON.parse(historyRaw) as WorkoutSession[] : [];
      sessions.forEach(session => {
        session.exercises?.forEach(logged => {
          if (logged.exerciseId !== exercise.id) return;
          logged.sets?.forEach(set => {
            if (!set.completed || set.distance != null || set.durationMinutes != null) return;
            if (set.weight > summary.value) {
              summary.value = set.weight;
              summary.reps = set.reps;
            } else if (set.weight === summary.value && set.reps > summary.reps) {
              summary.reps = set.reps;
            }
          });
        });
      });
      return summary;
    } catch {
      return empty;
    }
  }, [exercise.id, manualPRs]);

  const openPrEditor = () => {
    setPrValue(routinePrSummary.value || 0);
    setPrReps(routinePrSummary.reps || 0);
    setPrUnit(routinePrSummary.unit || plannedConfig?.unit || 'kgs');
    setShowPrEditor(true);
  };

  return (
    <div id={`exercise-detail-${exercise.id}`} className="flex flex-col min-h-full bg-zinc-950 text-zinc-100 pb-16">
      {/* Header bar strictly styled like iOS screenshots */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-30">
        <button
          onClick={onBack}
          id="detail-back-btn"
          className="p-2.5 rounded-full hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition-all duration-200"
          aria-label={t('active.back')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{t('detail.title')}</span>
        <button
          onClick={() => {
            setEditName(exercise.name);
            setEditCategory(exercise.category);
            setEditEquipment(exercise.equipment);
            setEditWhatItTrains(exercise.whatItTrains);
            setEditCoachingTip(exercise.coachingTip);
            setEditSetup([...exercise.setup]);
            setEditHowToPerform([...exercise.howToPerform]);
            setEditPrimaryMuscles([...exercise.primaryMuscles]);
            setEditSecondaryMuscles([...exercise.secondaryMuscles]);
            setIsEditing(true);
          }}
          id="detail-edit-btn"
          className="p-2.5 rounded-full hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition-all duration-200"
          title={t('detail.customize')}
          aria-label={t('detail.customize')}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-5 space-y-6 max-w-lg mx-auto w-full">
        
        {/* Exercise header — icon, name and description are always shown. The
            photographic "visualizer" backdrop is opt-in (archived/off by
            default) and re-enabled from Settings. */}
        <div ref={topRef} className="relative rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl bg-zinc-950 group">
          {showExerciseImage && (
            <div className="aspect-[16/10] w-full overflow-hidden relative">
              <img
                src={getExerciseImage(exercise)}
                alt={exercise.name}
                className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-5 bg-gradient-to-b from-zinc-950/10 to-zinc-950 flex items-center gap-4">
            {/* Pose icon — same minimalistic mark used in the routine list,
                so the user has a visual anchor when arriving from a list. */}
            <PoseIcon name={exercise.poseIcon} size={64} className="shrink-0" />
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-extrabold text-[rgb(var(--accent-400))] uppercase tracking-widest block pl-0.5">{categoryLabel(t, exercise.category)}</span>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight truncate">{exercise.name}</h2>
              <p className="text-xs text-zinc-400 font-medium line-clamp-2">{exercise.whatItTrains}</p>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider bg-[rgb(var(--accent-600))] text-white px-2 py-0.5 rounded-full">{categoryLabel(t, exercise.category)}</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{equipmentLabel(t, exercise.equipment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Routine target editor — only when arriving from a planned card.
            Lets the user adjust sets / reps / unit / working weight for this
            exercise inside the routine, right where they instinctively tapped. */}
        {plannedConfig && onUpdatePlannedConfig && (() => {
          const traits = getUnitTraits(plannedConfig.unit);
          const isWeight = traits.metric === 'weight-reps';
          const isRepBased = isWeight || traits.metric === 'bodyweight-reps';
          const prUnit = routinePrSummary.unit || plannedConfig.unit || 'kgs';
          const prTraits = getUnitTraits(prUnit);
          return (
            <div className="bg-[rgb(var(--accent-950)/0.15)] border border-[rgb(var(--accent-900)/0.30)] rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SlidersHorizontal className="w-4 h-4 text-[rgb(var(--accent-400))] shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 truncate">{t('detail.routineTargets')}</h3>
                </div>
                {routineName && (
                  <span className="text-[10px] text-[rgb(var(--accent-400)/0.80)] font-extrabold uppercase tracking-wider truncate max-w-[48%]">{routineName}</span>
                )}
              </div>

              {/* Unit */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-zinc-300">{t('detail.measuredIn')}</span>
                <select
                  value={plannedConfig.unit || 'reps'}
                  onChange={(e) => handleChangePlannedUnit(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-white px-2.5 py-2 rounded-xl focus:outline-none focus:border-[rgb(var(--accent-600))] shrink-0"
                >
                  {(Object.keys(UNIT_TRAITS) as UnitId[]).map(u => (
                    <option key={u} value={u}>{UNIT_TRAITS[u].label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-[rgb(var(--accent-900)/0.20)] pt-3">
                <span className="text-xs font-bold text-zinc-300">{t('detail.currentPr')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-black text-[rgb(var(--accent-300))] bg-[rgb(var(--accent-600)/0.10)] border border-[rgb(var(--accent-500)/0.20)] px-2.5 py-1.5 rounded-xl">
                    {routinePrSummary.value > 0 ? (
                      <>
                        {routinePrSummary.value}
                        {routinePrSummary.reps > 0 && <> × {routinePrSummary.reps}</>}
                        <span className="text-[rgb(var(--accent-400))] uppercase tracking-widest text-[9px] ml-1">{prTraits.shortLabel}</span>
                      </>
                    ) : (
                      <span className="text-zinc-500">{t('detail.noPr')}</span>
                    )}
                  </span>
                  {onSaveManualPr && (
                    <button
                      type="button"
                      onClick={openPrEditor}
                      className="text-[9px] text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))] font-black tracking-widest uppercase bg-[rgb(var(--accent-600)/0.15)] px-2.5 py-1.5 rounded-lg border border-[rgb(var(--accent-500)/0.25)] hover:bg-[rgb(var(--accent-600)/0.20)] transition"
                    >
                      {routinePrSummary.value > 0 ? t('detail.edit') : t('dashboard.logPr')}
                    </button>
                  )}
                </div>
              </div>

              {/* Sets (only when the unit supports multiple sets) */}
              {traits.supportsSets && (
                <div className="flex items-center justify-between border-t border-[rgb(var(--accent-900)/0.20)] pt-3">
                  <span className="text-xs font-bold text-zinc-300">{t('detail.sets')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdatePlannedConfig({ sets: Math.max(1, plannedConfig.sets - 1) })}
                      className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center justify-center text-sm font-black transition"
                      aria-label={t('detail.decreasePlannedSets')}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-black text-white">{plannedConfig.sets}</span>
                    <button
                      onClick={() => onUpdatePlannedConfig({ sets: plannedConfig.sets + 1 })}
                      className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center justify-center text-sm font-black transition"
                      aria-label={t('detail.increasePlannedSets')}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Reps / target value (free text — supports ranges like "6-10") */}
              <div className="flex items-center justify-between border-t border-[rgb(var(--accent-900)/0.20)] pt-3 gap-3">
                <span className="text-xs font-bold text-zinc-300">{isRepBased ? t('detail.reps') : t('detail.targetWithUnit', { unit: traits.shortLabel })}</span>
                <input
                  type="text"
                  value={plannedConfig.reps}
                  onChange={(e) => onUpdatePlannedConfig({ reps: e.target.value })}
                  placeholder={traits.defaultValue}
                  className="w-24 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-center text-white font-mono focus:outline-none focus:border-[rgb(var(--accent-600))]"
                />
              </div>

              {/* Working weight (only for weight×reps movements) */}
              {isWeight && (
                <div className="flex items-center justify-between border-t border-[rgb(var(--accent-900)/0.20)] pt-3">
                  <span className="text-xs font-bold text-zinc-300">{t('detail.workingUnit', { unit: traits.shortLabel })}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdatePlannedConfig({ targetWeight: Math.max(0, (plannedConfig.targetWeight || 0) - traits.step) })}
                      className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center justify-center text-sm font-black transition"
                      aria-label={t('detail.decreaseWorkingWeight', { amount: traits.step, unit: traits.shortLabel })}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      step={0.25}
                      min={0}
                      value={weightDraft}
                      onChange={(e) => setWeightDraft(e.target.value)}
                      onBlur={commitWeightDraft}
                      onKeyDown={(e) => { if (e.key === 'Enter') { commitWeightDraft(); (e.target as HTMLInputElement).blur(); } }}
                      placeholder="—"
                      aria-label={t('detail.workingWeightAria', { unit: traits.shortLabel })}
                      className="w-14 text-center font-mono text-sm font-black text-white bg-zinc-950 border border-zinc-800 rounded-lg px-1 py-1 focus:outline-none focus:border-[rgb(var(--accent-600))]"
                    />
                    <button
                      onClick={() => onUpdatePlannedConfig({ targetWeight: (plannedConfig.targetWeight || 0) + traits.step })}
                      className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 flex items-center justify-center text-sm font-black transition"
                      aria-label={t('detail.increaseWorkingWeight', { amount: traits.step, unit: traits.shortLabel })}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {showHelpText && (
                <p className="text-[10px] text-zinc-600 leading-relaxed border-t border-[rgb(var(--accent-900)/0.20)] pt-3">
                  {t('detail.changesSave', { routine: routineName || t('detail.thisRoutine') })}
                </p>
              )}

              {onRemovePlannedConfig && (
                <button
                  type="button"
                  onClick={onRemovePlannedConfig}
                  className="w-full border-t border-[rgb(var(--accent-900)/0.20)] pt-3 text-[10px] font-black uppercase tracking-widest text-red-400/80 hover:text-red-300 transition flex items-center justify-center gap-2"
                  aria-label={t('dashboard.removeExerciseFromRoutine', { name: exercise.name })}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('detail.removeFromRoutine')}
                </button>
              )}
            </div>
          );
        })()}

        {/* Anatomical Model Panel */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{t('detail.anatomyTargets')}</span>
              {showHelpText && (
                <p className="text-[10px] text-zinc-500 font-semibold">{t('detail.anatomyHelp')}</p>
              )}
            </div>

            {/* View Toggle Pillars */}
            <div className="flex bg-zinc-950 p-1 rounded-full border border-zinc-800 text-[10px] uppercase font-black">
              <button
                onClick={() => setView('front')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  view === 'front'
                    ? 'bg-zinc-800 text-white shadow shadow-black/80'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t('detail.front')}
              </button>
              <button
                onClick={() => setView('back')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  view === 'back'
                    ? 'bg-zinc-800 text-white shadow shadow-black/80'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t('detail.back')}
              </button>
            </div>
          </div>

          {/* Interactive Split Layout: Left is Legend, Right is anatomy */}
          <div className="grid grid-cols-5 gap-4 items-center min-h-[290px]">
            {/* Left side labels */}
            <div className="col-span-2 flex flex-col space-y-5 text-xs pl-1">
              {exercise.primaryMuscles.length > 0 && (
                <div className="space-y-1 py-1 border-l-2 border-blue-500 pl-3">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">{t('detail.primaryFocus')}</span>
                  </div>
                  <div className="text-zinc-100 font-extrabold capitalize text-xs">
                    {exercise.primaryMuscles.map(formatMuscleName).join(', ')}
                  </div>
                </div>
              )}

              {exercise.secondaryMuscles.length > 0 && (
                <div className="space-y-1 py-1 border-l-2 border-[rgb(var(--accent-500))] pl-3">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[rgb(var(--accent-400))] shrink-0" />
                    <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">{t('detail.synergists')}</span>
                  </div>
                  <div className="text-zinc-300 font-bold capitalize leading-relaxed text-xs">
                    {exercise.secondaryMuscles.map(formatMuscleName).join(', ')}
                  </div>
                </div>
              )}

              <div className="space-y-1 py-1 border-l-2 border-zinc-700 pl-3">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">{t('detail.requirement')}</span>
                </div>
                <div className="text-zinc-400 capitalize font-bold text-xs">
                  {equipmentLabel(t, exercise.equipment)}
                </div>
              </div>
            </div>

            {/* Right side body model */}
            <div className="col-span-3 h-full flex items-center justify-center">
              <AnatomyModel
                primaryMuscles={exercise.primaryMuscles}
                secondaryMuscles={exercise.secondaryMuscles}
                selectedView={view}
                className="w-full border-none p-0 bg-transparent scale-105"
              />
            </div>
          </div>

        </div>

        {/* Dynamic Descriptive Blocks */}

        {/* 1. What it trains */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl flex items-start gap-4 shadow-md">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-blue-500 shadow-sm shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">{t('detail.whatItTrains')}</h3>
            <p className="text-sm text-zinc-200 leading-relaxed font-semibold">
              {exercise.whatItTrains}
            </p>
          </div>
        </div>

        {/* 2. Setup */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl flex items-start gap-4 shadow-md">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-[rgb(var(--accent-500))] shadow-sm shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-2 w-full">
            <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">{t('detail.setup')}</h3>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {exercise.setup.map((sh, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-500))] mt-2 shrink-0 shadow-lg" />
                  <span>{sh}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. How to perform */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl flex items-start gap-4 shadow-md">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-amber-500 shadow-sm shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="space-y-2 w-full">
            <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">{t('detail.execution')}</h3>
            <ol className="space-y-3.5 text-sm text-zinc-300">
              {exercise.howToPerform.map((st, idx) => (
                <li key={idx} className="flex gap-3 leading-relaxed font-semibold">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black text-amber-500 shrink-0 shadow-inner">
                    {idx + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 4. Coaching tip exactly mimicking the screenshots */}
        <div className="p-5 rounded-3xl bg-blue-950/15 border border-blue-900/20 flex items-start gap-4 shadow-lg">
          <div className="p-3 bg-blue-900/20 rounded-2xl border border-blue-800/25 text-blue-400 shrink-0">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-blue-400 tracking-wider uppercase">{t('detail.coachTip')}</h4>
            <p className="text-sm text-blue-200/90 leading-relaxed font-semibold">
              {exercise.coachingTip}
            </p>
          </div>
        </div>
      </div>

      {/* PR editor shared with the routine-target Current PR row. */}
      {showPrEditor && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPrEditor(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 rounded-xl hover:bg-zinc-900/50 transition duration-150"
              aria-label={t('pr.close')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[rgb(var(--accent-600)/0.10)] rounded-2xl border border-[rgb(var(--accent-500)/0.20)] text-[rgb(var(--accent-400))]">
                <Trophy className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-zinc-100 uppercase tracking-wider">{t('dashboard.configureRecord')}</h3>
                <p className="text-[10px] text-zinc-400 font-bold">{exercise.name}</p>
              </div>
            </div>

            <div className="space-y-4 my-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5">{t('dashboard.recordValue')}</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5">
                  <input
                    type="number"
                    step="any"
                    value={prValue || ''}
                    onChange={(e) => setPrValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-bold text-xs text-zinc-100 font-mono focus:outline-none"
                    placeholder={t('pr.valuePlaceholder')}
                  />
                </div>
              </div>

              {getUnitTraits(prUnit).metric !== 'cardio-distance' && getUnitTraits(prUnit).metric !== 'cardio-duration' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5 flex items-center justify-between">
                    <span>{t('dashboard.repsCompleted')}</span>
                    <span className="text-zinc-600 normal-case tracking-normal font-semibold">{t('dashboard.optional')}</span>
                  </label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5">
                    <input
                      type="number"
                      min={0}
                      value={prReps || ''}
                      onChange={(e) => setPrReps(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent font-bold text-xs text-zinc-100 font-mono focus:outline-none"
                      placeholder={t('pr.repsPlaceholder')}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5">{t('dashboard.measurementUnit')}</label>
                <select
                  value={prUnit}
                  onChange={(e) => setPrUnit(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none cursor-pointer"
                >
                  <option value="reps">reps</option>
                  <option value="kgs">kgs</option>
                  <option value="lbs">lbs</option>
                  <option value="kms">kms</option>
                  <option value="miles">miles</option>
                  <option value="sec">sec</option>
                  <option value="min">min</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowPrEditor(false)}
                className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[10px] uppercase font-black tracking-wider transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onSaveManualPr?.(exercise.id, prValue, prReps, prUnit);
                  setShowPrEditor(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] text-white rounded-xl text-[10px] uppercase font-black tracking-wider hover:from-[rgb(var(--accent-500))] hover:to-[rgb(var(--accent-500))] transition shadow-lg"
              >
                {t('dashboard.saveRecord')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RICH INLINE FORM EDITING MODAL- REPLACES BUGGY CONFUSING PROMPTS */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-950 border-t sm:border border-zinc-900 w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">{t('detail.editBlueprint')}</h3>
                {showHelpText && (
                  <p className="text-[10px] text-zinc-500 font-bold">{t('detail.editHelp')}</p>
                )}
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition"
                aria-label={t('detail.closeEditor')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable contents */}
            <div className="flex-grow p-6 overflow-y-auto space-y-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.exerciseName')}</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t('detail.exerciseName.placeholder')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600))] transition"
                />
              </div>

              {/* Grid 2x2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.category')}</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Exercise['category'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[rgb(var(--accent-600))] transition"
                  >
                    {(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'] as Exercise['category'][]).map(category => (
                      <option key={category} value={category}>{categoryLabel(t, category)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.equipment')}</label>
                  <select 
                    value={editEquipment}
                    onChange={(e) => setEditEquipment(e.target.value as Exercise['equipment'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-[rgb(var(--accent-600))] transition"
                  >
                    {(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'bands', 'kettlebell', 'cardio'] as Exercise['equipment'][]).map(equipment => (
                      <option key={equipment} value={equipment}>{equipmentLabel(t, equipment)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* What it trains */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.whatItTrainsEdit')}</label>
                <textarea 
                  value={editWhatItTrains}
                  onChange={(e) => setEditWhatItTrains(e.target.value)}
                  placeholder={t('detail.whatItTrains.placeholder')}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600))] transition resize-none"
                />
              </div>

              {/* Coaching Tip */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.coachTip')}</label>
                <textarea 
                  value={editCoachingTip}
                  onChange={(e) => setEditCoachingTip(e.target.value)}
                  placeholder={t('detail.coachTip.placeholder')}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600))] transition resize-none"
                />
              </div>

              {/* Setup steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.setupInstructions')}</label>
                  <button 
                    onClick={addSetupStep}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))]"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t('detail.addStep')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editSetup.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="flex items-center justify-center w-7 h-10 rounded-xl bg-zinc-900 text-xs text-zinc-500 font-mono">
                        {idx + 1}
                      </span>
                      <input 
                        type="text"
                        value={step}
                        onChange={(e) => updateSetupStep(idx, e.target.value)}
                        placeholder={t('detail.setupStep.placeholder', { number: idx + 1 })}
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[rgb(var(--accent-600))]"
                      />
                      <button 
                        onClick={() => removeSetupStep(idx)}
                        className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-xl transition"
                        aria-label={t('detail.removeSetupStep', { number: idx + 1 })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editSetup.length === 0 && (
                    <p className="text-[11px] text-zinc-500 border border-dashed border-zinc-900 p-4 rounded-xl text-center">{t('detail.noSetup')}</p>
                  )}
                </div>
              </div>

              {/* Execution steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('detail.execution')}</label>
                  <button 
                    onClick={addPerformStep}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))]"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t('detail.addStep')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editHowToPerform.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="flex items-center justify-center w-7 h-10 rounded-xl bg-zinc-900 text-xs text-zinc-500 font-mono">
                        {idx + 1}
                      </span>
                      <input 
                        type="text"
                        value={step}
                        onChange={(e) => updatePerformStep(idx, e.target.value)}
                        placeholder={t('detail.performStep.placeholder', { number: idx + 1 })}
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[rgb(var(--accent-600))]"
                      />
                      <button 
                        onClick={() => removePerformStep(idx)}
                        className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-xl transition"
                        aria-label={t('detail.removePerformanceStep', { number: idx + 1 })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editHowToPerform.length === 0 && (
                    <p className="text-[11px] text-zinc-500 border border-dashed border-zinc-900 p-4 rounded-xl text-center">{t('detail.noPerformance')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('customExercise.primary')}</label>
                  <p className="text-[9px] text-zinc-600 font-semibold mt-0.5">{t('customExercise.muscleHint')}</p>
                </div>
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-zinc-900 bg-zinc-950/40 p-2 flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map(muscle => {
                    const isSelected = editPrimaryMuscles.includes(muscle);
                    return (
                      <button
                        key={`primary-${muscle}`}
                        type="button"
                        onClick={() => toggleEditMuscle(muscle, editPrimaryMuscles, setEditPrimaryMuscles)}
                        aria-pressed={isSelected}
                        aria-label={t('customExercise.togglePrimary', { muscle: formatMuscleName(muscle) })}
                        className={`px-2.5 py-1.5 rounded-full text-[10px] font-black capitalize transition ${
                          isSelected ? 'bg-[rgb(var(--accent-600))] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {formatMuscleName(muscle)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{t('customExercise.secondary')}</label>
                  <p className="text-[9px] text-zinc-600 font-semibold mt-0.5">{t('customExercise.muscleHint')}</p>
                </div>
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-2 flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map(muscle => {
                    const isSelected = editSecondaryMuscles.includes(muscle);
                    return (
                      <button
                        key={`secondary-${muscle}`}
                        type="button"
                        onClick={() => toggleEditMuscle(muscle, editSecondaryMuscles, setEditSecondaryMuscles)}
                        aria-pressed={isSelected}
                        aria-label={t('customExercise.toggleSecondary', { muscle: formatMuscleName(muscle) })}
                        className={`px-2.5 py-1.5 rounded-full text-[10px] font-black capitalize transition ${
                          isSelected ? 'bg-[rgb(var(--accent-600))] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {formatMuscleName(muscle)}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer triggers */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-grow py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={!editName.trim()}
                className="flex-grow py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] hover:from-[rgb(var(--accent-500))] rounded-xl text-xs font-black tracking-wider text-white flex items-center justify-center gap-2 duration-150 disabled:opacity-40"
              >
                <Check className="w-4 h-4" /> {t('detail.saveChanges')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
