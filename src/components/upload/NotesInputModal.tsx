import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { KnowledgeMap } from '../../types';

interface NotesInputModalProps {
  onClose: () => void;
  onMapGenerated: (newMap: KnowledgeMap) => void;
  hasApiKey: boolean;
}

export const NotesInputModal: React.FC<NotesInputModalProps> = ({
  onClose,
  onMapGenerated,
  hasApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'pdf'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [extractedPdfData, setExtractedPdfData] = useState<{
    text: string;
    pageCount: number;
    isScanned: boolean;
    warning?: string;
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid .pdf file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    setPdfFile(file);
    setErrorMessage(null);
    setExtractedPdfData(null);
    setIsExtractingPdf(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== 'string') {
            reject(new Error('The selected PDF could not be read.'));
            return;
          }
          const payload = reader.result.split(',')[1];
          if (!payload) {
            reject(new Error('The selected PDF could not be read.'));
            return;
          }
          resolve(payload);
        };
        reader.onerror = () => reject(reader.error || new Error('Failed to read the selected PDF.'));
        reader.onabort = () => reject(new Error('Reading the selected PDF was cancelled.'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, filename: file.name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract text from PDF');
      }

      setExtractedPdfData({
        text: data.fullText,
        pageCount: data.pageCount,
        isScanned: data.isScanned,
        warning: data.warning,
      });
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.pdf$/i, ''));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error processing PDF');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleGenerate = async () => {
    setErrorMessage(null);
    const sourceText = activeTab === 'paste' ? pastedText : extractedPdfData?.text || '';

    if (!sourceText || sourceText.trim().length < 50) {
      setErrorMessage('Please provide at least 50 characters of lecture or study notes.');
      return;
    }

    if (sourceText.length > 40000) {
      setErrorMessage('Notes exceed the 40,000 character limit. Please shorten or upload chapter by chapter.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing study notes structure...');

    try {
      setTimeout(() => setGenerationStep('Extracting core concepts and source citations...'), 1200);
      setTimeout(() => setGenerationStep('Mapping relationships and generating diagnostic quiz...'), 2800);

      const res = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: sourceText,
          customTitle: customTitle.trim() || undefined,
          sourceType: activeTab === 'pdf' ? 'custom-pdf' : 'custom-pasted',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate knowledge map');
      }

      onMapGenerated(data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  const activeCharCount = activeTab === 'paste' ? pastedText.length : extractedPdfData?.text.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                Generate Knowledge Map
              </h2>
              <span className="text-xs text-slate-400 font-sans">
                Transform study notes into an interactive concept map with grounded citations
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* API Key Warning if missing */}
          {!hasApiKey && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200 font-sans">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-semibold">Gemini API Key Required for Custom Notes</strong>
                <span className="text-amber-200/90 leading-relaxed">
                  Generating a map from your own notes requires a Gemini API key. Add <code className="font-mono bg-amber-950 px-1 py-0.5 rounded text-amber-300">GEMINI_API_KEY</code> to your environment file. Meanwhile, the complete Java OOP sample map is fully interactive without an API key.
                </span>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 font-sans">
              Map Title (Optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Operating Systems: Concurrency & Deadlocks"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-sans">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'paste'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Study Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'pdf'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Text PDF</span>
            </button>
          </div>

          {/* Tab 1: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste lecture transcript, course outline, textbook chapters, or summary notes here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 font-mono leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
                <span className="font-mono text-[11px]">{pastedText.length.toLocaleString()} / 40,000 characters</span>
                <button
                  type="button"
                  onClick={() => {
                    setPastedText(
                      `Operating Systems: Concurrency & Deadlocks\n\n[Page 1, ¶1]\nA Process is an executing program instance with its own private address space, stack pointer, and program counter. Threads are lightweight execution paths within the same process that share heap memory and file descriptors.\n\n[Page 1, ¶2]\nA Race Condition arises when multiple concurrent threads access shared state without mutual exclusion, causing the final output to depend on arbitrary execution order.\n\n[Page 1, ¶3]\nA Mutex (Mutual Exclusion lock) guarantees that only one thread can execute a critical section at any given time, preventing race conditions.\n\n[Page 2, ¶1]\nDeadlock occurs when two or more threads are permanently blocked, each holding a lock that the other thread requires to proceed. Coffman's four conditions for deadlock are mutual exclusion, hold and wait, no preemption, and circular wait.`
                    );
                    if (!customTitle) setCustomTitle('Operating Systems: Concurrency');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  Load Sample Notes
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Upload PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 group font-sans"
              >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-semibold text-slate-200">
                  {pdfFile ? pdfFile.name : 'Click to select or drop a text-based PDF'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports digital PDFs with selectable text (up to 10MB, max 25 pages)
                </p>
              </div>

              {isExtractingPdf && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-cyan-300 font-sans">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Extracting text & preserving source references...</span>
                </div>
              )}

              {extractedPdfData && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                    <span>Pages Read: {extractedPdfData.pageCount}</span>
                    <span>Characters: {extractedPdfData.text.length.toLocaleString()}</span>
                  </div>

                  {extractedPdfData.isScanned && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{extractedPdfData.warning}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400 font-sans">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300 block font-semibold">Privacy & Grounding Note</strong>
              <span className="leading-relaxed">
                Your notes are only transmitted when generating the map. All concept explanations link directly back to your source text to prevent AI hallucinations.
              </span>
            </div>
          </div>

          {/* Error Message with Preserved Input Notice and Direct Retry */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-sans space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-red-300 block">Generation Interrupted</span>
                  <p className="text-xs text-red-200 leading-relaxed">{errorMessage}</p>
                  <p className="text-[11px] text-slate-400">
                    ✓ Your notes and title above remain intact and were not lost.
                  </p>
                </div>
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Retry Generation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between gap-3 font-sans">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || activeCharCount < 50}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{generationStep || 'Generating Map...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate Knowledge Map</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
