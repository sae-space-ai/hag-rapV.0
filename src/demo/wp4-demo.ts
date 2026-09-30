/**
 * HAG-RAP V.2 — WP4 Synthetic Demo
 * Demonstrates concept model, abstraction, analogy/transfer, and world model.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ConceptId,
  ClaimId,
  CausalModelId,
  AbstractionId,
  WorldModelId,
  WorldStateId,
  EpistemicStatus,
  ExecutionMode,
  ActorType,
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  type IdProvider,
  type TimeProvider,
} from '../core/index.ts';
import { createConceptModelRepository, ConceptValidationStatus, ConceptRelationType } from '../concept-model/index.ts';
import { createAbstractionEngineRepository, AbstractionLevel, AbstractionRelationType } from '../abstraction-engine/index.ts';
import { createAnalogyTransferEngineRepository, TransferValidity } from '../analogy-transfer/index.ts';
import { createWorldModelEngineRepository, OODStatus } from '../world-model/index.ts';

export interface WP4DemoResult {
  caseId: ResearchCaseId;
  conceptCandidates: number;
  concepts: number;
  abstractions: number;
  lattices: number;
  counterexamples: number;
  analogies: number;
  transferAccepted: number;
  transferRejected: number;
  worldModels: number;
  worldStates: number;
  transitions: number;
  modelDisagreements: number;
  oodAssessments: number;
}

export function runWP4Demo(): WP4DemoResult {
  const ids = createSequentialIdProvider();
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();

  const conceptRepo = createConceptModelRepository(ids, time);
  const abstractionRepo = createAbstractionEngineRepository(ids, time);
  const analogyRepo = createAnalogyTransferEngineRepository(ids, time);
  const worldModelRepo = createWorldModelEngineRepository(ids, time);

  // === CONCEPT MODEL ===

  // Create 6 concept candidates
  const cand1 = conceptRepo.createCandidate(
    caseId,
    'Cardiovascular Risk Factor',
    'A measurable indicator that increases probability of cardiovascular disease',
    ['ev-1', 'ev-2', 'ev-3'] as EvidenceId[],
    ['cx-1'],
    'Adult population with medical records',
    'Moderate uncertainty in elderly populations',
    'researcher-001'
  );

  const cand2 = conceptRepo.createCandidate(
    caseId,
    'Metabolic Syndrome',
    'Cluster of conditions occurring together increasing risk of heart disease',
    ['ev-4', 'ev-5'] as EvidenceId[],
    [],
    'Adults over 40',
    'Low uncertainty in defined population',
    'researcher-001'
  );

  const cand3 = conceptRepo.createCandidate(
    caseId,
    'Lifestyle Intervention',
    'Behavioral changes aimed at improving health outcomes',
    ['ev-6', 'ev-7'] as EvidenceId[],
    ['cx-2', 'cx-3'],
    'General adult population',
    'High variability in adherence',
    'researcher-001'
  );

  const cand4 = conceptRepo.createCandidate(
    caseId,
    'Pharmacological Treatment',
    'Medication-based intervention for disease management',
    ['ev-8', 'ev-9'] as EvidenceId[],
    ['cx-4'],
    'Patients with diagnosed conditions',
    'Side effects vary by individual',
    'researcher-001'
  );

  const cand5 = conceptRepo.createCandidate(
    caseId,
    'Preventive Screening',
    'Regular health checks to detect early signs of disease',
    ['ev-10'] as EvidenceId[],
    [],
    'Asymptomatic adults',
    'Cost-effectiveness varies by age',
    'researcher-001'
  );

  const cand6 = conceptRepo.createCandidate(
    caseId,
    'Genetic Predisposition',
    'Inherited factors increasing disease susceptibility',
    ['ev-11', 'ev-12'] as EvidenceId[],
    ['cx-5'],
    'Population with family history',
    'Gene-environment interactions complex',
    'researcher-001'
  );

  // Validate 3 concepts
  const concept1 = conceptRepo.validateConcept(cand1.id, caseId, 'expert-001');
  const concept2 = conceptRepo.validateConcept(cand2.id, caseId, 'expert-001');
  const concept3 = conceptRepo.validateConcept(cand3.id, caseId, 'expert-001');

  // Add counterexamples
  conceptRepo.addCounterexample(concept1.id, caseId, 'Young athletes with high BP but no risk', 'ev-cx1' as EvidenceId, 'minor', 'researcher-001');
  conceptRepo.addCounterexample(concept2.id, caseId, 'Normal weight individuals with metabolic markers', 'ev-cx2' as EvidenceId, 'major', 'researcher-001');
  conceptRepo.addCounterexample(concept3.id, caseId, 'Lifestyle changes ineffective without medication', 'ev-cx3' as EvidenceId, 'critical', 'researcher-001');

  // Add concept relations
  conceptRepo.addConceptRelation(concept1.id, concept2.id, caseId, ConceptRelationType.RELATED_TO, 0.8, 'researcher-001');
  conceptRepo.addConceptRelation(concept2.id, concept3.id, caseId, ConceptRelationType.RELATED_TO, 0.6, 'researcher-001');

  // === ABSTRACTION ENGINE ===

  // Create 3 abstractions at different levels
  const abs1 = abstractionRepo.createAbstraction(
    caseId,
    'Health Risk Indicator',
    'General abstraction of factors indicating health risks',
    AbstractionLevel.GENERAL,
    [concept1.id, concept2.id],
    ['ev-1', 'ev-2', 'ev-4'] as EvidenceId[],
    ['cx-general-1'],
    {
      supportedContexts: ['Adult healthcare', 'Preventive medicine'],
      unsupportedContexts: ['Pediatric care', 'Emergency medicine'],
      knownLimitations: ['Does not account for acute conditions'],
      requiredConditions: ['Patient has medical history'],
      counterexamples: ['Asymptomatic individuals'],
      distributionAssumptions: ['Population over 30 years'],
      uncertainty: 'Moderate in diverse populations',
      oodIndicators: ['Age < 18', 'Acute symptoms'],
    },
    'researcher-001'
  );

  const abs2 = abstractionRepo.createAbstraction(
    caseId,
    'Cardiovascular Risk Profile',
    'Intermediate abstraction for cardiovascular risk assessment',
    AbstractionLevel.INTERMEDIATE,
    [concept1.id],
    ['ev-1', 'ev-2', 'ev-3'] as EvidenceId[],
    ['cx-intermediate-1'],
    {
      supportedContexts: ['Cardiology', 'Primary care'],
      unsupportedContexts: ['Oncology', 'Psychiatry'],
      knownLimitations: ['Does not include mental health factors'],
      requiredConditions: ['BP and cholesterol measurements available'],
      counterexamples: ['Genetic exceptions'],
      distributionAssumptions: ['Adult population 40-70 years'],
      uncertainty: 'Low in defined population',
      oodIndicators: ['Age < 30', 'Pregnancy'],
    },
    'researcher-001'
  );

  const abs3 = abstractionRepo.createAbstraction(
    caseId,
    'Hypertension Risk Factor',
    'Concrete abstraction for high blood pressure risk',
    AbstractionLevel.CONCRETE,
    [concept1.id],
    ['ev-1'] as EvidenceId[],
    [],
    {
      supportedContexts: ['BP measurement contexts'],
      unsupportedContexts: ['White coat hypertension'],
      knownLimitations: ['Single measurement insufficient'],
      requiredConditions: ['Multiple BP readings'],
      counterexamples: [],
      distributionAssumptions: ['Resting state measurement'],
      uncertainty: 'Very low with proper measurement',
      oodIndicators: ['Post-exercise', 'Stress conditions'],
    },
    'researcher-001'
  );

  // Create abstraction lattice
  const lattice = abstractionRepo.createLattice(
    caseId,
    'Health Risk Abstraction Lattice',
    'Hierarchical structure of health risk abstractions',
    [abs1.id, abs2.id, abs3.id],
    abs1.id,
    'researcher-001'
  );

  // Add abstraction relations
  abstractionRepo.addAbstractionRelation(abs1.id, abs2.id, caseId, AbstractionRelationType.SPECIALIZES, 0.9, 'researcher-001');
  abstractionRepo.addAbstractionRelation(abs2.id, abs3.id, caseId, AbstractionRelationType.SPECIALIZES, 0.85, 'researcher-001');

  // === ANALOGY & TRANSFER ===

  // Create 2 analogies
  const mapping1 = {
    id: 'map-1',
    sourceDomain: 'Cardiovascular System',
    targetDomain: 'Plumbing System',
    correspondences: [
      { sourceElement: 'Heart', targetElement: 'Pump', relationType: 'function', confidence: 0.9 },
      { sourceElement: 'Arteries', targetElement: 'Pipes', relationType: 'structure', confidence: 0.85 },
      { sourceElement: 'Blood Pressure', targetElement: 'Water Pressure', relationType: 'property', confidence: 0.8 },
    ],
    differences: ['Biological regulation vs mechanical control', 'Self-repair capability'],
    evidence: ['ev-analogy-1'] as EvidenceId[],
    assumptions: ['Simplified mechanical model'],
    uncertainty: 'Limited for complex biological phenomena',
    provenance: {
      id: ids.nextProvenanceId(),
      producer: 'researcher-001',
      producerType: ActorType.HUMAN,
      method: 'analogy-mapping',
      version: '1',
      createdAt: time.now(),
      inputs: [],
      assumptions: [],
    },
    createdAt: time.now(),
  };

  const analogy1 = analogyRepo.createAnalogy(
    caseId,
    'Cardiovascular-Plumbing Analogy',
    'Analogy between cardiovascular system and plumbing for educational purposes',
    concept1.id,
    concept2.id,
    mapping1,
    0.75,
    'researcher-001'
  );

  const mapping2 = {
    id: 'map-2',
    sourceDomain: 'Epidemiology',
    targetDomain: 'Weather Forecasting',
    correspondences: [
      { sourceElement: 'Disease Spread', targetElement: 'Weather Patterns', relationType: 'pattern', confidence: 0.6 },
      { sourceElement: 'Risk Factors', targetElement: 'Atmospheric Conditions', relationType: 'causal', confidence: 0.5 },
    ],
    differences: ['Deterministic vs probabilistic', 'Timescale differences'],
    evidence: [] as EvidenceId[],
    assumptions: ['Statistical similarity'],
    uncertainty: 'High - different domains',
    provenance: {
      id: ids.nextProvenanceId(),
      producer: 'researcher-001',
      producerType: ActorType.HUMAN,
      method: 'analogy-mapping',
      version: '1',
      createdAt: time.now(),
      inputs: [],
      assumptions: [],
    },
    createdAt: time.now(),
  };

  const analogy2 = analogyRepo.createAnalogy(
    caseId,
    'Epidemiology-Weather Analogy',
    'Weak analogy between disease spread and weather patterns',
    concept3.id,
    concept1.id,
    mapping2,
    0.4,
    'researcher-001'
  );

  // Create transfer hypotheses
  const hyp1 = analogyRepo.createTransferHypothesis(
    analogy1.id,
    caseId,
    'Using plumbing blockage models to understand arterial plaque',
    ['Can predict blockage locations', 'Suggests preventive maintenance strategies'],
    ['Similar flow dynamics', 'Comparable material properties'],
    0.7,
    'researcher-001'
  );

  const hyp2 = analogyRepo.createTransferHypothesis(
    analogy2.id,
    caseId,
    'Using weather prediction models for disease outbreak forecasting',
    ['Can identify high-risk periods', 'Suggests preventive measures'],
    ['Similar statistical patterns', 'Comparable data availability'],
    0.3,
    'researcher-001'
  );

  // Assess transfers
  analogyRepo.assessTransfer(
    hyp1.id,
    caseId,
    TransferValidity.ACCEPTED,
    'Analogy provides useful conceptual framework for understanding arterial blockages',
    ['ev-transfer-1'] as EvidenceId[],
    [],
    'expert-001'
  );

  analogyRepo.assessTransfer(
    hyp2.id,
    caseId,
    TransferValidity.REJECTED,
    'Domains too different - weather systems lack biological complexity',
    [] as EvidenceId[],
    ['Fundamental domain mismatch', 'Different causal mechanisms'],
    'expert-001'
  );

  // === WORLD MODEL ===

  // Create 2 world models
  const wm1 = worldModelRepo.createWorldModel(
    caseId,
    'Patient Health State Model v1',
    'Initial model of patient health states and transitions',
    ['ev-1', 'ev-2', 'ev-3'] as EvidenceId[],
    ['claim-1'] as ClaimId[],
    [] as CausalModelId[],
    'researcher-001'
  );

  const wm2 = worldModelRepo.createWorldModel(
    caseId,
    'Patient Health State Model v2',
    'Updated model with additional risk factors',
    ['ev-1', 'ev-2', 'ev-3', 'ev-4'] as EvidenceId[],
    ['claim-1', 'claim-2'] as ClaimId[],
    [] as CausalModelId[],
    'researcher-001'
  );

  // Create 5 world states
  const ws1 = worldModelRepo.createWorldState(
    caseId,
    wm1.id,
    'Healthy State',
    'Patient in good health with normal vitals',
    [
      { id: 'var-1', name: 'BloodPressure', type: 'numeric', value: 120, epistemicStatus: EpistemicStatus.OBSERVED },
      { id: 'var-2', name: 'Cholesterol', type: 'numeric', value: 180, epistemicStatus: EpistemicStatus.OBSERVED },
      { id: 'var-3', name: 'RiskLevel', type: 'categorical', value: 'low', epistemicStatus: EpistemicStatus.INFERENCE },
    ],
    ExecutionMode.OBSERVED,
    'researcher-001'
  );

  const ws2 = worldModelRepo.createWorldState(
    caseId,
    wm1.id,
    'At-Risk State',
    'Patient showing early risk indicators',
    [
      { id: 'var-1', name: 'BloodPressure', type: 'numeric', value: 140, epistemicStatus: EpistemicStatus.OBSERVED },
      { id: 'var-2', name: 'Cholesterol', type: 'numeric', value: 220, epistemicStatus: EpistemicStatus.OBSERVED },
      { id: 'var-3', name: 'RiskLevel', type: 'categorical', value: 'moderate', epistemicStatus: EpistemicStatus.INFERENCE },
    ],
    ExecutionMode.OBSERVED,
    'researcher-001'
  );

  const ws3 = worldModelRepo.createWorldState(
    caseId,
    wm1.id,
    'Predicted Improved State',
    'Predicted state after lifestyle intervention',
    [
      { id: 'var-1', name: 'BloodPressure', type: 'numeric', value: 130, epistemicStatus: EpistemicStatus.INFERENCE },
      { id: 'var-2', name: 'Cholesterol', type: 'numeric', value: 200, epistemicStatus: EpistemicStatus.INFERENCE },
      { id: 'var-3', name: 'RiskLevel', type: 'categorical', value: 'low-moderate', epistemicStatus: EpistemicStatus.INFERENCE },
    ],
    ExecutionMode.PREDICTED,
    'researcher-001'
  );

  const ws4 = worldModelRepo.createWorldState(
    caseId,
    wm2.id,
    'Simulated Treatment State',
    'Simulated state with pharmacological treatment',
    [
      { id: 'var-1', name: 'BloodPressure', type: 'numeric', value: 125, epistemicStatus: EpistemicStatus.SIMULATION_RESULT },
      { id: 'var-2', name: 'Cholesterol', type: 'numeric', value: 190, epistemicStatus: EpistemicStatus.SIMULATION_RESULT },
      { id: 'var-3', name: 'RiskLevel', type: 'categorical', value: 'low', epistemicStatus: EpistemicStatus.SIMULATION_RESULT },
    ],
    ExecutionMode.SIMULATED,
    'researcher-001'
  );

  const ws5 = worldModelRepo.createWorldState(
    caseId,
    wm2.id,
    'Unknown Complication State',
    'State with unknown complications',
    [
      { id: 'var-1', name: 'BloodPressure', type: 'numeric', value: null, epistemicStatus: EpistemicStatus.UNKNOWN },
      { id: 'var-2', name: 'Cholesterol', type: 'numeric', value: null, epistemicStatus: EpistemicStatus.UNKNOWN },
      { id: 'var-3', name: 'RiskLevel', type: 'categorical', value: 'unknown', epistemicStatus: EpistemicStatus.UNKNOWN },
    ],
    ExecutionMode.NOT_EXECUTED,
    'researcher-001'
  );

  // Create 5 transitions
  worldModelRepo.createTransition(
    caseId,
    wm1.id,
    'Healthy to At-Risk',
    'Transition due to lifestyle deterioration',
    ws1.id,
    ws2.id,
    ['Unhealthy diet', 'Sedentary lifestyle', 'Stress'],
    ['Increased BP', 'Increased cholesterol'],
    ['ev-1', 'ev-2'] as EvidenceId[],
    undefined,
    'Moderate - depends on individual factors',
    'Adult population',
    'researcher-001'
  );

  worldModelRepo.createTransition(
    caseId,
    wm1.id,
    'At-Risk to Improved',
    'Transition due to lifestyle intervention',
    ws2.id,
    ws3.id,
    ['Diet improvement', 'Exercise regimen', 'Stress management'],
    ['Decreased BP', 'Decreased cholesterol'],
    ['ev-3', 'ev-6'] as EvidenceId[],
    undefined,
    'High - requires patient adherence',
    'Motivated patients',
    'researcher-001'
  );

  worldModelRepo.createTransition(
    caseId,
    wm2.id,
    'At-Risk to Treated',
    'Transition with pharmacological intervention',
    ws2.id,
    ws4.id,
    ['Medication prescription', 'Medical supervision'],
    ['Controlled BP', 'Controlled cholesterol'],
    ['ev-4', 'ev-8'] as EvidenceId[],
    undefined,
    'Low - well-established treatment',
    'Patients without contraindications',
    'researcher-001'
  );

  worldModelRepo.createTransition(
    caseId,
    wm2.id,
    'Healthy to Unknown',
    'Transition to unknown complication state',
    ws1.id,
    ws5.id,
    ['Unexpected symptoms', 'Test anomalies'],
    ['Unknown outcomes'],
    [] as EvidenceId[],
    undefined,
    'Very high - unpredictable',
    'Rare cases only',
    'researcher-001'
  );

  worldModelRepo.createTransition(
    caseId,
    wm1.id,
    'At-Risk to Healthy',
    'Transition back to healthy state',
    ws2.id,
    ws1.id,
    ['Significant lifestyle changes', 'Weight loss'],
    ['Normalized vitals'],
    ['ev-5', 'ev-7'] as EvidenceId[],
    undefined,
    'Moderate - requires sustained effort',
    'Committed patients',
    'researcher-001'
  );

  // Create model disagreement
  worldModelRepo.createModelDisagreement(
    caseId,
    'Disagreement on treatment effectiveness between models',
    [wm1.id, wm2.id],
    'Predicted outcomes differ for pharmacological treatment',
    ['ev-disagree-1'] as EvidenceId[],
    ['Different assumptions about side effects'],
    'High uncertainty in long-term outcomes',
    true,
    'researcher-001'
  );

  // Create 2 OOD assessments
  worldModelRepo.createOODAssessment(
    caseId,
    wm1.id,
    ws3.id,
    OODStatus.POSSIBLE_SHIFT,
    ['Prediction based on limited data', 'Population drift detected'],
    'Model may not generalize to new population',
    true,
    'researcher-001'
  );

  worldModelRepo.createOODAssessment(
    caseId,
    wm2.id,
    ws5.id,
    OODStatus.OUT_OF_DISTRIBUTION,
    ['Unknown state variables', 'No training data for this scenario'],
    'State is outside model domain',
    true,
    'researcher-001'
  );

  return {
    caseId,
    conceptCandidates: 6,
    concepts: 3,
    abstractions: 3,
    lattices: 1,
    counterexamples: 3,
    analogies: 2,
    transferAccepted: 1,
    transferRejected: 1,
    worldModels: 2,
    worldStates: 5,
    transitions: 5,
    modelDisagreements: 1,
    oodAssessments: 2,
  };
}
