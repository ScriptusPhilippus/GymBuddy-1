/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PoseIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const PoseIcon: React.FC<PoseIconProps> = ({ name, className = '', size = 56 }) => {
  // Try loading from assets first if any exists in runtime, but default to crisp vector inline representation.
  // The user prompt indicates images can be placed at `/src/assets/poses/`. If they are there, a webpath could be used,
  // but let's provide gorgeous embedded high-fidelity SVGs that look exactly like the target iOS app!
  
  // Custom styled SVG for each pose, matching "Pure white line art, 4px uniform stroke, round caps, small circle head, simple geometric weights"
  const renderSvg = () => {
    switch (name) {
      case 'bench-press':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Supporting Bench */}
            <line x1="20" y1="75" x2="80" y2="75" />
            <line x1="35" y1="75" x2="35" y2="90" />
            <line x1="65" y1="75" x2="65" y2="90" />
            {/* Body */}
            <circle cx="28" cy="62" r="5" fill="none" /> {/* Head */}
            <line x1="33" y1="67" x2="70" y2="67" /> {/* Spine */}
            <line x1="70" y1="67" x2="78" y2="85" /> {/* Leg 1 */}
            <line x1="78" y1="85" x2="84" y2="85" /> {/* Foot */}
            {/* Arms holding Barbell */}
            <line x1="50" y1="67" x2="50" y2="35" /> {/* Arm */}
            {/* Barbell */}
            <line x1="20" y1="35" x2="80" y2="35" strokeWidth="5" />
            <rect x="14" y="27" width="6" height="16" rx="2" fill="currentColor" />
            <rect x="80" y="27" width="6" height="16" rx="2" fill="currentColor" />
          </svg>
        );

      case 'chest-fly':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Flat Bench (front view) */}
            <line x1="35" y1="70" x2="65" y2="70" />
            <line x1="50" y1="70" x2="50" y2="90" />
            {/* Body */}
            <circle cx="50" cy="50" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="55" x2="50" y2="70" /> {/* Torso */}
            {/* Wide Arms / Dumbbells */}
            <path d="M 50 60 Q 25 45 15 35" /> {/* Left arm wide arc */}
            <path d="M 50 60 Q 75 45 85 35" /> {/* Right arm wide arc */}
            {/* Dumbbells */}
            <line x1="10" y1="30" x2="20" y2="40" strokeWidth="5" />
            <line x1="80" y1="30" x2="90" y2="40" strokeWidth="5" />
          </svg>
        );

      case 'push-up':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Floor */}
            <line x1="10" y1="85" x2="90" y2="85" />
            {/* Body */}
            <circle cx="75" cy="40" r="5" fill="none" /> {/* Head */}
            <line x1="71" y1="44" x2="25" y2="68" strokeWidth="5" /> {/* Straight body line */}
            <line x1="25" y1="68" x2="18" y2="85" /> {/* Feet touch floor */}
            {/* Arms supporting */}
            <line x1="60" y1="50" x2="60" y2="85" /> {/* Arm vertical */}
          </svg>
        );

      case 'dip':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Dip Bars */}
            <line x1="20" y1="65" x2="45" y2="65" />
            <line x1="55" y1="65" x2="80" y2="65" />
            <line x1="30" y1="65" x2="30" y2="90" />
            <line x1="70" y1="65" x2="70" y2="90" />
            {/* Body suspended */}
            <circle cx="50" cy="25" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="30" x2="50" y2="60" strokeWidth="5" /> {/* Spine */}
            <line x1="50" y1="60" x2="43" y2="80" /> {/* Leg 1 */}
            <line x1="43" y1="80" x2="45" y2="85" />
            <line x1="50" y1="60" x2="57" y2="80" /> {/* Leg 2 */}
            <line x1="57" y1="80" x2="55" y2="85" />
            {/* Arms holding bars */}
            <line x1="50" y1="38" x2="32" y2="45" /> {/* Upper arm */}
            <line x1="32" y1="45" x2="30" y2="65" /> {/* Forearm */}
            <line x1="50" y1="38" x2="68" y2="45" />
            <line x1="68" y1="45" x2="70" y2="65" />
          </svg>
        );

      case 'pull-up':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Pull-up Bar */}
            <line x1="10" y1="18" x2="90" y2="18" strokeWidth="5" />
            {/* Body Hanging */}
            <circle cx="50" cy="35" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="40" x2="50" y2="70" strokeWidth="5" /> {/* Torso */}
            <line x1="50" y1="70" x2="45" y2="90" /> {/* Left leg */}
            <line x1="50" y1="70" x2="55" y2="90" /> {/* Right leg */}
            {/* Arms reaching UP to bar */}
            <line x1="50" y1="45" x2="30" y2="18" /> {/* Left arm */}
            <line x1="50" y1="45" x2="70" y2="18" /> {/* Right arm */}
          </svg>
        );

      case 'pulldown':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Overhead pulley & cables */}
            <line x1="50" y1="15" x2="50" y2="25" />
            <line x1="25" y1="25" x2="75" y2="25" strokeWidth="3" /> {/* Pulley Bar */}
            {/* Cable strings to bar */}
            <line x1="50" y1="15" x2="50" y2="45" strokeWidth="1" strokeDasharray="2,2" />
            {/* Seat platform */}
            <line x1="30" y1="80" x2="70" y2="80" />
            <line x1="50" y1="80" x2="50" y2="92" />
            {/* Seated Figure */}
            <circle cx="50" cy="44" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="49" x2="50" y2="72" strokeWidth="5" /> {/* Torso */}
            {/* Thigh pad restraint */}
            <line x1="38" y1="67" x2="62" y2="67" strokeWidth="5" />
            <line x1="50" y1="72" x2="42" y2="80" /> {/* Leg bent down */}
            <line x1="42" y1="80" x2="42" y2="90" />
            {/* Arms pulled down holding bar */}
            <line x1="50" y1="52" x2="30" y2="35" /> {/* Upper left */}
            <line x1="30" y1="35" x2="25" y2="25" /> {/* Grab left bar */}
            <line x1="50" y1="52" x2="70" y2="35" /> {/* Upper right */}
            <line x1="70" y1="35" x2="75" y2="25" /> {/* Grab right bar */}
          </svg>
        );

      case 'row':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Floor */}
            <line x1="10" y1="85" x2="90" y2="85" />
            {/* Figure bent forward */}
            <circle cx="65" cy="35" r="5" fill="none" /> {/* Head */}
            <line x1="60" y1="38" x2="40" y2="52" strokeWidth="5" /> {/* Curved Back/Torso */}
            <line x1="40" y1="52" x2="45" y2="70" /> {/* Hip to knee */}
            <line x1="45" y1="70" x2="45" y2="85" /> {/* Knee to ankle */}
            {/* Arm pulling barbell */}
            <line x1="55" y1="41" x2="50" y2="60" /> {/* Arm reaching down pulling */}
            {/* Barbell held */}
            <circle cx="50" cy="60" r="4" fill="currentColor" />
            <line x1="30" y1="60" x2="70" y2="60" strokeWidth="4" />
          </svg>
        );

      case 'face-pull':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Cable machine on the left */}
            <line x1="15" y1="20" x2="15" y2="90" strokeWidth="3" />
            <line x1="15" y1="35" x2="40" y2="35" strokeWidth="1" strokeDasharray="3,3" /> {/* Cable thread */}
            {/* Standing Figure */}
            <circle cx="55" cy="32" r="5" fill="none" /> {/* Head */}
            <line x1="55" y1="37" x2="55" y2="70" strokeWidth="5" /> {/* Torso */}
            <line x1="55" y1="70" x2="50" y2="90" /> {/* Left leg */}
            <line x1="55" y1="70" x2="60" y2="90" /> {/* Right leg */}
            {/* Pulling arms flared */}
            <path d="M 55 45 C 45 40, 42 35, 40 35" /> {/* Arm holding rope at face height */}
          </svg>
        );

      case 'overhead-press':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Floor */}
            <line x1="15" y1="90" x2="85" y2="90" />
            {/* Standing body */}
            <circle cx="50" cy="40" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="45" x2="50" y2="72" strokeWidth="5" /> {/* Spine */}
            <line x1="50" y1="72" x2="42" y2="90" /> {/* Left leg */}
            <line x1="50" y1="72" x2="58" y2="90" /> {/* Right leg */}
            {/* Arms overhead */}
            <line x1="50" y1="48" x2="38" y2="20" />
            <line x1="50" y1="48" x2="62" y2="20" />
            {/* Barbell overhead */}
            <line x1="20" y1="20" x2="80" y2="20" strokeWidth="5" />
            <rect x="14" y="12" width="6" height="16" rx="2" fill="currentColor" />
            <rect x="80" y="12" width="6" height="16" rx="2" fill="currentColor" />
          </svg>
        );

      case 'lateral-raise':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="15" y1="90" x2="85" y2="90" />
            {/* Figure standing */}
            <circle cx="50" cy="35" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="40" x2="50" y2="70" strokeWidth="5" /> {/* spine */}
            <line x1="50" y1="70" x2="44" y2="90" />
            <line x1="50" y1="70" x2="56" y2="90" />
            {/* Lateral Arms */}
            <line x1="50" y1="45" x2="20" y2="45" /> {/* Left Arm straight */}
            <line x1="50" y1="45" x2="80" y2="45" /> {/* Right Arm straight */}
            {/* Dumbbells held flat */}
            <line x1="16" y1="40" x2="16" y2="50" strokeWidth="5" />
            <line x1="84" y1="40" x2="84" y2="50" strokeWidth="5" />
          </svg>
        );

      case 'shrug':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="15" y1="90" x2="85" y2="90" />
            {/* Shrugging body */}
            <circle cx="50" cy="32" r="5" fill="none" /> {/* Head resting in shrugged neck */}
            {/* High shrugged shoulder points */}
            <line x1="38" y1="36" x2="62" y2="36" strokeWidth="4" />
            <line x1="50" y1="36" x2="50" y2="70" strokeWidth="5" />
            <line x1="50" y1="70" x2="44" y2="90" />
            <line x1="50" y1="70" x2="56" y2="90" />
            {/* Hanging arms holding weights at thighs */}
            <line x1="38" y1="36" x2="36" y2="60" />
            <line x1="62" y1="36" x2="64" y2="60" />
            {/* Barbell held at thigh level */}
            <line x1="22" y1="60" x2="78" y2="60" strokeWidth="4" />
          </svg>
        );

      case 'curl':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="15" y1="90" x2="85" y2="90" />
            <circle cx="50" cy="35" r="5" fill="none" /> {/* Head */}
            <line x1="50" y1="40" x2="50" y2="70" strokeWidth="5" />
            <line x1="50" y1="70" x2="44" y2="90" />
            <line x1="50" y1="70" x2="56" y2="90" />
            {/* Curled arms */}
            <path d="M 45 45 Q 35 55 40 40" /> {/* Left hand curl up */}
            <path d="M 55 45 Q 65 55 60 40" /> {/* Right hand curl up */}
            {/* Dumbbells curled up near shoulder height */}
            <circle cx="40" cy="36" r="3" fill="currentColor" />
            <circle cx="60" cy="36" r="3" fill="currentColor" />
          </svg>
        );

      case 'tricep-extension':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="15" y1="90" x2="85" y2="90" />
            <circle cx="45" cy="45" r="5" fill="none" /> {/* Head slightly forward */}
            <line x1="47" y1="50" x2="47" y2="75" strokeWidth="5" /> {/* Body */}
            <line x1="47" y1="75" x2="42" y2="90" />
            <line x1="47" y1="75" x2="52" y2="90" />
            {/* Arms reaching backwards overhead */}
            <line x1="48" y1="52" x2="56" y2="30" /> {/* Shoulder to elbow pointed up */}
            <line x1="56" y1="30" x2="42" y2="30" /> {/* Forearm bent behind head */}
            <circle cx="40" cy="30" r="3.5" fill="currentColor" /> {/* Dumbbell shadow */}
          </svg>
        );

      case 'squat':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Floor */}
            <line x1="10" y1="90" x2="90" y2="90" />
            {/* Squatting figure - deep angle side view */}
            <circle cx="38" cy="48" r="5" fill="none" /> {/* Head leaned forward */}
            <line x1="44" y1="50" x2="44" y2="28" strokeWidth="1" strokeDasharray="1,1" /> {/* Bar visual */}
            {/* Squatted legs */}
            <line x1="42" y1="52" x2="54" y2="36" strokeWidth="5" /> {/* Back spine angled */}
            <line x1="54" y1="36" x2="42" y2="58" strokeWidth="5" /> {/* Hip to knee */}
            <line x1="42" y1="58" x2="54" y2="78" strokeWidth="5" /> {/* Knee to ankle deeply bent */}
            <line x1="54" y1="78" x2="50" y2="90" /> {/* foot */}
            {/* Heavy Barbell on Back */}
            <circle cx="47" cy="39" r="6" fill="none" strokeWidth="3" />
            <line x1="15" y1="35" x2="75" y2="35" strokeWidth="5" />
            <rect x="10" y="27" width="5" height="16" rx="1" fill="currentColor" />
            <rect x="75" y="27" width="5" height="16" rx="1" fill="currentColor" />
          </svg>
        );

      case 'lunge':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="90" x2="90" y2="90" />
            <circle cx="48" cy="32" r="5" fill="none" /> {/* Head */}
            <line x1="48" y1="37" x2="48" y2="60" strokeWidth="5" /> {/* Upright Spine */}
            {/* Lunge Legs */}
            <line x1="48" y1="60" x2="68" y2="60" strokeWidth="5" /> {/* Front thigh horizontal */}
            <line x1="68" y1="60" x2="68" y2="90" strokeWidth="5" /> {/* Front shin vertical */}
            <line x1="48" y1="60" x2="32" y2="74" strokeWidth="5" /> {/* Back thigh angled */}
            <line x1="32" y1="74" x2="16" y2="88" strokeWidth="5" /> {/* Back shin extended back */}
            {/* Dumbbells in hands */}
            <line x1="42" y1="48" x2="42" y2="70" strokeWidth="2" />
            <circle cx="42" cy="70" r="4.5" fill="currentColor" />
          </svg>
        );

      case 'leg-extension':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Seat Frame */}
            <line x1="30" y1="70" x2="60" y2="70" />
            <line x1="30" y1="30" x2="30" y2="85" />
            {/* Figure Seated */}
            <circle cx="45" cy="35" r="5" fill="none" />
            <line x1="45" y1="40" x2="45" y2="68" strokeWidth="5" /> {/* Back */}
            {/* Legs extended horizontally */}
            <line x1="45" y1="68" x2="70" y2="68" strokeWidth="5" /> {/* Thigh */}
            <line x1="70" y1="68" x2="84" y2="52" strokeWidth="5" /> {/* Leg extended forward */}
            {/* Weight Lever Plate */}
            <rect x="80" y="44" width="8" height="8" rx="1" fill="currentColor" />
          </svg>
        );

      case 'calf-raise':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Calf raises ledge */}
            <rect x="25" y="85" width="20" height="10" rx="1" fill="none" />
            <line x1="10" y1="90" x2="90" y2="90" />
            {/* Tiptoe person */}
            <circle cx="50" cy="32" r="5" fill="none" />
            <line x1="50" y1="37" x2="50" y2="70" strokeWidth="5" />
            <line x1="50" y1="70" x2="40" y2="85" strokeWidth="5" /> {/* Ankle raised */}
            <line x1="40" y1="85" x2="32" y2="85" /> {/* Tip toes planted on bloc */}
          </svg>
        );

      case 'deadlift':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Floor */}
            <line x1="10" y1="90" x2="90" y2="90" />
            {/* Deadlifter starting position hinge */}
            <circle cx="40" cy="40" r="5" fill="none" /> {/* Head looking forward-down */}
            <line x1="43" y1="44" x2="62" y2="58" strokeWidth="5" /> {/* Flat Spine slanted */}
            <line x1="62" y1="58" x2="52" y2="72" strokeWidth="5" /> {/* Hips to knee bent back */}
            <line x1="52" y1="72" x2="52" y2="90" strokeWidth="5" /> {/* Shins near vertical */}
            {/* Arm straight reaching down to bar */}
            <line x1="48" y1="46" x2="48" y2="82" />
            {/* Barbell at shin level */}
            <circle cx="48" cy="82" r="5" fill="none" strokeWidth="3" />
            <line x1="15" y1="82" x2="80" y2="82" strokeWidth="5" />
            <rect x="10" y="74" width="5" height="16" rx="1" fill="currentColor" />
            <rect x="80" y="74" width="5" height="16" rx="1" fill="currentColor" />
          </svg>
        );

      case 'hyperextension':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* 45 Deg Frame */}
            <line x1="20" y1="85" x2="55" y2="50" />
            <line x1="30" y1="85" x2="30" y2="65" />
            {/* Body angled at 45 */}
            <circle cx="70" cy="30" r="5" fill="none" />
            <line x1="65" y1="33" x2="30" y2="68" strokeWidth="5" /> {/* Body straight from heels to head */}
            {/* Locked Leg support */}
            <circle cx="30" cy="74" r="4.5" fill="currentColor" />
          </svg>
        );

      case 'hip-thrust':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Supporting bench */}
            <line x1="20" y1="65" x2="45" y2="65" />
            {/* Flat Lift Body */}
            <circle cx="43" cy="50" r="5" fill="none" /> {/* Head resting on bench line */}
            <line x1="48" y1="55" x2="72" y2="55" strokeWidth="5" /> {/* Torso horizontal flat */}
            {/* Knee bent at 90 */}
            <line x1="72" y1="55" x2="72" y2="78" strokeWidth="5" /> {/* Shin vertical */}
            <line x1="72" y1="78" x2="78" y2="78" /> {/* Foot */}
            <line x1="10" y1="78" x2="90" y2="78" /> {/* Floor */}
            {/* Barbell resting on hip area */}
            <line x1="50" y1="55" x2="50" y2="35" strokeWidth="1" strokeDasharray="1,1" />
            <circle cx="60" cy="55" r="5" fill="none" strokeWidth="3" />
            <line x1="45" y1="55" x2="75" y2="55" strokeWidth="5" />
          </svg>
        );

      case 'leg-curl':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Machine Line */}
            <line x1="20" y1="70" x2="75" y2="70" />
            {/* Body face down */}
            <circle cx="28" cy="60" r="5" fill="none" />
            <line x1="33" y1="65" x2="68" y2="65" strokeWidth="5" /> {/* Upper body & thigh */}
            {/* Curled leg back */}
            <line x1="68" y1="65" x2="78" y2="45" strokeWidth="5" /> {/* Lower leg bent up */}
            {/* Weighted lever rollers */}
            <circle cx="80" cy="43" r="4" fill="currentColor" />
          </svg>
        );

      case 'plank':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Ground */}
            <line x1="10" y1="80" x2="90" y2="80" />
            {/* Horizontal Plank body */}
            <circle cx="25" cy="55" r="5" fill="none" /> {/* Head */}
            <line x1="30" y1="60" x2="80" y2="60" strokeWidth="5" /> {/* Straight body spine */}
            <line x1="80" y1="60" x2="84" y2="80" /> {/* Feet touch floor */}
            {/* Forearm support */}
            <line x1="35" y1="60" x2="35" y2="80" />
            <line x1="35" y1="80" x2="45" y2="80" />
          </svg>
        );

      case 'crunch':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="85" x2="90" y2="85" />
            {/* Crunch body flat of shoulder blades up */}
            <circle cx="32" cy="70" r="5" fill="none" /> {/* Head */}
            <path d="M 32 75 Q 40 68 50 80" strokeWidth="5" fill="none" /> {/* Curled torso up off floor */}
            {/* Bent knees */}
            <path d="M 50 80 L 70 65 L 82 85" strokeWidth="5" fill="none" />
          </svg>
        );

      case 'sit-up':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="85" x2="90" y2="85" />
            {/* Body seated at 90 */}
            <circle cx="48" cy="40" r="5" fill="none" />
            <line x1="48" y1="45" x2="48" y2="78" strokeWidth="5" /> {/* Upright torso */}
            {/* Knees bent */}
            <path d="M 48 78 L 70 65 L 80 85" strokeWidth="5" fill="none" />
          </svg>
        );

      case 'mountain-climber':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="85" x2="90" y2="85" />
            <circle cx="70" cy="40" r="4" fill="none" />
            <line x1="66" y1="44" x2="25" y2="64" strokeWidth="5" /> {/* spine */}
            {/* Hands support */}
            <line x1="58" y1="48" x2="58" y2="85" />
            {/* Legs mimicking climbing running stride */}
            <path d="M 25 64 L 40 55 L 43 70" strokeWidth="4" fill="none" /> {/* Bent knee driven forward */}
            <line x1="25" y1="64" x2="16" y2="85" /> {/* back leg extended */}
          </svg>
        );

      case 'bike':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Spin Bike frame */}
            <circle cx="32" cy="74" r="10" />
            <circle cx="68" cy="74" r="10" />
            <path d="M 32 74 L 50 74 L 68 74 L 58 46 L 36 74" />
            <line x1="50" y1="74" x2="48" y2="48" /> {/* Seat post */}
            <line x1="43" y1="48" x2="53" y2="48" /> {/* Saddle */}
            <line x1="58" y1="46" x2="62" y2="38" /> {/* Handlebar post */}
            <line x1="59" y1="38" x2="68" y2="38" /> {/* Handle */}
            {/* Seated Rider stick figure */}
            <circle cx="43" cy="32" r="4.5" fill="none" />
            <line x1="43" y1="36" x2="45" y2="52" strokeWidth="4" /> {/* Spine angled */}
            {/* Legs on pedals */}
            <line x1="45" y1="52" x2="50" y2="68" />
            <line x1="50" y1="68" x2="42" y2="78" />
            {/* Arms on bars */}
            <line x1="44" y1="40" x2="62" y2="38" />
          </svg>
        );

      case 'run':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Runner mid-stride */}
            <circle cx="55" cy="28" r="5" fill="none" />
            <line x1="53" y1="33" x2="48" y2="52" strokeWidth="5" /> {/* spine tilted forward */}
            {/* Legs open wide */}
            <path d="M 48 52 L 32 65 L 20 54" strokeWidth="4" fill="none" /> {/* Rear leg bent back */}
            <path d="M 48 52 L 64 62 L 54 82" strokeWidth="4" fill="none" /> {/* Front knee drives forward and down */}
            {/* Swinging Arms */}
            <path d="M 50 36 L 62 43 C 68 46, 68 50, 72 44" fill="none" />
            <path d="M 50 36 L 38 43 C 32 46, 30 50, 26 44" fill="none" />
          </svg>
        );

      case 'generic':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* A classic high-fashion Dumbbell icon */}
            <rect x="45" y="20" width="10" height="60" rx="3" fill="currentColor" />
            {/* Plate stack left */}
            <rect x="25" y="32" width="15" height="36" rx="4" fill="none" strokeWidth="4" />
            <rect x="12" y="38" width="13" height="24" rx="2" fill="none" strokeWidth="4" />
            {/* Plate stack right */}
            <rect x="60" y="32" width="15" height="36" rx="4" fill="none" strokeWidth="4" />
            <rect x="75" y="38" width="13" height="24" rx="2" fill="none" strokeWidth="4" />
          </svg>
        );
    }
  };

  return (
    <div
      id={`pose-icon-${name}`}
      className={`relative flex items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full p-0.5 max-h-full max-w-full flex items-center justify-center text-white">
        {renderSvg()}
      </div>
      {/* Dynamic Purple/Violet ambient aura glows behind the icons, giving that futuristic look in the app! */}
      <span className="absolute inset-0 bg-violet-600/10 blur-xl rounded-xl -z-10 pointer-events-none" />
    </div>
  );
};
