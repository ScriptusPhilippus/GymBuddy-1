/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Flat Bench Press',
    category: 'chest',
    equipment: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'front-delts'],
    poseIcon: 'bench-press',
    whatItTrains: 'Compound chest press performed lying on a bench. Builds chest, front delts, and triceps.',
    setup: [
      'Lie flat on the bench, eyes under the bar.',
      'Grip slightly wider than shoulders.',
      'Plant feet, arch lower back slightly, shoulders blades pinched.'
    ],
    howToPerform: [
      'Unrack and hold bar over your chest with locked elbows.',
      'Lower the bar to mid-chest with control (elbows at 45°).',
      'Press back up to lockout. Repeat.'
    ],
    coachingTip: 'Keep wrists stacked over elbows and drive through your feet for more stability and power.',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'chest-fly',
    name: 'Flat Dumbbell Fly',
    category: 'chest',
    equipment: 'dumbbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts'],
    poseIcon: 'chest-fly',
    whatItTrains: 'Isolation exercise targeting chest chest contraction and stretch.',
    setup: [
      'Sit on flat bench with dumbbells on knees.',
      'Lie back, bringing dumbbells to chest, then press them up.',
      'Slight bend in elbows, palms face each other.'
    ],
    howToPerform: [
      'Lower weights out in a wide arc until chest stretch is felt.',
      'Keep elbow bend constant throughout movement.',
      'Squeeze chest to bring weights back together in same arc.'
    ],
    coachingTip: 'Do not go too deep below bench level; focus on chest squeeze rather than pressing the weights.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'push-up',
    name: 'Standard Push-Up',
    category: 'chest',
    equipment: 'bodyweight',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts', 'triceps', 'abs'],
    poseIcon: 'push-up',
    whatItTrains: 'Classic bodyweight builder for upper-body pushing power and trunk rigidity.',
    setup: [
      'Get into a high plank position, hands slightly wider than shoulders.',
      'Engage core, glutes, and quad to keep body straight.',
      'Keep head in line with spine.'
    ],
    howToPerform: [
      'Lower body until chest is an inch from floor.',
      'Keep elbows tucked backwards at 45 degrees rather than flared.',
      'Push back up to starting position, maintaining rigid core.'
    ],
    coachingTip: 'Keep your whole body moving as a single, solid plank. No sagging hips.',
    defaultSets: 3,
    defaultReps: '15-20'
  },
  {
    id: 'dip',
    name: 'Chest Dip',
    category: 'chest',
    equipment: 'bodyweight',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['front-delts'],
    poseIcon: 'dip',
    whatItTrains: 'Lower chest and triceps focus using parallel bars. Great compound developer.',
    setup: [
      'Grip parallel bars and hoist body upright, locking elbows.',
      'Lean torso slightly forward (approx 15-30°) to shift emphasis to chest.',
      'Cross feet at ankles.'
    ],
    howToPerform: [
      'Lower body by bending elbows until upper arms are parallel to floor.',
      'Control descent to avoid shoulder strain.',
      'Push through palms to drive back up to locked elbows.'
    ],
    coachingTip: 'Avoid shrugging shoulders during descent. Keep your chest up and shoulders down.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'pull-up',
    name: 'Wide-Grip Pull-Up',
    category: 'back',
    equipment: 'bodyweight',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'forearms', 'traps'],
    poseIcon: 'pull-up',
    whatItTrains: 'King of back builders, targeting upper lats and mid-back width.',
    setup: [
      'Hang from horizontal pull-up bar with overhand grip wider than shoulders.',
      'Pull shoulder blades down and back (depress shoulders).',
      'Cross ankles behind you.'
    ],
    howToPerform: [
      'Pull chest up toward bar by driving elbows down to ribs.',
      'Keep core engaged and avoid swinging legs for momentum.',
      'Squeeze lats at the top, then slowly lower to full hang.'
    ],
    coachingTip: 'Imagine pulling the ceiling down with elbows rather than lifting yourself with arms.',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'traps', 'forearms'],
    poseIcon: 'pulldown',
    whatItTrains: 'Cable pulley alternative to pull-ups, allowing precise lock-in of the lat muscles.',
    setup: [
      'Sit facing the lat pulldown cable station.',
      'Adjust thigh pad to pin legs firmly.',
      'Grip wide bar overhand and lean back very slightly (10°).'
    ],
    howToPerform: [
      'Pull bar down to upper chest level, leading with elbows.',
      'Squeeze shoulder blades hard at bottom of movement.',
      'Slowly reverse bar path back to top, maintaining tension.'
    ],
    coachingTip: 'Release shoulders at top for complete lat stretch, but keep movements controlled.',
    defaultSets: 4,
    defaultReps: '8-12'
  },
  {
    id: 'row',
    name: 'Barbell Row',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['lats', 'traps'],
    secondaryMuscles: ['lower-back', 'biceps', 'forearms'],
    poseIcon: 'row',
    whatItTrains: 'Heavy posterior-chain row builder for mid-back thickness and lats power.',
    setup: [
      'Stand over barbell, feet shoulder-width, shins close to bar.',
      'Hinge at hips, bending knees slightly, torso almost parallel to floor.',
      'Grip bar overhand slightly wider than feet.'
    ],
    howToPerform: [
      'Pull bar up forcefully toward lower ribs, routing elbows past spine.',
      'Keep torso rigid at a constant angle; do not sit up.',
      'Squeeze shoulder blades, then slowly lower bar to hang.'
    ],
    coachingTip: 'Avoid row-dancing by using lower back swings. Maintain a strong, flat, static spine.',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'face-pull',
    name: 'Cable Face Pull',
    category: 'shoulders',
    equipment: 'cable',
    primaryMuscles: ['rear-delts', 'traps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'face-pull',
    whatItTrains: 'Crucial accessory for shoulder health, targeting rear deltoids and upper back rotators.',
    setup: [
      'Set cable pulley to upper chest height with double rope attachment.',
      'Grip rope ends with thumbs pointing back, take small step back.',
      'Slightly bend knees for solid base.'
    ],
    howToPerform: [
      'Pull center of rope directly toward nose/face level.',
      'Flare elbows high and wide, squeezing rear delts hard.',
      'Rotate wrists at the top to complete external shoulder rotation.',
      'Slowly guide rope back.'
    ],
    coachingTip: 'Pause for a full second at peak of contraction to enforce shoulder stabilizers.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'shoulders',
    equipment: 'barbell',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['triceps', 'traps'],
    poseIcon: 'overhead-press',
    whatItTrains: 'Core compound dynamic strength overhead. Builds heavy shoulders and vertical push strength.',
    setup: [
      'Racked barbell at mid-chest height. Grip bar just outside shoulders.',
      'Step under bar, unrack onto front chest/shoulders, step back.',
      'Tense glutes, quads, and abs heavily. Elbows slightly forward.'
    ],
    howToPerform: [
      'Press bar straight overhead, leaning head back slightly to clear bar.',
      'Once bar passes head, push head forward and lock out overhead.',
      'Lower bar with control back down to collarbones.'
    ],
    coachingTip: 'Keep your glutes locked rock-solid to protect the lower back and provide a base.',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['rear-delts'], // using rear-delts / lateral-delts (delts)
    secondaryMuscles: ['traps'],
    poseIcon: 'lateral-raise',
    whatItTrains: 'Isolation for side/lateral shoulder heads, generating shoulder width and 3D caps.',
    setup: [
      'Stand holding dumbbells at sides, feet together.',
      'Slight forward lean (5°), elbows bent slightly.'
    ],
    howToPerform: [
      'Raise arms out to sides until elbows reach shoulder height.',
      'Lead with elbows, keeping hands lower than or level with elbows.',
      'Squeeze side delts, then slowly control dumbbells down.'
    ],
    coachingTip: 'Do not raise hands higher than elbows. Pour dumbbells slightly forward at peak.',
    defaultSets: 4,
    defaultReps: '12-15'
  },
  {
    id: 'shrug',
    name: 'Dumbbell Shrug',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['traps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'shrug',
    whatItTrains: 'Thickening upper neck and trapezius muscles using vertical upward pull.',
    setup: [
      'Stand holding heavy dumbbells at sides.',
      'Keep arms straight, chest proud, feet hip-width.'
    ],
    howToPerform: [
      'Elevate shoulders toward ears as high as possible.',
      'Squeeze traps at the top without bending elbows.',
      'Control weights back down to a deep stretch.'
    ],
    coachingTip: 'Do not roll shoulders in circles; pull strictly vertically up and down.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'curl',
    name: 'Dumbbell Bicep Curl',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'curl',
    whatItTrains: 'Classic upper-arm isolation targeting biceps brachii bulk and peak.',
    setup: [
      'Stand holding dumbbells at sides, palms facing forward or each other.',
      'Lock elbows to sides of torso.'
    ],
    howToPerform: [
      'Curl dumbbells toward shoulders by bending elbows.',
      'Rotate wrists (supinate) if palms were neutral, squeezing biceps.',
      'Lower with strict control back to full arm extension.'
    ],
    coachingTip: 'Keep elbows tucked and do not let them drift forward to enlist front delts.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'tricep-extension',
    name: 'Overhead Tricep Extension',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'tricep-extension',
    whatItTrains: 'Overhead extension targeting long-head triceps isolation.',
    setup: [
      'Stand upright, feet hip-width apart.',
      'Hold a single heavy dumbbell with both hands wrapped under inner plate.',
      'Raise dumbbell directly overhead.'
    ],
    howToPerform: [
      'Lower dumbbell behind head by bending elbows.',
      'Keep elbows pointed forward/pulled in toward temples.',
      'Extend arms to press dumbbell back overhead. Repeat.'
    ],
    coachingTip: 'Focus on getting a deep stretch in the triceps on the lower half of the lift.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'lower-back', 'calves'],
    poseIcon: 'squat',
    whatItTrains: 'King of leg utilities. Incredible lower-body compound builder targeting quads, glutes, and thighs.',
    setup: [
      'Racked bar at upper chest height. Step under, resting bar on upper traps.',
      'Unrack by extending knees, step back with 3-step squat stance.',
      'Inhale deeply, bracing core to create abdominal cylinder.'
    ],
    howToPerform: [
      'Sit back and down, keeping chest up and knees pushing outward.',
      'Descend until crease of hips is lower than top of knees (below parallel).',
      'Drive upward through mid-foot to stand up. Exhale at top.'
    ],
    coachingTip: 'Keep knees in line with toes throughout rise. Avoid collapse (knees caving in).',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'lunge',
    name: 'Dumbbell Walking Lunge',
    category: 'legs',
    equipment: 'dumbbell',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    poseIcon: 'lunge',
    whatItTrains: 'Unilateral quad and glute performance, enhancing symmetry and balance.',
    setup: [
      'Stand tall holding dumbbells at sides, feet close together.',
      'Look straight ahead with braced trunk.'
    ],
    howToPerform: [
      'Step forward smoothly, descending until rear knee almost touches ground.',
      'Front thigh should be parallel to floor, front knee stacked over ankle.',
      'Drive through front heel, step opposite leg forward into next lunge.'
    ],
    coachingTip: 'Work in a straight line, ensuring your knees do not wobble sideways in step transitions.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension Machine',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    poseIcon: 'leg-extension',
    whatItTrains: 'Pure isolation for rectus femoris and quad teardrops, creating quad definition.',
    setup: [
      'Sit on extension machine, aligning knee joint with machine pivot loop.',
      'Fit ankle pad snug under lower shins.',
      'Grip side handles lightly to lock hips down.'
    ],
    howToPerform: [
      'Extend legs straight out horizontally in front of you.',
      'Squeeze quads forcefully at lockout for 1 second.',
      'Slowly guide lower legs back down to starting position.'
    ],
    coachingTip: 'Ensure your back and hips stay firmly pressed against the seat pad throughout.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    poseIcon: 'calf-raise',
    whatItTrains: 'Gastrocnemius calf bulk loading, expanding leg symmetry and power.',
    setup: [
      'Step on edge of raised calf platform, balls of feet on edge.',
      'Place shoulders under padded levers of calf machine or hold dumbbells.',
      'Lower heels below step level for dynamic stretch.'
    ],
    howToPerform: [
      'Drive toes down to hoist body as high as possible.',
      'Hold peak squeeze for a brief moment.',
      'Slowly lower heels down to complete stretch.'
    ],
    coachingTip: 'Do not bounce on ankles! Use slow, deliberate movement with pauses to bypass elastic reflex.',
    defaultSets: 3,
    defaultReps: '15-20'
  },
  {
    id: 'deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['hamstrings', 'lower-back', 'glutes'],
    secondaryMuscles: ['traps', 'lats', 'forearms'],
    poseIcon: 'deadlift',
    whatItTrains: 'Raw complete-body posterior chain power. Heavy training for glutes, and back muscles.',
    setup: [
      'Stand with midfoot under bar, feet hip-width.',
      'Hinge over and grip bar with arms vertical, just outside shins.',
      'Drop hips until shins touch bar, push chest out, keep flat spine.'
    ],
    howToPerform: [
      'Pull slack out of bar, then pull forcefully by pushing floor away with legs.',
      'Keep bar tucked directly against shins and thighs as you stand.',
      'Lock out hips at top, then slide bar back down thighs and drop to ground.'
    ],
    coachingTip: 'Keep your chest open and lower back totally flat. Avoid curving spine like a cat.',
    defaultSets: 4,
    defaultReps: '5'
  },
  {
    id: 'hyperextension',
    name: '45° Back Hyperextension',
    category: 'legs', // posterior chain
    equipment: 'bodyweight',
    primaryMuscles: ['lower-back', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    poseIcon: 'hyperextension',
    whatItTrains: 'Erector spinae lower-back strength, bolstering spine safety and glute posture.',
    setup: [
      'Step on 45° hyperextension bench, ankles secured by rear rollers.',
      'Align hips just above padded rest edge to allow bending.',
      'Fold hands across chest.'
    ],
    howToPerform: [
      'Hinge at hips, lowering upper body down comfortably.',
      'Contract lower back, glutes, and hamstrings to hinge back up.',
      'Bring body in line with legs; do not hyperextend at peak.'
    ],
    coachingTip: 'Squeeze glutes at top is key. Avoid folding past normal body extension.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'hip-thrust',
    name: 'Barbell Hip Thrust',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    poseIcon: 'hip-thrust',
    whatItTrains: 'Unmatched isolative glute strength and contraction, highly useful for speed and posture.',
    setup: [
      'Sit on floor with upper back against horizontal bench.',
      'Roll padded barbell over thighs up to hip crease.',
      'Bend knees at 90°, feet shoulder-width flat on ground.'
    ],
    howToPerform: [
      'Drive torso upward by pushing through heels, lifting barbell.',
      'Lock hips out horizontally, squeezing glutes heavily.',
      'Lower bar with control, keeping spine straight (neutral head, chin tucked).'
    ],
    coachingTip: 'Keep head looking forward throughout lift to protect lower back from hyperextension.',
    defaultSets: 4,
    defaultReps: '8-12'
  },
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl Machine',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    poseIcon: 'leg-curl',
    whatItTrains: 'Direct isolation for knee flexion hamstrings, supporting knee tendons.',
    setup: [
      'Lie face down on leg curl table, lining knees up with machine axes.',
      'Adjust roller ankle pad below calf muscles.',
      'Hold handles with hands to anchor hips down.'
    ],
    howToPerform: [
      'Curl heels up toward buttocks as far as comfortable.',
      'Keep hips locked down on table; do not raise butt.',
      'Guide legs slowly back to start.'
    ],
    coachingTip: 'Focus on pulling with hamstrings, and keep ankles relaxed to bypass calf assist.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'plank',
    name: 'Forearm Plank',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'lower-back'],
    poseIcon: 'plank',
    whatItTrains: 'Static isometric core stabilizer, building endurance and trunk strength.',
    setup: [
      'Get down on forearms beneath shoulders, elbows at 90°.',
      'Step feet back, raising hips, forming straight outline.'
    ],
    howToPerform: [
      'Contract abs, glutes, and legs heavily.',
      'Hold position of horizontal spine, staring down at hands.',
      'Breathe normally during static hold.'
    ],
    coachingTip: 'Do not let hips drop or rise. Keep your spine perfectly parallel to floor.',
    defaultSets: 3,
    defaultReps: '60s'
  },
  {
    id: 'crunch',
    name: 'Abdominal Crunch',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    poseIcon: 'crunch',
    whatItTrains: 'Direct upper-abs rectus abdominis crunch builder.',
    setup: [
      'Lie on floor on back, knees bent, feet flat.',
      'Rest hands lightly behind neck or across chest.'
    ],
    howToPerform: [
      'Exhale and curl shoulders up off floor, pressing spine flat.',
      'Hold abs compression at peak for 1 second.',
      'Inhale and slowly roll shoulders back down.'
    ],
    coachingTip: 'Do not pull neck with hands. Lift upper back strictly with abs power.',
    defaultSets: 3,
    defaultReps: '15-20'
  },
  {
    id: 'sit-up',
    name: 'Full Sit-Up',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['quads'], // hip flexors
    poseIcon: 'sit-up',
    whatItTrains: 'Dynamic abdominal flexor, engaging abs and hip stabilizers.',
    setup: [
      'Lie on back with knees bent, heels flat.',
      'Fold hands lightly across chest or beside templates.'
    ],
    howToPerform: [
      'Peel upper torso completely off floor into sit-up position.',
      'Bring chest near knees, keeping feet planted.',
      'Unfurl spine slowly, rolling back down vertebra by vertebra.'
    ],
    coachingTip: 'Control the lower half on descent; do not crash pad flat on floor.',
    defaultSets: 3,
    defaultReps: '15-20'
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climbers',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['front-delts', 'quads'],
    poseIcon: 'mountain-climber',
    whatItTrains: 'High-pace dynamic abdominal stabilization with cardiovascular fat burners.',
    setup: [
      'Push-up position, arms vertical, palms flat, straight spine.'
    ],
    howToPerform: [
      'Drive right knee forward to chest rapidly, toes off floor.',
      'Retract right leg and simultaneously drive left knee forward.',
      'Alternate back and forth at a high, smooth pace.'
    ],
    coachingTip: 'Keep hips low and do not let them bounce high into air during running.',
    defaultSets: 3,
    defaultReps: '45s'
  },
  {
    id: 'bike',
    name: 'Stationary Bike Cardio',
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['calves', 'hamstrings'],
    poseIcon: 'bike',
    whatItTrains: 'Low-impact cardiovascular output and leg stamina.',
    setup: [
      'Set saddle height so leg has slight bend at bottom of stroke.',
      'Strap feet on pedals, grip handlebars, select resistance.'
    ],
    howToPerform: [
      'Pedal smoothly, keeping a cadance of 80-90 RPM.',
      'Engage quads to push down and calves to sweep.',
      'Keep posture upright or lightly folded forward.'
    ],
    coachingTip: 'Keep a steady, rhythmic breathing rate to burn clean energy.',
    defaultSets: 1,
    defaultReps: '15-20 min'
  },
  {
    id: 'run',
    name: 'Outdoor Running',
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads', 'calves', 'hamstrings'],
    secondaryMuscles: ['glutes'],
    poseIcon: 'run',
    whatItTrains: 'Classic aerobic conditioning and global stamina.',
    setup: [
      'Athletic footwear, lightweight clothing.',
      'Loosen shoulders, hold arms bent.'
    ],
    howToPerform: [
      'Run forward with midfoot strike, avoiding landing on heels.',
      'Breathe deeply in sync with stride.',
      'Drive knees forward with upright posture.'
    ],
    coachingTip: 'Maintain a tall, slightly forward-tilted posture from ankles, not waist.',
    defaultSets: 1,
    defaultReps: '20-30 min'
  }
];
