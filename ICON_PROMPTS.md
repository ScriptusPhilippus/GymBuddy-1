# GymBuddy — Exercise Icon Generation Guide (Google AI Studio)

This produces minimalist white line‑art pose icons that match the existing 36 originals
in `public/poses/`. Work through it gradually — generate one (or a small batch), send the
images back, and I'll key them to transparent, normalise the stroke, and wire them in.

---

## How to use (every time)

1. **Paste Section A (the Style Block) first, then ONE exercise line from Section C/D.**
   Replace `[EXERCISE]` in the Style Block with that line's description.
2. **Background:** ask for **pure white lines on a solid pure‑black background**.
   Do NOT ask for a transparent PNG — image models are unreliable at it. Black is easy
   for the model and I convert black→transparent on my side, exactly like the current assets.
3. **Size:** 1024 × 1024, square (1:1).
4. **(Recommended) Style lock:** also attach 1–2 existing icons as reference images and say
   *"match the exact line style, stroke weight and figure proportions of the attached icons."*
   Good references to upload: `public/poses/squat.png`, `public/poses/deadlift.png`,
   `public/poses/bench-press.png` (these show on a white viewer as blank because they're
   white‑on‑transparent — open them in the app or just trust them; the model still reads them).
5. **Send back** the PNG + which exercise it's for (or name the file `<id>.png` using the id
   in backticks below). I handle transparency + wiring.

> Tip: generate in one continuous AI Studio session and reuse the same references so the
> stroke weight stays consistent across separately‑generated icons — that's the hard part.

---

## A. Style Block — paste this before every exercise

```
A minimalist fitness pictogram icon drawn as clean line art: pure white (#FFFFFF) strokes
on a solid pure-black (#000000) background. A single human figure performing [EXERCISE].
Uniform medium-thick stroke weight throughout, with rounded line caps and rounded joints.
The head is a simple open circle (outline only, not filled). Simplified geometric limbs like
a high-end workout-app icon — no muscle detail, no face, no hair, no clothing, no fingers.
Any equipment (barbell, dumbbell, bench, cable, machine) is drawn in the same white outline
style at the same stroke weight. Flat 2D, front-on or strict side view as specified, no
perspective distortion, no shading, no gradients, no fill, no shadows, no glow. The figure is
centered with even padding on all sides. Square 1:1 framing. Absolutely no text, numbers,
logos, floor lines, grid, or background scenery — only the white figure on solid black.
```

**Avoid (negative prompt, if the field exists):** `text, letters, numbers, watermark, logo,
color, gradient, shadow, glow, 3D, realistic, photo, photograph, muscles, anatomy, face,
clothing, background, floor, grid, multiple figures, blurry`

---

## B. Angle convention (so icons stay consistent)

- **Strict side profile** → presses on a bench, hinges/deadlifts, rows, planks, hip thrusts,
  leg curls, kickbacks, pullovers, calf raises, rollouts, leg raises.
- **Front view (figure facing the viewer)** → squats, overhead presses, raises, curls,
  pulldowns/pull‑ups, shrugs, abduction/adduction, jumping jacks, woodchoppers.
- Pick whichever makes the movement most instantly recognisable; each line below states it.

---

## C. FIX an existing original

| Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|
| **Flat Bench Press** (redo) | `bench-press` | strict side profile of a figure lying flat on a horizontal bench, both arms pointing straight up, pressing a barbell. The barbell is viewed END‑ON so it appears as a small circle (a single plate) directly above the hands — NOT a long horizontal bar spanning the width of the icon. Bench drawn as a simple horizontal line with two legs |

*Optional polish (not required): `sit-up` and `crunch` look nearly identical — could make
`sit-up` a fuller torso‑lift (hands behind head, torso most of the way up); `burpee` currently
reads like a star‑reach — could show the squat‑thrust (hands on floor, legs kicked back).*

---

## D. New icons (the remaining exercises)

Legend: **⚑ = currently an abstract placeholder glyph (do these first — they look worst)**,
◦ = currently borrows another icon (looks okay, lower priority).

### Chest
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Incline Bench Press | `incline-bench-press` | strict side profile, lying back on a bench inclined ~40°, pressing a barbell straight up from the upper chest; bar shown end‑on as a small circle above the hands |
| ⚑ | Decline Bench Press | `decline-bench-press` | strict side profile, lying on a bench declined head‑down ~20°, pressing a barbell up; bar end‑on as a small circle |
| ⚑ | Dumbbell Bench Press | `dumbbell-bench-press` | strict side profile, lying flat on a bench, pressing two dumbbells straight up, arms vertical |
| ⚑ | Incline Dumbbell Press | `incline-dumbbell-press` | strict side profile, on a ~40° incline bench, pressing two dumbbells up overhead |
| ⚑ | Machine Chest Press | `machine-chest-press` | side/three‑quarter view, seated upright on a chest‑press machine, pushing two handles forward horizontally |
| ⚑ | Pec Deck | `pec-deck` | front view, seated on a pec‑deck machine, both arms bent ~90° bringing two pads together in front of the chest |
| ◦ | Cable Crossover | `cable-crossover` | front view, standing with a slight forward lean, both arms sweeping down‑and‑in from two high cable pulleys to meet in front of the hips |
| ⚑ | Svend Press | `svend-press` | front view, standing, pressing a single round weight plate straight out from the chest with both palms squeezing it |

