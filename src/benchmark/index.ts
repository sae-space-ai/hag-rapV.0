/**
 * HAG-RAP V.2 — Benchmark Framework (WP7)
 * Benchmarking infrastructure with strict epistemic honesty
 * 
 * CRITICAL INVARIANTS:
 * - SPECIFICATION ≠ EXECUTION
 * - TARGET ≠ ACHIEVEMENT
 * - No fabricated benchmark results
 * - Comparison requires actual execution
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
// BENCHMARK DEFINITION
// ============================================================

export interface BenchmarkDefinition {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  family: 'REASONING' | 'CAUSAL' | 'ABSTRACTION' | 'WORLD_MODEL' | 'PLANNING' | 'GOVERNANCE' | 'INTEGRATION';
  taskCount: number;
  scenarioIds: string[];
  metricIds: string[];
  targetMetrics?: Record<string, number>; // Targets (NOT achievements)
  provenance: Provenance;
  version: string;
  createdAt: string;
}

// ============================================================
// BENCHMARK RUN
// ============================================================

export interface BenchmarkRun {
  id: string;
  benchmarkDefinitionId: string;
  caseId: ResearchCaseId;
  systemVersion: string;
  configuration: Record<string, unknown>;
  seed: number;
  executedTasks: number;
  totalTasks: number;
  completedAt?: string;
  duration?: number; // ms
  provenance: Provenance;
}

// ============================================================
// BASELINE
// ============================================================

export interface Baseline {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  systemVersion: string;
  configuration: Record<string, unknown>;
  benchmarkResults: Record<string, number>; // metricId -> value
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// ABLATION DEFINITION
// ============================================================

export interface AblationDefinition {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  component: 'CAUSAL' | 'ABSTRACTION' | 'PROVENANCE' | 'UNCERTAINTY' | 'GOVERNANCE' | 'REPLANNING';
  disabled: boolean;
  benchmarkId: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// ABLATION RESULT
// ============================================================

export interface AblationResult {
  id: string;
  ablationDefinitionId: string;
  benchmarkRunId: string;
  metricResults: Record<string, number>;
  comparisonToFull: Record<string, number>; // metricId -> delta
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// PERTURBATION TYPE
// ============================================================

export enum PerturbationType {
  MISSING_EVIDENCE = 'MISSING_EVIDENCE',
  CONTRADICTORY_EVIDENCE = 'CONTRADICTORY_EVIDENCE',
  NOISE = 'NOISE',
  DISTRIBUTION_SHIFT = 'DISTRIBUTION_SHIFT',
  RESOURCE_CONSTRAINT = 'RESOURCE_CONSTRAINT',
  GOAL_CHANGE = 'GOAL_CHANGE',
  WORLD_STATE_CHANGE = 'WORLD_STATE_CHANGE',
  AUTHORITY_RESTRICTION = 'AUTHORITY_RESTRICTION',
  ADVERSARIAL_INPUT = 'ADVERSARIAL_INPUT',
}

// ============================================================
// PERTURBATION DEFINITION
// ============================================================

export interface PerturbationDefinition {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  type: PerturbationType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  parameters: Record<string, unknown>;
  benchmarkId: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// PERTURBATION RESULT
// ============================================================

export interface PerturbationResult {
  id: string;
  perturbationDefinitionId: string;
  benchmarkRunId: string;
  status: 'SUCCESS' | 'FAILURE' | 'GRACEFUL_DEGRADATION' | 'ABSTENTION' | 'SAFE_STOP';
  metricResults: Record<string, number>;
  comparisonToBaseline: Record<string, number>;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// BENCHMARK REPOSITORY
// ============================================================

export interface BenchmarkRepository {
  // Benchmark Definitions
  createBenchmarkDefinition(caseId: ResearchCaseId, name: string, description: string, family: BenchmarkDefinition['family'], taskCount: number, scenarioIds: string[], metricIds: string[], targetMetrics: Record<string, number> | undefined, createdBy: string): BenchmarkDefinition;
  getBenchmarkDefinition(id: string, caseId: ResearchCaseId): BenchmarkDefinition | null;
  getBenchmarkDefinitionsByCase(caseId: ResearchCaseId): BenchmarkDefinition[];

  // Benchmark Runs
  createBenchmarkRun(benchmarkDefinitionId: string, caseId: ResearchCaseId, systemVersion: string, configuration: Record<string, unknown>, seed: number, totalTasks: number, createdBy: string): BenchmarkRun;
  getBenchmarkRun(id: string, caseId: ResearchCaseId): BenchmarkRun | null;
  getBenchmarkRunsByDefinition(benchmarkDefinitionId: string, caseId: ResearchCaseId): BenchmarkRun[];
  updateBenchmarkRun(id: string, caseId: ResearchCaseId, executedTasks: number, completedAt?: string, duration?: number): BenchmarkRun;

  // Baselines
  createBaseline(caseId: ResearchCaseId, name: string, description: string, systemVersion: string, configuration: Record<string, unknown>, benchmarkResults: Record<string, number>, createdBy: string): Baseline;
  getBaseline(id: string, caseId: ResearchCaseId): Baseline | null;
  getBaselinesByCase(caseId: ResearchCaseId): Baseline[];

  // Ablations
  createAblationDefinition(caseId: ResearchCaseId, name: string, description: string, component: AblationDefinition['component'], benchmarkId: string, createdBy: string): AblationDefinition;
  getAblationDefinition(id: string, caseId: ResearchCaseId): AblationDefinition | null;
  getAblationDefinitionsByCase(caseId: ResearchCaseId): AblationDefinition[];

  createAblationResult(ablationDefinitionId: string, benchmarkRunId: string, metricResults: Record<string, number>, comparisonToFull: Record<string, number>): AblationResult;
  getAblationResult(id: string, caseId: ResearchCaseId): AblationResult | null;
  getAblationResultsByDefinition(ablationDefinitionId: string, caseId: ResearchCaseId): AblationResult[];

  // Perturbations
  createPerturbationDefinition(caseId: ResearchCaseId, name: string, description: string, type: PerturbationType, severity: PerturbationDefinition['severity'], parameters: Record<string, unknown>, benchmarkId: string, createdBy: string): PerturbationDefinition;
  getPerturbationDefinition(id: string, caseId: ResearchCaseId): PerturbationDefinition | null;
  getPerturbationDefinitionsByCase(caseId: ResearchCaseId): PerturbationDefinition[];

  createPerturbationResult(perturbationDefinitionId: string, benchmarkRunId: string, status: PerturbationResult['status'], metricResults: Record<string, number>, comparisonToBaseline: Record<string, number>): PerturbationResult;
  getPerturbationResult(id: string, caseId: ResearchCaseId): PerturbationResult | null;
  getPerturbationResultsByDefinition(perturbationDefinitionId: string, caseId: ResearchCaseId): PerturbationResult[];
}

export function createBenchmarkRepository(
  ids: IdProvider,
  time: TimeProvider,
): BenchmarkRepository {
  const benchmarkDefinitions = new Map<string, BenchmarkDefinition>();
  const benchmarkRuns = new Map<string, BenchmarkRun>();
  const baselines = new Map<string, Baseline>();
  const ablationDefinitions = new Map<string, AblationDefinition>();
  const ablationResults = new Map<string, AblationResult>();
  const perturbationDefinitions = new Map<string, PerturbationDefinition>();
  const perturbationResults = new Map<string, PerturbationResult>();

  return {
    // Benchmark Definitions
    createBenchmarkDefinition(caseId, name, description, family, taskCount, scenarioIds, metricIds, targetMetrics, createdBy): BenchmarkDefinition {
      const id = `bench-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const benchmark: BenchmarkDefinition = {
        id,
        caseId,
        name,
        description,
        family,
        taskCount,
        scenarioIds,
        metricIds,
        targetMetrics,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'benchmark-definition-creation',
          version: '1',
          createdAt: now,
          inputs: scenarioIds,
          assumptions: [],
        },
        version: '1.0.0',
        createdAt: now,
      };
      
      benchmarkDefinitions.set(id, benchmark);
      return benchmark;
    },

    getBenchmarkDefinition(id, caseId): BenchmarkDefinition | null {
      const bench = benchmarkDefinitions.get(id);
      if (!bench) return null;
      if (bench.caseId !== caseId) {
        throw new Error(`Case isolation violation: benchmark ${id} belongs to case ${bench.caseId}, not ${caseId}`);
      }
      return bench;
    },

    getBenchmarkDefinitionsByCase(caseId): BenchmarkDefinition[] {
      return Array.from(benchmarkDefinitions.values()).filter(b => b.caseId === caseId);
    },

    // Benchmark Runs
    createBenchmarkRun(benchmarkDefinitionId, caseId, systemVersion, configuration, seed, totalTasks, createdBy): BenchmarkRun {
      const bench = benchmarkDefinitions.get(benchmarkDefinitionId);
      if (!bench) throw new Error(`Benchmark ${benchmarkDefinitionId} not found`);
      if (bench.caseId !== caseId) {
        throw new Error(`Case isolation violation: benchmark ${benchmarkDefinitionId} belongs to case ${bench.caseId}, not ${caseId}`);
      }
      
      const id = `benchrun-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const run: BenchmarkRun = {
        id,
        benchmarkDefinitionId,
        caseId,
        systemVersion,
        configuration,
        seed,
        executedTasks: 0,
        totalTasks,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'benchmark-run-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      
      benchmarkRuns.set(id, run);
      return run;
    },

    getBenchmarkRun(id, caseId): BenchmarkRun | null {
      const run = benchmarkRuns.get(id);
      if (!run) return null;
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: benchmark run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      return run;
    },

    getBenchmarkRunsByDefinition(benchmarkDefinitionId, caseId): BenchmarkRun[] {
      return Array.from(benchmarkRuns.values()).filter(r => 
        r.caseId === caseId && r.benchmarkDefinitionId === benchmarkDefinitionId
      );
    },

    updateBenchmarkRun(id, caseId, executedTasks, completedAt, duration): BenchmarkRun {
      const run = benchmarkRuns.get(id);
      if (!run) throw new Error(`Benchmark run ${id} not found`);
      if (run.caseId !== caseId) {
        throw new Error(`Case isolation violation: benchmark run ${id} belongs to case ${run.caseId}, not ${caseId}`);
      }
      
      const updated: BenchmarkRun = {
        ...run,
        executedTasks,
        completedAt,
        duration,
      };
      
      benchmarkRuns.set(id, updated);
      return updated;
    },

    // Baselines
    createBaseline(caseId, name, description, systemVersion, configuration, benchmarkResults, createdBy): Baseline {
      const id = `baseline-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const baseline: Baseline = {
        id,
        caseId,
        name,
        description,
        systemVersion,
        configuration,
        benchmarkResults,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'baseline-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      
      baselines.set(id, baseline);
      return baseline;
    },

    getBaseline(id, caseId): Baseline | null {
      const baseline = baselines.get(id);
      if (!baseline) return null;
      if (baseline.caseId !== caseId) {
        throw new Error(`Case isolation violation: baseline ${id} belongs to case ${baseline.caseId}, not ${caseId}`);
      }
      return baseline;
    },

    getBaselinesByCase(caseId): Baseline[] {
      return Array.from(baselines.values()).filter(b => b.caseId === caseId);
    },

    // Ablations
    createAblationDefinition(caseId, name, description, component, benchmarkId, createdBy): AblationDefinition {
      const id = `ablation-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const ablation: AblationDefinition = {
        id,
        caseId,
        name,
        description,
        component,
        disabled: true,
        benchmarkId,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'ablation-definition-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      
      ablationDefinitions.set(id, ablation);
      return ablation;
    },

    getAblationDefinition(id, caseId): AblationDefinition | null {
      const ablation = ablationDefinitions.get(id);
      if (!ablation) return null;
      if (ablation.caseId !== caseId) {
        throw new Error(`Case isolation violation: ablation ${id} belongs to case ${ablation.caseId}, not ${caseId}`);
      }
      return ablation;
    },

    getAblationDefinitionsByCase(caseId): AblationDefinition[] {
      return Array.from(ablationDefinitions.values()).filter(a => a.caseId === caseId);
    },

    createAblationResult(ablationDefinitionId, benchmarkRunId, metricResults, comparisonToFull): AblationResult {
      const id = `ablationresult-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const result: AblationResult = {
        id,
        ablationDefinitionId,
        benchmarkRunId,
        metricResults,
        comparisonToFull,
        provenance: {
          id: provId,
          producer: 'system',
          producerType: ActorType.SYSTEM,
          method: 'ablation-result-computation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      
      ablationResults.set(id, result);
      return result;
    },

    getAblationResult(id, caseId): AblationResult | null {
      const result = ablationResults.get(id);
      if (!result) return null;
      // Check case via ablation definition
      const ablation = ablationDefinitions.get(result.ablationDefinitionId);
      if (!ablation || ablation.caseId !== caseId) {
        throw new Error(`Case isolation violation: ablation result ${id} belongs to different case`);
      }
      return result;
    },

    getAblationResultsByDefinition(ablationDefinitionId, caseId): AblationResult[] {
      return Array.from(ablationResults.values()).filter(r => {
        const ablation = ablationDefinitions.get(r.ablationDefinitionId);
        return ablation && ablation.caseId === caseId && r.ablationDefinitionId === ablationDefinitionId;
      });
    },

    // Perturbations
    createPerturbationDefinition(caseId, name, description, type, severity, parameters, benchmarkId, createdBy): PerturbationDefinition {
      const id = `perturbation-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const perturbation: PerturbationDefinition = {
        id,
        caseId,
        name,
        description,
        type,
        severity,
        parameters,
        benchmarkId,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'perturbation-definition-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      
      perturbationDefinitions.set(id, perturbation);
      return perturbation;
    },

    getPerturbationDefinition(id, caseId): PerturbationDefinition | null {
      const perturbation = perturbationDefinitions.get(id);
      if (!perturbation) return null;
      if (perturbation.caseId !== caseId) {
        throw new Error(`Case isolation violation: perturbation ${id} belongs to case ${perturbation.caseId}, not ${caseId}`);
      }
      return perturbation;
    },

    getPerturbationDefinitionsByCase(caseId): PerturbationDefinition[] {
      return Array.from(perturbationDefinitions.values()).filter(p => p.caseId === caseId);
    },

    createPerturbationResult(perturbationDefinitionId, benchmarkRunId, status, metricResults, comparisonToBaseline): PerturbationResult {
      const id = `perturbationresult-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const result: PerturbationResult = {
        id,
        perturbationDefinitionId,
        benchmarkRunId,
        status,
        metricResults,
        comparisonToBaseline,
        provenance: {
          id: provId,
          producer: 'system',
          producerType: ActorType.SYSTEM,
          method: 'perturbation-result-computation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      
      perturbationResults.set(id, result);
      return result;
    },

    getPerturbationResult(id, caseId): PerturbationResult | null {
      const result = perturbationResults.get(id);
      if (!result) return null;
      const perturbation = perturbationDefinitions.get(result.perturbationDefinitionId);
      if (!perturbation || perturbation.caseId !== caseId) {
        throw new Error(`Case isolation violation: perturbation result ${id} belongs to different case`);
      }
      return result;
    },

    getPerturbationResultsByDefinition(perturbationDefinitionId, caseId): PerturbationResult[] {
      return Array.from(perturbationResults.values()).filter(r => {
        const perturbation = perturbationDefinitions.get(r.perturbationDefinitionId);
        return perturbation && perturbation.caseId === caseId && r.perturbationDefinitionId === perturbationDefinitionId;
      });
    },
  };
}
