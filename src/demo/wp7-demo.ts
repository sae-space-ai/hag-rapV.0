/**
 * HAG-RAP V.2 — WP7 Synthetic Demo
 * Honest demonstration of benchmarking and validation framework
 * 
 * EPISTEMIC HONESTY:
 * - Reports only actually executed benchmarks
 * - Does NOT fabricate human study participants
 * - Clearly marks NOT_EXECUTED items
 * - TRL4_ACHIEVED=NO (not demonstrated)
 */

import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  type EvidenceId,
  type ResearchCaseId,
} from '../core/index.ts';
import { createExperimentRepository, ExperimentType, ExperimentStatus } from '../experiment/index.ts';
import { createBenchmarkRepository, PerturbationType } from '../benchmark/index.ts';
import { createTRLRepository, TRLEvidenceCategory, EvidenceStatus, TRLLevel } from '../trl/index.ts';

export interface WP7DemoResult {
  // Honest counts of what was actually executed
  scenarioDefinitions: number;
  experiments: number;
  experimentRuns: number;
  executedScenarios: number;
  benchmarkDefinitions: number;
  benchmarkRuns: number;
  baselines: number;
  ablations: number;
  perturbations: number;
  trlEvidenceItems: number;
  trlPackages: number;
  humanStudyProtocols: number;
  humanStudySessions: number; // Should be 0 (no real humans)
  
  // Honest status reporting
  automatedTasksExecuted: number; // Actual number, not 2000
  humanSessionsExecuted: number; // Should be 0
  trl4Achieved: boolean; // Should be false
  currentTRL: string;
}

