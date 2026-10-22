import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Compass,
  BookOpen,
  Link2,
  Sparkles,
  HelpCircle,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Concept, Relationship, QuizQuestion, FollowUpQuestion } from '../../types';
import { findJustifiedPrerequisite, findRelevantConnection } from '../../utils/prerequisiteGraph';
import { JAVA_OOP_FOLLOW_UP_QUESTIONS } from '../../data/demoData';

interface GuidedRevisionModalProps {
  revisionConceptIds: string[];
  quiz: QuizQuestion[];
  submittedAnswers: Record<string, number>;
  allConcepts: Concept[];
  relationships: Relationship[];
  onClose: () => void;
  onSelectConceptOnMap: (conceptId: string) => void;
  onRecordRetry: (conceptId: string, result: 'correct' | 'incorrect') => void;
}

export const GuidedRevisionModal: React.FC<GuidedRevisionModalProps> = ({
  revisionConceptIds,
  quiz,
  submittedAnswers,
  allConcepts,
  relationships,
  onClose,
  onSelectConceptOnMap,
  onRecordRetry,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedFollowUpOption, setSelectedFollowUpOption] = useState<number | null>(null);
  const [retrySubmitted, setRetrySubmitted] = useState<Record<string, { selected: number; isCorrect: boolean }>>({});

  const conceptMap = new Map(allConcepts.map((c) => [c.id, c]));
  const currentConceptId = revisionConceptIds[currentStepIndex];
  const currentConcept = conceptMap.get(currentConceptId);

  // If no revision concepts or concept not found, early return
  if (!currentConcept || revisionConceptIds.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-100">No Revision Topics Pending</h3>
          <p className="text-xs text-slate-400">
            All concepts in this quiz were answered correctly, or no topics need immediate revision.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Find missed question(s) that linked to this concept
  const relatedMissedQuestions = quiz.filter(
    (q) =>
      q.linkedConceptIds.includes(currentConceptId) &&
      submittedAnswers[q.id] !== undefined &&
      submittedAnswers[q.id] !== q.correctAnswerIndex
  );

  // 1. Explain relevant connection
  const relevantConnection = findRelevantConnection(currentConceptId, allConcepts, relationships);

  // 2. Review justified prerequisite (directionally validated, cycle-free)
  const justifiedPrereq = findJustifiedPrerequisite(currentConceptId, allConcepts, relationships);

  // 3. Obtain follow-up application question
  const followUpQuestion: FollowUpQuestion =
    JAVA_OOP_FOLLOW_UP_QUESTIONS[currentConceptId] || {
      id: `fu-${currentConceptId}`,
      conceptId: currentConceptId,
      scenario: `In a production application implementing ${currentConcept.title}:`,
      question: `Which implementation choice most accurately adheres to the principles of ${currentConcept.title} documented in your notes?`,
      options: [
        `Directly applying ${currentConcept.title} in accordance with: "${currentConcept.sourceExcerpt.slice(0, 90)}..."`,
        `Bypassing ${currentConcept.title} in favor of global unstructured variables.`,
        `Reversing the architectural hierarchy and removing validation barriers.`,
        `Discarding the source contract and ignoring method signatures.`,
      ],
      correctAnswerIndex: 0,
      explanation: `From ${currentConcept.sourceReference}: ${currentConcept.briefExplanation}`,
      sourceReference: currentConcept.sourceReference,
    };

  const currentRetry = retrySubmitted[currentConceptId];
  const isAnswered = currentRetry !== undefined;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedFollowUpOption(idx);
  };

  const handleSubmitRetry = () => {
    if (selectedFollowUpOption === null) return;
    const isCorrect = selectedFollowUpOption === followUpQuestion.correctAnswerIndex;
    setRetrySubmitted((prev) => ({
      ...prev,
      [currentConceptId]: {
        selected: selectedFollowUpOption,
        isCorrect,
      },
    }));
    onRecordRetry(currentConceptId, isCorrect ? 'correct' : 'incorrect');
  };

  const handleNextStep = () => {
    if (currentStepIndex < revisionConceptIds.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedFollowUpOption(null);
    } else {
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setSelectedFollowUpOption(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  Guided Revision Pathway
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                  Step {currentStepIndex + 1} of {revisionConceptIds.length}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Reinforce Gaps · Foundation · Source Grounding · Application Retry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectConceptOnMap(currentConceptId)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
              title="Highlight this concept on the map"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Highlight on Map</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / revisionConceptIds.length) * 100}%` }}
          />
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-300 font-sans">
          {/* Target Concept Title & Tag */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-400">
                Focus Concept: {currentConcept.cluster}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-sans">
                {currentConcept.title}
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Ref: {currentConcept.sourceReference}
            </span>
          </div>

          {/* 1. Missed Question Context (if available) */}
          {relatedMissedQuestions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2 font-sans">
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Missed In Diagnostic Quiz:</span>
              </div>
              <p className="text-slate-200 text-xs font-medium">
                "{relatedMissedQuestions[0].question}"
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs">
                <div className="flex-1 p-2 rounded bg-red-950/40 border border-red-800/40 text-red-300">
                  Your Choice:{' '}
                  <strong>
                    {relatedMissedQuestions[0].options[submittedAnswers[relatedMissedQuestions[0].id]] || 'None'}
                  </strong>
                </div>
                <div className="flex-1 p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                  Correct Answer:{' '}
                  <strong>
                    {relatedMissedQuestions[0].options[relatedMissedQuestions[0].correctAnswerIndex]}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* 2. Explain Relevant Connection */}
          {relevantConnection && (
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-2 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 flex items-center gap-1.5 font-semibold">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Key Conceptual Pathway</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] uppercase font-bold">
                  {relevantConnection.relationship.label}
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                <strong>{currentConcept.title}</strong> is linked to{' '}
                <strong className="text-cyan-300">{relevantConnection.connectedConcept.title}</strong>:{' '}
                {relevantConnection.explanation}
              </p>
            </div>
          )}

          {/* 3. Review Justified Prerequisite (Strict Direction & Cycle Free) */}
          <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2 font-sans">
            <div className="flex items-center justify-between text-xs">
              <span className="text-violet-300 flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prerequisite Validation</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                Directionally Verified
              </span>
            </div>

            {justifiedPrereq ? (
              <div className="space-y-2">
                <p className="text-slate-200 leading-relaxed text-xs">
                  <span className="text-violet-400 font-semibold">
                    Foundational Prerequisite:
                  </span>{' '}
                  <strong className="text-slate-100">{justifiedPrereq.prerequisiteConcept.title}</strong>
                </p>
                <p className="text-xs text-slate-300 italic bg-violet-950/40 p-2.5 rounded-lg border-l-2 border-violet-400">
                  "{justifiedPrereq.rationale}"
                </p>
                <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">Prerequisite Reference: {justifiedPrereq.prerequisiteConcept.sourceReference}</span>
                  <button
                    onClick={() => onSelectConceptOnMap(justifiedPrereq.prerequisiteConcept.id)}
                    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    View Prerequisite
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 leading-relaxed">
                No upstream prerequisite constraint required for this concept. It is foundational or directly self-contained in your study notes.
              </p>
            )}
          </div>

          {/* 4. Show Exact Notes Source Excerpt */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Notes Excerpt Matched</span>
              </span>
              <span className="text-cyan-400 font-mono text-[10px]">
                {currentConcept.sourceReference}
              </span>
            </div>
            <blockquote className="text-slate-200 italic font-serif text-xs leading-relaxed border-l-2 border-cyan-400 pl-3">
              "{currentConcept.sourceExcerpt}"
            </blockquote>
          </div>

          {/* 5. New Application Follow-Up Question */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-300 flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Knowledge Check Retry</span>
              </span>
              {isAnswered && (
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                    currentRetry.isCorrect
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : 'bg-amber-950 text-amber-300 border border-amber-600'
                  }`}
                >
                  {currentRetry.isCorrect ? 'Retry Passed' : 'Retry Missed'}
                </span>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-sans">
              <span className="text-cyan-400 block text-[11px] font-semibold mb-1">
                Scenario:
              </span>
              <p className="leading-relaxed">{followUpQuestion.scenario}</p>
            </div>

            <h4 className="text-xs sm:text-sm font-semibold text-slate-100 font-sans">
              {followUpQuestion.question}
            </h4>

            {/* Options */}
            <div className="space-y-2 pt-1 font-sans">
              {followUpQuestion.options.map((option, optIdx) => {
                const isSelected = isAnswered
                  ? currentRetry.selected === optIdx
                  : selectedFollowUpOption === optIdx;
                const isCorrectOption = optIdx === followUpQuestion.correctAnswerIndex;

                let cardStyle =
                  'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';

                if (isAnswered) {
                  if (isCorrectOption) {
                    cardStyle = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200';
                  } else if (isSelected && !currentRetry.isCorrect) {
                    cardStyle = 'bg-red-950/30 border-red-500/60 text-red-200';
                  } else {
                    cardStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-100';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 font-sans ${cardStyle}`}
                  >
                    <span
                      className={`w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center font-bold border shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit Follow-up Button or Explanation */}
            {!isAnswered ? (
              <div className="pt-2 flex justify-end font-sans">
                <button
                  type="button"
                  onClick={handleSubmitRetry}
                  disabled={selectedFollowUpOption === null}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold text-xs transition-colors shadow-md font-sans"
                >
                  Verify Answer
                </button>
              </div>
            ) : (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 animate-in fade-in font-sans ${
                  currentRetry.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {currentRetry.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Concept reinforced successfully.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Review the source excerpt above carefully.</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {followUpQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60 font-sans">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 text-xs flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Topic</span>
          </button>

          <div className="text-xs text-slate-400 hidden sm:block font-medium">
            {Object.keys(retrySubmitted).length} of {revisionConceptIds.length} Retries Completed
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <span>
              {currentStepIndex < revisionConceptIds.length - 1
                ? 'Next Revision Topic'
                : 'Complete Revision'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
