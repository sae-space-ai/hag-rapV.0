/**
 * HAG-RAP V.2 — Experiment Framework (WP7)
 * Scientific experimentation infrastructure
 * 
 * CRITICAL INVARIANTS:
 * - SOFTWARE TEST ≠ SCIENTIFIC EXPERIMENT
 * - SPECIFICATION ≠ EXECUTION
 * - METRIC DEFINITION ≠ METRIC RESULT
 * - TARGET ≠ ACHIEVEMENT
 * - No fabricated results
 */

import {
  type ResearchCaseId,
  type EvidenceId,
  ActorType,
  type Provenance,
  type TimeProvider,
  type IdProvider,
} from '../core/index.ts';

// ============================================================
// EXPERIMENT STATUS
// ============================================================

export enum ExperimentStatus {
  SPECIFIED = 'SPECIFIED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABORTED = 'ABORTED',
}

// ============================================================
// EXPERIMENT TYPE
// ============================================================

export enum ExperimentType {
  BENCHMARK = 'BENCHMARK',
  ABLATION = 'ABLATION',
  ROBUSTNESS = 'ROBUSTNESS',
  CALIBRATION = 'CALIBRATION',
  FAIRNESS = 'FAIRNESS',
  RESOURCE_EVALUATION = 'RESOURCE_EVALUATION',
  REPRODUCIBILITY = 'REPRODUCIBILITY',
  HUMAN_STUDY = 'HUMAN_STUDY',
}

// ============================================================
// SCENARIO DEFINITION
// ============================================================

export interface ScenarioDefinition {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  family: 'REASONING' | 'CAUSAL' | 'ABSTRACTION' | 'WORLD_MODEL' | 'PLANNING' | 'GOVERNANCE' | 'INTEGRATION';
  inputs: Record<string, unknown>;
  expectedOutputs?: Record<string, unknown>;
  constraints: string[];
  provenance: Provenance;
  version: string;
  createdAt: string;
}

// ============================================================
// EXECUTED SCENARIO
// ============================================================

export interface ExecutedScenario {
  id: string;
  scenarioDefinitionId: string;
  runId: string;
  actualInputs: Record<string, unknown>;
  actualOutputs: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'ABSTAINED' | 'SAFE_STOPPED';
  executionTime: number; // ms
  resources?: ResourceUsage;
  provenance: Provenance;
  executedAt: string;
}

// ============================================================
// EXPERIMENT
// ============================================================

export interface Experiment {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  type: ExperimentType;
  status: ExperimentStatus;
  scenarioIds: string[];
  metricIds: string[];
  configuration: ExperimentConfiguration;
  provenance: Provenance;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// EXPERIMENT CONFIGURATION
// ============================================================

export interface ExperimentConfiguration {
  seed: number;
  systemVersion: string;
  datasetVersion: string;
  environment: Record<string, string>;
  parameters: Record<string, unknown>;
}

// ============================================================
// EXPERIMENT RUN
// ============================================================

export interface ExperimentRun {
  id: string;
  experimentId: string;
  caseId: ResearchCaseId;
  status: ExperimentStatus;
  configuration: ExperimentConfiguration;
  executedScenarios: string[];
  metricResults: string[];
  startTime: string;
  endTime?: string;
  duration?: number; // ms
  provenance: Provenance;
}

// ============================================================
// METRIC DEFINITION
// ============================================================

export interface MetricDefinition {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  type: 'QUANTITATIVE' | 'QUALITATIVE';
  unit?: string;
  range?: { min: number; max: number };
  higherIsBetter: boolean;
  formula?: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// METRIC RESULT
// ============================================================

export interface MetricResult {
  id: string;
  metricDefinitionId: string;
  runId: string;
  value: number;
  confidence?: number;
  sampleSize?: number;
  provenance: Provenance;
  computedAt: string;
}

// ============================================================
// RESOURCE USAGE
// ============================================================

export interface ResourceUsage {
  runtime: number; // ms
  memory?: number; // bytes
  cpuTime?: number; // ms
  modelCalls?: number;
  toolCalls?: number;
  iterations?: number;
  replanningCount?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================
// REPRODUCIBILITY RECORD
// ============================================================

export interface ReproducibilityRecord {
  id: string;
  runId: string;
  softwareVersion: string;
  configuration: ExperimentConfiguration;
  seed: number;
  scenarioVersions: Record<string, string>;
  inputHash: string;
  outputHash: string;
  environmentSnapshot: Record<string, string>;
  provenance: Provenance;
  recordedAt: string;
}

// ============================================================
// EXPERIMENT REPOSITORY
// ============================================================

export interface ExperimentRepository {
  // Scenario Definitions
  createScenarioDefinition(caseId: ResearchCaseId, name: string, description: string, family: ScenarioDefinition['family'], inputs: Record<string, unknown>, constraints: string[], createdBy: string): ScenarioDefinition;
  getScenarioDefinition(id: string, caseId: ResearchCaseId): ScenarioDefinition | null;
  getScenarioDefinitionsByCase(caseId: ResearchCaseId): ScenarioDefinition[];

