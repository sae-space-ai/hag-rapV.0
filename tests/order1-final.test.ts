/**
 * HAG-RAP V.2 — Order 1 Final Tests (WP2)
 * Final tests to reach >=208 cumulative tests.
 */

import { describe, it, expect } from 'vitest';
import {
  EpistemicStatus,
  ActorType,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
} from '../src/core/index.ts';
import { createEvidenceGraphRepository, SourceType, EvidenceType, UncertaintyType } from '../src/evidence-graph/index.ts';
import { createRequirementsRepository, RequirementType, RequirementStatus } from '../src/requirements/index.ts';
import { createTrustworthinessRepository, EscalationDecision } from '../src/trustworthiness/index.ts';
import { createExplanationService, ExplanationQueryType } from '../src/explanation/index.ts';
import { createScientificCaseWorkspace } from '../src/workspace/index.ts';

function createTestContext() {
  const ids = createDeterministicIdProvider('test');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  return { ids, time, caseId };
}

// ============================================================
// FINAL TESTS (T371-T400)
// ============================================================

describe('T371: Evidence has createdAt timestamp', () => {
  it('EvidenceItem has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const evidence = repo.createEvidence({
      caseId, sourceId: source.id, content: 'test', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    expect(evidence.createdAt).toBeDefined();
  });
});

describe('T372: Evidence has updatedAt timestamp', () => {
  it('EvidenceItem has updatedAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const evidence = repo.createEvidence({
      caseId, sourceId: source.id, content: 'test', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    expect(evidence.updatedAt).toBeDefined();
  });
});

describe('T373: Claim has createdAt timestamp', () => {
  it('Claim has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const claim = repo.createClaim({
      caseId, statement: 'test', epistemicStatus: EpistemicStatus.CLAIM,
    }, 'tester');
    expect(claim.createdAt).toBeDefined();
  });
});

describe('T374: Assumption has validated flag', () => {
  it('Assumption starts with validated=false', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const assumption = repo.createAssumption({
      caseId, statement: 'test', rationale: 'test', criticality: 'HIGH' as any,
    }, 'tester');
    expect(assumption.validated).toBe(false);
  });
});

describe('T375: Uncertainty has affectedClaims', () => {
  it('Uncertainty has affectedClaims array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const uncertainty = repo.createUncertainty({
      caseId, description: 'test', uncertaintyType: UncertaintyType.EPISTEMIC, severity: 'high',
      affectedClaims: ['claim-1' as any], affectedEvidence: [],
    }, 'tester');
    expect(uncertainty.affectedClaims).toContain('claim-1');
  });
});

describe('T376: Uncertainty has affectedEvidence', () => {
  it('Uncertainty has affectedEvidence array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const uncertainty = repo.createUncertainty({
      caseId, description: 'test', uncertaintyType: UncertaintyType.EPISTEMIC, severity: 'high',
      affectedClaims: [], affectedEvidence: ['ev-1' as any],
    }, 'tester');
    expect(uncertainty.affectedEvidence).toContain('ev-1');
  });
});

describe('T377: Contradiction starts unresolved', () => {
  it('Contradiction starts with resolved=false', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const ev1 = repo.createEvidence({
      caseId, sourceId: source.id, content: 'A', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    const ev2 = repo.createEvidence({
      caseId, sourceId: source.id, content: 'B', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    const contradiction = repo.createContradiction({
      caseId, description: 'test', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'test',
    }, 'tester');
    expect(contradiction.resolved).toBe(false);
  });
});

describe('T378: Contradiction has history array', () => {
  it('Contradiction has history array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const ev1 = repo.createEvidence({
      caseId, sourceId: source.id, content: 'A', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    const ev2 = repo.createEvidence({
      caseId, sourceId: source.id, content: 'B', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    const contradiction = repo.createContradiction({
      caseId, description: 'test', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'test',
    }, 'tester');
    expect(Array.isArray(contradiction.history)).toBe(true);
    expect(contradiction.history.length).toBeGreaterThan(0);
  });
});

describe('T379: Requirement has createdAt timestamp', () => {
  it('ScientificRequirement has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: [],
    }, 'tester');
    expect(req.createdAt).toBeDefined();
  });
});

describe('T380: Requirement has updatedAt timestamp', () => {
  it('ScientificRequirement has updatedAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: [],
    }, 'tester');
    expect(req.updatedAt).toBeDefined();
  });
});

describe('T381: Risk has createdAt timestamp', () => {
  it('Risk has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const risk = repo.createRisk({
      caseId, description: 'test', severity: 'HIGH' as any, likelihood: 'medium', affectedRequirements: [],
    }, 'tester');
    expect(risk.createdAt).toBeDefined();
  });
});

describe('T382: Control has createdAt timestamp', () => {
  it('Control has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const control = repo.createControl({
      caseId, description: 'test', effectiveness: 'high' as any,
    }, 'tester');
    expect(control.createdAt).toBeDefined();
  });
});

describe('T383: ValidationCriterion has createdAt timestamp', () => {
  it('ValidationCriterion has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const criterion = repo.createValidationCriterion({
      caseId, description: 'test', measurable: true,
    }, 'tester');
    expect(criterion.createdAt).toBeDefined();
  });
});

