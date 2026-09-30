/**
 * HAG-RAP V.2 — Case Module
 * ResearchCase is the primary aggregation boundary.
 * All scientific objects belong to a case (unless explicitly global).
 * INVARIANT: Case A cannot read/modify objects of Case B.
 */

import {
  ResearchCaseId,
  CaseLifecycle,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// RESEARCH CASE
// ============================================================

export interface ResearchCase {
  id: ResearchCaseId;
  title: string;
  description: string;
  lifecycle: CaseLifecycle;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseInput {
  title: string;
  description: string;
  createdBy: string;
}

export interface CaseRepository {
  create(input: CreateCaseInput): ResearchCase;
  getById(id: ResearchCaseId): ResearchCase | null;
  getAll(): ResearchCase[];
  updateLifecycle(id: ResearchCaseId, lifecycle: CaseLifecycle): ResearchCase;
  assertOwnership(entityCaseId: ResearchCaseId, requesterCaseId: ResearchCaseId): void;
}

// ============================================================
// CASE LIFECYCLE TRANSITIONS
// ============================================================

const VALID_TRANSITIONS: Record<CaseLifecycle, CaseLifecycle[]> = {
  [CaseLifecycle.DRAFT]: [CaseLifecycle.ACTIVE, CaseLifecycle.ARCHIVED],
  [CaseLifecycle.ACTIVE]: [CaseLifecycle.PAUSED, CaseLifecycle.CLOSED],
  [CaseLifecycle.PAUSED]: [CaseLifecycle.ACTIVE, CaseLifecycle.CLOSED],
  [CaseLifecycle.CLOSED]: [CaseLifecycle.ARCHIVED],
  [CaseLifecycle.ARCHIVED]: [],
};

export function isValidCaseTransition(from: CaseLifecycle, to: CaseLifecycle): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================
// IN-MEMORY CASE REPOSITORY
// ============================================================

export function createCaseRepository(
  ids: IdProvider,
  time: TimeProvider,
): CaseRepository {
  const cases = new Map<ResearchCaseId, ResearchCase>();

  return {
    create(input: CreateCaseInput): ResearchCase {
      const now = time.now();
      const id = ids.nextResearchCaseId();
      const provId = ids.nextProvenanceId();
      const caseObj: ResearchCase = {
        id,
        title: input.title,
        description: input.description,
        lifecycle: CaseLifecycle.DRAFT,
        provenance: {
          id: provId,
          producer: input.createdBy,
          producerType: ActorType.HUMAN,
          method: 'manual-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: {
          version: 1,
          createdAt: now,
          createdBy: input.createdBy,
        },
        createdAt: now,
        updatedAt: now,
      };
      cases.set(id, caseObj);
      return caseObj;
    },

    getById(id: ResearchCaseId): ResearchCase | null {
      return cases.get(id) ?? null;
    },

    getAll(): ResearchCase[] {
      return Array.from(cases.values());
    },

    updateLifecycle(id: ResearchCaseId, lifecycle: CaseLifecycle): ResearchCase {
      const existing = cases.get(id);
      if (!existing) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Case ${id} not found`);
      }
      if (!isValidCaseTransition(existing.lifecycle, lifecycle)) {
        throw new DomainError(
          DomainErrorCode.INVALID_TRANSITION,
          `Cannot transition from ${existing.lifecycle} to ${lifecycle}`,
        );
      }
      const updated: ResearchCase = {
        ...existing,
        lifecycle,
        updatedAt: time.now(),
        versioning: {
          ...existing.versioning,
          version: existing.versioning.version + 1,
        },
      };
      cases.set(id, updated);
      return updated;
    },

    assertOwnership(entityCaseId: ResearchCaseId, requesterCaseId: ResearchCaseId): void {
      if (entityCaseId !== requesterCaseId) {
        throw new DomainError(
          DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `Case isolation violation: entity belongs to ${entityCaseId}, accessed from ${requesterCaseId}`,
        );
      }
    },
  };
}
