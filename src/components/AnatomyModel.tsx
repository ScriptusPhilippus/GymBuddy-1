/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MuscleGroup } from '../types';

interface AnatomyModelProps {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  intensities?: Partial<Record<MuscleGroup, number>>;
  selectedView?: 'front' | 'back';
  interactive?: boolean;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  className?: string;
  showLabels?: boolean;
}

// Anatomical Load uses its own CONTINUOUS least→most ramp — a smooth
// interpolation from blue (#3b82f6) to fuchsia (#ec4899), passing through
// lively violet mid-tones. This is deliberately NOT the category palette and
// NOT the blue/violet primary-muscle role used by the exercise sheet.
const LOAD_LOW: [number, number, number] = [59, 130, 246];   // #3b82f6 blue
const LOAD_HIGH: [number, number, number] = [236, 72, 153];  // #ec4899 fuchsia
export function loadColorRGB(t: number): [number, number, number] {
  const c = Math.max(0, Math.min(1, t));
  return [
    Math.round(LOAD_LOW[0] + (LOAD_HIGH[0] - LOAD_LOW[0]) * c),
    Math.round(LOAD_LOW[1] + (LOAD_HIGH[1] - LOAD_LOW[1]) * c),
    Math.round(LOAD_LOW[2] + (LOAD_HIGH[2] - LOAD_LOW[2]) * c)
  ];
}
export function heatColor(intensity: number): string {
  if (intensity <= 0) return '#27272a';
  const [r, g, b] = loadColorRGB(intensity);
  return `rgb(${r}, ${g}, ${b})`;
}

