import React, { useState, useEffect, useRef } from 'react';
import { X, Search, BookOpen, MapPin, Copy, Check } from 'lucide-react';
import { KnowledgeMap } from '../../types';

interface SourceNotesModalProps {
  map: KnowledgeMap;
  targetRef?: string | null;
  onClose: () => void;
}

export const SourceNotesModal: React.FC<SourceNotesModalProps> = ({
  map,
  targetRef,
  onClose,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const targetElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (targetRef && targetElementRef.current) {
      targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetRef]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(map.rawSourceNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Source Document & Course Notes
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {map.sourceTitle || map.title} · {map.paragraphs.length} Structured Paragraphs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono flex items-center gap-1"
              title="Copy notes"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Search */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search within source notes..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        {/* Notes Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
          {map.paragraphs.map((para) => {
            const isTarget = targetRef && (para.ref === targetRef || para.ref.includes(targetRef));
            const isMatch = filterQuery.trim()
              ? para.text.toLowerCase().includes(filterQuery.toLowerCase())
              : true;

            if (!isMatch) return null;

            return (
              <div
                key={para.id}
                ref={isTarget ? targetElementRef : null}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isTarget
                    ? 'bg-violet-950/40 border-violet-400/80 ring-1 ring-violet-400/40'
                    : 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-400 mb-1.5">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{para.ref}</span>
                  {isTarget && (
                    <span className="ml-2 px-1.5 py-0.2 rounded bg-violet-500/30 text-violet-300 border border-violet-400/40 uppercase">
                      Current Concept Excerpt Source
                    </span>
                  )}
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
                  {para.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
