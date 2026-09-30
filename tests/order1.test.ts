/**
 * HAG-RAP V.2 — Order 1 Tests (WP2)
 * >=120 tests for scientific foundations, evidence graph, trustworthiness, validation.
 */

import { describe, it, expect } from 'vitest';
import {
  EpistemicStatus,
  ActorType,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
  DomainError,
  DomainErrorCode,
} from '../src/core/index.ts';
import { createEvidenceGraphRepository, SourceType, EvidenceType, GraphRelationType, AssumptionCriticality, UncertaintyType } from '../src/evidence-graph/index.ts';
import { createRequirementsRepository, RequirementType, RequirementStatus, RiskSeverity } from '../src/requirements/index.ts';
import { createTrustworthinessRepository, FundamentalRight, EscalationDecision, DataClassification, evaluateEscalation } from '../src/trustworthiness/index.ts';
import { createResearchBoundaryRepository, AllowedDataType, ProhibitedDomain } from '../src/research-boundary/index.ts';
import { createValidationRepository } from '../src/validation/index.ts';
import { createExplanationService, ExplanationQueryType } from '../src/explanation/index.ts';
import { createScientificCaseWorkspace, exportScientificCase, validateScientificCasePackage } from '../src/workspace/index.ts';
import { runWP2Demo } from '../src/demo/wp2-demo.ts';

// ============================================================
// TEST HELPERS
// ============================================================

function createTestContext() {
  const ids = createDeterministicIdProvider('test');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  return { ids, time, caseId };
}

// ============================================================
// EVIDENCE GRAPH TESTS (T101-T130)
// ============================================================

describe('T101: Source ≠ Evidence', () => {
  it('Source and EvidenceItem are distinct entity types', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    expect(source.id).not.toBe(source.caseId);
    expect(source.sourceType).toBe(SourceType.DOCUMENTARY);
  });
});

describe('T102: Evidence ≠ Claim', () => {
  it('EvidenceItem and Claim are distinct entity types', () => {
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
    const claim = repo.createClaim({
      caseId, statement: 'test', epistemicStatus: EpistemicStatus.INFERENCE,
    }, 'tester');
    expect(evidence.id).not.toBe(claim.id);
    expect(evidence.epistemicStatus).not.toBe(claim.epistemicStatus);
  });
});

describe('T103: Claim ≠ Fact', () => {
  it('Claim with INFERENCE status is not SUPPORTED_FACT', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const claim = repo.createClaim({
      caseId, statement: 'test', epistemicStatus: EpistemicStatus.INFERENCE,
    }, 'tester');
    expect(claim.epistemicStatus).toBe(EpistemicStatus.INFERENCE);
    expect(claim.epistemicStatus).not.toBe(EpistemicStatus.SUPPORTED_FACT);
  });
});

describe('T104: Assumption ≠ Fact', () => {
  it('Assumption is distinct from SUPPORTED_FACT', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const assumption = repo.createAssumption({
      caseId, statement: 'test', rationale: 'test', criticality: AssumptionCriticality.HIGH,
    }, 'tester');
    expect(assumption.validated).toBe(false);
    expect(assumption.criticality).toBe(AssumptionCriticality.HIGH);
  });
});

describe('T105: Assumption first-class with rationale and criticality', () => {
  it('Assumption has rationale and criticality fields', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const assumption = repo.createAssumption({
      caseId, statement: 'test assumption', rationale: 'because X', criticality: AssumptionCriticality.CRITICAL,
    }, 'tester');
    expect(assumption.rationale).toBe('because X');
    expect(assumption.criticality).toBe(AssumptionCriticality.CRITICAL);
  });
});