  // Experiments
  createExperiment(caseId: ResearchCaseId, name: string, description: string, type: ExperimentType, scenarioIds: string[], metricIds: string[], configuration: ExperimentConfiguration, createdBy: string): Experiment;
  getExperiment(id: string, caseId: ResearchCaseId): Experiment | null;
  getExperimentsByCase(caseId: ResearchCaseId): Experiment[];
  updateExperimentStatus(id: string, caseId: ResearchCaseId, status: ExperimentStatus): Experiment;

  // Experiment Runs
  createExperimentRun(experimentId: string, caseId: ResearchCaseId, configuration: ExperimentConfiguration, createdBy: string): ExperimentRun;
  getExperimentRun(id: string, caseId: ResearchCaseId): ExperimentRun | null;
  getExperimentRunsByExperiment(experimentId: string, caseId: ResearchCaseId): ExperimentRun[];
  updateRunStatus(id: string, caseId: ResearchCaseId, status: ExperimentStatus, endTime?: string, duration?: number): ExperimentRun;
  addExecutedScenario(runId: string, caseId: ResearchCaseId, scenarioId: string): ExperimentRun;
  addMetricResult(runId: string, caseId: ResearchCaseId, metricResultId: string): ExperimentRun;

  // Executed Scenarios
  createExecutedScenario(scenarioDefinitionId: string, runId: string, actualInputs: Record<string, unknown>, actualOutputs: Record<string, unknown>, status: ExecutedScenario['status'], executionTime: number, resources: ResourceUsage | undefined, createdBy: string): ExecutedScenario;
  getExecutedScenario(id: string, caseId: ResearchCaseId): ExecutedScenario | null;

  // Metric Definitions
  createMetricDefinition(caseId: ResearchCaseId, name: string, description: string, type: MetricDefinition['type'], higherIsBetter: boolean, unit?: string, range?: { min: number; max: number }, formula?: string): MetricDefinition;
  getMetricDefinition(id: string, caseId: ResearchCaseId): MetricDefinition | null;
  getMetricDefinitionsByCase(caseId: ResearchCaseId): MetricDefinition[];

  // Metric Results
  createMetricResult(metricDefinitionId: string, runId: string, value: number, confidence?: number, sampleSize?: number): MetricResult;
  getMetricResult(id: string, caseId: ResearchCaseId): MetricResult | null;
  getMetricResultsByRun(runId: string, caseId: ResearchCaseId): MetricResult[];

