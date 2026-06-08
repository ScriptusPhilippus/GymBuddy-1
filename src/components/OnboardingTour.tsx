/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight, History, PlayCircle, Settings, TrendingUp, X, ClipboardList } from 'lucide-react';
import { useI18n } from '../i18n';

interface OnboardingTourProps {
  open: boolean;
  stepIndex: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

const steps = [
  {
    icon: ClipboardList,
    eyebrowKey: 'onboarding.workout.eyebrow',
    titleKey: 'onboarding.workout.title',
    bodyKey: 'onboarding.workout.body',
    spotlight: 'top-[190px] left-1/2 -translate-x-1/2 w-[min(92vw,430px)] h-[360px]',
    panel: 'bottom-24'
  },
  {
    icon: BookOpen,
    eyebrowKey: 'onboarding.library.eyebrow',
    titleKey: 'onboarding.library.title',
    bodyKey: 'onboarding.library.body',
    spotlight: 'top-[185px] left-1/2 -translate-x-1/2 w-[min(92vw,430px)] h-[420px]',
    panel: 'bottom-24'
  },
  {
    icon: PlayCircle,
    eyebrowKey: 'onboarding.live.eyebrow',
    titleKey: 'onboarding.live.title',
    bodyKey: 'onboarding.live.body',
    spotlight: 'bottom-16 left-1/2 -translate-x-1/2 w-[min(92vw,430px)] h-24',
    panel: 'top-28'
  },
  {
    icon: History,
    eyebrowKey: 'onboarding.history.eyebrow',
    titleKey: 'onboarding.history.title',
    bodyKey: 'onboarding.history.body',
    spotlight: 'top-[130px] left-1/2 -translate-x-1/2 w-[min(92vw,430px)] h-[420px]',
    panel: 'bottom-24'
  },
  {
    icon: TrendingUp,
    eyebrowKey: 'onboarding.progress.eyebrow',
    titleKey: 'onboarding.progress.title',
    bodyKey: 'onboarding.progress.body',
    spotlight: 'top-[130px] left-1/2 -translate-x-1/2 w-[min(92vw,430px)] h-[420px]',
    panel: 'bottom-24'
  },
  {
    icon: Settings,
    eyebrowKey: 'onboarding.settings.eyebrow',
    titleKey: 'onboarding.settings.title',
    bodyKey: 'onboarding.settings.body',
    spotlight: 'top-[130px] left-1/2 -translate-x-1/2 w-[min(92vw,430px)] h-[360px]',
    panel: 'bottom-24'
  }
];

export const ONBOARDING_STEP_COUNT = steps.length;

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ open, stepIndex, onBack, onNext, onSkip }) => {
  const { t } = useI18n();

  if (!open) return null;

  const safeIndex = Math.min(Math.max(stepIndex, 0), steps.length - 1);
  const step = steps[safeIndex];
  const Icon = step.icon;
  const isLast = safeIndex === steps.length - 1;

  return (
    <>
      <div className="fixed inset-0 z-[70] pointer-events-none">
        <div
          className={`absolute rounded-[30px] border border-[rgb(var(--accent-400)/0.6)] shadow-[0_0_0_9999px_rgba(0,0,0,0.74)] transition-all duration-300 ease-out ${step.spotlight}`}
        />
      </div>

      <div className={`fixed left-1/2 -translate-x-1/2 z-[80] w-[min(90vw,380px)] ${step.panel}`}>
        <div className="rounded-3xl border border-[rgb(var(--accent-700)/0.50)] bg-zinc-950/95 shadow-2xl shadow-black/60 backdrop-blur-md overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[rgb(var(--accent-600)/0.16)] border border-[rgb(var(--accent-500)/0.25)] text-[rgb(var(--accent-300))] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-[rgb(var(--accent-400))]">{t(step.eyebrowKey)}</p>
                <h2 className="text-sm font-black text-white tracking-tight">{t(step.titleKey)}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition"
              aria-label={t('onboarding.skip')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs leading-relaxed text-zinc-300 font-medium">{t(step.bodyKey)}</p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {steps.map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className={`h-1.5 rounded-full transition-all ${
                      dotIndex === safeIndex
                        ? 'w-6 bg-[rgb(var(--accent-500))]'
                        : 'w-1.5 bg-zinc-800'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={safeIndex === 0}
                  className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/40 text-[10px] font-black uppercase tracking-wider text-zinc-400 disabled:opacity-30 hover:text-white transition inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {t('onboarding.back')}
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-500))] text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[rgb(var(--accent-950)/0.35)] transition active:scale-95 inline-flex items-center gap-1"
                >
                  {isLast ? t('onboarding.done') : t('onboarding.next')}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