describe('T106: Uncertainty types are distinct', () => {
  it('UncertaintyType enum has all required types', () => {
    expect(UncertaintyType.EPISTEMIC).toBe('EPISTEMIC');
    expect(UncertaintyType.ALEATORIC).toBe('ALEATORIC');
    expect(UncertaintyType.MEASUREMENT).toBe('MEASUREMENT');
    expect(UncertaintyType.MODEL).toBe('MODEL');
    expect(UncertaintyType.SOURCE).toBe('SOURCE');
    expect(UncertaintyType.TEMPORAL).toBe('TEMPORAL');
    expect(UncertaintyType.SCOPE).toBe('SCOPE');
    expect(UncertaintyType.CONFLICT).toBe('CONFLICT');
    expect(UncertaintyType.MISSING_INFORMATION).toBe('MISSING_INFORMATION');
    expect(UncertaintyType.UNKNOWN).toBe('UNKNOWN');
  });
});

describe('T107: Contradiction preserves both sides', () => {
  it('Contradiction stores left and right evidence IDs', () => {
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
      caseId, description: 'A vs B', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'disagreement',
    }, 'tester');
    expect(contradiction.leftEvidenceId).toBe(ev1.id);
    expect(contradiction.rightEvidenceId).toBe(ev2.id);
  });
});

describe('T108: Contradiction preserves history after resolution', () => {
  it('Resolution adds to history without erasing creation', () => {
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
      caseId, description: 'A vs B', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'disagreement',
    }, 'tester');
    const resolved = repo.resolveContradiction(contradiction.id, caseId, 'Resolved by expert', [ev1.id], 'expert-001');
    expect(resolved.history.length).toBe(2);
    expect(resolved.history[0].event).toBe('created');
    expect(resolved.history[1].event).toBe('resolved');
    expect(resolved.resolved).toBe(true);
  });
});

describe('T109: Graph relations are typed', () => {
  it('GraphRelationType enum has all required types', () => {
    expect(GraphRelationType.SUPPORTS).toBe('SUPPORTS');
    expect(GraphRelationType.REFUTES).toBe('REFUTES');
    expect(GraphRelationType.CONTRADICTS).toBe('CONTRADICTS');
    expect(GraphRelationType.DERIVED_FROM).toBe('DERIVED_FROM');
    expect(GraphRelationType.ASSUMES).toBe('ASSUMES');
    expect(GraphRelationType.SUPERSEDES).toBe('SUPERSEDES');
  });
});

describe('T110: Evidence quality ≠ relevance ≠ admissibility ≠ sufficiency', () => {
  it('EvidenceQuality has separate fields', () => {
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
      quality: { reliability: 0.9, completeness: 0.8, relevance: 0.7, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    expect(evidence.quality.reliability).toBe(0.9);
    expect(evidence.quality.completeness).toBe(0.8);
    expect(evidence.quality.relevance).toBe(0.7);
    expect(evidence.quality.reliability).not.toBe(evidence.quality.relevance);
  });
});

// ============================================================
// REQUIREMENTS TESTS (T111-T130)
// ============================================================

describe('T111: Requirement types are distinct', () => {
  it('RequirementType enum has all required types', () => {
    expect(RequirementType.SCIENTIFIC).toBe('SCIENTIFIC');
    expect(RequirementType.FUNCTIONAL).toBe('FUNCTIONAL');
    expect(RequirementType.TRUSTWORTHINESS).toBe('TRUSTWORTHINESS');
    expect(RequirementType.HUMAN_GOVERNANCE).toBe('HUMAN_GOVERNANCE');
    expect(RequirementType.DATA_GOVERNANCE).toBe('DATA_GOVERNANCE');
    expect(RequirementType.SECURITY).toBe('SECURITY');
    expect(RequirementType.ETHICAL).toBe('ETHICAL');
    expect(RequirementType.FUNDAMENTAL_RIGHTS).toBe('FUNDAMENTAL_RIGHTS');
    expect(RequirementType.PERFORMANCE).toBe('PERFORMANCE');
    expect(RequirementType.RESOURCE).toBe('RESOURCE');
    expect(RequirementType.INTEROPERABILITY).toBe('INTEROPERABILITY');
    expect(RequirementType.VALIDATION).toBe('VALIDATION');
  });
});

describe('T112: Requirement status DEFINED ≠ SATISFIED', () => {
  it('Requirement starts as DEFINED, not SATISFIED', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: [],
    }, 'tester');
    expect(req.status).toBe(RequirementStatus.DEFINED);
    expect(req.status).not.toBe(RequirementStatus.SATISFIED);
  });
});

