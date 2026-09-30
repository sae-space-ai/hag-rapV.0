/**
 * HAG-RAP V.2 — Evidence Module
 * Sources, evidence items, claims, links, and conflicts.
 * INVARIANT: Evidence must be traceable to source or explicit assumption.
 * INVARIANT: Contradictory evidence must not be silently deleted.
 * INVARIANT: Absence of evidence ≠ negative evidence.
 */

import {
  ResearchCaseId,
  SourceId,
  EvidenceId,
  ClaimId,
  EvidenceLinkId,
  EpistemicStatus,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// SOURCE
// ============================================================

export interface Source {
  id: SourceId;
  caseId: ResearchCaseId;
  title: string;
  description: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

export interface CreateSourceInput {
  caseId: ResearchCaseId;
  title: string;
  description: string;
  createdBy: string;
}

// ============================================================
// EVIDENCE ITEM
// ============================================================

export interface EvidenceItem {
  id: EvidenceId;
  caseId: ResearchCaseId;
  sourceId: SourceId;
  content: string;
  epistemicStatus: EpistemicStatus;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvidenceInput {
  caseId: ResearchCaseId;
  sourceId: SourceId;
  content: string;
  epistemicStatus: EpistemicStatus;
  createdBy: string;
}

// ============================================================
// CLAIM
// ============================================================

export interface Claim {
  id: ClaimId;
  caseId: ResearchCaseId;
  content: string;
  epistemicStatus: EpistemicStatus;
  supportedBy: EvidenceId[];
  contradictedBy: EvidenceId[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimInput {
  caseId: ResearchCaseId;
  content: string;
  epistemicStatus: EpistemicStatus;
  createdBy: string;
}

// ============================================================
// EVIDENCE LINK
// ============================================================

export interface EvidenceLink {
  id: EvidenceLinkId;
  caseId: ResearchCaseId;
  evidenceId: EvidenceId;
  claimId: ClaimId;
  linkType: 'supports' | 'contradicts' | 'contextualizes';
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// EVIDENCE QUALITY / SCOPE / STATUS
// ============================================================

export interface EvidenceQuality {
  reliability: number; // 0-1
  completeness: number; // 0-1
  relevance: number; // 0-1
  recency: string;
}

export interface EvidenceScope {
  domain: string;
  temporalBounds?: { from: string; to: string };
  geographicBounds?: string;
}

export interface EvidenceConflict {
  evidenceA: EvidenceId;
  evidenceB: EvidenceId;
  nature: string;
  resolved: boolean;
  resolution?: string;
}

// ============================================================
// EVIDENCE REPOSITORY
// ============================================================

export interface EvidenceRepository {
  createSource(input: CreateSourceInput): Source;
  getSource(id: SourceId, caseId: ResearchCaseId): Source | null;
  getSourcesByCase(caseId: ResearchCaseId): Source[];

  createEvidence(input: CreateEvidenceInput): EvidenceItem;
  getEvidence(id: EvidenceId, caseId: ResearchCaseId): EvidenceItem | null;
  getEvidenceByCase(caseId: ResearchCaseId): EvidenceItem[];
  getEvidenceBySource(sourceId: SourceId, caseId: ResearchCaseId): EvidenceItem[];

  createClaim(input: CreateClaimInput): Claim;
  getClaim(id: ClaimId, caseId: ResearchCaseId): Claim | null;
  getClaimsByCase(caseId: ResearchCaseId): Claim[];

  createLink(evidenceId: EvidenceId, claimId: ClaimId, linkType: EvidenceLink['linkType'], caseId: ResearchCaseId, createdBy: string): EvidenceLink;
  getLinksByCase(caseId: ResearchCaseId): EvidenceLink[];
}

export function createEvidenceRepository(
  ids: IdProvider,
  time: TimeProvider,
): EvidenceRepository {
  const sources = new Map<SourceId, Source>();
  const evidenceItems = new Map<EvidenceId, EvidenceItem>();
  const claims = new Map<ClaimId, Claim>();
  const links = new Map<EvidenceLinkId, EvidenceLink>();

  return {
    createSource(input: CreateSourceInput): Source {
      const now = time.now();
      const id = ids.nextSourceId();
      const provId = ids.nextProvenanceId();
      const source: Source = {
        id,
        caseId: input.caseId,
        title: input.title,
        description: input.description,
        provenance: {
          id: provId,
          producer: input.createdBy,
          producerType: 'HUMAN' as any,
          method: 'manual-source-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy: input.createdBy },
        createdAt: now,
      };
      sources.set(id, source);
      return source;
    },

    getSource(id: SourceId, caseId: ResearchCaseId): Source | null {
      const s = sources.get(id);
      if (!s) return null;
      if (s.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Source ${id} belongs to case ${s.caseId}, not ${caseId}`);
      }
      return s;
    },

    getSourcesByCase(caseId: ResearchCaseId): Source[] {
      return Array.from(sources.values()).filter(s => s.caseId === caseId);
    },

    createEvidence(input: CreateEvidenceInput): EvidenceItem {
      const now = time.now();
      const id = ids.nextEvidenceId();
      const provId = ids.nextProvenanceId();
      const item: EvidenceItem = {
        id,
        caseId: input.caseId,
        sourceId: input.sourceId,
        content: input.content,
        epistemicStatus: input.epistemicStatus,
        provenance: {
          id: provId,
          producer: input.createdBy,
          producerType: 'HUMAN' as any,
          method: 'evidence-registration',
          version: '1',
          createdAt: now,
          inputs: [input.sourceId],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy: input.createdBy },
        createdAt: now,
        updatedAt: now,
      };
      evidenceItems.set(id, item);
      return item;
    },

    getEvidence(id: EvidenceId, caseId: ResearchCaseId): EvidenceItem | null {
      const e = evidenceItems.get(id);
      if (!e) return null;
      if (e.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Evidence ${id} belongs to case ${e.caseId}, not ${caseId}`);
      }
      return e;
    },

    getEvidenceByCase(caseId: ResearchCaseId): EvidenceItem[] {
      return Array.from(evidenceItems.values()).filter(e => e.caseId === caseId);
    },

    getEvidenceBySource(sourceId: SourceId, caseId: ResearchCaseId): EvidenceItem[] {
      return Array.from(evidenceItems.values()).filter(
        e => e.caseId === caseId && e.sourceId === sourceId
      );
    },

    createClaim(input: CreateClaimInput): Claim {
      const now = time.now();
      const id = ids.nextClaimId();
      const provId = ids.nextProvenanceId();
      const claim: Claim = {
        id,
        caseId: input.caseId,
        content: input.content,
        epistemicStatus: input.epistemicStatus,
        supportedBy: [],
        contradictedBy: [],
        provenance: {
          id: provId,
          producer: input.createdBy,
          producerType: 'HUMAN' as any,
          method: 'claim-registration',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy: input.createdBy },
        createdAt: now,
        updatedAt: now,
      };
      claims.set(id, claim);
      return claim;
    },

    getClaim(id: ClaimId, caseId: ResearchCaseId): Claim | null {
      const c = claims.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Claim ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getClaimsByCase(caseId: ResearchCaseId): Claim[] {
      return Array.from(claims.values()).filter(c => c.caseId === caseId);
    },

    createLink(
      evidenceId: EvidenceId,
      claimId: ClaimId,
      linkType: EvidenceLink['linkType'],
      caseId: ResearchCaseId,
      createdBy: string,
    ): EvidenceLink {
      const now = time.now();
      const id = ids.nextEvidenceLinkId();
      const provId = ids.nextProvenanceId();
      const link: EvidenceLink = {
        id,
        caseId,
        evidenceId,
        claimId,
        linkType,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: 'HUMAN' as any,
          method: 'evidence-linking',
          version: '1',
          createdAt: now,
          inputs: [evidenceId, claimId],
          assumptions: [],
        },
        createdAt: now,
      };
      links.set(id, link);

      // Update claim references
      const claim = claims.get(claimId);
      if (claim && claim.caseId === caseId) {
        if (linkType === 'supports') {
          claim.supportedBy.push(evidenceId);
        } else if (linkType === 'contradicts') {
          claim.contradictedBy.push(evidenceId);
        }
        claim.updatedAt = now;
      }

      return link;
    },

    getLinksByCase(caseId: ResearchCaseId): EvidenceLink[] {
      return Array.from(links.values()).filter(l => l.caseId === caseId);
    },
  };
}
