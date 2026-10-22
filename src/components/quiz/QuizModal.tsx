import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Compass,
} from 'lucide-react';
import { QuizQuestion, Concept } from '../../types';
import { evaluateQuizSubmission } from '../../utils/citationVerifier';

interface QuizModalProps {
  quiz: QuizQuestion[];
  allConcepts: Concept[];
  onClose: () => void;
  onApplyRevisionHighlights: (revisionConceptIds: string[]) => void;
  onSelectConcept: (conceptId: string) => void;
  onStartGuidedRevision: (revisionConceptIds: string[], submittedAnswers: Record<string, number>) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  allConcepts,
  onClose,
  onApplyRevisionHighlights,
  onSelectConcept,
  onStartGuidedRevision,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);

  const currentQ = quiz[currentIdx];

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex,
    }));
  };

  const isComplete = Object.keys(selectedAnswers).length === quiz.length;

  const handleSubmit = () => {
    setIsSubmitted(true);
    const result = evaluateQuizSubmission(quiz, selectedAnswers, allConcepts);
    onApplyRevisionHighlights(result.revisionConceptIds);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    onApplyRevisionHighlights([]);
  };

  const result = isSubmitted
    ? evaluateQuizSubmission(quiz, selectedAnswers, allConcepts)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                {isSubmitted ? 'Knowledge Gap Assessment' : 'Diagnostic Concept Quiz'}
              </h2>
              <span className="text-xs text-slate-400 font-sans">
                5 grounded questions · Verifiable against study notes
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!isSubmitted ? (
            /* ACTIVE QUIZ QUESTIONS VIEW */
            <div className="space-y-6">
              {/* Stepper Progress */}
              <div className="space-y-2 font-sans">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium">Question {currentIdx + 1} of {quiz.length}</span>
                  <span className="font-mono text-cyan-400">{Math.round(((currentIdx + 1) / quiz.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="space-y-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded shrink-0 mt-0.5">
                    Q{currentIdx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug font-sans">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Option Buttons */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-sans transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-cyan-100 shadow-xs'
                            : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center font-bold border shrink-0 ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 font-sans">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 text-xs text-slate-300 font-medium flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentIdx < quiz.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(quiz.length - 1, prev + 1))}
                    disabled={selectedAnswers[currentQ.id] === undefined}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-xs font-semibold text-slate-950 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isComplete}
                    className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-xs font-semibold text-slate-950 flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit & View Revision Path</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* SUBMITTED QUIZ RESULTS & REVISION HIGHLIGHTS */
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-sans text-cyan-300">
                      {result?.score} / {result?.total}
                    </span>
                    <span className="text-sm text-slate-400">
                      ({result?.percentage}%)
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">
                    {result?.score === 5
                      ? 'Exceptional mastery across all core concepts!'
                      : result && result.score >= 3
                      ? 'Solid conceptual grasp with targeted areas for review.'
                      : 'Key foundational relationships need closer reinforcement.'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Revision Signal: Weak areas are now highlighted on the 3D map for targeted study.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                  {result && result.revisionPath.length > 0 && (
                    <button
                      onClick={() => {
                        onStartGuidedRevision(result.revisionPath.map((r) => r.conceptId), selectedAnswers);
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all font-sans"
                    >
                      <Compass className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>Start Guided Revision</span>
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-sans text-slate-300 flex items-center justify-center gap-1.5 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </div>

              {/* Personalized Revision Path */}
              {result && result.revisionPath.length > 0 && (
                <div className="space-y-3 font-sans">
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Recommended Revision Order ({result.revisionPath.length} Concepts)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {result.revisionPath.map((step, idx) => (
                      <div
                        key={step.conceptId}
                        onClick={() => {
                          onSelectConcept(step.conceptId);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 hover:border-red-400/60 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-red-300 transition-colors">
                              Focus: {step.conceptTitle}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {step.reason}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs font-medium text-red-400 flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                          <span>Review on map</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Breakdown Accordion */}
              <div className="space-y-3 font-sans">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Detailed Answers & Source Citations
                </h4>

                <div className="space-y-3">
                  {quiz.map((q, idx) => {
                    const selected = selectedAnswers[q.id];
                    const isCorrect = selected === q.correctAnswerIndex;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                          isCorrect
                            ? 'bg-emerald-950/15 border-emerald-500/30'
                            : 'bg-red-950/15 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold text-slate-100 font-sans text-xs sm:text-sm">
                                {idx + 1}. {q.question}
                              </span>
                              <div className="text-xs text-slate-400 mt-1 font-sans">
                                Your choice:{' '}
                                <strong className={isCorrect ? 'text-emerald-300' : 'text-red-300'}>
                                  {q.options[selected] || 'Unanswered'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded shrink-0">
                            {q.sourceReference}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="text-xs text-emerald-300 font-sans bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                            Correct Answer: <strong>{q.options[q.correctAnswerIndex]}</strong>
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1 font-sans">
                          <span className="text-cyan-400 block font-semibold text-[11px]">
                            Source Grounding:
                          </span>
                          <p className="leading-relaxed text-slate-300">{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