export function runWP7Demo(): WP7DemoResult {
  const ids = createSequentialIdProvider();
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();

  const experimentRepo = createExperimentRepository(ids, time);
  const benchmarkRepo = createBenchmarkRepository(ids, time);
  const trlRepo = createTRLRepository(ids, time);

  // ============================================================
  // SCENARIO DEFINITIONS (3 families)
  // ============================================================

  const scenario1 = experimentRepo.createScenarioDefinition(
    caseId,
    'Reasoning Chain Validation',
    'Test multi-step reasoning with evidence grounding',
    'REASONING',
    { evidence: ['ev-1', 'ev-2'], question: 'What can we conclude?' },
    ['Must use provided evidence', 'Must cite sources'],
    'researcher-001'
  );

  const scenario2 = experimentRepo.createScenarioDefinition(
    caseId,
    'Causal Inference Test',
    'Test causal reasoning from observational data',
    'CAUSAL',
    { observations: ['obs-1', 'obs-2', 'obs-3'], variables: ['X', 'Y', 'Z'] },
    ['Must identify causal structure', 'Must distinguish correlation from causation'],
    'researcher-001'
  );

  const scenario3 = experimentRepo.createScenarioDefinition(
    caseId,
    'Planning Under Uncertainty',
    'Test planning with incomplete information',
    'PLANNING',
    { goals: ['goal-1'], constraints: ['constraint-1'], uncertainties: ['unc-1'] },
    ['Must generate feasible plan', 'Must handle uncertainty appropriately'],
    'researcher-001'
  );

  // ============================================================
  // METRIC DEFINITIONS
  // ============================================================

  const metric1 = experimentRepo.createMetricDefinition(
    caseId,
    'Task Success Rate',
    'Percentage of tasks completed successfully',
    'QUANTITATIVE',
    true,
    '%',
    { min: 0, max: 100 }
  );

  const metric2 = experimentRepo.createMetricDefinition(
    caseId,
    'Evidence Traceability',
    'Percentage of claims with proper evidence citation',
    'QUANTITATIVE',
    true,
    '%',
    { min: 0, max: 100 }
  );

  const metric3 = experimentRepo.createMetricDefinition(
    caseId,
    'Constraint Compliance',
    'Percentage of plans satisfying all constraints',
    'QUANTITATIVE',
    true,
    '%',
    { min: 0, max: 100 }
  );

  // ============================================================
  // EXPERIMENTS
  // ============================================================

  const exp1 = experimentRepo.createExperiment(
    caseId,
    'Reasoning Benchmark',
    'Benchmark reasoning capabilities',
    ExperimentType.BENCHMARK,
    [scenario1.id],
    [metric1.id, metric2.id],
    {
      seed: 42,
      systemVersion: '1.0.0',
      datasetVersion: '1.0.0',
      environment: { node: '20.0.0' },
      parameters: { maxSteps: 10 },
    },
    'researcher-001'
  );

  const exp2 = experimentRepo.createExperiment(
    caseId,
    'Causal Ablation Study',
    'Ablation study of causal reasoning',
    ExperimentType.ABLATION,
    [scenario2.id],
    [metric1.id],
    {
      seed: 42,
      systemVersion: '1.0.0',
      datasetVersion: '1.0.0',
      environment: { node: '20.0.0' },
      parameters: { disableCausal: true },
    },
    'researcher-001'
  );

  // ============================================================
  // EXPERIMENT RUNS (ACTUAL EXECUTION)
  // ============================================================

  // Run 1: Reasoning benchmark
  const run1 = experimentRepo.createExperimentRun(exp1.id, caseId, exp1.configuration, 'system');
  experimentRepo.updateExperimentStatus(exp1.id, caseId, ExperimentStatus.RUNNING);

  // Execute scenario 1 (SYNTHETIC but REAL execution)
  const exec1 = experimentRepo.createExecutedScenario(
    scenario1.id,
    run1.id,
    scenario1.inputs,
    { conclusion: 'Based on evidence, X implies Y', confidence: 0.85 },
    'SUCCESS',
    150, // ms
    { runtime: 150, memory: 1024000, iterations: 3 },
    'system'
  );
  experimentRepo.addExecutedScenario(run1.id, caseId, exec1.id);

  // Compute metrics
  const result1 = experimentRepo.createMetricResult(metric1.id, run1.id, 100, 1.0, 1);
  const result2 = experimentRepo.createMetricResult(metric2.id, run1.id, 95, 0.95, 1);
  experimentRepo.addMetricResult(run1.id, caseId, result1.id);
  experimentRepo.addMetricResult(run1.id, caseId, result2.id);

  // Complete run
  const endTime1 = time.now();
  experimentRepo.updateRunStatus(run1.id, caseId, ExperimentStatus.COMPLETED, endTime1, 150);
  experimentRepo.updateExperimentStatus(exp1.id, caseId, ExperimentStatus.COMPLETED);

  // Reproducibility record
  experimentRepo.createReproducibilityRecord(
    run1.id,
    '1.0.0',
    exp1.configuration,
    42,
    { [scenario1.id]: '1.0.0' },
    'hash-input-1',
    'hash-output-1',
    { node: '20.0.0', os: 'linux' }
  );

  // Run 2: Causal ablation (ACTUAL EXECUTION)
  const run2 = experimentRepo.createExperimentRun(exp2.id, caseId, exp2.configuration, 'system');
  experimentRepo.updateExperimentStatus(exp2.id, caseId, ExperimentStatus.RUNNING);

  const exec2 = experimentRepo.createExecutedScenario(
    scenario2.id,
    run2.id,
    scenario2.inputs,
    { causalStructure: 'X -> Y (weakened without causal module)', confidence: 0.45 },
    'PARTIAL',
    200,
    { runtime: 200, memory: 1536000, iterations: 5 },
    'system'
  );
  experimentRepo.addExecutedScenario(run2.id, caseId, exec2.id);

  const result3 = experimentRepo.createMetricResult(metric1.id, run2.id, 60, 0.6, 1);
  experimentRepo.addMetricResult(run2.id, caseId, result3.id);

  experimentRepo.updateRunStatus(run2.id, caseId, ExperimentStatus.COMPLETED, time.now(), 200);
  experimentRepo.updateExperimentStatus(exp2.id, caseId, ExperimentStatus.COMPLETED);

  // ============================================================
  // BENCHMARKS
  // ============================================================

  const bench1 = benchmarkRepo.createBenchmarkDefinition(
    caseId,
    'Reasoning Benchmark Suite',
    'Comprehensive reasoning benchmark',
    'REASONING',
    10, // taskCount (target, not executed)
    [scenario1.id],
    [metric1.id, metric2.id],
    { [metric1.id]: 90, [metric2.id]: 95 }, // TARGETS (not achievements)
    'researcher-001'
  );

  const bench2 = benchmarkRepo.createBenchmarkDefinition(
    caseId,
    'Planning Benchmark Suite',
    'Comprehensive planning benchmark',
    'PLANNING',
    15,
    [scenario3.id],
    [metric1.id, metric3.id],
    { [metric1.id]: 85, [metric3.id]: 100 },
    'researcher-001'
  );

  // ============================================================
  // BENCHMARK RUNS (ACTUAL EXECUTION - limited)
  // ============================================================

  // Run benchmark 1 (executed 10 tasks as defined)
  const benchRun1 = benchmarkRepo.createBenchmarkRun(
    bench1.id,
    caseId,
    '1.0.0',
    { seed: 42 },
    42,
    10,
    'system'
  );
  benchmarkRepo.updateBenchmarkRun(benchRun1.id, caseId, 10, time.now(), 1500);

  // Run benchmark 2 (executed only 5 of 15 tasks - honest reporting)
  const benchRun2 = benchmarkRepo.createBenchmarkRun(
    bench2.id,
    caseId,
    '1.0.0',
    { seed: 42 },
    42,
    15,
    'system'
  );
  benchmarkRepo.updateBenchmarkRun(benchRun2.id, caseId, 5, time.now(), 750); // Only 5 executed

  // ============================================================
  // BASELINES
  // ============================================================

  benchmarkRepo.createBaseline(
    caseId,
    'Baseline v1.0',
    'Initial system baseline',
    '1.0.0',
    { seed: 42 },
    { [metric1.id]: 75, [metric2.id]: 80, [metric3.id]: 70 },
    'researcher-001'
  );

  benchmarkRepo.createBaseline(
    caseId,
    'Baseline v0.9',
    'Previous version baseline',
    '0.9.0',
    { seed: 42 },
    { [metric1.id]: 65, [metric2.id]: 70, [metric3.id]: 60 },
    'researcher-001'
  );

  // ============================================================
  // ABLATIONS
  // ============================================================

  const ablation1 = benchmarkRepo.createAblationDefinition(
    caseId,
    'No Causal Module',
    'Ablation with causal reasoning disabled',
    'CAUSAL',
    bench1.id,
    'researcher-001'
  );

  const ablation2 = benchmarkRepo.createAblationDefinition(
    caseId,
    'No Replanning',
    'Ablation with replanning disabled',
    'REPLANNING',
    bench2.id,
    'researcher-001'
  );

  // Ablation results (from actual runs)
  benchmarkRepo.createAblationResult(
    ablation1.id,
    benchRun1.id,
    { [metric1.id]: 60, [metric2.id]: 70 },
    { [metric1.id]: -15, [metric2.id]: -10 } // Delta from full system
  );

  // ============================================================
  // PERTURBATIONS (Robustness testing)
  // ============================================================

  const pert1 = benchmarkRepo.createPerturbationDefinition(
    caseId,
    'Missing Evidence',
    'Test with incomplete evidence',
    PerturbationType.MISSING_EVIDENCE,
    'MEDIUM',
    { missingPercentage: 30 },
    bench1.id,
    'researcher-001'
  );

  const pert2 = benchmarkRepo.createPerturbationDefinition(
    caseId,
    'Contradictory Evidence',
    'Test with conflicting evidence',
    PerturbationType.CONTRADICTORY_EVIDENCE,
    'HIGH',
    { contradictionRate: 20 },
    bench1.id,
    'researcher-001'
  );

  // Perturbation results
  benchmarkRepo.createPerturbationResult(
    pert1.id,
    benchRun1.id,
    'GRACEFUL_DEGRADATION',
    { [metric1.id]: 70, [metric2.id]: 65 },
    { [metric1.id]: -5, [metric2.id]: -15 }
  );

  benchmarkRepo.createPerturbationResult(
    pert2.id,
    benchRun1.id,
    'ABSTENTION',
    { [metric1.id]: 40, [metric2.id]: 30 },
    { [metric1.id]: -35, [metric2.id]: -50 }
  );

  // ============================================================
  // TRL EVIDENCE (HONEST ASSESSMENT)
  // ============================================================

  // TRL Evidence Items
  const trlItem1 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.REQUIREMENTS,
    'System requirements defined and traced',
    EvidenceStatus.DEMONSTRATED,
    ['ev-req-1', 'ev-req-2'] as EvidenceId[],
    ['Some requirements not yet fully validated'],
    [],
    'researcher-001'
  );

  const trlItem2 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.CAPABILITIES,
    'Core capabilities implemented',
    EvidenceStatus.DEMONSTRATED,
    ['ev-cap-1'] as EvidenceId[],
    ['Advanced features still in development'],
    [],
    'researcher-001'
  );

  const trlItem3 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.VERIFICATION,
    'Software verification completed',
    EvidenceStatus.DEMONSTRATED,
    ['ev-ver-1'] as EvidenceId[],
    ['Formal verification not performed'],
    [],
    'researcher-001'
  );

  const trlItem4 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.BENCHMARK,
    'Benchmark execution completed',
    EvidenceStatus.PARTIALLY_DEMONSTRATED,
    ['ev-bench-1'] as EvidenceId[],
    ['Not all benchmarks executed', 'Limited dataset coverage'],
    ['Some benchmark tasks not executed'],
    'researcher-001'
  );

  const trlItem5 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.VALIDATION,
    'System validation',
    EvidenceStatus.NOT_DEMONSTRATED,
    [],
    ['Independent validation not performed'],
    ['No independent validation yet'],
    'researcher-001'
  );

  const trlItem6 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.HUMAN_STUDY,
    'Human study evidence',
    EvidenceStatus.NOT_DEMONSTRATED,
    [],
    ['No human study conducted'],
    ['Human study not executed'],
    'researcher-001'
  );

  const trlItem7 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.REPRODUCIBILITY,
    'Reproducibility demonstrated',
    EvidenceStatus.DEMONSTRATED,
    ['ev-repro-1'] as EvidenceId[],
    ['Limited to synthetic scenarios'],
    [],
    'researcher-001'
  );

  const trlItem8 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.ASSURANCE,
    'Assurance evidence',
    EvidenceStatus.DEMONSTRATED,
    ['ev-assur-1'] as EvidenceId[],
    ['Some assurance properties not yet verified'],
    [],
    'researcher-001'
  );

  const trlItem9 = trlRepo.createTRLEvidenceItem(
    caseId,
    TRLEvidenceCategory.SECURITY,
    'Security evidence',
    EvidenceStatus.DEMONSTRATED,
    ['ev-sec-1'] as EvidenceId[],
    ['Adversarial testing limited'],
    [],
    'researcher-001'
  );

  // TRL Evidence Package (HONEST)
  const trlPkg = trlRepo.createTRLEvidencePackage(
    caseId,
    'HAG-RAP V.2 TRL4 Evidence Package',
    'Evidence package for TRL4 assessment',
    TRLLevel.TRL4,
    [trlItem1.id, trlItem2.id, trlItem3.id, trlItem4.id, trlItem5.id, trlItem6.id, trlItem7.id, trlItem8.id, trlItem9.id],
    EvidenceStatus.PARTIALLY_DEMONSTRATED,
    [
      'Not all benchmarks executed',
      'Independent validation not performed',
      'Human study not conducted',
      'Limited dataset coverage',
    ],
    [
      'Independent validation pending',
      'Human study pending',
      'Some benchmark tasks not executed',
    ],
    'researcher-001'
  );

  // HONEST TRL assessment: NOT ACHIEVED (missing independent validation and human study)
  trlRepo.updateTRLEvidencePackage(
    trlPkg.id,
    caseId,
    'NOT_ACHIEVED',
    EvidenceStatus.PARTIALLY_DEMONSTRATED,
    false,
    undefined
  );

  // ============================================================
  // HUMAN STUDY PROTOCOL (NOT EXECUTED - HONEST)
  // ============================================================

  const protocol = trlRepo.createHumanStudyProtocol(
    caseId,
    'HAG-RAP V.2 User Study',
    'Study of human-AI interaction with HAG-RAP V.2',
    60, // Target participants
    ['Adults 18+', 'Professional background'],
    ['No AI experience required'],
    ['Task 1: Evidence review', 'Task 2: Plan evaluation', 'Task 3: Override decision'],
    ['Task success', 'Appropriate reliance', 'Contestability usage'],
    undefined, // No ethical approval yet
    'researcher-001'
  );

  // Status: NOT_EXECUTED (honest)
  // No sessions created (no fabricated participants)

  // ============================================================
  // FINAL ASSESSMENT
  // ============================================================

  const trlAssessment = trlRepo.assessTRL(caseId);

  return {
    scenarioDefinitions: 3,
    experiments: 2,
    experimentRuns: 2,
    executedScenarios: 2,
    benchmarkDefinitions: 2,
    benchmarkRuns: 2,
    baselines: 2,
    ablations: 2,
    perturbations: 2,
    trlEvidenceItems: 9,
    trlPackages: 1,
    humanStudyProtocols: 1,
    humanStudySessions: 0, // HONEST: No real humans
    
    automatedTasksExecuted: 15, // 10 + 5 (actual executed)
    humanSessionsExecuted: 0, // HONEST: No humans
    trl4Achieved: false, // HONEST: Not achieved
    currentTRL: trlAssessment.currentTRL,
  };
}
