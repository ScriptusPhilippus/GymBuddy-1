/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Routine, Exercise, PlannedExercise, WorkoutSettings, WorkoutSession, MuscleGroup } from '../types';
import { PoseIcon } from './PoseIcon';
import { EXERCISES } from '../data/exercises';
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
  timesPerformed: number;
  isManual: boolean;
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
        if (planned.exerciseId === exerciseId) {
          return { ...planned, [field]: value };
        }
        return planned;
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
  const [prReps, setPrReps] = useState<number>(1);
  const [prUnit, setPrUnit] = useState<string>('kgs');

  const handleSaveManualPR = (exerciseId: string, value: number, reps: number, unit: string) => {
    const updated = {
      ...manualPRs,
      [exerciseId]: { value, reps, unit }
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
          maxRepsAtMaxWeight: manual ? (manual.reps || 1) : 0,
          timesPerformed: 0,
          isManual: !!manual,
          manualUnit: manual ? manual.unit : undefined
        };
        map.set(exerciseId, summary);
      }
      return summary;
    };

    Object.keys(manualPRs).forEach(getSummary);

    if (history && Array.isArray(history)) {
      history.forEach(session => {
        const foundExerciseIds = new Set<string>();

        if (session.exercises && Array.isArray(session.exercises)) {
          session.exercises.forEach(loggedEx => {
            foundExerciseIds.add(loggedEx.exerciseId);
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

        foundExerciseIds.forEach(exerciseId => {
          getSummary(exerciseId).timesPerformed++;
        });
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

                  const { maxWeight, maxRepsAtMaxWeight, timesPerformed, isManual, manualUnit } = exercisePRMap.get(planned.exerciseId) || {
                    maxWeight: 0,
                    maxRepsAtMaxWeight: 0,
                    timesPerformed: 0,
                    isManual: false,
                    manualUnit: undefined
                  };

                  // Colors mapped for category visuals
                  const borderThemes: Record<string, string> = {
                    chest: 'border-l-rose-500/85',
                    back: 'border-l-emerald-500/85',
                    legs: 'border-l-blue-500/85',
                    shoulders: 'border-l-amber-500/85',
                    arms: 'border-l-violet-500/85',
                    core: 'border-l-cyan-500/85',
                    cardio: 'border-l-indigo-500/85'
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
                          <div className="p-1 bg-zinc-900 border border-zinc-800 rounded-xl relative">
                            <PoseIcon name={linkedEx.poseIcon} size={36} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-white leading-tight block tracking-tight group-hover:text-violet-400 transition-colors">
                              {linkedEx.name}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[8.5px] uppercase font-black tracking-widest text-zinc-500 capitalize">{linkedEx.equipment}</span>
                              <span className="text-zinc-800 text-[8px]">•</span>
                              <span className="text-[8.5px] uppercase font-bold text-zinc-400 capitalize">{linkedEx.category}</span>
                              
                              {timesPerformed > 0 && (
                                <>
                                  <span className="text-zinc-800 text-[8px]">•</span>
                                  <span className="text-[8.5px] text-zinc-500 font-semibold">
                                    {timesPerformed}× logged
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sets specs badge */}
                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs bg-zinc-900 text-zinc-300 border border-zinc-800 font-black px-2.5 py-1.5 rounded-xl inline-flex flex-col items-center leading-tight shadow-inner">
                            <span>{planned.sets} × {planned.reps}</span>
                            <span className="text-violet-400 font-extrabold uppercase tracking-widest text-[8px]">{planned.unit || 'reps'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Organized Personal Record block - handles custom units beautifully! */}
                      <div className="border-t border-zinc-900/40 pt-2.5 flex flex-wrap items-center justify-between gap-y-2 mt-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-0.5 pr-1">
                          <Trophy className="w-3 h-3 text-amber-500 fill-current shrink-0" /> Records
                        </span>

                        {maxWeight > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-900/80 font-mono text-[11px] font-black">
                              <span className="text-zinc-100 font-extrabold">{maxWeight}</span>
                              <span className="text-[9.5px] font-extrabold text-zinc-500 uppercase tracking-wide">{manualUnit || settings.weightUnit}</span>
                              <span className="text-zinc-700 text-[9px] px-1 font-sans">for</span>
                              <span className="text-zinc-100 font-extrabold">{maxRepsAtMaxWeight}</span>
                              <span className="text-[9.5px] font-extrabold text-zinc-500 uppercase tracking-wide">reps</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPrExerciseId(planned.exerciseId);
                                setPrValue(maxWeight);
                                setPrReps(maxRepsAtMaxWeight);
                                setPrUnit(manualUnit || planned.unit || 'kgs');
                              }}
                              className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 rounded-lg duration-150 border border-zinc-800 transition-all active:scale-95"
                              title="Edit Personal Record"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPrExerciseId(planned.exerciseId);
                              setPrValue(0);
                              setPrReps(1);
                              setPrUnit(planned.unit || 'kgs');
                            }}
                            className="text-[8.5px] text-violet-400 hover:text-violet-300 font-black tracking-widest uppercase bg-violet-600/15 px-3 py-1.5 rounded-xl border border-violet-500/25 hover:bg-violet-600/20 transition-all duration-150 active:scale-95"
                          >
                            Log PR
                          </button>
                        )}
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
          
          <div className="flex items-center justify-between pointer-events-auto">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Exercise Reference Database</h2>
              <span className="text-[10px] text-zinc-500 font-bold">Browse blueprints, instructions & primary targets</span>
            </div>
            
            <button
              onClick={() => setShowCreateExModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] uppercase font-black text-zinc-300 hover:text-white transition duration-150"
            >
              <PlusCircle className="w-3.5 h-3.5 text-violet-400" /> Custom
            </button>
          </div>

          {/* Precise search & filtering row */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 pl-0.5 block">Filters</span>
              {(searchQuery || selectedCategory !== 'all' || selectedEquipment !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-[9px] font-black uppercase tracking-wider text-violet-400 hover:text-violet-300 transition duration-150"
                >
                  Reset Active Filters
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search exercise catalog, targeted trains info..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition pl-10 pr-10 py-3 text-xs rounded-2xl text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 p-0.5 text-zinc-500 hover:text-zinc-300 rounded"
                >
                  <X className="w-3.5 h-3.5" />
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
                  
                  // Dynamic badge tags based on selected category styling
                  const catThemes: Record<string, string> = {
                    all: 'hover:text-violet-400',
                    chest: 'text-rose-400 hover:text-rose-300 bg-rose-500/10 border-rose-500/20',
                    back: 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
                    legs: 'text-blue-400 hover:text-blue-300 bg-blue-500/10 border-blue-500/20',
                    shoulders: 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border-amber-500/20',
                    arms: 'text-violet-400 hover:text-violet-300 bg-violet-500/10 border-violet-500/20',
                    core: 'text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
                    cardio: 'text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
                  };

                  return (
                    <button
                      key={cat}
                      onClick={isUnavailable ? undefined : () => setSelectedCategory(cat)}
                      disabled={isUnavailable}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-violet-600/15 text-violet-300 border-violet-500/40 shadow-sm'
                          : isUnavailable
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-40 cursor-not-allowed'
                          : `bg-zinc-900 border-zinc-800 text-zinc-400 ${catThemes[cat] || 'hover:text-zinc-200'}`
                      }`}
                    >
                      <span className="capitalize">{cat}</span>
                      <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                        isSelected ? 'bg-violet-500/30 text-violet-200' : 'bg-zinc-950 text-zinc-500'
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
                      onClick={isUnavailable ? undefined : () => setSelectedEquipment(eq)}
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
                    chest: 'border-l-rose-500/60',
                    back: 'border-l-emerald-500/60',
                    legs: 'border-l-blue-500/60',
                    shoulders: 'border-l-amber-500/60',
                    arms: 'border-l-violet-500/60',
                    core: 'border-l-cyan-500/60',
                    cardio: 'border-l-indigo-500/60'
                  };

                  return (
                    <div
                      key={ex.id}
                      onClick={() => onViewExercise(ex)}
                      className={`p-3.5 bg-zinc-950/45 hover:bg-zinc-950/85 border border-zinc-900/50 border-l-4 ${categoryBorderThemes[ex.category] || 'border-l-zinc-700'} hover:border-zinc-800 rounded-2xl flex items-start justify-between gap-3 cursor-pointer transition duration-150 group shadow-sm`}
                    >
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0">
                            <PoseIcon name={ex.poseIcon} size={36} className="shrink-0 scale-95 transition-transform group-hover:scale-105" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-zinc-200 tracking-tight group-hover:text-violet-400 transition-colors">{ex.name}</h4>
                              
                              {/* In-Selected-Routine dynamic overlay badge indicator */}
                              {isPlannedInSelectedRoutine && (
                                <span className="text-[7.5px] uppercase font-black text-violet-400 bg-violet-600/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full leading-none">
                                  Included Today
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-zinc-500 font-semibold mb-1 leading-relaxed line-clamp-2">{description}</p>
                          
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[8px] bg-zinc-900 border border-zinc-800 font-mono text-zinc-400 font-bold px-1 py-0.5 rounded capitalize">
                              {ex.equipment}
                            </span>
                            {ex.primaryMuscles.slice(0, 1).map(muscle => (
                              <span key={muscle} className="text-[8px] bg-blue-600/5 border border-blue-500/10 text-blue-400 font-bold px-1 py-0.5 rounded capitalize">
                                {formatMuscleLabel(muscle)}
                              </span>
                            ))}
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
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition duration-150 mt-2" />
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

              {/* Exercises selector checklist */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter and choose exercises ({routineFormExercises.length} chosen)</label>
                <div className="max-h-56 overflow-y-auto border border-zinc-900 rounded-2xl divide-y divide-zinc-900 p-1 bg-zinc-900/10">
                  {exercisesList.map(ex => {
                    const isSelected = routineFormExercises.some(p => p.exerciseId === ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => handleTogglePlannedExercise(ex.id)}
                        className={`p-3.5 flex items-center justify-between rounded-xl cursor-pointer transition ${
                          isSelected ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <PoseIcon name={ex.poseIcon} size={32} className="shrink-0 scale-90" />
                          <div>
                            <span className="text-xs font-bold text-white block">{ex.name}</span>
                            <span className="text-[9px] text-zinc-500 capitalize">{ex.equipment}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-800 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adjust sets and reps for selected exercises */}
              {routineFormExercises.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Configure Planned Sets & Reps</label>
                  <div className="space-y-3">
                    {routineFormExercises.map(planned => {
                      const matchedEx = exercisesList.find(e => e.id === planned.exerciseId);
                      if (!matchedEx) return null;

                      return (
                        <div key={planned.exerciseId} className="p-3 bg-zinc-900/40 rounded-2xl border border-zinc-900/60 flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-zinc-300 truncate shrink-0 max-w-[120px]">{matchedEx.name}</span>
                          
                          <div className="flex items-center gap-3">
                            {/* Sets target */}
                            <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">Sets</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={planned.sets}
                                onChange={(e) => handleUpdatePlannedSetRep(planned.exerciseId, 'sets', parseInt(e.target.value) || 3)}
                                className="w-6 bg-transparent text-xs text-center font-bold font-mono focus:outline-none"
                              />
                            </div>

                            {/* Reps scope e.g. "8-12" */}
                            <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">Target</span>
                              <input
                                type="text"
                                placeholder="8-12"
                                value={planned.reps}
                                onChange={(e) => handleUpdatePlannedSetRep(planned.exerciseId, 'reps', e.target.value)}
                                className="w-12 bg-transparent text-xs text-center font-bold focus:outline-none"
                              />
                            </div>

                            {/* Measurement unit dropdown selection */}
                            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-900">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">Unit</span>
                              <select
                                value={planned.unit || 'reps'}
                                onChange={(e) => handleUpdatePlannedSetRep(planned.exerciseId, 'unit', e.target.value)}
                                className="bg-transparent text-xs font-black focus:outline-none text-zinc-300 text-center cursor-pointer border-none"
                              >
                                <option value="reps" className="bg-zinc-950">reps</option>
                                <option value="kgs" className="bg-zinc-950">kgs</option>
                                <option value="lbs" className="bg-zinc-950">lbs</option>
                                <option value="kms" className="bg-zinc-950">kms</option>
                                <option value="sec" className="bg-zinc-950">sec</option>
                                <option value="min" className="bg-zinc-950">min</option>
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

                {/* Reps Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-0.5">Reps completed</label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5">
                    <input
                      type="number"
                      value={prReps || ''}
                      onChange={(e) => setPrReps(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent font-bold text-xs text-zinc-100 font-mono focus:outline-none"
                      placeholder="e.g. 8"
                    />
                  </div>
                </div>

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
