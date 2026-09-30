/**
 * HAG-RAP V.2 — Order 6 Additional Tests (WP7)
 * Additional tests for comprehensive WP7 coverage
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

describe('WP7 - Additional Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
  });

  // ============================================================
  // ADDITIONAL EXPERIMENT TESTS
  // ============================================================

  describe('Experiment - Additional', () => {
    it('T256: retrieves scenario definitions by case', () => {
      const repo = createExperimentRepository(ids, time);
      repo.createScenarioDefinition(caseId, 'S1', 'Desc', 'REASONING', {}, [], 'researcher-001');
      repo.createScenarioDefinition(caseId, 'S2', 'Desc', 'CAUSAL', {}, [], 'researcher-001');
      
      const scenarios = repo.getScenarioDefinitionsByCase(caseId);
      expect(scenarios.length).toBe(2);
    });

    it('T257: retrieves experiments by case', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      repo.createExperiment(caseId, 'E1', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      repo.createExperiment(caseId, 'E2', 'Desc', ExperimentType.ABLATION, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      
      const experiments = repo.getExperimentsByCase(caseId);
      expect(experiments.length).toBe(2);
    });

    it('T258: retrieves experiment runs by experiment', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      
      repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const runs = repo.getExperimentRunsByExperiment(experiment.id, caseId);
      expect(runs.length).toBe(2);
    });

    it('T259: retrieves metric definitions by case', () => {
      const repo = createExperimentRepository(ids, time);
      repo.createMetricDefinition(caseId, 'M1', 'Desc', 'QUANTITATIVE', true);
      repo.createMetricDefinition(caseId, 'M2', 'Desc', 'QUALITATIVE', false);
      
      const metrics = repo.getMetricDefinitionsByCase(caseId);
      expect(metrics.length).toBe(2);
    });

    it('T260: retrieves metric results by run', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      const metric = repo.createMetricDefinition(caseId, 'Metric', 'Desc', 'QUANTITATIVE', true);
      
      repo.createMetricResult(metric.id, run.id, 95, 0.95, 100);
      repo.createMetricResult(metric.id, run.id, 85, 0.85, 100);
      
      const results = repo.getMetricResultsByRun(run.id, caseId);
      expect(results.length).toBe(2);
    });

    it('T261: updates experiment status', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      
      const updated = repo.updateExperimentStatus(experiment.id, caseId, ExperimentStatus.RUNNING);
      expect(updated.status).toBe(ExperimentStatus.RUNNING);
    });

    it('T262: updates run status with end time', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const endTime = time.now();
      const updated = repo.updateRunStatus(run.id, caseId, ExperimentStatus.COMPLETED, endTime, 1000);
      
      expect(updated.status).toBe(ExperimentStatus.COMPLETED);
      expect(updated.endTime).toBe(endTime);
      expect(updated.duration).toBe(1000);
    });

    it('T263: adds executed scenario to run', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const executed = repo.createExecutedScenario(scenario.id, run.id, {}, {}, 'SUCCESS', 100, undefined, 'system');
      const updated = repo.addExecutedScenario(run.id, caseId, executed.id);
      
      expect(updated.executedScenarios).toContain(executed.id);
    });

    it('T264: adds metric result to run', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      const metric = repo.createMetricDefinition(caseId, 'Metric', 'Desc', 'QUANTITATIVE', true);
      const result = repo.createMetricResult(metric.id, run.id, 95, 0.95, 100);
      
      const updated = repo.addMetricResult(run.id, caseId, result.id);
      expect(updated.metricResults).toContain(result.id);
    });

    it('T265: metric definition has provenance', () => {
      const repo = createExperimentRepository(ids, time);
      const metric = repo.createMetricDefinition(caseId, 'Metric', 'Desc', 'QUANTITATIVE', true);
      
      expect(metric.provenance).toBeDefined();
    });

    it('T266: metric result has provenance', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      const metric = repo.createMetricDefinition(caseId, 'Metric', 'Desc', 'QUANTITATIVE', true);
      const result = repo.createMetricResult(metric.id, run.id, 95, 0.95, 100);
      
      expect(result.provenance).toBeDefined();
    });

    it('T267: executed scenario has provenance', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const executed = repo.createExecutedScenario(scenario.id, run.id, {}, {}, 'SUCCESS', 100, undefined, 'system');
      expect(executed.provenance).toBeDefined();
    });

    it('T268: reproducibility record has provenance', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const record = repo.createReproducibilityRecord(run.id, '1.0.0', experiment.configuration, 42, {}, '', '', {});
      expect(record.provenance).toBeDefined();
    });
  });

  // ============================================================
  // ADDITIONAL BENCHMARK TESTS
  // ============================================================

  describe('Benchmark - Additional', () => {
    it('T269: retrieves benchmark definitions by case', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      
      repo.createBenchmarkDefinition(caseId, 'B1', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      repo.createBenchmarkDefinition(caseId, 'B2', 'Desc', 'CAUSAL', 50, [scenario.id], [], undefined, 'researcher-001');
      
      const benchmarks = repo.getBenchmarkDefinitionsByCase(caseId);
      expect(benchmarks.length).toBe(2);
    });

    it('T270: retrieves benchmark runs by definition', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 43, 100, 'system');
      
      const runs = repo.getBenchmarkRunsByDefinition(benchmark.id, caseId);
      expect(runs.length).toBe(2);
    });

    it('T271: retrieves baselines by case', () => {
      const repo = createBenchmarkRepository(ids, time);
      repo.createBaseline(caseId, 'B1', 'Desc', '1.0.0', {}, {}, 'researcher-001');
      repo.createBaseline(caseId, 'B2', 'Desc', '1.0.0', {}, {}, 'researcher-001');
      
      const baselines = repo.getBaselinesByCase(caseId);
      expect(baselines.length).toBe(2);
    });

    it('T272: retrieves ablation definitions by case', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      repo.createAblationDefinition(caseId, 'A1', 'Desc', 'CAUSAL', benchmark.id, 'researcher-001');
      repo.createAblationDefinition(caseId, 'A2', 'Desc', 'ABSTRACTION', benchmark.id, 'researcher-001');
      
      const ablations = repo.getAblationDefinitionsByCase(caseId);
      expect(ablations.length).toBe(2);
    });

    it('T273: retrieves ablation results by definition', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const ablation = repo.createAblationDefinition(caseId, 'A1', 'Desc', 'CAUSAL', benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      repo.createAblationResult(ablation.id, run.id, {}, {});
      repo.createAblationResult(ablation.id, run.id, {}, {});
      
      const results = repo.getAblationResultsByDefinition(ablation.id, caseId);
      expect(results.length).toBe(2);
    });

    it('T274: retrieves perturbation definitions by case', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      repo.createPerturbationDefinition(caseId, 'P1', 'Desc', PerturbationType.MISSING_EVIDENCE, 'MEDIUM', {}, benchmark.id, 'researcher-001');
      repo.createPerturbationDefinition(caseId, 'P2', 'Desc', PerturbationType.NOISE, 'LOW', {}, benchmark.id, 'researcher-001');
      
      const perturbations = repo.getPerturbationDefinitionsByCase(caseId);
      expect(perturbations.length).toBe(2);
    });

    it('T275: retrieves perturbation results by definition', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const perturbation = repo.createPerturbationDefinition(caseId, 'P1', 'Desc', PerturbationType.MISSING_EVIDENCE, 'MEDIUM', {}, benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      repo.createPerturbationResult(perturbation.id, run.id, 'SUCCESS', {}, {});
      repo.createPerturbationResult(perturbation.id, run.id, 'FAILURE', {}, {});
      
      const results = repo.getPerturbationResultsByDefinition(perturbation.id, caseId);
      expect(results.length).toBe(2);
    });

    it('T276: updates benchmark run', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      const endTime = time.now();
      const updated = repo.updateBenchmarkRun(run.id, caseId, 50, endTime, 5000);
      
      expect(updated.executedTasks).toBe(50);
      expect(updated.completedAt).toBe(endTime);
      expect(updated.duration).toBe(5000);
    });

    it('T277: benchmark definition has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      expect(benchmark.provenance).toBeDefined();
    });

    it('T278: benchmark run has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      expect(run.provenance).toBeDefined();
    });

    it('T279: baseline has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const baseline = repo.createBaseline(caseId, 'B1', 'Desc', '1.0.0', {}, {}, 'researcher-001');
      
      expect(baseline.provenance).toBeDefined();
    });

    it('T280: ablation definition has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const ablation = repo.createAblationDefinition(caseId, 'A1', 'Desc', 'CAUSAL', benchmark.id, 'researcher-001');
      
      expect(ablation.provenance).toBeDefined();
    });

    it('T281: ablation result has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const ablation = repo.createAblationDefinition(caseId, 'A1', 'Desc', 'CAUSAL', benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      const result = repo.createAblationResult(ablation.id, run.id, {}, {});
      
      expect(result.provenance).toBeDefined();
    });

    it('T282: perturbation definition has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const perturbation = repo.createPerturbationDefinition(caseId, 'P1', 'Desc', PerturbationType.MISSING_EVIDENCE, 'MEDIUM', {}, benchmark.id, 'researcher-001');
      
      expect(perturbation.provenance).toBeDefined();
    });

    it('T283: perturbation result has provenance', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const perturbation = repo.createPerturbationDefinition(caseId, 'P1', 'Desc', PerturbationType.MISSING_EVIDENCE, 'MEDIUM', {}, benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      const result = repo.createPerturbationResult(perturbation.id, run.id, 'SUCCESS', {}, {});
      
      expect(result.provenance).toBeDefined();
    });
  });

  // ============================================================
  // ADDITIONAL TRL TESTS
  // ============================================================

  describe('TRL - Additional', () => {
    it('T284: retrieves TRL evidence items by case', () => {
      const repo = createTRLRepository(ids, time);
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req1', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.CAPABILITIES, 'Cap1', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const items = repo.getTRLEvidenceItemsByCase(caseId);
      expect(items.length).toBe(2);
    });

    it('T285: retrieves TRL evidence items by category', () => {
      const repo = createTRLRepository(ids, time);
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req1', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req2', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.CAPABILITIES, 'Cap1', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const items = repo.getTRLEvidenceItemsByCategory(caseId, TRLEvidenceCategory.REQUIREMENTS);
      expect(items.length).toBe(2);
    });

    it('T286: retrieves TRL evidence packages by case', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      repo.createTRLEvidencePackage(caseId, 'P1', 'Desc', TRLLevel.TRL4, [item.id], EvidenceStatus.PARTIALLY_DEMONSTRATED, [], [], 'researcher-001');
      repo.createTRLEvidencePackage(caseId, 'P2', 'Desc', TRLLevel.TRL5, [item.id], EvidenceStatus.NOT_DEMONSTRATED, [], [], 'researcher-001');
      
      const packages = repo.getTRLEvidencePackagesByCase(caseId);
      expect(packages.length).toBe(2);
    });

    it('T287: updates TRL evidence package', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      const pkg = repo.createTRLEvidencePackage(caseId, 'P1', 'Desc', TRLLevel.TRL4, [item.id], EvidenceStatus.PARTIALLY_DEMONSTRATED, [], [], 'researcher-001');
      
      const updated = repo.updateTRLEvidencePackage(pkg.id, caseId, TRLLevel.TRL4, EvidenceStatus.DEMONSTRATED, true, 'independent-validator');
      
      expect(updated.achievedTRL).toBe(TRLLevel.TRL4);
      expect(updated.overallStatus).toBe(EvidenceStatus.DEMONSTRATED);
      expect(updated.independentValidation).toBe(true);
      expect(updated.independentValidator).toBe('independent-validator');
    });

    it('T288: retrieves human study protocols by case', () => {
      const repo = createTRLRepository(ids, time);
      repo.createHumanStudyProtocol(caseId, 'P1', 'Desc', 60, [], [], [], [], undefined, 'researcher-001');
      repo.createHumanStudyProtocol(caseId, 'P2', 'Desc', 30, [], [], [], [], undefined, 'researcher-001');
      
      const protocols = repo.getHumanStudyProtocolsByCase(caseId);
      expect(protocols.length).toBe(2);
    });

    it('T289: updates human study protocol status', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, [], [], [], [], undefined, 'researcher-001');
      
      const updated = repo.updateHumanStudyProtocolStatus(protocol.id, caseId, 'IN_PROGRESS', 30);
      
      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.actualParticipants).toBe(30);
    });

    it('T290: retrieves human study sessions by protocol', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, [], [], [], [], undefined, 'researcher-001');
      
      // Note: In real scenario, sessions would be created with actual participants
      // Here we just test the retrieval mechanism
      const sessions = repo.getHumanStudySessionsByProtocol(protocol.id, caseId);
      expect(sessions.length).toBe(0); // Honest: no fabricated sessions
    });

    it('T291: retrieves human study sessions by case', () => {
      const repo = createTRLRepository(ids, time);
      const sessions = repo.getHumanStudySessionsByCase(caseId);
      expect(sessions.length).toBe(0); // Honest: no fabricated sessions
    });

    it('T292: TRL evidence item has provenance', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      expect(item.provenance).toBeDefined();
    });

    it('T293: TRL evidence package has provenance', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      const pkg = repo.createTRLEvidencePackage(caseId, 'P1', 'Desc', TRLLevel.TRL4, [item.id], EvidenceStatus.PARTIALLY_DEMONSTRATED, [], [], 'researcher-001');
      
      expect(pkg.provenance).toBeDefined();
    });

    it('T294: human study protocol has provenance', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, [], [], [], [], undefined, 'researcher-001');
      
      expect(protocol.provenance).toBeDefined();
    });

    it('T295: TRL assessment returns current TRL', () => {
      const repo = createTRLRepository(ids, time);
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.CAPABILITIES, 'Cap', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const assessment = repo.assessTRL(caseId);
      expect(assessment.currentTRL).toBeDefined();
    });

    it('T296: TRL assessment returns evidence by category', () => {
      const repo = createTRLRepository(ids, time);
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      const assessment = repo.assessTRL(caseId);
      expect(assessment.evidence[TRLEvidenceCategory.REQUIREMENTS]).toBe(EvidenceStatus.DEMONSTRATED);
    });

    it('T297: TRL assessment returns limitations', () => {
      const repo = createTRLRepository(ids, time);
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], ['Limitation 1'], [], 'researcher-001');
      
      const assessment = repo.assessTRL(caseId);
      expect(assessment.limitations).toContain('Limitation 1');
    });
  });
});
