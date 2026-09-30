/**
 * HAG-RAP V.2 — Core Module
 * Canonical IDs, domain errors, epistemic semantics, and foundational types.
 * 
 * This module is the root of the dependency graph.
 * No bounded context above it may redefine its contracts.
 */

// ============================================================
// CANONICAL TYPED IDs
// ============================================================

// Branded nominal types prevent accidental interchange of IDs
// Each ID type is structurally a string but nominally distinct.

export type ResearchCaseId = string & { readonly __brand: 'ResearchCaseId' };
export type SourceId = string & { readonly __brand: 'SourceId' };
export type EvidenceId = string & { readonly __brand: 'EvidenceId' };
export type ClaimId = string & { readonly __brand: 'ClaimId' };
export type AssumptionId = string & { readonly __brand: 'AssumptionId' };
export type UncertaintyId = string & { readonly __brand: 'UncertaintyId' };
export type ContradictionId = string & { readonly __brand: 'ContradictionId' };
export type InferenceId = string & { readonly __brand: 'InferenceId' };
export type ReasoningRunId = string & { readonly __brand: 'ReasoningRunId' };
export type CausalModelId = string & { readonly __brand: 'CausalModelId' };
export type ConceptId = string & { readonly __brand: 'ConceptId' };
export type AbstractionId = string & { readonly __brand: 'AbstractionId' };
export type WorldModelId = string & { readonly __brand: 'WorldModelId' };
export type WorldStateId = string & { readonly __brand: 'WorldStateId' };
export type GoalId = string & { readonly __brand: 'GoalId' };
export type ConstraintId = string & { readonly __brand: 'ConstraintId' };
export type PlanId = string & { readonly __brand: 'PlanId' };
export type PlanVersionId = string & { readonly __brand: 'PlanVersionId' };
export type AuthorityPolicyId = string & { readonly __brand: 'AuthorityPolicyId' };
export type HumanDecisionId = string & { readonly __brand: 'HumanDecisionId' };
export type SimulationRunId = string & { readonly __brand: 'SimulationRunId' };
export type ExperimentId = string & { readonly __brand: 'ExperimentId' };
export type AuditEventId = string & { readonly __brand: 'AuditEventId' };
export type ProvenanceId = string & { readonly __brand: 'ProvenanceId' };
export type EvidenceLinkId = string & { readonly __brand: 'EvidenceLinkId' };
export type PermissionId = string & { readonly __brand: 'PermissionId' };
export type HumanGateId = string & { readonly __brand: 'HumanGateId' };
export type ConstraintLockId = string & { readonly __brand: 'ConstraintLockId' };

// ============================================================
// ID FACTORY
// ============================================================

export interface IdProvider {
  nextResearchCaseId(): ResearchCaseId;
  nextSourceId(): SourceId;
  nextEvidenceId(): EvidenceId;
  nextClaimId(): ClaimId;
  nextAssumptionId(): AssumptionId;
  nextUncertaintyId(): UncertaintyId;
  nextContradictionId(): ContradictionId;
  nextInferenceId(): InferenceId;
  nextReasoningRunId(): ReasoningRunId;
  nextCausalModelId(): CausalModelId;
  nextConceptId(): ConceptId;
  nextAbstractionId(): AbstractionId;
  nextWorldModelId(): WorldModelId;
  nextWorldStateId(): WorldStateId;
  nextGoalId(): GoalId;
  nextConstraintId(): ConstraintId;
  nextPlanId(): PlanId;
  nextPlanVersionId(): PlanVersionId;
  nextAuthorityPolicyId(): AuthorityPolicyId;
  nextHumanDecisionId(): HumanDecisionId;
  nextSimulationRunId(): SimulationRunId;
  nextExperimentId(): ExperimentId;
  nextAuditEventId(): AuditEventId;
  nextProvenanceId(): ProvenanceId;
  nextEvidenceLinkId(): EvidenceLinkId;
  nextPermissionId(): PermissionId;
  nextHumanGateId(): HumanGateId;
  nextConstraintLockId(): ConstraintLockId;
}

