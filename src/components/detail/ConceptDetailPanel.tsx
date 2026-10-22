import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  Code2,
  Sparkles,
  Link2,
  CheckSquare,
  Edit3,
} from 'lucide-react';
import { Concept, Relationship } from '../../types';

interface ConceptDetailPanelProps {
  concept: Concept;
  relationships: Relationship[];
  allConcepts: Concept[];
  onSelectConcept: (id: string) => void;
  onClose: () => void;
  onOpenSourceNotes: (targetRef?: string) => void;
  onToggleRevisionStatus: (conceptId: string) => void;
  onUpdateConcept: (updated: Concept) => void;
}

export const ConceptDetailPanel: React.FC<ConceptDetailPanelProps> = ({
  concept,
  relationships,
  allConcepts,
  onSelectConcept,
  onClose,
  onOpenSourceNotes,
  onToggleRevisionStatus,
  onUpdateConcept,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(concept.title);
  const [editExplanation, setEditExplanation] = useState(concept.briefExplanation);
  const [editExample, setEditExample] = useState(concept.beginnerExample);

  const conceptMap = new Map(allConcepts.map((c) => [c.id, c]));

  // Related connections
  const connectedRels = relationships.filter(
    (r) => r.sourceId === concept.id || r.targetId === concept.id
  );

  const handleCopyExample = () => {
    navigator.clipboard?.writeText(concept.beginnerExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConcept({
      ...concept,
      title: editTitle.trim() || concept.title,
      briefExplanation: editExplanation.trim() || concept.briefExplanation,
      beginnerExample: editExample.trim() || concept.beginnerExample,
    });
    setIsEditing(false);
  };

  return (
    <aside className="w-96 sm:w-[420px] h-full bg-[#0a0f1d]/95 border-l border-slate-800/80 flex flex-col shrink-0 select-none backdrop-blur-md z-30 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-mono text-[10px] uppercase tracking-wider">
              {concept.cluster}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {concept.sourceReference}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-tight">
            {concept.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Revision Flag & Review Status Banner */}
      {concept.needsRevision && (
        <div className="p-3 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-red-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Revision Signal: Missed in quiz</span>
          </div>
          <button
            onClick={() => onToggleRevisionStatus(concept.id)}
            className="px-2.5 py-1 rounded-md bg-red-900/60 hover:bg-red-800 text-red-200 text-[11px] font-mono border border-red-500/40 transition-colors"
          >
            {concept.reviewStatus === 'reviewed' ? 'Mark unreviewed' : 'Mark reviewed'}
          </button>
        </div>
      )}

      {/* Review & Retry Status Indicator (Separate from original quiz score) */}
      {concept.reviewStatus && concept.reviewStatus !== 'not_started' && (
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">Review Progress:</span>
          {concept.reviewStatus === 'retried_correct' && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Follow-up retry passed
            </span>
          )}
          {concept.reviewStatus === 'retried_incorrect' && (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Follow-up retry missed
            </span>
          )}
          {concept.reviewStatus === 'reviewed' && (
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-cyan-400" />
              Marked reviewed
            </span>
          )}
          {concept.reviewStatus === 'needs_revision' && !concept.needsRevision && (
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300">
              Needs revision
            </span>
          )}
        </div>
      )}

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-xs text-slate-300">
        {/* Source Excerpt Matched Banner */}
        <div
          className={`p-2.5 rounded-xl border flex items-center gap-2.5 font-mono text-[11px] ${
            concept.isVerified
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}
        >
          {concept.isVerified ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            {concept.isVerified
              ? 'Source excerpt matched: Verbatim text confirmed in your notes.'
              : 'Contextual synthesis: Key idea derived from surrounding text.'}
          </span>
        </div>

        {/* Section 1: AI-Generated Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] uppercase font-semibold">
                AI Explanation
              </span>
              <span className="text-slate-400">Concept Overview</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors text-[11px]"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2 pt-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
              />
              <textarea
                rows={3}
                value={editExplanation}
                onChange={(e) => setEditExplanation(e.target.value)}
                placeholder="Explanation"
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
              />
              <textarea
                rows={3}
                value={editExample}
                onChange={(e) => setEditExample(e.target.value)}
                placeholder="Example code"
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-xs"
              >
                Save Edits
              </button>
            </form>
          ) : (
            <p className="text-slate-200 text-sm leading-relaxed font-light">
              {concept.briefExplanation}
            </p>
          )}
        </div>

        {/* Section 2: AI-Generated Beginner Example */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] uppercase font-semibold">
                AI Example
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Code Walkthrough</span>
              </span>
            </span>
            <button
              onClick={handleCopyExample}
              className="hover:text-slate-200 flex items-center gap-1 transition-colors"
              title="Copy snippet"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-cyan-200 overflow-x-auto relative">
            <pre className="whitespace-pre-wrap leading-relaxed">{concept.beginnerExample}</pre>
          </div>
        </div>

        {/* Section 3: Exact Supporting Excerpt from Uploaded Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-violet-400">
              <span className="px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 text-[10px] uppercase font-semibold border border-violet-800/60">
                Notes Excerpt
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span>Original Study Notes</span>
              </span>
            </span>
            <span className="text-slate-500 font-mono">{concept.sourceReference}</span>
          </div>

          <div className="p-4 rounded-xl bg-violet-950/15 border border-violet-500/30 space-y-2.5">
            <blockquote className="text-slate-200 italic font-serif text-xs leading-relaxed border-l-2 border-violet-400 pl-3">
              "{concept.sourceExcerpt}"
            </blockquote>

            <div className="pt-2 border-t border-violet-900/40 flex items-center justify-between font-mono text-[11px]">
              <span className="text-violet-300">Reference: {concept.sourceReference}</span>
              <button
                onClick={() => onOpenSourceNotes(concept.sourceReference)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Read Full Context</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Related Concepts & Connections */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connected Topics ({connectedRels.length})</span>
            </span>
          </div>

          {connectedRels.length === 0 ? (
            <p className="text-slate-500 font-mono text-xs italic">
              No direct connections mapped for this concept.
            </p>
          ) : (
            <div className="space-y-2">
              {connectedRels.map((rel) => {
                const isOutbound = rel.sourceId === concept.id;
                const otherId = isOutbound ? rel.targetId : rel.sourceId;
                const otherConcept = conceptMap.get(otherId);
                if (!otherConcept) return null;

                return (
                  <div
                    key={rel.id}
                    onClick={() => onSelectConcept(otherId)}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] font-semibold uppercase">
                          {rel.label}
                        </span>
                        <span className="text-slate-100 font-bold group-hover:text-cyan-300 transition-colors">
                          {otherConcept.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-light leading-normal">
                      {rel.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
