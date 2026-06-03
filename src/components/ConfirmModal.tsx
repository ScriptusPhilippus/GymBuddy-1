/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  eyebrow?: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  eyebrow = 'Confirm action',
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  const isDanger = tone === 'danger';
  const Icon = isDanger ? AlertCircle : CheckCircle;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-5">
      <div className={`bg-zinc-950 border w-full max-w-sm rounded-[34px] overflow-hidden p-6 text-center shadow-2xl relative animate-scale-up space-y-5 ${
        isDanger ? 'border-rose-800/40' : 'border-[rgb(var(--accent-800)/0.40)]'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg ${
          isDanger
            ? 'bg-rose-600/15 border border-rose-500/20 text-rose-400'
            : 'bg-[rgb(var(--accent-600)/0.15)] border border-[rgb(var(--accent-500)/0.20)] text-[rgb(var(--accent-400))]'
        }`}>
          <Icon className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-white tracking-tight">{title}</h3>
          <p className={`text-[10px] font-black uppercase tracking-widest ${
            isDanger ? 'text-rose-400' : 'text-[rgb(var(--accent-400))]'
          }`}>
            {eyebrow}
          </p>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
          {message}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={`w-full py-3 text-white rounded-xl text-xs font-black tracking-widest transition duration-150 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-gradient-to-r from-[rgb(var(--accent-600))] to-[rgb(var(--accent-600))] hover:from-[rgb(var(--accent-500))]'
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-black tracking-widest transition duration-150"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
