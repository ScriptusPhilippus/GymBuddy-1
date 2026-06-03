/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const glyph = (children: React.ReactNode) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="w-full h-full"
  >
    {children}
  </svg>
);

const head = <circle cx="32" cy="14" r="5" />;
const barbell = (
  <>
    <path d="M8 20h48" />
    <path d="M14 14v12M20 14v12M44 14v12M50 14v12" />
  </>
);
const dumbbell = (
  <>
    <path d="M18 18l28 28" />
    <path d="M12 13l10 10M8 17l10 10M46 36l10 10M42 40l10 10" />
  </>
);
const standingFigure = (
  <>
    {head}
    <path d="M32 20v20M22 60l10-20 10 20M20 28l12 8 12-8" />
  </>
);

export const POSE_GLYPHS: Record<string, React.ReactNode> = {
  generic: glyph(
    <>
      {head}
      <path d="M32 20v18M22 30h20M24 58l8-20 8 20" />
    </>,
  ),
  'barbell-press': glyph(
    <>
      {barbell}
      {head}
      <path d="M24 35l8-15 8 15M24 35h16M28 58l4-23 4 23" />
    </>,
  ),
  'dumbbell-press': glyph(
    <>
      <path d="M14 21l10 10M10 25l10 10M50 21l-10 10M54 25l-10 10" />
      {head}
      <path d="M24 38l8-15 8 15M26 58l6-20 6 20" />
    </>,
  ),
  'machine-press': glyph(
    <>
      <path d="M12 12v44M52 12v44M18 20h28M18 40h28" />
      {head}
      <path d="M25 38h14M25 38l-7-9M39 38l7-9M28 58l4-20 4 20" />
    </>,
  ),
  'chest-fly': glyph(
    <>
      {head}
      <path d="M32 20v22M14 22c10 8 17 12 18 20M50 22c-10 8-17 12-18 20M24 58l8-16 8 16" />
    </>,
  ),
  'vertical-pull': glyph(
    <>
      <path d="M14 10h36M20 10v10M44 10v10" />
      {head}
      <path d="M22 22l10 10 10-10M32 32v14M24 60l8-14 8 14" />
    </>,
  ),
  'horizontal-row': glyph(
    <>
      {head}
      <path d="M16 34h32M20 26l12 8-12 8M44 26l-12 8 12 8M24 58l8-20 8 20" />
    </>,
  ),
  pullover: glyph(
    <>
      {head}
      <path d="M16 18c10-8 22-8 32 0M20 18l12 18 12-18M28 58l4-22 4 22" />
    </>,
  ),
  'deadlift-hinge': glyph(
    <>
      <path d="M12 50h40M16 44v12M48 44v12" />
      {head}
      <path d="M30 20l-10 22 16 6M20 42l16-8M36 48l10 10" />
    </>,
  ),
  'back-extension': glyph(
    <>
      <path d="M12 48h40M18 48l12-22 22 10" />
      {head}
      <path d="M30 26l14 16M24 58l6-10" />
    </>,
  ),
  squat: glyph(
    <>
      {head}
      <path d="M20 26h24M32 20v18M20 58l12-20 12 20M18 44h46" />
    </>,
  ),
  lunge: glyph(
    <>
      {head}
      <path d="M32 20v18M18 58l14-20 16 20M18 58h14M42 58h10M20 32l12 6 14-4" />
    </>,
  ),
  'leg-press': glyph(
    <>
      <path d="M46 12v40M22 52h24" />
      {head}
      <path d="M18 34l14 10 14-18M20 52l12-8" />
    </>,
  ),
  'leg-extension': glyph(
    <>
      {head}
      <path d="M20 30h22M24 42h16M20 52h24M30 30v12M40 42l12 10" />
    </>,
  ),
  'leg-curl': glyph(
    <>
      {head}
      <path d="M16 34h28M24 44h18M24 54h28M42 44c10 2 10 10 2 12" />
    </>,
  ),
  'calf-raise': glyph(
    <>
      {head}
      <path d="M32 20v26M22 58l10-12 10 12M18 58h28M24 50h16" />
    </>,
  ),
  'hip-hinge': glyph(
    <>
      {head}
      <path d="M30 20l-10 22 16 8M20 42l18-4M36 50l10 8" />
    </>,
  ),
  'glute-bridge': glyph(
    <>
      <path d="M12 48h40M18 48c8-18 24-18 32 0" />
      {head}
      <path d="M18 48l8-16M48 48l-8-16" />
    </>,
  ),
  'overhead-press': glyph(
    <>
      {barbell}
      {head}
      <path d="M24 34l8-14 8 14M32 34v16M24 60l8-10 8 10" />
    </>,
  ),
  'lateral-raise': glyph(
    <>
      {head}
      <path d="M32 20v22M12 32l20 8 20-8M24 58l8-16 8 16" />
    </>,
  ),
  'front-raise': glyph(
    <>
      {head}
      <path d="M32 20v22M20 30l12 6 12-6M24 58l8-16 8 16M16 30h40" />
    </>,
  ),
  'rear-delt': glyph(
    <>
      {head}
      <path d="M16 34l16-8 16 8M18 42l14-10 14 10M24 58l8-20 8 20" />
    </>,
  ),
  shrug: glyph(
    <>
      {head}
      <path d="M20 34c4-8 20-8 24 0M18 42h46M24 58l8-16 8 16" />
    </>,
  ),
  'biceps-curl': glyph(
    <>
      {dumbbell}
      {head}
      <path d="M22 34c8 4 14 2 18-6M28 58l4-20 4 20" />
    </>,
  ),
  'triceps-extension': glyph(
    <>
      <path d="M22 14h20M26 10v8M38 10v8" />
      {head}
      <path d="M24 28l8-8 8 8M32 20v26M24 58l8-12 8 12" />
    </>,
  ),
  forearm: glyph(
    <>
      <path d="M18 18l20 20M12 24l12-12M32 44l12-12" />
      <path d="M38 38c8 2 12 7 10 14M36 42c5 1 8 5 7 10" />
    </>,
  ),
  crunch: glyph(
    <>
      {head}
      <path d="M18 48h28M24 48c0-12 8-20 20-20M44 28l8 8M20 58h28" />
    </>,
  ),
  plank: glyph(
    <>
      <circle cx="16" cy="36" r="5" />
      <path d="M21 36h28M49 36l8 10M28 36l-8 10M10 46h50" />
    </>,
  ),
  'leg-raise': glyph(
    <>
      {head}
      <path d="M14 48h24M24 48l18-24M38 48l18-20M12 58h44" />
    </>,
  ),
  twist: glyph(
    <>
      {head}
      <path d="M32 20v24M20 34h24M18 48c10-8 18-8 28 0M20 58l12-14 12 14" />
    </>,
  ),
  carry: glyph(
    <>
      {head}
      <path d="M32 20v28M22 58l10-10 10 10M18 36v14M46 36v14M14 50h8M42 50h8" />
    </>,
  ),
  run: glyph(
    <>
      {head}
      <path d="M30 20l-8 14 14 6M36 40l12 16M26 36l-14 10M34 28l12 4" />
    </>,
  ),
  bike: glyph(
    <>
      <circle cx="18" cy="46" r="9" />
      <circle cx="48" cy="46" r="9" />
      <path d="M18 46l12-18 10 18H18M30 28h12M34 24h10" />
      {head}
    </>,
  ),
  'row-machine': glyph(
    <>
      <path d="M10 52h44M18 44h22M40 44l12-12" />
      {head}
      <path d="M22 28l12 16M18 44l-8-8" />
    </>,
  ),
  'jump-rope': glyph(
    <>
      {head}
      <path d="M32 20v24M24 58l8-14 8 14M18 28c-12 10-10 32 14 34M46 28c12 10 10 32-14 34" />
    </>,
  ),
  jump: glyph(
    <>
      {head}
      <path d="M22 28l10 10 10-10M24 58l8-20 8 20M14 46h42" />
    </>,
  ),
  stretch: glyph(
    <>
      {head}
      <path d="M32 20v20M16 50h32M32 40l-18 12M32 40l18 12M20 30h44" />
    </>,
  ),
};
