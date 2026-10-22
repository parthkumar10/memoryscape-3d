import { z } from 'zod';

export type ReviewStatus = 'not_started' | 'needs_revision' | 'reviewed' | 'retried_correct' | 'retried_incorrect';

export interface Concept {
  id: string;
  title: string;
  briefExplanation: string;
  beginnerExample: string;
  sourceExcerpt: string;
  sourceReference: string;
  isVerified: boolean; // Verified against source notes
  cluster: string;
  position: [number, number, number]; // 3D coordinates [x, y, z]
  color?: string;
  needsRevision?: boolean;
  reviewStatus?: ReviewStatus;
  retryResult?: 'correct' | 'incorrect';
}

export type RelationshipType = 
  | 'extends'
  | 'implements'
  | 'contains'
  | 'instantiates'
  | 'prerequisite'
  | 'related_to';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  label: RelationshipType | string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceReference: string;
  linkedConceptIds: string[];
}

export interface SourceParagraph {
  id: string;
  ref: string; // e.g. "Page 1, ¶2" or "Notes ¶3"
  text: string;
}

export interface KnowledgeMap {
  id: string;
  title: string;
  description: string;
  sourceType: 'demo' | 'custom-pasted' | 'custom-pdf';
  sourceTitle?: string;
  rawSourceNotes: string;
  paragraphs: SourceParagraph[];
  concepts: Concept[];
  relationships: Relationship[];
  quiz: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpQuestion {
  id: string;
  conceptId: string;
  scenario: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceReference: string;
}

export interface QuizSubmission {
  mapId: string;
  answers: Record<string, number>; // questionId -> selectedIndex
  score: number;
  total: number;
  incorrectQuestionIds: string[];
  revisionConceptIds: string[];
  revisionPath: {
    conceptId: string;
    conceptTitle: string;
    priority: 'high' | 'medium';
    reason: string;
  }[];
  completedAt: string;
  retryResults?: Record<string, 'correct' | 'incorrect'>;
}

// Zod Schemas for validating AI Output
export const AIConceptSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  briefExplanation: z.string().min(10),
  beginnerExample: z.string().min(5),
  sourceExcerpt: z.string().min(5),
  sourceReference: z.string().min(1),
  cluster: z.string().default('Core'),
});

export const AIRelationshipSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  label: z.string().min(1),
  explanation: z.string().min(5),
});

export const AIQuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(10),
  options: z.array(z.string().min(1)).length(4),
  correctAnswerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
  sourceReference: z.string().min(1),
  linkedConceptIds: z.array(z.string()).min(1),
});

export const AIGeneratedMapSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  concepts: z.array(AIConceptSchema).min(6).max(14),
  relationships: z.array(AIRelationshipSchema).min(4),
  quiz: z.array(AIQuizQuestionSchema).length(5),
});

export type AIGeneratedMap = z.infer<typeof AIGeneratedMapSchema>;

export interface CameraBookmark {
  id: string;
  name: string;
  description?: string;
  camPos: [number, number, number];
  targetLookAt: [number, number, number];
  clusterName?: string;
  conceptCount?: number;
  isCustom?: boolean;
  createdAt: number;
}
