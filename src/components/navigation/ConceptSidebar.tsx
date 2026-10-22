import React, { useState } from 'react';
import { Search, X, CheckCircle, AlertCircle, BookOpen, Layers, HelpCircle, ChevronRight, Sparkles } from 'lucide-react';
import { Concept, KnowledgeMap } from '../../types';

interface ConceptSidebarProps {
  map: KnowledgeMap;
  selectedConceptId: string | null;
  onSelectConcept: (id: string) => void;
  onOpenQuiz: () => void;
  onOpenSourceNotes: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onClose?: () => void;
}

export const ConceptSidebar: React.FC<ConceptSidebarProps> = ({
  map,
  selectedConceptId,
  onSelectConcept,
  onOpenQuiz,
  onOpenSourceNotes,
  searchQuery,
  setSearchQuery,
  onClose,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');

  const clusters = ['all', ...Array.from(new Set(map.concepts.map((c) => c.cluster || 'General')))];

  const filtered = map.concepts.filter((c) => {
    if (selectedCluster !== 'all' && (c.cluster || 'General') !== selectedCluster) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.briefExplanation.toLowerCase().includes(q) ||
        c.cluster.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const revisionCount = map.concepts.filter((c) => c.needsRevision).length;

  return (
    <aside className="w-80 h-full bg-[#0a0f1d]/95 border-r border-slate-800/80 flex flex-col shrink-0 select-none backdrop-blur-md">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-semibold">Knowledge Graph</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {map.concepts.length} Concepts
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter concepts..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Cluster Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-sans">
          {clusters.map((cl) => (
            <button
              key={cl}
              onClick={() => setSelectedCluster(cl)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors capitalize text-xs ${
                selectedCluster === cl
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 font-medium'
              }`}
            >
              {cl}
            </button>
          ))}
        </div>
      </div>

      {/* Concept List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-sans">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-sans">
            No concepts match "{searchQuery}"
          </div>
        ) : (
          filtered.map((concept) => {
            const isSelected = concept.id === selectedConceptId;
            const isRevision = !!concept.needsRevision;

            return (
              <button
                key={concept.id}
                onClick={() => onSelectConcept(concept.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-xs'
                    : isRevision
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-400'
                    : 'bg-slate-900/40 border-transparent hover:bg-slate-900/80 hover:border-slate-800'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isRevision ? (
                      <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                    ) : concept.isVerified ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected
                          ? 'text-cyan-200'
                          : isRevision
                          ? 'text-red-300'
                          : 'text-slate-200 group-hover:text-slate-100'
                      }`}
                    >
                      {concept.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate font-sans">
                    <span>{concept.cluster}</span>
                    <span>·</span>
                    <span className="font-mono text-[10px]">{concept.sourceReference}</span>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform ${
                    isSelected ? 'translate-x-0.5 text-cyan-400' : ''
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2 text-xs font-sans">
        {revisionCount > 0 && (
          <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center justify-between text-red-300 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>{revisionCount} concept(s) need review</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenSourceNotes}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition-colors flex items-center justify-center gap-1.5 font-medium text-xs"
            title="Read Source Notes with paragraph anchors"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Source Notes</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs"
            title="Take 5-question grounded diagnostic quiz"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-950" />
            <span>Take Quiz</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
