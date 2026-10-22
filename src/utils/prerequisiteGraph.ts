import { Concept, Relationship } from '../types/index.ts';

export interface JustifiedPrerequisiteResult {
  prerequisiteConcept: Concept;
  relationship: Relationship;
  rationale: string;
}

/**
 * Validates and identifies a genuine, justified prerequisite for a given concept.
 *
 * Rules:
 * 1. Only follows explicit directional dependency relationships where:
 *    - rel.sourceId === conceptId AND rel.label.toLowerCase() === 'prerequisite' (target is prerequisite)
 *    - OR rel.sourceId === conceptId AND rel.label.toLowerCase() === 'extends' (target superclass is prerequisite)
 * 2. Does NOT treat symmetric or non-dependency connections ('contains', 'alternative', 'related_to', 'instantiates') as prerequisites.
 * 3. Prevents circular prerequisite chains by maintaining a traversal path stack.
 */
export function findJustifiedPrerequisite(
  conceptId: string,
  allConcepts: Concept[],
  relationships: Relationship[],
  visitedPath: Set<string> = new Set()
): JustifiedPrerequisiteResult | null {
  if (visitedPath.has(conceptId)) {
    // Cycle detected! Do not return circular prerequisite.
    return null;
  }

  const conceptMap = new Map(allConcepts.map((c) => [c.id, c]));
  const concept = conceptMap.get(conceptId);
  if (!concept) return null;

  visitedPath.add(conceptId);

  // Look for direct outgoing prerequisite or extends relationships
  // Source is the dependent concept; Target is the prerequisite foundation.
  for (const rel of relationships) {
    if (rel.sourceId === conceptId) {
      const label = rel.label.trim().toLowerCase();
      const isPrereqLabel = label === 'prerequisite' || label === 'extends';

      if (isPrereqLabel) {
        const targetId = rel.targetId;

        // Check for cycle before accepting
        if (visitedPath.has(targetId)) {
          console.warn(`[PrerequisiteGraph] Cycle detected between ${conceptId} and ${targetId}. Prerequisite rejected.`);
          continue;
        }

        const prereqConcept = conceptMap.get(targetId);
        if (prereqConcept) {
          const rationale =
            label === 'extends'
              ? `${prereqConcept.title} is the foundational superclass that ${concept.title} builds upon.`
              : `${prereqConcept.title} is a direct architectural prerequisite for understanding ${concept.title}: ${rel.explanation}`;

          return {
            prerequisiteConcept: prereqConcept,
            relationship: rel,
            rationale,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Finds the most relevant connection explaining why a concept functions the way it does.
 */
export function findRelevantConnection(
  conceptId: string,
  allConcepts: Concept[],
  relationships: Relationship[]
): { relationship: Relationship; connectedConcept: Concept; explanation: string } | null {
  const conceptMap = new Map(allConcepts.map((c) => [c.id, c]));

  // Priority 1: Outgoing enabled or dispatching relationship
  for (const rel of relationships) {
    if (rel.sourceId === conceptId) {
      const other = conceptMap.get(rel.targetId);
      if (other) {
        return {
          relationship: rel,
          connectedConcept: other,
          explanation: rel.explanation,
        };
      }
    }
  }

  // Priority 2: Incoming relationship
  for (const rel of relationships) {
    if (rel.targetId === conceptId) {
      const other = conceptMap.get(rel.sourceId);
      if (other) {
        return {
          relationship: rel,
          connectedConcept: other,
          explanation: rel.explanation,
        };
      }
    }
  }

  return null;
}