export function createSequentialIdProvider(): IdProvider {
  let counter = 0;
  const next = <T>(prefix: string): T => {
    counter++;
    return `${prefix}-${String(counter).padStart(6, '0')}` as unknown as T;
  };
  return {
    nextResearchCaseId: () => next<ResearchCaseId>('RC'),
    nextSourceId: () => next<SourceId>('SRC'),
    nextEvidenceId: () => next<EvidenceId>('EVD'),
    nextClaimId: () => next<ClaimId>('CLM'),
    nextAssumptionId: () => next<AssumptionId>('ASM'),
    nextUncertaintyId: () => next<UncertaintyId>('UNC'),
    nextContradictionId: () => next<ContradictionId>('CTR'),
    nextInferenceId: () => next<InferenceId>('INF'),
    nextReasoningRunId: () => next<ReasoningRunId>('RR'),
    nextCausalModelId: () => next<CausalModelId>('CM'),
    nextConceptId: () => next<ConceptId>('CNC'),
    nextAbstractionId: () => next<AbstractionId>('ABS'),
    nextWorldModelId: () => next<WorldModelId>('WM'),
    nextWorldStateId: () => next<WorldStateId>('WS'),
    nextGoalId: () => next<GoalId>('GOL'),
    nextConstraintId: () => next<ConstraintId>('CST'),
    nextPlanId: () => next<PlanId>('PLN'),
    nextPlanVersionId: () => next<PlanVersionId>('PV'),
    nextAuthorityPolicyId: () => next<AuthorityPolicyId>('AP'),
    nextHumanDecisionId: () => next<HumanDecisionId>('HD'),
    nextSimulationRunId: () => next<SimulationRunId>('SR'),
    nextExperimentId: () => next<ExperimentId>('EXP'),
    nextAuditEventId: () => next<AuditEventId>('AUD'),
    nextProvenanceId: () => next<ProvenanceId>('PRV'),
    nextEvidenceLinkId: () => next<EvidenceLinkId>('EL'),
    nextPermissionId: () => next<PermissionId>('PER'),
    nextHumanGateId: () => next<HumanGateId>('HG'),
    nextConstraintLockId: () => next<ConstraintLockId>('CL'),
  };
}

export function createDeterministicIdProvider(seed: string = 'det'): IdProvider {
  let counter = 0;
  const next = <T>(prefix: string): T => {
    counter++;
    return `${seed}-${prefix}-${String(counter).padStart(6, '0')}` as unknown as T;
  };
  return {
    nextResearchCaseId: () => next<ResearchCaseId>('RC'),
    nextSourceId: () => next<SourceId>('SRC'),
    nextEvidenceId: () => next<EvidenceId>('EVD'),
    nextClaimId: () => next<ClaimId>('CLM'),
    nextAssumptionId: () => next<AssumptionId>('ASM'),
    nextUncertaintyId: () => next<UncertaintyId>('UNC'),
    nextContradictionId: () => next<ContradictionId>('CTR'),
    nextInferenceId: () => next<InferenceId>('INF'),
    nextReasoningRunId: () => next<ReasoningRunId>('RR'),
    nextCausalModelId: () => next<CausalModelId>('CM'),
    nextConceptId: () => next<ConceptId>('CNC'),
    nextAbstractionId: () => next<AbstractionId>('ABS'),
    nextWorldModelId: () => next<WorldModelId>('WM'),
    nextWorldStateId: () => next<WorldStateId>('WS'),
    nextGoalId: () => next<GoalId>('GOL'),
    nextConstraintId: () => next<ConstraintId>('CST'),
    nextPlanId: () => next<PlanId>('PLN'),
    nextPlanVersionId: () => next<PlanVersionId>('PV'),
    nextAuthorityPolicyId: () => next<AuthorityPolicyId>('AP'),
    nextHumanDecisionId: () => next<HumanDecisionId>('HD'),
    nextSimulationRunId: () => next<SimulationRunId>('SR'),
    nextExperimentId: () => next<ExperimentId>('EXP'),
    nextAuditEventId: () => next<AuditEventId>('AUD'),
    nextProvenanceId: () => next<ProvenanceId>('PRV'),
    nextEvidenceLinkId: () => next<EvidenceLinkId>('EL'),
    nextPermissionId: () => next<PermissionId>('PER'),
    nextHumanGateId: () => next<HumanGateId>('HG'),
    nextConstraintLockId: () => next<ConstraintLockId>('CL'),
  };
}

// ============================================================
// EPISTEMIC STATUS
// ============================================================

export enum EpistemicStatus {
  OBSERVED = 'OBSERVED',
  SUPPORTED_FACT = 'SUPPORTED_FACT',
  CLAIM = 'CLAIM',
  ASSUMPTION = 'ASSUMPTION',
  INFERENCE = 'INFERENCE',
  HYPOTHESIS = 'HYPOTHESIS',
  PREDICTION = 'PREDICTION',
  SIMULATION_RESULT = 'SIMULATION_RESULT',
  CONTESTED = 'CONTESTED',
  SUPERSEDED = 'SUPERSEDED',
  UNKNOWN = 'UNKNOWN',
}

