import { Router, Request, Response } from 'express';
import { defaultLLMProvider } from './llm/provider.ts';
import { extractTextFromPdfBuffer } from './services/pdfExtractor.ts';
import { parseTextIntoParagraphs, verifyExcerptInNotes } from '../utils/citationVerifier.ts';
import { Concept, KnowledgeMap, Relationship } from '../types/index.ts';

export const apiRouter = Router();

// Health and provider status
apiRouter.get('/status', (req: Request, res: Response) => {
  const hasKey = defaultLLMProvider.isAvailable();
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    provider: defaultLLMProvider.name,
    message: hasKey
      ? 'Gemini LLM Provider is connected and ready.'
      : 'Gemini API Key is not configured. The Java OOP Demo is fully functional. Configure GEMINI_API_KEY to generate custom knowledge maps.',
  });
});

// Extract text from uploaded PDF
apiRouter.post('/extract-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const base64 = req.body?.base64;
    if (!Buffer.isBuffer(req.body) && (typeof base64 !== 'string' || !base64)) {
      res.status(400).json({ error: 'Missing base64 PDF payload' });
      return;
    }

    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(base64, 'base64');
    if (buffer.length > 4_200_000) {
      res.status(413).json({ error: 'PDF file exceeds the 4.2 MB live upload limit.' });
      return;
    }
    if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      res.status(400).json({ error: 'The uploaded file is not a readable PDF.' });
      return;
    }

    const result = await extractTextFromPdfBuffer(buffer);
    res.json(result);
  } catch (err: any) {
    console.error('PDF extraction error:', err);
    const status = err instanceof Error && err.message.startsWith('PDFs must contain 25 pages or fewer')
      ? 413
      : 500;
    res.status(status).json({
      error: `Failed to extract text from PDF: ${err.message || 'Corrupt or unreadable PDF'}`,
    });
  }
});

// Generate knowledge map from notes
apiRouter.post('/generate-map', async (req: Request, res: Response): Promise<void> => {
  try {
    const { notesText, customTitle, sourceType } = req.body;

    if (!notesText || typeof notesText !== 'string' || notesText.trim().length < 50) {
      res.status(400).json({
        error: 'Notes text is too short. Please provide at least 50 characters of study notes.',
      });
      return;
    }

    if (notesText.length > 40000) {
      res.status(400).json({
        error: 'Notes text exceeds the 40,000 character limit. Please trim the text or select a specific chapter.',
      });
      return;
    }

    if (!defaultLLMProvider.isAvailable()) {
      res.status(403).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Custom map generation requires an API key in .env or Settings > Secrets. You can explore the fully functional Java OOP Demo at any time.',
      });
      return;
    }

    const paragraphs = parseTextIntoParagraphs(notesText);
    const aiResult = await defaultLLMProvider.generateConceptMap(notesText, paragraphs);

    // Compute procedural 3D positions for concepts
    const totalConcepts = aiResult.concepts.length;
    const colors = ['#06b6d4', '#8b5cf6', '#38bdf8', '#a855f7', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899'];

    const conceptsWith3D: Concept[] = aiResult.concepts.map((c, i) => {
      // Golden spiral / circular ring distribution for visual aesthetics
      const angle = (i / totalConcepts) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.2);
      const radius = 3.2 + (i % 3) * 1.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = ((i % 3) - 1) * 0.8;

      // Verify source excerpt presence
      const verification = verifyExcerptInNotes(c.sourceExcerpt, notesText);

      return {
        id: c.id,
        title: c.title,
        briefExplanation: c.briefExplanation,
        beginnerExample: c.beginnerExample,
        sourceExcerpt: c.sourceExcerpt,
        sourceReference: c.sourceReference,
        isVerified: verification.isVerified,
        cluster: c.cluster || 'General',
        position: [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2)), parseFloat(z.toFixed(2))],
        color: colors[i % colors.length],
      };
    });

    const relationships: Relationship[] = aiResult.relationships.map((r, idx) => ({
      id: `rel-${idx + 1}`,
      sourceId: r.sourceId,
      targetId: r.targetId,
      label: r.label,
      explanation: r.explanation,
    }));

    const knowledgeMap: KnowledgeMap = {
      id: `map-${Date.now()}`,
      title: customTitle || aiResult.title || 'Generated Knowledge Map',
      description: aiResult.description,
      sourceType: sourceType === 'custom-pdf' ? 'custom-pdf' : 'custom-pasted',
      sourceTitle: customTitle,
      rawSourceNotes: notesText,
      paragraphs,
      concepts: conceptsWith3D,
      relationships,
      quiz: aiResult.quiz,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json(knowledgeMap);
  } catch (err: any) {
    console.error('Error in /api/generate-map:', err);
    const raw = String(err?.message || err || '');
    let friendly = 'An unexpected error occurred while analyzing notes. Please try again.';

    if (raw.includes('503') || raw.includes('overloaded') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
      friendly = 'The AI service is temporarily experiencing high demand (503). Your notes have been preserved—please click Generate again in a few moments.';
    } else if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
      friendly = 'The AI provider rate limit was temporarily reached (429). Please wait a moment and retry.';
    } else if (raw.includes('504') || raw.includes('DEADLINE_EXCEEDED') || raw.toLowerCase().includes('deadline')) {
      friendly = 'Gemini took too long to process these notes (504). Your notes are still here—please retry in a moment or try a shorter section.';
    } else if (raw.includes('GEMINI_API_KEY') || raw.includes('API Key is not configured')) {
      friendly = 'Gemini API Key is not configured. Add GEMINI_API_KEY in .env or Settings > Secrets to generate custom maps.';
    } else if (raw.startsWith('AI output validation failed:')) {
      friendly = 'Gemini returned an incomplete map for these notes. Your notes are preserved—retry once, or try a shorter section with clearer concept definitions.';
    } else {
      // Clean any raw json blocks from string
      const sanitized = raw.replace(/\{[\s\S]*"error"[\s\S]*\}/g, '').trim();
      if (sanitized && sanitized.length > 5) {
        friendly = sanitized;
      }
    }

    res.status(500).json({ error: friendly });
  }
});

// Multi-turn Gemini AI Tutor chat endpoint
apiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    if (message.length > 4000) {
      res.status(400).json({ error: 'Message exceeds 4,000 character limit.' });
      return;
    }

    const reply = await defaultLLMProvider.chatWithTutor(
      Array.isArray(history) ? history : [],
      message.trim(),
      context
    );

    res.json({ text: reply });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    const raw = String(err?.message || err || '');
    let friendly = 'The AI tutor encountered an issue generating a response. Please try again.';

    if (raw.includes('503') || raw.includes('overloaded') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
      friendly = 'The Gemini AI service is temporarily experiencing high traffic (503). Please try sending your message again in a moment.';
    } else if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
      friendly = 'The API rate limit was reached (429). Please wait a few seconds before asking another question.';
    } else if (raw.includes('504') || raw.includes('DEADLINE_EXCEEDED') || raw.toLowerCase().includes('deadline')) {
      friendly = 'Gemini took too long to respond. Your message was retried—please try again or shorten your question.';
    } else if (raw.includes('GEMINI_API_KEY')) {
      friendly = 'Gemini API Key is not configured. Please add GEMINI_API_KEY in your environment or Settings > Secrets.';
    }

    res.status(500).json({ error: friendly });
  }
});
