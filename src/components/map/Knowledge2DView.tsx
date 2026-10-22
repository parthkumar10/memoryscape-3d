import React from 'react';
import { Concept, Relationship } from '../../types';
import { AlertCircle, ArrowRight, CheckCircle2, Link2, Sparkles } from 'lucide-react';

interface Knowledge2DViewProps {
  concepts: Concept[];
  relationships: Relationship[];
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  searchQuery: string;
}

export const Knowledge2DView: React.FC<Knowledge2DViewProps> = ({
  concepts,
  relationships,
  selectedConceptId,
  onSelectConcept,
  searchQuery,
}) => {
  // Group concepts by cluster
  const clusters = Array.from(new Set(concepts.map((c) => c.cluster || 'General')));

  const filteredConcepts = concepts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.briefExplanation.toLowerCase().includes(q) ||
      c.cluster.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>2D Concept Matrix & Relationship Directory</span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              Accessible View
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured conceptual breakdown optimized for keyboard navigation, mobile devices, and screen readers.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {filteredConcepts.length} Concepts
        </span>
      </div>

      <div className="space-y-6">
        {clusters.map((cluster) => {
          const clusterConcepts = filteredConcepts.filter((c) => (c.cluster || 'General') === cluster);
          if (clusterConcepts.length === 0) return null;

          return (
            <div key={cluster} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-sans">
                  {cluster}
                </h3>
                <span className="text-xs text-slate-400 font-sans">
                  ({clusterConcepts.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {clusterConcepts.map((concept) => {
                  const isSelected = concept.id === selectedConceptId;
                  const isRevision = !!concept.needsRevision;

                  // Find connected relationships
                  const connectedRels = relationships.filter(
                    (r) => r.sourceId === concept.id || r.targetId === concept.id
                  );

                  return (
                    <div
                      key={concept.id}
                      onClick={() => onSelectConcept(concept.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-500/30'
                          : isRevision
                          ? 'bg-red-950/20 border-red-500/50 hover:border-red-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {concept.title}
                          </h4>

                          <div className="flex items-center gap-1.5">
                            {isRevision && (
                              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Needs Review</span>
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">
                              {concept.sourceReference}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {concept.briefExplanation}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{connectedRels.length} Connections</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform">
                          <span>Inspect Concept</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
