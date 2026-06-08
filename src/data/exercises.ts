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
    primaryMuscles: ['side-delts'],
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
    category: 'back',
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
    category: 'back',
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
    // exception: endurance equipment lives under cardio even when the primary limiter is leg musculature.
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
    // exception: endurance running lives under cardio even though the first primary muscles are legs.
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
  },
  {
    id: 'walk',
    name: 'Brisk Walking',
    // exception: aerobic walking lives under cardio even though the first primary muscles are legs.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads', 'calves'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    poseIcon: 'walk',
    whatItTrains: 'Low-impact aerobic conditioning, joint-friendly base cardio.',
    setup: [
      'Comfortable shoes, neutral posture.',
      'Hands relaxed, slight bend at the elbows.'
    ],
    howToPerform: [
      'Walk at a pace that elevates breathing but still allows conversation.',
      'Strike with heel and roll through to toe.',
      'Drive lightly off the back foot to lengthen stride.'
    ],
    coachingTip: 'Keep eyes forward and shoulders back to maintain easy breathing rhythm.',
    defaultSets: 1,
    defaultReps: '20-45 min'
  },
  {
    id: 'treadmill',
    name: 'Treadmill Run',
    // exception: treadmill work is categorized by conditioning goal, not first leg muscle.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads', 'hamstrings', 'calves'],
    secondaryMuscles: ['glutes'],
    poseIcon: 'treadmill',
    whatItTrains: 'Indoor steady-state or interval cardio with controlled pace and incline.',
    setup: [
      'Set the belt to walking pace, step on, then dial up to running pace.',
      'Use light incline (1-2%) to mimic outdoor effort.',
      'Hands off the rails once at speed.'
    ],
    howToPerform: [
      'Land mid-foot under your hips, not in front.',
      'Lock cadence at 170-180 steps per minute for efficiency.',
      'Breathe in for 2 strides, out for 2 strides.'
    ],
    coachingTip: 'If you have to hold the rails, the speed is too high — drop it down.',
    defaultSets: 1,
    defaultReps: '20-30 min'
  },
  {
    id: 'elliptical',
    name: 'Elliptical Trainer',
    // exception: machine endurance work lives under cardio despite leg-led muscle loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads', 'hamstrings'],
    secondaryMuscles: ['glutes', 'calves'],
    poseIcon: 'elliptical',
    whatItTrains: 'Zero-impact full-body cardio engaging both upper and lower body.',
    setup: [
      'Step on pedals, grip moving handles.',
      'Pick a resistance level that lets you sustain a steady pace.'
    ],
    howToPerform: [
      'Push and pull the handles in sync with each leg drive.',
      'Press down through the heel on each stride.',
      'Keep torso upright, core gently braced.'
    ],
    coachingTip: 'Drive through the legs first; let the arms follow rather than yanking the handles.',
    defaultSets: 1,
    defaultReps: '20-30 min'
  },
  {
    id: 'rowing-machine',
    name: 'Rowing Machine',
    // exception: rowing is full-body conditioning, so it lives under cardio despite a back-led primary list.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['lats', 'quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'lower-back', 'biceps'],
    poseIcon: 'rowing-machine',
    whatItTrains: 'Full-body posterior-chain cardio: legs drive, back hinges, arms finish.',
    setup: [
      'Strap feet in, grip the handle overhand, arms straight.',
      'Slide forward, shins vertical, chest up.'
    ],
    howToPerform: [
      'Drive with the legs first until they are nearly straight.',
      'Hinge the torso back about 10°.',
      'Pull the handle to just below the sternum.',
      'Return in reverse: arms extend, torso forward, legs bend.'
    ],
    coachingTip: 'Power split: roughly 60% legs, 30% back, 10% arms — never lead with the arms.',
    defaultSets: 1,
    defaultReps: '15-25 min'
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    // exception: interval conditioning, categorized as cardio despite calf-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['calves'],
    secondaryMuscles: ['quads', 'forearms'],
    poseIcon: 'jump-rope',
    whatItTrains: 'High-intensity conditioning, calf endurance, ankle stiffness, and coordination.',
    setup: [
      'Rope length: handles at armpit height when standing on the middle of it.',
      'Elbows tucked in by the ribs, wrists do the work.'
    ],
    howToPerform: [
      'Spin the rope with the wrists, not the shoulders.',
      'Land softly on the balls of the feet, knees just barely bent.',
      'Stay tall — minimal hop height, just enough to clear the rope.'
    ],
    coachingTip: 'If you are hopping high, your shoulders are doing the spin — relax them and let the wrists drive.',
    defaultSets: 3,
    defaultReps: '60-90 sec'
  },
  {
    id: 'burpee',
    name: 'Burpee',
    // exception: full-body conditioning movement, so it lives under cardio despite a chest-led primary list.
    category: 'cardio',
    equipment: 'bodyweight',
    primaryMuscles: ['chest', 'quads'],
    secondaryMuscles: ['front-delts', 'abs', 'glutes', 'calves'],
    poseIcon: 'burpee',
    whatItTrains: 'Explosive full-body conditioning combining a squat, plank, push-up, and jump.',
    setup: [
      'Stand tall with feet shoulder-width.',
      'Clear about a body-length of floor space in front of you.'
    ],
    howToPerform: [
      'Squat down and place hands on the floor.',
      'Jump feet back to a plank.',
      'Perform a push-up (optional but encouraged).',
      'Jump feet forward under the hips.',
      'Explode up into a vertical jump with arms overhead.'
    ],
    coachingTip: 'Keep the plank position rigid — no sagging hips when you snap back.',
    defaultSets: 4,
    defaultReps: '8-12'
  },
  {
    id: 'box-jump',
    name: 'Box Jump',
    category: 'legs',
    equipment: 'bodyweight',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    poseIcon: 'box-jump',
    whatItTrains: 'Lower-body power, rate of force development, and landing mechanics.',
    setup: [
      'Place a sturdy box or platform at a height you can land softly on (start low).',
      'Stand a half-step back from the box, feet shoulder-width.'
    ],
    howToPerform: [
      'Dip down into a quarter squat with arms swinging back.',
      'Swing the arms forward and explode upward.',
      'Land on the box softly with both feet, knees tracking over toes.',
      'Stand fully tall on top, then step (do not jump) back down.'
    ],
    coachingTip: 'Step down, never jump down — landing impulse from a high box is brutal on the knees.',
    defaultSets: 4,
    defaultReps: '5-8'
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    category: 'legs',
    equipment: 'kettlebell',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['lower-back', 'lats', 'forearms', 'abs'],
    poseIcon: 'kettlebell-swing',
    whatItTrains: 'Hip-hinge power, posterior chain explosiveness, and grip endurance.',
    setup: [
      'Kettlebell on the floor about a foot in front of your toes.',
      'Hinge to grip the handle with both hands, neutral spine.'
    ],
    howToPerform: [
      'Hike the bell back between your legs like a football snap.',
      'Drive hips forward explosively to swing the bell to chest height.',
      'Let the bell fall on its own arc, hinge to receive it.',
      'Repeat without rounding the lower back.'
    ],
    coachingTip: 'The arms are ropes — power comes from the hip snap, not from lifting with the shoulders.',
    defaultSets: 4,
    defaultReps: '12-15'
  },
  {
    id: 'carry',
    name: 'Farmer\'s Carry',
    // exception: kept as core because the training goal is anti-lateral-flexion trunk stability.
    category: 'core',
    equipment: 'dumbbell',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['forearms', 'traps', 'glutes', 'quads'],
    poseIcon: 'carry',
    whatItTrains: 'Total-body stability, grip strength, trap density, and anti-lateral-flexion core.',
    setup: [
      'Pick a heavy dumbbell or kettlebell for each hand.',
      'Stand tall, shoulders packed down and back, arms straight.'
    ],
    howToPerform: [
      'Walk in a straight line with smooth, controlled steps.',
      'Keep ribs stacked over hips — do not lean to either side.',
      'Breathe in a 3-step-in, 3-step-out rhythm.',
      'Set the weights down with control at the end.'
    ],
    coachingTip: 'If your shoulders shrug toward your ears or your back arches, the load is too heavy — drop down.',
    defaultSets: 3,
    defaultReps: '30-40 sec'
  },
  {
    id: 'stretch',
    name: 'Full-Body Stretch',
    // exception: low-intensity recovery/conditioning, mapped to cardio because the fixed palette has no mobility category.
    category: 'cardio',
    equipment: 'bodyweight',
    primaryMuscles: ['lower-back', 'hamstrings'],
    secondaryMuscles: ['glutes', 'calves', 'lats'],
    poseIcon: 'stretch',
    whatItTrains: 'Mobility, recovery, and injury prevention — a low-intensity cool-down session.',
    setup: [
      'Find a clear floor space, ideally on a yoga mat.',
      'Breathe slowly and deeply throughout.'
    ],
    howToPerform: [
      'Cycle through static stretches: hamstrings, hip flexors, quads, glutes, lats, chest.',
      'Hold each position 30 seconds; no bouncing.',
      'Sink slightly deeper on each exhale.'
    ],
    coachingTip: 'Mild tension is fine; sharp pain is a stop signal — never stretch into pain.',
    defaultSets: 1,
    defaultReps: '8-12 min'
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    category: 'chest',
    equipment: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts', 'triceps'],
    poseIcon: 'incline-bench-press',
    whatItTrains: 'Upper-chest pressing strength with extra front-delt and triceps support.',
    setup: ['Set the bench to a moderate incline.', 'Grip the bar slightly wider than shoulder width.', 'Pin shoulder blades down and keep feet planted.'],
    howToPerform: ['Unrack over the upper chest.', 'Lower to the upper chest with elbows under wrists.', 'Press up and slightly back to the rack line.'],
    coachingTip: 'Keep the incline moderate so the lift stays chest-led rather than becoming a shoulder press.',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    category: 'chest',
    equipment: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'front-delts'],
    poseIcon: 'decline-bench-press',
    whatItTrains: 'Lower-chest biased pressing with heavy triceps involvement.',
    setup: ['Secure feet under the decline bench pads.', 'Set eyes under the bar and grip just outside shoulders.', 'Brace ribs down before unracking.'],
    howToPerform: ['Unrack and hold the bar above the lower chest.', 'Lower with control to the lower sternum.', 'Press back up without bouncing.'],
    coachingTip: 'Use a spotter or safety arms because the decline path is harder to escape from.',
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    equipment: 'dumbbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts', 'triceps'],
    poseIcon: 'incline-dumbbell-press',
    whatItTrains: 'Upper-chest hypertrophy with independent arm control.',
    setup: ['Set a bench to a low or moderate incline.', 'Kick dumbbells to shoulder height.', 'Brace feet and keep shoulder blades pinned.'],
    howToPerform: ['Press dumbbells upward over the upper chest.', 'Lower until elbows are slightly below torso level.', 'Drive up while keeping wrists stacked.'],
    coachingTip: 'Stop the descent where shoulder stretch is strong but controlled.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    category: 'chest',
    equipment: 'dumbbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'front-delts'],
    poseIcon: 'dumbbell-bench-press',
    whatItTrains: 'Flat chest pressing with a deeper range of motion than the barbell.',
    setup: ['Sit with dumbbells on thighs.', 'Lie back and bring dumbbells beside the chest.', 'Set shoulder blades and plant feet firmly.'],
    howToPerform: ['Press dumbbells up until arms are nearly straight.', 'Lower in a controlled arc to chest level.', 'Keep elbows about 45 degrees from the torso.'],
    coachingTip: 'Do not clank the dumbbells together; keep tension on the chest at the top.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    category: 'chest',
    equipment: 'machine',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'front-delts'],
    poseIcon: 'machine-chest-press',
    whatItTrains: 'Stable chest pressing for controlled volume and safer near-failure sets.',
    setup: ['Adjust seat so handles sit at mid-chest.', 'Sit tall with back against the pad.', 'Grip handles with wrists straight.'],
    howToPerform: ['Press handles forward until arms nearly lock.', 'Pause briefly while chest stays tight.', 'Return slowly until chest is stretched.'],
    coachingTip: 'Keep shoulders down instead of letting them roll forward at the end range.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    category: 'chest',
    equipment: 'cable',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts'],
    poseIcon: 'cable-crossover',
    whatItTrains: 'Cable fly pattern that keeps constant tension through the chest.',
    setup: ['Set both pulleys slightly above shoulder height.', 'Step forward into a staggered stance.', 'Keep elbows softly bent and palms facing inward.'],
    howToPerform: ['Sweep handles together in front of the chest.', 'Cross hands slightly without shrugging.', 'Return slowly until the chest stretches.'],
    coachingTip: 'Move from the shoulder joint; do not turn it into a press.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck',
    category: 'chest',
    equipment: 'machine',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts'],
    poseIcon: 'pec-deck',
    whatItTrains: 'Chest isolation with a fixed arc and strong peak contraction.',
    setup: ['Set seat height so elbows line up with chest.', 'Place forearms or hands on the pads.', 'Keep back flat against the support.'],
    howToPerform: ['Bring pads together in front of the chest.', 'Squeeze briefly at the middle.', 'Open under control until chest stretches.'],
    coachingTip: 'Keep ribs down so the chest does the work instead of the lower back arching.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'svend-press',
    name: 'Svend Press',
    category: 'chest',
    equipment: 'dumbbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front-delts', 'triceps'],
    poseIcon: 'svend-press',
    whatItTrains: 'Chest squeeze strength using constant inward pressure through the hands.',
    setup: ['Hold a light plate or dumbbell vertically at chest height.', 'Press palms inward hard.', 'Stand tall with abs braced.'],
    howToPerform: ['Press the load straight forward while squeezing inward.', 'Pause at full reach.', 'Pull it back to the chest without losing pressure.'],
    coachingTip: 'Use light load and make the squeeze the hard part.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'lat-pulldown-close-grip',
    name: 'Close-Grip Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'forearms', 'traps'],
    poseIcon: 'lat-pulldown-close-grip',
    whatItTrains: 'Lat width with a closer grip that also loads the biceps strongly.',
    setup: ['Attach a close neutral or V handle.', 'Lock thighs under the pad.', 'Sit tall with arms fully stretched overhead.'],
    howToPerform: ['Drive elbows down toward the ribs.', 'Pull the handle to upper chest height.', 'Return slowly to a full lat stretch.'],
    coachingTip: 'Lean back only slightly; the elbows should travel down, not behind you.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    category: 'back',
    equipment: 'cable',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['traps', 'biceps', 'forearms'],
    poseIcon: 'seated-cable-row',
    whatItTrains: 'Mid-back thickness and lat control through a seated row path.',
    setup: ['Place feet on the platform with knees slightly bent.', 'Grip the handle and sit tall.', 'Start with shoulders stretched forward but spine neutral.'],
    howToPerform: ['Pull elbows back toward the hips.', 'Squeeze shoulder blades without leaning far back.', 'Return until arms are straight and lats stretch.'],
    coachingTip: 'Let the shoulders move, but do not let the lower back round.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['lats', 'traps'],
    secondaryMuscles: ['lower-back', 'biceps', 'forearms'],
    poseIcon: 't-bar-row',
    whatItTrains: 'Heavy row variation for dense lats and mid-back.',
    setup: ['Load one end of a landmine or T-bar station.', 'Hinge over the handle with a flat back.', 'Brace abs and keep feet planted.'],
    howToPerform: ['Pull the handle toward the lower chest.', 'Pause with elbows behind the torso.', 'Lower until arms are long without losing spine position.'],
    coachingTip: 'Keep the torso angle fixed so the row does not become a hip drive.',
    defaultSets: 4,
    defaultReps: '6-10'
  },
  {
    id: 'single-arm-dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    category: 'back',
    equipment: 'dumbbell',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'traps', 'forearms'],
    poseIcon: 'single-arm-dumbbell-row',
    whatItTrains: 'Unilateral lat and mid-back strength with core anti-rotation.',
    setup: ['Support one hand and knee on a bench.', 'Hold a dumbbell under the shoulder.', 'Keep hips square to the floor.'],
    howToPerform: ['Row the dumbbell toward the hip.', 'Squeeze the lat at the top.', 'Lower until the shoulder stretches down.'],
    coachingTip: 'Think elbow to back pocket rather than hand to ribs.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'chin-up',
    name: 'Chin-Up',
    category: 'back',
    equipment: 'bodyweight',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'forearms'],
    poseIcon: 'chin-up',
    whatItTrains: 'Supinated vertical pull for lats and biceps.',
    setup: ['Grip the bar underhand about shoulder width.', 'Hang with elbows straight and abs tight.', 'Pull shoulders down before starting.'],
    howToPerform: ['Pull chest toward the bar.', 'Keep ribs down and avoid kicking.', 'Lower under control to a full hang.'],
    coachingTip: 'Use the biceps, but initiate every rep by setting the shoulder blades down.',
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    id: 'inverted-row',
    name: 'Inverted Row',
    category: 'back',
    equipment: 'bodyweight',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['traps', 'biceps', 'forearms'],
    poseIcon: 'inverted-row',
    whatItTrains: 'Bodyweight horizontal pulling for upper-back strength and posture.',
    setup: ['Set a bar at waist height.', 'Lie under it and grip slightly wider than shoulders.', 'Keep body straight from heels to head.'],
    howToPerform: ['Pull chest to the bar.', 'Squeeze shoulder blades at the top.', 'Lower until arms fully extend.'],
    coachingTip: 'Walk feet farther forward to make the movement harder.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Straight-Arm Pulldown',
    category: 'back',
    equipment: 'cable',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['triceps', 'abs'],
    poseIcon: 'straight-arm-pulldown',
    whatItTrains: 'Lat isolation through shoulder extension without much elbow bend.',
    setup: ['Set a straight bar high on a cable stack.', 'Stand back with arms straight and torso slightly hinged.', 'Brace abs and soften knees.'],
    howToPerform: ['Pull the bar down toward thighs with straight arms.', 'Squeeze lats at the bottom.', 'Return slowly overhead to stretch.'],
    coachingTip: 'Keep elbows nearly fixed so the triceps do not take over.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'machine-row',
    name: 'Machine Row',
    category: 'back',
    equipment: 'machine',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['traps', 'biceps', 'forearms'],
    poseIcon: 'machine-row',
    whatItTrains: 'Supported row pattern for controlled back volume.',
    setup: ['Adjust chest pad so handles align with lower ribs.', 'Sit tall and brace into the pad.', 'Grip handles without shrugging.'],
    howToPerform: ['Drive elbows back and down.', 'Pause when shoulder blades squeeze together.', 'Return smoothly until arms extend.'],
    coachingTip: 'Let the machine support the torso; do not turn the rep into a body swing.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'dumbbell-pullover',
    name: 'Dumbbell Pullover',
    category: 'back',
    equipment: 'dumbbell',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['chest', 'triceps'],
    poseIcon: 'pullover',
    whatItTrains: 'Lat stretch and shoulder extension with some chest contribution.',
    setup: ['Lie across or along a bench with one dumbbell held over the chest.', 'Keep elbows softly bent.', 'Brace ribs down.'],
    howToPerform: ['Lower the dumbbell behind the head in an arc.', 'Stop when lats stretch strongly.', 'Pull the dumbbell back over the chest.'],
    coachingTip: 'Do not flare the ribs to fake extra range.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'rack-pull',
    name: 'Rack Pull',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['lower-back'],
    secondaryMuscles: ['glutes', 'hamstrings', 'traps', 'forearms'],
    poseIcon: 'rack-pull',
    whatItTrains: 'Heavy lockout hinge strength for spinal erectors, traps, and posterior chain.',
    setup: ['Set the bar on pins just below knee height.', 'Stand with shins close and grip outside the legs.', 'Brace hard before pulling.'],
    howToPerform: ['Pull the bar up by extending hips.', 'Stand tall with shoulders back.', 'Lower to the pins with control.'],
    coachingTip: 'Keep lats tight so the bar stays close to the body.',
    defaultSets: 3,
    defaultReps: '5-8'
  },
  {
    id: 'good-morning',
    name: 'Good Morning',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['lower-back'],
    secondaryMuscles: ['hamstrings', 'glutes'],
    poseIcon: 'good-morning',
    whatItTrains: 'Controlled hip hinge that builds lower-back and hamstring strength.',
    setup: ['Place a light bar across the upper back.', 'Stand hip-width with knees softly bent.', 'Brace abs before hinging.'],
    howToPerform: ['Push hips back while torso folds forward.', 'Stop when hamstrings are stretched and spine stays neutral.', 'Drive hips forward to stand tall.'],
    coachingTip: 'Start light; this exercise rewards control more than load.',
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['side-delts', 'triceps'],
    poseIcon: 'arnold-press',
    whatItTrains: 'Rotating dumbbell press that trains front and side delts through a long range.',
    setup: ['Hold dumbbells in front of shoulders with palms facing you.', 'Sit or stand tall with abs braced.', 'Keep elbows slightly forward.'],
    howToPerform: ['Rotate palms outward while pressing overhead.', 'Lock out with biceps near ears.', 'Reverse the rotation back to the start.'],
    coachingTip: 'Use smooth rotation; do not rush through the shoulder transition.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['side-delts', 'triceps'],
    poseIcon: 'dumbbell-shoulder-press',
    whatItTrains: 'Vertical dumbbell pressing for shoulder mass and overhead strength.',
    setup: ['Bring dumbbells to shoulder height.', 'Brace torso and keep wrists stacked.', 'Set elbows slightly in front of the body.'],
    howToPerform: ['Press dumbbells overhead.', 'Stop with arms tall but not aggressively locked.', 'Lower to shoulder height under control.'],
    coachingTip: 'Avoid leaning back; make the shoulders move the weight.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'machine-shoulder-press',
    name: 'Machine Shoulder Press',
    category: 'shoulders',
    equipment: 'machine',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['side-delts', 'triceps'],
    poseIcon: 'machine-shoulder-press',
    whatItTrains: 'Stable overhead pressing for shoulder volume.',
    setup: ['Adjust seat so handles start near shoulder height.', 'Keep back on the pad.', 'Grip handles with wrists neutral.'],
    howToPerform: ['Press handles overhead.', 'Pause briefly near lockout.', 'Lower until elbows reach a comfortable depth.'],
    coachingTip: 'Keep shoulders down and avoid shrugging into the pads.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'front-raise',
    name: 'Dumbbell Front Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['traps'],
    poseIcon: 'front-raise',
    whatItTrains: 'Front-delt isolation for shoulder flexion strength.',
    setup: ['Stand holding dumbbells in front of thighs.', 'Brace abs and keep elbows softly bent.', 'Set shoulders down.'],
    howToPerform: ['Raise dumbbells forward to shoulder height.', 'Pause without leaning back.', 'Lower slowly to the thighs.'],
    coachingTip: 'Lift only to shoulder height to keep tension on the delts.',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['rear-delts'],
    secondaryMuscles: ['traps'],
    poseIcon: 'rear-delt-fly',
    whatItTrains: 'Rear-shoulder isolation for posture and balanced delts.',
    setup: ['Hinge forward with dumbbells hanging under shoulders.', 'Keep spine neutral and knees soft.', 'Turn palms slightly inward.'],
    howToPerform: ['Raise arms out wide until elbows reach shoulder height.', 'Squeeze rear delts at the top.', 'Lower slowly without swinging.'],
    coachingTip: 'Lead with elbows and keep traps from shrugging up.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    category: 'shoulders',
    equipment: 'cable',
    primaryMuscles: ['side-delts'],
    secondaryMuscles: ['traps'],
    poseIcon: 'lateral-raise',
    whatItTrains: 'Side-delt isolation with constant cable tension.',
    setup: ['Set a low pulley with a single handle.', 'Stand side-on to the stack.', 'Hold the handle across the body.'],
    howToPerform: ['Raise the arm out to the side.', 'Stop around shoulder height.', 'Lower slowly across the body.'],
    coachingTip: 'Keep the wrist relaxed and let the elbow lead the motion.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    category: 'shoulders',
    equipment: 'barbell',
    primaryMuscles: ['side-delts'],
    secondaryMuscles: ['traps', 'biceps'],
    poseIcon: 'upright-row',
    whatItTrains: 'Side delts and traps through an upward pulling pattern.',
    setup: ['Hold a barbell in front of thighs.', 'Use a shoulder-width grip.', 'Stand tall with abs braced.'],
    howToPerform: ['Pull elbows upward and outward.', 'Stop when elbows reach shoulder height.', 'Lower under control to the thighs.'],
    coachingTip: 'Do not pull higher than shoulder height if it irritates your shoulders.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'landmine-press',
    name: 'Landmine Press',
    category: 'shoulders',
    equipment: 'barbell',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['chest', 'triceps', 'abs'],
    poseIcon: 'barbell-press',
    whatItTrains: 'Angled pressing strength for shoulders with a shoulder-friendly bar path.',
    setup: ['Set one barbell end in a landmine or corner.', 'Hold the sleeve at shoulder height.', 'Stand staggered or half-kneeling.'],
    howToPerform: ['Press the bar up and forward.', 'Reach fully without shrugging.', 'Lower back to the shoulder with control.'],
    coachingTip: 'Keep ribs down so the press does not become a back bend.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'barbell-curl',
    whatItTrains: 'Heavy bilateral biceps loading with a strict curl pattern.',
    setup: ['Stand holding a barbell with palms up.', 'Keep elbows beside the ribs.', 'Brace abs and glutes.'],
    howToPerform: ['Curl the bar toward the shoulders.', 'Squeeze biceps at the top.', 'Lower to full elbow extension.'],
    coachingTip: 'Keep elbows pinned; do not turn the rep into a hip swing.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'ez-bar-curl',
    name: 'EZ-Bar Curl',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'ez-bar-curl',
    whatItTrains: 'Biceps curl variation with a wrist-friendly angled grip.',
    setup: ['Grip the EZ bar on the angled handles.', 'Stand tall with elbows tucked.', 'Keep wrists neutral.'],
    howToPerform: ['Curl the bar up without moving the upper arms.', 'Pause near the shoulders.', 'Lower slowly to a full stretch.'],
    coachingTip: 'Use the angled grip to keep wrists comfortable, not to cheat heavier reps.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'hammer-curl',
    whatItTrains: 'Neutral-grip curl for biceps, brachialis, and forearm thickness.',
    setup: ['Hold dumbbells at sides with palms facing inward.', 'Stand tall and brace.', 'Keep elbows close to the body.'],
    howToPerform: ['Curl dumbbells up while palms stay neutral.', 'Pause at the top.', 'Lower under control to full extension.'],
    coachingTip: 'Avoid rotating the wrist; the neutral grip is the point.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'preacher-curl',
    whatItTrains: 'Strict biceps isolation with upper arms fixed against a pad.',
    setup: ['Set the preacher bench so armpits meet the pad top.', 'Grip an EZ bar or straight bar.', 'Start with elbows slightly bent.'],
    howToPerform: ['Curl the bar up while upper arms stay on the pad.', 'Squeeze briefly near the top.', 'Lower slowly without locking elbows hard.'],
    coachingTip: 'Control the bottom range; do not bounce out of the stretched position.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'concentration-curl',
    whatItTrains: 'Single-arm biceps isolation with strict elbow support.',
    setup: ['Sit and brace the working elbow against the inner thigh.', 'Let the dumbbell hang with palm facing out.', 'Keep torso still.'],
    howToPerform: ['Curl the dumbbell toward the shoulder.', 'Squeeze hard at the top.', 'Lower slowly to a full stretch.'],
    coachingTip: 'Do not twist the torso to help the dumbbell up.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    category: 'arms',
    equipment: 'cable',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'cable-curl',
    whatItTrains: 'Biceps curl with constant cable tension from bottom to top.',
    setup: ['Attach a straight or EZ bar to a low pulley.', 'Stand close enough to keep cable vertical.', 'Pin elbows by the sides.'],
    howToPerform: ['Curl the handle up to chest height.', 'Pause without shoulders rolling forward.', 'Lower until elbows extend fully.'],
    coachingTip: 'Keep the cable path smooth and resist the stack on the way down.',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'reverse-curl',
    name: 'Reverse Curl',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['forearms'],
    secondaryMuscles: ['biceps'],
    poseIcon: 'reverse-curl',
    whatItTrains: 'Forearm extensor and brachialis strength using a palms-down curl.',
    setup: ['Hold a barbell with palms facing down.', 'Stand tall with elbows at the ribs.', 'Use a lighter load than standard curls.'],
    howToPerform: ['Curl the bar up while wrists stay straight.', 'Pause near the top.', 'Lower slowly to full extension.'],
    coachingTip: 'If wrists bend back, reduce the load immediately.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    category: 'arms',
    equipment: 'cable',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'tricep-pushdown',
    whatItTrains: 'Cable triceps isolation through elbow extension.',
    setup: ['Set a cable pulley high with rope or bar attachment.', 'Stand close to the stack.', 'Pin elbows to the sides.'],
    howToPerform: ['Push the handle down until elbows straighten.', 'Spread the rope or squeeze the bar at the bottom.', 'Return until forearms rise without elbows drifting.'],
    coachingTip: 'Only the forearms should move; keep shoulders quiet.',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'skull-crusher',
    whatItTrains: 'Lying triceps extension for long-head and elbow extension strength.',
    setup: ['Lie on a bench holding an EZ bar over shoulders.', 'Keep elbows pointed upward.', 'Brace wrists straight.'],
    howToPerform: ['Bend elbows to lower the bar toward the forehead or behind the head.', 'Keep upper arms mostly still.', 'Extend elbows to return to the top.'],
    coachingTip: 'Let the bar travel slightly behind the head if elbows tolerate it; it improves the stretch.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'overhead-cable-extension',
    name: 'Overhead Cable Extension',
    category: 'arms',
    equipment: 'cable',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'overhead-cable-extension',
    whatItTrains: 'Overhead cable triceps work with a deep long-head stretch.',
    setup: ['Attach a rope to a low or high cable.', 'Face away and bring rope behind the head.', 'Stagger stance and brace.'],
    howToPerform: ['Extend elbows forward or upward.', 'Squeeze triceps at lockout.', 'Return until triceps stretch behind the head.'],
    coachingTip: 'Keep elbows narrow so the long head stays loaded.',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'tricep-kickback',
    name: 'Tricep Kickback',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    poseIcon: 'tricep-kickback',
    whatItTrains: 'Light triceps isolation with a hard peak contraction.',
    setup: ['Hinge forward with one or two dumbbells.', 'Pin upper arms beside the torso.', 'Keep spine neutral.'],
    howToPerform: ['Extend elbows until arms are straight behind you.', 'Pause and squeeze triceps.', 'Bend elbows back to about 90 degrees.'],
    coachingTip: 'Use a light load; swinging defeats the purpose.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'wrist-curl',
    name: 'Wrist Curl',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    poseIcon: 'wrist-curl',
    whatItTrains: 'Forearm flexor strength and grip support.',
    setup: ['Sit with forearms supported on thighs or a bench.', 'Hold dumbbells palms up.', 'Let wrists extend comfortably.'],
    howToPerform: ['Curl wrists upward without moving forearms.', 'Squeeze briefly at the top.', 'Lower to a controlled stretch.'],
    coachingTip: 'Move slowly; small wrist ranges get irritated by bouncing.',
    defaultSets: 3,
    defaultReps: '12-20'
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'abs', 'lower-back'],
    poseIcon: 'front-squat',
    whatItTrains: 'Quad-dominant squat pattern with strong upright trunk demand.',
    setup: ['Rack the bar across front shoulders.', 'Use a clean grip or crossed-arm grip.', 'Stand tall with elbows high.'],
    howToPerform: ['Descend by bending knees and hips together.', 'Keep elbows high and torso upright.', 'Drive through mid-foot to stand.'],
    coachingTip: 'If elbows drop, the upper back is losing position.',
    defaultSets: 4,
    defaultReps: '5-8'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
    poseIcon: 'leg-press',
    whatItTrains: 'Heavy lower-body pressing with back support.',
    setup: ['Sit with back flat against the pad.', 'Place feet shoulder-width on the platform.', 'Unlock the safeties with knees soft.'],
    howToPerform: ['Lower platform until knees bend deeply without hips lifting.', 'Press through mid-foot to extend legs.', 'Stop before hard knee lockout.'],
    coachingTip: 'Keep hips glued to the pad to protect the lower back.',
    defaultSets: 4,
    defaultReps: '10-12'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['glutes', 'lower-back', 'forearms'],
    poseIcon: 'romanian-deadlift',
    whatItTrains: 'Hamstring and glute hinge strength through a controlled stretch.',
    setup: ['Stand holding a barbell at thigh height.', 'Keep knees slightly bent.', 'Brace abs and pull shoulders down.'],
    howToPerform: ['Push hips back while bar slides down the thighs.', 'Stop when hamstrings stretch strongly.', 'Drive hips forward to stand tall.'],
    coachingTip: 'The bar should stay close enough to brush your legs.',
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    id: 'sumo-deadlift',
    name: 'Sumo Deadlift',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'quads', 'lower-back', 'forearms'],
    poseIcon: 'sumo-deadlift',
    whatItTrains: 'Wide-stance pull emphasizing glutes, hips, and inner-thigh drive.',
    setup: ['Stand wide with toes turned out.', 'Grip the bar inside the legs.', 'Drop hips until chest is tall and shins touch the bar.'],
    howToPerform: ['Push the floor apart and stand up with the bar.', 'Lock hips through at the top.', 'Lower the bar close to the body.'],
    coachingTip: 'Keep knees tracking in line with toes from floor to lockout.',
    defaultSets: 4,
    defaultReps: '5'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'legs',
    equipment: 'dumbbell',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
    poseIcon: 'bulgarian-split-squat',
    whatItTrains: 'Single-leg quad and glute strength with high balance demand.',
    setup: ['Place rear foot on a bench behind you.', 'Hold dumbbells at your sides.', 'Set front foot far enough that knee tracks comfortably.'],
    howToPerform: ['Lower until front thigh is near parallel.', 'Keep torso controlled and knee tracking over toes.', 'Drive through the front foot to stand.'],
    coachingTip: 'Use a shorter stance for quads and a longer stance for more glute bias.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'legs',
    equipment: 'kettlebell',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'abs'],
    poseIcon: 'goblet-squat',
    whatItTrains: 'Accessible squat pattern that reinforces upright posture and quad drive.',
    setup: ['Hold a kettlebell or dumbbell at chest height.', 'Stand shoulder-width with toes slightly out.', 'Brace ribs down.'],
    howToPerform: ['Squat down between the knees.', 'Keep the weight close to the chest.', 'Drive up through mid-foot.'],
    coachingTip: 'Use the load as a counterbalance to sit deeper without rounding.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'calves'],
    poseIcon: 'hack-squat',
    whatItTrains: 'Machine-supported squat that heavily targets quads.',
    setup: ['Set shoulders under pads and back against support.', 'Place feet on the platform at a comfortable stance.', 'Unlock safeties with knees soft.'],
    howToPerform: ['Lower until knees bend deeply.', 'Keep back pressed into the pad.', 'Press up without locking knees harshly.'],
    coachingTip: 'Lower under control; the machine can make it tempting to bounce.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'step-up',
    name: 'Dumbbell Step-Up',
    category: 'legs',
    equipment: 'dumbbell',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
    poseIcon: 'step-up',
    whatItTrains: 'Single-leg strength and hip stability through a step pattern.',
    setup: ['Stand facing a sturdy box or bench.', 'Hold dumbbells by your sides.', 'Place one whole foot on the platform.'],
    howToPerform: ['Drive through the elevated foot to stand on the box.', 'Control the top position.', 'Step down slowly with the same leg leading.'],
    coachingTip: 'Avoid pushing hard off the trailing foot; make the top leg do the work.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    poseIcon: 'seated-calf-raise',
    whatItTrains: 'Calf isolation with emphasis on the bent-knee soleus position.',
    setup: ['Sit with balls of feet on the platform.', 'Set thigh pad snugly over the legs.', 'Let heels drop into a stretch.'],
    howToPerform: ['Raise heels as high as possible.', 'Pause at the top.', 'Lower heels slowly below the platform edge.'],
    coachingTip: 'Use a full stretch and pause; calves respond poorly to rushed bouncing.',
    defaultSets: 4,
    defaultReps: '12-20'
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'legs',
    equipment: 'bodyweight',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'abs'],
    poseIcon: 'glute-bridge',
    whatItTrains: 'Glute lockout strength with low setup demand.',
    setup: ['Lie on your back with knees bent.', 'Place feet flat hip-width apart.', 'Brace abs so ribs stay down.'],
    howToPerform: ['Drive hips upward by squeezing glutes.', 'Pause when hips are fully extended.', 'Lower back to the floor under control.'],
    coachingTip: 'Finish with glutes, not a lower-back arch.',
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    id: 'hip-abduction',
    name: 'Hip Abduction Machine',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['glutes'],
    secondaryMuscles: [],
    poseIcon: 'hip-abduction',
    whatItTrains: 'Outer glute strength for hip stability and glute medius development.',
    setup: ['Sit in the abduction machine with pads against outer thighs.', 'Grip handles and sit tall.', 'Set a range that feels comfortable at the hips.'],
    howToPerform: ['Press thighs outward against the pads.', 'Pause at the widest point.', 'Return slowly without letting plates slam.'],
    coachingTip: 'Keep torso still so the hips, not momentum, move the pads.',
    defaultSets: 3,
    defaultReps: '12-20'
  },
  {
    id: 'hip-adduction',
    name: 'Hip Adduction Machine',
    category: 'legs',
    equipment: 'machine',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    poseIcon: 'hip-adduction',
    whatItTrains: 'Inner-thigh and hip control work using a stable machine path.',
    setup: ['Sit with pads against inner thighs.', 'Set the starting width to a comfortable stretch.', 'Hold the handles and brace lightly.'],
    howToPerform: ['Bring thighs together under control.', 'Pause when pads meet or nearly meet.', 'Return slowly to the stretched start.'],
    coachingTip: 'Use smooth reps; aggressive stretching at the start can irritate hips.',
    defaultSets: 3,
    defaultReps: '12-20'
  },
  {
    id: 'pistol-squat',
    name: 'Pistol Squat',
    category: 'legs',
    equipment: 'bodyweight',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves', 'abs'],
    poseIcon: 'pistol-squat',
    whatItTrains: 'Advanced single-leg squat strength, balance, and mobility.',
    setup: ['Stand on one leg with the other leg extended forward.', 'Reach arms forward for balance.', 'Brace abs before descending.'],
    howToPerform: ['Lower into a single-leg squat.', 'Keep the lifted leg off the floor.', 'Drive through the working foot to stand.'],
    coachingTip: 'Use a box or support until the full range is controlled.',
    defaultSets: 3,
    defaultReps: '5-8'
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'forearms'],
    poseIcon: 'hanging-leg-raise',
    whatItTrains: 'Lower-ab and hip-flexion strength while hanging from a bar.',
    setup: ['Hang from a pull-up bar with shoulders active.', 'Keep legs together.', 'Brace abs to prevent swinging.'],
    howToPerform: ['Raise legs toward the bar or to hip height.', 'Pause briefly with abs compressed.', 'Lower slowly without swinging.'],
    coachingTip: 'Start with bent knees if straight legs make you swing.',
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs'],
    poseIcon: 'russian-twist',
    whatItTrains: 'Rotational core endurance and oblique control.',
    setup: ['Sit with knees bent and torso leaned back.', 'Lift feet if you can keep balance.', 'Hold hands together or a light weight.'],
    howToPerform: ['Rotate torso to one side.', 'Return through center and rotate to the other side.', 'Keep abs braced through every rep.'],
    coachingTip: 'Turn the ribs, not just the hands.',
    defaultSets: 3,
    defaultReps: '20-30'
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    category: 'core',
    equipment: 'cable',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques'],
    poseIcon: 'cable-crunch',
    whatItTrains: 'Loaded spinal flexion for direct abdominal strength.',
    setup: ['Attach a rope to a high cable.', 'Kneel facing the stack.', 'Hold rope beside the head with hips fixed.'],
    howToPerform: ['Crunch ribs down toward pelvis.', 'Pause in the compressed position.', 'Return until abs stretch without hips drifting.'],
    coachingTip: 'Keep hips still; folding at the hips turns it into a pulldown.',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques'],
    poseIcon: 'bicycle-crunch',
    whatItTrains: 'Dynamic ab and oblique work with alternating rotation.',
    setup: ['Lie on your back with hands lightly behind head.', 'Lift knees to tabletop.', 'Raise shoulders off the floor.'],
    howToPerform: ['Rotate one elbow toward the opposite knee.', 'Extend the other leg long.', 'Alternate sides smoothly without pulling the neck.'],
    coachingTip: 'Move slowly enough that the abs control the rotation.',
    defaultSets: 3,
    defaultReps: '20-30'
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['lower-back'],
    poseIcon: 'dead-bug',
    whatItTrains: 'Core bracing and limb control while the spine stays neutral.',
    setup: ['Lie on your back with arms up and knees over hips.', 'Press lower back gently toward the floor.', 'Brace before moving.'],
    howToPerform: ['Extend one arm and the opposite leg.', 'Pause without arching the back.', 'Return and alternate sides.'],
    coachingTip: 'If the lower back lifts, shorten the range.',
    defaultSets: 3,
    defaultReps: '45s'
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['lats', 'front-delts'],
    poseIcon: 'ab-wheel-rollout',
    whatItTrains: 'Anti-extension core strength through a long lever rollout.',
    setup: ['Kneel holding the ab wheel under shoulders.', 'Tuck ribs down and squeeze glutes.', 'Start with a short range.'],
    howToPerform: ['Roll forward while keeping hips and ribs aligned.', 'Stop before the lower back arches.', 'Pull back to the start using abs and lats.'],
    coachingTip: 'Own the short range first; full rollouts are earned.',
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs', 'glutes'],
    poseIcon: 'side-plank',
    whatItTrains: 'Side-body bracing and anti-lateral-flexion endurance.',
    setup: ['Lie on one side with elbow under shoulder.', 'Stack feet or stagger them for balance.', 'Brace glutes and abs.'],
    howToPerform: ['Lift hips until body forms a straight line.', 'Hold without rotating forward or back.', 'Lower and repeat on the other side.'],
    coachingTip: 'Keep the top hip stacked directly over the bottom hip.',
    defaultSets: 3,
    defaultReps: '45s'
  },
  {
    id: 'lying-leg-raise',
    name: 'Lying Leg Raise',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['quads'],
    poseIcon: 'lying-leg-raise',
    whatItTrains: 'Lower-ab control with a simple floor setup.',
    setup: ['Lie flat with legs straight.', 'Place hands by sides or under hips.', 'Brace lower back toward the floor.'],
    howToPerform: ['Raise legs until hips flex about 90 degrees.', 'Lower slowly without arching.', 'Stop just before heels touch the floor.'],
    coachingTip: 'Bend knees slightly if your lower back wants to lift.',
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    id: 'flutter-kick',
    name: 'Flutter Kick',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['quads'],
    poseIcon: 'flutter-kick',
    whatItTrains: 'Timed lower-ab endurance with alternating leg movement.',
    setup: ['Lie on your back with legs straight.', 'Brace lower back down.', 'Lift heels slightly off the floor.'],
    howToPerform: ['Alternate small up-and-down kicks.', 'Keep legs long and controlled.', 'Continue for the target time without arching.'],
    coachingTip: 'Smaller kicks are usually harder and cleaner.',
    defaultSets: 3,
    defaultReps: '45s'
  },
  {
    id: 'hollow-hold',
    name: 'Hollow Hold',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['quads'],
    poseIcon: 'hollow-hold',
    whatItTrains: 'Gymnastics-style anti-extension core endurance.',
    setup: ['Lie on your back with arms overhead.', 'Press lower back into the floor.', 'Lift shoulders and legs slightly.'],
    howToPerform: ['Hold the hollow body shape.', 'Keep ribs tucked and legs together.', 'Breathe while maintaining tension.'],
    coachingTip: 'Raise legs higher if the lower back starts to arch.',
    defaultSets: 3,
    defaultReps: '30s'
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press',
    category: 'core',
    equipment: 'cable',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs'],
    poseIcon: 'pallof-press',
    whatItTrains: 'Anti-rotation core strength against cable tension.',
    setup: ['Set a cable at chest height.', 'Stand side-on and hold the handle at the sternum.', 'Step away until the cable pulls sideways.'],
    howToPerform: ['Press the handle straight forward.', 'Hold without rotating.', 'Bring the handle back to the chest and repeat.'],
    coachingTip: 'The goal is resisting rotation, not twisting through it.',
    defaultSets: 3,
    defaultReps: '30s'
  },
  {
    id: 'cable-woodchopper',
    name: 'Cable Woodchopper',
    category: 'core',
    equipment: 'cable',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs'],
    poseIcon: 'cable-woodchopper',
    whatItTrains: 'Loaded diagonal rotation for obliques and trunk control.',
    setup: ['Set a cable high or low depending on the chop angle.', 'Stand side-on with both hands on the handle.', 'Brace hips and abs.'],
    howToPerform: ['Rotate the handle diagonally across the body.', 'Pivot feet as needed while ribs turn.', 'Return slowly to the start.'],
    coachingTip: 'Let the torso rotate, but keep the movement controlled and athletic.',
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    id: 'stair-climber',
    name: 'Stair Climber',
    // exception: endurance machine work lives under cardio despite quad-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'calves', 'hamstrings'],
    poseIcon: 'stair-climber',
    whatItTrains: 'Low-impact climbing cardio with strong leg endurance demand.',
    setup: ['Step onto the stair climber safely.', 'Choose a sustainable step rate.', 'Hold rails lightly only for balance.'],
    howToPerform: ['Step continuously with full-foot contact.', 'Keep torso tall.', 'Maintain the target effort for the planned time.'],
    coachingTip: 'Do not lean your bodyweight into the rails; let the legs work.',
    defaultSets: 1,
    defaultReps: '15-20 min'
  },
  {
    id: 'jumping-jack',
    name: 'Jumping Jack',
    // exception: warm-up/conditioning drill lives under cardio despite calf-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['calves'],
    secondaryMuscles: ['quads', 'side-delts'],
    poseIcon: 'jumping-jack',
    whatItTrains: 'Simple full-body conditioning for warm-ups or intervals.',
    setup: ['Stand tall with feet together and arms at sides.', 'Keep knees soft.', 'Brace lightly before moving.'],
    howToPerform: ['Jump feet out while arms arc overhead.', 'Jump feet back together as arms return.', 'Repeat at a steady rhythm.'],
    coachingTip: 'Land softly on every rep to keep ankles and knees happy.',
    defaultSets: 3,
    defaultReps: '45s'
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    // exception: conditioning drill lives under cardio despite quad-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['calves', 'abs'],
    poseIcon: 'high-knees',
    whatItTrains: 'Fast conditioning drill for cadence, hip flexion, and leg turnover.',
    setup: ['Stand tall with elbows bent.', 'Brace abs and stay light on the toes.', 'Pick a clear spot.'],
    howToPerform: ['Drive one knee up toward hip height.', 'Switch quickly to the other knee.', 'Keep rhythm fast and posture tall.'],
    coachingTip: 'Move the feet fast without leaning backward.',
    defaultSets: 3,
    defaultReps: '45s'
  },
  {
    id: 'battle-ropes',
    name: 'Battle Ropes',
    // exception: upper-body conditioning lives under cardio despite shoulder-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['front-delts'],
    secondaryMuscles: ['side-delts', 'forearms', 'abs'],
    poseIcon: 'battle-ropes',
    whatItTrains: 'Upper-body conditioning with shoulder, grip, and trunk endurance.',
    setup: ['Hold one rope end in each hand.', 'Stand in an athletic stance.', 'Brace abs and keep shoulders down.'],
    howToPerform: ['Drive alternating rope waves from the shoulders and arms.', 'Keep knees soft and torso stable.', 'Continue for the target interval.'],
    coachingTip: 'Stay low and breathe; tension in the neck wastes energy quickly.',
    defaultSets: 4,
    defaultReps: '30s'
  },
  {
    id: 'sled-push',
    name: 'Sled Push',
    // exception: conditioning sled work lives under cardio despite leg-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'calves', 'front-delts'],
    poseIcon: 'sled-push',
    whatItTrains: 'Hard conditioning and leg drive without eccentric loading.',
    setup: ['Load the sled modestly.', 'Grip handles with arms straight.', 'Set a forward lean from ankles to shoulders.'],
    howToPerform: ['Drive the sled forward with short powerful steps.', 'Keep hips low and chest strong.', 'Push for the target time or distance.'],
    coachingTip: 'If steps get tiny and stalled, reduce the load.',
    defaultSets: 4,
    defaultReps: '30s'
  },
  {
    id: 'incline-walk',
    name: 'Incline Walk',
    // exception: aerobic incline walking lives under cardio despite calf-led loading.
    category: 'cardio',
    equipment: 'cardio',
    primaryMuscles: ['calves'],
    secondaryMuscles: ['quads', 'glutes', 'hamstrings'],
    poseIcon: 'incline-walk',
    whatItTrains: 'Joint-friendly aerobic work with extra posterior-chain demand.',
    setup: ['Set treadmill incline to a challenging but sustainable grade.', 'Start at a brisk walking speed.', 'Stand tall without hanging on the rails.'],
    howToPerform: ['Walk with steady cadence.', 'Drive through the whole foot.', 'Maintain breathing and posture for the target distance.'],
    coachingTip: 'Use incline before excessive speed to keep the walk controlled.',
    defaultSets: 1,
    defaultReps: '3'
  }
];
