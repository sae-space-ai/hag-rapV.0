/**
 * HAG-RAP V.2 — Order 1 Additional Tests (WP2)
 * Additional tests to reach >=120 tests for Order 1.
 */

import { describe, it, expect } from 'vitest';
import {
  EpistemicStatus,
  ActorType,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
  DomainError,
} from '../src/core/index.ts';
import { createEvidenceGraphRepository, SourceType, EvidenceType, GraphRelationType, AssumptionCriticality, UncertaintyType } from '../src/evidence-graph/index.ts';
import { createRequirementsRepository, RequirementType, RequirementStatus, RiskSeverity } from '../src/requirements/index.ts';
import { createTrustworthinessRepository, FundamentalRight, EscalationDecision, DataClassification } from '../src/trustworthiness/index.ts';
import { createResearchBoundaryRepository, AllowedDataType, ProhibitedDomain } from '../src/research-boundary/index.ts';
import { createValidationRepository } from '../src/validation/index.ts';
import { createExplanationService, ExplanationQueryType } from '../src/explanation/index.ts';
import { createScientificCaseWorkspace, exportScientificCase } from '../src/workspace/index.ts';

function createTestContext() {
  const ids = createDeterministicIdProvider('test');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  return { ids, time, caseId };
}

// ============================================================
// ADDITIONAL EVIDENCE GRAPH TESTS (T231-T260)
// ============================================================

describe('T231: Source types are distinct', () => {
  it('SourceType enum has all required values', () => {
    expect(SourceType.DOCUMENTARY).toBe('DOCUMENTARY');
    expect(SourceType.EMPIRICAL).toBe('EMPIRICAL');
    expect(SourceType.COMPUTATIONAL).toBe('COMPUTATIONAL');
    expect(SourceType.EXPERT_OPINION).toBe('EXPERT_OPINION');
    expect(SourceType.SYNTHETIC).toBe('SYNTHETIC');
    expect(SourceType.GENERATED).toBe('GENERATED');
  });
});

describe('T232: Evidence types are distinct', () => {
  it('EvidenceType enum has all required values', () => {
    expect(EvidenceType.OBSERVATION).toBe('OBSERVATION');
    expect(EvidenceType.MEASUREMENT).toBe('MEASUREMENT');
    expect(EvidenceType.TEST_RESULT).toBe('TEST_RESULT');
    expect(EvidenceType.DOCUMENT_EXCERPT).toBe('DOCUMENT_EXCERPT');
    expect(EvidenceType.COMPUTATIONAL_OUTPUT).toBe('COMPUTATIONAL_OUTPUT');
    expect(EvidenceType.DERIVED).toBe('DERIVED');
  });
});

describe('T233: Assumption criticality levels', () => {
  it('AssumptionCriticality enum has all levels', () => {
    expect(AssumptionCriticality.LOW).toBe('LOW');
    expect(AssumptionCriticality.MEDIUM).toBe('MEDIUM');
    expect(AssumptionCriticality.HIGH).toBe('HIGH');
    expect(AssumptionCriticality.CRITICAL).toBe('CRITICAL');
  });
});

describe('T234: Evidence scope has domain', () => {
  it('EvidenceItem has scope with domain', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const evidence = repo.createEvidence({
      caseId, sourceId: source.id, content: 'test', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'water-quality' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    expect(evidence.scope.domain).toBe('water-quality');
  });
});

describe('T235: Evidence independence level', () => {
  it('EvidenceQuality has independenceLevel', () => {
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
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'derived' },
    }, 'tester');
    expect(evidence.quality.independenceLevel).toBe('derived');
  });
});

describe('T236: Claim has supportedBy array', () => {
  it('Claim starts with empty supportedBy', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const claim = repo.createClaim({
      caseId, statement: 'test', epistemicStatus: EpistemicStatus.CLAIM,
    }, 'tester');
    expect(claim.supportedBy).toEqual([]);
  });
});

describe('T237: Claim has refutedBy array', () => {
  it('Claim starts with empty refutedBy', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const claim = repo.createClaim({
      caseId, statement: 'test', epistemicStatus: EpistemicStatus.CLAIM,
    }, 'tester');
    expect(claim.refutedBy).toEqual([]);
  });
});

describe('T238: Uncertainty has severity', () => {
  it('Uncertainty has severity field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const uncertainty = repo.createUncertainty({
      caseId, description: 'test', uncertaintyType: UncertaintyType.EPISTEMIC, severity: 'high',
      affectedClaims: [], affectedEvidence: [],
    }, 'tester');
    expect(uncertainty.severity).toBe('high');
  });
});

