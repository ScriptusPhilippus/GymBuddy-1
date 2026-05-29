/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Exercise, MuscleGroup } from '../types';
import { AnatomyModel } from './AnatomyModel';
import { PoseIcon } from './PoseIcon';
import { Dumbbell, Target, Shield, Flame, Lightbulb, ChevronLeft, Edit2, X, Plus, Trash2, Check, Save } from 'lucide-react';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit?: (exercise: Exercise) => void;
}

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'lats', 'traps', 'front-delts', 'rear-delts', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lower-back', 'glutes', 'quads', 'hamstrings', 'calves'];

export const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  exercise,
  onBack,
  onEdit
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [isEditing, setIsEditing] = useState(false);

  // States for custom edit form
  const [editName, setEditName] = useState(exercise.name);
  const [editCategory, setEditCategory] = useState(exercise.category);
  const [editEquipment, setEditEquipment] = useState(exercise.equipment);
  const [editWhatItTrains, setEditWhatItTrains] = useState(exercise.whatItTrains);
  const [editCoachingTip, setEditCoachingTip] = useState(exercise.coachingTip);
  const [editSetup, setEditSetup] = useState<string[]>([...exercise.setup]);
  const [editHowToPerform, setEditHowToPerform] = useState<string[]>([...exercise.howToPerform]);
  const [editPrimaryMuscles, setEditPrimaryMuscles] = useState<MuscleGroup[]>([...exercise.primaryMuscles]);
  const [editSecondaryMuscles, setEditSecondaryMuscles] = useState<MuscleGroup[]>([...exercise.secondaryMuscles]);

  // Convert muscle identifiers to standard printable text
  const formatMuscleName = (muscle: MuscleGroup) => {
    return muscle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Unsplash category and specific image map
  const getExerciseImage = (ex: Exercise) => {
    const images: Record<string, string> = {
      'bench-press': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      'chest-fly': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
      'push-up': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop',
      'dip': 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=800&auto=format&fit=crop',
      'pull-up': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop',
      'pulldown': 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=800&auto=format&fit=crop',
      'row': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=800&auto=format&fit=crop',
      'squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      'deadlift': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      'bicep-curl': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    };

    const categoryImages: Record<string, string> = {
      chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      back: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=800&auto=format&fit=crop',
      legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
      arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      core: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      cardio: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop',
    };

    return images[ex.id] || categoryImages[ex.category] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop';
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    const updated: Exercise = {
      ...exercise,
      name: editName.trim(),
      category: editCategory,
      equipment: editEquipment,
      whatItTrains: editWhatItTrains.trim(),
      coachingTip: editCoachingTip.trim(),
      setup: editSetup.filter(s => s.trim() !== ''),
      howToPerform: editHowToPerform.filter(h => h.trim() !== ''),
      primaryMuscles: editPrimaryMuscles,
      secondaryMuscles: editSecondaryMuscles
    };
    onEdit?.(updated);
    setIsEditing(false);
  };

  const addSetupStep = () => setEditSetup([...editSetup, '']);
  const removeSetupStep = (idx: number) => setEditSetup(editSetup.filter((_, i) => i !== idx));
  const updateSetupStep = (idx: number, val: string) => {
    const copy = [...editSetup];
    copy[idx] = val;
    setEditSetup(copy);
  };

  const addPerformStep = () => setEditHowToPerform([...editHowToPerform, '']);
  const removePerformStep = (idx: number) => setEditHowToPerform(editHowToPerform.filter((_, i) => i !== idx));
  const updatePerformStep = (idx: number, val: string) => {
    const copy = [...editHowToPerform];
    copy[idx] = val;
    setEditHowToPerform(copy);
  };

  const toggleEditMuscle = (
    muscle: MuscleGroup,
    selected: MuscleGroup[],
    setter: React.Dispatch<React.SetStateAction<MuscleGroup[]>>
  ) => {
    setter(selected.includes(muscle)
      ? selected.filter(item => item !== muscle)
      : [...selected, muscle]
    );
  };

  return (
    <div id={`exercise-detail-${exercise.id}`} className="flex flex-col min-h-full bg-zinc-950 text-zinc-100 pb-16">
      {/* Header bar strictly styled like iOS screenshots */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-30">
        <button
          onClick={onBack}
          id="detail-back-btn"
          className="p-2.5 rounded-full hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Exercise Details</span>
        <button
          onClick={() => {
            setEditName(exercise.name);
            setEditCategory(exercise.category);
            setEditEquipment(exercise.equipment);
            setEditWhatItTrains(exercise.whatItTrains);
            setEditCoachingTip(exercise.coachingTip);
            setEditSetup([...exercise.setup]);
            setEditHowToPerform([...exercise.howToPerform]);
            setEditPrimaryMuscles([...exercise.primaryMuscles]);
            setEditSecondaryMuscles([...exercise.secondaryMuscles]);
            setIsEditing(true);
          }}
          id="detail-edit-btn"
          className="p-2.5 rounded-full hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition-all duration-200"
          title="Customize Exercise Blueprint"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-5 space-y-6 max-w-lg mx-auto w-full">
        
        {/* TOP ACTIVITY IMAGE - SHOWCASE PICTURE ON TOP OF EVERYTHING */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl bg-zinc-950 group">
          <div className="aspect-[16/10] w-full overflow-hidden relative">
            <img 
              src={getExerciseImage(exercise)} 
              alt={exercise.name} 
              className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Soft ambient violet shadows */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            
            {/* Floating absolute badge of category */}
            <div className="absolute top-4 left-4 flex gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest bg-violet-600 border border-violet-500 text-white px-3 py-1 rounded-full shadow-lg">
                {exercise.category}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-950/80 border border-zinc-900 text-zinc-300 px-3 py-1 rounded-full">
                {exercise.equipment}
              </span>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-b from-zinc-950/10 to-zinc-950 flex items-center gap-4">
            {/* Pose icon — same minimalistic mark used in the routine list,
                so the user has a visual anchor when arriving from a list. */}
            <PoseIcon name={exercise.poseIcon} size={64} className="shrink-0" />
            <div className="space-y-1 min-w-0">
              <span className="text-[9px] font-extrabold text-violet-400 uppercase tracking-widest block pl-0.5">Active Visualizer</span>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight truncate">{exercise.name}</h2>
              <p className="text-xs text-zinc-400 font-medium line-clamp-2">{exercise.whatItTrains}</p>
            </div>
          </div>
        </div>

        {/* Anatomical Model Panel */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Anatomical Muscle Targets</span>
              <p className="text-[9px] text-zinc-500 font-semibold">Front and back primary focuses</p>
            </div>

            {/* View Toggle Pillars */}
            <div className="flex bg-zinc-950 p-1 rounded-full border border-zinc-800 text-[10px] uppercase font-black">
              <button
                onClick={() => setView('front')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  view === 'front'
                    ? 'bg-zinc-800 text-white shadow shadow-black/80'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setView('back')}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  view === 'back'
                    ? 'bg-zinc-800 text-white shadow shadow-black/80'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Back
              </button>
            </div>
          </div>

          {/* Interactive Split Layout: Left is Legend, Right is anatomy */}
          <div className="grid grid-cols-5 gap-4 items-center min-h-[290px]">
            {/* Left side labels */}
            <div className="col-span-2 flex flex-col space-y-5 text-xs pl-1">
              {exercise.primaryMuscles.length > 0 && (
                <div className="space-y-1 py-1 border-l-2 border-blue-500 pl-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow shadow-blue-500/80" />
                    <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">Primary focus</span>
                  </div>
                  <div className="text-zinc-100 font-extrabold capitalize text-xs">
                    {exercise.primaryMuscles.map(formatMuscleName).join(', ')}
                  </div>
                </div>
              )}

              {exercise.secondaryMuscles.length > 0 && (
                <div className="space-y-1 py-1 border-l-2 border-violet-500 pl-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shadow shadow-violet-500/80" />
                    <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">Synergist muscles</span>
                  </div>
                  <div className="text-zinc-300 font-bold capitalize leading-relaxed text-xs">
                    {exercise.secondaryMuscles.map(formatMuscleName).join(', ')}
                  </div>
                </div>
              )}

              <div className="space-y-1 py-1 border-l-2 border-zinc-700 pl-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span className="text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">Requirement</span>
                </div>
                <div className="text-zinc-400 capitalize font-bold text-xs">
                  {exercise.equipment}
                </div>
              </div>
            </div>

            {/* Right side body model */}
            <div className="col-span-3 h-full flex items-center justify-center">
              <AnatomyModel
                primaryMuscles={exercise.primaryMuscles}
                secondaryMuscles={exercise.secondaryMuscles}
                selectedView={view}
                className="w-full border-none p-0 bg-transparent scale-105"
              />
            </div>
          </div>

          {/* Equipment Pills exactly aligned with Screen 3 */}
          <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t border-zinc-900 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 capitalize">
              <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
              <span>{exercise.equipment}</span>
            </span>
            {exercise.primaryMuscles.map(m => (
              <span key={m} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/25 border border-blue-900/40 text-blue-300 capitalize animate-fade-in">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <span>{formatMuscleName(m)}</span>
              </span>
            ))}
            {exercise.secondaryMuscles.slice(0, 2).map(m => (
              <span key={m} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-950/25 border border-violet-900/40 text-violet-300 capitalize">
                <Shield className="w-3.5 h-3.5 text-violet-500" />
                <span>{formatMuscleName(m)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Descriptive Blocks */}

        {/* 1. What it trains */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl flex items-start gap-4 shadow-md">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-blue-500 shadow-sm shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">What it trains</h3>
            <p className="text-sm text-zinc-200 leading-relaxed font-semibold">
              {exercise.whatItTrains}
            </p>
          </div>
        </div>

        {/* 2. Setup */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl flex items-start gap-4 shadow-md">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-violet-500 shadow-sm shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-2 w-full">
            <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">Setup Positioning</h3>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {exercise.setup.map((sh, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0 shadow-lg" />
                  <span>{sh}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. How to perform */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-3xl flex items-start gap-4 shadow-md">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-amber-500 shadow-sm shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="space-y-2 w-full">
            <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">Execution Routine</h3>
            <ol className="space-y-3.5 text-sm text-zinc-300">
              {exercise.howToPerform.map((st, idx) => (
                <li key={idx} className="flex gap-3 leading-relaxed font-semibold">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black text-amber-500 shrink-0 shadow-inner">
                    {idx + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 4. Coaching tip exactly mimicking the screenshots */}
        <div className="p-5 rounded-3xl bg-blue-950/15 border border-blue-900/20 flex items-start gap-4 shadow-lg">
          <div className="p-3 bg-blue-900/20 rounded-2xl border border-blue-800/25 text-blue-400 shrink-0">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-blue-400 tracking-wider uppercase">Pro Coach Tip</h4>
            <p className="text-sm text-blue-200/90 leading-relaxed font-semibold">
              {exercise.coachingTip}
            </p>
          </div>
        </div>
      </div>

      {/* RICH INLINE FORM EDITING MODAL- REPLACES BUGGY CONFUSING PROMPTS */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-950 border-t sm:border border-zinc-900 w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Edit Exercise Blueprint</h3>
                <p className="text-[10px] text-zinc-500 font-bold">Customize name, equipment style and targeted setups</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable contents */}
            <div className="flex-grow p-6 overflow-y-auto space-y-5">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Exercise Name</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Incline Bench Press"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
              </div>

              {/* Grid 2x2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Category</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Exercise['category'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-600 transition"
                  >
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="legs">Legs</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="arms">Arms</option>
                    <option value="core">Core</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Equipment</label>
                  <select 
                    value={editEquipment}
                    onChange={(e) => setEditEquipment(e.target.value as Exercise['equipment'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-600 transition"
                  >
                    <option value="barbell">Barbell</option>
                    <option value="dumbbell">Dumbbell</option>
                    <option value="machine">Machine</option>
                    <option value="cable">Cable</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="bands">Resistance Bands</option>
                    <option value="kettlebell">Kettlebell</option>
                    <option value="cardio">Cardio Equipment</option>
                  </select>
                </div>
              </div>

              {/* What it trains */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">What it Trains (Description)</label>
                <textarea 
                  value={editWhatItTrains}
                  onChange={(e) => setEditWhatItTrains(e.target.value)}
                  placeholder="Summarize target zones or movements."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition resize-none"
                />
              </div>

              {/* Coaching Tip */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Pro Coaching Tip</label>
                <textarea 
                  value={editCoachingTip}
                  onChange={(e) => setEditCoachingTip(e.target.value)}
                  placeholder="What is a key form cue?"
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition resize-none"
                />
              </div>

              {/* Setup steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Setup Instructions</label>
                  <button 
                    onClick={addSetupStep}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-violet-400 hover:text-violet-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editSetup.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="flex items-center justify-center w-7 h-10 rounded-xl bg-zinc-900 text-xs text-zinc-500 font-mono">
                        {idx + 1}
                      </span>
                      <input 
                        type="text"
                        value={step}
                        onChange={(e) => updateSetupStep(idx, e.target.value)}
                        placeholder={`Step ${idx + 1} action`}
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-600"
                      />
                      <button 
                        onClick={() => removeSetupStep(idx)}
                        className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editSetup.length === 0 && (
                    <p className="text-[11px] text-zinc-500 border border-dashed border-zinc-900 p-4 rounded-xl text-center">No setup instructions defined. Tap Add Step above.</p>
                  )}
                </div>
              </div>

              {/* Execution steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">How to Perform</label>
                  <button 
                    onClick={addPerformStep}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-violet-400 hover:text-violet-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editHowToPerform.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="flex items-center justify-center w-7 h-10 rounded-xl bg-zinc-900 text-xs text-zinc-500 font-mono">
                        {idx + 1}
                      </span>
                      <input 
                        type="text"
                        value={step}
                        onChange={(e) => updatePerformStep(idx, e.target.value)}
                        placeholder={`Perform action step ${idx + 1}`}
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-600"
                      />
                      <button 
                        onClick={() => removePerformStep(idx)}
                        className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editHowToPerform.length === 0 && (
                    <p className="text-[11px] text-zinc-500 border border-dashed border-zinc-900 p-4 rounded-xl text-center">No performance directions defined. Tap Add Step above.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Primary Muscles (target)</label>
                  <p className="text-[9px] text-zinc-600 font-semibold mt-0.5">Tap to toggle. These power the anatomy diagram.</p>
                </div>
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-zinc-900 bg-zinc-950/40 p-2 flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map(muscle => {
                    const isSelected = editPrimaryMuscles.includes(muscle);
                    return (
                      <button
                        key={`primary-${muscle}`}
                        type="button"
                        onClick={() => toggleEditMuscle(muscle, editPrimaryMuscles, setEditPrimaryMuscles)}
                        className={`px-2.5 py-1.5 rounded-full text-[10px] font-black capitalize transition ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {formatMuscleName(muscle)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Secondary Muscles (synergists)</label>
                  <p className="text-[9px] text-zinc-600 font-semibold mt-0.5">Tap to toggle. These power the anatomy diagram.</p>
                </div>
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-2 flex flex-wrap gap-1.5">
                  {ALL_MUSCLES.map(muscle => {
                    const isSelected = editSecondaryMuscles.includes(muscle);
                    return (
                      <button
                        key={`secondary-${muscle}`}
                        type="button"
                        onClick={() => toggleEditMuscle(muscle, editSecondaryMuscles, setEditSecondaryMuscles)}
                        className={`px-2.5 py-1.5 rounded-full text-[10px] font-black capitalize transition ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {formatMuscleName(muscle)}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer triggers */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-grow py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editName.trim()}
                className="flex-grow py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 rounded-xl text-xs font-black tracking-wider text-white flex items-center justify-center gap-2 duration-150 disabled:opacity-40"
              >
                <Check className="w-4 h-4" /> SAVE CHANGES
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
