/**
 * HAG-RAP V.2 — Analogy & Transfer Engine (WP4)
 * Analogies, mappings, transfer assessments.
 * INVARIANT: Similarity ≠ Analogy. Analogy ≠ Valid Transfer.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ConceptId,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// STRUCTURAL CORRESPONDENCE
// ============================================================

export interface StructuralCorrespondence {
  sourceElement: string;
  targetElement: string;
  relationType: string;
  confidence: number; // 0-1
}

// ============================================================
// ANALOGICAL MAPPING
// ============================================================

export interface AnalogicalMapping {
  id: string;
  sourceDomain: string;
  targetDomain: string;
  correspondences: StructuralCorrespondence[];
  differences: string[];
  evidence: EvidenceId[];
  assumptions: string[];
  uncertainty: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// ANALOGY
// ============================================================

export interface Analogy {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  sourceConceptId: ConceptId;
  targetConceptId: ConceptId;
  mapping: AnalogicalMapping;
  strength: number; // 0-1
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// TRANSFER HYPOTHESIS
// ============================================================

export interface TransferHypothesis {
  id: string;
  analogyId: string;
  description: string;
  predictedConsequences: string[];
  requiredConditions: string[];
  confidence: number; // 0-1
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// TRANSFER ASSESSMENT
// ============================================================

export enum TransferValidity {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
}

export interface TransferAssessment {
  id: string;
  hypothesisId: string;
  validity: TransferValidity;
  rationale: string;
  evidence: EvidenceId[];
  counterexamples: string[];
  assessedBy: string;
  assessedAt: string;
  provenance: Provenance;
}

// ============================================================
// ANALOGY & TRANSFER ENGINE REPOSITORY
// ============================================================

export interface AnalogyTransferEngineRepository {
  // Analogies
  createAnalogy(
    caseId: ResearchCaseId,
    name: string,
    description: string,
    sourceConceptId: ConceptId,
    targetConceptId: ConceptId,
    mapping: AnalogicalMapping,
    strength: number,
    createdBy: string,
  ): Analogy;
  getAnalogy(id: string, caseId: ResearchCaseId): Analogy | null;
  getAnalogiesByCase(caseId: ResearchCaseId): Analogy[];

  // Transfer Hypotheses
  createTransferHypothesis(
    analogyId: string,
    caseId: ResearchCaseId,
    description: string,
    predictedConsequences: string[],
    requiredConditions: string[],
    confidence: number,
    createdBy: string,
  ): TransferHypothesis;
  getTransferHypothesis(id: string, caseId: ResearchCaseId): TransferHypothesis | null;
  getTransferHypothesesByAnalogy(analogyId: string, caseId: ResearchCaseId): TransferHypothesis[];

  // Transfer Assessments
  assessTransfer(
    hypothesisId: string,
    caseId: ResearchCaseId,
    validity: TransferValidity,
    rationale: string,
    evidence: EvidenceId[],
    counterexamples: string[],
    assessedBy: string,
  ): TransferAssessment;
  getTransferAssessment(hypothesisId: string, caseId: ResearchCaseId): TransferAssessment | null;
}

export function createAnalogyTransferEngineRepository(
  ids: IdProvider,
  time: TimeProvider,
): AnalogyTransferEngineRepository {
  const analogies = new Map<string, Analogy>();
  const hypotheses = new Map<string, TransferHypothesis>();
  const assessments = new Map<string, TransferAssessment>();

  return {
    createAnalogy(caseId, name, description, sourceConceptId, targetConceptId, mapping, strength, createdBy): Analogy {
      const now = time.now();
      const id = `anl-${ids.nextConceptId()}`;
      const provId = ids.nextProvenanceId();
      const analogy: Analogy = {
        id,
        caseId,
        name,
        description,
        sourceConceptId,
        targetConceptId,
        mapping,
        strength,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'analogy-creation',
          version: '1',
          createdAt: now,
          inputs: [sourceConceptId, targetConceptId],
          assumptions: mapping.assumptions,
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      analogies.set(id, analogy);
      return analogy;
    },

    getAnalogy(id, caseId): Analogy | null {
      const a = analogies.get(id);
      if (!a) return null;
      if (a.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Analogy ${id} belongs to case ${a.caseId}, not ${caseId}`);
      }
      return a;
    },

    getAnalogiesByCase(caseId): Analogy[] {
      return Array.from(analogies.values()).filter(a => a.caseId === caseId);
    },

    createTransferHypothesis(analogyId, caseId, description, predictedConsequences, requiredConditions, confidence, createdBy): TransferHypothesis {
      const analogy = analogies.get(analogyId);
      if (!analogy || analogy.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Analogy ${analogyId} not found or wrong case`);
      }

      const now = time.now();
      const id = `th-${ids.nextInferenceId()}`;
      const provId = ids.nextProvenanceId();
      const hypothesis: TransferHypothesis = {
        id,
        analogyId,
        description,
        predictedConsequences,
        requiredConditions,
        confidence,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'transfer-hypothesis-creation',
          version: '1',
          createdAt: now,
          inputs: [analogyId],
          assumptions: [],
        },
        createdAt: now,
      };
      hypotheses.set(id, hypothesis);
      return hypothesis;
    },

    getTransferHypothesis(id, caseId): TransferHypothesis | null {
      const h = hypotheses.get(id);
      if (!h) return null;
      const analogy = analogies.get(h.analogyId);
      if (!analogy || analogy.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Hypothesis ${id} belongs to wrong case`);
      }
      return h;
    },

    getTransferHypothesesByAnalogy(analogyId, caseId): TransferHypothesis[] {
      return Array.from(hypotheses.values()).filter(h => {
        const analogy = analogies.get(h.analogyId);
        return analogy && analogy.caseId === caseId && h.analogyId === analogyId;
      });
    },

    assessTransfer(hypothesisId, caseId, validity, rationale, evidence, counterexamples, assessedBy): TransferAssessment {
      const hypothesis = hypotheses.get(hypothesisId);
      if (!hypothesis) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Hypothesis ${hypothesisId} not found`);
      }
      const analogy = analogies.get(hypothesis.analogyId);
      if (!analogy || analogy.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Hypothesis ${hypothesisId} belongs to wrong case`);
      }

      const now = time.now();
      const id = `ta-${ids.nextEvidenceLinkId()}`;
      const provId = ids.nextProvenanceId();
      const assessment: TransferAssessment = {
        id,
        hypothesisId,
        validity,
        rationale,
        evidence,
        counterexamples,
        assessedBy,
        assessedAt: now,
        provenance: {
          id: provId,
          producer: assessedBy,
          producerType: ActorType.HUMAN,
          method: 'transfer-assessment',
          version: '1',
          createdAt: now,
          inputs: [hypothesisId, ...evidence],
          assumptions: [],
        },
      };
      assessments.set(hypothesisId, assessment);
      return assessment;
    },

    getTransferAssessment(hypothesisId, caseId): TransferAssessment | null {
      const a = assessments.get(hypothesisId);
      if (!a) return null;
      const hypothesis = hypotheses.get(hypothesisId);
      if (!hypothesis) return null;
      const analogy = analogies.get(hypothesis.analogyId);
      if (!analogy || analogy.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Assessment belongs to wrong case`);
      }
      return a;
    },
  };
}