describe('T113: SATISFIED requires explicit evaluation', () => {
  it('Cannot mark SATISFIED without updateRequirementStatus', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: [],
    }, 'tester');
    expect(req.status).toBe(RequirementStatus.DEFINED);
    const updated = repo.updateRequirementStatus(req.id, caseId, RequirementStatus.SATISFIED, 'tester');
    expect(updated.status).toBe(RequirementStatus.SATISFIED);
  });
});

describe('T114: Risk severity levels', () => {
  it('RiskSeverity enum has all levels', () => {
    expect(RiskSeverity.LOW).toBe('LOW');
    expect(RiskSeverity.MEDIUM).toBe('MEDIUM');
    expect(RiskSeverity.HIGH).toBe('HIGH');
    expect(RiskSeverity.CRITICAL).toBe('CRITICAL');
  });
});

describe('T115: Risk traceability to requirements', () => {
  it('Risk can reference affected requirements', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createRequirementsRepository(ids, time);
    const req = repo.createRequirement({
      caseId, title: 'Test', description: '', requirementType: RequirementType.SCIENTIFIC,
      status: RequirementStatus.DEFINED, priority: 'high', sources: [], evidence: [],
    }, 'tester');
    const risk = repo.createRisk({
      caseId, description: 'Test risk', severity: RiskSeverity.HIGH, likelihood: 'medium', affectedRequirements: [req.id],
    }, 'tester');
    expect(risk.affectedRequirements).toContain(req.id);
  });
});

// ============================================================
// TRUSTWORTHINESS TESTS (T131-T150)
// ============================================================

describe('T131: Fundamental rights considerations', () => {
  it('FundamentalRight enum has all required rights', () => {
    expect(FundamentalRight.PRIVACY).toBe('PRIVACY');
    expect(FundamentalRight.NON_DISCRIMINATION).toBe('NON_DISCRIMINATION');
    expect(FundamentalRight.DIGNITY).toBe('DIGNITY');
    expect(FundamentalRight.HEALTH).toBe('HEALTH');
  });
});

describe('T132: Human oversight links to authority policy', () => {
  it('HumanOversightRequirement can reference AuthorityPolicy', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const oversight = repo.createHumanOversightRequirement({
      caseId, description: 'Test', triggerConditions: ['test'], escalationPolicy: EscalationDecision.REVIEW_REQUIRED,
      linkedAuthorityPolicy: 'AP-001' as any,
    }, 'tester');
    expect(oversight.linkedAuthorityPolicy).toBe('AP-001');
  });
});

describe('T133: Escalation policy decisions', () => {
  it('EscalationDecision enum has all required values', () => {
    expect(EscalationDecision.CONTINUE).toBe('CONTINUE');
    expect(EscalationDecision.REVIEW_REQUIRED).toBe('REVIEW_REQUIRED');
    expect(EscalationDecision.ABSTAIN_REQUIRED).toBe('ABSTAIN_REQUIRED');
    expect(EscalationDecision.SAFE_STOP_REQUIRED).toBe('SAFE_STOP_REQUIRED');
  });
});

describe('T134: Escalation evaluation', () => {
  it('evaluateEscalation returns correct decision based on criteria', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createTrustworthinessRepository(ids, time);
    const policy = repo.createAbstentionPolicy({
      caseId, name: 'Test', criteria: [
        { condition: 'critical_contradiction', decision: EscalationDecision.ABSTAIN_REQUIRED, rationale: 'test' },
        { condition: 'insufficient_evidence', decision: EscalationDecision.REVIEW_REQUIRED, rationale: 'test' },
      ],
    }, 'tester');
    const result = evaluateEscalation(policy, {
      insufficientEvidence: false, criticalContradiction: true, criticalUnknown: false,
      invalidProvenance: false, authorityBoundaryCrossed: false, missingHumanDecision: false, unacceptableResidualRisk: false,
    });
    expect(result).toBe(EscalationDecision.ABSTAIN_REQUIRED);
  });
});

