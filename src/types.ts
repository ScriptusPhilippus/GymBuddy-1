/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MuscleGroup =
  | 'chest'
  | 'lats'
  | 'traps'
  | 'front-delts'
  | 'rear-delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower-back'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'bands'
  | 'kettlebell'
  | 'cardio';

export interface Exercise {
  id: string; // e.g. 'bench-press'
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio';
  equipment: EquipmentType;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  poseIcon: string; // e.g., 'bench-press', 'pull-up'
  whatItTrains: string;
  setup: string[];
  howToPerform: string[];
  coachingTip: string;
  defaultSets?: number;
  defaultReps?: string; // e.g. "6-10" or "10-12"
}

export interface PlannedExercise {
  id: string; // Unique instance id for the routine
  exerciseId: string; // Reference to Exercise
  sets: number;
  reps: string; // e.g. "8-12", "6-10"
  unit?: string; // Optional unit: reps, kgs, kms, etc.
}

export interface Routine {
  id: string; // e.g. 'push-day'
  name: string;
  description?: string;
  exercises: PlannedExercise[];
}

export interface LoggedSet {
  id: string;
  weight: number; // in kg or lbs
  reps: number;
  completed: boolean;
  distance?: number; // distance in kms or miles
  durationMinutes?: number; // duration in minutes
}

export interface LoggedExercise {
  exerciseId: string;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp
  elapsedSeconds: number;
  exercises: LoggedExercise[];
  notes?: string;
}

export interface WorkoutSettings {
  weightUnit: 'kg' | 'lbs';
  defaultRestDuration: number; // in seconds, e.g. 90
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  maxWorkoutDuration?: number; // in minutes, e.g. 120
}