### Back
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Close‑Grip Lat Pulldown | `lat-pulldown-close-grip` | front view, seated at a pulldown station, pulling a short close‑grip handle down to the upper chest, elbows driving down |
| ⚑ | Seated Cable Row | `seated-cable-row` | strict side profile, seated at a low cable, torso upright, pulling a handle to the abdomen with elbows back |
| ⚑ | T‑Bar Row | `t-bar-row` | side profile, bent ~45° at the hips over a T‑bar (landmine) row, pulling the bar up to the chest |
| ⚑ | Single‑Arm Dumbbell Row | `single-arm-dumbbell-row` | side profile, one knee and one hand braced on a flat bench, the other arm rowing a single dumbbell up to the hip |
| ⚑ | Machine Row | `machine-row` | side/three‑quarter view, seated at a chest‑supported row machine, pulling two handles back |
| ⚑ | Chin‑Up | `chin-up` | front view, hanging from a fixed bar with a close underhand (palms‑toward‑face) grip, pulling the chin up to the bar |
| ⚑ | Inverted Row | `inverted-row` | strict side profile, body straight and angled under a fixed waist‑height bar, heels on the floor, pulling the chest up to the bar |
| ⚑ | Straight‑Arm Pulldown | `straight-arm-pulldown` | side profile, standing with a slight hinge, arms kept straight pushing a high cable bar down in an arc to the thighs |
| ⚑ | Dumbbell Pullover | `dumbbell-pullover` | strict side profile, lying back on a flat bench, both hands cupping one dumbbell, arms nearly straight in an arc from above the chest to behind the head |
| ⚑ | Rack Pull | `rack-pull` | strict side profile, partial deadlift from a rack at knee height, flat back, barbell near lockout |
| ⚑ | Good Morning | `good-morning` | strict side profile, barbell across the upper back, hinging forward at the hips with near‑straight legs and a flat back roughly parallel to the floor |

### Shoulders
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Arnold Press | `arnold-press` | front view, seated, pressing two dumbbells overhead mid‑rotation (palms turning to face forward) |
| ⚑ | Dumbbell Shoulder Press | `dumbbell-shoulder-press` | front view, seated, pressing two dumbbells straight overhead to lockout |
| ⚑ | Machine Shoulder Press | `machine-shoulder-press` | front/three‑quarter view, seated on a shoulder‑press machine, pressing two handles overhead |
| ⚑ | Dumbbell Front Raise | `front-raise` | strict side profile, standing, one straight arm raising a dumbbell forward to shoulder height |
| ⚑ | Rear Delt Fly | `rear-delt-fly` | side profile, hinged forward ~90° with a flat back, both arms sweeping out to the sides (reverse fly) holding dumbbells |
| ◦ | Upright Row | `upright-row` | front view, standing, pulling a barbell straight up the front of the body to chest height with high, flared elbows |
| ⚑ | Landmine Press | `landmine-press` | side/three‑quarter view, standing, pressing one end of a landmine barbell up and forward at an angle from the shoulder |

### Arms — Biceps & Forearms
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Barbell Curl | `barbell-curl` | front view, standing, curling a straight barbell up to the chest with elbows pinned at the sides |
| ⚑ | EZ‑Bar Curl | `ez-bar-curl` | front view, standing, curling an EZ bar (slightly zig‑zag grips) up to the chest |
| ⚑ | Hammer Curl | `hammer-curl` | front view, standing, curling two dumbbells with a neutral vertical (thumbs‑up) grip |
| ⚑ | Preacher Curl | `preacher-curl` | strict side profile, upper arms resting over an angled preacher‑bench pad, curling a bar up |
| ⚑ | Concentration Curl | `concentration-curl` | side profile, seated, one elbow braced against the inner thigh, curling a single dumbbell up |
| ⚑ | Cable Curl | `cable-curl` | front view, standing at a low cable pulley, curling a straight bar up to the chest |
| ⚑ | Reverse Curl | `reverse-curl` | front view, standing, curling a barbell with an overhand (knuckles‑up) grip |
| ⚑ | Wrist Curl | `wrist-curl` | side profile, seated, forearms resting along the thighs, wrists flexing a barbell upward through a small range |

### Arms — Triceps
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Tricep Pushdown | `tricep-pushdown` | strict side profile, standing at a high cable, elbows pinned to the sides, pushing a straight bar down to the thighs |
| ⚑ | Skull Crusher | `skull-crusher` | strict side profile, lying flat on a bench, upper arms vertical, lowering an EZ bar toward the forehead |
| ⚑ | Overhead Cable Extension | `overhead-cable-extension` | side profile, standing, both arms extending a rope overhead to lockout (facing away from the cable) |
| ⚑ | Tricep Kickback | `tricep-kickback` | side profile, hinged forward, upper arm held parallel to the torso, extending a dumbbell straight back |

