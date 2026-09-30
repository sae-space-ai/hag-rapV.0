/**
 * HAG-RAP V.2 — Validation Module (WP2)
 * Validation protocols, benchmarks, acceptance criteria, metrics.
 * INVARIANT: SPECIFICATION ≠ RESULT. DEFINITION ≠ MEASUREMENT.
 */

import {
  ResearchCaseId,
  ActorType,
  Provenance,
  Versioned,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// METRIC DEFINITION
// ============================================================

export interface MetricDefinition {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  unit: string;
  type: 'quantitative' | 'qualitative';
  higherIsBetter: boolean;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// ACCEPTANCE CRITERION
// ============================================================

export interface AcceptanceCriterion {
  id: string;
  caseId: ResearchCaseId;
  metricId: string;
  operator: '>=' | '<=' | '==' | '!=' | '>' | '<';
  threshold: number;
  description: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// BENCHMARK SPECIFICATION
// ============================================================

export interface BenchmarkSpecification {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  metrics: string[]; // MetricDefinition IDs
  acceptanceCriteria: string[]; // AcceptanceCriterion IDs
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// SCIENTIFIC SCENARIO
// ============================================================

export interface ScientificScenario {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  preconditions: string[];
  expectedBehavior: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// VALIDATION PROTOCOL
// ============================================================

export interface ValidationProtocol {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  benchmarks: string[]; // BenchmarkSpecification IDs
  scenarios: string[]; // ScientificScenario IDs
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// VALIDATION REPOSITORY
// ============================================================

export interface ValidationRepository {
  createMetricDefinition(input: Omit<MetricDefinition, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): MetricDefinition;
  getMetricDefinition(id: string, caseId: ResearchCaseId): MetricDefinition | null;
  getMetricDefinitionsByCase(caseId: ResearchCaseId): MetricDefinition[];

  createAcceptanceCriterion(input: Omit<AcceptanceCriterion, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): AcceptanceCriterion;
  getAcceptanceCriterion(id: string, caseId: ResearchCaseId): AcceptanceCriterion | null;
  getAcceptanceCriteriaByCase(caseId: ResearchCaseId): AcceptanceCriterion[];

  createBenchmarkSpecification(input: Omit<BenchmarkSpecification, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): BenchmarkSpecification;
  getBenchmarkSpecification(id: string, caseId: ResearchCaseId): BenchmarkSpecification | null;
  getBenchmarkSpecificationsByCase(caseId: ResearchCaseId): BenchmarkSpecification[];

  createScientificScenario(input: Omit<ScientificScenario, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): ScientificScenario;
  getScientificScenario(id: string, caseId: ResearchCaseId): ScientificScenario | null;
  getScientificScenariosByCase(caseId: ResearchCaseId): ScientificScenario[];

  createValidationProtocol(input: Omit<ValidationProtocol, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): ValidationProtocol;
  getValidationProtocol(id: string, caseId: ResearchCaseId): ValidationProtocol | null;
  getValidationProtocolsByCase(caseId: ResearchCaseId): ValidationProtocol[];
}

export function createValidationRepository(
  ids: IdProvider,
  time: TimeProvider,
): ValidationRepository {
  const metrics = new Map<string, MetricDefinition>();
  const criteria = new Map<string, AcceptanceCriterion>();
  const benchmarks = new Map<string, BenchmarkSpecification>();
  const scenarios = new Map<string, ScientificScenario>();
  const protocols = new Map<string, ValidationProtocol>();

  const nextId = (prefix: string): string => `${prefix}-${ids.nextEvidenceId()}`;

  return {
    createMetricDefinition(input, createdBy): MetricDefinition {
      const now = time.now();
      const id = nextId('MET');
      const item: MetricDefinition = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'metric-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      metrics.set(id, item);
      return item;
    },

    getMetricDefinition(id, caseId): MetricDefinition | null {
      const m = metrics.get(id);
      if (!m) return null;
      if (m.caseId !== caseId) return null;
      return m;
    },

    getMetricDefinitionsByCase(caseId): MetricDefinition[] {
      return Array.from(metrics.values()).filter(m => m.caseId === caseId);
    },

    createAcceptanceCriterion(input, createdBy): AcceptanceCriterion {
      const now = time.now();
      const id = nextId('ACC');
      const item: AcceptanceCriterion = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'acceptance-criterion-definition',
          version: '1',
          createdAt: now,
          inputs: [input.metricId],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      criteria.set(id, item);
      return item;
    },

    getAcceptanceCriterion(id, caseId): AcceptanceCriterion | null {
      const c = criteria.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) return null;
      return c;
    },

    getAcceptanceCriteriaByCase(caseId): AcceptanceCriterion[] {
      return Array.from(criteria.values()).filter(c => c.caseId === caseId);
    },

    createBenchmarkSpecification(input, createdBy): BenchmarkSpecification {
      const now = time.now();
      const id = nextId('BEN');
      const item: BenchmarkSpecification = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'benchmark-specification',
          version: '1',
          createdAt: now,
          inputs: [...input.metrics, ...input.acceptanceCriteria],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      benchmarks.set(id, item);
      return item;
    },

    getBenchmarkSpecification(id, caseId): BenchmarkSpecification | null {
      const b = benchmarks.get(id);
      if (!b) return null;
      if (b.caseId !== caseId) return null;
      return b;
    },

    getBenchmarkSpecificationsByCase(caseId): BenchmarkSpecification[] {
      return Array.from(benchmarks.values()).filter(b => b.caseId === caseId);
    },

    createScientificScenario(input, createdBy): ScientificScenario {
      const now = time.now();
      const id = nextId('SCN');
      const item: ScientificScenario = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'scenario-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      scenarios.set(id, item);
      return item;
    },

    getScientificScenario(id, caseId): ScientificScenario | null {
      const s = scenarios.get(id);
      if (!s) return null;
      if (s.caseId !== caseId) return null;
      return s;
    },

    getScientificScenariosByCase(caseId): ScientificScenario[] {
      return Array.from(scenarios.values()).filter(s => s.caseId === caseId);
    },

    createValidationProtocol(input, createdBy): ValidationProtocol {
      const now = time.now();
      const id = nextId('VAL');
      const item: ValidationProtocol = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'validation-protocol-definition',
          version: '1',
          createdAt: now,
          inputs: [...input.benchmarks, ...input.scenarios],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      protocols.set(id, item);
      return item;
    },

    getValidationProtocol(id, caseId): ValidationProtocol | null {
      const p = protocols.get(id);
      if (!p) return null;
      if (p.caseId !== caseId) return null;
      return p;
    },

    getValidationProtocolsByCase(caseId): ValidationProtocol[] {
      return Array.from(protocols.values()).filter(p => p.caseId === caseId);
    },
  };
}
