import React from 'react';
import {
  ArrowRight,
  HelpCircle,
  BookOpen,
  X,
} from 'lucide-react';

export interface DemoWalkthroughBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  selectedConceptTitle?: string;
  revisionCount: number;
  onOpenSourceNotes: () => void;
  onOpenQuiz: () => void;
  onSelectSampleConcept: () => void;
  onDismiss: () => void;
}

export const DemoWalkthroughBar: React.FC<DemoWalkthroughBarProps> = ({
  currentStep,
  selectedConceptTitle,
  revisionCount,
  onOpenSourceNotes,
  onOpenQuiz,
  onSelectSampleConcept,
  onDismiss,
}) => {
  return (
    <div className="pointer-events-auto max-w-4xl mx-auto w-full px-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-slate-950/95 border border-slate-700/80 backdrop-blur-xl rounded-2xl px-3 py-3 sm:px-4 shadow-xl shadow-black/20 text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="hidden sm:flex shrink-0 flex-col gap-1.5 min-w-24">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Sample tour <span className="text-slate-600">·</span> {currentStep} of 5
          </span>
          <div className="flex gap-1" aria-label={`Step ${currentStep} of 5`}>
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`h-1 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Contextual Guidance Copy */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {currentStep === 1 && (
            <p className="text-slate-200 text-sm leading-snug">
              <strong className="text-cyan-300 font-semibold">Explore the map.</strong>{' '}
              Choose a concept to see how ideas connect.
            </p>
          )}

          {currentStep === 2 && (
            <p className="text-slate-200 text-sm leading-snug">
              <strong className="text-cyan-300 font-semibold">{selectedConceptTitle || 'This concept'} connects to others.</strong>{' '}
              Follow the links to explore related ideas.
            </p>
          )}

          {currentStep === 3 && (
            <p className="text-slate-200 text-sm leading-snug">
              <strong className="text-cyan-300 font-semibold">Check the source.</strong>{' '}
              Open the cited paragraph to see where the explanation comes from.
            </p>
          )}

          {currentStep === 4 && (
            <p className="text-slate-200 text-sm leading-snug">
              <strong className="text-cyan-300 font-semibold">Test your understanding.</strong>{' '}
              Take a short quiz to find topics worth revisiting.
            </p>
          )}

          {currentStep === 5 && (
            <p className="text-slate-200 text-sm leading-snug">
              <strong className="text-rose-300 font-semibold">Your review priorities.</strong>{' '}
              {revisionCount === 0
                ? 'No concepts were flagged this time.'
                : `${revisionCount} ${revisionCount === 1 ? 'concept was' : 'concepts were'} flagged for review.`}
            </p>
          )}
        </div>

        {/* Action Button for Current Step */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {currentStep === 1 && (
            <button
              onClick={onSelectSampleConcept}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore inheritance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={onOpenSourceNotes}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>View source</span>
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={onOpenQuiz}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Take quiz</span>
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={onOpenQuiz}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Open quiz</span>
            </button>
          )}

          {currentStep === 5 && (
            <span className="text-xs font-medium text-slate-400">
              Highlighted on the map
            </span>
          )}

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Dismiss demo guide"
            aria-label="Dismiss demo guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
