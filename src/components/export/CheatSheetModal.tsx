import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { KnowledgeMap, Concept } from '../../types';
import { sfx } from '../../utils/soundEffects';

interface CheatSheetModalProps {
  map: KnowledgeMap;
  onClose: () => void;
  onSelectConcept?: (id: string) => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({
  map,
  onClose,
  onSelectConcept,
}) => {
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');

  const clusters = useMemo(() => {
    const list = Array.from(new Set(map.concepts.map((c) => c.cluster)));
    return ['all', ...list];
  }, [map.concepts]);

  const masteredCount = useMemo(() => {
    return map.concepts.filter((c) => c.reviewStatus === 'reviewed').length;
  }, [map.concepts]);

  const revisionCount = useMemo(() => {
    return map.concepts.filter(
      (c) => c.needsRevision || c.reviewStatus === 'needs_revision'
    ).length;
  }, [map.concepts]);

  const readinessScore = useMemo(() => {
    if (map.concepts.length === 0) return 0;
    return Math.round((masteredCount / map.concepts.length) * 100);
  }, [masteredCount, map.concepts.length]);

  const filteredConcepts = useMemo(() => {
    return map.concepts.filter((c) => {
      const matchesCluster = selectedCluster === 'all' || c.cluster === selectedCluster;
      const matchesQuery =
        filterQuery.trim() === '' ||
        c.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        c.briefExplanation.toLowerCase().includes(filterQuery.toLowerCase());
      return matchesCluster && matchesQuery;
    });
  }, [map.concepts, selectedCluster, filterQuery]);

  // Markdown representation generator
  const markdownText = useMemo(() => {
    let md = `# ${map.title} — Exam Revision Cheat Sheet\n`;
    md += `*Generated from 3D Knowledge Map on ${new Date().toLocaleDateString()}*\n\n`;
    md += `> **Readiness Score:** ${readinessScore}% (${masteredCount}/${map.concepts.length} concepts mastered)\n\n`;

    md += `## 1. Quick Concept Directory\n\n`;
    map.concepts.forEach((c) => {
      const statusIcon = c.reviewStatus === 'reviewed' ? '✅ Mastered' : c.needsRevision ? '⚠️ Needs Revision' : '⏳ Pending';
      md += `- **${c.title}** (${c.cluster}) — *${statusIcon}*: ${c.briefExplanation}\n`;
    });

    md += `\n## 2. In-Depth Concepts & Examples\n\n`;
    map.concepts.forEach((c) => {
      md += `### ${c.title}\n`;
      md += `**Cluster:** \`${c.cluster}\` | **Source Citation:** \`${c.sourceReference}\`\n\n`;
      md += `${c.briefExplanation}\n\n`;
      if (c.beginnerExample) {
        md += `\`\`\`java\n${c.beginnerExample}\n\`\`\`\n\n`;
      }
      if (c.sourceExcerpt) {
        md += `> "${c.sourceExcerpt}"\n\n`;
      }
    });

    md += `## 3. Directional Relationships & Architecture\n\n`;
    map.relationships.forEach((r) => {
      const s = map.concepts.find((c) => c.id === r.sourceId)?.title || r.sourceId;
      const t = map.concepts.find((c) => c.id === r.targetId)?.title || r.targetId;
      md += `- **${s}** ──[${r.label.toUpperCase()}]──▶ **${t}**: ${r.explanation}\n`;
    });

    return md;
  }, [map, readinessScore, masteredCount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    sfx.playSuccessChime();
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${map.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cheat-sheet.md`;
    link.click();
    URL.revokeObjectURL(url);
    sfx.playSuccessChime();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <FileText className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Exam Revision Cheat Sheet
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                  {map.concepts.length} Concepts
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">
                {map.title} · Instant Summary & Printable Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-all active:scale-95"
              title="Copy formatted Markdown to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="Download Markdown (.md) File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
              title="Close Cheat Sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Exam Readiness & Metrics Strip */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Exam Readiness:</span>
              <span
                className={`font-bold ${
                  readinessScore >= 80
                    ? 'text-emerald-400'
                    : readinessScore >= 50
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              >
                {readinessScore}%
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-semibold">{masteredCount} Mastered</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-rose-300 font-semibold">{revisionCount} Need Revision</span>
            </div>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter concepts..."
                className="pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {clusters.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Clusters' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Concept Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConcepts.map((concept) => {
              const isMastered = concept.reviewStatus === 'reviewed';
              const isRevision = concept.needsRevision || concept.reviewStatus === 'needs_revision';
              return (
                <div
                  key={concept.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                          {concept.cluster}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 font-sans mt-0.5">
                          {concept.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                          isMastered
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                            : isRevision
                            ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isMastered ? 'Mastered' : isRevision ? 'Needs Revision' : 'Unexplored'}
                      </span>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 font-light">
                      {concept.briefExplanation}
                    </p>

                    {/* Code Snippet if present */}
                    {concept.beginnerExample && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-cyan-200 overflow-x-auto">
                        <pre className="whitespace-pre">{concept.beginnerExample}</pre>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Citation & Jump */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Ref: {concept.sourceReference}</span>
                    {onSelectConcept && (
                      <button
                        onClick={() => {
                          onSelectConcept(concept.id);
                          onClose();
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>Fly to 3D Island</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture & Relationships Section */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Directional Relationship Architecture</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {map.relationships.map((rel) => {
                const s = map.concepts.find((c) => c.id === rel.sourceId)?.title || rel.sourceId;
                const t = map.concepts.find((c) => c.id === rel.targetId)?.title || rel.targetId;
                return (
                  <div
                    key={rel.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-850 flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-100">{s}</span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-[10px] uppercase">
                        {rel.label}
                      </span>
                      <span className="text-slate-500">➔</span>
                      <span className="font-bold text-slate-100">{t}</span>
                    </div>
                    {rel.explanation && (
                      <p className="text-[11px] text-slate-400 font-sans">{rel.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <span>Tip: Click &quot;Download .md&quot; to save for offline Obsidian or Notion study.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
