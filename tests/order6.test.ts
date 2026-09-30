/**
 * HAG-RAP V.2 — Order 6 Tests (WP7)
 * Tests for Benchmarking, Validation & TRL Evidence
 * 
 * EPISTEMIC HONESTY TESTS:
 * - specification≠result
 * - target≠achievement
 * - test≠experiment
 * - No fabricated results
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  type EvidenceId,
  type ResearchCaseId,
} from '../src/core/index.ts';
import { createExperimentRepository, ExperimentType, ExperimentStatus } from '../src/experiment/index.ts';
import { createBenchmarkRepository, PerturbationType } from '../src/benchmark/index.ts';
import { createTRLRepository, TRLEvidenceCategory, EvidenceStatus, TRLLevel } from '../src/trl/index.ts';
import { runWP7Demo } from '../src/demo/wp7-demo.ts';

describe('WP7 - Benchmarking, Validation & TRL Evidence Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
  });

  // ============================================================
  // EXPERIMENT TESTS
  // ============================================================

  describe('Experiment Framework', () => {
    it('T219: creates scenario definition', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(
        caseId,
        'Test Scenario',
        'Test description',
        'REASONING',
        { input: 'data' },
        ['constraint1'],
        'researcher-001'
      );
      expect(scenario).toBeDefined();
      expect(scenario.name).toBe('Test Scenario');
      expect(scenario.family).toBe('REASONING');
    });

    it('T220: scenario has provenance', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      expect(scenario.provenance).toBeDefined();
      expect(scenario.provenance.producer).toBe('researcher-001');
    });

    it('T221: creates experiment', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const metric = repo.createMetricDefinition(caseId, 'Metric', 'Desc', 'QUANTITATIVE', true);
      
      const experiment = repo.createExperiment(
        caseId,
        'Test Experiment',
        'Test description',
        ExperimentType.BENCHMARK,
        [scenario.id],
        [metric.id],
        {
          seed: 42,
          systemVersion: '1.0.0',
          datasetVersion: '1.0.0',
          environment: {},
          parameters: {},
        },
        'researcher-001'
      );
      
      expect(experiment).toBeDefined();
      expect(experiment.status).toBe(ExperimentStatus.SPECIFIED);
    });

    it('T222: specification ≠ execution', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      
      // Experiment is SPECIFIED, not executed
      expect(experiment.status).toBe(ExperimentStatus.SPECIFIED);
      expect(experiment.status).not.toBe(ExperimentStatus.COMPLETED);
    });

    it('T223: creates experiment run', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      expect(run).toBeDefined();
      expect(run.status).toBe(ExperimentStatus.RUNNING);
    });

    it('T224: experiment run has provenance', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      expect(run.provenance).toBeDefined();
    });

    it('T225: creates executed scenario', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const executed = repo.createExecutedScenario(
        scenario.id,
        run.id,
        { input: 'data' },
        { output: 'result' },
        'SUCCESS',
        100,
        { runtime: 100 },
        'system'
      );
      
      expect(executed).toBeDefined();
      expect(executed.status).toBe('SUCCESS');
      expect(executed.executionTime).toBe(100);
    });

    it('T226: creates metric definition', () => {
      const repo = createExperimentRepository(ids, time);
      const metric = repo.createMetricDefinition(
        caseId,
        'Accuracy',
        'Percentage of correct answers',
        'QUANTITATIVE',
        true,
        '%',
        { min: 0, max: 100 }
      );
      
      expect(metric).toBeDefined();
      expect(metric.name).toBe('Accuracy');
      expect(metric.higherIsBetter).toBe(true);
    });

    it('T227: metric definition ≠ metric result', () => {
      const repo = createExperimentRepository(ids, time);
      const metric = repo.createMetricDefinition(caseId, 'Accuracy', 'Desc', 'QUANTITATIVE', true);
      
      // Metric definition exists but no result yet
      expect(metric).toBeDefined();
      const results = repo.getMetricResultsByRun('non-existent', caseId);
      expect(results.length).toBe(0);
    });

    it('T228: creates metric result', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      const metric = repo.createMetricDefinition(caseId, 'Accuracy', 'Desc', 'QUANTITATIVE', true);
      
      const result = repo.createMetricResult(metric.id, run.id, 95.5, 0.95, 100);
      expect(result).toBeDefined();
      expect(result.value).toBe(95.5);
      expect(result.confidence).toBe(0.95);
    });

    it('T229: creates reproducibility record', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const record = repo.createReproducibilityRecord(
        run.id,
        '1.0.0',
        experiment.configuration,
        42,
        { [scenario.id]: '1.0.0' },
        'hash-input',
        'hash-output',
        { node: '20.0.0' }
      );
      
      expect(record).toBeDefined();
      expect(record.seed).toBe(42);
      expect(record.softwareVersion).toBe('1.0.0');
    });

    it('T230: seed and provenance preserved', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 12345,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      expect(run.configuration.seed).toBe(12345);
      expect(run.provenance.producer).toBe('system');
    });

    it('T231: cross-case experiment rejected', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => repo.getExperiment(experiment.id, otherCaseId)).toThrow();
    });

    it('T232: failed experiment preserved', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      repo.updateRunStatus(run.id, caseId, ExperimentStatus.FAILED, time.now(), 50);
      const failedRun = repo.getExperimentRun(run.id, caseId);
      
      expect(failedRun?.status).toBe(ExperimentStatus.FAILED);
    });
  });

  // ============================================================
  // BENCHMARK TESTS
  // ============================================================

  describe('Benchmark Framework', () => {
    it('T233: creates benchmark definition', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      const benchmark = repo.createBenchmarkDefinition(
        caseId,
        'Test Benchmark',
        'Test description',
        'REASONING',
        100,
        [scenario.id],
        [],
        undefined,
        'researcher-001'
      );
      
      expect(benchmark).toBeDefined();
      expect(benchmark.taskCount).toBe(100);
    });

    it('T234: target ≠ achievement', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      const benchmark = repo.createBenchmarkDefinition(
        caseId,
        'Test Benchmark',
        'Test description',
        'REASONING',
        100,
        [scenario.id],
        [],
        { 'metric-1': 90 }, // TARGET (not achievement)
        'researcher-001'
      );
      
      expect(benchmark.targetMetrics).toBeDefined();
      expect(benchmark.targetMetrics?.['metric-1']).toBe(90);
      // This is a TARGET, not an achievement
    });

    it('T235: unexecuted benchmark has no result', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      // Benchmark defined but not executed
      const runs = repo.getBenchmarkRunsByDefinition(benchmark.id, caseId);
      expect(runs.length).toBe(0);
    });

    it('T236: creates benchmark run', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', { seed: 42 }, 42, 100, 'system');
      
      expect(run).toBeDefined();
      expect(run.executedTasks).toBe(0);
      expect(run.totalTasks).toBe(100);
    });

    it('T237: comparison requires execution', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      // Create baseline (requires actual execution data)
      const baseline = repo.createBaseline(caseId, 'Baseline', 'Desc', '1.0.0', {}, { 'metric-1': 75 }, 'researcher-001');
      expect(baseline.benchmarkResults['metric-1']).toBe(75);
      
      // Without actual benchmark run, no valid comparison
      const runs = repo.getBenchmarkRunsByDefinition(benchmark.id, caseId);
      expect(runs.length).toBe(0);
    });

    it('T238: creates baseline', () => {
      const repo = createBenchmarkRepository(ids, time);
      const baseline = repo.createBaseline(caseId, 'Baseline v1', 'Initial baseline', '1.0.0', { seed: 42 }, { 'metric-1': 75, 'metric-2': 80 }, 'researcher-001');
      
      expect(baseline).toBeDefined();
      expect(baseline.systemVersion).toBe('1.0.0');
      expect(baseline.benchmarkResults['metric-1']).toBe(75);
    });

    it('T239: creates ablation definition', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      const ablation = repo.createAblationDefinition(caseId, 'No Causal', 'Ablation without causal', 'CAUSAL', benchmark.id, 'researcher-001');
      
      expect(ablation).toBeDefined();
      expect(ablation.component).toBe('CAUSAL');
      expect(ablation.disabled).toBe(true);
    });

    it('T240: ablation definition ≠ ablation result', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      const ablation = repo.createAblationDefinition(caseId, 'No Causal', 'Ablation', 'CAUSAL', benchmark.id, 'researcher-001');
      
      // Ablation defined but no result yet
      expect(ablation).toBeDefined();
      const results = repo.getAblationResultsByDefinition(ablation.id, caseId);
      expect(results.length).toBe(0);
    });

    it('T241: creates perturbation definition', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      const perturbation = repo.createPerturbationDefinition(
        caseId,
        'Missing Evidence',
        'Test with missing evidence',
        PerturbationType.MISSING_EVIDENCE,
        'MEDIUM',
        { missingPercentage: 30 },
        benchmark.id,
        'researcher-001'
      );
      
      expect(perturbation).toBeDefined();
      expect(perturbation.type).toBe(PerturbationType.MISSING_EVIDENCE);
      expect(perturbation.severity).toBe('MEDIUM');
    });

    it('T242: cross-case benchmark rejected', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => repo.getBenchmarkDefinition(benchmark.id, otherCaseId)).toThrow();
    });
  });

  // ============================================================
  // TRL TESTS
  // ============================================================

  describe('TRL Evidence', () => {
    it('T243: creates TRL evidence item', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(
        caseId,
        TRLEvidenceCategory.REQUIREMENTS,
        'Requirements defined',
        EvidenceStatus.DEMONSTRATED,
        ['ev-1'] as EvidenceId[],
        ['Some limitations'],
        [],
        'researcher-001'
      );
      
      expect(item).toBeDefined();
      expect(item.category).toBe(TRLEvidenceCategory.REQUIREMENTS);
      expect(item.status).toBe(EvidenceStatus.DEMONSTRATED);
    });

    it('T244: TRL requires evidence', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(
        caseId,
        TRLEvidenceCategory.VALIDATION,
        'Validation evidence',
        EvidenceStatus.NOT_DEMONSTRATED,
        [], // No evidence
        ['No validation performed'],
        ['Validation pending'],
        'researcher-001'
      );
      
      expect(item.status).toBe(EvidenceStatus.NOT_DEMONSTRATED);
      expect(item.evidenceIds.length).toBe(0);
    });

    it('T245: creates TRL evidence package', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const pkg = repo.createTRLEvidencePackage(
        caseId,
        'TRL4 Package',
        'Evidence for TRL4',
        TRLLevel.TRL4,
        [item.id],
        EvidenceStatus.PARTIALLY_DEMONSTRATED,
        ['Limitations'],
        ['Open failures'],
        'researcher-001'
      );
      
      expect(pkg).toBeDefined();
      expect(pkg.targetTRL).toBe(TRLLevel.TRL4);
      expect(pkg.achievedTRL).toBe('NOT_ACHIEVED');
    });

    it('T246: software PASS ≠ TRL4', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.VERIFICATION, 'Software tests pass', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const pkg = repo.createTRLEvidencePackage(
        caseId,
        'TRL4 Package',
        'Evidence for TRL4',
        TRLLevel.TRL4,
        [item.id],
        EvidenceStatus.PARTIALLY_DEMONSTRATED,
        ['Software tests pass but not sufficient for TRL4'],
        ['Independent validation missing'],
        'researcher-001'
      );
      
      // Software tests passing does not mean TRL4 achieved
      expect(pkg.achievedTRL).toBe('NOT_ACHIEVED');
    });

    it('T247: self-validation ≠ independent validation', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.VALIDATION, 'Self-validation', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const pkg = repo.createTRLEvidencePackage(
        caseId,
        'TRL4 Package',
        'Evidence for TRL4',
        TRLLevel.TRL4,
        [item.id],
        EvidenceStatus.PARTIALLY_DEMONSTRATED,
        [],
        [],
        'researcher-001'
      );
      
      // Self-validation is not independent validation
      expect(pkg.independentValidation).toBe(false);
      expect(pkg.independentValidator).toBeUndefined();
    });

    it('T248: creates human study protocol', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(
        caseId,
        'User Study',
        'Study with human participants',
        60,
        ['Adults 18+'],
        [],
        ['Task 1', 'Task 2'],
        ['Metric 1'],
        undefined,
        'researcher-001'
      );
      
      expect(protocol).toBeDefined();
      expect(protocol.targetParticipants).toBe(60);
      expect(protocol.status).toBe('NOT_EXECUTED');
    });

    it('T249: human sessions cannot be fabricated', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, [], [], [], [], undefined, 'researcher-001');
      
      // No sessions created (honest: no fabricated participants)
      const sessions = repo.getHumanStudySessionsByProtocol(protocol.id, caseId);
      expect(sessions.length).toBe(0);
      expect(protocol.actualParticipants).toBe(0);
    });

    it('T250: TRL assessment is honest', () => {
      const repo = createTRLRepository(ids, time);
      
      // Create evidence items with honest status
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.VALIDATION, 'Val', EvidenceStatus.NOT_DEMONSTRATED, [], ['Not validated'], ['Pending'], 'researcher-001');
      
      const assessment = repo.assessTRL(caseId);
      
      // TRL assessment reflects actual evidence
      expect(assessment.evidence[TRLEvidenceCategory.REQUIREMENTS]).toBe(EvidenceStatus.DEMONSTRATED);
      expect(assessment.evidence[TRLEvidenceCategory.VALIDATION]).toBe(EvidenceStatus.NOT_DEMONSTRATED);
    });

    it('T251: missing telemetry = UNKNOWN', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: {},
        parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const executed = repo.createExecutedScenario(
        scenario.id,
        run.id,
        {},
        {},
        'SUCCESS',
        100,
        undefined, // No resource telemetry
        'system'
      );
      
      // Missing telemetry is undefined, not 0
      expect(executed.resources).toBeUndefined();
    });

    it('T252: cross-case TRL rejected', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => repo.getTRLEvidenceItem(item.id, otherCaseId)).toThrow();
    });
  });

  // ============================================================
  // WP7 DEMO TEST
  // ============================================================

  describe('WP7 Demo', () => {
    it('T253: demo executes honestly', () => {
      const result = runWP7Demo();
      
      // Honest reporting
      expect(result.scenarioDefinitions).toBeGreaterThanOrEqual(3);
      expect(result.experimentRuns).toBeGreaterThanOrEqual(1);
      expect(result.executedScenarios).toBeGreaterThanOrEqual(1);
      expect(result.benchmarkRuns).toBeGreaterThanOrEqual(1);
      
      // Honest about what was NOT executed
      expect(result.humanStudySessions).toBe(0); // No fabricated humans
      expect(result.trl4Achieved).toBe(false); // Not achieved
      expect(result.automatedTasksExecuted).toBeGreaterThan(0); // Some real execution
    });

    it('T254: demo does not fabricate human participants', () => {
      const result = runWP7Demo();
      expect(result.humanStudyProtocols).toBeGreaterThanOrEqual(1);
      expect(result.humanStudySessions).toBe(0); // HONEST: No real humans
    });

    it('T255: demo reports TRL4 as NOT achieved', () => {
      const result = runWP7Demo();
      expect(result.trl4Achieved).toBe(false);
      expect(result.currentTRL).not.toBe('TRL4');
    });
  });
});
