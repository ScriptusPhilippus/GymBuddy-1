/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { POSE_GLYPHS } from './pose-glyphs';

/**
 * PoseIcon
 *
 * Renders one of the minimalistic white line-art pose pictograms shipped
 * in /public/poses/. Each pose is keyed by its file basename (without
 * extension) — e.g. `bench-press` resolves to `/poses/bench-press.png`.
 *
 * If the requested pose is missing (404 or unknown name), the component
 * falls back to `/poses/generic.png` so the UI never renders a broken
 * image icon. The fallback path is also taken if `name` is empty.
 */

interface PoseIconProps {
  /** Pose identifier — must match a file in /public/poses/ (without .png). */
  name: string;
  /** Extra Tailwind/CSS classes appended to the wrapper. */
  className?: string;
  /** Pixel size of the square icon. Defaults to 56. */
  size?: number;
}

const FALLBACK_SRC = '/poses/generic.png';
const PNG_POSE_KEYS = new Set([
  'bench-press',
  'bike',
  'box-jump',
  'burpee',
  'calf-raise',
  'carry',
  'chest-fly',
  'crunch',
  'curl',
  'deadlift',
  'dip',
  'elliptical',
  'face-pull',
  'generic',
  'hip-thrust',
  'hyperextension',
  'jump-rope',
  'kettlebell-swing',
  'lateral-raise',
  'leg-curl',
  'leg-extension',
  'lunge',
  'mountain-climber',
  'overhead-press',
  'plank',
  'pull-up',
  'pulldown',
  'push-up',
  'row',
  'rowing-machine',
  'run',
  'shrug',
  'sit-up',
  'squat',
  'stretch',
  'treadmill',
  'tricep-extension',
  'walk',
]);

function srcForName(name: string): string {
  if (!name) return FALLBACK_SRC;
  return `/poses/${name}.png`;
}

export const PoseIcon: React.FC<PoseIconProps> = ({ name, className = '', size = 56 }) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [name]);

  const glyphIcon = name && !PNG_POSE_KEYS.has(name) ? POSE_GLYPHS[name] : undefined;
  if (glyphIcon) {
    return (
      <div
        className={`inline-flex items-center justify-center text-zinc-100 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {glyphIcon}
      </div>
    );
  }

  // When the requested PNG fails to load (typo, custom exercise with
  // unknown poseIcon, etc.) we silently swap in the generic icon.
  const src = errored ? FALLBACK_SRC : srcForName(name);

  return (
    <div
      className={`inline-flex items-center justify-center text-zinc-100 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => {
          if (!errored) setErrored(true);
        }}
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    </div>
  );
};
