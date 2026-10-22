import { QuizQuestion, SourceParagraph } from '../types';

/**
 * Normalizes text for lenient citation matching (removing extra whitespace, uniform quotes)
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies whether a cited excerpt actually appears in the extracted source text.
 */
export function verifyExcerptInNotes(
  excerpt: string,
  rawNotes: string
): { isVerified: boolean; matchedIndex: number; contextSnippet?: string } {
  if (!excerpt || !rawNotes) {
    return { isVerified: false, matchedIndex: -1 };
  }

  // 1. Direct exact or lowercase match
  const rawLower = rawNotes.toLowerCase();
  const excerptLower = excerpt.toLowerCase().trim();

  let idx = rawLower.indexOf(excerptLower);
  if (idx !== -1) {
    const start = Math.max(0, idx - 40);
    const end = Math.min(rawNotes.length, idx + excerpt.length + 40);
    return {
      isVerified: true,
      matchedIndex: idx,
      contextSnippet: (start > 0 ? '...' : '') + rawNotes.slice(start, end) + (end < rawNotes.length ? '...' : ''),
    };
  }

  // 2. Normalized whitespace match
  const normRaw = normalizeForComparison(rawNotes);
  const normExcerpt = normalizeForComparison(excerpt);

  idx = normRaw.indexOf(normExcerpt);
  if (idx !== -1) {
    return {
      isVerified: true,
      matchedIndex: idx,
    };
  }

  // 3. First 40 characters check (in case excerpt was slightly trimmed)
  if (excerptLower.length > 40) {
    const prefix = excerptLower.slice(0, 40);
    idx = rawLower.indexOf(prefix);
    if (idx !== -1) {
      return {
        isVerified: true,
        matchedIndex: idx,
      };
    }
  }

  return { isVerified: false, matchedIndex: -1 };
}

/**
 * Parses raw text into structured paragraphs with page or paragraph references.
 */
export function parseTextIntoParagraphs(text: string): SourceParagraph[] {
  const lines = text.split(/\r?\n/);
  const paragraphs: SourceParagraph[] = [];
  let currentBlock: string[] = [];
  let currentRef: string | null = null;
  let paragraphCounter = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for explicit [Page X, ¶Y] or similar headers
    const headerMatch = trimmed.match(/^\[?(Page\s+\d+,\s*¶?\d+)\]?$/i);
    if (headerMatch) {
      if (currentBlock.length > 0) {
        paragraphs.push({
          id: `p-${paragraphs.length + 1}`,
          ref: currentRef || `Notes ¶${paragraphCounter++}`,
          text: currentBlock.join(' ').trim(),
        });
        currentBlock = [];
      }
      currentRef = headerMatch[1];
      continue;
    }

    if (trimmed === '') {
      if (currentBlock.length > 0) {
        paragraphs.push({
          id: `p-${paragraphs.length + 1}`,
          ref: currentRef || `Notes ¶${paragraphCounter++}`,
          text: currentBlock.join(' ').trim(),
        });
        currentBlock = [];
        currentRef = null;
      }
    } else {
      currentBlock.push(trimmed);
    }
  }

  if (currentBlock.length > 0) {
    paragraphs.push({
      id: `p-${paragraphs.length + 1}`,
      ref: currentRef || `Notes ¶${paragraphCounter++}`,
      text: currentBlock.join(' ').trim(),
    });
  }

  return paragraphs;
}

/**
 * Calculates quiz scoring, incorrect concepts, and personalized revision signals.
 */
export function evaluateQuizSubmission(
  quiz: QuizQuestion[],
  answers: Record<string, number>,
  allConcepts: { id: string; title: string }[]
) {
  let score = 0;
  const incorrectQuestionIds: string[] = [];
  const revisionConceptIdSet = new Set<string>();

  quiz.forEach((q) => {
    const selected = answers[q.id];
    if (selected === q.correctAnswerIndex) {
      score += 1;
    } else {
      incorrectQuestionIds.push(q.id);
      q.linkedConceptIds.forEach((cId) => revisionConceptIdSet.add(cId));
    }
  });

  const conceptTitleMap = new Map(allConcepts.map((c) => [c.id, c.title]));
  const revisionConceptIds = Array.from(revisionConceptIdSet);

  const revisionPath = revisionConceptIds.map((cId: string) => {
    const relatedWrongQuestions = quiz.filter(
      (q) => incorrectQuestionIds.includes(q.id) && q.linkedConceptIds.includes(cId)
    );
    return {
      conceptId: cId,
      conceptTitle: conceptTitleMap.get(cId) || cId,
      priority: relatedWrongQuestions.length > 1 ? ('high' as const) : ('medium' as const),
      reason: `Missed ${relatedWrongQuestions.length} question(s) directly testing this concept (e.g. "${relatedWrongQuestions[0]?.question.slice(0, 50)}...")`,
    };
  });

  return {
    score,
    total: quiz.length,
    percentage: Math.round((score / quiz.length) * 100),
    incorrectQuestionIds,
    revisionConceptIds,
    revisionPath,
  };
}