### Legs
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Leg Press | `leg-press` | side/three‑quarter view, reclined on a 45° leg‑press machine, knees bent, pushing the weighted platform with both feet |
| ⚑ | Romanian Deadlift | `romanian-deadlift` | strict side profile, near‑straight legs, hips pushed far back, flat back hinged ~45°, barbell sliding down the thighs to mid‑shin |
| ⚑ | Sumo Deadlift | `sumo-deadlift` | front view, very wide stance with toes out, hands gripping a barbell inside the knees, flat back, lifting |
| ◦ | Front Squat | `front-squat` | front view, barbell racked across the FRONT of the shoulders with high elbows, squatting deep |
| ◦ | Goblet Squat | `goblet-squat` | front view, holding a single kettlebell at the chest with both hands, squatting deep |
| ⚑ | Hack Squat | `hack-squat` | side/three‑quarter view, on an angled hack‑squat machine, shoulders under the pads, squatting on the sled |
| ◦ | Bulgarian Split Squat | `bulgarian-split-squat` | strict side profile, rear foot elevated on a bench, front knee bent ~90° in a deep split squat, dumbbells at the sides |
| ◦ | Step‑Up | `step-up` | side profile, stepping one foot up onto a raised box/bench, dumbbells held at the sides |
| ◦ | Seated Calf Raise | `seated-calf-raise` | strict side profile, seated with knees bent ~90° under a pad, raising the heels up onto the balls of the feet |
| ⚑ | Glute Bridge | `glute-bridge` | strict side profile, lying on the floor (no bench), knees bent and feet flat, hips lifted into a straight line — bodyweight |
| ⚑ | Hip Abduction Machine | `hip-abduction` | front view, seated on an abduction machine, pushing both knees apart against the pads |
| ⚑ | Hip Adduction Machine | `hip-adduction` | front view, seated on an adduction machine, squeezing both knees together against the pads |
| ◦ | Pistol Squat | `pistol-squat` | strict side profile, single‑leg squat with one leg extended straight out in front, deep on the standing leg |

### Core
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Hanging Leg Raise | `hanging-leg-raise` | strict side profile, hanging straight from a bar, raising straight legs up to horizontal |
| ⚑ | Lying Leg Raise | `lying-leg-raise` | strict side profile, lying flat on the back, straight legs raised toward vertical |
| ⚑ | Flutter Kick | `flutter-kick` | strict side profile, lying on the back with legs straight and slightly off the floor in an alternating scissor (one leg up, one low) |
| ⚑ | Russian Twist | `russian-twist` | three‑quarter view, seated with torso leaned back and knees bent, feet off the floor, hands together rotated to one side |
| ◦ | Bicycle Crunch | `bicycle-crunch` | side/three‑quarter view, lying on the back, one elbow toward the opposite bent knee while the other leg extends straight |
| ◦ | Cable Crunch | `cable-crunch` | strict side profile, kneeling at a high cable, holding a rope beside the head, crunching the torso down |
| ◦ | Dead Bug | `dead-bug` | side view, lying on the back, opposite arm and leg extended while the other arm and leg stay bent at 90° |
| ◦ | Ab Wheel Rollout | `ab-wheel-rollout` | strict side profile, kneeling, arms extended forward rolling an ab wheel out with the body stretched low |
| ◦ | Side Plank | `side-plank` | strict side profile, body in a straight line supported on one forearm, hips stacked and lifted off the floor |
| ◦ | Hollow Hold | `hollow-hold` | strict side profile, lying on the back with arms overhead and straight legs, both lifted into a shallow "banana" curve |
| ⚑ | Pallof Press | `pallof-press` | front view, standing side‑on to a cable, both hands pressing a handle straight out from the chest (anti‑rotation) |
| ⚑ | Cable Woodchopper | `cable-woodchopper` | three‑quarter view, standing, both hands pulling a cable diagonally across the body from high on one side to low on the other |

### Cardio / Conditioning
| Pri | Exercise | id | Prompt description ([EXERCISE]) |
|---|---|---|---|
| ⚑ | Jumping Jack | `jumping-jack` | front view, mid‑jump in a star shape, legs spread wide and both arms raised overhead |
| ◦ | High Knees | `high-knees` | strict side profile, running in place driving one knee up high toward the chest |
| ⚑ | Battle Ropes | `battle-ropes` | three‑quarter view, athletic half‑squat stance, both arms gripping two thick ropes mid‑wave (rope undulations) |
| ⚑ | Sled Push | `sled-push` | strict side profile, leaning forward with both arms extended pushing a weighted sled |
| ◦ | Stair Climber | `stair-climber` | strict side profile, on a stair‑climber machine, stepping upward |
| ◦ | Incline Walk | `incline-walk` | strict side profile, walking up an inclined treadmill |

---

**Totals:** 1 fix (`bench-press`) + 69 new icons (52 ⚑ placeholders, 17 ◦ borrowed).
Suggested order: do the ⚑ placeholders first (biggest visual win), then the ◦ borrows.
