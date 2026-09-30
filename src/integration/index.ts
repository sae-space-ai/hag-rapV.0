/**
 * HAG-RAP V.2 — Integration Layer (WP6)
 * End-to-end integration of WP2-WP5 cognitive pipeline
 */

import {
  type ResearchCaseId,
  type EvidenceId,
  type ReasoningRunId,
  type CausalModelId,
  type AbstractionId,
  type WorldModelId,
  type PlanId,
  type HumanDecisionId,
  type AuditEventId,
  ActorType,
  ExecutionMode,
  type Provenance,
  type TimeProvider,
  type IdProvider,
} from '../core/index.ts';

// ============================================================
// INTEGRATED COGNITIVE RUN
// ============================================================

export interface IntegratedCognitiveRun {
  id: string;
  caseId: ResearchCaseId;
  
  // Input
  inputEvidence: EvidenceId[];
  inputEvidenceVersion: string;
  
  // Processing pipeline
  reasoningRunId?: ReasoningRunId;
  causalModelId?: CausalModelId;
  abstractions: AbstractionId[];
  worldModelVersion: string;
  planVersion: PlanId;
  
  // Authority & Assurance
  authorityContext: {
    policyId: string;
    permissions: string[];
    boundaries: string[];
  };
  assuranceStatus: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'FAILED';
  
  // Human oversight
  humanDecisions: HumanDecisionId[];
  
  // Metadata
  status: 'INITIATED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'ABORTED';
  startTime: string;
  endTime?: string;
  
  // Provenance & Audit
  provenance: Provenance;
  auditTrail: AuditEventId[];
}

// ============================================================
// INTEGRATION REPOSITORY
// ============================================================

export interface IntegrationRepository {
  createIntegratedRun(
    caseId: ResearchCaseId,
    inputEvidence: EvidenceId[],
    inputEvidenceVersion: string,
    worldModelVersion: string,
    planVersion: PlanId,
    authorityContext: IntegratedCognitiveRun['authorityContext'],
    createdBy: string,
  ): IntegratedCognitiveRun;
  
  getIntegratedRun(id: string, caseId: ResearchCaseId): IntegratedCognitiveRun | null;
  getIntegratedRunsByCase(caseId: ResearchCaseId): IntegratedCognitiveRun[];
  
  updateRunStatus(id: string, caseId: ResearchCaseId, status: IntegratedCognitiveRun['status'], updatedBy: string): IntegratedCognitiveRun;
  addReasoningRun(id: string, caseId: ResearchCaseId, reasoningRunId: ReasoningRunId): IntegratedCognitiveRun;
  addCausalModel(id: string, caseId: ResearchCaseId, causalModelId: CausalModelId): IntegratedCognitiveRun;
  addAbstraction(id: string, caseId: ResearchCaseId, abstractionId: AbstractionId): IntegratedCognitiveRun;
  addHumanDecision(id: string, caseId: ResearchCaseId, humanDecisionId: HumanDecisionId): IntegratedCognitiveRun;
  addAuditEvent(id: string, caseId: ResearchCaseId, auditEventId: AuditEventId): IntegratedCognitiveRun;
  updateAssuranceStatus(id: string, caseId: ResearchCaseId, assuranceStatus: IntegratedCognitiveRun['assuranceStatus']): IntegratedCognitiveRun;
}

export function createIntegrationRepository(
  ids: IdProvider,
  time: TimeProvider,
): IntegrationRepository {
  const runs = new Map<string, IntegratedCognitiveRun>();

  return {
    createIntegratedRun(caseId, inputEvidence, inputEvidenceVersion, worldModelVersion, planVersion, authorityContext, createdBy): IntegratedCognitiveRun {
      const now = time.now();
      const id = `icr-${ids.nextEvidenceId()}`;
      const provId = ids.nextProvenanceId();
      
      const run: IntegratedCognitiveRun = {
        id,
        caseId,
        inputEvidence,
        inputEvidenceVersion,
        abstractions: [],
        worldModelVersion,
        planVersion,
        authorityContext,
        assuranceStatus: 'PENDING',
        humanDecisions: [],
        status: 'INITIATED',
        startTime: now,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'integrated-run-creation',
          version: '1',
          createdAt: now,
          inputs: inputEvidence,
          assumptions: [],
        },
        auditTrail: [],
      };
      
      runs.set(id, run);
      return run;
    },

    getIntegratedRun(id, caseId): IntegratedCognitiveRun | null {
      const run = runs.get(id);
      if (!run) return null;
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      return run;
    },

    getIntegratedRunsByCase(caseId): IntegratedCognitiveRun[] {
      return Array.from(runs.values()).filter(run => run.caseId === caseId);
    },

    updateRunStatus(id, caseId, status, updatedBy): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: IntegratedCognitiveRun = {
        ...run,
        status,
        endTime: status === 'COMPLETED' || status === 'FAILED' || status === 'ABORTED' ? now : run.endTime,
      };
      
      runs.set(id, updated);
      return updated;
    },

    addReasoningRun(id, caseId, reasoningRunId): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: IntegratedCognitiveRun = {
        ...run,
        reasoningRunId,
      };
      
      runs.set(id, updated);
      return updated;
    },

    addCausalModel(id, caseId, causalModelId): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: IntegratedCognitiveRun = {
        ...run,
        causalModelId,
      };
      
      runs.set(id, updated);
      return updated;
    },

    addAbstraction(id, caseId, abstractionId): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: IntegratedCognitiveRun = {
        ...run,
        abstractions: [...run.abstractions, abstractionId],
      };
      
      runs.set(id, updated);
      return updated;
    },

    addHumanDecision(id, caseId, humanDecisionId): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: IntegratedCognitiveRun = {
        ...run,
        humanDecisions: [...run.humanDecisions, humanDecisionId],
      };
      
      runs.set(id, updated);
      return updated;
    },

    addAuditEvent(id, caseId, auditEventId): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: IntegratedCognitiveRun = {
        ...run,
        auditTrail: [...run.auditTrail, auditEventId],
      };
      
      runs.set(id, updated);
      return updated;
    },

    updateAssuranceStatus(id, caseId, assuranceStatus): IntegratedCognitiveRun {
      const run = runs.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: IntegratedCognitiveRun = {
        ...run,
        assuranceStatus,
      };
      
      runs.set(id, updated);
      return updated;
    },
  };
}