// ============================================================
// EXECUTION MODE (Reality vs Simulation)
// ============================================================

export enum ExecutionMode {
  OBSERVED = 'OBSERVED',
  PREDICTED = 'PREDICTED',
  COUNTERFACTUAL = 'COUNTERFACTUAL',
  SIMULATED = 'SIMULATED',
  REQUESTED = 'REQUESTED',
  NOT_EXECUTED = 'NOT_EXECUTED',
}

// ============================================================
// ACTOR TYPE
// ============================================================

export enum ActorType {
  HUMAN = 'HUMAN',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

// ============================================================
// SCIENTIFIC MATURITY
// ============================================================

export enum ScientificMaturity {
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  IMPLEMENTED = 'IMPLEMENTED',
  EXECUTED = 'EXECUTED',
  TESTED = 'TESTED',
  VERIFIED = 'VERIFIED',
  SCIENTIFICALLY_EVALUATED = 'SCIENTIFICALLY_EVALUATED',
  NOT_EXECUTED = 'NOT_EXECUTED',
  NOT_VERIFIED = 'NOT_VERIFIED',
  TARGET_NOT_YET_EXECUTED = 'TARGET_NOT_YET_EXECUTED',
  UNKNOWN = 'UNKNOWN',
}

// ============================================================
// MODULE STATUS (for UI display)
// ============================================================

export enum ModuleStatus {
  IMPLEMENTED = 'IMPLEMENTED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  FUTURE_MODULE = 'FUTURE_MODULE',
}

// ============================================================
// RESEARCH CASE LIFECYCLE
// ============================================================

export enum CaseLifecycle {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

// ============================================================
// AUTHORITY MODIFIABILITY
// ============================================================

export enum Modifiability {
  NON_NEGOTIABLE = 'NON_NEGOTIABLE',
  HUMAN_LOCKED = 'HUMAN_LOCKED',
  SYSTEM_MODIFIABLE = 'SYSTEM_MODIFIABLE',
  LOCAL_DISCRETION = 'LOCAL_DISCRETION',
  ADVISORY = 'ADVISORY',
}

// ============================================================
// DOMAIN ERRORS
// ============================================================

export enum DomainErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REFERENCE = 'INVALID_REFERENCE',
  CASE_ISOLATION_VIOLATION = 'CASE_ISOLATION_VIOLATION',
  AUTHORITY_VIOLATION = 'AUTHORITY_VIOLATION',
  INVARIANT_VIOLATION = 'INVARIANT_VIOLATION',
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  INSUFFICIENT_EVIDENCE = 'INSUFFICIENT_EVIDENCE',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  IMPORT_VALIDATION_ERROR = 'IMPORT_VALIDATION_ERROR',
  AUDIT_IMMUTABILITY_VIOLATION = 'AUDIT_IMMUTABILITY_VIOLATION',
  HUMAN_ACTOR_SPOOFING = 'HUMAN_ACTOR_SPOOFING',
  AUTHORITY_ESCALATION = 'AUTHORITY_ESCALATION',
}

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: DomainErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================
// CLOCK / TIME PROVIDER
// ============================================================

export interface TimeProvider {
  now(): string; // ISO 8601
}

export function createSystemTimeProvider(): TimeProvider {
  return { now: () => new Date().toISOString() };
}

export function createDeterministicTimeProvider(startIso: string): TimeProvider {
  let current = new Date(startIso).getTime();
  return {
    now: () => {
      const result = new Date(current).toISOString();
      current += 1000; // advance 1 second per call
      return result;
    },
  };
}

// ============================================================
// PROVENANCE (foundational, used by all bounded contexts)
// ============================================================

export interface Provenance {
  id: ProvenanceId;
  producer: string;
  producerType: ActorType;
  method: string;
  version: string;
  createdAt: string;
  inputs: string[];
  assumptions: string[];
  supersedes?: string;
  changeReason?: string;
  humanIntervention?: {
    actor: string;
    actorType: ActorType;
    timestamp: string;
    reason: string;
  };
}

// ============================================================
// VERSIONING PRIMITIVES
// ============================================================

export interface Versioned {
  version: number;
  supersededBy?: string;
  createdAt: string;
  createdBy: string;
  changeReason?: string;
}

// ============================================================
// VALIDATION UTILITIES
// ============================================================

export function validateId(value: unknown, expectedPrefix: string): boolean {
  if (typeof value !== 'string') return false;
  return value.startsWith(expectedPrefix + '-') || value.includes('-' + expectedPrefix + '-');
}

export function validateNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
