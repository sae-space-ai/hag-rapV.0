/**
 * HAG-RAP V.2 — Evidence Graph Module (WP2)
 * Scientific graph over canonical objects with explicit relations.
 * INVARIANT: Modular, not monolithic. No cross-case references.
 */

import {
  ResearchCaseId,
  SourceId,
  EvidenceId,
  ClaimId,
  AssumptionId,
  UncertaintyId,
  ContradictionId,
  EvidenceLinkId,
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
// EVIDENCE GRAPH RELATIONS
// ============================================================

export enum GraphRelationType {
  SUPPORTS = 'SUPPORTS',
  REFUTES = 'REFUTES',
  CONTRADICTS = 'CONTRADICTS',
  DERIVED_FROM = 'DERIVED_FROM',
  ASSUMES = 'ASSUMES',
  SUPERSEDES = 'SUPERSEDES',
}

export interface GraphRelation {
  id: string;
  caseId: ResearchCaseId;
  fromId: string;
  fromType: 'source' | 'evidence' | 'claim' | 'assumption' | 'uncertainty' | 'contradiction';
  toId: string;
  toType: 'source' | 'evidence' | 'claim' | 'assumption' | 'uncertainty' | 'contradiction';
  relationType: GraphRelationType;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// SOURCE (enhanced from Order 0)
// ============================================================

export enum SourceType {
  DOCUMENTARY = 'DOCUMENTARY',
  EMPIRICAL = 'EMPIRICAL',
  COMPUTATIONAL = 'COMPUTATIONAL',
  EXPERT_OPINION = 'EXPERT_OPINION',
  SYNTHETIC = 'SYNTHETIC',
  GENERATED = 'GENERATED',
}

export interface SourceAccess {
  type: 'public' | 'restricted' | 'proprietary' | 'synthetic';
  reference: string;
  version: string;
  integrityHash?: string;
}

export interface Source {
  id: SourceId;
  caseId: ResearchCaseId;
  title: string;
  description: string;
  sourceType: SourceType;
  reference: string;
  producer: string;
  producerType: ActorType;
  access: SourceAccess;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// EVIDENCE ITEM (enhanced)
// ============================================================

export enum EvidenceType {
  OBSERVATION = 'OBSERVATION',
  MEASUREMENT = 'MEASUREMENT',
  TEST_RESULT = 'TEST_RESULT',
  DOCUMENT_EXCERPT = 'DOCUMENT_EXCERPT',
  COMPUTATIONAL_OUTPUT = 'COMPUTATIONAL_OUTPUT',
  DERIVED = 'DERIVED',
}

export interface EvidenceScope {
  domain: string;
  temporalBounds?: { from: string; to: string };
  geographicBounds?: string;
  populationBounds?: string;
}

export interface EvidenceQuality {
  reliability: number; // 0-1
  completeness: number; // 0-1
  relevance: number; // 0-1
  recency: string;
  independenceLevel: 'primary' | 'derived' | 'corroborative';
}

export interface EvidenceItem {
  id: EvidenceId;
  caseId: ResearchCaseId;
  sourceId: SourceId;
  content: string;
  evidenceType: EvidenceType;
  epistemicStatus: EpistemicStatus;
  scope: EvidenceScope;
  quality: EvidenceQuality;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CLAIM (enhanced)
// ============================================================

export interface Claim {
  id: ClaimId;
  caseId: ResearchCaseId;
  statement: string;
  epistemicStatus: EpistemicStatus;
  supportedBy: EvidenceId[];
  refutedBy: EvidenceId[];
  assumptions: AssumptionId[];
  uncertainties: UncertaintyId[];
  contradictions: ContradictionId[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ASSUMPTION (first-class)
// ============================================================

export enum AssumptionCriticality {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Assumption {
  id: AssumptionId;
  caseId: ResearchCaseId;
  statement: string;
  rationale: string;
  criticality: AssumptionCriticality;
  validated: boolean;
  validationEvidence?: EvidenceId[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// UNCERTAINTY
// ============================================================

export enum UncertaintyType {
  EPISTEMIC = 'EPISTEMIC',
  ALEATORIC = 'ALEATORIC',
  MEASUREMENT = 'MEASUREMENT',
  MODEL = 'MODEL',
  SOURCE = 'SOURCE',
  TEMPORAL = 'TEMPORAL',
  SCOPE = 'SCOPE',
  CONFLICT = 'CONFLICT',
  MISSING_INFORMATION = 'MISSING_INFORMATION',
  UNKNOWN = 'UNKNOWN',
}

export interface Uncertainty {
  id: UncertaintyId;
  caseId: ResearchCaseId;
  description: string;
  uncertaintyType: UncertaintyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedClaims: ClaimId[];
  affectedEvidence: EvidenceId[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONTRADICTION
// ============================================================

export interface Contradiction {
  id: ContradictionId;
  caseId: ResearchCaseId;
  description: string;
  leftEvidenceId: EvidenceId;
  rightEvidenceId: EvidenceId;
  nature: string;
  resolved: boolean;
  resolution?: string;
  resolutionEvidence?: EvidenceId[];
  resolutionProvenance?: Provenance;
  history: Array<{
    timestamp: string;
    event: string;
    provenance: Provenance;
  }>;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// EVIDENCE GRAPH REPOSITORY
// ============================================================

export interface EvidenceGraphRepository {
  // Sources
  createSource(input: Omit<Source, 'id' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Source;
  getSource(id: SourceId, caseId: ResearchCaseId): Source | null;
  getSourcesByCase(caseId: ResearchCaseId): Source[];

  // Evidence
  createEvidence(input: Omit<EvidenceItem, 'id' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): EvidenceItem;
  getEvidence(id: EvidenceId, caseId: ResearchCaseId): EvidenceItem | null;
  getEvidenceByCase(caseId: ResearchCaseId): EvidenceItem[];

  // Claims
  createClaim(input: Omit<Claim, 'id' | 'supportedBy' | 'refutedBy' | 'assumptions' | 'uncertainties' | 'contradictions' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Claim;
  getClaim(id: ClaimId, caseId: ResearchCaseId): Claim | null;
  getClaimsByCase(caseId: ResearchCaseId): Claim[];

  // Assumptions
  createAssumption(input: Omit<Assumption, 'id' | 'validated' | 'validationEvidence' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Assumption;
  getAssumption(id: AssumptionId, caseId: ResearchCaseId): Assumption | null;
  getAssumptionsByCase(caseId: ResearchCaseId): Assumption[];

  // Uncertainties
  createUncertainty(input: Omit<Uncertainty, 'id' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Uncertainty;
  getUncertainty(id: UncertaintyId, caseId: ResearchCaseId): Uncertainty | null;
  getUncertaintiesByCase(caseId: ResearchCaseId): Uncertainty[];

  // Contradictions
  createContradiction(input: Omit<Contradiction, 'id' | 'resolved' | 'history' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Contradiction;
  getContradiction(id: ContradictionId, caseId: ResearchCaseId): Contradiction | null;
  getContradictionsByCase(caseId: ResearchCaseId): Contradiction[];
  resolveContradiction(id: ContradictionId, caseId: ResearchCaseId, resolution: string, resolutionEvidence: EvidenceId[], resolvedBy: string): Contradiction;

  // Relations
  addRelation(fromId: string, fromType: GraphRelation['fromType'], toId: string, toType: GraphRelation['toType'], relationType: GraphRelationType, caseId: ResearchCaseId, createdBy: string): GraphRelation;
  getRelationsByCase(caseId: ResearchCaseId): GraphRelation[];
}

export function createEvidenceGraphRepository(
  ids: IdProvider,
  time: TimeProvider,
): EvidenceGraphRepository {
  const sources = new Map<SourceId, Source>();
  const evidenceItems = new Map<EvidenceId, EvidenceItem>();
  const claims = new Map<ClaimId, Claim>();
  const assumptions = new Map<AssumptionId, Assumption>();
  const uncertainties = new Map<UncertaintyId, Uncertainty>();
  const contradictions = new Map<ContradictionId, Contradiction>();
  const relations = new Map<string, GraphRelation>();

  return {
    createSource(input, createdBy): Source {
      const now = time.now();
      const id = ids.nextSourceId();
      const provId = ids.nextProvenanceId();
      const source: Source = {
        ...input,
        id,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: input.producerType,
          method: 'source-registration',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      sources.set(id, source);
      return source;
    },

    getSource(id, caseId): Source | null {
      const s = sources.get(id);
      if (!s) return null;
      if (s.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Source ${id} belongs to case ${s.caseId}, not ${caseId}`);
      }
      return s;
    },

    getSourcesByCase(caseId): Source[] {
      return Array.from(sources.values()).filter(s => s.caseId === caseId);
    },

    createEvidence(input, createdBy): EvidenceItem {
      const now = time.now();
      const id = ids.nextEvidenceId();
      const provId = ids.nextProvenanceId();
      const item: EvidenceItem = {
        ...input,
        id,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'evidence-registration',
          version: '1',
          createdAt: now,
          inputs: [input.sourceId],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      evidenceItems.set(id, item);
      return item;
    },

    getEvidence(id, caseId): EvidenceItem | null {
      const e = evidenceItems.get(id);
      if (!e) return null;
      if (e.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Evidence ${id} belongs to case ${e.caseId}, not ${caseId}`);
      }
      return e;
    },

    getEvidenceByCase(caseId): EvidenceItem[] {
      return Array.from(evidenceItems.values()).filter(e => e.caseId === caseId);
    },

    createClaim(input, createdBy): Claim {
      const now = time.now();
      const id = ids.nextClaimId();
      const provId = ids.nextProvenanceId();
      const claim: Claim = {
        ...input,
        id,
        supportedBy: [],
        refutedBy: [],
        assumptions: [],
        uncertainties: [],
        contradictions: [],
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'claim-registration',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      claims.set(id, claim);
      return claim;
    },

    getClaim(id, caseId): Claim | null {
      const c = claims.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Claim ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getClaimsByCase(caseId): Claim[] {
      return Array.from(claims.values()).filter(c => c.caseId === caseId);
    },

    createAssumption(input, createdBy): Assumption {
      const now = time.now();
      const id = ids.nextAssumptionId();
      const provId = ids.nextProvenanceId();
      const assumption: Assumption = {
        ...input,
        id,
        validated: false,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'assumption-registration',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      assumptions.set(id, assumption);
      return assumption;
    },

    getAssumption(id, caseId): Assumption | null {
      const a = assumptions.get(id);
      if (!a) return null;
      if (a.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Assumption ${id} belongs to case ${a.caseId}, not ${caseId}`);
      }
      return a;
    },

    getAssumptionsByCase(caseId): Assumption[] {
      return Array.from(assumptions.values()).filter(a => a.caseId === caseId);
    },

    createUncertainty(input, createdBy): Uncertainty {
      const now = time.now();
      const id = ids.nextUncertaintyId();
      const provId = ids.nextProvenanceId();
      const uncertainty: Uncertainty = {
        ...input,
        id,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'uncertainty-registration',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      uncertainties.set(id, uncertainty);
      return uncertainty;
    },

    getUncertainty(id, caseId): Uncertainty | null {
      const u = uncertainties.get(id);
      if (!u) return null;
      if (u.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Uncertainty ${id} belongs to case ${u.caseId}, not ${caseId}`);
      }
      return u;
    },

    getUncertaintiesByCase(caseId): Uncertainty[] {
      return Array.from(uncertainties.values()).filter(u => u.caseId === caseId);
    },

    createContradiction(input, createdBy): Contradiction {
      const now = time.now();
      const id = ids.nextContradictionId();
      const provId = ids.nextProvenanceId();
      const contradiction: Contradiction = {
        ...input,
        id,
        resolved: false,
        history: [{
          timestamp: now,
          event: 'created',
          provenance: {
            id: ids.nextProvenanceId(),
            producer: createdBy,
            producerType: ActorType.HUMAN,
            method: 'contradiction-creation',
            version: '1',
            createdAt: now,
            inputs: [input.leftEvidenceId, input.rightEvidenceId],
            assumptions: [],
          },
        }],
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'contradiction-registration',
          version: '1',
          createdAt: now,
          inputs: [input.leftEvidenceId, input.rightEvidenceId],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      contradictions.set(id, contradiction);
      return contradiction;
    },

    getContradiction(id, caseId): Contradiction | null {
      const c = contradictions.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Contradiction ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getContradictionsByCase(caseId): Contradiction[] {
      return Array.from(contradictions.values()).filter(c => c.caseId === caseId);
    },

    resolveContradiction(id, caseId, resolution, resolutionEvidence, resolvedBy): Contradiction {
      const contradiction = contradictions.get(id);
      if (!contradiction) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Contradiction ${id} not found`);
      }
      if (contradiction.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Contradiction ${id} belongs to case ${contradiction.caseId}, not ${caseId}`);
      }
      const now = time.now();
      const resolved: Contradiction = {
        ...contradiction,
        resolved: true,
        resolution,
        resolutionEvidence,
        resolutionProvenance: {
          id: ids.nextProvenanceId(),
          producer: resolvedBy,
          producerType: ActorType.HUMAN,
          method: 'contradiction-resolution',
          version: '1',
          createdAt: now,
          inputs: resolutionEvidence,
          assumptions: [],
        },
        history: [
          ...contradiction.history,
          {
            timestamp: now,
            event: 'resolved',
            provenance: {
              id: ids.nextProvenanceId(),
              producer: resolvedBy,
              producerType: ActorType.HUMAN,
              method: 'contradiction-resolution',
              version: '1',
              createdAt: now,
              inputs: resolutionEvidence,
              assumptions: [],
            },
          },
        ],
        updatedAt: now,
        versioning: {
          ...contradiction.versioning,
          version: contradiction.versioning.version + 1,
        },
      };
      contradictions.set(id, resolved);
      return resolved;
    },

    addRelation(fromId, fromType, toId, toType, relationType, caseId, createdBy): GraphRelation {
      const now = time.now();
      const id = `REL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const provId = ids.nextProvenanceId();
      const relation: GraphRelation = {
        id,
        caseId,
        fromId,
        fromType,
        toId,
        toType,
        relationType,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'relation-creation',
          version: '1',
          createdAt: now,
          inputs: [fromId, toId],
          assumptions: [],
        },
        createdAt: now,
      };
      relations.set(id, relation);
      return relation;
    },

    getRelationsByCase(caseId): GraphRelation[] {
      return Array.from(relations.values()).filter(r => r.caseId === caseId);
    },
  };
}
