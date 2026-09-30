/**
 * HAG-RAP V.2 — Planning Engine (WP5)
 * Deep Planning & Continual Replanning
 * 
 * INVARIANT: Planner cannot modify authority, HUMAN_LOCKED goals, or NON_NEGOTIABLE constraints.
 * INVARIANT: CANDIDATE PLAN ≠ ADMISSIBLE PLAN ≠ SELECTED PLAN ≠ HUMAN APPROVED PLAN
 * INVARIANT: PLAN ≠ EXECUTION
 * INVARIANT: SIMULATED ≠ EXECUTED
 */

import {
  ResearchCaseId,
  EvidenceId,
  ClaimId,
  AssumptionId,
  UncertaintyId,
  WorldStateId,
  PlanId,
  PlanVersionId,
  GoalId,
  ConstraintId,
  ActorType,
  EpistemicStatus,
  ExecutionMode,
  Modifiability,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// GOALS & CONSTRAINTS
// ============================================================

export interface PlanningGoal {
  id: GoalId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  priority: number; // 1-10
  successCriteria: string[];
  authorityOwner: string; // Human actor who owns this goal
  modifiability: Modifiability;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

export enum ConstraintType {
  HARD = 'HARD',
  SOFT = 'SOFT',
}

export interface PlanningConstraint {
  id: ConstraintId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  type: ConstraintType;
  modifiability: Modifiability;
  expression: string; // Formal or natural language constraint
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PLANNING OPERATORS
// ============================================================

export interface PlanningOperator {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  preconditions: string[];
  effects: string[];
  resourceRequirements: string[];
  uncertainty: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// PLAN STRUCTURES
// ============================================================

export enum PlanLifecycle {
  DRAFT = 'DRAFT',
  EVALUATED = 'EVALUATED',
  SELECTED = 'SELECTED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
}

export enum PlanAdmissibility {
  NOT_EVALUATED = 'NOT_EVALUATED',
  ADMISSIBLE = 'ADMISSIBLE',
  INADMISSIBLE = 'INADMISSIBLE',
  CONTESTED = 'CONTESTED',
}

export enum PlanAdaptation {
  STABLE = 'STABLE',
  DEVIATED = 'DEVIATED',
  REPAIRING = 'REPAIRING',
  REPLANNING = 'REPLANNING',
  SAFE_STOPPED = 'SAFE_STOPPED',
}

export enum PlanAuthority {
  WITHIN_AUTHORITY = 'WITHIN_AUTHORITY',
  HUMAN_REVIEW_REQUIRED = 'HUMAN_REVIEW_REQUIRED',
  AUTHORITY_BLOCKED = 'AUTHORITY_BLOCKED',
}

export interface PlanStep {
  id: string;
  operatorId: string;
  preconditions: string[];
  effects: string[];
  resourceRequirements: string[];
  dependencies: string[]; // Other step IDs
  uncertainty: string;
  evidenceBasis: EvidenceId[];
}

export interface PlanHierarchy {
  level: 'STRATEGIC' | 'TACTICAL' | 'ACTION';
  parentPlanId?: PlanId;
  subplanIds: PlanId[];
}

export interface PlanDependency {
  fromPlanId: PlanId;
  toPlanId: PlanId;
  type: 'REQUIRES' | 'BLOCKS' | 'ENABLES';
}

export interface PlanAlternative {
  id: string;
  planId: PlanId;
  description: string;
  rationale: string;
  evaluationScore: number;
  risks: string[];
  uncertainties: string[];
}

export interface PlanBranch {
  id: string;
  planId: PlanId;
  condition: string;
  branchType: 'CONTINGENT' | 'INFORMATION_GATHERING';
  targetPlanId: PlanId;
}

export interface InformationGatheringAction {
  id: string;
  planId: PlanId;
  target: string; // What information to gather
  method: string; // How to gather it
  uncertaintyReduction: string;
}

export interface PlanEvaluation {
  planId: PlanId;
  goalSatisfaction: number; // 0-1
  constraintSatisfaction: number; // 0-1
  riskScore: number; // 0-1 (lower is better)
  uncertaintyScore: number; // 0-1 (lower is better)
  resourceUsage: number; // 0-1
  robustness: number; // 0-1
  overallScore: number; // 0-1
  evaluationNotes: string;
}

export interface Plan {
  id: PlanId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  version: PlanVersionId;
  
  // Content
  goals: GoalId[];
  constraints: ConstraintId[];
  steps: PlanStep[];
  hierarchy: PlanHierarchy;
  dependencies: PlanDependency[];
  alternatives: PlanAlternative[];
  branches: PlanBranch[];
  informationGathering: InformationGatheringAction[];
  
  // State dimensions (orthogonal)
  lifecycle: PlanLifecycle;
  admissibility: PlanAdmissibility;
  adaptation: PlanAdaptation;
  authorityStatus: PlanAuthority;
  executionMode: ExecutionMode;
  
  // References to WP2-WP4
  evidenceBasis: EvidenceId[];
  assumptions: AssumptionId[];
  uncertainties: UncertaintyId[];
  worldModelVersion: string;
  
  // Metadata
  evaluation?: PlanEvaluation;
  selectedBy?: string;
  selectedAt?: string;
  supersededBy?: PlanId;
  
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DEVIATION & REPLANNING
// ============================================================

export interface PlanDeviation {
  id: string;
  planId: PlanId;
  stepId: string;
  expectedState: string;
  actualState: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  detectedAt: string;
  detectedBy: string;
  evidence: EvidenceId[];
}

export interface FailureDetection {
  id: string;
  planId: PlanId;
  failureType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: string;
  evidence: EvidenceId[];
}

export interface PlanRepair {
  id: string;
  planId: PlanId;
  deviationId: string;
  repairActions: string[];
  successProbability: number;
  approvedBy: string;
  approvedAt: string;
}

export interface PlanRevision {
  id: string;
  oldPlanId: PlanId;
  newPlanId: PlanId;
  reason: string;
  trigger: 'DEVIATION' | 'NEW_EVIDENCE' | 'HUMAN_REQUEST' | 'WORLD_STATE_CHANGE';
  revisedBy: string;
  revisedAt: string;
}

export interface ReplanningTrigger {
  id: string;
  planId: PlanId;
  triggerType: 'DEVIATION' | 'NEW_EVIDENCE' | 'HUMAN_REQUEST' | 'WORLD_STATE_CHANGE' | 'CONSTRAINT_VIOLATION';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  triggeredAt: string;
}

export interface SafeStop {
  id: string;
  planId: PlanId;
  reason: string;
  safeState: string;
  stoppedAt: string;
  stoppedBy: string;
  requiresHumanAuthorization: boolean;
}

// ============================================================
// PLANNING ENGINE REPOSITORY
// ============================================================

export interface PlanningEngineRepository {
  // Goals
  createGoal(caseId: ResearchCaseId, name: string, description: string, priority: number, successCriteria: string[], authorityOwner: string, modifiability: Modifiability, createdBy: string): PlanningGoal;
  getGoal(id: GoalId, caseId: ResearchCaseId): PlanningGoal | null;
  getGoalsByCase(caseId: ResearchCaseId): PlanningGoal[];
  
  // Constraints
  createConstraint(caseId: ResearchCaseId, name: string, description: string, type: ConstraintType, modifiability: Modifiability, expression: string, createdBy: string): PlanningConstraint;
  getConstraint(id: ConstraintId, caseId: ResearchCaseId): PlanningConstraint | null;
  getConstraintsByCase(caseId: ResearchCaseId): PlanningConstraint[];
  
  // Operators
  createOperator(caseId: ResearchCaseId, name: string, description: string, preconditions: string[], effects: string[], resourceRequirements: string[], uncertainty: string, createdBy: string): PlanningOperator;
  getOperator(id: string, caseId: ResearchCaseId): PlanningOperator | null;
  getOperatorsByCase(caseId: ResearchCaseId): PlanningOperator[];
  
  // Plans
  createPlan(caseId: ResearchCaseId, name: string, description: string, goals: GoalId[], constraints: ConstraintId[], steps: PlanStep[], hierarchy: PlanHierarchy, dependencies: PlanDependency[], alternatives: PlanAlternative[], branches: PlanBranch[], informationGathering: InformationGatheringAction[], evidenceBasis: EvidenceId[], assumptions: AssumptionId[], uncertainties: UncertaintyId[], worldModelVersion: string, createdBy: string): Plan;
  getPlan(id: PlanId, caseId: ResearchCaseId): Plan | null;
  getPlansByCase(caseId: ResearchCaseId): Plan[];
  updatePlanLifecycle(planId: PlanId, caseId: ResearchCaseId, lifecycle: PlanLifecycle, updatedBy: string): Plan;
  updatePlanAdmissibility(planId: PlanId, caseId: ResearchCaseId, admissibility: PlanAdmissibility, updatedBy: string): Plan;
  updatePlanAdaptation(planId: PlanId, caseId: ResearchCaseId, adaptation: PlanAdaptation, updatedBy: string): Plan;
  updatePlanAuthority(planId: PlanId, caseId: ResearchCaseId, authorityStatus: PlanAuthority, updatedBy: string): Plan;
  updatePlanExecutionMode(planId: PlanId, caseId: ResearchCaseId, executionMode: ExecutionMode, updatedBy: string): Plan;
  supersedePlan(oldPlanId: PlanId, newPlanId: PlanId, caseId: ResearchCaseId, reason: string, supersededBy: string): void;
  
  // Evaluation
  evaluatePlan(planId: PlanId, caseId: ResearchCaseId, evaluation: PlanEvaluation, evaluatedBy: string): Plan;
  
  // Deviation & Replanning
  recordDeviation(planId: PlanId, caseId: ResearchCaseId, stepId: string, expectedState: string, actualState: string, severity: 'MINOR' | 'MAJOR' | 'CRITICAL', detectedBy: string, evidence: EvidenceId[]): PlanDeviation;
  getDeviationsByPlan(planId: PlanId, caseId: ResearchCaseId): PlanDeviation[];
  
  recordFailure(planId: PlanId, caseId: ResearchCaseId, failureType: string, description: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', evidence: EvidenceId[]): FailureDetection;
  getFailuresByPlan(planId: PlanId, caseId: ResearchCaseId): FailureDetection[];
  
  createRepair(planId: PlanId, caseId: ResearchCaseId, deviationId: string, repairActions: string[], successProbability: number, approvedBy: string): PlanRepair;
  getRepairsByPlan(planId: PlanId, caseId: ResearchCaseId): PlanRepair[];
  
  createRevision(oldPlanId: PlanId, newPlanId: PlanId, caseId: ResearchCaseId, reason: string, trigger: 'DEVIATION' | 'NEW_EVIDENCE' | 'HUMAN_REQUEST' | 'WORLD_STATE_CHANGE', revisedBy: string): PlanRevision;
  getRevisionsByPlan(planId: PlanId, caseId: ResearchCaseId): PlanRevision[];
  
  createReplanningTrigger(planId: PlanId, caseId: ResearchCaseId, triggerType: 'DEVIATION' | 'NEW_EVIDENCE' | 'HUMAN_REQUEST' | 'WORLD_STATE_CHANGE' | 'CONSTRAINT_VIOLATION', description: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): ReplanningTrigger;
  getTriggersByPlan(planId: PlanId, caseId: ResearchCaseId): ReplanningTrigger[];
  
  createSafeStop(planId: PlanId, caseId: ResearchCaseId, reason: string, safeState: string, stoppedBy: string, requiresHumanAuthorization: boolean): SafeStop;
  getSafeStopsByPlan(planId: PlanId, caseId: ResearchCaseId): SafeStop[];
}

export function createPlanningEngineRepository(
  ids: IdProvider,
  time: TimeProvider,
): PlanningEngineRepository {
  const goals = new Map<GoalId, PlanningGoal>();
  const constraints = new Map<ConstraintId, PlanningConstraint>();
  const operators = new Map<string, PlanningOperator>();
  const plans = new Map<PlanId, Plan>();
  const deviations = new Map<string, PlanDeviation>();
  const failures = new Map<string, FailureDetection>();
  const repairs = new Map<string, PlanRepair>();
  const revisions = new Map<string, PlanRevision>();
  const triggers = new Map<string, ReplanningTrigger>();
  const safeStops = new Map<string, SafeStop>();

  return {
    // Goals
    createGoal(caseId, name, description, priority, successCriteria, authorityOwner, modifiability, createdBy): PlanningGoal {
      const now = time.now();
      const id = ids.nextGoalId();
      const provId = ids.nextProvenanceId();
      const goal: PlanningGoal = {
        id,
        caseId,
        name,
        description,
        priority,
        successCriteria,
        authorityOwner,
        modifiability,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'goal-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      goals.set(id, goal);
      return goal;
    },

    getGoal(id, caseId): PlanningGoal | null {
      const g = goals.get(id);
      if (!g) return null;
      if (g.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Goal ${id} belongs to case ${g.caseId}, not ${caseId}`);
      }
      return g;
    },

    getGoalsByCase(caseId): PlanningGoal[] {
      return Array.from(goals.values()).filter(g => g.caseId === caseId);
    },

    // Constraints
    createConstraint(caseId, name, description, type, modifiability, expression, createdBy): PlanningConstraint {
      const now = time.now();
      const id = ids.nextConstraintId();
      const provId = ids.nextProvenanceId();
      const constraint: PlanningConstraint = {
        id,
        caseId,
        name,
        description,
        type,
        modifiability,
        expression,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'constraint-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      constraints.set(id, constraint);
      return constraint;
    },

    getConstraint(id, caseId): PlanningConstraint | null {
      const c = constraints.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Constraint ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getConstraintsByCase(caseId): PlanningConstraint[] {
      return Array.from(constraints.values()).filter(c => c.caseId === caseId);
    },

    // Operators
    createOperator(caseId, name, description, preconditions, effects, resourceRequirements, uncertainty, createdBy): PlanningOperator {
      const now = time.now();
      const id = `op-${ids.nextEvidenceId()}`;
      const provId = ids.nextProvenanceId();
      const operator: PlanningOperator = {
        id,
        caseId,
        name,
        description,
        preconditions,
        effects,
        resourceRequirements,
        uncertainty,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'operator-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      operators.set(id, operator);
      return operator;
    },

    getOperator(id, caseId): PlanningOperator | null {
      const o = operators.get(id);
      if (!o) return null;
      if (o.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Operator ${id} belongs to case ${o.caseId}, not ${caseId}`);
      }
      return o;
    },

    getOperatorsByCase(caseId): PlanningOperator[] {
      return Array.from(operators.values()).filter(o => o.caseId === caseId);
    },

    // Plans
    createPlan(caseId, name, description, goals, constraints, steps, hierarchy, dependencies, alternatives, branches, informationGathering, evidenceBasis, assumptions, uncertainties, worldModelVersion, createdBy): Plan {
      const now = time.now();
      const id = ids.nextPlanId();
      const versionId = ids.nextPlanVersionId();
      const provId = ids.nextProvenanceId();
      const plan: Plan = {
        id,
        caseId,
        name,
        description,
        version: versionId,
        goals,
        constraints,
        steps,
        hierarchy,
        dependencies,
        alternatives,
        branches,
        informationGathering,
        lifecycle: PlanLifecycle.DRAFT,
        admissibility: PlanAdmissibility.NOT_EVALUATED,
        adaptation: PlanAdaptation.STABLE,
        authorityStatus: PlanAuthority.WITHIN_AUTHORITY,
        executionMode: ExecutionMode.NOT_EXECUTED,
        evidenceBasis,
        assumptions,
        uncertainties,
        worldModelVersion,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'plan-creation',
          version: '1',
          createdAt: now,
          inputs: [...evidenceBasis, ...assumptions],
          assumptions: assumptions.map(a => a.toString()),
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      plans.set(id, plan);
      return plan;
    },

    getPlan(id, caseId): Plan | null {
      const p = plans.get(id);
      if (!p) return null;
      if (p.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${id} belongs to case ${p.caseId}, not ${caseId}`);
      }
      return p;
    },

    getPlansByCase(caseId): Plan[] {
      return Array.from(plans.values()).filter(p => p.caseId === caseId);
    },

    updatePlanLifecycle(planId, caseId, lifecycle, updatedBy): Plan {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Plan = {
        ...plan,
        lifecycle,
        updatedAt: now,
        versioning: {
          ...plan.versioning,
          version: plan.versioning.version + 1,
          changeReason: `Lifecycle updated to ${lifecycle} by ${updatedBy}`,
        },
      };
      plans.set(planId, updated);
      return updated;
    },

    updatePlanAdmissibility(planId, caseId, admissibility, updatedBy): Plan {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Plan = {
        ...plan,
        admissibility,
        updatedAt: now,
        versioning: {
          ...plan.versioning,
          version: plan.versioning.version + 1,
          changeReason: `Admissibility updated to ${admissibility} by ${updatedBy}`,
        },
      };
      plans.set(planId, updated);
      return updated;
    },

    updatePlanAdaptation(planId, caseId, adaptation, updatedBy): Plan {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Plan = {
        ...plan,
        adaptation,
        updatedAt: now,
        versioning: {
          ...plan.versioning,
          version: plan.versioning.version + 1,
          changeReason: `Adaptation updated to ${adaptation} by ${updatedBy}`,
        },
      };
      plans.set(planId, updated);
      return updated;
    },

    updatePlanAuthority(planId, caseId, authorityStatus, updatedBy): Plan {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Plan = {
        ...plan,
        authorityStatus,
        updatedAt: now,
        versioning: {
          ...plan.versioning,
          version: plan.versioning.version + 1,
          changeReason: `Authority status updated to ${authorityStatus} by ${updatedBy}`,
        },
      };
      plans.set(planId, updated);
      return updated;
    },

    updatePlanExecutionMode(planId, caseId, executionMode, updatedBy): Plan {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Plan = {
        ...plan,
        executionMode,
        updatedAt: now,
        versioning: {
          ...plan.versioning,
          version: plan.versioning.version + 1,
          changeReason: `Execution mode updated to ${executionMode} by ${updatedBy}`,
        },
      };
      plans.set(planId, updated);
      return updated;
    },

    supersedePlan(oldPlanId, newPlanId, caseId, reason, supersededBy): void {
      const oldPlan = plans.get(oldPlanId);
      if (!oldPlan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${oldPlanId} not found`);
      if (oldPlan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${oldPlanId} belongs to case ${oldPlan.caseId}, not ${caseId}`);
      }
      
      const newPlan = plans.get(newPlanId);
      if (!newPlan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${newPlanId} not found`);
      if (newPlan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${newPlanId} belongs to case ${newPlan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      oldPlan.supersededBy = newPlanId;
      oldPlan.updatedAt = now;
      oldPlan.versioning = {
        ...oldPlan.versioning,
        version: oldPlan.versioning.version + 1,
        changeReason: reason,
      };
    },

    // Evaluation
    evaluatePlan(planId, caseId, evaluation, evaluatedBy): Plan {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Plan = {
        ...plan,
        evaluation,
        updatedAt: now,
        versioning: {
          ...plan.versioning,
          version: plan.versioning.version + 1,
          changeReason: `Plan evaluated by ${evaluatedBy}`,
        },
      };
      plans.set(planId, updated);
      return updated;
    },

    // Deviation & Replanning
    recordDeviation(planId, caseId, stepId, expectedState, actualState, severity, detectedBy, evidence): PlanDeviation {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const id = `dev-${ids.nextEvidenceId()}`;
      const deviation: PlanDeviation = {
        id,
        planId,
        stepId,
        expectedState,
        actualState,
        severity,
        detectedAt: now,
        detectedBy,
        evidence,
      };
      deviations.set(id, deviation);
      return deviation;
    },

    getDeviationsByPlan(planId, caseId): PlanDeviation[] {
      return Array.from(deviations.values()).filter(d => {
        const plan = plans.get(d.planId);
        return plan && plan.caseId === caseId && d.planId === planId;
      });
    },

    recordFailure(planId, caseId, failureType, description, severity, evidence): FailureDetection {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const id = `fail-${ids.nextEvidenceId()}`;
      const failure: FailureDetection = {
        id,
        planId,
        failureType,
        description,
        severity,
        detectedAt: now,
        evidence,
      };
      failures.set(id, failure);
      return failure;
    },

    getFailuresByPlan(planId, caseId): FailureDetection[] {
      return Array.from(failures.values()).filter(f => {
        const plan = plans.get(f.planId);
        return plan && plan.caseId === caseId && f.planId === planId;
      });
    },

    createRepair(planId, caseId, deviationId, repairActions, successProbability, approvedBy): PlanRepair {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const id = `rep-${ids.nextEvidenceId()}`;
      const repair: PlanRepair = {
        id,
        planId,
        deviationId,
        repairActions,
        successProbability,
        approvedBy,
        approvedAt: now,
      };
      repairs.set(id, repair);
      return repair;
    },

    getRepairsByPlan(planId, caseId): PlanRepair[] {
      return Array.from(repairs.values()).filter(r => {
        const plan = plans.get(r.planId);
        return plan && plan.caseId === caseId && r.planId === planId;
      });
    },

    createRevision(oldPlanId, newPlanId, caseId, reason, trigger, revisedBy): PlanRevision {
      const oldPlan = plans.get(oldPlanId);
      if (!oldPlan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${oldPlanId} not found`);
      if (oldPlan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${oldPlanId} belongs to case ${oldPlan.caseId}, not ${caseId}`);
      }
      
      const newPlan = plans.get(newPlanId);
      if (!newPlan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${newPlanId} not found`);
      if (newPlan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${newPlanId} belongs to case ${newPlan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const id = `rev-${ids.nextEvidenceId()}`;
      const revision: PlanRevision = {
        id,
        oldPlanId,
        newPlanId,
        reason,
        trigger,
        revisedBy,
        revisedAt: now,
      };
      revisions.set(id, revision);
      return revision;
    },

    getRevisionsByPlan(planId, caseId): PlanRevision[] {
      return Array.from(revisions.values()).filter(r => {
        const plan = plans.get(r.oldPlanId);
        return plan && plan.caseId === caseId && (r.oldPlanId === planId || r.newPlanId === planId);
      });
    },

    createReplanningTrigger(planId, caseId, triggerType, description, severity): ReplanningTrigger {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const id = `trig-${ids.nextEvidenceId()}`;
      const trigger: ReplanningTrigger = {
        id,
        planId,
        triggerType,
        description,
        severity,
        triggeredAt: now,
      };
      triggers.set(id, trigger);
      return trigger;
    },

    getTriggersByPlan(planId, caseId): ReplanningTrigger[] {
      return Array.from(triggers.values()).filter(t => {
        const plan = plans.get(t.planId);
        return plan && plan.caseId === caseId && t.planId === planId;
      });
    },

    createSafeStop(planId, caseId, reason, safeState, stoppedBy, requiresHumanAuthorization): SafeStop {
      const plan = plans.get(planId);
      if (!plan) throw new DomainError(DomainErrorCode.NOT_FOUND, `Plan ${planId} not found`);
      if (plan.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Plan ${planId} belongs to case ${plan.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const id = `stop-${ids.nextEvidenceId()}`;
      const safeStop: SafeStop = {
        id,
        planId,
        reason,
        safeState,
        stoppedAt: now,
        stoppedBy,
        requiresHumanAuthorization,
      };
      safeStops.set(id, safeStop);
      return safeStop;
    },

    getSafeStopsByPlan(planId, caseId): SafeStop[] {
      return Array.from(safeStops.values()).filter(s => {
        const plan = plans.get(s.planId);
        return plan && plan.caseId === caseId && s.planId === planId;
      });
    },
  };
}
