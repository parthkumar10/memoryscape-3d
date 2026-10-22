/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { JAVA_OOP_DEMO_MAP } from './data/demoData';
import { Concept, Relationship, KnowledgeMap } from './types';
import { TopBar } from './components/navigation/TopBar';
import { ConceptSidebar } from './components/navigation/ConceptSidebar';
import { ConceptDetailPanel } from './components/detail/ConceptDetailPanel';
import { Knowledge3DCanvas } from './components/map/Knowledge3DCanvas';
import { Knowledge2DView } from './components/map/Knowledge2DView';
import { QuizModal } from './components/quiz/QuizModal';
import { GuidedRevisionModal } from './components/quiz/GuidedRevisionModal';
import { NotesInputModal } from './components/upload/NotesInputModal';
import { SourceNotesModal } from './components/notes/SourceNotesModal';
import { GeminiChatbot } from './components/chat/GeminiChatbot';
import { CheatSheetModal } from './components/export/CheatSheetModal';
import { AddConceptIslandModal } from './components/map/AddConceptIslandModal';
import { DemoWalkthroughBar } from './components/navigation/DemoWalkthroughBar';
import { Sparkles, Compass, Upload, CheckCircle2, BookOpen, Layers, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'memoryscape_current_map';

export default function App() {
  const [map, setMap] = useState<KnowledgeMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return JAVA_OOP_DEMO_MAP;
  });

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isGuidedRevisionOpen, setIsGuidedRevisionOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isAddIslandOpen, setIsAddIslandOpen] = useState(false);
  const [guidedRevisionConceptIds, setGuidedRevisionConceptIds] = useState<string[]>([]);
  const [quizAnswersForRevision, setQuizAnswersForRevision] = useState<Record<string, number>>({});
  const [isSourceNotesOpen, setIsSourceNotesOpen] = useState(false);
  const [targetNotesRef, setTargetNotesRef] = useState<string | null>(null);

  // Welcome modal banner for first-time onboarding
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(() => {
    return !localStorage.getItem('memoryscape_onboarded');
  });

  // Guided 5-Step Demo Walkthrough state
  const [demoStep, setDemoStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isDemoBarDismissed, setIsDemoBarDismissed] = useState(false);

  const [hasApiKey, setHasApiKey] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore quota
    }
  }, [map]);

  // Check backend server status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(!!data.hasGeminiKey);
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  const handleSelectConcept = (id: string) => {
    setSelectedConceptId(id);
    if (demoStep === 1) {
      setDemoStep(2);
    }
  };

  const handleApplyRevisionHighlights = (revisionIds: string[]) => {
    setMap((prev) => ({
      ...prev,
      concepts: prev.concepts.map((c) => {
        const needsRev = revisionIds.includes(c.id);
        return {
          ...c,
          needsRevision: needsRev,
          reviewStatus: needsRev
            ? c.reviewStatus && c.reviewStatus !== 'not_started'
              ? c.reviewStatus
              : 'needs_revision'
            : c.reviewStatus,
        };
      }),
    }));
    setDemoStep(5);
  };

  const handleOpenQuiz = () => {
    setIsQuizOpen(true);
    if (demoStep < 4) {
      setDemoStep(4);
    }
  };

  const handleToggleRevisionStatus = (conceptId: string) => {
    setMap((prev) => ({
      ...prev,
      concepts: prev.concepts.map((c) => {
        if (c.id !== conceptId) return c;
        const isReviewed = c.reviewStatus === 'reviewed';
        return {
          ...c,
          reviewStatus: isReviewed ? 'needs_revision' : 'reviewed',
        };
      }),
    }));
  };

  const handleRecordRetry = (conceptId: string, result: 'correct' | 'incorrect') => {
    setMap((prev) => ({
      ...prev,
      concepts: prev.concepts.map((c) => {
        if (c.id !== conceptId) return c;
        return {
          ...c,
          reviewStatus: result === 'correct' ? 'retried_correct' : 'retried_incorrect',
          retryResult: result,
        };
      }),
    }));
  };

  const handleStartGuidedRevision = (revisionIds: string[], answers: Record<string, number>) => {
    setGuidedRevisionConceptIds(revisionIds);
    setQuizAnswersForRevision(answers);
    setIsGuidedRevisionOpen(true);
  };

  const handleUpdateConcept = (updated: Concept) => {
    setMap((prev) => ({
      ...prev,
      concepts: prev.concepts.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleAddConcept = (newConcept: Concept, newRelationship?: Relationship) => {
    setMap((prev) => ({
      ...prev,
      concepts: [...prev.concepts, newConcept],
      relationships: newRelationship ? [...prev.relationships, newRelationship] : prev.relationships,
    }));
    setSelectedConceptId(newConcept.id);
  };

  const handleResetData = () => {
    if (window.confirm('Reset to default Java OOP Demo and clear custom map data?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('memoryscape_onboarded');
      setMap(JAVA_OOP_DEMO_MAP);
      setSelectedConceptId('inheritance');
      setResetTrigger((t) => t + 1);
    }
  };

  const handleOpenSourceNotes = (ref?: string) => {
    setTargetNotesRef(ref || null);
    setIsSourceNotesOpen(true);
    if (demoStep === 2) {
      setDemoStep(3);
    }
  };

  const selectedConcept = map.concepts.find((c) => c.id === selectedConceptId) || null;

  return (
    <div className="w-full h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header Bar (Shown in 2D List Mode; In 3D Mode, the floating controls bar on canvas provides the sleek full-screen view) */}
      {viewMode === '2d' && (
        <TopBar
          map={map}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onResetCamera={() => setResetTrigger((t) => t + 1)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenQuiz={handleOpenQuiz}
          onOpenSourceNotes={() => handleOpenSourceNotes()}
          onResetData={handleResetData}
          onLoadDemo={() => {
            setMap(JAVA_OOP_DEMO_MAP);
            setSelectedConceptId(null);
            setResetTrigger((t) => t + 1);
          }}
          hasApiKey={hasApiKey}
        />
      )}

      {/* Main Studio Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer Navigation Sidebar */}
        {isSidebarOpen && (
          <div className="absolute inset-y-0 left-0 z-40 shadow-2xl animate-in slide-in-from-left duration-200">
            <ConceptSidebar
              map={map}
              selectedConceptId={selectedConceptId}
              onSelectConcept={handleSelectConcept}
              onOpenQuiz={handleOpenQuiz}
              onOpenSourceNotes={() => handleOpenSourceNotes()}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        )}

        {/* Central Map Canvas Area */}
        <main className="flex-1 relative overflow-hidden bg-[#070b14]">
          {/* Guided 5-Step Demo Walkthrough Bar */}
          {!isDemoBarDismissed && (
            <div className="absolute top-28 left-0 right-0 z-30 pointer-events-none flex justify-center">
              <DemoWalkthroughBar
                currentStep={demoStep}
                selectedConceptTitle={selectedConcept?.title}
                revisionCount={map.concepts.filter((c) => c.needsRevision).length}
                onOpenSourceNotes={() => handleOpenSourceNotes(selectedConcept?.sourceReference)}
                onOpenQuiz={handleOpenQuiz}
                onSelectSampleConcept={() => handleSelectConcept('inheritance')}
                onDismiss={() => setIsDemoBarDismissed(true)}
              />
            </div>
          )}

          {viewMode === '3d' ? (
            <Knowledge3DCanvas
              concepts={map.concepts}
              relationships={map.relationships}
              selectedConceptId={selectedConceptId}
              onSelectConcept={handleSelectConcept}
              resetTrigger={resetTrigger}
              mapId={map.id}
              onOpenQuiz={handleOpenQuiz}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
              onOpenAddIsland={() => setIsAddIslandOpen(true)}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              isSidebarOpen={isSidebarOpen}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          ) : (
            <Knowledge2DView
              concepts={map.concepts}
              relationships={map.relationships}
              selectedConceptId={selectedConceptId}
              onSelectConcept={handleSelectConcept}
              searchQuery={searchQuery}
            />
          )}
        </main>

        {/* Right Concept Detail Inspector Panel */}
        {selectedConcept && (
          <ConceptDetailPanel
            concept={selectedConcept}
            relationships={map.relationships}
            allConcepts={map.concepts}
            onSelectConcept={handleSelectConcept}
            onClose={() => setSelectedConceptId(null)}
            onOpenSourceNotes={(ref) => handleOpenSourceNotes(ref)}
            onToggleRevisionStatus={handleToggleRevisionStatus}
            onUpdateConcept={handleUpdateConcept}
          />
        )}
      </div>

      {/* Onboarding Welcome Modal */}
      {showWelcomeBanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 sm:p-7 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
                <Compass className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  MEMORYSCAPE
                </h1>
                <p className="text-xs text-cyan-400 font-medium">
                  Interactive Concept Map & Active Revision
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100 leading-snug">
                Turn your notes into a map of what connects—and what to review next.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Explore linked concepts, check explanations against their sources, and take a short quiz to identify knowledge gaps.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Explore connected concepts on an interactive 3D map</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Verify explanations with verbatim source note citations</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Take a diagnostic quiz to reveal targeted revision priorities</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowWelcomeBanner(false);
                  localStorage.setItem('memoryscape_onboarded', 'true');
                  setSelectedConceptId('inheritance');
                  setDemoStep(2);
                }}
                className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Explore sample map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowWelcomeBanner(false);
                  localStorage.setItem('memoryscape_onboarded', 'true');
                  setIsUploadOpen(true);
                }}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload notes</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal border-t border-slate-800/80 pt-3">
              Sample map (Java OOP) works immediately offline without an API key. Uploading custom notes uses Google Gemini to generate linked concepts.
            </p>
          </div>
        </div>
      )}

      {/* Upload & PDF Modal */}
      {isUploadOpen && (
        <NotesInputModal
          onClose={() => setIsUploadOpen(false)}
          onMapGenerated={(newMap) => {
            setMap(newMap);
            setSelectedConceptId(newMap.concepts[0]?.id || null);
            setResetTrigger((t) => t + 1);
          }}
          hasApiKey={hasApiKey}
        />
      )}

      {/* Quiz Modal */}
      {isQuizOpen && (
        <QuizModal
          quiz={map.quiz}
          allConcepts={map.concepts}
          onClose={() => setIsQuizOpen(false)}
          onApplyRevisionHighlights={handleApplyRevisionHighlights}
          onSelectConcept={handleSelectConcept}
          onStartGuidedRevision={handleStartGuidedRevision}
        />
      )}

      {/* Guided Revision Modal */}
      {isGuidedRevisionOpen && (
        <GuidedRevisionModal
          revisionConceptIds={guidedRevisionConceptIds}
          quiz={map.quiz}
          submittedAnswers={quizAnswersForRevision}
          allConcepts={map.concepts}
          relationships={map.relationships}
          onClose={() => setIsGuidedRevisionOpen(false)}
          onSelectConceptOnMap={(cid) => {
            handleSelectConcept(cid);
          }}
          onRecordRetry={handleRecordRetry}
        />
      )}

      {/* Source Notes Modal */}
      {isSourceNotesOpen && (
        <SourceNotesModal
          map={map}
          targetRef={targetNotesRef}
          onClose={() => setIsSourceNotesOpen(false)}
        />
      )}

      {/* Exam Revision Cheat Sheet Modal */}
      {isCheatSheetOpen && (
        <CheatSheetModal
          map={map}
          onClose={() => setIsCheatSheetOpen(false)}
          onSelectConcept={handleSelectConcept}
        />
      )}

      {/* 3D Concept Island Synthesizer Modal */}
      {isAddIslandOpen && (
        <AddConceptIslandModal
          existingConcepts={map.concepts}
          onClose={() => setIsAddIslandOpen(false)}
          onAddConcept={handleAddConcept}
        />
      )}

      {/* Floating Gemini Socratic Tutor Dock */}
      <GeminiChatbot
        map={map}
        selectedConcept={selectedConcept}
        onSelectConcept={handleSelectConcept}
      />
    </div>
  );
}
