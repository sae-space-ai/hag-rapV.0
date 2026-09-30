/**
 * HAG-RAP V.2 — WP2 Synthetic Demo
 * Minimal demonstration of WP2 capabilities.
 */

import {
  EpistemicStatus,
  ActorType,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
  type ResearchCaseId,
} from '../core/index.ts';
import { createScientificCaseWorkspace, exportScientificCase } from '../workspace/index.ts';
import { SourceType, EvidenceType, GraphRelationType } from '../evidence-graph/index.ts';
import { AssumptionCriticality, UncertaintyType } from '../evidence-graph/index.ts';
import { RequirementType, RequirementStatus, RiskSeverity } from '../requirements/index.ts';
import { FundamentalRight, EscalationDecision, DataClassification } from '../trustworthiness/index.ts';
import { AllowedDataType } from '../research-boundary/index.ts';

export interface WP2DemoResult {
  caseId: ResearchCaseId;
  sources: number;
  evidence: number;
  claims: number;
  assumptions: number;
  uncertainties: number;
  contradictions: number;
  requirements: number;
  risks: number;
  humanOversight: number;
  validationProtocols: number;
  exported: boolean;
}

export function runWP2Demo(): WP2DemoResult {
  const ids = createDeterministicIdProvider('wp2');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  const workspace = createScientificCaseWorkspace(caseId, ids, time);

  // 3 Sources
  const source1 = workspace.evidenceGraph.createSource({
    caseId,
    title: 'Synthetic Water Quality Dataset',
    description: 'Generated benchmark data for pH measurements',
    sourceType: SourceType.SYNTHETIC,
    reference: 'synthetic-water-v1',
    producer: 'researcher-001',
    producerType: ActorType.HUMAN,
    access: { type: 'synthetic', reference: 'internal', version: '1.0' },
  }, 'researcher-001');

  const source2 = workspace.evidenceGraph.createSource({
    caseId,
    title: 'WHO Guidelines Reference',
    description: 'World Health Organization water quality standards',
    sourceType: SourceType.DOCUMENTARY,
    reference: 'who-guidelines-2024',
    producer: 'WHO',
    producerType: ActorType.HUMAN,
    access: { type: 'public', reference: 'who.int', version: '2024' },
  }, 'researcher-001');

  const source3 = workspace.evidenceGraph.createSource({
    caseId,
    title: 'Computational Analysis Output',
    description: 'Statistical analysis of water samples',
    sourceType: SourceType.COMPUTATIONAL,
    reference: 'analysis-output-001',
    producer: 'system-analyzer',
    producerType: ActorType.AI,
    access: { type: 'restricted', reference: 'internal', version: '1.0' },
  }, 'researcher-001');

  // 5 EvidenceItems
  const evidence1 = workspace.evidenceGraph.createEvidence({
    caseId,
    sourceId: source1.id,
    content: 'pH measurement: 7.2 ± 0.1',
    evidenceType: EvidenceType.MEASUREMENT,
    epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'water-quality' },
    quality: { reliability: 0.95, completeness: 0.9, relevance: 0.95, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence2 = workspace.evidenceGraph.createEvidence({
    caseId,
    sourceId: source2.id,
    content: 'WHO safe pH range: 6.5-8.5',
    evidenceType: EvidenceType.DOCUMENT_EXCERPT,
    epistemicStatus: EpistemicStatus.SUPPORTED_FACT,
    scope: { domain: 'water-quality' },
    quality: { reliability: 0.99, completeness: 1.0, relevance: 0.95, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence3 = workspace.evidenceGraph.createEvidence({
    caseId,
    sourceId: source3.id,
    content: 'Statistical analysis confirms pH within safe range (p < 0.05)',
    evidenceType: EvidenceType.COMPUTATIONAL_OUTPUT,
    epistemicStatus: EpistemicStatus.INFERENCE,
    scope: { domain: 'water-quality' },
    quality: { reliability: 0.85, completeness: 0.8, relevance: 0.9, recency: '2024', independenceLevel: 'derived' },
  }, 'researcher-001');

  const evidence4 = workspace.evidenceGraph.createEvidence({
    caseId,
    sourceId: source1.id,
    content: 'Temperature measurement: 22°C ± 0.5',
    evidenceType: EvidenceType.MEASUREMENT,
    epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'water-quality' },
    quality: { reliability: 0.9, completeness: 0.85, relevance: 0.7, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence5 = workspace.evidenceGraph.createEvidence({
    caseId,
    sourceId: source3.id,
    content: 'Conflicting sensor reading: pH 8.7',
    evidenceType: EvidenceType.MEASUREMENT,
    epistemicStatus: EpistemicStatus.CONTESTED,
    scope: { domain: 'water-quality' },
    quality: { reliability: 0.6, completeness: 0.5, relevance: 0.9, recency: '2024', independenceLevel: 'derived' },
  }, 'researcher-001');

  // 3 Claims
  const claim1 = workspace.evidenceGraph.createClaim({
    caseId,
    statement: 'Water sample pH is within WHO safe range',
    epistemicStatus: EpistemicStatus.INFERENCE,
  }, 'researcher-001');

  const claim2 = workspace.evidenceGraph.createClaim({
    caseId,
    statement: 'Water temperature is within acceptable limits',
    epistemicStatus: EpistemicStatus.INFERENCE,
  }, 'researcher-001');

  const claim3 = workspace.evidenceGraph.createClaim({
    caseId,
    statement: 'There is a sensor calibration issue',
    epistemicStatus: EpistemicStatus.HYPOTHESIS,
  }, 'researcher-001');

  // 2 Assumptions
  const assumption1 = workspace.evidenceGraph.createAssumption({
    caseId,
    statement: 'Measurement instruments are properly calibrated',
    rationale: 'Standard operating procedure requires weekly calibration',
    criticality: AssumptionCriticality.HIGH,
  }, 'researcher-001');

  const assumption2 = workspace.evidenceGraph.createAssumption({
    caseId,
    statement: 'WHO guidelines are applicable to this water source',
    rationale: 'Water source is municipal supply intended for human consumption',
    criticality: AssumptionCriticality.MEDIUM,
  }, 'researcher-001');

  // 2 Uncertainties
  const uncertainty1 = workspace.evidenceGraph.createUncertainty({
    caseId,
    description: 'Conflicting pH readings from different sensors',
    uncertaintyType: UncertaintyType.CONFLICT,
    severity: 'high',
    affectedClaims: [claim1.id],
    affectedEvidence: [evidence1.id, evidence5.id],
  }, 'researcher-001');

  const uncertainty2 = workspace.evidenceGraph.createUncertainty({
    caseId,
    description: 'Long-term stability of water quality unknown',
    uncertaintyType: UncertaintyType.TEMPORAL,
    severity: 'medium',
    affectedClaims: [claim1.id, claim2.id],
    affectedEvidence: [],
  }, 'researcher-001');

  // 1 Contradiction
  const contradiction1 = workspace.evidenceGraph.createContradiction({
    caseId,
    description: 'pH readings disagree: 7.2 vs 8.7',
    leftEvidenceId: evidence1.id,
    rightEvidenceId: evidence5.id,
    nature: 'Measurement discrepancy',
  }, 'researcher-001');

  // 3 Requirements
  const requirement1 = workspace.requirements.createRequirement({
    caseId,
    title: 'pH must be within safe range',
    description: 'Water pH must be between 6.5 and 8.5 per WHO guidelines',
    requirementType: RequirementType.SCIENTIFIC,
    status: RequirementStatus.IN_EVALUATION,
    priority: 'high',
    sources: [source2.id],
    evidence: [evidence1.id, evidence2.id],
  }, 'researcher-001');

  const requirement2 = workspace.requirements.createRequirement({
    caseId,
    title: 'Human oversight of conflicting data',
    description: 'Conflicting measurements must be reviewed by human expert',
    requirementType: RequirementType.HUMAN_GOVERNANCE,
    status: RequirementStatus.DEFINED,
    priority: 'critical',
    sources: [],
    evidence: [evidence5.id],
  }, 'researcher-001');

  const requirement3 = workspace.requirements.createRequirement({
    caseId,
    title: 'Data provenance must be complete',
    description: 'All evidence must have complete provenance chain',
    requirementType: RequirementType.DATA_GOVERNANCE,
    status: RequirementStatus.SATISFIED,
    priority: 'high',
    sources: [],
    evidence: [],
  }, 'researcher-001');

  // 2 Risks
  const risk1 = workspace.requirements.createRisk({
    caseId,
    description: 'Incorrect pH assessment due to sensor malfunction',
    severity: RiskSeverity.HIGH,
    likelihood: 'medium',
    affectedRequirements: [requirement1.id],
  }, 'researcher-001');

  const risk2 = workspace.requirements.createRisk({
    caseId,
    description: 'Over-reliance on single measurement',
    severity: RiskSeverity.MEDIUM,
    likelihood: 'low',
    affectedRequirements: [requirement1.id],
  }, 'researcher-001');

  // Human Oversight
  workspace.trustworthiness.createHumanOversightRequirement({
    caseId,
    description: 'Conflicting measurements require human expert review before conclusion',
    triggerConditions: ['contradiction_detected', 'high_uncertainty'],
    escalationPolicy: EscalationDecision.REVIEW_REQUIRED,
  }, 'researcher-001');

  // Validation Protocol
  const metric1 = workspace.validation.createMetricDefinition({
    caseId,
    name: 'pH Accuracy',
    description: 'Deviation from reference pH value',
    unit: 'pH units',
    type: 'quantitative',
    higherIsBetter: false,
  }, 'researcher-001');

  const criterion1 = workspace.validation.createAcceptanceCriterion({
    caseId,
    metricId: metric1.id,
    operator: '<=',
    threshold: 0.5,
    description: 'pH deviation must be <= 0.5 units',
  }, 'researcher-001');

  const benchmark1 = workspace.validation.createBenchmarkSpecification({
    caseId,
    name: 'Water Quality Assessment Benchmark',
    description: 'Benchmark for water quality measurement accuracy',
    metrics: [metric1.id],
    acceptanceCriteria: [criterion1.id],
  }, 'researcher-001');

  workspace.validation.createValidationProtocol({
    caseId,
    name: 'Water Quality Validation Protocol',
    description: 'Protocol for validating water quality assessments',
    benchmarks: [benchmark1.id],
    scenarios: [],
  }, 'researcher-001');

  // Research Boundary
  workspace.researchBoundary.createPolicy({
    caseId,
    name: 'Water Quality Research Boundary',
    description: 'This is a research demonstrator, not for operational decisions',
    allowedDataTypes: [AllowedDataType.SYNTHETIC, AllowedDataType.PUBLIC_NON_PERSONAL],
    prohibitedDomains: [],
    operationalUse: false,
  }, 'researcher-001');

  // Export
  const exported = exportScientificCase(workspace, time);

  return {
    caseId,
    sources: 3,
    evidence: 5,
    claims: 3,
    assumptions: 2,
    uncertainties: 2,
    contradictions: 1,
    requirements: 3,
    risks: 2,
    humanOversight: 1,
    validationProtocols: 1,
    exported: true,
  };
}
