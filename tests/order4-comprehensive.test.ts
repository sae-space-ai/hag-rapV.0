/**
 * HAG-RAP V.2 — Order 4 Comprehensive Tests (WP5)
 * Additional comprehensive tests to reach 100+ new tests for WP5
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

describe('WP5 - Comprehensive Planning Tests', () => {
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
  // OPERATOR TESTS
  // ============================================================

  describe('Operators', () => {
    it('T067: creates operator with preconditions', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        ['precondition1', 'precondition2'],
        ['effect1'],
        ['resource1'],
        'Low uncertainty',
        'system-001'
      );
      expect(operator.preconditions).toContain('precondition1');
      expect(operator.preconditions).toContain('precondition2');
    });

    it('T068: creates operator with effects', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        ['effect1', 'effect2'],
        [],
        'Medium uncertainty',
        'system-001'
      );
      expect(operator.effects).toContain('effect1');
      expect(operator.effects).toContain('effect2');
    });

    it('T069: creates operator with resource requirements', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        [],
        ['resource1', 'resource2', 'resource3'],
        'High uncertainty',
        'system-001'
      );
      expect(operator.resourceRequirements).toContain('resource1');
      expect(operator.resourceRequirements).toContain('resource2');
      expect(operator.resourceRequirements).toContain('resource3');
    });

    it('T070: operator has uncertainty field', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        [],
        [],
        'Very high uncertainty in outcomes',
        'system-001'
      );
      expect(operator.uncertainty).toBe('Very high uncertainty in outcomes');
    });

    it('T071: operator has provenance', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        [],
        [],
        'Low',
        'system-001'
      );
      expect(operator.provenance).toBeDefined();
      expect(operator.provenance.producer).toBe('system-001');
    });

    it('T072: operator has versioning', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        [],
        [],
        'Low',
        'system-001'
      );
      expect(operator.versioning).toBeDefined();
      expect(operator.versioning.version).toBe(1);
    });

    it('T073: retrieves operator by ID', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        [],
        [],
        'Low',
        'system-001'
      );
      const retrieved = planningRepo.getOperator(operator.id, caseId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(operator.id);
    });

    it('T074: rejects cross-case operator access', () => {
      const operator = planningRepo.createOperator(
        caseId,
        'Test Operator',
        'Test description',
        [],
        [],
        [],
        'Low',
        'system-001'
      );
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => planningRepo.getOperator(operator.id, otherCaseId)).toThrow(DomainError);
    });
  });

  // ============================================================
  // PLAN STRUCTURE TESTS
  // ============================================================

  describe('Plan Structure', () => {
    it('T075: creates plan with steps', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const steps = [
        { id: 'step-1', operatorId: 'op-1', preconditions: [], effects: [], resourceRequirements: [], dependencies: [], uncertainty: 'Low', evidenceBasis: [] },
        { id: 'step-2', operatorId: 'op-2', preconditions: [], effects: [], resourceRequirements: [], dependencies: ['step-1'], uncertainty: 'Medium', evidenceBasis: [] },
      ];
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        steps,
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
      
      expect(plan.steps.length).toBe(2);
      expect(plan.steps[0].id).toBe('step-1');
      expect(plan.steps[1].dependencies).toContain('step-1');
    });

    it('T076: creates plan with hierarchy', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'TACTICAL', subplanIds: [] },
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
      
      expect(plan.hierarchy.level).toBe('TACTICAL');
      expect(plan.hierarchy.subplanIds).toEqual([]);
    });

    it('T077: creates plan with dependencies', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const dependencies = [
        { fromPlanId: 'plan-1' as any, toPlanId: 'plan-2' as any, type: 'REQUIRES' as const },
        { fromPlanId: 'plan-2' as any, toPlanId: 'plan-3' as any, type: 'BLOCKS' as const },
      ];
      
      const plan = planningRepo.createPlan(
        caseId,
        'Test Plan',
        'Test description',
        [goal.id],
        [constraint.id],
        [],
        { level: 'STRATEGIC', subplanIds: [] },
        dependencies,
        [],
        [],
        [],
        [],
        [],
        [],
        'wm-v1',
        'system-001'
      );
      
      expect(plan.dependencies.length).toBe(2);
      expect(plan.dependencies[0].type).toBe('REQUIRES');
      expect(plan.dependencies[1].type).toBe('BLOCKS');
    });

    it('T078: creates plan with assumptions', () => {
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
        ['asm-1', 'asm-2', 'asm-3'] as any,
        [],
        'wm-v1',
        'system-001'
      );
      
      expect(plan.assumptions.length).toBe(3);
    });

    it('T079: creates plan with uncertainties', () => {
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
        ['unc-1', 'unc-2'] as any,
        'wm-v1',
        'system-001'
      );
      
      expect(plan.uncertainties.length).toBe(2);
    });

    it('T080: plan has unique version ID', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan1 = planningRepo.createPlan(caseId, 'Plan 1', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      const plan2 = planningRepo.createPlan(caseId, 'Plan 2', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      expect(plan1.version).not.toBe(plan2.version);
    });
  });

  // ============================================================
  // DEVIATION SEVERITY TESTS
  // ============================================================

  describe('Deviation Severity', () => {
    it('T081: records MINOR deviation', () => {
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
      expect(deviation.severity).toBe('MINOR');
    });

    it('T082: records MAJOR deviation', () => {
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
      
      const deviation = planningRepo.recordDeviation(plan.id, caseId, 'step-1', 'expected', 'actual', 'MAJOR', 'monitor', []);
      expect(deviation.severity).toBe('MAJOR');
    });

    it('T083: records CRITICAL deviation', () => {
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
      
      const deviation = planningRepo.recordDeviation(plan.id, caseId, 'step-1', 'expected', 'actual', 'CRITICAL', 'monitor', []);
      expect(deviation.severity).toBe('CRITICAL');
    });

    it('T084: deviation has timestamp', () => {
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
      expect(deviation.detectedAt).toBeDefined();
    });

    it('T085: deviation has detector', () => {
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
      
      const deviation = planningRepo.recordDeviation(plan.id, caseId, 'step-1', 'expected', 'actual', 'MINOR', 'monitoring-system-001', []);
      expect(deviation.detectedBy).toBe('monitoring-system-001');
    });
  });

  // ============================================================
  // FAILURE SEVERITY TESTS
  // ============================================================

  describe('Failure Severity', () => {
    it('T086: records LOW severity failure', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const failure = planningRepo.recordFailure(plan.id, caseId, 'FAILURE_TYPE', 'description', 'LOW', []);
      expect(failure.severity).toBe('LOW');
    });

    it('T087: records MEDIUM severity failure', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const failure = planningRepo.recordFailure(plan.id, caseId, 'FAILURE_TYPE', 'description', 'MEDIUM', []);
      expect(failure.severity).toBe('MEDIUM');
    });

    it('T088: records HIGH severity failure', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const failure = planningRepo.recordFailure(plan.id, caseId, 'FAILURE_TYPE', 'description', 'HIGH', []);
      expect(failure.severity).toBe('HIGH');
    });

    it('T089: records CRITICAL severity failure', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const failure = planningRepo.recordFailure(plan.id, caseId, 'FAILURE_TYPE', 'description', 'CRITICAL', []);
      expect(failure.severity).toBe('CRITICAL');
    });

    it('T090: failure has timestamp', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const failure = planningRepo.recordFailure(plan.id, caseId, 'FAILURE_TYPE', 'description', 'HIGH', []);
      expect(failure.detectedAt).toBeDefined();
    });
  });

  // ============================================================
  // REPAIR TESTS
  // ============================================================

  describe('Repairs', () => {
    it('T091: repair has multiple actions', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Plan',
        'desc',
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
      const repair = planningRepo.createRepair(plan.id, caseId, deviation.id, ['action1', 'action2', 'action3'], 0.80, 'system-001');
      
      expect(repair.repairActions.length).toBe(3);
    });

    it('T092: repair has approval timestamp', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Plan',
        'desc',
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
      const repair = planningRepo.createRepair(plan.id, caseId, deviation.id, ['action1'], 0.75, 'system-001');
      
      expect(repair.approvedAt).toBeDefined();
    });

    it('T093: repair has approver', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(
        caseId,
        'Plan',
        'desc',
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
      const repair = planningRepo.createRepair(plan.id, caseId, deviation.id, ['action1'], 0.75, 'human-approver-001');
      
      expect(repair.approvedBy).toBe('human-approver-001');
    });
  });

  // ============================================================
  // REVISION TRIGGER TESTS
  // ============================================================

  describe('Revision Triggers', () => {
    it('T094: creates DEVIATION trigger', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'DEVIATION', 'Major deviation detected', 'HIGH');
      expect(trigger.triggerType).toBe('DEVIATION');
    });

    it('T095: creates NEW_EVIDENCE trigger', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'NEW_EVIDENCE', 'New evidence available', 'MEDIUM');
      expect(trigger.triggerType).toBe('NEW_EVIDENCE');
    });

    it('T096: creates HUMAN_REQUEST trigger', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'HUMAN_REQUEST', 'Human requested replanning', 'LOW');
      expect(trigger.triggerType).toBe('HUMAN_REQUEST');
    });

    it('T097: creates WORLD_STATE_CHANGE trigger', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'WORLD_STATE_CHANGE', 'World state changed significantly', 'HIGH');
      expect(trigger.triggerType).toBe('WORLD_STATE_CHANGE');
    });

    it('T098: creates CONSTRAINT_VIOLATION trigger', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'CONSTRAINT_VIOLATION', 'Constraint violated', 'CRITICAL');
      expect(trigger.triggerType).toBe('CONSTRAINT_VIOLATION');
    });

    it('T099: trigger has timestamp', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'DEVIATION', 'description', 'HIGH');
      expect(trigger.triggeredAt).toBeDefined();
    });

    it('T100: trigger has severity', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const trigger = planningRepo.createReplanningTrigger(plan.id, caseId, 'DEVIATION', 'description', 'CRITICAL');
      expect(trigger.severity).toBe('CRITICAL');
    });
  });

  // ============================================================
  // SAFE STOP TESTS
  // ============================================================

  describe('Safe Stop', () => {
    it('T101: safe stop has reason', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const safeStop = planningRepo.createSafeStop(plan.id, caseId, 'Critical risk detected', 'safe_state', 'system-001', true);
      expect(safeStop.reason).toBe('Critical risk detected');
    });

    it('T102: safe stop has safe state', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const safeStop = planningRepo.createSafeStop(plan.id, caseId, 'reason', 'stable_state_v1', 'system-001', true);
      expect(safeStop.safeState).toBe('stable_state_v1');
    });

    it('T103: safe stop has timestamp', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const safeStop = planningRepo.createSafeStop(plan.id, caseId, 'reason', 'state', 'system-001', true);
      expect(safeStop.stoppedAt).toBeDefined();
    });

    it('T104: safe stop has stopper', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const safeStop = planningRepo.createSafeStop(plan.id, caseId, 'reason', 'state', 'safety-system-001', true);
      expect(safeStop.stoppedBy).toBe('safety-system-001');
    });

    it('T105: safe stop can require human authorization', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const safeStop = planningRepo.createSafeStop(plan.id, caseId, 'reason', 'state', 'system-001', true);
      expect(safeStop.requiresHumanAuthorization).toBe(true);
    });

    it('T106: safe stop can not require human authorization', () => {
      const goal = planningRepo.createGoal(caseId, 'Goal', 'desc', 5, [], 'human-001', Modifiability.HUMAN_LOCKED, 'human-001');
      const constraint = planningRepo.createConstraint(caseId, 'Constraint', 'desc', ConstraintType.HARD, Modifiability.NON_NEGOTIABLE, 'x <= 100', 'human-001');
      
      const plan = planningRepo.createPlan(caseId, 'Plan', 'desc', [goal.id], [constraint.id], [], { level: 'STRATEGIC', subplanIds: [] }, [], [], [], [], [], [], [], 'wm-v1', 'system-001');
      
      const safeStop = planningRepo.createSafeStop(plan.id, caseId, 'reason', 'state', 'system-001', false);
      expect(safeStop.requiresHumanAuthorization).toBe(false);
    });
  });
});
