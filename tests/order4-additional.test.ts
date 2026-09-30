/**
 * HAG-RAP V.2 — Order 4 Additional Tests (WP5)
 * Additional tests for Deep Planning & Continual Replanning
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  Modifiability,
  ExecutionMode,
  DomainError,
  type EvidenceId,
  type ResearchCaseId,
} from '../src/core/index.ts';
import {
  createPlanningEngineRepository,
  ConstraintType,
  PlanLifecycle,
  PlanAdmissibility,
  PlanAdaptation,
  PlanAuthority,
  type PlanningEngineRepository,
} from '../src/planning/index.ts';

describe('WP5 - Additional Planning Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;
  let planningRepo: PlanningEngineRepository;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
    planningRepo = createPlanningEngineRepository(ids, time);
  });

  // ============================================================
  // PLAN EVALUATION TESTS
  // ============================================================

  describe('Plan Evaluation', () => {
    it('T044: evaluates plan with multiple criteria', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const evaluated = planningRepo.evaluatePlan(
        plan.id,
        caseId,
        {
          planId: plan.id,
          goalSatisfaction: 0.85,
          constraintSatisfaction: 0.95,
          riskScore: 0.25,
          uncertaintyScore: 0.30,
          resourceUsage: 0.80,
          robustness: 0.70,
          overallScore: 0.80,
          evaluationNotes: 'Good plan',
        },
        'evaluator-001'
      );
      
      expect(evaluated.evaluation).toBeDefined();
      expect(evaluated.evaluation?.overallScore).toBe(0.80);
    });

    it('T045: score does not override prohibition', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      // Even with high score, NON_NEGOTIABLE constraint cannot be violated
      const evaluated = planningRepo.evaluatePlan(
        plan.id,
        caseId,
        {
          planId: plan.id,
          goalSatisfaction: 0.99,
          constraintSatisfaction: 0.50, // Low because constraint violated
          riskScore: 0.10,
          uncertaintyScore: 0.10,
          resourceUsage: 0.50,
          robustness: 0.90,
          overallScore: 0.95, // High overall score
          evaluationNotes: 'High score but constraint violated',
        },
        'evaluator-001'
      );
      
      // Plan should be marked INADMISSIBLE due to constraint violation
      planningRepo.updatePlanAdmissibility(plan.id, caseId, PlanAdmissibility.INADMISSIBLE, 'system-001');
      const updated = planningRepo.getPlan(plan.id, caseId);
      expect(updated?.admissibility).toBe(PlanAdmissibility.INADMISSIBLE);
    });
  });

  // ============================================================
  // PLAN ADAPTATION TESTS
  // ============================================================

  describe('Plan Adaptation', () => {
    it('T046: updates plan adaptation to STABLE', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const updated = planningRepo.updatePlanAdaptation(plan.id, caseId, PlanAdaptation.STABLE, 'system-001');
      expect(updated.adaptation).toBe(PlanAdaptation.STABLE);
    });

    it('T047: updates plan adaptation to DEVIATED', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const updated = planningRepo.updatePlanAdaptation(plan.id, caseId, PlanAdaptation.DEVIATED, 'system-001');
      expect(updated.adaptation).toBe(PlanAdaptation.DEVIATED);
    });

    it('T048: updates plan adaptation to REPAIRING', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const updated = planningRepo.updatePlanAdaptation(plan.id, caseId, PlanAdaptation.REPAIRING, 'system-001');
      expect(updated.adaptation).toBe(PlanAdaptation.REPAIRING);
    });

    it('T049: updates plan adaptation to REPLANNING', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const updated = planningRepo.updatePlanAdaptation(plan.id, caseId, PlanAdaptation.REPLANNING, 'system-001');
      expect(updated.adaptation).toBe(PlanAdaptation.REPLANNING);
    });

    it('T050: updates plan adaptation to SAFE_STOPPED', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const updated = planningRepo.updatePlanAdaptation(plan.id, caseId, PlanAdaptation.SAFE_STOPPED, 'system-001');
      expect(updated.adaptation).toBe(PlanAdaptation.SAFE_STOPPED);
    });
  });

  // ============================================================
  // CROSS-CASE ISOLATION TESTS
  // ============================================================

  describe('Cross-Case Isolation', () => {
    it('T051: rejects cross-case plan access', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => planningRepo.getPlan(plan.id, otherCaseId)).toThrow(DomainError);
    });

    it('T052: rejects cross-case deviation recording', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [{ id: 'step-1', operatorId: 'op-1', preconditions: [], effects: [], resourceRequirements: [], dependencies: [], uncertainty: 'Low', evidenceBasis: [] }],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => planningRepo.recordDeviation(plan.id, otherCaseId, 'step-1', 'expected', 'actual', 'MINOR', 'monitor', [])).toThrow(DomainError);
    });
  });

  // ============================================================
  // PLAN REFERENCES TESTS
  // ============================================================

  describe('Plan References', () => {
    it('T053: plan references evidence by ID', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const evidenceIds = ['ev-1', 'ev-2', 'ev-3'] as EvidenceId[];
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        evidenceIds,
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      expect(plan.evidenceBasis).toEqual(evidenceIds);
    });

    it('T054: plan references world model version', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v2',
        'system-001'
      );
      
      expect(plan.worldModelVersion).toBe('wm-v2');
    });

    it('T055: plan has provenance', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      expect(plan.provenance).toBeDefined();
      expect(plan.provenance.producer).toBe('system-001');
    });

    it('T056: plan has versioning', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      expect(plan.versioning).toBeDefined();
      expect(plan.versioning.version).toBe(1);
    });
  });

  // ============================================================
  // RETRIEVAL TESTS
  // ============================================================

  describe('Retrieval', () => {
    it('T057: retrieves all goals by case', () => {
      planningRepo.createGoal(caseId, 'Goal 1', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      planningRepo.createGoal(caseId, 'Goal 2', 'desc', 6, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      
      const goals = planningRepo.getGoalsByCase(caseId);
      expect(goals.length).toBe(2);
    });

    it('T058: retrieves all constraints by case', () => {
      planningRepo.createConstraint(caseId, 'Constraint 1', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      planningRepo.createConstraint(caseId, 'Constraint 2', 'desc', ConstraintType.SOFT, Modifiability.SYSTEM_MODIFIABLE, 'y <= 200', 'human-001');
      
      const constraints = planningRepo.getConstraintsByCase(caseId);
      expect(constraints.length).toBe(2);
    });

    it('T059: retrieves all operators by case', () => {
      planningRepo.createOperator(caseId, 'Operator 1', 'desc', [], [], [], 'Low', 'system-001');
      planningRepo.createOperator(caseId, 'Operator 2', 'desc', [], [], [], 'Medium', 'system-001');
      
      const operators = planningRepo.getOperatorsByCase(caseId);
      expect(operators.length).toBe(2);
    });

    it('T060: retrieves all plans by case', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      planningRepo.createPlan(caseId, 'Plan 1', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      planningRepo.createPlan(caseId, 'Plan 2', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const plans = planningRepo.getPlansByCase(caseId);
      expect(plans.length).toBe(2);
    });

    it('T061: retrieves deviations by plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [{ id: 'step-1', operatorId: 'op-1', preconditions: [], effects: [], resourceRequirements: [], dependencies: [], uncertainty: 'Low', evidenceBasis: [] }],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      planningRepo.recordDeviation(plan.id, caseId, 'step-1', 'expected', 'actual', 'MINOR', 'monitor', []);
      planningRepo.recordDeviation(plan.id, caseId, 'step-1', 'expected2', 'actual2', 'MAJOR', 'monitor', []);
      
      const deviations = planningRepo.getDeviationsByPlan(plan.id, caseId);
      expect(deviations.length).toBe(2);
    });

    it('T062: retrieves failures by plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      planningRepo.recordFailure(plan.id, caseId, 'FAILURE_1', 'desc', 'HIGH', []);
      planningRepo.recordFailure(plan.id, caseId, 'FAILURE_2', 'desc', 'CRITICAL', []);
      
      const failures = planningRepo.getFailuresByPlan(plan.id, caseId);
      expect(failures.length).toBe(2);
    });

    it('T063: retrieves repairs by plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [{ id: 'step-1', operatorId: 'op-1', preconditions: [], effects: [], resourceRequirements: [], dependencies: [], uncertainty: 'Low', evidenceBasis: [] }],
        { level: 'STRATEGIC', subplanIds: [] },
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      const deviation = planningRepo.recordDeviation(plan.id, caseId, 'step-1', 'expected', 'actual', 'MINOR', 'monitor', []);
      planningRepo.createRepair(plan.id, caseId, deviation.id, ['action1'], 0.75, 'system-001');
      planningRepo.createRepair(plan.id, caseId, deviation.id, ['action2'], 0.85, 'system-001');
      
      const repairs = planningRepo.getRepairsByPlan(plan.id, caseId);
      expect(repairs.length).toBe(2);
    });

    it('T064: retrieves revisions by plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const planA = planningRepo.createPlan(caseId, 'Plan A', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      const planB = planningRepo.createPlan(caseId, 'Plan B', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v2', 'system-001');
      
      planningRepo.createRevision(planA.id, planB.id, caseId, 'reason', 'DEVIATION', 'system-001');
      
      const revisions = planningRepo.getRevisionsByPlan(planA.id, caseId);
      expect(revisions.length).toBe(1);
    });

    it('T065: retrieves triggers by plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      planningRepo.createReplanningTrigger(plan.id, caseId, 'DEVIATION', 'desc', 'HIGH');
      planningRepo.createReplanningTrigger(plan.id, caseId, 'NEW_EVIDENCE', 'desc', 'MEDIUM');
      
      const triggers = planningRepo.getTriggersByPlan(plan.id, caseId);
      expect(triggers.length).toBe(2);
    });

    it('T066: retrieves safe stops by plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      planningRepo.createSafeStop(plan.id, caseId, 'reason', 'safe_state', 'system-001', true);
      
      const safeStops = planningRepo.getSafeStopsByPlan(plan.id, caseId);
      expect(safeStops.length).toBe(1);
    });
  });
});
