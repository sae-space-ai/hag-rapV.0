/**
 * HAG-RAP V.2 — Contestability (WP6)
 * Mechanisms for challenging and contesting system decisions
 */

import {
  type ResearchCaseId,
  type EvidenceId,
  ActorType,
  type Provenance,
  type TimeProvider,
  type IdProvider,
} from '../core/index.ts';

// ============================================================
// CONTESTATION STATUS
// ============================================================

export enum ContestationStatus {
  FILED = 'FILED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  WITHDRAWN = 'WITHDRAWN',
}

// ============================================================
// CONTESTATION TARGET
// ============================================================

export enum ContestationTargetType {
  REASONING = 'REASONING',
  ABSTRACTION = 'ABSTRACTION',
  WORLD_MODEL = 'WORLD_MODEL',
  PLAN = 'PLAN',
  EVIDENCE = 'EVIDENCE',
  DECISION = 'DECISION',
}

// ============================================================
// CONTESTATION
// ============================================================

export interface Contestation {
  id: string;
  caseId: ResearchCaseId;
  targetType: ContestationTargetType;
  targetId: string;
  grounds: string;
  evidence: EvidenceId[];
  challenger: string;
  challengerType: ActorType;
  status: ContestationStatus;
  filedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  response?: string;
  resultingChange?: string;
  resolution?: string;
  resolvedAt?: string;
  auditTrail: string[]; // Audit event IDs
  provenance: Provenance;
}

// ============================================================
// CONTESTABILITY REPOSITORY
// ============================================================

export interface ContestabilityRepository {
  createContestation(
    caseId: ResearchCaseId,
    targetType: ContestationTargetType,
    targetId: string,
    grounds: string,
    evidence: EvidenceId[],
    challenger: string,
    challengerType: ActorType,
    filedBy: string,
  ): Contestation;
  
  getContestation(id: string, caseId: ResearchCaseId): Contestation | null;
  getContestationsByCase(caseId: ResearchCaseId): Contestation[];
  getContestationsByTarget(caseId: ResearchCaseId, targetType: ContestationTargetType, targetId: string): Contestation[];
  
  updateContestationStatus(id: string, caseId: ResearchCaseId, status: ContestationStatus, reviewedBy: string, response?: string): Contestation;
  resolveContestation(id: string, caseId: ResearchCaseId, resolution: string, resultingChange: string, resolvedBy: string): Contestation;
  withdrawContestation(id: string, caseId: ResearchCaseId, withdrawnBy: string, reason: string): Contestation;
  
  addAuditEvent(id: string, caseId: ResearchCaseId, auditEventId: string): Contestation;
}

export function createContestabilityRepository(
  ids: IdProvider,
  time: TimeProvider,
): ContestabilityRepository {
  const contestations = new Map<string, Contestation>();

  return {
    createContestation(caseId, targetType, targetId, grounds, evidence, challenger, challengerType, filedBy): Contestation {
      const id = `cont-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const contestation: Contestation = {
        id,
        caseId,
        targetType,
        targetId,
        grounds,
        evidence,
        challenger,
        challengerType,
        status: ContestationStatus.FILED,
        filedAt: now,
        auditTrail: [],
        provenance: {
          id: provId,
          producer: filedBy,
          producerType: ActorType.HUMAN,
          method: 'contestation-filing',
          version: '1',
          createdAt: now,
          inputs: evidence,
          assumptions: [],
        },
      };
      
      contestations.set(id, contestation);
      return contestation;
    },

    getContestation(id, caseId): Contestation | null {
      const cont = contestations.get(id);
      if (!cont) return null;
      if (cont.caseId !== caseId) {
        throw new Error(`Case isolation violation: contestation ${id} belongs to case ${cont.caseId}, not ${caseId}`);
      }
      return cont;
    },

    getContestationsByCase(caseId): Contestation[] {
      return Array.from(contestations.values()).filter(c => c.caseId === caseId);
    },

    getContestationsByTarget(caseId, targetType, targetId): Contestation[] {
      return Array.from(contestations.values()).filter(c => 
        c.caseId === caseId && 
        c.targetType === targetType && 
        c.targetId === targetId
      );
    },

    updateContestationStatus(id, caseId, status, reviewedBy, response): Contestation {
      const cont = contestations.get(id);
      if (!cont) throw new Error(`Contestation ${id} not found`);
      if (cont.caseId !== caseId) {
        throw new Error(`Case isolation violation: contestation ${id} belongs to case ${cont.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Contestation = {
        ...cont,
        status,
        reviewedAt: now,
        reviewedBy,
        response,
      };
      
      contestations.set(id, updated);
      return updated;
    },

    resolveContestation(id, caseId, resolution, resultingChange, resolvedBy): Contestation {
      const cont = contestations.get(id);
      if (!cont) throw new Error(`Contestation ${id} not found`);
      if (cont.caseId !== caseId) {
        throw new Error(`Case isolation violation: contestation ${id} belongs to case ${cont.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Contestation = {
        ...cont,
        status: ContestationStatus.RESOLVED,
        resolution,
        resultingChange,
        resolvedAt: now,
        reviewedBy: resolvedBy,
        reviewedAt: now,
      };
      
      contestations.set(id, updated);
      return updated;
    },

    withdrawContestation(id, caseId, withdrawnBy, reason): Contestation {
      const cont = contestations.get(id);
      if (!cont) throw new Error(`Contestation ${id} not found`);
      if (cont.caseId !== caseId) {
        throw new Error(`Case isolation violation: contestation ${id} belongs to case ${cont.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Contestation = {
        ...cont,
        status: ContestationStatus.WITHDRAWN,
        resolution: `Withdrawn by ${withdrawnBy}: ${reason}`,
        resolvedAt: now,
      };
      
      contestations.set(id, updated);
      return updated;
    },

    addAuditEvent(id, caseId, auditEventId): Contestation {
      const cont = contestations.get(id);
      if (!cont) throw new Error(`Contestation ${id} not found`);
      if (cont.caseId !== caseId) {
        throw new Error(`Case isolation violation: contestation ${id} belongs to case ${cont.caseId}, not ${caseId}`);
      }
      
      const updated: Contestation = {
        ...cont,
        auditTrail: [...cont.auditTrail, auditEventId],
      };
      
      contestations.set(id, updated);
      return updated;
    },
  };
}
