/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Routine, Exercise, PlannedExercise, WorkoutSettings, WorkoutSession, MuscleGroup, ManualPRRecord } from '../types';
import { PoseIcon } from './PoseIcon';
import { EXERCISES } from '../data/exercises';
import { getUnitTraits, UNIT_TRAITS, getDefaultUnit, resolveDistanceSystem } from '../data/unit-traits';
import { getCategoryTheme, getFilterTheme } from '../data/category-theme';
import { ConfirmModal } from './ConfirmModal';
import { Modal } from './Modal';
import {
  Calendar,
  Compass,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  X,
  Dumbbell,
  BookOpen,
  Search,
  Check,
  Edit2,
  Trash2,
  Copy,
  ListPlus,
  Settings as SettingsIcon,
  Play,
  Trophy
} from 'lucide-react';

interface DashboardProps {
  routines: Routine[];
  exercisesList: Exercise[];
  settings: WorkoutSettings;
  history: WorkoutSession[];
  onStartRoutine: (routine: Routine) => void;
  onViewExercise: (exercise: Exercise, context?: { routineId: string; exerciseId: string }) => void;
  onUpdateRoutines: (updated: Routine[]) => void;
  onUpdateExercises: (updated: Exercise[]) => void;
  onUpdateSettings: (updated: WorkoutSettings) => void;
  manualPRs: Record<string, ManualPRRecord>;
  onSaveManualPr: (exerciseId: string, value: number, reps: number, unit: string) => void;
  onOpenCalendarPlanner: () => void;
  selectedRoutineId: string;
  onSelectRoutineId: (id: string) => void;
  activeTab: 'routines' | 'library';
  onActiveTabChange: (tab: 'routines' | 'library') => void;
  highlightRoutineId?: string | null;
}

interface PRSummary {
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  manualUnit?: string;
}

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'lats', 'traps', 'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lower-back', 'glutes', 'quads', 'hamstrings', 'calves'];
const CATEGORY_ORDER: Exercise['category'][] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];

const formatMuscleLabel = (muscle: MuscleGroup) => muscle.replace(/-/g, ' ');

const defaultMuscleForCategory = (cat: Exercise['category']): MuscleGroup => {
  const defaults: Record<Exercise['category'], MuscleGroup> = {
    chest: 'chest',
    back: 'lats',
    shoulders: 'front-delts',
    arms: 'biceps',
    legs: 'quads',
    core: 'abs',
    cardio: 'quads'
  };
  return defaults[cat];
};