describe('T239: Contradiction has nature', () => {
  it('Contradiction has nature field', () => {
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
      caseId, description: 'test', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'measurement discrepancy',
    }, 'tester');
    expect(contradiction.nature).toBe('measurement discrepancy');
  });
});

describe('T240: Graph relation has fromType and toType', () => {
  it('GraphRelation has typed endpoints', () => {
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
    const relation = repo.addRelation(source.id, 'source', evidence.id, 'evidence', GraphRelationType.DERIVED_FROM, caseId, 'tester');
    expect(relation.fromType).toBe('source');
    expect(relation.toType).toBe('evidence');
  });
});

// ============================================================
// ADDITIONAL REQUIREMENTS TESTS (T261-T280)
// ============================================================

describe('T261: Requirement has priority', () => {
  it('ScientificRequirement has priority field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'critical', sources: [], evidence: [],
    }, 'tester');
    expect(req.priority).toBe('critical');
  });
});

describe('T262: Requirement has sources array', () => {
  it('ScientificRequirement has sources field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: ['src-1' as any], evidence: [],
    }, 'tester');
    expect(req.sources).toContain('src-1');
  });
});

describe('T263: Requirement has evidence array', () => {
  it('ScientificRequirement has evidence field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: ['ev-1' as any],
    }, 'tester');
    expect(req.evidence).toContain('ev-1');
  });
});

describe('T264: Risk has likelihood', () => {
  it('Risk has likelihood field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const risk = repo.createRisk({
      caseId, description: 'test', severity: RiskSeverity.HIGH, likelihood: 'high', affectedRequirements: [],
    }, 'tester');
    expect(risk.likelihood).toBe('high');
  });
});

describe('T265: Risk has residualRisk', () => {
  it('Risk starts with residualRisk equal to severity', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const risk = repo.createRisk({
      caseId, description: 'test', severity: RiskSeverity.CRITICAL, likelihood: 'high', affectedRequirements: [],
    }, 'tester');
    expect(risk.residualRisk).toBe(RiskSeverity.CRITICAL);
  });
});

describe('T266: Control has effectiveness', () => {
  it('Control has effectiveness field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const control = repo.createControl({
      caseId, description: 'test', effectiveness: 'high',
    }, 'tester');
    expect(control.effectiveness).toBe('high');
  });
});

describe('T267: ValidationCriterion has threshold', () => {
  it('ValidationCriterion has threshold field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const criterion = repo.createValidationCriterion({
      caseId, description: 'test', measurable: true, threshold: '0.9',
    }, 'tester');
    expect(criterion.threshold).toBe('0.9');
  });
});

describe('T268: ValidationCriterion has method', () => {
  it('ValidationCriterion has method field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const criterion = repo.createValidationCriterion({
      caseId, description: 'test', measurable: true, method: 'statistical',
    }, 'tester');
    expect(criterion.method).toBe('statistical');
  });
});

// ============================================================
// ADDITIONAL TRUSTWORTHINESS TESTS (T281-T300)
// ============================================================

describe('T281: FundamentalRightsConsideration has right', () => {
  it('FundamentalRightsConsideration has right field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const frc = repo.createFundamentalRightsConsideration({
      caseId, right: FundamentalRight.PRIVACY, description: 'test', impacted: true, mitigation: 'test',
    }, 'tester');
    expect(frc.right).toBe(FundamentalRight.PRIVACY);
  });
});

describe('T282: HumanOversightRequirement has triggerConditions', () => {
  it('HumanOversightRequirement has triggerConditions array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const hor = repo.createHumanOversightRequirement({
      caseId, description: 'test', triggerConditions: ['condition1', 'condition2'], escalationPolicy: EscalationDecision.CONTINUE,
    }, 'tester');
    expect(hor.triggerConditions).toContain('condition1');
  });
});

describe('T283: AbstentionEscalationPolicy has criteria', () => {
  it('AbstentionEscalationPolicy has criteria array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const policy = repo.createAbstentionPolicy({
      caseId, name: 'test', criteria: [
        { condition: 'test', decision: EscalationDecision.CONTINUE, rationale: 'test' },
      ],
    }, 'tester');
    expect(policy.criteria.length).toBe(1);
  });
});

