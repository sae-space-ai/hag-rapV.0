/**
 * HAG-RAP V.2 — Order 4 Tests (WP5)
 * Tests for Deep Planning & Continual Replanning
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  Modifiability,
  ExecutionMode,
  DomainError,
  DomainErrorCode,
  type EvidenceId,
  type AssumptionId,
  type UncertaintyId,
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
  type PlanningGoal,
  type PlanningConstraint,
  type PlanningOperator,
  type Plan,
} from '../src/planning/index.ts';
import { runWP5Demo } from '../src/demo/wp5-demo.ts';

describe('WP5 - Planning Engine Tests', () => {
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
  // GOALS & CONSTRAINTS TESTS
  // ============================================================

  describe('Goals', () => {
    it('T001: creates goal with HUMAN_LOCKED modifiability', () => {
      const goal = planningRepo.createGoal(
        caseId,
        'Test Goal',
        'Test description',
        5,
        ['criterion1'],
        'human-001',
        Modifiability.HUMAN_LOCKED,
        'human-001'
      );
      expect(goal.modifiability).toBe(Modifiability.HUMAN_LOCKED);
    });

    it('T002: creates goal with NON_NEGOTIABLE modifiability', () => {
      const goal = planningRepo.createGoal(
        caseId,
        'Test Goal',
        'Test description',
        5,
        ['criterion1'],
        'human-001',
        Modifiability.NON_NEGOTIABLE,
        'human-001'
      );
      expect(goal.modifiability).toBe(Modifiability.NON_NEGOTIABLE);
    });

    it('T003: goal has provenance', () => {
      const goal = planningRepo.createGoal(
        caseId,
        'Test Goal',
        'Test description',
        5,
        ['criterion1'],
        'human-001',
        Modifiability.HUMAN_LOCKED,
        'human-001'
      );
      expect(goal.provenance).toBeDefined();
      expect(goal.provenance.producer).toBe('human-001');
    });

    it('T004: goal has versioning', () => {
      const goal = planningRepo.createGoal(
        caseId,
        'Test Goal',
        'Test description',
        5,
        ['criterion1'],
        'human-001',
        Modifiability.HUMAN_LOCKED,
        'human-001'
      );
      expect(goal.versioning).toBeDefined();
      expect(goal.versioning.version).toBe(1);
    });

    it('T005: retrieves goal by ID', () => {
      const goal = planningRepo.createGoal(
        caseId,
        'Test Goal',
        'Test description',
        5,
        ['criterion1'],
        'human-001',
        Modifiability.HUMAN_LOCKED,
        'human-001'
      );
      const retrieved = planningRepo.getGoal(goal.id, caseId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(goal.id);
    });

    it('T006: rejects cross-case goal access', () => {
      const goal = planningRepo.createGoal(
        caseId,
        'Test Goal',
        'Test description',
        5,
        ['criterion1'],
        'human-001',
        Modifiability.HUMAN_LOCKED,
        'human-001'
      );
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => planningRepo.getGoal(goal.id, otherCaseId)).toThrow(DomainError);
    });
  });

  describe('Constraints', () => {
    it('T007: creates HARD constraint', () => {
      const constraint = planningRepo.createConstraint(
        caseId,
        'Test Constraint',
        'Test description',
        ConstraintType.HARD,
        Modifiability.NON_NEGOTIABLE,
        'x <= 100',
        'human-001'
      );
      expect(constraint.type).toBe(ConstraintType.HARD);
    });

    it('T008: creates SOFT constraint', () => {
      const constraint = planningRepo.createConstraint(
        caseId,
        'Test Constraint',
        'Test description',
        ConstraintType.SOFT,
        Modifiability.SYSTEM_MODIFIABLE,
        'x <= 100',
        'system-001'
      );
      expect(constraint.type).toBe(ConstraintType.SOFT);
    });

    it('T009: creates NON_NEGOTIABLE constraint', () => {
      const constraint = planningRepo.createConstraint(
        caseId,
        'Test Constraint',
        'Test description',
        ConstraintType.HARD,
        Modifiability.NON_NEGOTIABLE,
        'x <= 100',
        'human-001'
      );
      expect(constraint.modifiability).toBe(Modifiability.NON_NEGOTIABLE);
    });

    it('T010: creates HUMAN_LOCKED constraint', () => {
      const constraint = planningRepo.createConstraint(
        caseId,
        'Test Constraint',
        'Test description',
        ConstraintType.HARD,
        Modifiability.HUMAN_LOCKED,
        'x <= 100',
        'human-001'
      );
      expect(constraint.modifiability).toBe(Modifiability.HUMAN_LOCKED);
    });

    it('T011: constraint has provenance', () => {
      const constraint = planningRepo.createConstraint(
        caseId,
        'Test Constraint',
        'Test description',
        ConstraintType.HARD,
        Modifiability.NON_NEGOTIABLE,
        'x <= 100',
        'human-001'
      );
      expect(constraint.provenance).toBeDefined();
    });

    it('T012: rejects cross-case constraint access', () => {
      const constraint = planningRepo.createConstraint(
        caseId,
        'Test Constraint',
        'Test description',
        ConstraintType.HARD,
        Modifiability.NON_NEGOTIABLE,
        'x <= 100',
        'human-001'
      );
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => planningRepo.getConstraint(constraint.id, otherCaseId)).toThrow(DomainError);
    });
  });

  // ============================================================
  // PLAN LIFECYCLE TESTS
  // ============================================================

  describe('Plan Lifecycle', () => {
    it('T013: creates plan with DRAFT lifecycle', () => {
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
      
      expect(plan.lifecycle).toBe(PlanLifecycle.DRAFT);
    });

    it('T014: updates plan lifecycle to EVALUATED', () => {
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
      
      const updated = planningRepo.updatePlanLifecycle(plan.id, caseId, PlanLifecycle.EVALUATED, 'system-001');
      expect(updated.lifecycle).toBe(PlanLifecycle.EVALUATED);
    });

    it('T015: updates plan lifecycle to SELECTED', () => {
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
      
      const updated = planningRepo.updatePlanLifecycle(plan.id, caseId, PlanLifecycle.SELECTED, 'human-001');
      expect(updated.lifecycle).toBe(PlanLifecycle.SELECTED);
    });

    it('T016: updates plan lifecycle to EXECUTING', () => {
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
      
      const updated = planningRepo.updatePlanLifecycle(plan.id, caseId, PlanLifecycle.EXECUTING, 'system-001');
      expect(updated.lifecycle).toBe(PlanLifecycle.EXECUTING);
    });

    it('T017: updates plan lifecycle to COMPLETED', () => {
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
      
      const updated = planningRepo.updatePlanLifecycle(plan.id, caseId, PlanLifecycle.COMPLETED, 'system-001');
      expect(updated.lifecycle).toBe(PlanLifecycle.COMPLETED);
    });

    it('T018: updates plan lifecycle to FAILED', () => {
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
      
      const updated = planningRepo.updatePlanLifecycle(plan.id, caseId, PlanLifecycle.FAILED, 'system-001');
      expect(updated.lifecycle).toBe(PlanLifecycle.FAILED);
    });

    it('T019: updates plan lifecycle to ABANDONED', () => {
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
      
      const updated = planningRepo.updatePlanLifecycle(plan.id, caseId, PlanLifecycle.ABANDONED, 'human-001');
      expect(updated.lifecycle).toBe(PlanLifecycle.ABANDONED);
    });
  });

  // ============================================================
  // PLAN ADMISSIBILITY TESTS
  // ============================================================

  describe('Plan Admissibility', () => {
    it('T020: creates plan with NOT_EVALUATED admissibility', () => {
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
      
      expect(plan.admissibility).toBe(PlanAdmissibility.NOT_EVALUATED);
    });

    it('T021: updates plan admissibility to ADMISSIBLE', () => {
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
      
      const updated = planningRepo.updatePlanAdmissibility(plan.id, caseId, PlanAdmissibility.ADMISSIBLE, 'system-001');
      expect(updated.admissibility).toBe(PlanAdmissibility.ADMISSIBLE);
    });

    it('T022: updates plan admissibility to INADMISSIBLE', () => {
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
      
      const updated = planningRepo.updatePlanAdmissibility(plan.id, caseId, PlanAdmissibility.INADMISSIBLE, 'system-001');
      expect(updated.admissibility).toBe(PlanAdmissibility.INADMISSIBLE);
    });

    it('T023: updates plan admissibility to CONTESTED', () => {
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
      
      const updated = planningRepo.updatePlanAdmissibility(plan.id, caseId, PlanAdmissibility.CONTESTED, 'human-001');
      expect(updated.admissibility).toBe(PlanAdmissibility.CONTESTED);
    });

    it('T024: CANDIDATE PLAN ≠ ADMISSIBLE PLAN', () => {
      expect(PlanAdmissibility.NOT_EVALUATED).not.toBe(PlanAdmissibility.ADMISSIBLE);
    });

    it('T025: ADMISSIBLE PLAN ≠ SELECTED PLAN', () => {
      expect(PlanAdmissibility.ADMISSIBLE).not.toBe(PlanLifecycle.SELECTED as any);
    });
  });

  // ============================================================
  // PLAN AUTHORITY TESTS
  // ============================================================

  describe('Plan Authority', () => {
    it('T026: creates plan with WITHIN_AUTHORITY status', () => {
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
      
      expect(plan.authorityStatus).toBe(PlanAuthority.WITHIN_AUTHORITY);
    });

    it('T027: updates plan authority to HUMAN_REVIEW_REQUIRED', () => {
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
      
      const updated = planningRepo.updatePlanAuthority(plan.id, caseId, PlanAuthority.HUMAN_REVIEW_REQUIRED, 'system-001');
      expect(updated.authorityStatus).toBe(PlanAuthority.HUMAN_REVIEW_REQUIRED);
    });

    it('T028: updates plan authority to AUTHORITY_BLOCKED', () => {
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
      
      const updated = planningRepo.updatePlanAuthority(plan.id, caseId, PlanAuthority.AUTHORITY_BLOCKED, 'human-001');
      expect(updated.authorityStatus).toBe(PlanAuthority.AUTHORITY_BLOCKED);
    });

    it('T029: CAPABILITY ≠ PERMISSION ≠ AUTHORITY', () => {
      expect(PlanAuthority.WITHIN_AUTHORITY).not.toBe(PlanAuthority.HUMAN_REVIEW_REQUIRED);
      expect(PlanAuthority.HUMAN_REVIEW_REQUIRED).not.toBe(PlanAuthority.AUTHORITY_BLOCKED);
    });
  });

  // ============================================================
  // EXECUTION MODE TESTS
  // ============================================================

  describe('Execution Mode', () => {
    it('T030: creates plan with NOT_EXECUTED mode', () => {
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
      
      expect(plan.executionMode).toBe(ExecutionMode.NOT_EXECUTED);
    });

    it('T031: updates plan execution mode to SIMULATED', () => {
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
      
      const updated = planningRepo.updatePlanExecutionMode(plan.id, caseId, ExecutionMode.SIMULATED, 'system-001');
      expect(updated.executionMode).toBe(ExecutionMode.SIMULATED);
    });

    it('T032: updates plan execution mode to OBSERVED', () => {
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
      
      const updated = planningRepo.updatePlanExecutionMode(plan.id, caseId, ExecutionMode.OBSERVED, 'system-001');
      expect(updated.executionMode).toBe(ExecutionMode.OBSERVED);
    });

    it('T033: SIMULATED ≠ EXECUTED', () => {
      expect(ExecutionMode.SIMULATED).not.toBe(ExecutionMode.OBSERVED);
    });

    it('T034: PLAN ≠ EXECUTION', () => {
      expect(ExecutionMode.NOT_EXECUTED).not.toBe(ExecutionMode.OBSERVED);
    });
  });

  // ============================================================
  // DEVIATION & REPLANNING TESTS
  // ============================================================

  describe('Deviation & Replanning', () => {
    it('T035: records plan deviation', () => {
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
      
      const deviation = planningRepo.recordDeviation(
        plan.id,
        caseId,
        'step-1',
        'expected state',
        'actual state',
        'MAJOR',
        'monitoring-system',
        ['ev-1' as EvidenceId]
      );
      
      expect(deviation).toBeDefined();
      expect(deviation.severity).toBe('MAJOR');
    });

    it('T036: records plan failure', () => {
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
      
      const failure = planningRepo.recordFailure(
        plan.id,
        caseId,
        'RESOURCE_FAILURE',
        'Critical resource unavailable',
        'HIGH',
        ['ev-1' as EvidenceId]
      );
      
      expect(failure).toBeDefined();
      expect(failure.severity).toBe('HIGH');
    });

    it('T037: creates plan repair', () => {
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
      
      const deviation = planningRepo.recordDeviation(
        plan.id,
        caseId,
        'step-1',
        'expected',
        'actual',
        'MINOR',
        'monitoring-system',
        []
      );
      
      const repair = planningRepo.createRepair(
        plan.id,
        caseId,
        deviation.id,
        ['action1', 'action2'],
        0.75,
        'system-001'
      );
      
      expect(repair).toBeDefined();
      expect(repair.successProbability).toBe(0.75);
    });

    it('T038: creates plan revision', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const planA = planningRepo.createPlan(
        caseId,
        'Plan A',
        'Original plan',
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
      
      const planB = planningRepo.createPlan(
        caseId,
        'Plan B',
        'Revised plan',
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
      
      const revision = planningRepo.createRevision(
        planA.id,
        planB.id,
        caseId,
        'Major deviation requires revised approach',
        'DEVIATION',
        'system-001'
      );
      
      expect(revision).toBeDefined();
      expect(revision.trigger).toBe('DEVIATION');
    });

    it('T039: creates replanning trigger', () => {
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
      
      const trigger = planningRepo.createReplanningTrigger(
        plan.id,
        caseId,
        'DEVIATION',
        'Major deviation detected',
        'HIGH'
      );
      
      expect(trigger).toBeDefined();
      expect(trigger.triggerType).toBe('DEVIATION');
    });

    it('T040: creates safe stop', () => {
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
      
      const safeStop = planningRepo.createSafeStop(
        plan.id,
        caseId,
        'Critical risk detected',
        'safe_state_1',
        'system-001',
        true
      );
      
      expect(safeStop).toBeDefined();
      expect(safeStop.requiresHumanAuthorization).toBe(true);
    });
  });

  // ============================================================
  // PLAN SUPERSESSION TESTS
  // ============================================================

  describe('Plan Supersession', () => {
    it('T041: supersedes old plan with new plan', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const planA = planningRepo.createPlan(
        caseId,
        'Plan A',
        'Original plan',
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
      
      const planB = planningRepo.createPlan(
        caseId,
        'Plan B',
        'Revised plan',
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
      
      planningRepo.supersedePlan(planA.id, planB.id, caseId, 'Replaced by Plan B', 'system-001');
      
      const updatedPlanA = planningRepo.getPlan(planA.id, caseId);
      expect(updatedPlanA?.supersededBy).toBe(planB.id);
    });

    it('T042: old plan remains reconstructable after supersession', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const planA = planningRepo.createPlan(
        caseId,
        'Plan A',
        'Original plan',
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
      
      const planB = planningRepo.createPlan(
        caseId,
        'Plan B',
        'Revised plan',
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
      
      planningRepo.supersedePlan(planA.id, planB.id, caseId, 'Replaced by Plan B', 'system-001');
      
      const oldPlan = planningRepo.getPlan(planA.id, caseId);
      expect(oldPlan).toBeDefined();
      expect(oldPlan?.name).toBe('Plan A');
    });
  });

  // ============================================================
  // WP5 DEMO TEST
  // ============================================================

  describe('WP5 Demo', () => {
    it('T043: demo executes successfully', () => {
      const result = runWP5Demo();
      expect(result.goals).toBeGreaterThanOrEqual(2);
      expect(result.constraints).toBeGreaterThanOrEqual(5);
      expect(result.operators).toBeGreaterThanOrEqual(3);
      expect(result.plans).toBeGreaterThanOrEqual(2);
      expect(result.deviations).toBeGreaterThanOrEqual(1);
      expect(result.repairs).toBeGreaterThanOrEqual(1);
      expect(result.revisions).toBeGreaterThanOrEqual(1);
      expect(result.triggers).toBeGreaterThanOrEqual(1);
      expect(result.safeStops).toBeGreaterThanOrEqual(1);
    });
  });
});
