import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, X, Minimize2, Maximize2, RotateCcw, AlertCircle, Bot, User, Lightbulb, ChevronRight } from 'lucide-react';
import { Concept, KnowledgeMap } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  conceptTag?: string;
}

interface GeminiChatbotProps {
  map: KnowledgeMap;
  selectedConcept: Concept | null;
  onSelectConcept: (conceptId: string) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  map,
  selectedConcept,
  onSelectConcept,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'model',
        text: `Hello! I'm your **Gemini Socratic Tutor** for **${map.title}**.\n\nI can explain concepts, walk through prerequisite relationships, analyze your revision notes, or quiz you on specific ideas. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conceptTag: selectedConcept?.title,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build knowledge context payload
      const conceptsSummary = map.concepts
        .map((c) => `- ${c.title} (${c.id}): ${c.briefExplanation}`)
        .join('\n');

      const needsRevisionIds = map.concepts
        .filter((c) => c.needsRevision)
        .map((c) => c.title);

      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome-1') // skip local welcome message if desired
        .slice(-8)
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: {
            mapTitle: map.title,
            conceptsSummary,
            activeConcept: selectedConcept ? `${selectedConcept.title} (${selectedConcept.id})` : undefined,
            rawNotesSnippet: map.rawSourceNotes?.slice(0, 3000),
            needsRevision: needsRevisionIds,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to get tutor response.');
      }

      const botReply: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'I analyzed that concept. What would you like to explore next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'The AI service is unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. What topic or concept from **${map.title}** should we dive into next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMessage(null);
  };

  const quickPrompts = [
    selectedConcept
      ? `Explain "${selectedConcept.title}" and its prerequisites`
      : 'Explain the core foundation concepts',
    selectedConcept
      ? `Give me a quick application question on ${selectedConcept.title}`
      : 'What is the best study order for these notes?',
    'Why is this relationship important?',
  ];

  // Collapsed Floating Button (docked <= 15% footprint)
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-slate-100 shadow-xl shadow-cyan-950/40 hover:shadow-cyan-500/20 transition-all group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-medium text-cyan-200">
            Ask Gemini Tutor
          </span>
          {selectedConcept && (
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 max-w-[100px] truncate">
              {selectedConcept.title}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Floating Minimized Dock Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 shadow-xl text-xs font-mono text-slate-300">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Gemini Tutor ({messages.length} msgs)</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:text-cyan-400 transition-colors"
            title="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:text-rose-400 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded Floating Dock
  return (
    <div className="fixed bottom-5 right-5 z-40 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-100px)] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Gemini Socratic Tutor</span>
              <span className="text-[9px] font-mono font-normal px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                gemini-3.8-flash
              </span>
            </h3>
            {selectedConcept ? (
              <p className="text-[10px] font-mono text-slate-400 truncate max-w-[190px]">
                Focusing on: <span className="text-cyan-300">{selectedConcept.title}</span>
              </p>
            ) : (
              <p className="text-[10px] font-mono text-slate-400">
                Grounded in your study notes
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-xl px-3 py-2 leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                }`}
              >
                {/* Concept Focus Pill */}
                {m.conceptTag && isUser && (
                  <div className="text-[10px] font-mono text-cyan-950/80 mb-1 flex items-center gap-1">
                    <span>Re: {m.conceptTag}</span>
                  </div>
                )}

                {/* Formatted Text rendering with basic markdown-like blocks */}
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {m.text}
                </div>

                <div
                  className={`text-[9px] font-mono mt-1 ${
                    isUser ? 'text-slate-900/60 text-right' : 'text-slate-500 text-left'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center text-slate-400 text-xs font-mono">
            <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Reasoning over knowledge map...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-1.5 bg-slate-900/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Lightbulb className="w-3 h-3 text-cyan-400 shrink-0" />
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSendMessage(prompt)}
            className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 hover:text-cyan-300 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-cyan-500/60 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedConcept
                ? `Ask about ${selectedConcept.title}...`
                : 'Ask a question about your notes...'
            }
            className="w-full bg-transparent text-slate-200 text-xs focus:outline-none resize-none max-h-24 placeholder:text-slate-500 font-sans leading-relaxed"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold transition-colors shrink-0"
            title="Send (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
          <span>Enter to send · Shift+Enter newline</span>
          <span>{input.length}/4000</span>
        </div>
      </div>
    </div>
  );
};