describe('T284: DataGovernanceProfile has dataClassification', () => {
  it('DataGovernanceProfile has dataClassification field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const dgp = repo.createDataGovernanceProfile({
      caseId, dataClassification: DataClassification.SYNTHETIC, personalData: false, retentionPeriod: '1 year', accessRestrictions: [],
    }, 'tester');
    expect(dgp.dataClassification).toBe(DataClassification.SYNTHETIC);
  });
});

describe('T285: DataGovernanceProfile has personalData flag', () => {
  it('DataGovernanceProfile has personalData boolean', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const dgp = repo.createDataGovernanceProfile({
      caseId, dataClassification: DataClassification.PUBLIC, personalData: true, retentionPeriod: '1 year', accessRestrictions: [],
    }, 'tester');
    expect(dgp.personalData).toBe(true);
  });
});

describe('T286: SecurityRequirement has severity', () => {
  it('SecurityRequirement has severity field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const sec = repo.createSecurityRequirement({
      caseId, description: 'test', severity: 'critical', mitigations: [],
    }, 'tester');
    expect(sec.severity).toBe('critical');
  });
});

// ============================================================
// ADDITIONAL RESEARCH BOUNDARY TESTS (T301-T310)
// ============================================================

describe('T301: ResearchBoundaryPolicy has allowedDataTypes', () => {
  it('ResearchBoundaryPolicy has allowedDataTypes array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createResearchBoundaryRepository(ids, time);
    const policy = repo.createPolicy({
      caseId, name: 'test', description: '', allowedDataTypes: [AllowedDataType.SYNTHETIC], prohibitedDomains: [], operationalUse: false,
    }, 'tester');
    expect(policy.allowedDataTypes).toContain(AllowedDataType.SYNTHETIC);
  });
});

describe('T302: ResearchBoundaryPolicy has prohibitedDomains', () => {
  it('ResearchBoundaryPolicy has prohibitedDomains array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createResearchBoundaryRepository(ids, time);
    const policy = repo.createPolicy({
      caseId, name: 'test', description: '', allowedDataTypes: [], prohibitedDomains: [ProhibitedDomain.HEALTH_DECISIONS], operationalUse: false,
    }, 'tester');
    expect(policy.prohibitedDomains).toContain(ProhibitedDomain.HEALTH_DECISIONS);
  });
});

describe('T303: ResearchBoundaryPolicy has operationalUse flag', () => {
  it('ResearchBoundaryPolicy has operationalUse boolean', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createResearchBoundaryRepository(ids, time);
    const policy = repo.createPolicy({
      caseId, name: 'test', description: '', allowedDataTypes: [], prohibitedDomains: [], operationalUse: false,
    }, 'tester');
    expect(policy.operationalUse).toBe(false);
  });
});

describe('T304: validateUsage allows valid data type', () => {
  it('validateUsage returns allowed for valid data type', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createResearchBoundaryRepository(ids, time);
    repo.createPolicy({
      caseId, name: 'test', description: '', allowedDataTypes: [AllowedDataType.SYNTHETIC], prohibitedDomains: [], operationalUse: false,
    }, 'tester');
    const result = repo.validateUsage(caseId, AllowedDataType.SYNTHETIC);
    expect(result.allowed).toBe(true);
  });
});

// ============================================================
// ADDITIONAL VALIDATION TESTS (T311-T330)
// ============================================================

describe('T311: MetricDefinition has unit', () => {
  it('MetricDefinition has unit field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'test', description: '', unit: 'percentage', type: 'quantitative', higherIsBetter: true,
    }, 'tester');
    expect(metric.unit).toBe('percentage');
  });
});

describe('T312: MetricDefinition has type', () => {
  it('MetricDefinition has type field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'test', description: '', unit: 'units', type: 'qualitative', higherIsBetter: true,
    }, 'tester');
    expect(metric.type).toBe('qualitative');
  });
});

describe('T313: MetricDefinition has higherIsBetter', () => {
  it('MetricDefinition has higherIsBetter boolean', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'test', description: '', unit: 'units', type: 'quantitative', higherIsBetter: false,
    }, 'tester');
    expect(metric.higherIsBetter).toBe(false);
  });
});

describe('T314: AcceptanceCriterion has description', () => {
  it('AcceptanceCriterion has description field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'test', description: '', unit: 'units', type: 'quantitative', higherIsBetter: true,
    }, 'tester');
    const criterion = repo.createAcceptanceCriterion({
      caseId, metricId: metric.id, operator: '>=', threshold: 0.9, description: 'Must be at least 90%',
    }, 'tester');
    expect(criterion.description).toBe('Must be at least 90%');
  });
});