export const Dashboard: React.FC<DashboardProps> = ({
  routines,
  exercisesList,
  settings,
  history,
  onStartRoutine,
  onViewExercise,
  onUpdateRoutines,
  onUpdateExercises,
  onUpdateSettings,
  manualPRs,
  onSaveManualPr,
  onOpenCalendarPlanner,
  selectedRoutineId,
  onSelectRoutineId,
  activeTab,
  onActiveTabChange,
  highlightRoutineId
}) => {
  // Exercise Library Search/Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  // New/Editing Routine Form States
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineFormName, setRoutineFormName] = useState('');
  const [routineFormExercises, setRoutineFormExercises] = useState<PlannedExercise[]>([]);
  const [routineToDeleteId, setRoutineToDeleteId] = useState<string | null>(null);

  // Inline routine rename (no modal): which routine's title is being edited
  // in place in the detail header, plus the working draft string.
  const [renamingRoutineId, setRenamingRoutineId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  // Copy-routine naming prompt: the source routine being copied + the draft name.
  const [duplicateSource, setDuplicateSource] = useState<Routine | null>(null);
  const [duplicateName, setDuplicateName] = useState('');

  // Simple routine addition drawer toggle
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  // Inside the routine modal: search + filter the candidate exercise list
  // (mirrors the Library experience so picking is fast and consistent).
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('all');
  const [modalEquipment, setModalEquipment] = useState('all');
  
  // Custom Exercise Creation Form
  const [showCreateExModal, setShowCreateExModal] = useState(false);
  const [customExName, setCustomExName] = useState('');
  const [customExCategory, setCustomExCategory] = useState<'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio'>('chest');
  const [customExEquipment, setCustomExEquipment] = useState<'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'bands' | 'kettlebell' | 'cardio'>('barbell');
  const [customExWhatItTrains, setCustomExWhatItTrains] = useState('');
  const [customExSetup, setCustomExSetup] = useState('');
  const [customExPerform, setCustomExPerform] = useState('');
  const [customExTip, setCustomExTip] = useState('');
  const [customExPrimaryMuscles, setCustomExPrimaryMuscles] = useState<MuscleGroup[]>([]);
  const [customExSecondaryMuscles, setCustomExSecondaryMuscles] = useState<MuscleGroup[]>([]);

  // Categories list
  const categories = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];
  const equipments = ['all', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'bands', 'kettlebell', 'cardio'];

  const matchesExerciseSearch = (ex: Exercise) => {
    const q = searchQuery.toLowerCase();
    const muscleStr = [...ex.primaryMuscles, ...ex.secondaryMuscles].join(' ').replace(/-/g, ' ').toLowerCase();
    return ex.name.toLowerCase().includes(q)
      || ex.whatItTrains.toLowerCase().includes(q)
      || muscleStr.includes(q);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEquipment('all');
  };

  const resetCustomExerciseForm = () => {
    setCustomExName('');
    setCustomExWhatItTrains('');
    setCustomExSetup('');
    setCustomExPerform('');
    setCustomExTip('');
    setCustomExPrimaryMuscles([]);
    setCustomExSecondaryMuscles([]);
  };

  const closeCreateExerciseModal = () => {
    setShowCreateExModal(false);
    resetCustomExerciseForm();
  };

  const toggleCustomMuscle = (
    muscle: MuscleGroup,
    selected: MuscleGroup[],
    setter: React.Dispatch<React.SetStateAction<MuscleGroup[]>>
  ) => {
    setter(selected.includes(muscle)
      ? selected.filter(item => item !== muscle)
      : [...selected, muscle]
    );
  };

  const getCategoryCount = (catName: string): number => {
    return exercisesList.filter(ex => {
      const matchesSearch = matchesExerciseSearch(ex);
      const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
      const matchesCat = catName === 'all' || ex.category === catName;
      return matchesSearch && matchesEquip && matchesCat;
    }).length;
  };

  const getEquipmentCount = (equipName: string): number => {
    return exercisesList.filter(ex => {
      const matchesSearch = matchesExerciseSearch(ex);
      const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
      const matchesEquip = equipName === 'all' || ex.equipment === equipName;
      return matchesSearch && matchesCat && matchesEquip;
    }).length;
  };

  // Filtered Exercise list for library
  const filteredExercises = exercisesList.filter(ex => {
    const matchesSearch = matchesExerciseSearch(ex);
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesCat && matchesEquip;
  });

  const groupedFilteredExercises = CATEGORY_ORDER
    .filter(category => selectedCategory === 'all' || selectedCategory === category)
    .map(category => ({
      category,
      exercises: filteredExercises
        .filter(ex => ex.category === category)
        .sort((a, b) => a.name.localeCompare(b.name))
    }))
    .filter(group => group.exercises.length > 0);

  // Handle Routine Save (New or update)
  const handleSaveRoutine = () => {
    if (!routineFormName.trim()) return;

    const savedRoutine: Routine = {
      id: editingRoutineId || `routine-${Date.now()}`,
      name: routineFormName.trim(),
      exercises: routineFormExercises
    };

    let updatedRoutines = [...routines];
    if (editingRoutineId) {
      updatedRoutines = updatedRoutines.map(r => r.id === editingRoutineId ? savedRoutine : r);
    } else {
      updatedRoutines.push(savedRoutine);
    }

    onUpdateRoutines(updatedRoutines);
    setShowRoutineModal(false);
    setIsEditingRoutine(false);
    setEditingRoutineId(null);
    setRoutineFormName('');
    setRoutineFormExercises([]);
  };

  // Open editor for a routine
  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setRoutineFormName(routine.name);
    setRoutineFormExercises(routine.exercises);
    setIsEditingRoutine(true);
    setShowRoutineModal(true);
  };

  // Delete routine
  const handleDeleteRoutine = (id: string) => {
    setRoutineToDeleteId(id);
  };

  const confirmDeleteRoutine = () => {
    if (!routineToDeleteId) return;
    const updated = routines.filter(r => r.id !== routineToDeleteId);
    onUpdateRoutines(updated);
    setRoutineToDeleteId(null);
  };

  // Duplicate a routine — deep-copies its planned exercises with fresh ids so
  // edits to the copy never mutate the original, names it "<name> (Copy)",
  // inserts it right after the source, and selects it.
  // Step 1: open the naming prompt (pre-filled with the default "(Copy)" name).
  const handleDuplicateRoutine = (routine: Routine) => {
    setDuplicateSource(routine);
    setDuplicateName(`${routine.name} (Copy)`);
  };

  // Step 2: commit the copy with the chosen name (falls back to "(Copy)" if blank).
  const confirmDuplicateRoutine = () => {
    if (!duplicateSource) return;
    const routine = duplicateSource;
    const stamp = Date.now();
    const copy: Routine = {
      id: `routine-${stamp}`,
      name: duplicateName.trim() || `${routine.name} (Copy)`,
      description: routine.description,
      exercises: routine.exercises.map((ex, i) => ({
        ...ex,
        id: `plan-${stamp}-${i}`
      }))
    };
    const idx = routines.findIndex(r => r.id === routine.id);
    const updated = [...routines];
    updated.splice(idx === -1 ? routines.length : idx + 1, 0, copy);
    onUpdateRoutines(updated);
    onSelectRoutineId(copy.id);
    setDuplicateSource(null);
    setDuplicateName('');
  };

  // Reorder routines in the horizontal selector (swap with the neighbour).
  // Persists immediately; selection follows by id so it stays put.
  const handleMoveRoutine = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= routines.length) return;
    const next = [...routines];
    [next[index], next[target]] = [next[target], next[index]];
    onUpdateRoutines(next);
  };

  // Inline rename: open / commit / cancel. Commit trims and ignores empties
  // (falls back to the existing name) so a routine can't lose its title.
  const beginRenameRoutine = (routine: Routine) => {
    setRenamingRoutineId(routine.id);
    setRenameDraft(routine.name);
  };
  const commitRenameRoutine = () => {
    if (!renamingRoutineId) return;
    const name = renameDraft.trim();
    if (name) {
      onUpdateRoutines(routines.map(r => (r.id === renamingRoutineId ? { ...r, name } : r)));
    }
    setRenamingRoutineId(null);
    setRenameDraft('');
  };
  const cancelRenameRoutine = () => {
    setRenamingRoutineId(null);
    setRenameDraft('');
  };

  // Build a fresh planned-exercise entry seeded from the exercise's own
  // defaults: its logical default unit (kgs for weights, km/mi for distance
  // cardio, sec/min for timed work, reps for bodyweight), its default
  // set/rep targets, and — for weight movements — the user's chosen weight
  // system (kg vs lb). Keeps every add-to-routine path consistent.
  const buildPlannedExercise = (exerciseId: string): PlannedExercise => {
    const ex = exercisesList.find(e => e.id === exerciseId);
    const distanceSystem = resolveDistanceSystem(settings.distanceUnit, settings.weightUnit);
    const base = ex ? getDefaultUnit(ex, distanceSystem) : 'kgs';
    const unit = base === 'kgs' && settings.weightUnit === 'lbs' ? 'lbs' : base;
    const traits = getUnitTraits(unit);
    const isRepBased = traits.metric === 'weight-reps' || traits.metric === 'bodyweight-reps';
    return {
      id: `plan-${Date.now()}-${Math.random()}`,
      exerciseId,
      unit,
      sets: traits.supportsSets ? (ex?.defaultSets ?? 3) : 1,
      reps: isRepBased ? (ex?.defaultReps || traits.defaultValue) : traits.defaultValue
    };
  };

  // Toggle exercise selected inside editing routine state
  const handleTogglePlannedExercise = (exerciseId: string) => {
    setRoutineFormExercises(prev => {
      const idx = prev.findIndex(item => item.exerciseId === exerciseId);
      if (idx !== -1) {
        // remove
        return prev.filter(item => item.exerciseId !== exerciseId);
      } else {
        // add
        return [...prev, buildPlannedExercise(exerciseId)];
      }
    });
  };

  // Modify set targets inside routine builder
  const handleUpdatePlannedSetRep = (exerciseId: string, field: 'sets' | 'reps' | 'unit' | 'weight', value: any) => {
    setRoutineFormExercises(prev =>
      prev.map(planned => {
        if (planned.exerciseId !== exerciseId) return planned;
        const next: PlannedExercise = field === 'weight'
          ? { ...planned, targetWeight: Math.max(0, Number(value) || 0) }
          : { ...planned, [field]: value };
        // When the user switches to a unit that doesn't support multiple
        // sets (distance units), normalize sets to 1 so
        // the persisted data matches the visible "no sets" UI. Switching to
        // a non-weight unit also clears any stale working weight.
        if (field === 'unit') {
          if (!getUnitTraits(value).supportsSets) next.sets = 1;
          if (getUnitTraits(value).metric !== 'weight-reps') next.targetWeight = undefined;
        }
        return next;
      })
    );
  };

  // Reorder a planned exercise within the routine builder (up/down). Swaps
  // with its neighbour; no-ops at the list boundaries.
  const handleMovePlannedExercise = (index: number, dir: -1 | 1) => {
    setRoutineFormExercises(prev => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // Custom Exercise Builder save
  const handleCreateCustomExercise = () => {
    if (!customExName.trim()) return;

    const newEx: Exercise = {
      id: `custom-ex-${Date.now()}`,
      name: customExName.trim(),
      category: customExCategory,
      equipment: customExEquipment,
      primaryMuscles: customExPrimaryMuscles.length > 0 ? customExPrimaryMuscles : [defaultMuscleForCategory(customExCategory)],
      secondaryMuscles: customExSecondaryMuscles,
      poseIcon: 'generic',
      whatItTrains: customExWhatItTrains.trim() || `Custom movement for your ${customExCategory} mapping.`,
      setup: customExSetup.trim() ? customExSetup.split('\n') : ['Start prepared with correct form.'],
      howToPerform: customExPerform.trim() ? customExPerform.split('\n') : ['Execute with control.'],
      coachingTip: customExTip.trim() || 'Focus on squeezing target muscle groups for maximum hypertrophy.'
    };

    onUpdateExercises([newEx, ...exercisesList]);
    closeCreateExerciseModal();
  };

  // Manual PR form state. Records are owned by App so Dashboard and detail
  // sheets stay in sync without localStorage reads in child components.
  const [editingPrExerciseId, setEditingPrExerciseId] = useState<string | null>(null);
  const [prValue, setPrValue] = useState<number>(0);
  // 0 means "PR without a reps count", e.g. just "50 kg" — rendered as
  // a one-line badge instead of the "100 × 8" two-row layout.
  const [prReps, setPrReps] = useState<number>(0);
  const [prUnit, setPrUnit] = useState<string>('kgs');

  const exercisePRMap = useMemo(() => {
    const map = new Map<string, PRSummary>();

    const getSummary = (exerciseId: string) => {
      let summary = map.get(exerciseId);
      if (!summary) {
        const manual = manualPRs[exerciseId];
        summary = {
          maxWeight: manual ? manual.value : 0,
          // 0 here means "reps not tracked" — display logic uses this to
          // render a one-line PR (e.g. "PR 50 kg") instead of "PR 100 × 8".
          maxRepsAtMaxWeight: manual?.reps ?? 0,
          manualUnit: manual ? manual.unit : undefined
        };
        map.set(exerciseId, summary);
      }
      return summary;
    };

    Object.keys(manualPRs).forEach(getSummary);

    if (history && Array.isArray(history)) {
      history.forEach(session => {
        if (session.exercises && Array.isArray(session.exercises)) {
          session.exercises.forEach(loggedEx => {
            const summary = getSummary(loggedEx.exerciseId);

            if (loggedEx.sets && Array.isArray(loggedEx.sets)) {
              loggedEx.sets.forEach(set => {
                if (set.completed) {
                  if (set.weight > summary.maxWeight) {
                    summary.maxWeight = set.weight;
                    summary.maxRepsAtMaxWeight = set.reps;
                  } else if (set.weight === summary.maxWeight && set.reps > summary.maxRepsAtMaxWeight) {
                    summary.maxRepsAtMaxWeight = set.reps;
                  }
                }
              });
            }
          });
        }
      });
    }

    return map;
  }, [history, manualPRs]);

  const currentSelectedRoutine = routines.find(r => r.id === selectedRoutineId) || routines[0];

  const handleToggleExerciseInCurrentRoutine = (exerciseId: string) => {
    if (!currentSelectedRoutine) return;

    const isIncluded = currentSelectedRoutine.exercises.some(planned => planned.exerciseId === exerciseId);
    const nextExercises = isIncluded
      ? currentSelectedRoutine.exercises.filter(planned => planned.exerciseId !== exerciseId)
      : [...currentSelectedRoutine.exercises, buildPlannedExercise(exerciseId)];

    onUpdateRoutines(routines.map(routine =>
      routine.id === currentSelectedRoutine.id
        ? { ...routine, exercises: nextExercises }
        : routine
    ));
  };

  return (
    <div id="dashboard-tab-container" className="space-y-6 max-w-lg mx-auto w-full pb-12">
      
      {/* Dynamic Sub-header Navigation */}
      <div className="flex bg-zinc-900/40 border border-zinc-900 p-1 rounded-2xl text-xs w-full">
        <button
          onClick={() => onActiveTabChange('routines')}
          className={`flex-1 py-3.5 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            activeTab === 'routines'
              ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow shadow-black'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Workout Plan
        </button>

        <button
          onClick={() => onActiveTabChange('library')}
          className={`flex-1 py-3.5 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
            activeTab === 'library'
              ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow shadow-black'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exercise Library
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: ROUTINES LIST */}
      {activeTab === 'routines' && (
        <div className="space-y-5 animate-fade-in" id="dashboard-routines-view">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your Routines</h2>
            </div>
            
            <button
              onClick={() => {
                setEditingRoutineId(null);
                setRoutineFormName('');
                setRoutineFormExercises([]);
                setIsEditingRoutine(false);
                setShowRoutineModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] hover:from-[rgb(var(--accent-500))] rounded-xl text-xs font-bold text-white shadow-lg shadow-[rgb(var(--accent-950)/0.20)] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Routine
            </button>
          </div>

          {/* Left-to-right horizontal scroll routines selector */}
          {routines.length > 0 && (
            <div className="relative -mx-1">
              <div className="flex gap-2.5 overflow-x-auto pb-2 px-1 pr-8">
                {routines.map((routine, index) => {
                  const isSelected = routine.id === currentSelectedRoutine?.id;
                  return (
                    <div
                      key={routine.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => onSelectRoutineId(routine.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRoutineId(routine.id); } }}
                      className={`relative shrink-0 w-40 text-left p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-[88px] cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] text-white border-[rgb(var(--accent-500))] shadow-lg shadow-[rgb(var(--accent-950)/0.20)]'
                          : 'bg-zinc-900/30 text-zinc-400 border-zinc-900/80 hover:text-zinc-300 hover:bg-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <span className={`text-xs font-black tracking-tight line-clamp-2 pr-1 ${isSelected ? 'text-white font-extrabold' : 'text-zinc-300'}`}>
                        {routine.name}
                      </span>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-extrabold ${isSelected ? 'text-[rgb(var(--accent-200))]' : 'text-zinc-500'}`}>
                          {routine.exercises.length} Exercises
                        </span>
                        {routines.length > 1 && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleMoveRoutine(index, -1); }}
                              disabled={index === 0}
                              aria-label={`Move ${routine.name} earlier`}
                              className={`p-0.5 rounded transition disabled:opacity-25 ${isSelected ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleMoveRoutine(index, 1); }}
                              disabled={index === routines.length - 1}
                              aria-label={`Move ${routine.name} later`}
                              className={`p-0.5 rounded transition disabled:opacity-25 ${isSelected ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {routines.length > 2 && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-black via-black/70 to-transparent flex items-center justify-end pr-1">
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              )}
            </div>
          )}

          {/* Detailed View for Current Selected Routine */}
          {currentSelectedRoutine ? (
            <div
              id={`routine-box-${currentSelectedRoutine.id}`}
              className={`bg-zinc-900/35 border border-zinc-900 rounded-3xl p-5 hover:border-zinc-800/80 transition duration-300 shadow-xl relative overflow-hidden ${
                highlightRoutineId === currentSelectedRoutine.id ? 'ring-2 ring-[rgb(var(--accent-500)/0.80)] animate-pulse' : ''
              }`}
            >
              <div className="flex items-start justify-between border-b border-zinc-950 pb-4 gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  {renamingRoutineId === currentSelectedRoutine.id ? (
                    <input
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onBlur={commitRenameRoutine}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRenameRoutine();
                        if (e.key === 'Escape') cancelRenameRoutine();
                      }}
                      maxLength={40}
                      className="w-full bg-zinc-950 border border-[rgb(var(--accent-600)/0.60)] focus:border-[rgb(var(--accent-500))] focus:ring-1 focus:ring-[rgb(var(--accent-600)/0.30)] rounded-lg px-2 py-1 text-base font-black text-white tracking-tight focus:outline-none"
                    />
                  ) : (
                    <h3
                      onClick={() => beginRenameRoutine(currentSelectedRoutine)}
                      className="text-base font-black text-white tracking-tight cursor-text hover:text-[rgb(var(--accent-200))] transition inline-flex items-center gap-1.5 group/name max-w-full"
                      title="Tap to rename"
                    >
                      <span className="truncate">{currentSelectedRoutine.name}</span>
                      <Edit2 className="w-3 h-3 text-zinc-600 group-hover/name:text-[rgb(var(--accent-400))] transition shrink-0" />
                    </h3>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[rgb(var(--accent-500))] uppercase tracking-wider">
                    <span>{currentSelectedRoutine.exercises.length} Exercises Planned</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDuplicateRoutine(currentSelectedRoutine)}
                    className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-[rgb(var(--accent-300))] transition"
                    title="Duplicate routine"
                    aria-label="Duplicate routine"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEditRoutine(currentSelectedRoutine)}
                    className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white transition"
                    title="Edit routine blueprint"
                    aria-label="Edit routine blueprint"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {routines.length > 1 && (
                    <button
                      onClick={() => handleDeleteRoutine(currentSelectedRoutine.id)}
                      className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-red-400 transition"
                      title="Delete routine blueprint"
                      aria-label="Delete routine blueprint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>              {/* Vertical list of planned exercises showing personalized PR stats with stunning bento upgrade */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center pl-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Planned Exercises & Stats</span>
                </div>
                
                {currentSelectedRoutine.exercises.map((planned, index) => {
                  const linkedEx = exercisesList.find(e => e.id === planned.exerciseId);
                  if (!linkedEx) return null;

                  const { maxWeight, maxRepsAtMaxWeight, manualUnit } = exercisePRMap.get(planned.exerciseId) || {
                    maxWeight: 0,
                    maxRepsAtMaxWeight: 0,
                    manualUnit: undefined
                  };

                  const cardBorder = getCategoryTheme(linkedEx.category).cardBorder;

                  return (
                     <div
                      key={planned.id || index}
                      onClick={() => onViewExercise(linkedEx, { routineId: currentSelectedRoutine.id, exerciseId: planned.exerciseId })}
                      className={`p-4 bg-zinc-950/45 hover:bg-zinc-950/80 rounded-2xl border border-zinc-900/50 border-l-4 ${cardBorder} cursor-pointer transition-all duration-200 flex flex-col gap-3 group shadow-md shadow-black/20 hover:scale-[101%]`}
                      title="View guide & edit routine targets"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <PoseIcon name={linkedEx.poseIcon} size={42} className="shrink-0" />
                          <div>
                            <span className="font-extrabold text-xs text-white leading-tight block tracking-tight group-hover:text-[rgb(var(--accent-400))] transition-colors">
                              {linkedEx.name}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 capitalize">{linkedEx.equipment}</span>
                              <span className="text-zinc-800 text-[9px]">•</span>
                              <span className="text-[9px] uppercase font-bold text-zinc-400 capitalize">{linkedEx.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right column: sets/value badge + PR button on the
                            SAME row so every card has a single horizontal
                            metrics strip regardless of measurement type. */}
                        <div className="shrink-0 flex items-center gap-2">
                          {(() => {
                            const traits = getUnitTraits(planned.unit);
                            // For weight×reps movements with a pinned working
                            // load, the second badge line shows that load (e.g.
                            // "50 KG") so it reads beside the PR pill — the main
                            // working weight vs the all-time best. Otherwise the
                            // line just carries the unit label.
                            const hasWeight = traits.metric === 'weight-reps' && !!planned.targetWeight;
                            return (
                              <span className="font-mono text-xs bg-zinc-900 text-zinc-300 border border-zinc-800 font-black px-2.5 py-1.5 rounded-xl inline-flex flex-col items-center leading-tight shadow-inner min-w-[58px]">
                                <span>
                                  {traits.supportsSets
                                    ? <>{planned.sets} × {planned.reps}</>
                                    : <>{planned.reps}</>
                                  }
                                </span>
                                {hasWeight ? (
                                  <span className="uppercase tracking-widest text-[9px] font-extrabold">
                                    <span className="text-zinc-200">{planned.targetWeight}</span>{' '}
                                    <span className="text-[rgb(var(--accent-400))]">{traits.shortLabel}</span>
                                  </span>
                                ) : (
                                  <span className="text-[rgb(var(--accent-400))] font-extrabold uppercase tracking-widest text-[9px]">{traits.shortLabel}</span>
                                )}
                              </span>
                            );
                          })()}

                          {maxWeight > 0 ? (() => {
                            // Mirror the sets-reps badge's two-row structure:
                            // value (with optional × reps) on top, unit on
                            // bottom, so the right strip stays visually
                            // coherent between "4 × 6-10 / REPS" on the left
                            // pill and "PR 100 × 8 / KG" on the right pill.
                            const prTraits = getUnitTraits(manualUnit || planned.unit);
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPrExerciseId(planned.exerciseId);
                                  setPrValue(maxWeight);
                                  setPrReps(maxRepsAtMaxWeight);
                                  setPrUnit(manualUnit || planned.unit || 'kgs');
                                }}
                                className="font-mono text-xs text-[rgb(var(--accent-200))] hover:text-[rgb(var(--accent-100))] font-black bg-[rgb(var(--accent-600)/0.15)] hover:bg-[rgb(var(--accent-600)/0.25)] border border-[rgb(var(--accent-500)/0.30)] px-2.5 py-1.5 rounded-xl transition-all duration-150 active:scale-95 uppercase tracking-wide inline-flex flex-col items-center leading-tight min-w-[58px]"
                                title="Edit Personal Record"
                              >
                                <span className="whitespace-nowrap">
                                  <span className="text-[9px] text-[rgb(var(--accent-400))] tracking-widest mr-1">PR</span>
                                  {maxWeight}
                                  {maxRepsAtMaxWeight > 0 && (
                                    <> <span className="text-[rgb(var(--accent-400)/0.60)]">×</span> {maxRepsAtMaxWeight}</>
                                  )}
                                </span>
                                <span className="text-[rgb(var(--accent-400))] font-extrabold uppercase tracking-widest text-[9px]">{prTraits.shortLabel}</span>
                              </button>
                            );
                          })() : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPrExerciseId(planned.exerciseId);
                                setPrValue(0);
                                setPrReps(0);
                                setPrUnit(planned.unit || 'kgs');
                              }}
                              className="text-[9px] text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))] font-black tracking-widest uppercase bg-[rgb(var(--accent-600)/0.15)] px-2.5 py-1.5 rounded-lg border border-[rgb(var(--accent-500)/0.25)] hover:bg-[rgb(var(--accent-600)/0.20)] transition-all duration-150 active:scale-95 min-w-[52px]"
                            >
                              Log PR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded-3xl">
              <span className="text-xs text-zinc-500 block">No workout routines created yet. Create one to begin tracking!</span>
            </div>
          )}
        </div>
      )}
        {/* TAB 2: EXERCISE REFERENCE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4 animate-fade-in" id="dashboard-library-panel">

          {/* Search bar + inline CUSTOM action — replaces the old header
              "EXERCISE REFERENCE DATABASE" block to save vertical space. */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exercises, muscles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-[rgb(var(--accent-600))] focus:ring-1 focus:ring-[rgb(var(--accent-600)/0.30)] transition pl-10 pr-10 py-3 text-xs rounded-2xl text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-300 rounded"
                  aria-label="Clear exercise search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowCreateExModal(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl text-[10px] uppercase font-black text-zinc-300 hover:text-white hover:border-[rgb(var(--accent-700))] transition duration-150"
              title="Create a custom exercise"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[rgb(var(--accent-400))]" /> Custom
            </button>
          </div>

          {/* Filter card */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-0.5 block">Refine by muscle &amp; equipment</span>
              {(searchQuery || selectedCategory !== 'all' || selectedEquipment !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-[9px] font-black uppercase tracking-wider text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))] transition duration-150"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Filter Pills list with custom category tag colors */}
            <div className="flex flex-col space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-1">Muscle Target Segment</span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {categories.map(cat => {
                  const count = getCategoryCount(cat);
                  const isSelected = selectedCategory === cat;
                  const isUnavailable = count === 0 && !isSelected;
                  
                  const theme = getFilterTheme(cat);

                  return (
                    <button
                      key={cat}
                      onClick={
                        isUnavailable
                          ? undefined
                          : () => setSelectedCategory(cat === selectedCategory ? 'all' : cat)
                      }
                      disabled={isUnavailable}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition border flex items-center gap-1.5 ${
                        isSelected
                          ? `${theme.pillActive} shadow-sm`
                          : isUnavailable
                            ? `${theme.pillIdle} opacity-40 cursor-not-allowed`
                            : theme.pillIdle
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                        isSelected ? theme.countActive : theme.countIdle
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment preferences with dynamic count */}
            <div className="flex flex-col space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-1">Equipment preference</span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {equipments.map(eq => {
                  const count = getEquipmentCount(eq);
                  const isSelected = selectedEquipment === eq;
                  const isUnavailable = count === 0 && !isSelected;
                  return (
                    <button
                      key={eq}
                      onClick={
                        isUnavailable
                          ? undefined
                          : () => setSelectedEquipment(eq === selectedEquipment ? 'all' : eq)
                      }
                      disabled={isUnavailable}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[rgb(var(--accent-600)/0.15)] text-[rgb(var(--accent-300))] border-[rgb(var(--accent-500)/0.40)] shadow-sm'
                          : isUnavailable
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-40 cursor-not-allowed'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="capitalize">{eq}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                        isSelected ? 'bg-[rgb(var(--accent-500)/0.30)] text-[rgb(var(--accent-300))]' : 'bg-zinc-950 text-zinc-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results scroller grid */}
          <div className="space-y-3">
            <span className="text-zinc-500 text-[10px] font-bold">
              Showing {filteredExercises.length} of {exercisesList.length}
            </span>
            {filteredExercises.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-zinc-900 bg-zinc-950/10 rounded-3xl flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 block">No exercises match your filters.</span>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 rounded-xl border border-[rgb(var(--accent-500)/0.25)] bg-[rgb(var(--accent-600)/0.15)] text-[9px] font-black uppercase tracking-wider text-[rgb(var(--accent-300))] hover:text-white hover:bg-[rgb(var(--accent-600)/0.20)] transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedFilteredExercises.map(group => {
                  const groupTheme = getCategoryTheme(group.category);
                  return (
                    <section key={group.category} className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${groupTheme.text}`}>
                          {groupTheme.label}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-black ${groupTheme.countIdle}`}>
                          {group.exercises.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {group.exercises.map(ex => {
                  const isPlannedInSelectedRoutine = currentSelectedRoutine?.exercises?.some(pe => pe.exerciseId === ex.id);
                  const description = ex.whatItTrains.length > 80 ? `${ex.whatItTrains.slice(0, 77).trim()}...` : ex.whatItTrains;
                  
                  const theme = getCategoryTheme(ex.category);

                  return (
                    <div
                      key={ex.id}
                      onClick={() => onViewExercise(ex)}
                      className={`p-3.5 bg-zinc-950/45 hover:bg-zinc-950/85 border border-zinc-900/50 border-l-4 ${theme.cardBorder} rounded-2xl flex items-start justify-between gap-3 cursor-pointer transition-all duration-200 group shadow-sm hover:scale-[101%]`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                          <PoseIcon name={ex.poseIcon} size={42} className="shrink-0" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-zinc-200 tracking-tight group-hover:text-[rgb(var(--accent-400))] transition-colors">{ex.name}</h4>
                              
                              {/* In-Selected-Routine dynamic overlay badge indicator */}
                              {isPlannedInSelectedRoutine && (
                                <span className="text-[7.5px] uppercase font-black text-[rgb(var(--accent-400))] bg-[rgb(var(--accent-600)/0.10)] border border-[rgb(var(--accent-500)/0.20)] px-1.5 py-0.5 rounded-full leading-none">
                                  Included Today
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-500 font-semibold leading-relaxed line-clamp-1">{description}</p>
                          
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[9px] bg-zinc-900 border border-zinc-800 font-mono text-zinc-400 font-bold px-1 py-0.5 rounded capitalize">
                                {ex.equipment}
                              </span>
                              {ex.primaryMuscles.slice(0, 1).map(muscle => (
                                <span key={muscle} className={`text-[9px] border font-bold px-1 py-0.5 rounded capitalize ${theme.chip}`}>
                                  {formatMuscleLabel(muscle)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {currentSelectedRoutine && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleExerciseInCurrentRoutine(ex.id);
                            }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition duration-150 active:scale-95 ${
                              isPlannedInSelectedRoutine
                                ? 'bg-[rgb(var(--accent-600)/0.20)] border-[rgb(var(--accent-500)/0.40)] text-[rgb(var(--accent-300))] hover:text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-[rgb(var(--accent-300))] hover:border-[rgb(var(--accent-500)/0.40)]'
                            }`}
                            title={isPlannedInSelectedRoutine ? `Remove from ${currentSelectedRoutine.name}` : `Add to ${currentSelectedRoutine.name}`}
                          >
                            {isPlannedInSelectedRoutine ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-150 mt-2" />
                      </div>
                    </div>
                  );
                })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT WORKOUT ROUTINES BLUEPRINT */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-40 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="font-extrabold text-white tracking-wide">{isEditingRoutine ? 'Edit Routine' : 'Create Routine'}</h3>
              <button
                onClick={() => {
                  setShowRoutineModal(false);
                  setIsEditingRoutine(false);
                }}
                className="text-zinc-500 hover:text-white"
                aria-label="Close custom exercise modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-grow">
              {/* Routine Name Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Routine title</label>
                <input
                  type="text"
                  placeholder="e.g. Push Day, Upper Body Strength, Legs..."
                  value={routineFormName}
                  onChange={(e) => setRoutineFormName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[rgb(var(--accent-600))]"
                />
              </div>

              {/* Exercise picker with search + filter (mirrors the Library) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Pick exercises ({routineFormExercises.length} chosen)
                  </label>
                  {(modalSearch || modalCategory !== 'all' || modalEquipment !== 'all') && (
                    <button
                      onClick={() => { setModalSearch(''); setModalCategory('all'); setModalEquipment('all'); }}
                      className="text-[9px] font-black uppercase tracking-wider text-[rgb(var(--accent-400))] hover:text-[rgb(var(--accent-300))]"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search exercises, muscles..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[rgb(var(--accent-600))]"
                  />
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category pills with color coding */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => {
                    const isSelected = modalCategory === cat;
                    const pillTheme = getFilterTheme(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setModalCategory(cat === modalCategory ? 'all' : cat)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border transition-all ${isSelected ? pillTheme.pillActive : pillTheme.pillIdle}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Equipment pills (compact) */}
                <div className="flex flex-wrap gap-1.5">
                  {equipments.map(eq => {
                    const isSelected = modalEquipment === eq;
                    return (
                      <button
                        key={eq}
                        onClick={() => setModalEquipment(eq === modalEquipment ? 'all' : eq)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border transition-all ${
                          isSelected
                            ? 'bg-[rgb(var(--accent-600)/0.15)] text-[rgb(var(--accent-200))] border-[rgb(var(--accent-500)/0.40)]'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>

                {/* Candidate list — color-coded left accent per category */}
                <div className="max-h-56 overflow-y-auto border border-zinc-900 rounded-2xl divide-y divide-zinc-900 p-1 bg-zinc-900/10">
                  {(() => {
                    const q = modalSearch.toLowerCase();
                    const candidates = exercisesList.filter(ex => {
                      const muscleStr = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])].join(' ').replace(/-/g, ' ').toLowerCase();
                      const matchesSearch = !q || ex.name.toLowerCase().includes(q) || (ex.whatItTrains || '').toLowerCase().includes(q) || muscleStr.includes(q);
                      const matchesCat = modalCategory === 'all' || ex.category === modalCategory;
                      const matchesEq = modalEquipment === 'all' || ex.equipment === modalEquipment;
                      return matchesSearch && matchesCat && matchesEq;
                    });

                    if (candidates.length === 0) {
                      return <div className="py-8 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">No matches</div>;
                    }

                    return candidates.map(ex => {
                      const isSelected = routineFormExercises.some(p => p.exerciseId === ex.id);
                      return (
                        <div
                          key={ex.id}
                          onClick={() => handleTogglePlannedExercise(ex.id)}
                          className={`p-3 flex items-center justify-between rounded-xl cursor-pointer transition border-l-4 ${getCategoryTheme(ex.category).cardBorder} ${
                            isSelected ? 'bg-zinc-900/70' : 'hover:bg-zinc-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PoseIcon name={ex.poseIcon} size={32} className="shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">{ex.name}</span>
                              <span className="text-[9px] text-zinc-500 capitalize">{ex.equipment} · {ex.category}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ml-2 ${
                            isSelected ? 'bg-[rgb(var(--accent-600))] border-[rgb(var(--accent-500))] text-white' : 'border-zinc-800 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Configure each selected exercise — 2-row layout per exercise:
                  row 1 = pose icon + name + remove, row 2 = inputs.
                  Sets input is hidden for distance cardio units (km/mi) since
                  those don't fit a "sets × value" mental model. */}
              {routineFormExercises.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Configure each exercise</label>
                  <div className="space-y-3">
                    {routineFormExercises.map((planned, index) => {
                      const matchedEx = exercisesList.find(e => e.id === planned.exerciseId);
                      if (!matchedEx) return null;
                      const traits = getUnitTraits(planned.unit);
                      return (
                        <div
                          key={planned.exerciseId}
                          className={`bg-zinc-900/40 rounded-2xl border border-zinc-900/60 border-l-4 ${getCategoryTheme(matchedEx.category).cardBorder} p-3 space-y-2.5`}
                        >
                          {/* Row 1: identity */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <PoseIcon name={matchedEx.poseIcon} size={28} className="shrink-0" />
                              <span className="text-xs font-bold text-zinc-100 truncate">{matchedEx.name}</span>
                            </div>
                            {/* Reorder + remove. Up/down swap the exercise with
                                its neighbour; disabled at the list boundaries. */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMovePlannedExercise(index, -1)}
                                disabled={index === 0}
                                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                                title="Move up"
                                aria-label={`Move ${matchedEx.name} up`}
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePlannedExercise(index, 1)}
                                disabled={index === routineFormExercises.length - 1}
                                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900 transition disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-500"
                                title="Move down"
                                aria-label={`Move ${matchedEx.name} down`}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePlannedExercise(planned.exerciseId)}
                                className="p-1 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition ml-0.5"
                                title="Remove from routine"
                                aria-label={`Remove ${matchedEx.name} from routine`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Row 2: inputs, aligned in a flex with consistent
                              widths. When unit doesn't support sets, the Sets
                              control disappears so the row stays clean. */}
                          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                            {traits.supportsSets ? (
                              <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-900">
                                <span className="text-[9px] text-zinc-500 uppercase font-bold">Sets</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={planned.sets}
                                  onChange={(e) => handleUpdatePlannedSetRep(planned.exerciseId, 'sets', parseInt(e.target.value) || 3)}
                                  className="w-8 bg-transparent text-xs text-center font-bold font-mono focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center bg-zinc-950/40 px-2.5 py-1.5 rounded-xl border border-dashed border-zinc-900 text-[9px] text-zinc-600 uppercase tracking-wider font-bold">
                                no sets
                              </div>
                            )}

                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">{traits.supportsSets ? 'Target' : traits.shortLabel}</span>
                              <input
                                type="text"
                                placeholder={traits.supportsSets ? '8-12' : traits.defaultValue}
                                value={planned.reps}
                                onChange={(e) => handleUpdatePlannedSetRep(planned.exerciseId, 'reps', e.target.value)}
                                className="w-14 bg-transparent text-xs text-center font-bold focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">Unit</span>
                              <select
                                value={planned.unit || 'reps'}
                                onChange={(e) => handleUpdatePlannedSetRep(planned.exerciseId, 'unit', e.target.value)}
                                className="bg-transparent text-xs font-black focus:outline-none text-zinc-200 text-center cursor-pointer border-none"
                              >
                                {(Object.keys(UNIT_TRAITS) as Array<keyof typeof UNIT_TRAITS>).map(u => (
                                  <option key={u} value={u} className="bg-zinc-950">{UNIT_TRAITS[u].shortLabel}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Row 3: working-weight stepper — only meaningful for
                              weight×reps units. Lets the user pin the load they
                              actually train at, which shows on the plan card
                              beside their PR (e.g. main 50 kg, PR 55). */}
                          {traits.metric === 'weight-reps' && (
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">Working {traits.shortLabel}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePlannedSetRep(planned.exerciseId, 'weight', (planned.targetWeight || 0) - traits.step)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition active:scale-95 text-sm font-black leading-none"
                                  title={`Decrease by ${traits.step}`}
                                  aria-label={`Decrease working weight by ${traits.step} ${traits.shortLabel}`}
                                >
                                  −
                                </button>
                                <span className="font-mono text-xs font-black text-zinc-200 min-w-[40px] text-center tabular-nums">
                                  {planned.targetWeight ? planned.targetWeight : '—'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePlannedSetRep(planned.exerciseId, 'weight', (planned.targetWeight || 0) + traits.step)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition active:scale-95 text-sm font-black leading-none"
                                  title={`Increase by ${traits.step}`}
                                  aria-label={`Increase working weight by ${traits.step} ${traits.shortLabel}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-3">
              <button
                onClick={() => {
                  setShowRoutineModal(false);
                  setIsEditingRoutine(false);
                }}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoutine}
                disabled={!routineFormName.trim() || routineFormExercises.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] disabled:opacity-30 rounded-xl text-xs font-extrabold text-white"
              >
                Save blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOM EXERCISE CREATOR */}
      {showCreateExModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-40 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="font-extrabold text-white tracking-wide text-base">Compile Custom Exercise</h3>
              <button
                onClick={closeCreateExerciseModal}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-grow text-xs">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Bench Cable Fly"
                  value={customExName}
                  onChange={(e) => setCustomExName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Category & Equipment Selector grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Biomechanics Category</label>
                  <select
                    value={customExCategory}
                    onChange={(e: any) => setCustomExCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none"
                  >
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="arms">Arms</option>
                    <option value="legs">Legs</option>
                    <option value="core">Core</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Equipment Type</label>
                  <select
                    value={customExEquipment}
                    onChange={(e: any) => setCustomExEquipment(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none"
                  >
                    <option value="barbell">Barbell</option>
                    <option value="dumbbell">Dumbbell</option>
                    <option value="machine">Machine</option>
                    <option value="cable">Cable</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="bands">Resistance Bands</option>
                    <option value="kettlebell">Kettlebell</option>
                    <option value="cardio">Cardio Device</option>
                  </select>
                </div>
              </div>

              {/* What it trains */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">What It Trains (Brief Compound Overview)</label>
                <input
                  type="text"
                  placeholder="Target fibers loaded. Quick sentence..."
                  value={customExWhatItTrains}
                  onChange={(e) => setCustomExWhatItTrains(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Primary Muscles (target)</label>
                  <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Tap to toggle. These power the anatomy diagram.</p>
                </div>
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-zinc-900 bg-zinc-950/40 p-2 flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map(muscle => {
                    const isSelected = customExPrimaryMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleCustomMuscle(muscle, customExPrimaryMuscles, setCustomExPrimaryMuscles)}
                        aria-pressed={isSelected}
                        aria-label={`Toggle primary ${formatMuscleLabel(muscle)}`}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold capitalize transition ${
                          isSelected ? 'bg-[rgb(var(--accent-600))] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {formatMuscleLabel(muscle)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Secondary Muscles (synergists)</label>
                  <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Tap to toggle. These power the anatomy diagram.</p>
                </div>
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-zinc-900 bg-zinc-950/40 p-2 flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map(muscle => {
                    const isSelected = customExSecondaryMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => toggleCustomMuscle(muscle, customExSecondaryMuscles, setCustomExSecondaryMuscles)}
                        aria-pressed={isSelected}
                        aria-label={`Toggle secondary ${formatMuscleLabel(muscle)}`}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold capitalize transition ${
                          isSelected ? 'bg-[rgb(var(--accent-600))] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {formatMuscleLabel(muscle)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Setup */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Setup Bullet List (One step per line)</label>
                <textarea
                  placeholder="Align cables at chest height&#10;Grip handles securely&#10;Step forward slightly..."
                  value={customExSetup}
                  onChange={(e) => setCustomExSetup(e.target.value)}
                  className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Performance */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">How to Perform (one step per line)</label>
                <textarea
                  placeholder="Contract chest to squeeze hands forward&#10;Hold peak contraction&#10;Slowly return to start..."
                  value={customExPerform}
                  onChange={(e) => setCustomExPerform(e.target.value)}
                  className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Coaching Tip */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Pro Coaching Tip</label>
                <input
                  type="text"
                  placeholder="Keep shoulders relaxed to avoid trapping assists."
                  value={customExTip}
                  onChange={(e) => setCustomExTip(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-3">
              <button
                onClick={closeCreateExerciseModal}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl font-bold text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomExercise}
                disabled={!customExName.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] disabled:opacity-30 rounded-xl font-extrabold text-white"
              >
                Add to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INLINE PERSONAL RECORD (PR) MANIPULATOR */}
      {editingPrExerciseId && (() => {
        const linkedEx = exercisesList.find(e => e.id === editingPrExerciseId);
        return (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setEditingPrExerciseId(null)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 rounded-xl hover:bg-zinc-900/50 transition duration-150"
                id="close-pr-modal-btn"
                aria-label="Close record modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[rgb(var(--accent-600)/0.10)] rounded-2xl border border-[rgb(var(--accent-500)/0.20)] text-[rgb(var(--accent-400))]">
                  <Trophy className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-100 uppercase tracking-wider">Configure Record</h3>
                  <p className="text-[10px] text-zinc-400 font-bold">{linkedEx?.name}</p>
                </div>
              </div>

              <div className="space-y-4 my-5">
                {/* Value Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5">Record Weight / Value</label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5">
                    <input
                      type="number"
                      step="any"
                      value={prValue || ''}
                      onChange={(e) => setPrValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent font-bold text-xs text-zinc-100 font-mono focus:outline-none"
                      placeholder="e.g. 85"
                    />
                  </div>
                </div>

                {/* Reps Input — optional, and only relevant for weight or
                    bodyweight reps. Distance / duration PRs skip this. */}
                {getUnitTraits(prUnit).metric !== 'cardio-distance' && getUnitTraits(prUnit).metric !== 'cardio-duration' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5 flex items-center justify-between">
                      <span>Reps completed</span>
                      <span className="text-zinc-600 normal-case tracking-normal font-semibold">Optional</span>
                    </label>
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5">
                      <input
                        type="number"
                        min={0}
                        value={prReps || ''}
                        onChange={(e) => setPrReps(parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent font-bold text-xs text-zinc-100 font-mono focus:outline-none"
                        placeholder="leave blank for value-only"
                      />
                    </div>
                  </div>
                )}

                {/* Measurement Unit */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5">Measurement Unit</label>
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
                  onClick={() => setEditingPrExerciseId(null)}
                  className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[10px] uppercase font-black tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingPrExerciseId) {
                      onSaveManualPr(editingPrExerciseId, prValue, prReps, prUnit);
                      setEditingPrExerciseId(null);
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] text-white rounded-xl text-[10px] uppercase font-black tracking-wider hover:from-[rgb(var(--accent-500))] hover:to-[rgb(var(--accent-500))] transition shadow-lg"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmModal
        open={!!routineToDeleteId}
        title="Delete Routine?"
        eyebrow="Workout blueprint"
        message="This removes the planned routine from your saved workout list. Existing history stays intact."
        confirmLabel="Delete Routine"
        tone="danger"
        onConfirm={confirmDeleteRoutine}
        onCancel={() => setRoutineToDeleteId(null)}
      />

      {/* Copy-routine naming prompt */}
      {duplicateSource && (
        <Modal
          open={!!duplicateSource}
          onClose={() => { setDuplicateSource(null); setDuplicateName(''); }}
          className="p-6 space-y-5"
          labelledBy="duplicate-routine-title"
        >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--accent-400))]">Duplicate routine</span>
              <h3 id="duplicate-routine-title" className="text-base font-black text-white tracking-tight">Name your copy</h3>
              <p className="text-[11px] text-zinc-500">A new routine will be created from <span className="text-zinc-300 font-semibold">{duplicateSource.name}</span>. Leave the name as-is or change it.</p>
            </div>
            <input
              autoFocus
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmDuplicateRoutine();
                if (e.key === 'Escape') { setDuplicateSource(null); setDuplicateName(''); }
              }}
              maxLength={40}
              placeholder={`${duplicateSource.name} (Copy)`}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-[rgb(var(--accent-600))] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmDuplicateRoutine}
                className="w-full py-3 bg-[rgb(var(--accent-600))] hover:bg-[rgb(var(--accent-500))] text-white rounded-xl text-xs font-black tracking-widest uppercase transition"
              >
                Create Copy
              </button>
              <button
                onClick={() => { setDuplicateSource(null); setDuplicateName(''); }}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-black tracking-widest uppercase transition"
              >
                Cancel
              </button>
            </div>
        </Modal>
      )}
    </div>
  );
};
