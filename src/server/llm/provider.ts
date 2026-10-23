import { GoogleGenAI, Type } from '@google/genai';
import { AIGeneratedMap, AIGeneratedMapSchema, SourceParagraph } from '../../types/index.ts';

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateConceptMap(notesText: string, paragraphs: SourceParagraph[]): Promise<AIGeneratedMap>;
  chatWithTutor(
    history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
    message: string,
    context?: {
      mapTitle?: string;
      conceptsSummary?: string;
      activeConcept?: string;
      rawNotesSnippet?: string;
      needsRevision?: string[];
    }
  ): Promise<string>;
}

export class GeminiLLMProvider implements LLMProvider {
  name = 'Google Gemini (gemini-3.8-flash)';
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.getAi();
  }

  private getAi(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!this.ai) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          timeout: 45000,
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.ai;
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY && !!this.getAi();
  }

  async generateConceptMap(notesText: string, paragraphs: SourceParagraph[]): Promise<AIGeneratedMap> {
    const client = this.getAi();
    if (!client || !process.env.GEMINI_API_KEY) {
      throw new Error(
        'Gemini API Key is not configured. Please add GEMINI_API_KEY to your environment or Settings > Secrets to generate custom knowledge maps.'
      );
    }

    const paragraphsList = paragraphs
      .slice(0, 30) // limit for context safety
      .map((p) => `[${p.ref}]\n${p.text}`)
      .join('\n\n');

    const prompt = `You are MEMORYSCAPE, an expert educational knowledge graph and pedagogy engine.
Your task is to analyze the student's study notes below and produce a structured knowledge map.

STUDENT NOTES:
"""
${notesText.slice(0, 15000)}
"""

SOURCE PARAGRAPH MAPPINGS:
"""
${paragraphsList.slice(0, 15000)}
"""

CRITICAL INSTRUCTIONS:
1. Extract 8 to 12 central, essential concepts from the notes.
2. For each concept:
   - "id": kebab-case identifier (e.g. "binary-search", "mitosis")
   - "title": human-friendly concept title
   - "briefExplanation": clear 2-3 sentence explanation grounded in the notes
   - "beginnerExample": concrete code example or intuitive real-world analogy
   - "sourceExcerpt": an EXACT, verbatim quotation from the notes that substantiates this concept. DO NOT alter or paraphrase this quotation, as it will be checked with string-matching.
   - "sourceReference": the page or paragraph where this excerpt appears (e.g. "Page 1, ¶2" or "Notes ¶3").
   - "cluster": general thematic cluster name (e.g. "Foundations", "Control Flow")
3. Connect related concepts with directional relationships:
   - "sourceId" and "targetId" must match extracted concept IDs.
   - "label": meaningful educational verbs like "extends", "implements", "contains", "instantiates", "prerequisite", "alternative", "enables".
   - "explanation": 1 sentence explaining the pedagogical link.
4. Generate EXACTLY 5 diagnostic multiple-choice quiz questions strictly grounded in the notes:
   - Each question must have 4 options.
   - Distribute the correct answer index across 0, 1, 2, and 3. DO NOT make all answers the same option.
   - Include plausible distractors and scenario/application questions.
   - "correctAnswerIndex": integer 0-3.
   - "explanation": rationale citing specific facts from the notes.
   - "sourceReference": reference to the notes paragraph.
   - "linkedConceptIds": array of 1-3 concept IDs tested by this question.
5. Include only relationships that are clearly supported by the notes. Return as many as the notes support; do not invent links just to reach a count.

OUTPUT FORMAT: Return raw JSON adhering to the specified schema.`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

    const callModelWithRetry = async () => {
      const maxRetries = 3;
      let attempt = 0;

      while (true) {
        attempt++;
        const targetModel = candidateModels[(attempt - 1) % candidateModels.length];
        try {
          const response = await client.models.generateContent({
            model: targetModel,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  concepts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        briefExplanation: { type: Type.STRING },
                        beginnerExample: { type: Type.STRING },
                        sourceExcerpt: { type: Type.STRING },
                        sourceReference: { type: Type.STRING },
                        cluster: { type: Type.STRING },
                      },
                      required: ['id', 'title', 'briefExplanation', 'beginnerExample', 'sourceExcerpt', 'sourceReference'],
                    },
                  },
                  relationships: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sourceId: { type: Type.STRING },
                        targetId: { type: Type.STRING },
                        label: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                      },
                      required: ['sourceId', 'targetId', 'label', 'explanation'],
                    },
                  },
                  quiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        correctAnswerIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        sourceReference: { type: Type.STRING },
                        linkedConceptIds: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation', 'sourceReference', 'linkedConceptIds'],
                    },
                  },
                },
                required: ['title', 'description', 'concepts', 'relationships', 'quiz'],
              },
            },
          });

          return response;
        } catch (err: any) {
          const errStr = String(err?.message || err);
          const isTransient =
            err?.status === 503 ||
            err?.status === 429 ||
            err?.status === 504 ||
            errStr.includes('503') ||
            errStr.includes('429') ||
            errStr.includes('504') ||
            errStr.includes('DEADLINE_EXCEEDED') ||
            errStr.toLowerCase().includes('deadline') ||
            errStr.includes('overloaded') ||
            errStr.includes('UNAVAILABLE') ||
            errStr.includes('RESOURCE_EXHAUSTED') ||
            errStr.includes('high demand') ||
            errStr.includes('fetch failed') ||
            errStr.includes('ECONNRESET') ||
            errStr.includes('ETIMEDOUT');

          if (!isTransient || attempt >= maxRetries) {
            console.error(`[GeminiLLMProvider] Final failure after attempt ${attempt}/${maxRetries} on model ${targetModel}:`, errStr);
            throw err;
          }

          const delayMs = 1000 * Math.pow(2, attempt - 1) + Math.random() * 300;
          console.warn(`[GeminiLLMProvider] Transient failure on attempt ${attempt}/${maxRetries} (${errStr}). Retrying with fallback in ${Math.round(delayMs)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    };

    const response = await callModelWithRetry();

    const rawText = response.text?.trim() || '{}';
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (err: any) {
      throw new Error(`Failed to parse AI JSON response: ${err.message}`);
    }

    // Validate using Zod schema
    const validated = AIGeneratedMapSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error('Zod Validation Errors:', validated.error.format());
      throw new Error(
        `AI output validation failed: ${validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      );
    }

    return validated.data;
  }

  async chatWithTutor(
    history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
    message: string,
    context?: {
      mapTitle?: string;
      conceptsSummary?: string;
      activeConcept?: string;
      rawNotesSnippet?: string;
      needsRevision?: string[];
    }
  ): Promise<string> {
    const client = this.getAi();

    // Context preamble attached to the user message or system instruction
    const contextInfo = [
      context?.mapTitle ? `Map Title: "${context.mapTitle}"` : '',
      context?.activeConcept ? `Currently Selected Concept: "${context.activeConcept}"` : '',
      context?.needsRevision && context.needsRevision.length > 0
        ? `Concepts currently flagged for revision: ${context.needsRevision.join(', ')}`
        : '',
      context?.conceptsSummary ? `Available Concepts in Map:\n${context.conceptsSummary}` : '',
      context?.rawNotesSnippet ? `Notes Excerpt Reference:\n"""\n${context.rawNotesSnippet.slice(0, 3000)}\n"""` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const systemInstruction = `You are MEMORYSCAPE's interactive Socratic Pedagogy Tutor.
Your mission is to help students truly understand concepts and their directional relationships within their knowledge map.

GUIDELINES:
1. Ground explanations in the student's study notes and the concept graph.
2. When clarifying a concept, explain its prerequisites or downstream relationships in the map.
3. Use concrete, beginner-friendly examples (e.g. short code snippets or analogies).
4. Keep answers concise, clear, and scannable (use brief bullet points or paragraphs; do not overwhelm with giant walls of text).
5. If the student has concepts flagged for revision, guide them through the foundational ideas first before tackling advanced topics.
6. If the student asks for practice, formulate a concise application question or challenge.

KNOWLEDGE MAP CONTEXT:
${contextInfo || 'Exploring knowledge map.'}`;

    // Fallback if no API key is configured
    if (!client || !process.env.GEMINI_API_KEY) {
      const active = context?.activeConcept || 'the selected concept';
      return `[Demo Mode / Offline Tutor]\n\nI can see you're studying **${active}** in "${context?.mapTitle || 'Java OOP'}".\n\nIn this offline mode, here is a quick key insight:\n- **Prerequisites**: Make sure you have mastered earlier foundational concepts before building on them.\n- **Application**: Try tracing how ${active} relates to the neighboring rooms on your 3D map!\n\n*(Note: To unlock live multi-turn AI reasoning, configure \`GEMINI_API_KEY\` in your environment or Settings > Secrets.)*`;
    }

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    const maxRetries = 3;
    let attempt = 0;

    // Sanitize history to match SDK expectation: role 'user' | 'model', parts: [{ text }]
    const validHistory = (history || [])
      .filter((h) => (h.role === 'user' || h.role === 'model') && Array.isArray(h.parts) && h.parts.length > 0)
      .slice(-10); // keep recent turns

    const contents = [
      ...validHistory,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    while (true) {
      attempt++;
      const targetModel = candidateModels[(attempt - 1) % candidateModels.length];
      try {
        const response = await client.models.generateContent({
          model: targetModel,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.9,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          return reply;
        }
        return "I've analyzed your question against the knowledge map. Could you specify which concept or relationship you'd like to explore in more detail?";
      } catch (err: any) {
        const errStr = String(err?.message || err);
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.status === 504 ||
          errStr.includes('503') ||
          errStr.includes('429') ||
          errStr.includes('504') ||
          errStr.includes('DEADLINE_EXCEEDED') ||
          errStr.toLowerCase().includes('deadline') ||
          errStr.includes('overloaded') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('high demand') ||
          errStr.includes('fetch failed') ||
          errStr.includes('ECONNRESET') ||
          errStr.includes('ETIMEDOUT');

        if (!isTransient || attempt >= maxRetries) {
          console.error(`[GeminiLLMProvider.chatWithTutor] Error after attempt ${attempt}/${maxRetries}:`, errStr);
          throw err;
        }

        const delayMs = 1000 * Math.pow(2, attempt - 1) + Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}

// Export singleton provider adapter
export const defaultLLMProvider = new GeminiLLMProvider();