describe('T315: BenchmarkSpecification has name', () => {
  it('BenchmarkSpecification has name field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const benchmark = repo.createBenchmarkSpecification({
      caseId, name: 'Water Quality Benchmark', description: '', metrics: [], acceptanceCriteria: [],
    }, 'tester');
    expect(benchmark.name).toBe('Water Quality Benchmark');
  });
});

describe('T316: ScientificScenario has preconditions', () => {
  it('ScientificScenario has preconditions array', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const scenario = repo.createScientificScenario({
      caseId, name: 'test', description: '', preconditions: ['precondition1'], expectedBehavior: 'test',
    }, 'tester');
    expect(scenario.preconditions).toContain('precondition1');
  });
});

describe('T317: ScientificScenario has expectedBehavior', () => {
  it('ScientificScenario has expectedBehavior field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const scenario = repo.createScientificScenario({
      caseId, name: 'test', description: '', preconditions: [], expectedBehavior: 'System should respond within 1s',
    }, 'tester');
    expect(scenario.expectedBehavior).toBe('System should respond within 1s');
  });
});

describe('T318: ValidationProtocol has name', () => {
  it('ValidationProtocol has name field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const protocol = repo.createValidationProtocol({
      caseId, name: 'Comprehensive Validation', description: '', benchmarks: [], scenarios: [],
    }, 'tester');
    expect(protocol.name).toBe('Comprehensive Validation');
  });
});

// ============================================================
// ADDITIONAL EXPLANATION TESTS (T331-T350)
// ============================================================

describe('T331: Explanation has timestamp', () => {
  it('Explanation has timestamp field', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const result = explanation.explain(ExplanationQueryType.WHAT_ASSUMPTIONS, undefined, caseId);
    expect(result.timestamp).toBeDefined();
  });
});

describe('T332: Explanation has references', () => {
  it('Explanation has references array', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const result = explanation.explain(ExplanationQueryType.WHAT_ASSUMPTIONS, undefined, caseId);
    expect(Array.isArray(result.references)).toBe(true);
  });
});

describe('T333: WHAT_REQUIREMENTS returns requirements', () => {
  it('WHAT_REQUIREMENTS explanation lists requirements', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    requirements.createRequirement({
      caseId, title: 'Test Req', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: [],
    }, 'tester');
    const result = explanation.explain(ExplanationQueryType.WHAT_REQUIREMENTS, undefined, caseId);
    expect(result.content).toContain('Test Req');
  });
});

describe('T334: WHAT_RISKS returns risks', () => {
  it('WHAT_RISKS explanation lists risks', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    requirements.createRisk({
      caseId, description: 'Test Risk', severity: RiskSeverity.HIGH, likelihood: 'medium', affectedRequirements: [],
    }, 'tester');
    const result = explanation.explain(ExplanationQueryType.WHAT_RISKS, undefined, caseId);
    expect(result.content).toContain('Test Risk');
  });
});

// ============================================================
// ADDITIONAL WORKSPACE TESTS (T351-T370)
// ============================================================

describe('T351: Workspace has caseId', () => {
  it('ScientificCaseWorkspace has caseId field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect(workspace.caseId).toBe(caseId);
  });
});

describe('T352: Package has version', () => {
  it('ScientificCasePackage has version field', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(pkg.version).toBe('2.0.0');
  });
});

describe('T353: Package has exportedAt', () => {
  it('ScientificCasePackage has exportedAt timestamp', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(pkg.exportedAt).toBeDefined();
  });
});

describe('T354: Package data has sources', () => {
  it('ScientificCasePackage data has sources array', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(Array.isArray(pkg.data.sources)).toBe(true);
  });
});

describe('T355: Package data has evidence', () => {
  it('ScientificCasePackage data has evidence array', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(Array.isArray(pkg.data.evidence)).toBe(true);
  });
});

describe('T356: Package data has claims', () => {
  it('ScientificCasePackage data has claims array', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(Array.isArray(pkg.data.claims)).toBe(true);
  });
});

describe('T357: Package data has requirements', () => {
  it('ScientificCasePackage data has requirements array', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(Array.isArray(pkg.data.requirements)).toBe(true);
  });
});

describe('T358: Package data has risks', () => {
  it('ScientificCasePackage data has risks array', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(Array.isArray(pkg.data.risks)).toBe(true);
  });
});