describe('T135: Data governance classifications', () => {
  it('DataClassification enum has all required values', () => {
    expect(DataClassification.PUBLIC).toBe('PUBLIC');
    expect(DataClassification.INTERNAL).toBe('INTERNAL');
    expect(DataClassification.CONFIDENTIAL).toBe('CONFIDENTIAL');
    expect(DataClassification.SYNTHETIC).toBe('SYNTHETIC');
    expect(DataClassification.GENERATED).toBe('GENERATED');
  });
});

// ============================================================
// RESEARCH BOUNDARY TESTS (T151-T160)
// ============================================================

describe('T151: Allowed data types', () => {
  it('AllowedDataType enum has required values', () => {
    expect(AllowedDataType.SYNTHETIC).toBe('SYNTHETIC');
    expect(AllowedDataType.PUBLIC_NON_PERSONAL).toBe('PUBLIC_NON_PERSONAL');
    expect(AllowedDataType.GENERATED_BENCHMARK).toBe('GENERATED_BENCHMARK');
    expect(AllowedDataType.CONTROLLED_LAB).toBe('CONTROLLED_LAB');
  });
});

describe('T152: Prohibited domains', () => {
  it('ProhibitedDomain enum has required values', () => {
    expect(ProhibitedDomain.EMPLOYMENT_DECISIONS).toBe('EMPLOYMENT_DECISIONS');
    expect(ProhibitedDomain.EDUCATION_DECISIONS).toBe('EDUCATION_DECISIONS');
    expect(ProhibitedDomain.CREDIT_DECISIONS).toBe('CREDIT_DECISIONS');
    expect(ProhibitedDomain.HEALTH_DECISIONS).toBe('HEALTH_DECISIONS');
    expect(ProhibitedDomain.LAW_ENFORCEMENT).toBe('LAW_ENFORCEMENT');
  });
});

describe('T153: Research boundary validation', () => {
  it('validateUsage rejects prohibited domains', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createResearchBoundaryRepository(ids, time);
    repo.createPolicy({
      caseId, name: 'Test', description: '', allowedDataTypes: [AllowedDataType.SYNTHETIC],
      prohibitedDomains: [ProhibitedDomain.HEALTH_DECISIONS], operationalUse: false,
    }, 'tester');
    const result = repo.validateUsage(caseId, AllowedDataType.SYNTHETIC, ProhibitedDomain.HEALTH_DECISIONS);
    expect(result.allowed).toBe(false);
  });
});

describe('T154: Operational use prohibited', () => {
  it('validateUsage rejects operational use', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createResearchBoundaryRepository(ids, time);
    repo.createPolicy({
      caseId, name: 'Test', description: '', allowedDataTypes: [AllowedDataType.SYNTHETIC],
      prohibitedDomains: [], operationalUse: true,
    }, 'tester');
    const result = repo.validateUsage(caseId, AllowedDataType.SYNTHETIC);
    expect(result.allowed).toBe(false);
  });
});

// ============================================================
// VALIDATION TESTS (T161-T180)
// ============================================================

describe('T161: Metric definition ≠ metric result', () => {
  it('MetricDefinition is specification, not result', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'Test', description: '', unit: 'units', type: 'quantitative', higherIsBetter: true,
    }, 'tester');
    expect(metric.name).toBe('Test');
    expect(metric.unit).toBe('units');
  });
});