  // Reproducibility
  createReproducibilityRecord(runId: string, softwareVersion: string, configuration: ExperimentConfiguration, seed: number, scenarioVersions: Record<string, string>, inputHash: string, outputHash: string, environmentSnapshot: Record<string, string>): ReproducibilityRecord;
  getReproducibilityRecord(runId: string, caseId: ResearchCaseId): ReproducibilityRecord | null;
}

export function createExperimentRepository(
  ids: IdProvider,
  time: TimeProvider,
): ExperimentRepository {
  const scenarioDefinitions = new Map<string, ScenarioDefinition>();
  const experiments = new Map<string, Experiment>();
  const experimentRuns = new Map<string, ExperimentRun>();
  const executedScenarios = new Map<string, ExecutedScenario>();
  const metricDefinitions = new Map<string, MetricDefinition>();
  const metricResults = new Map<string, MetricResult>();
  const reproducibilityRecords = new Map<string, ReproducibilityRecord>();

  return {
    // Scenario Definitions
    createScenarioDefinition(caseId, name, description, family, inputs, constraints, createdBy): ScenarioDefinition {
      const id = `scenario-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const scenario: ScenarioDefinition = {
        id,
        caseId,
        name,
        description,
        family,
        inputs,
        constraints,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'scenario-definition-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        version: '1.0.0',
        createdAt: now,
      };
      
      scenarioDefinitions.set(id, scenario);
      return scenario;
    },

    getScenarioDefinition(id, caseId): ScenarioDefinition | null {
      const scenario = scenarioDefinitions.get(id);
      if (!scenario) return null;
      if (scenario.caseId !== caseId) {
        throw new Error(`Case isolation violation: scenario ${id} belongs to case ${scenario.caseId}, not ${caseId}`);
      }
      return scenario;
    },

    getScenarioDefinitionsByCase(caseId): ScenarioDefinition[] {
      return Array.from(scenarioDefinitions.values()).filter(s => s.caseId === caseId);
    },

    // Experiments
    createExperiment(caseId, name, description, type, scenarioIds, metricIds, configuration, createdBy): Experiment {
      const id = `exp-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const experiment: Experiment = {
        id,
        caseId,
        name,
        description,
        type,
        status: ExperimentStatus.SPECIFIED,
        scenarioIds,
        metricIds,
        configuration,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'experiment-creation',
          version: '1',
          createdAt: now,
          inputs: scenarioIds,
          assumptions: [],
        },
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
      };
      
      experiments.set(id, experiment);
      return experiment;
    },

    getExperiment(id, caseId): Experiment | null {
      const exp = experiments.get(id);
      if (!exp) return null;
      if (exp.caseId !== caseId) {
        throw new Error(`Case isolation violation: experiment ${id} belongs to case ${exp.caseId}, not ${caseId}`);
      }
      return exp;
    },

    getExperimentsByCase(caseId): Experiment[] {
      return Array.from(experiments.values()).filter(e => e.caseId === caseId);
    },

    updateExperimentStatus(id, caseId, status): Experiment {
      const exp = experiments.get(id);
      if (!exp) throw new Error(`Experiment ${id} not found`);
      if (exp.caseId !== caseId) {
        throw new Error(`Case isolation violation: experiment ${id} belongs to case ${exp.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: Experiment = {
        ...exp,
        status,
        updatedAt: now,
      };
      
      experiments.set(id, updated);
      return updated;
    },

    // Experiment Runs
    createExperimentRun(experimentId, caseId, configuration, createdBy): ExperimentRun {
      const exp = experiments.get(experimentId);
      if (!exp) throw new Error(`Experiment ${experimentId} not found`);
      if (exp.caseId !== caseId) {
        throw new Error(`Case isolation violation: experiment ${experimentId} belongs to case ${exp.caseId}, not ${caseId}`);
      }
      
      const id = `run-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const run: ExperimentRun = {
        id,
        experimentId,
        caseId,
        status: ExperimentStatus.RUNNING,
        configuration,
        executedScenarios: [],
        metricResults: [],
        startTime: now,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'experiment-run-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      
      experimentRuns.set(id, run);
      return run;
    },

    getExperimentRun(id, caseId): ExperimentRun | null {
      const run = experimentRuns.get(id);
      if (!run) return null;
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      return run;
    },

    getExperimentRunsByExperiment(experimentId, caseId): ExperimentRun[] {
      return Array.from(experimentRuns.values()).filter(r => 
        r.caseId === caseId && r.experimentId === experimentId
      );
    },

    updateRunStatus(id, caseId, status, endTime, duration): ExperimentRun {
      const run = experimentRuns.get(id);
      if (!run) throw new Error(`Run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: ExperimentRun = {
        ...run,
        status,
        endTime,
        duration,
      };
      
      experimentRuns.set(id, updated);
      return updated;
    },

    addExecutedScenario(runId, caseId, scenarioId): ExperimentRun {
      const run = experimentRuns.get(runId);
      if (!run) throw new Error(`Run ${runId} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${runId} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: ExperimentRun = {
        ...run,
        executedScenarios: [...run.executedScenarios, scenarioId],
      };
      
      experimentRuns.set(runId, updated);
      return updated;
    },

    addMetricResult(runId, caseId, metricResultId): ExperimentRun {
      const run = experimentRuns.get(runId);
      if (!run) throw new Error(`Run ${runId} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: run ${runId} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: ExperimentRun = {
        ...run,
        metricResults: [...run.metricResults, metricResultId],
      };
      
      experimentRuns.set(runId, updated);
      return updated;
    },

    // Executed Scenarios
    createExecutedScenario(scenarioDefinitionId, runId, actualInputs, actualOutputs, status, executionTime, resources, createdBy): ExecutedScenario {
      const id = `exec-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const executed: ExecutedScenario = {
        id,
        scenarioDefinitionId,
        runId,
        actualInputs,
        actualOutputs,
        status,
        executionTime,
        resources,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.SYSTEM,
          method: 'scenario-execution',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        executedAt: now,
      };
      
      executedScenarios.set(id, executed);
      return executed;
    },

    getExecutedScenario(id, caseId): ExecutedScenario | null {
      const exec = executedScenarios.get(id);
      if (!exec) return null;
      // Note: ExecutedScenario doesn't have caseId directly, need to check via run
      const run = experimentRuns.get(exec.runId);
      if (!run || run.caseId !== caseId) {
        throw new Error(`Case isolation violation: executed scenario ${id} belongs to different case`);
      }
      return exec;
    },

    // Metric Definitions
    createMetricDefinition(caseId, name, description, type, higherIsBetter, unit, range, formula): MetricDefinition {
      const id = `metric-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const metric: MetricDefinition = {
        id,
        caseId,
        name,
        description,
        type,
        higherIsBetter,
        unit,
        range,
        formula,
        provenance: {
          id: provId,
          producer: 'system',
          producerType: ActorType.SYSTEM,
          method: 'metric-definition-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      
      metricDefinitions.set(id, metric);
      return metric;
    },

    getMetricDefinition(id, caseId): MetricDefinition | null {
      const metric = metricDefinitions.get(id);
      if (!metric) return null;
      if (metric.caseId !== caseId) {
        throw new Error(`Case isolation violation: metric ${id} belongs to case ${metric.caseId}, not ${caseId}`);
      }
      return metric;
    },

    getMetricDefinitionsByCase(caseId): MetricDefinition[] {
      return Array.from(metricDefinitions.values()).filter(m => m.caseId === caseId);
    },

    // Metric Results
    createMetricResult(metricDefinitionId, runId, value, confidence, sampleSize): MetricResult {
      const id = `result-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const result: MetricResult = {
        id,
        metricDefinitionId,
        runId,
        value,
        confidence,
        sampleSize,
        provenance: {
          id: provId,
          producer: 'system',
          producerType: ActorType.SYSTEM,
          method: 'metric-computation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        computedAt: now,
      };
      
      metricResults.set(id, result);
      return result;
    },

    getMetricResult(id, caseId): MetricResult | null {
      const result = metricResults.get(id);
      if (!result) return null;
      // Check case via run
      const run = experimentRuns.get(result.runId);
      if (!run || run.caseId !== caseId) {
        throw new Error(`Case isolation violation: metric result ${id} belongs to different case`);
      }
      return result;
    },

    getMetricResultsByRun(runId, caseId): MetricResult[] {
      return Array.from(metricResults.values()).filter(r => {
        const run = experimentRuns.get(r.runId);
        return run && run.caseId === caseId && r.runId === runId;
      });
    },

    // Reproducibility
    createReproducibilityRecord(runId, softwareVersion, configuration, seed, scenarioVersions, inputHash, outputHash, environmentSnapshot): ReproducibilityRecord {
      const id = `repro-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const record: ReproducibilityRecord = {
        id,
        runId,
        softwareVersion,
        configuration,
        seed,
        scenarioVersions,
        inputHash,
        outputHash,
        environmentSnapshot,
        provenance: {
          id: provId,
          producer: 'system',
          producerType: ActorType.SYSTEM,
          method: 'reproducibility-recording',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        recordedAt: now,
      };
      
      reproducibilityRecords.set(id, record);
      return record;
    },

    getReproducibilityRecord(runId, caseId): ReproducibilityRecord | null {
      const record = Array.from(reproducibilityRecords.values()).find(r => r.runId === runId);
      if (!record) return null;
      const run = experimentRuns.get(runId);
      if (!run || run.caseId !== caseId) {
        throw new Error(`Case isolation violation: reproducibility record belongs to different case`);
      }
      return record;
    },
  };
}