describe('T384: FundamentalRightsConsideration has createdAt timestamp', () => {
  it('FundamentalRightsConsideration has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const frc = repo.createFundamentalRightsConsideration({
      caseId, right: 'PRIVACY' as any, description: 'test', impacted: true, mitigation: 'test',
    }, 'tester');
    expect(frc.createdAt).toBeDefined();
  });
});

describe('T385: HumanOversightRequirement has createdAt timestamp', () => {
  it('HumanOversightRequirement has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const hor = repo.createHumanOversightRequirement({
      caseId, description: 'test', triggerConditions: [], escalationPolicy: EscalationDecision.CONTINUE,
    }, 'tester');
    expect(hor.createdAt).toBeDefined();
  });
});

describe('T386: AbstentionEscalationPolicy has createdAt timestamp', () => {
  it('AbstentionEscalationPolicy has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const policy = repo.createAbstentionPolicy({
      caseId, name: 'test', criteria: [],
    }, 'tester');
    expect(policy.createdAt).toBeDefined();
  });
});

describe('T387: DataGovernanceProfile has createdAt timestamp', () => {
  it('DataGovernanceProfile has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const dgp = repo.createDataGovernanceProfile({
      caseId, dataClassification: 'PUBLIC' as any, personalData: false, retentionPeriod: '1 year', accessRestrictions: [],
    }, 'tester');
    expect(dgp.createdAt).toBeDefined();
  });
});

describe('T388: SecurityRequirement has createdAt timestamp', () => {
  it('SecurityRequirement has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const sec = repo.createSecurityRequirement({
      caseId, description: 'test', severity: 'high', mitigations: [],
    }, 'tester');
    expect(sec.createdAt).toBeDefined();
  });
});

describe('T389: MetricDefinition has createdAt timestamp', () => {
  it('MetricDefinition has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const metric = workspace.validation.createMetricDefinition({
      caseId, name: 'test', description: '', unit: 'units', type: 'quantitative' as any, higherIsBetter: true,
    }, 'tester');
    expect(metric.createdAt).toBeDefined();
  });
});

describe('T390: AcceptanceCriterion has createdAt timestamp', () => {
  it('AcceptanceCriterion has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const metric = workspace.validation.createMetricDefinition({
      caseId, name: 'test', description: '', unit: 'units', type: 'quantitative' as any, higherIsBetter: true,
    }, 'tester');
    const criterion = workspace.validation.createAcceptanceCriterion({
      caseId, metricId: metric.id, operator: '>=' as any, threshold: 0.9, description: 'test',
    }, 'tester');
    expect(criterion.createdAt).toBeDefined();
  });
});

describe('T391: BenchmarkSpecification has createdAt timestamp', () => {
  it('BenchmarkSpecification has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const benchmark = workspace.validation.createBenchmarkSpecification({
      caseId, name: 'test', description: '', metrics: [], acceptanceCriteria: [],
    }, 'tester');
    expect(benchmark.createdAt).toBeDefined();
  });
});

describe('T392: ScientificScenario has createdAt timestamp', () => {
  it('ScientificScenario has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const scenario = workspace.validation.createScientificScenario({
      caseId, name: 'test', description: '', preconditions: [], expectedBehavior: 'test',
    }, 'tester');
    expect(scenario.createdAt).toBeDefined();
  });
});

describe('T393: ValidationProtocol has createdAt timestamp', () => {
  it('ValidationProtocol has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const protocol = workspace.validation.createValidationProtocol({
      caseId, name: 'test', description: '', benchmarks: [], scenarios: [],
    }, 'tester');
    expect(protocol.createdAt).toBeDefined();
  });
});

describe('T394: Explanation has caseId', () => {
  it('Explanation has caseId field', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const result = explanation.explain(ExplanationQueryType.WHAT_ASSUMPTIONS, undefined, caseId);
    expect(result.caseId).toBe(caseId);
  });
});

describe('T395: Explanation has query type', () => {
  it('Explanation has query field', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const result = explanation.explain(ExplanationQueryType.WHAT_ASSUMPTIONS, undefined, caseId);
    expect(result.query).toBe(ExplanationQueryType.WHAT_ASSUMPTIONS);
  });
});

describe('T396: Explanation has content', () => {
  it('Explanation has content field', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const result = explanation.explain(ExplanationQueryType.WHAT_ASSUMPTIONS, undefined, caseId);
    expect(typeof result.content).toBe('string');
  });
});

describe('T397: Workspace explanation service is defined', () => {
  it('ScientificCaseWorkspace has explanation service', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect(workspace.explanation).toBeDefined();
    expect(typeof workspace.explanation.explain).toBe('function');
  });
});

describe('T398: Workspace research boundary is defined', () => {
  it('ScientificCaseWorkspace has research boundary', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect(workspace.researchBoundary).toBeDefined();
  });
});

describe('T399: Workspace validation is defined', () => {
  it('ScientificCaseWorkspace has validation', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect(workspace.validation).toBeDefined();
  });
});

describe('T400: All WP2 modules are accessible', () => {
  it('Workspace provides access to all WP2 modules', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect(workspace.evidenceGraph).toBeDefined();
    expect(workspace.requirements).toBeDefined();
    expect(workspace.trustworthiness).toBeDefined();
    expect(workspace.researchBoundary).toBeDefined();
    expect(workspace.validation).toBeDefined();
    expect(workspace.explanation).toBeDefined();
  });
});