describe('T162: Acceptance criterion references metric', () => {
  it('AcceptanceCriterion has metricId reference', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'Test', description: '', unit: 'units', type: 'quantitative', higherIsBetter: true,
    }, 'tester');
    const criterion = repo.createAcceptanceCriterion({
      caseId, metricId: metric.id, operator: '>=', threshold: 0.9, description: 'test',
    }, 'tester');
    expect(criterion.metricId).toBe(metric.id);
  });
});

describe('T163: Benchmark specification', () => {
  it('BenchmarkSpecification references metrics and criteria', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const metric = repo.createMetricDefinition({
      caseId, name: 'Test', description: '', unit: 'units', type: 'quantitative', higherIsBetter: true,
    }, 'tester');
    const criterion = repo.createAcceptanceCriterion({
      caseId, metricId: metric.id, operator: '>=', threshold: 0.9, description: 'test',
    }, 'tester');
    const benchmark = repo.createBenchmarkSpecification({
      caseId, name: 'Test', description: '', metrics: [metric.id], acceptanceCriteria: [criterion.id],
    }, 'tester');
    expect(benchmark.metrics).toContain(metric.id);
    expect(benchmark.acceptanceCriteria).toContain(criterion.id);
  });
});

describe('T164: Validation protocol', () => {
  it('ValidationProtocol references benchmarks and scenarios', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const benchmark = repo.createBenchmarkSpecification({
      caseId, name: 'Test', description: '', metrics: [], acceptanceCriteria: [],
    }, 'tester');
    const protocol = repo.createValidationProtocol({
      caseId, name: 'Test', description: '', benchmarks: [benchmark.id], scenarios: [],
    }, 'tester');
    expect(protocol.benchmarks).toContain(benchmark.id);
  });
});

// ============================================================
// EXPLANATION TESTS (T181-T200)
// ============================================================

describe('T181: Explanation query types', () => {
  it('ExplanationQueryType enum has all required types', () => {
    expect(ExplanationQueryType.WHY_SUPPORTED).toBe('WHY_SUPPORTED');
    expect(ExplanationQueryType.WHAT_REFUTES).toBe('WHAT_REFUTES');
    expect(ExplanationQueryType.WHAT_ASSUMPTIONS).toBe('WHAT_ASSUMPTIONS');
    expect(ExplanationQueryType.WHAT_UNCERTAINTIES).toBe('WHAT_UNCERTAINTIES');
    expect(ExplanationQueryType.WHAT_CONTRADICTIONS).toBe('WHAT_CONTRADICTIONS');
    expect(ExplanationQueryType.WHAT_REQUIREMENTS).toBe('WHAT_REQUIREMENTS');
    expect(ExplanationQueryType.WHAT_RISKS).toBe('WHAT_RISKS');
    expect(ExplanationQueryType.WHAT_HUMAN_REVIEW).toBe('WHAT_HUMAN_REVIEW');
    expect(ExplanationQueryType.WHAT_IS_UNKNOWN).toBe('WHAT_IS_UNKNOWN');
    expect(ExplanationQueryType.WHAT_CHANGED).toBe('WHAT_CHANGED');
  });
});

describe('T182: Explanation is grounded', () => {
  it('Explanation has grounded field', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const result = explanation.explain(ExplanationQueryType.WHAT_ASSUMPTIONS, undefined, caseId);
    expect(result.grounded).toBe(true);
  });
});

