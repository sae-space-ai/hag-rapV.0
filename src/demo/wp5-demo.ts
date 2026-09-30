/**
 * HAG-RAP V.2 — WP5 Synthetic Demo
 * Demonstrates Deep Planning & Continual Replanning capabilities
 */

import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  Modifiability,
  ExecutionMode,
  type EvidenceId,
  type AssumptionId,
  type UncertaintyId,
} from '../core/index.ts';
import {
  createPlanningEngineRepository,
  ConstraintType,
  PlanLifecycle,
  PlanAdmissibility,
  PlanAdaptation,
  PlanAuthority,
} from '../planning/index.ts';

export interface WP5DemoResult {
  goals: number;
  constraints: number;
  operators: number;
  plans: number;
  deviations: number;
  repairs: number;
  revisions: number;
  triggers: number;
  safeStops: number;
}

export function runWP5Demo(): WP5DemoResult {
  const ids = createSequentialIdProvider();
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  
  const planningRepo = createPlanningEngineRepository(ids, time);

  // Create 2 goals
  const goal1 = planningRepo.createGoal(
    caseId,
    'Optimize Resource Allocation',
    'Maximize efficiency while maintaining quality standards',
    8,
    ['Resource utilization > 85%', 'Quality score > 90%'],
    'human-director-001',
    Modifiability.HUMAN_LOCKED,
    'human-director-001'
  );

  const goal2 = planningRepo.createGoal(
    caseId,
    'Minimize Operational Risk',
    'Keep risk exposure within acceptable bounds',
    9,
    ['Risk score < 0.3', 'No critical failures'],
    'human-director-001',
    Modifiability.NON_NEGOTIABLE,
    'human-director-001'
  );

  // Create 5 constraints
  const constraint1 = planningRepo.createConstraint(
    caseId,
    'Budget Limit',
    'Total cost must not exceed $1M',
    ConstraintType.HARD,
    Modifiability.NON_NEGOTIABLE,
    'cost <= 1000000',
    'human-director-001'
  );

  const constraint2 = planningRepo.createConstraint(
    caseId,
    'Timeline',
    'Must complete within 6 months',
    ConstraintType.HARD,
    Modifiability.HUMAN_LOCKED,
    'duration <= 180 days',
    'human-director-001'
  );

  const constraint3 = planningRepo.createConstraint(
    caseId,
    'Quality Standard',
    'Maintain ISO 9001 compliance',
    ConstraintType.HARD,
    Modifiability.NON_NEGOTIABLE,
    'quality_score >= 90',
    'human-director-001'
  );

  const constraint4 = planningRepo.createConstraint(
    caseId,
    'Preferred Vendor',
    'Use preferred vendors when possible',
    ConstraintType.SOFT,
    Modifiability.SYSTEM_MODIFIABLE,
    'vendor_preference = preferred',
    'system-planner'
  );

  const constraint5 = planningRepo.createConstraint(
    caseId,
    'Team Size',
    'Keep team size manageable',
    ConstraintType.SOFT,
    Modifiability.LOCAL_DISCRETION,
    'team_size <= 20',
    'system-planner'
  );

  // Create 3 operators
  const operator1 = planningRepo.createOperator(
    caseId,
    'Allocate Resources',
    'Assign personnel and equipment to tasks',
    ['task_defined', 'resources_available'],
    ['resources_allocated', 'task_ready'],
    ['personnel', 'equipment'],
    'Medium uncertainty in resource availability',
    'system-planner'
  );

  const operator2 = planningRepo.createOperator(
    caseId,
    'Execute Task',
    'Perform planned task',
    ['task_ready', 'resources_allocated'],
    ['task_completed'],
    ['time', 'budget'],
    'Low uncertainty with proper preparation',
    'system-planner'
  );

  const operator3 = planningRepo.createOperator(
    caseId,
    'Monitor Progress',
    'Track task execution and detect deviations',
    ['task_in_progress'],
    ['progress_data', 'deviation_detected'],
    ['monitoring_tools'],
    'Low uncertainty',
    'system-planner'
  );

  // Create Plan A (initial plan)
  const planA = planningRepo.createPlan(
    caseId,
    'Plan A: Standard Approach',
    'Conventional resource allocation strategy',
    [goal1.id, goal2.id],
    [constraint1.id, constraint2.id, constraint3.id],
    [
      {
        id: 'step-1',
        operatorId: operator1.id,
        preconditions: ['project_initiated'],
        effects: ['resources_allocated'],
        resourceRequirements: ['planning_team'],
        dependencies: [],
        uncertainty: 'Low',
        evidenceBasis: ['ev-1' as EvidenceId],
      },
      {
        id: 'step-2',
        operatorId: operator2.id,
        preconditions: ['resources_allocated'],
        effects: ['phase1_completed'],
        resourceRequirements: ['execution_team'],
        dependencies: ['step-1'],
        uncertainty: 'Medium',
        evidenceBasis: ['ev-2' as EvidenceId],
      },
      {
        id: 'step-3',
        operatorId: operator3.id,
        preconditions: ['phase1_completed'],
        effects: ['progress_reported'],
        resourceRequirements: ['monitoring_team'],
        dependencies: ['step-2'],
        uncertainty: 'Low',
        evidenceBasis: ['ev-3' as EvidenceId],
      },
    ],
    { level: 'STRATEGIC', subplanIds: [] },
    [],
    [],
    [],
    [],
    ['ev-1' as EvidenceId, 'ev-2' as EvidenceId, 'ev-3' as EvidenceId],
    ['asm-1' as AssumptionId],
    ['unc-1' as UncertaintyId],
    'wm-v1',
    'system-planner'
  );

  // Evaluate Plan A
  planningRepo.evaluatePlan(
    planA.id,
    caseId,
    {
      planId: planA.id,
      goalSatisfaction: 0.85,
      constraintSatisfaction: 0.95,
      riskScore: 0.25,
      uncertaintyScore: 0.30,
      resourceUsage: 0.80,
      robustness: 0.70,
      overallScore: 0.80,
      evaluationNotes: 'Good balance of goals and constraints',
    },
    'system-planner'
  );

  planningRepo.updatePlanAdmissibility(planA.id, caseId, PlanAdmissibility.ADMISSIBLE, 'system-planner');
  planningRepo.updatePlanLifecycle(planA.id, caseId, PlanLifecycle.SELECTED, 'human-director-001');
  planningRepo.updatePlanExecutionMode(planA.id, caseId, ExecutionMode.NOT_EXECUTED, 'system-planner');

  // Simulate deviation during execution
  const deviation1 = planningRepo.recordDeviation(
    planA.id,
    caseId,
    'step-2',
    'phase1_completed on time',
    'phase1_delayed by 2 weeks due to resource shortage',
    'MAJOR',
    'monitoring-system',
    ['ev-4' as EvidenceId, 'ev-5' as EvidenceId]
  );

  // Record failure
  planningRepo.recordFailure(
    planA.id,
    caseId,
    'RESOURCE_SHORTAGE',
    'Critical resources unavailable due to competing priorities',
    'HIGH',
    ['ev-4' as EvidenceId]
  );

  // Create replanning trigger
  planningRepo.createReplanningTrigger(
    planA.id,
    caseId,
    'DEVIATION',
    'Major deviation detected in step-2: resource shortage causing 2-week delay',
    'HIGH'
  );

  // Attempt local repair (minor)
  const repair1 = planningRepo.createRepair(
    planA.id,
    caseId,
    deviation1.id,
    ['Reallocate resources from non-critical tasks', 'Extend timeline by 1 week'],
    0.65,
    'system-planner'
  );

  // Determine repair insufficient, create Plan B
  const planB = planningRepo.createPlan(
    caseId,
    'Plan B: Revised Approach',
    'Revised plan accounting for resource constraints',
    [goal1.id, goal2.id],
    [constraint1.id, constraint2.id, constraint3.id, constraint4.id],
    [
      {
        id: 'step-b1',
        operatorId: operator1.id,
        preconditions: ['project_initiated'],
        effects: ['critical_resources_allocated'],
        resourceRequirements: ['core_team'],
        dependencies: [],
        uncertainty: 'Low',
        evidenceBasis: ['ev-1' as EvidenceId, 'ev-4' as EvidenceId],
      },
      {
        id: 'step-b2',
        operatorId: operator2.id,
        preconditions: ['critical_resources_allocated'],
        effects: ['phase1_partial'],
        resourceRequirements: ['reduced_team'],
        dependencies: ['step-b1'],
        uncertainty: 'Medium',
        evidenceBasis: ['ev-5' as EvidenceId],
      },
      {
        id: 'step-b3',
        operatorId: operator3.id,
        preconditions: ['phase1_partial'],
        effects: ['progress_assessed'],
        resourceRequirements: ['monitoring_team'],
        dependencies: ['step-b2'],
        uncertainty: 'Low',
        evidenceBasis: ['ev-6' as EvidenceId],
      },
    ],
    { level: 'STRATEGIC', subplanIds: [] },
    [],
    [],
    [],
    [],
    ['ev-1' as EvidenceId, 'ev-4' as EvidenceId, 'ev-5' as EvidenceId, 'ev-6' as EvidenceId],
    ['asm-1' as AssumptionId, 'asm-2' as AssumptionId],
    ['unc-1' as UncertaintyId, 'unc-2' as UncertaintyId],
    'wm-v2',
    'system-planner'
  );

  // Evaluate Plan B
  planningRepo.evaluatePlan(
    planB.id,
    caseId,
    {
      planId: planB.id,
      goalSatisfaction: 0.75,
      constraintSatisfaction: 0.90,
      riskScore: 0.35,
      uncertaintyScore: 0.40,
      resourceUsage: 0.70,
      robustness: 0.65,
      overallScore: 0.72,
      evaluationNotes: 'Lower score but more realistic given constraints',
    },
    'system-planner'
  );

  planningRepo.updatePlanAdmissibility(planB.id, caseId, PlanAdmissibility.ADMISSIBLE, 'system-planner');

  // Create revision linking Plan A to Plan B
  planningRepo.createRevision(
    planA.id,
    planB.id,
    caseId,
    'Major deviation due to resource shortage requires revised approach',
    'DEVIATION',
    'system-planner'
  );

  // Supersede Plan A with Plan B
  planningRepo.supersedePlan(planA.id, planB.id, caseId, 'Replaced by Plan B due to resource constraints', 'system-planner');

  // Update Plan A adaptation status
  planningRepo.updatePlanAdaptation(planA.id, caseId, PlanAdaptation.REPLANNING, 'system-planner');

  // Create safe stop for Plan A
  planningRepo.createSafeStop(
    planA.id,
    caseId,
    'Major deviation detected, plan requires human review before continuation',
    'phase1_in_progress_with_delays',
    'system-planner',
    true
  );

  // Update Plan A authority status
  planningRepo.updatePlanAuthority(planA.id, caseId, PlanAuthority.HUMAN_REVIEW_REQUIRED, 'system-planner');

  return {
    goals: 2,
    constraints: 5,
    operators: 3,
    plans: 2,
    deviations: 1,
    repairs: 1,
    revisions: 1,
    triggers: 1,
    safeStops: 1,
  };
}
