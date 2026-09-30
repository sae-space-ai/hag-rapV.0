/**
 * HAG-RAP V.2 — Concept Model (WP4)
 * Concept candidates, validated concepts, counterexamples, and relations.
 * INVARIANT: ConceptCandidate ≠ Validated Concept.
 * INVARIANT: Recurring pattern does not automatically create valid concept.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ClaimId,
  ConceptId,
  EpistemicStatus,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// CONCEPT VALIDATION STATUS
// ============================================================

export enum ConceptValidationStatus {
  CANDIDATE = 'CANDIDATE',
  VALIDATED = 'VALIDATED',
  CONTESTED = 'CONTESTED',
  SUPERSEDED = 'SUPERSEDED',
}

// ============================================================
// CONCEPT CANDIDATE
// ============================================================

export interface ConceptCandidate {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  definition: string;
  evidence: EvidenceId[];
  counterexamples: string[];
  scope: string;
  uncertainty: string;
  validationStatus: ConceptValidationStatus;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONCEPT (validated)
// ============================================================

export interface Concept {
  id: ConceptId;
  caseId: ResearchCaseId;
  name: string;
  definition: string;
  evidence: EvidenceId[];
  counterexamples: string[];
  scope: string;
  uncertainty: string;
  validationStatus: ConceptValidationStatus;
  validatedBy?: string;
  validatedAt?: string;
  supersededBy?: ConceptId;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONCEPT EVIDENCE
// ============================================================

export interface ConceptEvidence {
  id: string;
  conceptId: ConceptId;
  evidenceId: EvidenceId;
  supportType: 'positive' | 'negative' | 'neutral';
  relevance: number; // 0-1
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// COUNTEREXAMPLE
// ============================================================

export interface Counterexample {
  id: string;
  conceptId: ConceptId;
  description: string;
  evidence?: EvidenceId;
  severity: 'minor' | 'major' | 'critical';
  resolved: boolean;
  resolution?: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// CONCEPT RELATION
// ============================================================

export enum ConceptRelationType {
  IS_A = 'IS_A',
  PART_OF = 'PART_OF',
  RELATED_TO = 'RELATED_TO',
  OPPOSITE_OF = 'OPPOSITE_OF',
}

export interface ConceptRelation {
  id: string;
  sourceConceptId: ConceptId;
  targetConceptId: ConceptId;
  relationType: ConceptRelationType;
  strength: number; // 0-1
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// CONCEPT MODEL REPOSITORY
// ============================================================

export interface ConceptModelRepository {
  // Candidates
  createCandidate(caseId: ResearchCaseId, name: string, definition: string, evidence: EvidenceId[], counterexamples: string[], scope: string, uncertainty: string, createdBy: string): ConceptCandidate;
  getCandidate(id: string, caseId: ResearchCaseId): ConceptCandidate | null;
  getCandidatesByCase(caseId: ResearchCaseId): ConceptCandidate[];

  // Concepts
  validateConcept(candidateId: string, caseId: ResearchCaseId, validatedBy: string): Concept;
  getConcept(id: ConceptId, caseId: ResearchCaseId): Concept | null;
  getConceptsByCase(caseId: ResearchCaseId): Concept[];
  supersedeConcept(oldId: ConceptId, newId: ConceptId, caseId: ResearchCaseId, reason: string, supersededBy: string): void;

  // Concept Evidence
  addConceptEvidence(conceptId: ConceptId, caseId: ResearchCaseId, evidenceId: EvidenceId, supportType: 'positive' | 'negative' | 'neutral', relevance: number, addedBy: string): ConceptEvidence;
  getConceptEvidence(conceptId: ConceptId, caseId: ResearchCaseId): ConceptEvidence[];

  // Counterexamples
  addCounterexample(conceptId: ConceptId, caseId: ResearchCaseId, description: string, evidence: EvidenceId | undefined, severity: 'minor' | 'major' | 'critical', addedBy: string): Counterexample;
  getCounterexamples(conceptId: ConceptId, caseId: ResearchCaseId): Counterexample[];
  resolveCounterexample(counterexampleId: string, conceptId: ConceptId, caseId: ResearchCaseId, resolution: string, resolvedBy: string): void;

  // Concept Relations
  addConceptRelation(sourceConceptId: ConceptId, targetConceptId: ConceptId, caseId: ResearchCaseId, relationType: ConceptRelationType, strength: number, createdBy: string): ConceptRelation;
  getConceptRelations(conceptId: ConceptId, caseId: ResearchCaseId): ConceptRelation[];
}

export function createConceptModelRepository(
  ids: IdProvider,
  time: TimeProvider,
): ConceptModelRepository {
  const candidates = new Map<string, ConceptCandidate>();
  const concepts = new Map<ConceptId, Concept>();
  const conceptEvidence = new Map<string, ConceptEvidence>();
  const counterexamples = new Map<string, Counterexample>();
  const relations = new Map<string, ConceptRelation>();

  return {
    createCandidate(caseId, name, definition, evidence, counterexamples, scope, uncertainty, createdBy): ConceptCandidate {
      const now = time.now();
      const id = `cand-${ids.nextConceptId()}`;
      const provId = ids.nextProvenanceId();
      const candidate: ConceptCandidate = {
        id,
        caseId,
        name,
        definition,
        evidence,
        counterexamples,
        scope,
        uncertainty,
        validationStatus: ConceptValidationStatus.CANDIDATE,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'concept-candidate-creation',
          version: '1',
          createdAt: now,
          inputs: evidence,
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      candidates.set(id, candidate);
      return candidate;
    },

    getCandidate(id, caseId): ConceptCandidate | null {
      const c = candidates.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Candidate ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getCandidatesByCase(caseId): ConceptCandidate[] {
      return Array.from(candidates.values()).filter(c => c.caseId === caseId);
    },

    validateConcept(candidateId, caseId, validatedBy): Concept {
      const candidate = candidates.get(candidateId);
      if (!candidate) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Candidate ${candidateId} not found`);
      }
      if (candidate.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Candidate ${candidateId} belongs to case ${candidate.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = ids.nextConceptId();
      const provId = ids.nextProvenanceId();
      const concept: Concept = {
        id,
        caseId,
        name: candidate.name,
        definition: candidate.definition,
        evidence: candidate.evidence,
        counterexamples: candidate.counterexamples,
        scope: candidate.scope,
        uncertainty: candidate.uncertainty,
        validationStatus: ConceptValidationStatus.VALIDATED,
        validatedBy,
        validatedAt: now,
        provenance: {
          id: provId,
          producer: validatedBy,
          producerType: ActorType.HUMAN,
          method: 'concept-validation',
          version: '1',
          createdAt: now,
          inputs: candidate.evidence,
          assumptions: [],
          supersedes: candidateId,
        },
        versioning: { version: 1, createdAt: now, createdBy: validatedBy },
        createdAt: now,
        updatedAt: now,
      };
      concepts.set(id, concept);

      // Mark candidate as superseded
      candidate.validationStatus = ConceptValidationStatus.SUPERSEDED;
      candidate.updatedAt = now;

      return concept;
    },

    getConcept(id, caseId): Concept | null {
      const c = concepts.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Concept ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getConceptsByCase(caseId): Concept[] {
      return Array.from(concepts.values()).filter(c => c.caseId === caseId);
    },

    supersedeConcept(oldId, newId, caseId, reason, supersededBy): void {
      const oldConcept = concepts.get(oldId);
      if (!oldConcept) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Concept ${oldId} not found`);
      }
      if (oldConcept.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Concept ${oldId} belongs to case ${oldConcept.caseId}, not ${caseId}`);
      }

      const newConcept = concepts.get(newId);
      if (!newConcept) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Concept ${newId} not found`);
      }
      if (newConcept.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Concept ${newId} belongs to case ${newConcept.caseId}, not ${caseId}`);
      }

      const now = time.now();
      oldConcept.validationStatus = ConceptValidationStatus.SUPERSEDED;
      oldConcept.supersededBy = newId;
      oldConcept.updatedAt = now;
      oldConcept.versioning = {
        ...oldConcept.versioning,
        version: oldConcept.versioning.version + 1,
        changeReason: reason,
      };
    },

    addConceptEvidence(conceptId, caseId, evidenceId, supportType, relevance, addedBy): ConceptEvidence {
      const concept = concepts.get(conceptId);
      if (!concept) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Concept ${conceptId} not found`);
      }
      if (concept.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Concept ${conceptId} belongs to case ${concept.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = `ce-${ids.nextEvidenceId()}`;
      const provId = ids.nextProvenanceId();
      const ce: ConceptEvidence = {
        id,
        conceptId,
        evidenceId,
        supportType,
        relevance,
        provenance: {
          id: provId,
          producer: addedBy,
          producerType: ActorType.HUMAN,
          method: 'concept-evidence-addition',
          version: '1',
          createdAt: now,
          inputs: [evidenceId],
          assumptions: [],
        },
        createdAt: now,
      };
      conceptEvidence.set(id, ce);
      return ce;
    },

    getConceptEvidence(conceptId, caseId): ConceptEvidence[] {
      return Array.from(conceptEvidence.values()).filter(ce => {
        const concept = concepts.get(ce.conceptId);
        return concept && concept.caseId === caseId && ce.conceptId === conceptId;
      });
    },

    addCounterexample(conceptId, caseId, description, evidence, severity, addedBy): Counterexample {
      const concept = concepts.get(conceptId);
      if (!concept) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Concept ${conceptId} not found`);
      }
      if (concept.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Concept ${conceptId} belongs to case ${concept.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = `cx-${ids.nextContradictionId()}`;
      const provId = ids.nextProvenanceId();
      const cx: Counterexample = {
        id,
        conceptId,
        description,
        evidence,
        severity,
        resolved: false,
        provenance: {
          id: provId,
          producer: addedBy,
          producerType: ActorType.HUMAN,
          method: 'counterexample-addition',
          version: '1',
          createdAt: now,
          inputs: evidence ? [evidence] : [],
          assumptions: [],
        },
        createdAt: now,
      };
      counterexamples.set(id, cx);
      return cx;
    },

    getCounterexamples(conceptId, caseId): Counterexample[] {
      return Array.from(counterexamples.values()).filter(cx => {
        const concept = concepts.get(cx.conceptId);
        return concept && concept.caseId === caseId && cx.conceptId === conceptId;
      });
    },

    resolveCounterexample(counterexampleId, conceptId, caseId, resolution, resolvedBy): void {
      const cx = counterexamples.get(counterexampleId);
      if (!cx) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Counterexample ${counterexampleId} not found`);
      }
      const concept = concepts.get(conceptId);
      if (!concept || concept.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Cannot resolve counterexample`);
      }

      cx.resolved = true;
      cx.resolution = resolution;
    },

    addConceptRelation(sourceConceptId, targetConceptId, caseId, relationType, strength, createdBy): ConceptRelation {
      const source = concepts.get(sourceConceptId);
      if (!source || source.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Source concept not found or wrong case`);
      }

      const target = concepts.get(targetConceptId);
      if (!target || target.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Target concept not found or wrong case`);
      }

      const now = time.now();
      const id = `cr-${ids.nextEvidenceLinkId()}`;
      const provId = ids.nextProvenanceId();
      const relation: ConceptRelation = {
        id,
        sourceConceptId,
        targetConceptId,
        relationType,
        strength,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'concept-relation-creation',
          version: '1',
          createdAt: now,
          inputs: [sourceConceptId, targetConceptId],
          assumptions: [],
        },
        createdAt: now,
      };
      relations.set(id, relation);
      return relation;
    },

    getConceptRelations(conceptId, caseId): ConceptRelation[] {
      return Array.from(relations.values()).filter(r => {
        const source = concepts.get(r.sourceConceptId);
        return source && source.caseId === caseId && (r.sourceConceptId === conceptId || r.targetConceptId === conceptId);
      });
    },
  };
}
