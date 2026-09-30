/**
 * HAG-RAP V.2 — Order 6 Final Tests (WP7)
 * Final tests to complete WP7 coverage
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

describe('WP7 - Final Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
  });

  // ============================================================
  // EXPERIMENT - FINAL
  // ============================================================

  describe('Experiment - Final', () => {
    it('T298: scenario definition has version', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      expect(scenario.version).toBeDefined();
    });

    it('T299: experiment has version', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      expect(experiment.version).toBeDefined();
    });

    it('T300: experiment has configuration', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const config = {
        seed: 42,
        systemVersion: '1.0.0',
        datasetVersion: '1.0.0',
        environment: { node: '20.0.0' },
        parameters: { maxSteps: 10 },
      };
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], config, 'researcher-001');
      
      expect(experiment.configuration.seed).toBe(42);
      expect(experiment.configuration.systemVersion).toBe('1.0.0');
    });

    it('T301: experiment run has start time', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      expect(run.startTime).toBeDefined();
    });

    it('T302: executed scenario has execution time', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const executed = repo.createExecutedScenario(scenario.id, run.id, {}, {}, 'SUCCESS', 250, undefined, 'system');
      expect(executed.executionTime).toBe(250);
    });

    it('T303: executed scenario has actual inputs and outputs', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const inputs = { question: 'What is 2+2?' };
      const outputs = { answer: '4', confidence: 0.99 };
      const executed = repo.createExecutedScenario(scenario.id, run.id, inputs, outputs, 'SUCCESS', 100, undefined, 'system');
      
      expect(executed.actualInputs).toEqual(inputs);
      expect(executed.actualOutputs).toEqual(outputs);
    });

    it('T304: metric result has computed timestamp', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      const metric = repo.createMetricDefinition(caseId, 'Metric', 'Desc', 'QUANTITATIVE', true);
      const result = repo.createMetricResult(metric.id, run.id, 95, 0.95, 100);
      
      expect(result.computedAt).toBeDefined();
    });

    it('T305: reproducibility record has all required fields', () => {
      const repo = createExperimentRepository(ids, time);
      const scenario = repo.createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const experiment = repo.createExperiment(caseId, 'Test', 'Desc', ExperimentType.BENCHMARK, [scenario.id], [], {
        seed: 42, systemVersion: '1.0.0', datasetVersion: '1.0.0', environment: {}, parameters: {},
      }, 'researcher-001');
      const run = repo.createExperimentRun(experiment.id, caseId, experiment.configuration, 'system');
      
      const record = repo.createReproducibilityRecord(
        run.id,
        '1.0.0',
        experiment.configuration,
        42,
        { [scenario.id]: '1.0.0' },
        'input-hash',
        'output-hash',
        { node: '20.0.0', os: 'linux' }
      );
      
      expect(record.softwareVersion).toBe('1.0.0');
      expect(record.seed).toBe(42);
      expect(record.inputHash).toBe('input-hash');
      expect(record.outputHash).toBe('output-hash');
      expect(record.recordedAt).toBeDefined();
    });
  });

  // ============================================================
  // BENCHMARK - FINAL
  // ============================================================

  describe('Benchmark - Final', () => {
    it('T306: benchmark definition has version', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      
      expect(benchmark.version).toBeDefined();
    });

    it('T307: benchmark run has system version', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '2.0.0', {}, 42, 100, 'system');
      
      expect(run.systemVersion).toBe('2.0.0');
    });

    it('T308: benchmark run has seed', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 12345, 100, 'system');
      
      expect(run.seed).toBe(12345);
    });

    it('T309: baseline has system version', () => {
      const repo = createBenchmarkRepository(ids, time);
      const baseline = repo.createBaseline(caseId, 'B1', 'Desc', '1.5.0', {}, {}, 'researcher-001');
      
      expect(baseline.systemVersion).toBe('1.5.0');
    });

    it('T310: baseline has configuration', () => {
      const repo = createBenchmarkRepository(ids, time);
      const config = { seed: 42, parameters: { threshold: 0.5 } };
      const baseline = repo.createBaseline(caseId, 'B1', 'Desc', '1.0.0', config, {}, 'researcher-001');
      
      expect(baseline.configuration).toEqual(config);
    });

    it('T311: ablation result has comparison to full', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const ablation = repo.createAblationDefinition(caseId, 'A1', 'Desc', 'CAUSAL', benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      const comparison = { 'metric-1': -10, 'metric-2': -5 };
      const result = repo.createAblationResult(ablation.id, run.id, {}, comparison);
      
      expect(result.comparisonToFull).toEqual(comparison);
    });

    it('T312: perturbation result has comparison to baseline', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const perturbation = repo.createPerturbationDefinition(caseId, 'P1', 'Desc', PerturbationType.MISSING_EVIDENCE, 'MEDIUM', {}, benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      const comparison = { 'metric-1': -15, 'metric-2': -20 };
      const result = repo.createPerturbationResult(perturbation.id, run.id, 'SUCCESS', {}, comparison);
      
      expect(result.comparisonToBaseline).toEqual(comparison);
    });

    it('T313: perturbation result has status', () => {
      const repo = createBenchmarkRepository(ids, time);
      const scenario = createExperimentRepository(ids, time).createScenarioDefinition(caseId, 'Test', 'Desc', 'REASONING', {}, [], 'researcher-001');
      const benchmark = repo.createBenchmarkDefinition(caseId, 'Test', 'Desc', 'REASONING', 100, [scenario.id], [], undefined, 'researcher-001');
      const perturbation = repo.createPerturbationDefinition(caseId, 'P1', 'Desc', PerturbationType.MISSING_EVIDENCE, 'MEDIUM', {}, benchmark.id, 'researcher-001');
      const run = repo.createBenchmarkRun(benchmark.id, caseId, '1.0.0', {}, 42, 100, 'system');
      
      const result = repo.createPerturbationResult(perturbation.id, run.id, 'GRACEFUL_DEGRADATION', {}, {});
      expect(result.status).toBe('GRACEFUL_DEGRADATION');
    });
  });

  // ============================================================
  // TRL - FINAL
  // ============================================================

  describe('TRL - Final', () => {
    it('T314: TRL evidence item has category', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.ASSURANCE, 'Assurance evidence', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      
      expect(item.category).toBe(TRLEvidenceCategory.ASSURANCE);
    });

    it('T315: TRL evidence item has limitations', () => {
      const repo = createTRLRepository(ids, time);
      const limitations = ['Limitation 1', 'Limitation 2'];
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], limitations, [], 'researcher-001');
      
      expect(item.limitations).toEqual(limitations);
    });

    it('T316: TRL evidence item has open failures', () => {
      const repo = createTRLRepository(ids, time);
      const failures = ['Failure 1', 'Failure 2'];
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.VALIDATION, 'Val', EvidenceStatus.PARTIALLY_DEMONSTRATED, [], [], failures, 'researcher-001');
      
      expect(item.openFailures).toEqual(failures);
    });

    it('T317: TRL evidence package has target TRL', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      const pkg = repo.createTRLEvidencePackage(caseId, 'P1', 'Desc', TRLLevel.TRL5, [item.id], EvidenceStatus.PARTIALLY_DEMONSTRATED, [], [], 'researcher-001');
      
      expect(pkg.targetTRL).toBe(TRLLevel.TRL5);
    });

    it('T318: TRL evidence package has achieved TRL', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      const pkg = repo.createTRLEvidencePackage(caseId, 'P1', 'Desc', TRLLevel.TRL4, [item.id], EvidenceStatus.DEMONSTRATED, [], [], 'researcher-001');
      
      const updated = repo.updateTRLEvidencePackage(pkg.id, caseId, TRLLevel.TRL4, EvidenceStatus.DEMONSTRATED, false);
      expect(updated.achievedTRL).toBe(TRLLevel.TRL4);
    });

    it('T319: TRL evidence package has version', () => {
      const repo = createTRLRepository(ids, time);
      const item = repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], [], [], 'researcher-001');
      const pkg = repo.createTRLEvidencePackage(caseId, 'P1', 'Desc', TRLLevel.TRL4, [item.id], EvidenceStatus.PARTIALLY_DEMONSTRATED, [], [], 'researcher-001');
      
      expect(pkg.version).toBeDefined();
    });

    it('T320: human study protocol has target participants', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 100, [], [], [], [], undefined, 'researcher-001');
      
      expect(protocol.targetParticipants).toBe(100);
    });

    it('T321: human study protocol has inclusion criteria', () => {
      const repo = createTRLRepository(ids, time);
      const criteria = ['Adults 18+', 'Professional background'];
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, criteria, [], [], [], undefined, 'researcher-001');
      
      expect(protocol.inclusionCriteria).toEqual(criteria);
    });

    it('T322: human study protocol has ethical approval status', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, [], [], [], [], 'IRB-12345', 'researcher-001');
      
      expect(protocol.ethicalApproval).toBe('IRB-12345');
    });

    it('T323: human study protocol tracks actual participants', () => {
      const repo = createTRLRepository(ids, time);
      const protocol = repo.createHumanStudyProtocol(caseId, 'Study', 'Desc', 60, [], [], [], [], undefined, 'researcher-001');
      
      expect(protocol.actualParticipants).toBe(0); // Honest: no participants yet
      
      const updated = repo.updateHumanStudyProtocolStatus(protocol.id, caseId, 'COMPLETED', 45);
      expect(updated.actualParticipants).toBe(45);
    });

    it('T324: TRL assessment handles empty evidence', () => {
      const repo = createTRLRepository(ids, time);
      const assessment = repo.assessTRL(caseId);
      
      expect(assessment.currentTRL).toBe('NOT_ACHIEVED');
      expect(Object.keys(assessment.evidence).length).toBeGreaterThan(0);
    });

    it('T325: TRL assessment aggregates limitations', () => {
      const repo = createTRLRepository(ids, time);
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.REQUIREMENTS, 'Req', EvidenceStatus.DEMONSTRATED, [], ['Limitation 1'], [], 'researcher-001');
      repo.createTRLEvidenceItem(caseId, TRLEvidenceCategory.CAPABILITIES, 'Cap', EvidenceStatus.DEMONSTRATED, [], ['Limitation 2'], [], 'researcher-001');
      
      const assessment = repo.assessTRL(caseId);
      expect(assessment.limitations).toContain('Limitation 1');
      expect(assessment.limitations).toContain('Limitation 2');
    });
  });
});
