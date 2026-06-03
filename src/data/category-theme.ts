/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single source of truth for category colour theming.
 *
 * Every surface that shows an exercise — the workout plan, routine
 * configuration, the exercise library, and the live workout — pulls its
 * category accent from here so the colours stay coherent. Previously each
 * surface hard-coded its own copy of the palette with slightly different
 * opacities, which drifted over time.
 *
 * Tailwind v4 scans these literal class strings at build time, so the full
 * class names must appear verbatim below (no runtime string building).
 *
 * Palette: chest=rose, back=emerald, legs=blue, shoulders=amber,
 * arms=violet, core=cyan, cardio=indigo. Violet doubles as the neutral
 * brand / "all" accent used across the app.
 */

import { Exercise } from '../types';

export type Category = Exercise['category'];
export type CategoryKey = Category | 'all';

export interface CategoryTheme {
  /** Capitalised display label. */
  label: string;
  /** Base Tailwind hue token (reference only — not used to build classes). */
  hue: string;
  /** Left-border accent for cards: resting tone + hover-dim. Pair with `border-l-4`. */
  cardBorder: string;
  /** Plain accent text colour. */
  text: string;
  /**
   * Soft tint chip for a category tag / meta chip — supplies bg + border
   * colour + text colour. The call site keeps its own `border` width class.
   */
  chip: string;
  /** Filter pill, idle state (call site supplies the `border` width class). */
  pillIdle: string;
  /** Filter pill, selected state. */
  pillActive: string;
  /** Count badge inside a filter pill, idle. */
  countIdle: string;
  /** Count badge inside a filter pill, selected. */
  countActive: string;
}

export const CATEGORY_THEME: Record<Category, CategoryTheme> = {
  chest: {
    label: 'Chest',
    hue: 'rose',
    cardBorder: 'border-l-rose-500/70 group-hover:border-l-rose-500/40',
    text: 'text-rose-400',
    chip: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    pillIdle: 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:text-rose-300',
    pillActive: 'bg-rose-500/20 border-rose-500/50 text-rose-100',
    countIdle: 'bg-rose-950/50 text-rose-300',
    countActive: 'bg-rose-500/30 text-rose-100',
  },
  back: {
    label: 'Back',
    hue: 'emerald',
    cardBorder: 'border-l-emerald-500/70 group-hover:border-l-emerald-500/40',
    text: 'text-emerald-400',
    chip: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pillIdle: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:text-emerald-300',
    pillActive: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100',
    countIdle: 'bg-emerald-950/50 text-emerald-300',
    countActive: 'bg-emerald-500/30 text-emerald-100',
  },
  shoulders: {
    label: 'Shoulders',
    hue: 'amber',
    cardBorder: 'border-l-amber-500/70 group-hover:border-l-amber-500/40',
    text: 'text-amber-400',
    chip: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    pillIdle: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:text-amber-300',
    pillActive: 'bg-amber-500/20 border-amber-500/50 text-amber-100',
    countIdle: 'bg-amber-950/50 text-amber-300',
    countActive: 'bg-amber-500/30 text-amber-100',
  },
  arms: {
    label: 'Arms',
    hue: 'violet',
    cardBorder: 'border-l-violet-500/70 group-hover:border-l-violet-500/40',
    text: 'text-violet-400',
    chip: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    pillIdle: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:text-violet-300',
    pillActive: 'bg-violet-500/20 border-violet-500/50 text-violet-100',
    countIdle: 'bg-violet-950/50 text-violet-300',
    countActive: 'bg-violet-500/30 text-violet-100',
  },
  legs: {
    label: 'Legs',
    hue: 'blue',
    cardBorder: 'border-l-blue-500/70 group-hover:border-l-blue-500/40',
    text: 'text-blue-400',
    chip: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    pillIdle: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:text-blue-300',
    pillActive: 'bg-blue-500/20 border-blue-500/50 text-blue-100',
    countIdle: 'bg-blue-950/50 text-blue-300',
    countActive: 'bg-blue-500/30 text-blue-100',
  },
  core: {
    label: 'Core',
    hue: 'cyan',
    cardBorder: 'border-l-cyan-500/70 group-hover:border-l-cyan-500/40',
    text: 'text-cyan-400',
    chip: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    pillIdle: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:text-cyan-300',
    pillActive: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100',
    countIdle: 'bg-cyan-950/50 text-cyan-300',
    countActive: 'bg-cyan-500/30 text-cyan-100',
  },
  cardio: {
    label: 'Cardio',
    hue: 'indigo',
    cardBorder: 'border-l-indigo-500/70 group-hover:border-l-indigo-500/40',
    text: 'text-indigo-400',
    chip: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    pillIdle: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:text-indigo-300',
    pillActive: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100',
    countIdle: 'bg-indigo-950/50 text-indigo-300',
    countActive: 'bg-indigo-500/30 text-indigo-100',
  },
};

/** Neutral fallback (zinc) for unknown / custom categories. */
export const NEUTRAL_THEME: CategoryTheme = {
  label: 'Other',
  hue: 'zinc',
  cardBorder: 'border-l-zinc-700 group-hover:border-l-zinc-600',
  text: 'text-zinc-400',
  chip: 'bg-zinc-900 border-zinc-800 text-zinc-400',
  pillIdle: 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300',
  pillActive: 'bg-zinc-700/40 border-zinc-600 text-zinc-100',
  countIdle: 'bg-zinc-950/50 text-zinc-400',
  countActive: 'bg-zinc-600/40 text-zinc-100',
};

/** "All" pseudo-category for filter bars — uses the global brand accent. */
export const ALL_FILTER_THEME = {
  label: 'All',
  pillIdle: 'bg-[rgb(var(--accent-600)/0.1)] border-[rgb(var(--accent-500)/0.3)] text-[rgb(var(--accent-300))] hover:text-[rgb(var(--accent-200))]',
  pillActive: 'bg-[rgb(var(--accent-600)/0.2)] border-[rgb(var(--accent-500)/0.5)] text-[rgb(var(--accent-100))]',
  countIdle: 'bg-[rgb(var(--accent-950)/0.5)] text-[rgb(var(--accent-300))]',
  countActive: 'bg-[rgb(var(--accent-500)/0.35)] text-[rgb(var(--accent-100))]',
};

/** Resolve a real exercise category to its theme (zinc fallback). */
export function getCategoryTheme(category?: string | null): CategoryTheme {
  if (category && category in CATEGORY_THEME) return CATEGORY_THEME[category as Category];
  return NEUTRAL_THEME;
}

/** Filter-pill theme accessor that also understands the 'all' pseudo-category. */
export function getFilterTheme(key?: string | null) {
  if (key === 'all') return ALL_FILTER_THEME;
  return getCategoryTheme(key);
}
