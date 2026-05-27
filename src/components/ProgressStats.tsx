/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WorkoutSession, Exercise, MuscleGroup } from '../types';
import { AnatomyModel } from './AnatomyModel';
import { Sparkles, BarChart2, Zap, Flame, Calendar, Award } from 'lucide-react';

interface ProgressStatsProps {
  history: WorkoutSession[];
  exercisesList: Exercise[];
  weightUnit: 'kg' | 'lbs';
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  history,
  exercisesList,
  weightUnit
}) => {
  const [muscleView, setMuscleView] = useState<'front' | 'back'>('front');

  // Multi-dimensional Stats calculation
  const stats = useMemo(() => {
    let totalWorkouts = history.length;
    let totalSets = 0;
    let totalWeightHoisted = 0;
    let totalActiveSecs = 0;
    
    // Map of muscle loads (how many times a muscle has been hit)
    const muscleHits: Record<MuscleGroup, number> = {
      chest: 0, lats: 0, traps: 0, 'front-delts': 0, 'rear-delts': 0,
      biceps: 0, triceps: 0, forearms: 0, abs: 0, obliques: 0,
      'lower-back': 0, glutes: 0, quads: 0, hamstrings: 0, calves: 0
    };

    history.forEach(session => {
      totalActiveSecs += session.elapsedSeconds;
      
      session.exercises.forEach(se => {
        // Find matched exercise
        const ex = exercisesList.find(e => e.id === se.exerciseId);
        const completedSetsInExercise = se.sets.filter(s => s.completed);

        totalSets += completedSetsInExercise.length;

        // Calculate load hits
        if (ex && completedSetsInExercise.length > 0) {
          const multiplier = completedSetsInExercise.length;
          
          ex.primaryMuscles.forEach(m => {
            if (m in muscleHits) muscleHits[m] += multiplier * 2; // primary counts double
          });
          ex.secondaryMuscles.forEach(m => {
            if (m in muscleHits) muscleHits[m] += multiplier;
          });
        }

        completedSetsInExercise.forEach(set => {
          totalWeightHoisted += (set.weight * set.reps);
        });
      });
    });

    // Determine the most worked muscle
    let topMuscle: MuscleGroup = 'chest';
    let maxHits = 0;
    (Object.keys(muscleHits) as MuscleGroup[]).forEach(m => {
      if (muscleHits[m] > maxHits) {
        maxHits = muscleHits[m];
        topMuscle = m;
      }
    });

    const activeMins = Math.round(totalActiveSecs / 60);

    return {
      totalWorkouts,
      totalSets,
      totalWeightHoisted,
      activeMins,
      muscleHits,
      topMuscle: maxHits > 0 ? topMuscle : null
    };
  }, [history, exercisesList]);

  // Generate dynamic muscle heat arrays to pass into visual graphics
  const heatMapColors = useMemo(() => {
    const hits = stats.muscleHits;
    const maxVal = Math.max(...(Object.values(hits) as number[]), 1);

    const primaryHeated: MuscleGroup[] = [];
    const secondaryHeated: MuscleGroup[] = [];

    (Object.keys(hits) as MuscleGroup[]).forEach(m => {
      const loadFactor = hits[m] / maxVal;
      if (loadFactor > 0.6) {
        primaryHeated.push(m);
      } else if (loadFactor > 0.15) {
        secondaryHeated.push(m);
      }
    });

    return { primaryHeated, secondaryHeated };
  }, [stats]);

  // Generate coordinates for SVG connected training volume chart
  const volumeChartData = useMemo(() => {
    // Take up to previous 8 completed sessions in chronological alignment
    const sorted = [...history]
      .sort((a, b) => a.startTime - b.startTime)
      .slice(-8);

    const points = sorted.map(session => {
      let vol = 0;
      session.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) vol += (s.weight * s.reps);
        });
      });
      return {
        label: new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: vol
      };
    });

    return points;
  }, [history]);

  const maxVolumeVal = useMemo(() => {
    const vals = volumeChartData.map(d => d.value);
    return Math.max(...vals, 1000);
  }, [volumeChartData]);

  return (
    <div id="progress-stats-page" className="space-y-6 max-w-lg mx-auto w-full pb-12">
      
      {/* Overview numeric metric grids */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <Award className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Lifted</span>
            <span className="text-xl font-black text-white">{stats.totalWeightHoisted.toLocaleString()} <span className="text-xs font-semibold text-zinc-500">{weightUnit}</span></span>
          </div>
          <span className="absolute -bottom-1 -right-1 text-zinc-950 stroke-zinc-900 font-bold select-none text-4xl -z-10">{weightUnit.toUpperCase()}</span>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Logged Gym Days</span>
            <span className="text-xl font-black text-white">{stats.totalWorkouts} <span className="text-xs font-semibold text-zinc-500">sessions</span></span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <Zap className="w-5 h-5 text-violet-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Sets Logged</span>
            <span className="text-xl font-black text-white">{stats.totalSets} <span className="text-xs font-semibold text-zinc-500">sets</span></span>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-3xl space-y-1 relative overflow-hidden">
          <BarChart2 className="w-5 h-5 text-sky-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Gym Minutes</span>
            <span className="text-xl font-black text-white">{stats.activeMins} <span className="text-xs font-semibold text-zinc-500">mins</span></span>
          </div>
        </div>
      </div>

      {/* Muscle Heat Accumulator layout */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Anatomical Load Analysis</h3>
          </div>
          <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-full text-[10px]">
            <button
              onClick={() => setMuscleView('front')}
              className={`px-3 py-1 rounded-full transition-all ${
                muscleView === 'front' ? 'bg-zinc-900 text-white' : 'text-zinc-500'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setMuscleView('back')}
              className={`px-3 py-1 rounded-full transition-all ${
                muscleView === 'back' ? 'bg-zinc-900 text-white' : 'text-zinc-500'
              }`}
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Left: graphical Heat outline */}
          <div className="col-span-6 flex justify-center">
            <div className="w-40 h-64 p-2 bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden flex items-center justify-center relative">
              <AnatomyModel
                primaryMuscles={heatMapColors.primaryHeated}
                secondaryMuscles={heatMapColors.secondaryHeated}
                selectedView={muscleView}
                className="w-full border-none p-0 bg-transparent scale-110"
              />
              <span className="absolute bottom-2 left-2 text-[9px] text-zinc-600 tracking-wider">Heat Map active</span>
            </div>
          </div>

          {/* Right: ranked list of worked muscles */}
          <div className="col-span-6 space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Dominant Muscles</h4>
            {history.length === 0 ? (
              <span className="text-xs text-zinc-500 block">Log a workout to populate muscle targeting analysis.</span>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(Object.entries(stats.muscleHits) as [MuscleGroup, number][])
                  .filter(([_, load]) => load > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([muscle, score]) => {
                    const ratio = Math.min(100, Math.round((score / Math.max(...(Object.values(stats.muscleHits) as number[]))) * 100));
                    return (
                      <div key={muscle} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="capitalize text-zinc-300">{muscle.replace('-', ' ')}</span>
                          <span className="text-violet-400 font-mono text-[10px]">{score} pts</span>
                        </div>
                        {/* Progress Bar bar representing muscle activation load */}
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Training volume progression chart */}
      <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Volume progression</h3>
          </div>
          <span className="text-[10px] tracking-wide text-zinc-500 uppercase font-semibold">Last 8 workouts</span>
        </div>

        {volumeChartData.length < 2 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-2xl text-center p-4">
            <BarChart2 className="w-6 h-6 text-zinc-700" />
            <span className="text-xs text-zinc-500 mt-2">Log at least two completed sessions to unlock volume graphs.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* SVG line-graph layout */}
            <div className="w-full h-44 relative bg-zinc-950/40 border border-zinc-900 p-3 rounded-2xl">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Visual gridlines */}
                {[0.25, 0.5, 0.75].map((ratio, index) => (
                  <line
                    key={index}
                    x1="20"
                    y1={150 - (120 * ratio)}
                    x2="380"
                    y2={150 - (120 * ratio)}
                    stroke="#1c1c1e"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Plot dynamic points and render paths */}
                <path
                  d={`M ${volumeChartData.map((d, idx) => {
                    const x = 30 + ((340 / (volumeChartData.length - 1)) * idx);
                    const y = 130 - ((d.value / maxVolumeVal) * 90);
                    return `${x} ${y}`;
                  }).join(' L ')}`}
                  fill="none"
                  stroke="url(#neon-emerald-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Dynamic dots and circles overlay */}
                {volumeChartData.map((d, idx) => {
                  const x = 30 + ((340 / (volumeChartData.length - 1)) * idx);
                  const y = 130 - ((d.value / maxVolumeVal) * 90);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#10b981" />
                      <circle cx={x} cy={y} r="10" fill="transparent" className="hover:fill-emerald-500/10 transition cursor-pointer" />
                      {/* Vertical ticks */}
                      <text x={x} y="145" textAnchor="middle" fontSize="8" fill="#52525b" fontWeight="600">{d.label}</text>
                      {/* Volume data floating numbers above spikes */}
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="7" fill="#10b981" fontWeight="bold">{(d.value / 1000).toFixed(1)}k</text>
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="neon-emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
