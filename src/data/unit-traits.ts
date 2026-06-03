/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Exercise } from '../types';

/**
 * unit-traits
 *
 * Single source of truth for every measurement unit the app supports.
 * Lookup is keyed by the string written on a PlannedExercise's `unit`
 * field — it tells the rest of the app how to:
 *
 *   - lay out the planning row (Sets + Target vs Target-only)
 *   - lay out the live ActiveSession set list (weight/reps vs
 *     distance/duration etc.)
 *   - display the planned card "X × Y" badge vs "Y unit"
 *   - render the PR badge ("PR 100 kg × 8" vs "PR 5 km")
 *   - pick a sensible default value when adding the exercise
 *   - pick a +/− step amount for the in-session increment buttons
 *
 * Adding a new unit is a single-place edit. Do NOT scatter per-unit
 * logic across the codebase; route everything through this map.
 */

export type UnitId = 'reps' | 'kgs' | 'lbs' | 'kms' | 'miles' | 'sec' | 'min';
export type DistanceUnitSetting = 'km' | 'mi';
export type MeasurementSystem = 'kg' | 'lbs' | 'metric' | 'imperial' | DistanceUnitSetting;

export type MetricFamily =
  | 'weight-reps'         // weight × reps    (bench press, deadlift, …)
  | 'bodyweight-reps'     // bodyweight × reps (push-up, pull-up, …)
  | 'cardio-distance'     // a distance run / rowed / cycled
  | 'cardio-duration';    // a duration of cardio or static hold

export interface UnitTraits {
  /** The dominant metric this unit belongs to. Drives live UI layout. */
  metric: MetricFamily;
  /** Does it make sense to plan or log multiple sets of this? */
  supportsSets: boolean;
  /** Human-readable long label. */
  label: string;
  /** Compact label used on badges / buttons. */
  shortLabel: string;
  /** Default target value when adding the exercise to a routine. */
  defaultValue: string;
  /** +/− increment step in the live ActiveSession. */
  step: number;
}

export const UNIT_TRAITS: Record<UnitId, UnitTraits> = {
  reps: {
    metric: 'bodyweight-reps',
    supportsSets: true,
    label: 'Repetitions',
    shortLabel: 'reps',
    defaultValue: '10',
    step: 1,
  },
  kgs: {
    metric: 'weight-reps',
    supportsSets: true,
    label: 'Kilograms',
    shortLabel: 'kg',
    defaultValue: '20',
    step: 2.5,
  },
  lbs: {
    metric: 'weight-reps',
    supportsSets: true,
    label: 'Pounds',
    shortLabel: 'lbs',
    defaultValue: '45',
    step: 5,
  },
  kms: {
    metric: 'cardio-distance',
    supportsSets: false,
    label: 'Kilometers',
    shortLabel: 'km',
    defaultValue: '5',
    step: 0.5,
  },
  miles: {
    metric: 'cardio-distance',
    supportsSets: false,
    label: 'Miles',
    shortLabel: 'mi',
    defaultValue: '3',
    step: 0.5,
  },
  sec: {
    metric: 'cardio-duration',
    supportsSets: true,
    label: 'Seconds',
    shortLabel: 'sec',
    defaultValue: '30',
    step: 5,
  },
  min: {
    metric: 'cardio-duration',
    supportsSets: true,
    label: 'Minutes',
    shortLabel: 'min',
    defaultValue: '20',
    step: 1,
  },
};

/** Safe lookup — falls back to `reps` for unknown unit ids. */
export function getUnitTraits(unit?: string | null): UnitTraits {
  if (unit && unit in UNIT_TRAITS) {
    return UNIT_TRAITS[unit as UnitId];
  }
  return UNIT_TRAITS.reps;
}

/** Convenience: does this unit allow multiple sets? */
export function unitSupportsSets(unit?: string | null): boolean {
  return getUnitTraits(unit).supportsSets;
}

/** Step amount the in-session +/- buttons should use. */
export function unitStep(unit?: string | null): number {
  return getUnitTraits(unit).step;
}

const KM_PER_MILE = 1.60934;

function isImperial(system: MeasurementSystem): boolean {
  return system === 'lbs' || system === 'imperial' || system === 'mi';
}

export function distanceUnitFor(system: MeasurementSystem): Extract<UnitId, 'kms' | 'miles'> {
  return isImperial(system) ? 'miles' : 'kms';
}

export function resolveDistanceSystem(
  distanceUnit: DistanceUnitSetting | undefined,
  weightUnit: 'kg' | 'lbs' = 'kg'
): DistanceUnitSetting {
  return distanceUnit ?? (weightUnit === 'lbs' ? 'mi' : 'km');
}

export function kmToDisplay(km: number, system: MeasurementSystem): number {
  return isImperial(system) ? km / KM_PER_MILE : km;
}

export function displayToKm(value: number, system: MeasurementSystem): number {
  return isImperial(system) ? value * KM_PER_MILE : value;
}

export function minutesToDurationDisplay(minutes: number, unit?: string | null): number {
  return unit === 'sec' ? minutes * 60 : minutes;
}

export function durationDisplayToMinutes(value: number, unit?: string | null): number {
  return unit === 'sec' ? value / 60 : value;
}

/**
 * Per-exercise default logging unit.
 *
 * The headline metric each exercise is planned/logged in by default:
 *   - strength work → kilograms (reps stay visible alongside the weight)
 *   - bodyweight movements → reps
 *   - steady-state cardio → kilometres
 *   - timed conditioning / holds → seconds or minutes
 *
 * The equipment family resolves the bulk of the catalogue. CURATED_DEFAULT_UNITS
 * carries the handful of exceptions the equipment heuristic alone would miss —
 * timed pieces whose equipment reads as "cardio" or "bodyweight" but which are
 * measured by the clock, not by distance or reps.
 *
 * Run-through of the built-in catalogue this produces:
 *   kgs  → bench-press, chest-fly, pulldown, row, face-pull, overhead-press,
 *          lateral-raise, shrug, curl, tricep-extension, squat, lunge,
 *          leg-extension, calf-raise, deadlift, hip-thrust, leg-curl,
 *          kettlebell-swing, carry
 *   reps → push-up, dip, pull-up, hyperextension, crunch, sit-up, burpee, box-jump
 *   kms/miles → bike, run, walk, treadmill, elliptical, rowing-machine
 *   sec  → plank, mountain-climber, jump-rope
 *   min  → stretch
 */
const CURATED_DEFAULT_UNITS: Record<string, UnitId> = {
  'jump-rope': 'sec',
  plank: 'sec',
  'mountain-climber': 'sec',
  stretch: 'min',
  'stair-climber': 'min',
  'jumping-jack': 'sec',
  'high-knees': 'sec',
  'battle-ropes': 'sec',
  'sled-push': 'sec',
  'side-plank': 'sec',
  'hollow-hold': 'sec',
  'flutter-kick': 'sec',
  'dead-bug': 'sec',
  'pallof-press': 'sec',
};

export function getDefaultUnit(exercise: Exercise, system: MeasurementSystem = 'kg'): UnitId {
  if (CURATED_DEFAULT_UNITS[exercise.id]) return CURATED_DEFAULT_UNITS[exercise.id];
  const equip = (exercise.equipment || '').toLowerCase();
  if (equip === 'cardio') return distanceUnitFor(system);
  if (equip === 'bodyweight') return 'reps';
  return 'kgs'; // barbell, dumbbell, machine, cable, kettlebell, bands
}
