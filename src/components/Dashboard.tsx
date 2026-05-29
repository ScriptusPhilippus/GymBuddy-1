/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Routine, Exercise, PlannedExercise, WorkoutSettings, WorkoutSession, MuscleGroup } from '../types';
import { PoseIcon } from './PoseIcon';
import { EXERCISES } from '../data/exercises';
import { getUnitTraits, UNIT_TRAITS } from '../data/unit-traits';
import { ConfirmModal } from './ConfirmModal';
import {
  Calendar,
  Compass,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  PlusCircle,
  X,
  Dumbbell,
  BookOpen,
  Search,
  Check,
  Edit2,
  Trash2,
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
  onViewExercise: (exercise: Exercise) => void;
  onUpdateRoutines: (updated: Routine[]) => void;
  onUpdateExercises: (updated: Exercise[]) => void;
  onUpdateSettings: (updated: WorkoutSettings) => void;
  onOpenCalendarPlanner: () => void;
  selectedRoutineId: string;
  onSelectRoutineId: (id: string) => void;
  activeTab: 'routines' | 'library';
  onActiveTabChange: (tab: 'routines' | 'library') => void;
}

interface PRSummary {
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  manualUnit?: string;
}

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'lats', 'traps', 'front-delts', 'rear-delts', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lower-back', 'glutes', 'quads', 'hamstrings', 'calves'];

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
  onOpenCalendarPlanner,
  selectedRoutineId,
  onSelectRoutineId,
  activeTab,
  onActiveTabChange
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

  // Toggle exercise selected inside editing routine state
  const handleTogglePlannedExercise = (exerciseId: string) => {
    setRoutineFormExercises(prev => {
      const idx = prev.findIndex(item => item.exerciseId === exerciseId);
      if (idx !== -1) {
        // remove
        return prev.filter(item => item.exerciseId !== exerciseId);
      } else {
        // add
        return [
          ...prev,
          {
            id: `plan-${Date.now()}-${Math.random()}`,
            exerciseId,
            sets: 3,
            reps: '10'
          }
        ];
      }
    });
  };

  // Modify set targets inside routine builder
  const handleUpdatePlannedSetRep = (exerciseId: string, field: 'sets' | 'reps' | 'unit', value: any) => {
    setRoutineFormExercises(prev =>
      prev.map(planned => {
        if (planned.exerciseId !== exerciseId) return planned;
        const next = { ...planned, [field]: value };
        // When the user switches to a unit that doesn't support multiple
        // sets (km, sec, min — one-shot cardio), normalize sets to 1 so
        // the persisted data matches the visible "no sets" UI.
        if (field === 'unit' && !getUnitTraits(value).supportsSets) {
          next.sets = 1;
        }
        return next;
      })
    );
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

  // Manual PR override state and supporting forms
  const [manualPRs, setManualPRs] = useState<Record<string, { value: number; reps?: number; unit: string }>>(() => {
    const stored = localStorage.getItem('gym_manual_prs');
    return stored ? JSON.parse(stored) : {};
  });

  const [editingPrExerciseId, setEditingPrExerciseId] = useState<string | null>(null);
  const [prValue, setPrValue] = useState<number>(0);
  // 0 means "PR without a reps count", e.g. just "50 kg" — rendered as
  // a one-line badge instead of the "100 × 8" two-row layout.
  const [prReps, setPrReps] = useState<number>(0);
  const [prUnit, setPrUnit] = useState<string>('kgs');

  const handleSaveManualPR = (exerciseId: string, value: number, reps: number, unit: string) => {
    const updated = {
      ...manualPRs,
      [exerciseId]: reps > 0 ? { value, reps, unit } : { value, unit }
    };
    setManualPRs(updated);
    localStorage.setItem('gym_manual_prs', JSON.stringify(updated));
  };

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
      : [
          ...currentSelectedRoutine.exercises,
          {
            id: `plan-${Date.now()}-${Math.random()}`,
            exerciseId,
            sets: 3,
            reps: '10'
          }
        ];

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
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-violet-950/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Routine
            </button>
          </div>

          {/* Left-to-right horizontal scroll routines selector */}
          {routines.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
                {routines.map(routine => {
                  const isSelected = routine.id === currentSelectedRoutine?.id;
                  return (
                    <button
                      key={routine.id}
                      onClick={() => onSelectRoutineId(routine.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-[84px] cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-violet-500 shadow-lg shadow-violet-950/20 shadow-md'
                          : 'bg-zinc-900/30 text-zinc-400 border-zinc-900/80 hover:text-zinc-300 hover:bg-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <span className={`text-xs font-black tracking-tight line-clamp-1 ${isSelected ? 'text-white font-extrabold' : 'text-zinc-300'}`}>
                        {routine.name}
                      </span>
                      <span className={`text-[10px] font-extrabold ${isSelected ? 'text-violet-200' : 'text-zinc-500'}`}>
                        {routine.exercises.length} Exercises
                      </span>
                    </button>
                  );
                })}
            </div>
          )}

          {/* Detailed View for Current Selected Routine */}
          {currentSelectedRoutine ? (
            <div
              id={`routine-box-${currentSelectedRoutine.id}`}
              className="bg-zinc-900/35 border border-zinc-900 rounded-3xl p-5 hover:border-zinc-800/80 transition duration-300 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-zinc-950 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white tracking-tight">{currentSelectedRoutine.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-violet-500 uppercase tracking-wider">
                    <span>{currentSelectedRoutine.exercises.length} Exercises Planned</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditRoutine(currentSelectedRoutine)}
                    className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white transition"
                    title="Edit routine blueprint"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {routines.length > 1 && (
                    <button
                      onClick={() => handleDeleteRoutine(currentSelectedRoutine.id)}
                      className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 hover:text-red-400 transition"
                      title="Delete routine blueprint"
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

                  // Colors mapped for category visuals
                  const borderThemes: Record<string, string> = {
                    chest: 'border-l-rose-500/85 group-hover:border-l-rose-500/55',
                    back: 'border-l-emerald-500/85 group-hover:border-l-emerald-500/55',
                    legs: 'border-l-blue-500/85 group-hover:border-l-blue-500/55',
                    shoulders: 'border-l-amber-500/85 group-hover:border-l-amber-500/55',
                    arms: 'border-l-violet-500/85 group-hover:border-l-violet-500/55',
                    core: 'border-l-cyan-500/85 group-hover:border-l-cyan-500/55',
                    cardio: 'border-l-indigo-500/85 group-hover:border-l-indigo-500/55'
                  };

                  return (
                     <div
                      key={planned.id || index}
                      onClick={() => onViewExercise(linkedEx)}
                      className={`p-4 bg-zinc-950/45 hover:bg-zinc-950/80 rounded-2xl border border-zinc-900/50 border-l-4 ${borderThemes[linkedEx.category] || 'border-l-violet-500'} cursor-pointer transition-all duration-200 flex flex-col gap-3 group shadow-md shadow-black/20 hover:scale-[101%]`}
                      title="View exercise guide reference"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <PoseIcon name={linkedEx.poseIcon} size={42} className="shrink-0" />
                          <div>
                            <span className="font-extrabold text-xs text-white leading-tight block tracking-tight group-hover:text-violet-400 transition-colors">
                              {linkedEx.name}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[8.5px] uppercase font-black tracking-widest text-zinc-500 capitalize">{linkedEx.equipment}</span>
                              <span className="text-zinc-800 text-[8px]">•</span>
                              <span className="text-[8.5px] uppercase font-bold text-zinc-400 capitalize">{linkedEx.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right column: sets/value badge + PR button on the
                            SAME row so every card has a single horizontal
                            metrics strip regardless of measurement type. */}
                        <div className="shrink-0 flex items-center gap-2">
                          {(() => {
                            const traits = getUnitTraits(planned.unit);
                            return (
                              <span className="font-mono text-xs bg-zinc-900 text-zinc-300 border border-zinc-800 font-black px-2.5 py-1.5 rounded-xl inline-flex flex-col items-center leading-tight shadow-inner min-w-[58px]">
                                <span>
                                  {traits.supportsSets
                                    ? <>{planned.sets} × {planned.reps}</>
                                    : <>{planned.reps}</>
                                  }
                                </span>
                                <span className="text-violet-400 font-extrabold uppercase tracking-widest text-[8px]">{traits.shortLabel}</span>
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
                                className="font-mono text-xs text-violet-200 hover:text-violet-100 font-black bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 px-2.5 py-1.5 rounded-xl transition-all duration-150 active:scale-95 uppercase tracking-wide inline-flex flex-col items-center leading-tight min-w-[58px]"
                                title="Edit Personal Record"
                              >
                                <span className="whitespace-nowrap">
                                  <span className="text-[8px] text-violet-400 tracking-widest mr-1">PR</span>
                                  {maxWeight}
                                  {maxRepsAtMaxWeight > 0 && (
                                    <> <span className="text-violet-400/60">×</span> {maxRepsAtMaxWeight}</>
                                  )}
                                </span>
                                <span className="text-violet-400 font-extrabold uppercase tracking-widest text-[8px]">{prTraits.shortLabel}</span>
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
                              className="text-[8.5px] text-violet-400 hover:text-violet-300 font-black tracking-widest uppercase bg-violet-600/15 px-2.5 py-1.5 rounded-lg border border-violet-500/25 hover:bg-violet-600/20 transition-all duration-150 active:scale-95 min-w-[52px]"
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
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition pl-10 pr-10 py-3 text-xs rounded-2xl text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-300 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowCreateExModal(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-3 bg-zinc-950 border border-zinc-900 rounded-2xl text-[10px] uppercase font-black text-zinc-300 hover:text-white hover:border-violet-700 transition duration-150"
              title="Create a custom exercise"
            >
              <PlusCircle className="w-3.5 h-3.5 text-violet-400" /> Custom
            </button>
          </div>

          {/* Filter card */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-0.5 block">Refine by muscle &amp; equipment</span>
              {(searchQuery || selectedCategory !== 'all' || selectedEquipment !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-[9px] font-black uppercase tracking-wider text-violet-400 hover:text-violet-300 transition duration-150"
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
                  
                  const catThemes: Record<string, { idle: string; active: string; countIdle: string; countActive: string }> = {
                    all: {
                      idle: 'bg-violet-600/10 border-violet-500/30 text-violet-300 hover:text-violet-200',
                      active: 'bg-violet-600/20 border-violet-500/50 text-violet-100',
                      countIdle: 'bg-violet-950/50 text-violet-300',
                      countActive: 'bg-violet-500/35 text-violet-100'
                    },
                    chest: {
                      idle: 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:text-rose-300',
                      active: 'bg-rose-500/20 border-rose-500/50 text-rose-100',
                      countIdle: 'bg-rose-950/50 text-rose-300',
                      countActive: 'bg-rose-500/30 text-rose-100'
                    },
                    back: {
                      idle: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:text-emerald-300',
                      active: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100',
                      countIdle: 'bg-emerald-950/50 text-emerald-300',
                      countActive: 'bg-emerald-500/30 text-emerald-100'
                    },
                    shoulders: {
                      idle: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:text-amber-300',
                      active: 'bg-amber-500/20 border-amber-500/50 text-amber-100',
                      countIdle: 'bg-amber-950/50 text-amber-300',
                      countActive: 'bg-amber-500/30 text-amber-100'
                    },
                    arms: {
                      idle: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:text-violet-300',
                      active: 'bg-violet-500/20 border-violet-500/50 text-violet-100',
                      countIdle: 'bg-violet-950/50 text-violet-300',
                      countActive: 'bg-violet-500/30 text-violet-100'
                    },
                    legs: {
                      idle: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:text-blue-300',
                      active: 'bg-blue-500/20 border-blue-500/50 text-blue-100',
                      countIdle: 'bg-blue-950/50 text-blue-300',
                      countActive: 'bg-blue-500/30 text-blue-100'
                    },
                    core: {
                      idle: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:text-cyan-300',
                      active: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100',
                      countIdle: 'bg-cyan-950/50 text-cyan-300',
                      countActive: 'bg-cyan-500/30 text-cyan-100'
                    },
                    cardio: {
                      idle: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:text-indigo-300',
                      active: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100',
                      countIdle: 'bg-indigo-950/50 text-indigo-300',
                      countActive: 'bg-indigo-500/30 text-indigo-100'
                    }
                  };
                  const theme = catThemes[cat] || catThemes.all;

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
                          ? `${theme.active} shadow-sm`
                          : isUnavailable
                            ? `${theme.idle} opacity-40 cursor-not-allowed`
                            : theme.idle
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-full font-black ${
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
                          ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/40 shadow-sm'
                          : isUnavailable
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-40 cursor-not-allowed'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="capitalize">{eq}</span>
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                        isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-zinc-950 text-zinc-500'
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
                  className="px-3 py-1.5 rounded-xl border border-violet-500/25 bg-violet-600/15 text-[9px] font-black uppercase tracking-wider text-violet-300 hover:text-white hover:bg-violet-600/20 transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredExercises.map(ex => {
                  const isPlannedInSelectedRoutine = currentSelectedRoutine?.exercises?.some(pe => pe.exerciseId === ex.id);
                  const description = ex.whatItTrains.length > 80 ? `${ex.whatItTrains.slice(0, 77).trim()}...` : ex.whatItTrains;
                  
                  // Category pill border
                  const categoryBorderThemes: Record<string, string> = {
                    chest: 'border-l-rose-500/60 group-hover:border-l-rose-500/35',
                    back: 'border-l-emerald-500/60 group-hover:border-l-emerald-500/35',
                    legs: 'border-l-blue-500/60 group-hover:border-l-blue-500/35',
                    shoulders: 'border-l-amber-500/60 group-hover:border-l-amber-500/35',
                    arms: 'border-l-violet-500/60 group-hover:border-l-violet-500/35',
                    core: 'border-l-cyan-500/60 group-hover:border-l-cyan-500/35',
                    cardio: 'border-l-indigo-500/60 group-hover:border-l-indigo-500/35'
                  };
                  const categoryWordThemes: Record<string, string> = {
                    chest: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                    back: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                    legs: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                    shoulders: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    arms: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
                    core: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                    cardio: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  };

                  return (
                    <div
                      key={ex.id}
                      onClick={() => onViewExercise(ex)}
                      className={`p-3.5 bg-zinc-950/45 hover:bg-zinc-950/85 border border-zinc-900/50 border-l-4 ${categoryBorderThemes[ex.category] || 'border-l-zinc-700'} rounded-2xl flex items-start justify-between gap-3 cursor-pointer transition-all duration-200 group shadow-sm hover:scale-[101%]`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                          <PoseIcon name={ex.poseIcon} size={42} className="shrink-0" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-zinc-200 tracking-tight group-hover:text-violet-400 transition-colors">{ex.name}</h4>
                              
                              {/* In-Selected-Routine dynamic overlay badge indicator */}
                              {isPlannedInSelectedRoutine && (
                                <span className="text-[7.5px] uppercase font-black text-violet-400 bg-violet-600/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full leading-none">
                                  Included Today
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-500 font-semibold leading-relaxed line-clamp-1">{description}</p>
                          
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[8px] bg-zinc-900 border border-zinc-800 font-mono text-zinc-400 font-bold px-1 py-0.5 rounded capitalize">
                                {ex.equipment}
                              </span>
                              {ex.primaryMuscles.slice(0, 1).map(muscle => (
                                <span key={muscle} className={`text-[8px] border font-bold px-1 py-0.5 rounded capitalize ${categoryWordThemes[ex.category] || 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
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
                                ? 'bg-violet-600/20 border-violet-500/40 text-violet-300 hover:text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-violet-300 hover:border-violet-500/40'
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-600"
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
                      className="text-[9px] font-black uppercase tracking-wider text-violet-400 hover:text-violet-300"
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-600"
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
                    const catColors: Record<string, string> = {
                      all: 'bg-violet-600/15 text-violet-200 border-violet-500/40',
                      chest: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
                      back: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
                      legs: 'bg-blue-500/15 text-blue-300 border-blue-500/35',
                      shoulders: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
                      arms: 'bg-violet-500/15 text-violet-300 border-violet-500/35',
                      core: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
                      cardio: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35'
                    };
                    const idleColors: Record<string, string> = {
                      all: 'bg-zinc-900 text-zinc-400 border-zinc-800',
                      chest: 'bg-zinc-900 text-rose-400/70 border-zinc-800 hover:border-rose-500/30',
                      back: 'bg-zinc-900 text-emerald-400/70 border-zinc-800 hover:border-emerald-500/30',
                      legs: 'bg-zinc-900 text-blue-400/70 border-zinc-800 hover:border-blue-500/30',
                      shoulders: 'bg-zinc-900 text-amber-400/70 border-zinc-800 hover:border-amber-500/30',
                      arms: 'bg-zinc-900 text-violet-400/70 border-zinc-800 hover:border-violet-500/30',
                      core: 'bg-zinc-900 text-cyan-400/70 border-zinc-800 hover:border-cyan-500/30',
                      cardio: 'bg-zinc-900 text-indigo-400/70 border-zinc-800 hover:border-indigo-500/30'
                    };
                    return (
                      <button
                        key={cat}
                        onClick={() => setModalCategory(cat === modalCategory ? 'all' : cat)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border transition-all ${isSelected ? catColors[cat] : idleColors[cat]}`}
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
                            ? 'bg-indigo-600/15 text-indigo-200 border-indigo-500/40'
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

                    const accent: Record<string, string> = {
                      chest: 'border-l-rose-500/70',
                      back: 'border-l-emerald-500/70',
                      legs: 'border-l-blue-500/70',
                      shoulders: 'border-l-amber-500/70',
                      arms: 'border-l-violet-500/70',
                      core: 'border-l-cyan-500/70',
                      cardio: 'border-l-indigo-500/70'
                    };

                    if (candidates.length === 0) {
                      return <div className="py-8 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">No matches</div>;
                    }

                    return candidates.map(ex => {
                      const isSelected = routineFormExercises.some(p => p.exerciseId === ex.id);
                      return (
                        <div
                          key={ex.id}
                          onClick={() => handleTogglePlannedExercise(ex.id)}
                          className={`p-3 flex items-center justify-between rounded-xl cursor-pointer transition border-l-4 ${accent[ex.category] || 'border-l-zinc-700'} ${
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
                            isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-800 text-transparent'
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
                  Sets input is hidden for cardio units (km/sec/min) since
                  those don't fit a "sets × value" mental model. */}
              {routineFormExercises.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Configure each exercise</label>
                  <div className="space-y-3">
                    {routineFormExercises.map(planned => {
                      const matchedEx = exercisesList.find(e => e.id === planned.exerciseId);
                      if (!matchedEx) return null;
                      const traits = getUnitTraits(planned.unit);
                      const accent: Record<string, string> = {
                        chest: 'border-l-rose-500/70',
                        back: 'border-l-emerald-500/70',
                        legs: 'border-l-blue-500/70',
                        shoulders: 'border-l-amber-500/70',
                        arms: 'border-l-violet-500/70',
                        core: 'border-l-cyan-500/70',
                        cardio: 'border-l-indigo-500/70'
                      };

                      return (
                        <div
                          key={planned.exerciseId}
                          className={`bg-zinc-900/40 rounded-2xl border border-zinc-900/60 border-l-4 ${accent[matchedEx.category] || 'border-l-zinc-700'} p-3 space-y-2.5`}
                        >
                          {/* Row 1: identity */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <PoseIcon name={matchedEx.poseIcon} size={28} className="shrink-0" />
                              <span className="text-xs font-bold text-zinc-100 truncate">{matchedEx.name}</span>
                            </div>
                            <button
                              onClick={() => handleTogglePlannedExercise(planned.exerciseId)}
                              className="shrink-0 p-1 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition"
                              title="Remove from routine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-30 rounded-xl text-xs font-extrabold text-white"
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
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold capitalize transition ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
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
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold capitalize transition ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
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
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-30 rounded-xl font-extrabold text-white"
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
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-violet-600/10 rounded-2xl border border-violet-500/20 text-violet-400">
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
                      handleSaveManualPR(editingPrExerciseId, prValue, prReps, prUnit);
                      setEditingPrExerciseId(null);
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-[10px] uppercase font-black tracking-wider hover:from-violet-500 hover:to-indigo-500 transition shadow-lg"
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
    </div>
  );
};
