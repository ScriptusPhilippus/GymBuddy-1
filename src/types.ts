/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MuscleGroup =
  | 'chest'
  | 'lats'
  | 'traps'
  | 'front-delts'
  | 'side-delts'
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
  unit?: string; // Optional unit: reps, kgs, kms, miles, etc.
  targetWeight?: number; // Planned working load for weight-based units (kg/lbs)
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
  distance?: number; // canonical distance in kilometers
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

export type ThemeHue = 'violet' | 'emerald' | 'rose' | 'sky' | 'amber';
export type LanguageCode = 'en' | 'el';

export interface WorkoutSettings {
  weightUnit: 'kg' | 'lbs';
  distanceUnit?: 'km' | 'mi';
  defaultRestDuration: number; // in seconds, e.g. 90
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartRest?: boolean; // start rest timer automatically after marking sets complete
  maxWorkoutDuration?: number; // in minutes, e.g. 120
  weightIncrement?: number; // optional override for weight steppers
  accentHue?: ThemeHue;
  language?: LanguageCode;
  showExerciseImage?: boolean; // photographic exercise "visualizer" backdrop (default off)
  showHelpText?: boolean; // constant explanatory subtitles under cards (default on)
  showPrTracking?: boolean; // show PR badges/logging controls (default on)
  reviewExpiredWorkouts?: boolean; // prompt to review max-timer sessions before saving (default on)
  // NOTE (future): a dedicated "Minimalist mode" will collapse help text,
  // descriptions and other learn-the-ropes affordances for seasoned users.
}

export interface ManualPRRecord {
  value: number;
  reps?: number;
  unit: string;
}

export interface ExpiredWorkoutReview {
  routineId: string;
  routineName: string;
  startTime: number;
  elapsedSeconds: number;
  loggedExercises: LoggedExercise[];
  notes?: string;
  maxLimitMinutes: number;
}

export interface BodyWeightEntry {
  id: string;
  date: number; // timestamp (midnight of the logged day)
  weight: number; // stored in the user's current weightUnit
}
