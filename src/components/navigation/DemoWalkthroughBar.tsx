import React from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Eye,
  X,
  Sparkles,
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
  const steps = [
    { num: 1, label: 'Explore map' },
    { num: 2, label: 'Linked concepts' },
    { num: 3, label: 'Verify source' },
    { num: 4, label: 'Take quiz' },
    { num: 5, label: 'Review gaps' },
  ];

  return (
    <div className="pointer-events-auto max-w-2xl mx-auto w-full px-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-slate-900/95 border border-cyan-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-xl text-slate-100 flex items-center justify-between gap-3 text-xs">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
          <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-medium text-[11px]">
            Demo Guide
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono text-[11px]">
            Step {currentStep} of 5
          </span>
        </div>

        {/* Dynamic Contextual Guidance Copy */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {currentStep === 1 && (
            <p className="text-slate-200 text-xs truncate">
              <strong className="text-cyan-300 font-medium">1. Explore concepts:</strong> Click any concept on the map to inspect its connections.
            </p>
          )}

          {currentStep === 2 && (
            <p className="text-slate-200 text-xs truncate">
              <strong className="text-cyan-300 font-medium">2. Connected to {selectedConceptTitle || 'concept'}:</strong> Notice the directional relationship lines linking related ideas.
            </p>
          )}

          {currentStep === 3 && (
            <p className="text-slate-200 text-xs truncate">
              <strong className="text-cyan-300 font-medium">3. Grounded in source:</strong> Inspect the verbatim course note excerpt in the right panel.
            </p>
          )}

          {currentStep === 4 && (
            <p className="text-slate-200 text-xs truncate">
              <strong className="text-cyan-300 font-medium">4. Test recall:</strong> Take the 5-question diagnostic quiz to identify areas to revise.
            </p>
          )}

          {currentStep === 5 && (
            <p className="text-slate-200 text-xs truncate">
              <strong className="text-rose-300 font-medium">5. Revision signal:</strong> {revisionCount} {revisionCount === 1 ? 'concept needs' : 'concepts need'} review (highlighted in coral on the map).
            </p>
          )}
        </div>

        {/* Action Button for Current Step */}
        <div className="flex items-center gap-2 shrink-0">
          {currentStep === 1 && (
            <button
              onClick={onSelectSampleConcept}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Try "Inheritance"</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={onOpenSourceNotes}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <BookOpen className="w-3 h-3" />
              <span>View Source</span>
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={onOpenQuiz}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Take Quiz</span>
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={onOpenQuiz}
              className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Open Quiz</span>
            </button>
          )}

          {currentStep === 5 && (
            <button
              onClick={onOpenQuiz}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <span>Review Results</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Dismiss demo guide"
            aria-label="Dismiss demo guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
