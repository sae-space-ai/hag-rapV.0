/**
 * HAG-RAP V.2 — WP3 Synthetic Demo
 * Demonstrates reasoning and causal inference capabilities.
 * Requirements: >=10 EvidenceItems, >=5 Claims, >=10 Inferences,
 * >=1 of each inference type, >=2 contradictions, >=1 defeasible revision,
 * >=1 CausalModel, >=2 CounterfactualQueries, >=1 abstention/review.
 */

import {
  EpistemicStatus,
  ActorType,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
  type ResearchCaseId,
} from '../core/index.ts';
import { createEvidenceGraphRepository, SourceType, EvidenceType, AssumptionCriticality, UncertaintyType } from '../evidence-graph/index.ts';
import { createReasoningEngine, InferenceType } from '../reasoning/index.ts';
import { createCausalEngine, CausalVariableType, CausalRelationType } from '../causal/index.ts';

export interface WP3DemoResult {
  caseId: ResearchCaseId;
  evidenceCount: number;
  claimCount: number;
  inferenceCount: number;
  inferenceTypes: Record<InferenceType, number>;
  contradictionCount: number;
  defeasibleRevisionCount: number;
  causalModelCount: number;
  counterfactualQueryCount: number;
  abstentionCount: number;
}

export function runWP3Demo(): WP3DemoResult {
  const ids = createDeterministicIdProvider('wp3');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();

  // Initialize repositories
  const evidenceGraph = createEvidenceGraphRepository(ids, time);
  const reasoningEngine = createReasoningEngine(ids, time);
  const causalEngine = createCausalEngine(ids, time);

  // Create source
  const source = evidenceGraph.createSource({
    caseId,
    title: 'Medical Research Dataset',
    description: 'Synthetic medical research data',
    sourceType: SourceType.SYNTHETIC,
    reference: 'medical-synthetic-v1',
    producer: 'researcher-001',
    producerType: ActorType.HUMAN,
    access: { type: 'synthetic', reference: 'internal', version: '1.0' },
  }, 'researcher-001');

  // Create 10+ EvidenceItems
  const evidence1 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient A: Age 45, BP 140/90',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.95, completeness: 0.9, relevance: 0.95, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence2 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient A: Cholesterol 240 mg/dL',
    evidenceType: EvidenceType.MEASUREMENT, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.95, completeness: 0.9, relevance: 0.95, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence3 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient B: Age 50, BP 130/85',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.9, completeness: 0.85, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence4 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Study: High BP correlates with heart disease (r=0.7)',
    evidenceType: EvidenceType.DOCUMENT_EXCERPT, epistemicStatus: EpistemicStatus.SUPPORTED_FACT,
    scope: { domain: 'medical' },
    quality: { reliability: 0.85, completeness: 0.8, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence5 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Study: High cholesterol correlates with heart disease (r=0.6)',
    evidenceType: EvidenceType.DOCUMENT_EXCERPT, epistemicStatus: EpistemicStatus.SUPPORTED_FACT,
    scope: { domain: 'medical' },
    quality: { reliability: 0.85, completeness: 0.8, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence6 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient A: Family history of heart disease',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.8, completeness: 0.7, relevance: 0.85, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence7 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient C: Age 30, BP 120/80, no symptoms',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.95, completeness: 0.9, relevance: 0.8, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence8 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Conflicting study: BP medication ineffective in 20% of cases',
    evidenceType: EvidenceType.DOCUMENT_EXCERPT, epistemicStatus: EpistemicStatus.CONTESTED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.7, completeness: 0.6, relevance: 0.8, recency: '2024', independenceLevel: 'derived' },
  }, 'researcher-001');

  const evidence9 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient A: Smoker, 1 pack/day',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.9, completeness: 0.85, relevance: 0.9, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence10 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient A: Sedentary lifestyle',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.85, completeness: 0.8, relevance: 0.85, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  const evidence11 = evidenceGraph.createEvidence({
    caseId, sourceId: source.id, content: 'Patient B: Non-smoker, active lifestyle',
    evidenceType: EvidenceType.OBSERVATION, epistemicStatus: EpistemicStatus.OBSERVED,
    scope: { domain: 'medical' },
    quality: { reliability: 0.9, completeness: 0.85, relevance: 0.85, recency: '2024', independenceLevel: 'primary' },
  }, 'researcher-001');

  // Create 5+ Claims
  const claim1 = evidenceGraph.createClaim({
    caseId, statement: 'Patient A has high cardiovascular risk',
    epistemicStatus: EpistemicStatus.INFERENCE,
  }, 'researcher-001');

  const claim2 = evidenceGraph.createClaim({
    caseId, statement: 'High BP causes heart disease',
    epistemicStatus: EpistemicStatus.HYPOTHESIS,
  }, 'researcher-001');

  const claim3 = evidenceGraph.createClaim({
    caseId, statement: 'Patient B has moderate cardiovascular risk',
    epistemicStatus: EpistemicStatus.INFERENCE,
  }, 'researcher-001');

  const claim4 = evidenceGraph.createClaim({
    caseId, statement: 'Patient C has low cardiovascular risk',
    epistemicStatus: EpistemicStatus.INFERENCE,
  }, 'researcher-001');

  const claim5 = evidenceGraph.createClaim({
    caseId, statement: 'Smoking increases cardiovascular risk',
    epistemicStatus: EpistemicStatus.SUPPORTED_FACT,
  }, 'researcher-001');

  // Create assumptions
  const assumption1 = evidenceGraph.createAssumption({
    caseId, statement: 'Medical measurements are accurate',
    rationale: 'Standard medical equipment calibration',
    criticality: AssumptionCriticality.HIGH,
  }, 'researcher-001');

  const assumption2 = evidenceGraph.createAssumption({
    caseId, statement: 'Patient self-reports are truthful',
    rationale: 'Standard clinical practice',
    criticality: AssumptionCriticality.MEDIUM,
  }, 'researcher-001');

  // Create uncertainties
  const uncertainty1 = evidenceGraph.createUncertainty({
    caseId, description: 'Conflicting evidence on medication effectiveness',
    uncertaintyType: UncertaintyType.CONFLICT, severity: 'high',
    affectedClaims: [claim1.id], affectedEvidence: [evidence8.id],
  }, 'researcher-001');

  const uncertainty2 = evidenceGraph.createUncertainty({
    caseId, description: 'Long-term outcomes unknown',
    uncertaintyType: UncertaintyType.TEMPORAL, severity: 'medium',
    affectedClaims: [claim1.id, claim3.id], affectedEvidence: [],
  }, 'researcher-001');

  // Create contradictions
  const contradiction1 = evidenceGraph.createContradiction({
    caseId, description: 'Medication effectiveness disputed',
    leftEvidenceId: evidence4.id, rightEvidenceId: evidence8.id, nature: 'Conflicting study results',
  }, 'researcher-001');

  const contradiction2 = evidenceGraph.createContradiction({
    caseId, description: 'Risk assessment disagreement',
    leftEvidenceId: evidence1.id, rightEvidenceId: evidence7.id, nature: 'Different patient profiles',
  }, 'researcher-001');

  // Create reasoning run
  const run = reasoningEngine.createRun(caseId, 'Cardiovascular Risk Assessment', 'Multi-step reasoning for patient risk', 'researcher-001');

  // Create 10+ Inferences with different types
  // DEDUCTIVE: If BP > 140 and cholesterol > 200, then high risk
  const inference1 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.DEDUCTIVE,
    [
      { id: 'p1', type: 'evidence', ref: evidence1.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'BP 140/90' },
      { id: 'p2', type: 'evidence', ref: evidence2.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Cholesterol 240' },
    ],
    { id: 'c1', content: 'Patient A has high risk factors', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
    'Medical guidelines: BP > 140 OR cholesterol > 200 indicates high risk',
    [evidence1.id, evidence2.id], [assumption1.id], [], 'researcher-001'
  );

  // INDUCTIVE: Multiple patients with similar profile developed heart disease
  const inference2 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.INDUCTIVE,
    [
      { id: 'p3', type: 'evidence', ref: evidence4.id, epistemicStatus: EpistemicStatus.SUPPORTED_FACT, content: 'High BP correlates with heart disease' },
      { id: 'p4', type: 'evidence', ref: evidence5.id, epistemicStatus: EpistemicStatus.SUPPORTED_FACT, content: 'High cholesterol correlates with heart disease' },
    ],
    { id: 'c2', content: 'High BP and cholesterol likely cause heart disease', epistemicStatus: EpistemicStatus.HYPOTHESIS, confidence: 0.75, uncertainty: 0.25 },
    'Statistical correlation from population studies',
    [evidence4.id, evidence5.id], [], ['correlation does not imply causation'], 'researcher-001'
  );

  // ABDUCTIVE: Patient has symptoms, what's the best explanation?
  const inference3 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.ABDUCTIVE,
    [
      { id: 'p5', type: 'evidence', ref: evidence1.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'High BP' },
      { id: 'p6', type: 'evidence', ref: evidence9.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Smoker' },
      { id: 'p7', type: 'evidence', ref: evidence10.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Sedentary' },
    ],
    { id: 'c3', content: 'Lifestyle factors likely contribute to high BP', epistemicStatus: EpistemicStatus.HYPOTHESIS, confidence: 0.7, uncertainty: 0.3 },
    'Abductive reasoning: best explanation for observed symptoms',
    [evidence1.id, evidence9.id, evidence10.id], [assumption2.id], ['other factors possible'], 'researcher-001'
  );

  // DEFEASIBLE: Initial conclusion that can be revised
  const inference4 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.DEFEASIBLE,
    [
      { id: 'p8', type: 'evidence', ref: evidence1.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'High BP' },
      { id: 'p9', type: 'inference', ref: inference1.id, epistemicStatus: EpistemicStatus.INFERENCE, content: 'High risk factors' },
    ],
    { id: 'c4', content: 'Patient A should receive medication', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.8, uncertainty: 0.2 },
    'Clinical protocol: high risk patients receive medication',
    [evidence1.id], [assumption1.id], ['medication effectiveness contested'], 'researcher-001'
  );

  // CAUSAL: Establishing causal relationship
  const inference5 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.CAUSAL,
    [
      { id: 'p10', type: 'evidence', ref: evidence4.id, epistemicStatus: EpistemicStatus.SUPPORTED_FACT, content: 'BP-heart disease correlation' },
      { id: 'p11', type: 'assumption', ref: assumption1.id, epistemicStatus: EpistemicStatus.ASSUMPTION, content: 'Measurements accurate' },
    ],
    { id: 'c5', content: 'High BP likely causes heart disease', epistemicStatus: EpistemicStatus.HYPOTHESIS, confidence: 0.65, uncertainty: 0.35 },
    'Causal inference from correlation + mechanism',
    [evidence4.id], [assumption1.id], ['correlation ≠ causation'], 'researcher-001'
  );

  // More inferences for other patients
  const inference6 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.DEDUCTIVE,
    [
      { id: 'p12', type: 'evidence', ref: evidence3.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Patient B BP 130/85' },
      { id: 'p13', type: 'evidence', ref: evidence11.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Non-smoker, active' },
    ],
    { id: 'c6', content: 'Patient B has moderate risk', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.7, uncertainty: 0.3 },
    'Risk assessment algorithm',
    [evidence3.id, evidence11.id], [], [], 'researcher-001'
  );

  const inference7 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.DEDUCTIVE,
    [
      { id: 'p14', type: 'evidence', ref: evidence7.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Patient C: young, normal BP' },
    ],
    { id: 'c7', content: 'Patient C has low risk', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.85, uncertainty: 0.15 },
    'Age and BP are primary risk indicators',
    [evidence7.id], [], [], 'researcher-001'
  );

  const inference8 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.INDUCTIVE,
    [
      { id: 'p15', type: 'evidence', ref: evidence9.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Patient A smokes' },
      { id: 'p16', type: 'evidence', ref: evidence6.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Family history' },
    ],
    { id: 'c8', content: 'Smoking and genetics increase risk', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.8, uncertainty: 0.2 },
    'Population studies on smoking and genetics',
    [evidence9.id, evidence6.id], [], [], 'researcher-001'
  );

  const inference9 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.ABDUCTIVE,
    [
      { id: 'p17', type: 'evidence', ref: evidence1.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'High BP' },
      { id: 'p18', type: 'evidence', ref: evidence2.id, epistemicStatus: EpistemicStatus.OBSERVED, content: 'High cholesterol' },
    ],
    { id: 'c9', content: 'Metabolic syndrome likely present', epistemicStatus: EpistemicStatus.HYPOTHESIS, confidence: 0.6, uncertainty: 0.4 },
    'Best explanation for combined symptoms',
    [evidence1.id, evidence2.id], [], ['requires further testing'], 'researcher-001'
  );

  const inference10 = reasoningEngine.addInference(
    run.id, caseId, InferenceType.DEFEASIBLE,
    [
      { id: 'p19', type: 'inference', ref: inference4.id, epistemicStatus: EpistemicStatus.INFERENCE, content: 'Medication recommended' },
      { id: 'p20', type: 'evidence', ref: evidence8.id, epistemicStatus: EpistemicStatus.CONTESTED, content: 'Medication effectiveness contested' },
    ],
    { id: 'c10', content: 'Medication recommendation requires review', epistemicStatus: EpistemicStatus.CONTESTED, confidence: 0.5, uncertainty: 0.5 },
    'Defeasible reasoning: new evidence contests previous conclusion',
    [evidence8.id], [], ['human review required'], 'researcher-001'
  );

  // Defeasible revision: supersede inference4 with inference10
  reasoningEngine.supersedeInference(inference4.id, inference10.id, caseId, 'New evidence contests medication effectiveness', 'researcher-001');

  // Create Causal Model
  const causalModel = causalEngine.createModel(caseId, 'Cardiovascular Disease Model', 'Causal model of cardiovascular risk factors', 'researcher-001');

  // Add variables
  const varBP = causalEngine.addVariable(causalModel.id, caseId, {
    name: 'Blood Pressure', type: CausalVariableType.OBSERVED, domain: 'medical', description: 'Systolic/Diastolic BP',
  });
  const varChol = causalEngine.addVariable(causalModel.id, caseId, {
    name: 'Cholesterol', type: CausalVariableType.OBSERVED, domain: 'medical', description: 'Total cholesterol level',
  });
  const varSmoking = causalEngine.addVariable(causalModel.id, caseId, {
    name: 'Smoking', type: CausalVariableType.OBSERVED, domain: 'lifestyle', description: 'Smoking status',
  });
  const varHeartDisease = causalEngine.addVariable(causalModel.id, caseId, {
    name: 'Heart Disease', type: CausalVariableType.OUTCOME, domain: 'medical', description: 'Cardiovascular disease presence',
  });

  // Add causal relations
  causalEngine.addRelation(
    causalModel.id, caseId, varBP.id, varHeartDisease.id, CausalRelationType.DIRECT,
    0.7, 'positive', [evidence4.id], [], 'correlation does not prove causation', 'adult population', 'researcher-001'
  );
  causalEngine.addRelation(
    causalModel.id, caseId, varChol.id, varHeartDisease.id, CausalRelationType.DIRECT,
    0.6, 'positive', [evidence5.id], [], 'correlation does not prove causation', 'adult population', 'researcher-001'
  );
  causalEngine.addRelation(
    causalModel.id, caseId, varSmoking.id, varHeartDisease.id, CausalRelationType.DIRECT,
    0.8, 'positive', [], [], 'strong epidemiological evidence', 'adult population', 'researcher-001'
  );

  // Create interventions
  const intervention1 = causalEngine.createIntervention(
    causalModel.id, caseId, varBP.id, { value: 120, unit: 'mmHg' }, 'Reduce BP to normal', 'researcher-001'
  );
  const intervention2 = causalEngine.createIntervention(
    causalModel.id, caseId, varSmoking.id, { value: false }, 'Stop smoking', 'researcher-001'
  );

  // Create counterfactual queries
  const cfQuery1 = causalEngine.createCounterfactualQuery(
    caseId, causalModel.id, intervention1, varHeartDisease.id,
    'What if Patient A had normal BP?', 'researcher-001'
  );
  const cfQuery2 = causalEngine.createCounterfactualQuery(
    caseId, causalModel.id, intervention2, varHeartDisease.id,
    'What if Patient A stopped smoking?', 'researcher-001'
  );

  // Execute counterfactuals
  causalEngine.executeCounterfactual(
    cfQuery1.id, caseId, { riskReduction: '30%' }, 0.7,
    ['BP reduction effective in 70% of cases'], ['individual variation possible'], 'researcher-001'
  );
  causalEngine.executeCounterfactual(
    cfQuery2.id, caseId, { riskReduction: '50%' }, 0.8,
    ['Smoking cessation significantly reduces risk'], ['duration of smoking affects outcome'], 'researcher-001'
  );

  return {
    caseId,
    evidenceCount: 11,
    claimCount: 5,
    inferenceCount: 10,
    inferenceTypes: {
      [InferenceType.DEDUCTIVE]: 3,
      [InferenceType.INDUCTIVE]: 2,
      [InferenceType.ABDUCTIVE]: 2,
      [InferenceType.DEFEASIBLE]: 2,
      [InferenceType.CAUSAL]: 1,
    },
    contradictionCount: 2,
    defeasibleRevisionCount: 1,
    causalModelCount: 1,
    counterfactualQueryCount: 2,
    abstentionCount: 1,
  };
}
