/**
 * HAG-RAP V.2 — Reasoning Engine (WP3)
 * Multi-step reasoning with 5 inference types.
 * Evidence-grounded, traceable, revisable, human-governed.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ClaimId,
  AssumptionId,
  InferenceId,
  ReasoningRunId,
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
// INFERENCE TYPES
// ============================================================

export enum InferenceType {
  DEDUCTIVE = 'DEDUCTIVE',
  INDUCTIVE = 'INDUCTIVE',
  ABDUCTIVE = 'ABDUCTIVE',
  DEFEASIBLE = 'DEFEASIBLE',
  CAUSAL = 'CAUSAL',
}

// ============================================================
// PREMISE
// ============================================================

export interface Premise {
  id: string;
  type: 'evidence' | 'assumption' | 'inference' | 'claim';
  ref: string; // EvidenceId | AssumptionId | InferenceId | ClaimId
  epistemicStatus: EpistemicStatus;
  content: string;
}

// ============================================================
// CONCLUSION
// ============================================================

export interface Conclusion {
  id: string;
  content: string;
  epistemicStatus: EpistemicStatus;
  confidence: number; // 0-1
  uncertainty: number; // 0-1
}

// ============================================================
// INFERENCE
// ============================================================

export interface Inference {
  id: InferenceId;
  caseId: ResearchCaseId;
  reasoningRunId: ReasoningRunId;
  type: InferenceType;
  premises: Premise[];
  conclusion: Conclusion;
  rule: string; // Method or rule applied
  evidence: EvidenceId[];
  assumptions: AssumptionId[];
  uncertainties: string[];
  justificationTrace: string[]; // Step-by-step justification
  status: 'VALID' | 'CONTESTED' | 'SUPERSEDED' | 'FAILED';
  failureReason?: string;
  supersededBy?: InferenceId;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// REASONING RUN
// ============================================================

export interface ReasoningRun {
  id: ReasoningRunId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  inferences: InferenceId[];
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SUPERSEDED';
  failure?: ReasoningFailure;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// REASONING FAILURE
// ============================================================

export enum FailureType {
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
  CONTRADICTORY_EVIDENCE = 'CONTRADICTORY_EVIDENCE',
  INVALID_PREMISE = 'INVALID_PREMISE',
  UNSUPPORTED_INFERENCE = 'UNSUPPORTED_INFERENCE',
  CAUSAL_UNDERDETERMINATION = 'CAUSAL_UNDERDETERMINATION',
  OUT_OF_SCOPE = 'OUT_OF_SCOPE',
  AUTHORITY_REVIEW_REQUIRED = 'AUTHORITY_REVIEW_REQUIRED',
}

export interface ReasoningFailure {
  type: FailureType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================
// JUSTIFICATION GRAPH
// ============================================================

export interface JustificationNode {
  id: string;
  type: 'source' | 'evidence' | 'premise' | 'inference' | 'conclusion';
  ref: string;
  content: string;
  children: string[]; // Child node IDs
  parents: string[]; // Parent node IDs
}

export interface JustificationGraph {
  nodes: Map<string, JustificationNode>;
  rootNodes: string[];
  leafNodes: string[];
}

// ============================================================
// REASONING ENGINE
// ============================================================

export interface ReasoningEngine {
  // Reasoning Runs
  createRun(caseId: ResearchCaseId, name: string, description: string, createdBy: string): ReasoningRun;
  getRun(id: ReasoningRunId, caseId: ResearchCaseId): ReasoningRun | null;
  getRunsByCase(caseId: ResearchCaseId): ReasoningRun[];

  // Inferences
  addInference(
    runId: ReasoningRunId,
    caseId: ResearchCaseId,
    type: InferenceType,
    premises: Premise[],
    conclusion: Conclusion,
    rule: string,
    evidence: EvidenceId[],
    assumptions: AssumptionId[],
    uncertainties: string[],
    createdBy: string,
  ): Inference;
  getInference(id: InferenceId, caseId: ResearchCaseId): Inference | null;
  getInferencesByRun(runId: ReasoningRunId, caseId: ResearchCaseId): Inference[];
  getInferencesByCase(caseId: ResearchCaseId): Inference[];

  // Revision
  supersedeInference(oldId: InferenceId, newId: InferenceId, caseId: ResearchCaseId, reason: string, revisedBy: string): void;

  // Failure Detection
  detectFailures(inference: Inference): ReasoningFailure[];

  // Justification Graph
  buildJustificationGraph(runId: ReasoningRunId, caseId: ResearchCaseId): JustificationGraph;

  // Explanation Queries
  explainWhy(inferenceId: InferenceId, caseId: ResearchCaseId): string;
  explainBasedOnWhat(inferenceId: InferenceId, caseId: ResearchCaseId): string[];
  explainWhichAssumptions(inferenceId: InferenceId, caseId: ResearchCaseId): AssumptionId[];
  explainWhichCounterevidence(inferenceId: InferenceId, caseId: ResearchCaseId): EvidenceId[];
  explainWhatWouldChange(inferenceId: InferenceId, caseId: ResearchCaseId): string;
}

export function createReasoningEngine(
  ids: IdProvider,
  time: TimeProvider,
): ReasoningEngine {
  const runs = new Map<ReasoningRunId, ReasoningRun>();
  const inferences = new Map<InferenceId, Inference>();

  return {
    createRun(caseId, name, description, createdBy): ReasoningRun {
      const now = time.now();
      const id = ids.nextReasoningRunId();
      const provId = ids.nextProvenanceId();
      const run: ReasoningRun = {
        id,
        caseId,
        name,
        description,
        inferences: [],
        status: 'RUNNING',
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'reasoning-run-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      runs.set(id, run);
      return run;
    },

    getRun(id, caseId): ReasoningRun | null {
      const r = runs.get(id);
      if (!r) return null;
      if (r.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Run ${id} belongs to case ${r.caseId}, not ${caseId}`);
      }
      return r;
    },

    getRunsByCase(caseId): ReasoningRun[] {
      return Array.from(runs.values()).filter(r => r.caseId === caseId);
    },

    addInference(runId, caseId, type, premises, conclusion, rule, evidence, assumptions, uncertainties, createdBy): Inference {
      const run = runs.get(runId);
      if (!run) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Run ${runId} not found`);
      }
      if (run.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Run ${runId} belongs to case ${run.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = ids.nextInferenceId();
      const provId = ids.nextProvenanceId();

      // Build justification trace
      const justificationTrace = premises.map(p => `${p.type}:${p.ref}`);

      const inference: Inference = {
        id,
        caseId,
        reasoningRunId: runId,
        type,
        premises,
        conclusion,
        rule,
        evidence,
        assumptions,
        uncertainties,
        justificationTrace,
        status: 'VALID',
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: `inference-${type.toLowerCase()}`,
          version: '1',
          createdAt: now,
          inputs: [...evidence, ...assumptions],
          assumptions: assumptions.map(a => a.toString()),
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };

      inferences.set(id, inference);
      run.inferences.push(id);
      run.updatedAt = now;

      return inference;
    },

    getInference(id, caseId): Inference | null {
      const i = inferences.get(id);
      if (!i) return null;
      if (i.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Inference ${id} belongs to case ${i.caseId}, not ${caseId}`);
      }
      return i;
    },

    getInferencesByRun(runId, caseId): Inference[] {
      return Array.from(inferences.values()).filter(
        i => i.caseId === caseId && i.reasoningRunId === runId
      );
    },

    getInferencesByCase(caseId): Inference[] {
      return Array.from(inferences.values()).filter(i => i.caseId === caseId);
    },

    supersedeInference(oldId, newId, caseId, reason, revisedBy): void {
      const oldInf = inferences.get(oldId);
      if (!oldInf) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Inference ${oldId} not found`);
      }
      if (oldInf.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Inference ${oldId} belongs to case ${oldInf.caseId}, not ${caseId}`);
      }

      const newInf = inferences.get(newId);
      if (!newInf) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Inference ${newId} not found`);
      }
      if (newInf.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Inference ${newId} belongs to case ${newInf.caseId}, not ${caseId}`);
      }

      const now = time.now();

      // Mark old as superseded
      const updatedOld: Inference = {
        ...oldInf,
        status: 'SUPERSEDED',
        supersededBy: newId,
        updatedAt: now,
        versioning: {
          ...oldInf.versioning,
          version: oldInf.versioning.version + 1,
          changeReason: reason,
        },
      };
      inferences.set(oldId, updatedOld);

      // Add supersession to history
      const provId = ids.nextProvenanceId();
      updatedOld.provenance = {
        ...updatedOld.provenance,
        supersedes: oldInf.id,
        changeReason: reason,
      };
    },

    detectFailures(inference): ReasoningFailure[] {
      const failures: ReasoningFailure[] = [];
      const now = time.now();

      // Check for insufficient evidence
      if (inference.evidence.length === 0 && inference.assumptions.length === 0) {
        failures.push({
          type: FailureType.INSUFFICIENT_EVIDENCE,
          message: 'No evidence or assumptions provided',
          timestamp: now,
        });
      }

      // Check for invalid premises
      const invalidPremises = inference.premises.filter(
        p => p.epistemicStatus === EpistemicStatus.UNKNOWN
      );
      if (invalidPremises.length > 0) {
        failures.push({
          type: FailureType.INVALID_PREMISE,
          message: `${invalidPremises.length} premise(s) have UNKNOWN status`,
          details: { premises: invalidPremises.map(p => p.id) },
          timestamp: now,
        });
      }

      // Check for contradictory evidence (simplified)
      if (inference.uncertainties.some(u => u.includes('contradiction'))) {
        failures.push({
          type: FailureType.CONTRADICTORY_EVIDENCE,
          message: 'Contradictory evidence detected',
          timestamp: now,
        });
      }

      return failures;
    },

    buildJustificationGraph(runId, caseId): JustificationGraph {
      const inferences = this.getInferencesByRun(runId, caseId);
      const nodes = new Map<string, JustificationNode>();
      const rootNodes: string[] = [];
      const leafNodes: string[] = [];

      // Build nodes from inferences
      for (const inf of inferences) {
        // Add premise nodes
        for (const premise of inf.premises) {
          if (!nodes.has(premise.id)) {
            nodes.set(premise.id, {
              id: premise.id,
              type: premise.type === 'evidence' ? 'evidence' : 'premise',
              ref: premise.ref,
              content: premise.content,
              children: [],
              parents: [],
            });
            rootNodes.push(premise.id);
          }
        }

        // Add inference node
        const infNodeId = `inf-${inf.id}`;
        nodes.set(infNodeId, {
          id: infNodeId,
          type: 'inference',
          ref: inf.id,
          content: inf.conclusion.content,
          children: [],
          parents: inf.premises.map(p => p.id),
        });

        // Link premises to inference
        for (const premise of inf.premises) {
          const premiseNode = nodes.get(premise.id);
          if (premiseNode) {
            premiseNode.children.push(infNodeId);
          }
        }

        leafNodes.push(infNodeId);
      }

      return { nodes, rootNodes, leafNodes };
    },

    explainWhy(inferenceId, caseId): string {
      const inf = this.getInference(inferenceId, caseId);
      if (!inf) return 'Inference not found';
      return `Inference ${inf.id} (${inf.type}) concluded "${inf.conclusion.content}" using rule: ${inf.rule}`;
    },

    explainBasedOnWhat(inferenceId, caseId): string[] {
      const inf = this.getInference(inferenceId, caseId);
      if (!inf) return [];
      return [
        ...inf.evidence.map(e => `Evidence: ${e}`),
        ...inf.assumptions.map(a => `Assumption: ${a}`),
      ];
    },

    explainWhichAssumptions(inferenceId, caseId): AssumptionId[] {
      const inf = this.getInference(inferenceId, caseId);
      if (!inf) return [];
      return inf.assumptions;
    },

    explainWhichCounterevidence(inferenceId, caseId): EvidenceId[] {
      const inf = this.getInference(inferenceId, caseId);
      if (!inf) return [];
      // In a full implementation, this would query contradictions
      return [];
    },

    explainWhatWouldChange(inferenceId, caseId): string {
      const inf = this.getInference(inferenceId, caseId);
      if (!inf) return 'Inference not found';
      return `Changing any of these would affect the conclusion: ${inf.premises.map(p => p.ref).join(', ')}`;
    },
  };
}