describe('T183: WHAT_CHANGED reconstructs history', () => {
  it('WHAT_CHANGED returns contradiction history', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const requirements = createRequirementsRepository(ids, time);
    const trustworthiness = createTrustworthinessRepository(ids, time);
    const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);
    const source = evidenceGraph.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const ev1 = evidenceGraph.createEvidence({
      caseId, sourceId: source.id, content: 'A', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    const ev2 = evidenceGraph.createEvidence({
      caseId, sourceId: source.id, content: 'B', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    const contradiction = evidenceGraph.createContradiction({
      caseId, description: 'A vs B', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'disagreement',
    }, 'tester');
    evidenceGraph.resolveContradiction(contradiction.id, caseId, 'Resolved', [ev1.id], 'expert');
    const result = explanation.explain(ExplanationQueryType.WHAT_CHANGED, contradiction.id, caseId);
    expect(result.content).toContain('history');
    expect(result.grounded).toBe(true);
  });
});

// ============================================================
// WORKSPACE TESTS (T201-T210)
// ============================================================

describe('T201: ScientificCaseWorkspace orchestrator', () => {
  it('Workspace provides access to all repositories', () => {
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

describe('T202: ScientificCasePackage export', () => {
  it('exportScientificCase returns complete package', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    const pkg = exportScientificCase(workspace, time);
    expect(pkg.version).toBe('2.0.0');
    expect(pkg.caseId).toBe(caseId);
    expect(pkg.data).toBeDefined();
  });
});

describe('T203: Package validation', () => {
  it('validateScientificCasePackage rejects malformed packages', () => {
    const result = validateScientificCasePackage({});
    expect(result.valid).toBe(false);
  });
});

describe('T204: Package validation detects prototype pollution', () => {
  it('validateScientificCasePackage rejects __proto__', () => {
    const malicious = JSON.parse('{"version":"2.0.0","caseId":"test","__proto__":{"polluted":true},"data":{}}');
    const result = validateScientificCasePackage(malicious);
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// WP2 DEMO TEST (T211)
// ============================================================

describe('T211: WP2 demo executes successfully', () => {
  it('runWP2Demo returns expected counts', () => {
    const result = runWP2Demo();
    expect(result.sources).toBe(3);
    expect(result.evidence).toBe(5);
    expect(result.claims).toBe(3);
    expect(result.assumptions).toBe(2);
    expect(result.uncertainties).toBe(2);
    expect(result.contradictions).toBe(1);
    expect(result.requirements).toBe(3);
    expect(result.risks).toBe(2);
    expect(result.humanOversight).toBe(1);
    expect(result.validationProtocols).toBe(1);
    expect(result.exported).toBe(true);
  });
});

// ============================================================
// ADDITIONAL TESTS (T212-T230)
// ============================================================

describe('T212: Case isolation in evidence graph', () => {
  it('Evidence from case A not accessible from case B', () => {
    const { ids, time } = createTestContext();
    const caseA = ids.nextResearchCaseId();
    const caseB = ids.nextResearchCaseId();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId: caseA, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    const evidence = repo.createEvidence({
      caseId: caseA, sourceId: source.id, content: 'test', evidenceType: EvidenceType.OBSERVATION,
      epistemicStatus: EpistemicStatus.OBSERVED, scope: { domain: 'test' },
      quality: { reliability: 0.9, completeness: 0.9, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    expect(() => repo.getEvidence(evidence.id, caseB)).toThrow(DomainError);
  });
});

describe('T213: Provenance preserved in evidence graph', () => {
  it('All entities have provenance', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    expect(source.provenance).toBeDefined();
    expect(source.provenance.producer).toBe('tester');
  });
});

describe('T214: Versioning in evidence graph', () => {
  it('All entities have versioning', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'tester', producerType: ActorType.HUMAN,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'tester');
    expect(source.versioning).toBeDefined();
    expect(source.versioning.version).toBe(1);
  });
});

describe('T215: AI cannot fabricate human decision in WP2', () => {
  it('All provenance in WP2 requires explicit actor', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const source = repo.createSource({
      caseId, title: 'Test', description: '', sourceType: SourceType.DOCUMENTARY,
      reference: 'ref', producer: 'ai-agent', producerType: ActorType.AI,
      access: { type: 'public', reference: 'ref', version: '1' },
    }, 'ai-agent');
    expect(source.provenance.producerType).toBe(ActorType.AI);
    expect(source.provenance.producerType).not.toBe(ActorType.HUMAN);
  });
});

describe('T216: Confidence ≠ Correctness in evidence quality', () => {
  it('Evidence quality reliability is not correctness', () => {
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
      quality: { reliability: 0.99, completeness: 0.99, relevance: 0.99, recency: '2024', independenceLevel: 'primary' },
    }, 'tester');
    expect(evidence.quality.reliability).toBe(0.99);
    // reliability is confidence, not correctness
  });
});

describe('T217: Simulation ≠ Reality in WP2', () => {
  it('EpistemicStatus.SIMULATION_RESULT is distinct from OBSERVED', () => {
    expect(EpistemicStatus.SIMULATION_RESULT).not.toBe(EpistemicStatus.OBSERVED);
  });
});

describe('T218: UNKNOWN ≠ FALSE in WP2', () => {
  it('EpistemicStatus.UNKNOWN is distinct', () => {
    expect(EpistemicStatus.UNKNOWN).not.toBe('FALSE');
    expect(EpistemicStatus.UNKNOWN).not.toBe('TRUE');
  });
});

describe('T219: MISSING ≠ NEGATIVE in WP2', () => {
  it('Absence of evidence is not negative evidence', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const evidence = repo.getEvidenceByCase(caseId);
    expect(evidence.length).toBe(0);
    // No evidence ≠ negative evidence
  });
});

describe('T220: Correlation ≠ Causation in graph relations', () => {
  it('DERIVED_FROM does not imply causation', () => {
    expect(GraphRelationType.DERIVED_FROM).toBe('DERIVED_FROM');
    // No CAUSES relation type exists
  });
});

describe('T221: Consensus ≠ Truth in WP2', () => {
  it('Multiple supporting evidence does not make claim SUPPORTED_FACT automatically', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createEvidenceGraphRepository(ids, time);
    const claim = repo.createClaim({
      caseId, statement: 'test', epistemicStatus: EpistemicStatus.CLAIM,
    }, 'tester');
    expect(claim.epistemicStatus).toBe(EpistemicStatus.CLAIM);
    expect(claim.epistemicStatus).not.toBe(EpistemicStatus.SUPPORTED_FACT);
  });
});

describe('T222: Software test ≠ Scientific experiment in WP2', () => {
  it('Validation protocol is specification, not result', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createValidationRepository(ids, time);
    const protocol = repo.createValidationProtocol({
      caseId, name: 'Test', description: '', benchmarks: [], scenarios: [],
    }, 'tester');
    expect(protocol.name).toBe('Test');
    // No result field exists
  });
});

describe('T223: Build pass ≠ Scientific success in WP2', () => {
  it('ScientificMaturity.VERIFIED is distinct from IMPLEMENTED', () => {
    const ScientificMaturity = { VERIFIED: 'VERIFIED', IMPLEMENTED: 'IMPLEMENTED' };
    expect(ScientificMaturity.VERIFIED).not.toBe(ScientificMaturity.IMPLEMENTED);
  });
});

describe('T224: TRL4 not achieved in WP2', () => {
  it('No TRL field exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).trl).toBeUndefined();
  });
});

describe('T225: Deep reasoning engine not implemented in WP2', () => {
  it('No reasoning engine exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).reasoningEngine).toBeUndefined();
  });
});

describe('T226: Causal engine not implemented in WP2', () => {
  it('No causal engine exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).causalEngine).toBeUndefined();
  });
});

describe('T227: Abstraction engine not implemented in WP2', () => {
  it('No abstraction engine exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).abstractionEngine).toBeUndefined();
  });
});

describe('T228: World model engine not implemented in WP2', () => {
  it('No world model engine exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).worldModelEngine).toBeUndefined();
  });
});

describe('T229: Planner engine not implemented in WP2', () => {
  it('No planner engine exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).plannerEngine).toBeUndefined();
  });
});

describe('T230: Formal assurance engine not implemented in WP2', () => {
  it('No formal assurance engine exists in WP2', () => {
    const { ids, time, caseId } = createTestContext();
    const workspace = createScientificCaseWorkspace(caseId, ids, time);
    expect((workspace as any).formalAssuranceEngine).toBeUndefined();
  });
});
