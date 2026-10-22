import React from 'react';
import {
  Brain,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  List,
  Upload,
  BookOpen,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Maximize2,
} from 'lucide-react';
import { KnowledgeMap } from '../../types';

interface TopBarProps {
  map: KnowledgeMap;
  viewMode: '3d' | '2d';
  setViewMode: (mode: '3d' | '2d') => void;
  onResetCamera: () => void;
  onOpenUpload: () => void;
  onOpenQuiz: () => void;
  onOpenSourceNotes: () => void;
  onResetData: () => void;
  onLoadDemo: () => void;
  hasApiKey: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  map,
  viewMode,
  setViewMode,
  onResetCamera,
  onOpenUpload,
  onOpenQuiz,
  onOpenSourceNotes,
  onResetData,
  onLoadDemo,
  hasApiKey,
}) => {
  const revisionCount = map.concepts.filter((c) => c.needsRevision).length;

  return (
    <header className="h-14 bg-[#070b14]/90 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-40 backdrop-blur-md">
      {/* Zone 1: Wordmark & Active Map Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          onClick={onLoadDemo}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          title="Return to default Java OOP Demo"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors hidden xs:inline">
            MEMORYSCAPE
          </span>
        </div>

        {/* Active Map Title Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-sans text-slate-300 max-w-sm truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span className="truncate font-medium">{map.title}</span>
          {map.sourceType === 'demo' ? (
            <span className="ml-1 text-[10px] text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded uppercase font-semibold shrink-0">
              Offline Demo
            </span>
          ) : (
            <span className="ml-1 text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded uppercase font-semibold shrink-0">
              Custom Notes
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: View Controls & Quiz */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 3D vs 2D Toggle */}
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-sans">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
            title="Interactive 3D Knowledge Map"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Map</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === '2d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
            title="Accessible 2D List Matrix"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2D List</span>
          </button>
        </div>

        {/* Zoom to Fit / Reset Camera Button (in 3D mode) */}
        {viewMode === '3d' && (
          <button
            onClick={onResetCamera}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Zoom to Fit — Frame all concepts (F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Zoom to Fit</span>
          </button>
        )}

        {/* Take Quiz Trigger */}
        <button
          onClick={onOpenQuiz}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            revisionCount > 0
              ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
              : 'bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-800'
          }`}
          title="Take 5-question grounded diagnostic quiz"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Quiz</span>
          {revisionCount > 0 ? (
            <span className="w-4 h-4 rounded-full bg-red-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
              {revisionCount}
            </span>
          ) : (
            <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">
              (5 Qs)
            </span>
          )}
        </button>
      </div>

      {/* Zone 3: Add Notes & Data Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-sans flex items-center gap-1.5 transition-colors shadow-sm active:scale-98"
          title="Paste study notes or upload text-based PDF"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Upload notes</span>
          <span className="xs:hidden">Upload</span>
        </button>

        {/* Reset / Clear Data */}
        <button
          onClick={onResetData}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
          title="Reset to default Java OOP demo and clear local storage"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
