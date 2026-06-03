/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlannedExercise, Routine } from '../types';
import { EXERCISES } from './exercises';
import { getDefaultUnit } from './unit-traits';

function unitFor(exerciseId: string): string {
  const exercise = EXERCISES.find(ex => ex.id === exerciseId);
  return exercise ? getDefaultUnit(exercise) : 'reps';
}

function planned(id: string, exerciseId: string, sets: number, reps: string): PlannedExercise {
  return {
    id,
    exerciseId,
    sets,
    reps,
    unit: unitFor(exerciseId),
  };
}

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps.',
    exercises: [
      planned('push-bench', 'bench-press', 4, '6-10'),
      planned('push-incline-db', 'incline-dumbbell-press', 3, '8-12'),
      planned('push-overhead', 'overhead-press', 3, '6-10'),
      planned('push-lateral', 'cable-lateral-raise', 3, '12-15'),
      planned('push-fly', 'cable-crossover', 3, '12-15'),
      planned('push-triceps', 'tricep-pushdown', 3, '10-15'),
    ],
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    description: 'Back, rear delts, biceps, and grip.',
    exercises: [
      planned('pull-pullup', 'pull-up', 4, '6-10'),
      planned('pull-row', 'row', 4, '6-10'),
      planned('pull-seated-row', 'seated-cable-row', 3, '8-12'),
      planned('pull-close-pulldown', 'lat-pulldown-close-grip', 3, '8-12'),
      planned('pull-face-pull', 'face-pull', 3, '12-15'),
      planned('pull-curl', 'barbell-curl', 3, '8-12'),
      planned('pull-hammer', 'hammer-curl', 3, '10-12'),
    ],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    description: 'Quads, hamstrings, glutes, and calves.',
    exercises: [
      planned('leg-squat', 'squat', 4, '6-10'),
      planned('leg-rdl', 'romanian-deadlift', 3, '8-10'),
      planned('leg-press', 'leg-press', 3, '10-12'),
      planned('leg-bulgarian', 'bulgarian-split-squat', 3, '8-12'),
      planned('leg-curl', 'leg-curl', 3, '10-12'),
      planned('leg-hip-thrust', 'hip-thrust', 3, '8-12'),
      planned('leg-calf', 'seated-calf-raise', 4, '12-20'),
    ],
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    description: 'Balanced upper-body strength and hypertrophy.',
    exercises: [
      planned('upper-bench', 'bench-press', 4, '6-10'),
      planned('upper-pullup', 'pull-up', 3, '6-10'),
      planned('upper-overhead', 'dumbbell-shoulder-press', 3, '8-12'),
      planned('upper-row', 'seated-cable-row', 3, '8-12'),
      planned('upper-incline', 'incline-dumbbell-press', 3, '8-12'),
      planned('upper-lateral', 'lateral-raise', 3, '12-15'),
      planned('upper-triceps', 'tricep-pushdown', 3, '10-15'),
      planned('upper-curl', 'ez-bar-curl', 3, '10-12'),
    ],
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    description: 'Lower-body strength with posterior-chain balance.',
    exercises: [
      planned('lower-front-squat', 'front-squat', 4, '5-8'),
      planned('lower-rdl', 'romanian-deadlift', 3, '8-10'),
      planned('lower-leg-press', 'leg-press', 3, '10-12'),
      planned('lower-hip-thrust', 'hip-thrust', 3, '8-12'),
      planned('lower-leg-curl', 'leg-curl', 3, '10-12'),
      planned('lower-calf', 'calf-raise', 4, '15-20'),
      planned('lower-plank', 'plank', 3, '60s'),
    ],
  },
  {
    id: 'full-body-a',
    name: 'Full Body A',
    description: 'Beginner-friendly full-body session.',
    exercises: [
      planned('fba-squat', 'squat', 3, '6-10'),
      planned('fba-bench', 'bench-press', 3, '6-10'),
      planned('fba-row', 'seated-cable-row', 3, '8-12'),
      planned('fba-rdl', 'romanian-deadlift', 3, '8-10'),
      planned('fba-press', 'overhead-press', 3, '8-10'),
      planned('fba-plank', 'plank', 3, '45s'),
      planned('fba-walk', 'incline-walk', 1, '3'),
    ],
  },
  {
    id: 'full-body-b',
    name: 'Full Body B',
    description: 'Alternate full-body session for weekly rotation.',
    exercises: [
      planned('fbb-deadlift', 'deadlift', 3, '5'),
      planned('fbb-incline', 'incline-bench-press', 3, '6-10'),
      planned('fbb-chinup', 'chin-up', 3, '6-10'),
      planned('fbb-lunge', 'lunge', 3, '10-12'),
      planned('fbb-face-pull', 'face-pull', 3, '12-15'),
      planned('fbb-cable-crunch', 'cable-crunch', 3, '10-15'),
      planned('fbb-bike', 'bike', 1, '15-20 min'),
    ],
  },
];