export const AnatomyModel: React.FC<AnatomyModelProps> = ({
  primaryMuscles,
  secondaryMuscles,
  intensities,
  selectedView = 'front',
  interactive = false,
  onMuscleClick,
  className = '',
  showLabels = false
}) => {
  // Return coloring style depending on status in primaries or secondaries
  const getMuscleColors = (muscle: MuscleGroup) => {
    if (intensities) {
      const t = Math.max(0, Math.min(1, intensities[muscle] || 0));
      if (t <= 0) {
        return {
          fill: '#27272a',
          stroke: '#3f3f46',
          strokeWidth: 1,
          filter: undefined,
          className: `transition-all duration-300 ${interactive ? 'cursor-pointer hover:fill-zinc-700/50' : ''}`
        };
      }
      const [r, g, b] = loadColorRGB(t);
      // Fill opacity and glow both scale with intensity so the relative
      // least→most reads continuously, not in steps.
      return {
        fill: `rgba(${r}, ${g}, ${b}, ${(0.5 + 0.45 * t).toFixed(3)})`,
        stroke: `rgb(${Math.min(255, r + 25)}, ${Math.min(255, g + 25)}, ${Math.min(255, b + 25)})`,
        strokeWidth: 1.6,
        filter: `drop-shadow(0px 0px ${(3 + 7 * t).toFixed(1)}px rgba(${r}, ${g}, ${b}, ${(0.35 + 0.45 * t).toFixed(3)}))`,
        className: `transition-all duration-300 ${interactive ? 'cursor-pointer' : ''}`
      };
    }

    const isPrimary = primaryMuscles.includes(muscle);
    const isSecondary = secondaryMuscles.includes(muscle);

    if (isPrimary) {
      return {
        fill: 'rgba(59, 130, 246, 0.85)', // Vibrant Neon Blue
        stroke: '#60a5fa',
        filter: 'drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.6))',
        className: 'animate-pulse transition-all duration-300 shadow shadow-blue-500'
      };
    }
    if (isSecondary) {
      return {
        fill: 'rgba(139, 92, 246, 0.75)', // Elegant Violet/Purple
        stroke: '#a78bfa',
        filter: 'drop-shadow(0px 0px 6px rgba(139, 92, 246, 0.5))',
        className: 'transition-all duration-300'
      };
    }
    return {
      fill: '#27272a', // zinc-800 outline
      stroke: '#3f3f46', // zinc-700 separations
      filter: undefined,
      className: 'transition-all duration-200 hover:fill-zinc-700/50'
    };
  };

  const handleMuscleClick = (muscle: MuscleGroup) => {
    if (interactive && onMuscleClick) {
      onMuscleClick(muscle);
    }
  };

  // Render vector front diagram
  const renderFrontBody = () => {
    const chestProps = getMuscleColors('chest');
    const frontDeltsL = getMuscleColors('front-delts');
    const frontDeltsR = getMuscleColors('front-delts');
    const sideDeltsL = getMuscleColors('side-delts');
    const sideDeltsR = getMuscleColors('side-delts');
    const bicepsL = getMuscleColors('biceps');
    const bicepsR = getMuscleColors('biceps');
    const forearmsL = getMuscleColors('forearms');
    const forearmsR = getMuscleColors('forearms');
    const abs = getMuscleColors('abs');
    const obliques = getMuscleColors('obliques');
    const quadsL = getMuscleColors('quads');
    const quadsR = getMuscleColors('quads');
    const calvesL = getMuscleColors('calves');
    const calvesR = getMuscleColors('calves');

    return (
      <svg viewBox="0 0 160 260" className="w-full h-full max-h-[380px]" id="anatomy-front-svg">
        <defs>
          <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Global Body Outline Base */}
        <path
          d="M 80 15 C 73 15, 71 27, 71 39 C 71 44, 69 46, 64 48 C 55 52, 45 61, 41 78 C 38 92, 36 102, 38 114 C 38 118, 41 118, 42 113 C 44 100, 48 88, 55 83 C 57 85, 54 105, 54 120 C 54 120, 58 121, 61 123 C 58 142, 57 165, 59 180 C 56 195, 60 215, 64 235 C 63 245, 67 245, 68 242 C 69 235, 70 220, 72 200 C 75 180, 79 160, 80 160 C 81 160, 85 180, 88 200 C 90 220, 91 235, 92 242 C 93 245, 97 245, 96 235 C 100 215, 104 195, 101 180 C 103 165, 102 142, 99 123 C 99 123, 102 121, 106 120 C 106 105, 103 85, 105 83 C 112 88, 116 100, 118 113 C 119 118, 122 118, 122 114 C 124 102, 122 92, 119 78 C 115 61, 105 52, 96 48 C 91 46, 89 44, 89 39 C 89 27, 87 15, 80 15 Z"
          fill="#1c1c1e"
          stroke="#27272a"
          strokeWidth="1.5"
        />

        {/* Head Shape */}
        <ellipse cx="80" cy="28" rx="8" ry="11" fill="#2d2d30" stroke="#3f3f46" strokeWidth="1" />

        {/* Neck */}
        <path d="M 75 39 C 75 42, 76 45, 76 47 L 84 47 C 84 45, 85 42, 85 39 Z" fill="#2d2d30" stroke="#3f3f46" strokeWidth="1" />

        {/* --- MUSCLES DIAGRAM --- */}

        {/* CHEST */}
        <path
          id="muscle-chest-l"
          d="M 80 50 L 63 50 C 60 52, 59 60, 59 66 C 59 75, 76 77, 80 77 Z"
          {...chestProps}
          onClick={() => handleMuscleClick('chest')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-chest-r"
          d="M 80 50 L 97 50 C 100 52, 101 60, 101 66 C 101 75, 84 77, 80 77 Z"
          {...chestProps}
          onClick={() => handleMuscleClick('chest')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* FRONT DELTOIDS (SHOULDERS) */}
        <path
          id="muscle-front-delts-l"
          d="M 58 50 C 54 52, 51 58, 49 67 C 48 71, 51 75, 54 75 C 57 72, 58 58, 58 50 Z"
          {...frontDeltsL}
          onClick={() => handleMuscleClick('front-delts')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-front-delts-r"
          d="M 102 50 C 106 52, 109 58, 111 67 C 112 71, 109 75, 106 75 C 103 72, 102 58, 102 50 Z"
          {...frontDeltsR}
          onClick={() => handleMuscleClick('front-delts')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* SIDE DELTOIDS (LATERAL SHOULDER CAPS) */}
        <path
          id="muscle-side-delts-l"
          d="M 51 61 C 47 65, 45 73, 47 82 C 51 82, 55 75, 56 67 C 55 64, 53 62, 51 61 Z"
          {...sideDeltsL}
          onClick={() => handleMuscleClick('side-delts')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-side-delts-r"
          d="M 109 61 C 113 65, 115 73, 113 82 C 109 82, 105 75, 104 67 C 105 64, 107 62, 109 61 Z"
          {...sideDeltsR}
          onClick={() => handleMuscleClick('side-delts')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* BICEPS */}
        <path
          id="muscle-biceps-l"
          d="M 48 71 C 46 75, 45 85, 47 95 C 49 97, 51 92, 52 83 C 52 78, 51 73, 48 71 Z"
          {...bicepsL}
          onClick={() => handleMuscleClick('biceps')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-biceps-r"
          d="M 112 71 C 114 75, 115 85, 113 95 C 111 97, 109 92, 108 83 C 108 78, 109 73, 112 71 Z"
          {...bicepsR}
          onClick={() => handleMuscleClick('biceps')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* FOREARMS */}
        <path
          id="muscle-forearms-l"
          d="M 47 97 C 45 102, 41 118, 43 135 C 45 142, 47 136, 49 125 C 50 115, 50 105, 47 97 Z"
          {...forearmsL}
          onClick={() => handleMuscleClick('forearms')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-forearms-r"
          d="M 113 97 C 115 102, 119 118, 117 135 C 115 142, 113 136, 111 125 C 110 115, 110 105, 113 97 Z"
          {...forearmsR}
          onClick={() => handleMuscleClick('forearms')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* ABS (RECTUS ABDOMINIS) */}
        <path
          id="muscle-abs"
          d="M 72 79 L 88 79 L 86 116 L 74 116 Z"
          {...abs}
          onClick={() => handleMuscleClick('abs')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* OBLIQUES (CORE SIDES) */}
        <path
          id="muscle-obliques-l"
          d="M 72 79 L 74 116 L 68 116 C 65 110, 63 94, 62 79 Z"
          {...obliques}
          onClick={() => handleMuscleClick('obliques')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-obliques-r"
          d="M 88 79 L 86 116 L 92 116 C 95 110, 97 94, 98 79 Z"
          {...obliques}
          onClick={() => handleMuscleClick('obliques')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* QUADRICEPS (THIGHS) */}
        <path
          id="muscle-quads-l"
          d="M 60 125 C 60 145, 62 170, 64 182 C 67 182, 73 170, 77 150 C 78 140, 78 128, 77 125 Z"
          {...quadsL}
          onClick={() => handleMuscleClick('quads')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-quads-r"
          d="M 100 125 C 100 145, 98 170, 96 182 C 93 182, 87 170, 83 150 C 82 140, 82 128, 83 125 Z"
          {...quadsR}
          onClick={() => handleMuscleClick('quads')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* CALVES */}
        <path
          id="muscle-calves-l"
          d="M 61 192 C 57 198, 60 215, 65 228 L 68 228 C 68 215, 67 198, 66 192 Z"
          {...calvesL}
          onClick={() => handleMuscleClick('calves')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-calves-r"
          d="M 99 192 C 103 198, 100 215, 95 228 L 92 228 C 92 215, 93 198, 94 192 Z"
          {...calvesR}
          onClick={() => handleMuscleClick('calves')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      </svg>
    );
  };

  // Render vector back diagram
  const renderBackBody = () => {
    const latsL = getMuscleColors('lats');
    const latsR = getMuscleColors('lats');
    const traps = getMuscleColors('traps');
    const rearDeltsL = getMuscleColors('rear-delts');
    const rearDeltsR = getMuscleColors('rear-delts');
    const tricepsL = getMuscleColors('triceps');
    const tricepsR = getMuscleColors('triceps');
    const forearmsL = getMuscleColors('forearms');
    const forearmsR = getMuscleColors('forearms');
    const lowerBack = getMuscleColors('lower-back');
    const glutes = getMuscleColors('glutes');
    const hamstringsL = getMuscleColors('hamstrings');
    const hamstringsR = getMuscleColors('hamstrings');
    const calvesL = getMuscleColors('calves');
    const calvesR = getMuscleColors('calves');

    return (
      <svg viewBox="0 0 160 260" className="w-full h-full max-h-[380px]" id="anatomy-back-svg">
        {/* Outline Base */}
        <path
          d="M 80 15 C 73 15, 71 27, 71 39 C 71 44, 69 46, 64 48 C 55 52, 45 61, 41 78 C 38 92, 36 102, 38 114 C 38 118, 41 118, 42 113 C 44 100, 48 88, 55 83 C 57 85, 54 105, 54 120 C 54 120, 58 121, 61 123 C 58 142, 57 165, 59 180 C 56 195, 60 215, 64 235 C 63 245, 67 245, 68 242 C 69 235, 70 220, 72 200 C 75 180, 79 160, 80 160 C 81 160, 85 180, 88 200 C 90 220, 91 235, 92 242 C 93 245, 97 245, 96 235 C 100 215, 104 195, 101 180 C 103 165, 102 142, 99 123 C 99 123, 102 121, 106 120 C 106 105, 103 85, 105 83 C 112 88, 116 100, 118 113 C 119 118, 122 118, 122 114 C 124 102, 122 92, 119 78 C 115 61, 105 52, 96 48 C 91 46, 89 44, 89 39 C 89 27, 87 15, 80 15 Z"
          fill="#1c1c1e"
          stroke="#27272a"
          strokeWidth="1.5"
        />

        <ellipse cx="80" cy="28" rx="8" ry="11" fill="#2d2d30" stroke="#3f3f46" strokeWidth="1" />
        <path d="M 75 39 C 75 42, 76 45, 76 47 L 84 47 C 84 45, 85 42, 85 39 Z" fill="#2d2d30" stroke="#3f3f46" strokeWidth="1" />

        {/* TRAPEZIUS (TRAPS) */}
        <path
          id="muscle-traps"
          d="M 80 44 L 70 48 C 73 53, 75 60, 75 64 L 85 64 C 85 60, 87 53, 90 48 Z"
          {...traps}
          onClick={() => handleMuscleClick('traps')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* REAR DELTOIDS */}
        <path
          id="muscle-rear-delts-l"
          d="M 59 49 C 55 52, 52 57, 50 67 L 57 71 C 59 66, 59 55, 59 49 Z"
          {...rearDeltsL}
          onClick={() => handleMuscleClick('rear-delts')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-rear-delts-r"
          d="M 101 49 C 105 52, 108 57, 110 67 L 103 71 C 101 66, 101 55, 101 49 Z"
          {...rearDeltsR}
          onClick={() => handleMuscleClick('rear-delts')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* TRICEPS */}
        <path
          id="muscle-triceps-l"
          d="M 49 69 C 47 73, 46 83, 48 93 C 50 90, 52 80, 52 72 C 52 70, 51 69, 49 69 Z"
          {...tricepsL}
          onClick={() => handleMuscleClick('triceps')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-triceps-r"
          d="M 111 69 C 113 73, 114 83, 112 93 C 110 90, 108 80, 108 72 C 108 70, 109 69, 111 69 Z"
          {...tricepsR}
          onClick={() => handleMuscleClick('triceps')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* FOREARMS */}
        <path
          id="muscle-forearms-l-back"
          d="M 47 95 C 45 100, 41 116, 43 133 C 45 140, 47 134, 49 123 C 50 113, 50 103, 47 95 Z"
          {...forearmsL}
          onClick={() => handleMuscleClick('forearms')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-forearms-r-back"
          d="M 113 95 C 115 100, 119 116, 117 133 C 115 140, 113 134, 111 123 C 110 113, 110 103, 113 95 Z"
          {...forearmsR}
          onClick={() => handleMuscleClick('forearms')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* LATS (LATISSIMUS DORSI) */}
        <path
          id="muscle-lats-l"
          d="M 75 66 C 72 68, 62 76, 61 97 C 65 97, 72 90, 75 80 Z"
          {...latsL}
          onClick={() => handleMuscleClick('lats')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-lats-r"
          d="M 85 66 C 88 68, 98 76, 99 97 C 95 97, 88 90, 85 80 Z"
          {...latsR}
          onClick={() => handleMuscleClick('lats')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* LOWER BACK */}
        <path
          id="muscle-lower-back"
          d="M 76 81 L 84 81 L 83 115 L 77 115 Z"
          {...lowerBack}
          onClick={() => handleMuscleClick('lower-back')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* GLUTES */}
        <path
          id="muscle-glutes"
          d="M 64 116 C 64 116, 62 140, 80 140 C 98 140, 96 116, 96 116 Z"
          {...glutes}
          onClick={() => handleMuscleClick('glutes')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* HAMSTRINGS (THIGHS BACK) */}
        <path
          id="muscle-hamstrings-l"
          d="M 61 142 C 60 152, 61 168, 64 182 C 68 182, 73 174, 75 160 C 76 150, 76 142, 75 142 Z"
          {...hamstringsL}
          onClick={() => handleMuscleClick('hamstrings')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-hamstrings-r"
          d="M 99 142 C 100 152, 99 168, 96 182 C 92 182, 87 174, 85 160 C 84 150, 84 142, 85 142 Z"
          {...hamstringsR}
          onClick={() => handleMuscleClick('hamstrings')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* CALVES (BACK) */}
        <path
          id="muscle-calves-l-back"
          d="M 61 192 C 57 198, 60 215, 65 228 L 68 228 C 68 215, 67 198, 66 192 Z"
          {...calvesL}
          onClick={() => handleMuscleClick('calves')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
        <path
          id="muscle-calves-r-back"
          d="M 99 192 C 103 198, 100 215, 95 228 L 92 228 C 92 215, 93 198, 94 192 Z"
          {...calvesR}
          onClick={() => handleMuscleClick('calves')}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      </svg>
    );
  };

  // Convert muscle code names to beautiful human readable titles
  const formatMuscleName = (muscle: MuscleGroup) => {
    return muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div id="anatomy-model-container" className={`relative flex flex-col items-center bg-zinc-950/25 border border-zinc-900/60 p-4 rounded-3xl ${className}`}>
      {/* Muscle Vector Diagram Area */}
      <div className="w-full h-full flex items-center justify-center p-2 relative">
        {selectedView === 'front' ? renderFrontBody() : renderBackBody()}

        {/* Subtle decorative grid lines to accentuate the UI craft */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          <span className="w-4 h-[1px] bg-zinc-800" />
          <span className="w-2 h-[1px] bg-zinc-800" />
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-1">
          <span className="w-2 h-[1px] bg-zinc-800" />
          <span className="w-4 h-[1px] bg-zinc-800" />
        </div>
      </div>

      {/* Showing small labels only if requested */}
      {showLabels && (primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
        <div className="mt-4 flex flex-col space-y-2 w-full text-xs">
          {primaryMuscles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow shadow-blue-500/50" />
              <span className="text-zinc-400 font-medium">Primary:</span>
              <span className="text-zinc-200 capitalize font-semibold">{primaryMuscles.map(formatMuscleName).join(', ')}</span>
            </div>
          )}
          {secondaryMuscles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500 shadow shadow-violet-500/30" />
              <span className="text-zinc-400 font-medium">Secondary/Works:</span>
              <span className="text-zinc-300 capitalize font-medium">{secondaryMuscles.map(formatMuscleName).join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
