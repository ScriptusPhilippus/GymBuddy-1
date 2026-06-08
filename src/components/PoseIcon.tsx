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
 * Resolution is PNG-first: we try `/poses/<name>.png`, and only if that
 * 404s (unknown pose, or a built-in whose dedicated art is intentionally
 * omitted) do we fall back to a matching vector glyph from POSE_GLYPHS,
 * and finally to `/poses/generic.png`. This keeps the per-name PNG set the
 * single source of truth — no hand-maintained key list to drift out of sync.
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

export const PoseIcon: React.FC<PoseIconProps> = ({ name, className = '', size = 56 }) => {
  // 'png' = try the dedicated PNG; 'fallback' = PNG missing, use glyph/generic.
  const [stage, setStage] = useState<'png' | 'fallback'>('png');

  useEffect(() => {
    setStage('png');
  }, [name]);

  const wrapperClass = `inline-flex items-center justify-center text-zinc-100 ${className}`;
  const glyph = name ? POSE_GLYPHS[name] : undefined;

  if (stage === 'png') {
    return (
      <div className={wrapperClass} style={{ width: size, height: size }} aria-hidden="true">
        <img
          src={name ? `/poses/${name}.png` : FALLBACK_SRC}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setStage('fallback')}
          className="w-full h-full object-contain select-none pointer-events-none"
        />
      </div>
    );
  }

  // PNG missing: prefer a known vector glyph, otherwise the generic icon.
  if (glyph) {
    return (
      <div className={wrapperClass} style={{ width: size, height: size }} aria-hidden="true">
        {glyph}
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={{ width: size, height: size }} aria-hidden="true">
      <img
        src={FALLBACK_SRC}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    </div>
  );
};
