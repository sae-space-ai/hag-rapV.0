/**
 * HAG-RAP V.2 — Order 3 Tests (WP4)
 * Tests for Deep Abstraction & Transferable World Models.
 */

import { describe, it, expect } from 'vitest';
import {
  ResearchCaseId,
  EvidenceId,
  ConceptId,
  EpistemicStatus,
  ExecutionMode,
  ActorType,
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  DomainError,
  DomainErrorCode,
} from '../src/core/index.ts';
import { 
  createConceptModelRepository, 
  ConceptValidationStatus, 
  ConceptRelationType 
} from '../src/concept-model/index.ts';
import { 
  createAbstractionEngineRepository, 
  AbstractionLevel, 
  AbstractionRelationType 
} from '../src/abstraction-engine/index.ts';
import { 
  createAnalogyTransferEngineRepository, 
  TransferValidity 
} from '../src/analogy-transfer/index.ts';
import { 
  createWorldModelEngineRepository, 
  OODStatus 
} from '../src/world-model/index.ts';
import { runWP4Demo } from '../src/demo/wp4-demo.ts';

// ============================================================
// CONCEPT MODEL TESTS (T401-T430)
// ============================================================

describe('T401: ConceptCandidate ≠ Validated Concept', () => {
  it('candidate has CANDIDATE status, not VALIDATED', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(
      caseId,
      'Test Concept',
      'Test definition',
      [] as EvidenceId[],
      [],
      'test scope',
      'test uncertainty',
      'researcher-001'
    );
    
    expect(candidate.validationStatus).toBe(ConceptValidationStatus.CANDIDATE);
    expect(candidate.validationStatus).not.toBe(ConceptValidationStatus.VALIDATED);
  });
});

describe('T402: Concept validation changes status', () => {
  it('validated concept has VALIDATED status', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(
      caseId,
      'Test Concept',
      'Test definition',
      [] as EvidenceId[],
      [],
      'test scope',
      'test uncertainty',
      'researcher-001'
    );
    
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.validationStatus).toBe(ConceptValidationStatus.VALIDATED);
    expect(concept.validatedBy).toBe('expert-001');
    expect(concept.validatedAt).toBeDefined();
  });
});

describe('T403: Counterexample preserved after validation', () => {
  it('counterexamples remain attached to concept', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(
      caseId,
      'Test Concept',
      'Test definition',
      [] as EvidenceId[],
      ['counterexample-1'],
      'test scope',
      'test uncertainty',
      'researcher-001'
    );
    
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.counterexamples).toContain('counterexample-1');
  });
});

describe('T404: Concept supersession preserves history', () => {
  it('superseded concept remains accessible', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createConceptModelRepository(ids, time);
    
    const cand1 = repo.createCandidate(caseId, 'Concept V1', 'def1', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const cand2 = repo.createCandidate(caseId, 'Concept V2', 'def2', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    
    const concept1 = repo.validateConcept(cand1.id, caseId, 'expert-001');
    const concept2 = repo.validateConcept(cand2.id, caseId, 'expert-001');
    
    repo.supersedeConcept(concept1.id, concept2.id, caseId, 'Improved version', 'expert-001');
    
    const oldConcept = repo.getConcept(concept1.id, caseId);
    expect(oldConcept).toBeDefined();
    expect(oldConcept?.validationStatus).toBe(ConceptValidationStatus.SUPERSEDED);
    expect(oldConcept?.supersededBy).toBe(concept2.id);
  });
});

describe('T405: Concept relation types are distinct', () => {
  it('IS_A, PART_OF, RELATED_TO, OPPOSITE_OF are different', () => {
    expect(ConceptRelationType.IS_A).not.toBe(ConceptRelationType.PART_OF);
    expect(ConceptRelationType.PART_OF).not.toBe(ConceptRelationType.RELATED_TO);
    expect(ConceptRelationType.RELATED_TO).not.toBe(ConceptRelationType.OPPOSITE_OF);
  });
});

describe('T406: Cross-case concept access rejected', () => {
  it('cannot access concept from different case', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId1 = ids.nextResearchCaseId();
    const caseId2 = ids.nextResearchCaseId();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId1, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId1, 'expert-001');
    
    expect(() => repo.getConcept(concept.id, caseId2)).toThrow(DomainError);
  });
});

// ============================================================
// ABSTRACTION ENGINE TESTS (T431-T460)
// ============================================================

describe('T431: Abstraction levels are hierarchical', () => {
  it('CONCRETE, INTERMEDIATE, GENERAL are distinct', () => {
    expect(AbstractionLevel.CONCRETE).not.toBe(AbstractionLevel.INTERMEDIATE);
    expect(AbstractionLevel.INTERMEDIATE).not.toBe(AbstractionLevel.GENERAL);
  });
});

describe('T432: Abstraction has applicability envelope', () => {
  it('abstraction includes envelope with supported/unsupported contexts', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const abstraction = repo.createAbstraction(
      caseId,
      'Test Abstraction',
      'Test description',
      AbstractionLevel.GENERAL,
      [] as ConceptId[],
      [] as EvidenceId[],
      [],
      {
        supportedContexts: ['context1'],
        unsupportedContexts: ['context2'],
        knownLimitations: ['limitation1'],
        requiredConditions: ['condition1'],
        counterexamples: ['counterexample1'],
        distributionAssumptions: ['assumption1'],
        uncertainty: 'moderate',
        oodIndicators: ['indicator1'],
      },
      'researcher-001'
    );
    
    expect(abstraction.applicabilityEnvelope.supportedContexts).toContain('context1');
    expect(abstraction.applicabilityEnvelope.unsupportedContexts).toContain('context2');
    expect(abstraction.applicabilityEnvelope.knownLimitations).toContain('limitation1');
  });
});

describe('T433: Generality ≠ Universality', () => {
  it('GENERAL abstraction has limited applicability', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const abstraction = repo.createAbstraction(
      caseId,
      'General Abstraction',
      'description',
      AbstractionLevel.GENERAL,
      [] as ConceptId[],
      [] as EvidenceId[],
      [],
      {
        supportedContexts: ['limited context'],
        unsupportedContexts: ['many contexts'],
        knownLimitations: ['significant limitations'],
        requiredConditions: [],
        counterexamples: [],
        distributionAssumptions: [],
        uncertainty: 'high',
        oodIndicators: [],
      },
      'researcher-001'
    );
    
    expect(abstraction.level).toBe(AbstractionLevel.GENERAL);
    expect(abstraction.applicabilityEnvelope.unsupportedContexts.length).toBeGreaterThan(0);
  });
});

describe('T434: Abstraction lattice structure', () => {
  it('lattice contains multiple abstractions with root', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const abs1 = repo.createAbstraction(caseId, 'Abs1', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    }, 'researcher-001');
    
    const abs2 = repo.createAbstraction(caseId, 'Abs2', 'desc', AbstractionLevel.INTERMEDIATE, [] as ConceptId[], [] as EvidenceId[], [], {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    }, 'researcher-001');
    
    const lattice = repo.createLattice(caseId, 'Test Lattice', 'description', [abs1.id, abs2.id], abs1.id, 'researcher-001');
    
    expect(lattice.abstractions).toContain(abs1.id);
    expect(lattice.abstractions).toContain(abs2.id);
    expect(lattice.rootAbstractionId).toBe(abs1.id);
  });
});

describe('T435: Abstraction supersession preserves old version', () => {
  it('old abstraction remains accessible with SUPERSEDED status', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abs1 = repo.createAbstraction(caseId, 'Abs V1', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    const abs2 = repo.createAbstraction(caseId, 'Abs V2', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    
    repo.supersedeAbstraction(abs1.id, abs2.id, caseId, 'Improved version', 'researcher-001');
    
    const oldAbs = repo.getAbstraction(abs1.id, caseId);
    expect(oldAbs).toBeDefined();
    expect(oldAbs?.supersededBy).toBe(abs2.id);
  });
});

describe('T436: Abstraction relation types', () => {
  it('GENERALIZES, SPECIALIZES, RELATED_TO are distinct', () => {
    expect(AbstractionRelationType.GENERALIZES).not.toBe(AbstractionRelationType.SPECIALIZES);
    expect(AbstractionRelationType.SPECIALIZES).not.toBe(AbstractionRelationType.RELATED_TO);
  });
});

// ============================================================
// ANALOGY & TRANSFER TESTS (T461-T490)
// ============================================================

describe('T461: Similarity ≠ Analogy', () => {
  it('analogy requires structural mapping, not just similarity', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAnalogyTransferEngineRepository(ids, time);
    
    const mapping = {
      id: 'map-1',
      sourceDomain: 'Domain A',
      targetDomain: 'Domain B',
      correspondences: [
        { sourceElement: 'A1', targetElement: 'B1', relationType: 'structural', confidence: 0.8 }
      ],
      differences: ['key difference'],
      evidence: [] as EvidenceId[],
      assumptions: ['assumption1'],
      uncertainty: 'moderate',
      provenance: {
        id: ids.nextProvenanceId(),
        producer: 'researcher-001',
        producerType: ActorType.HUMAN,
        method: 'analogy-creation',
        version: '1',
        createdAt: time.now(),
        inputs: [],
        assumptions: [],
      },
      createdAt: time.now(),
    };
    
    const analogy = repo.createAnalogy(
      caseId,
      'Test Analogy',
      'description',
      'concept-1' as ConceptId,
      'concept-2' as ConceptId,
      mapping,
      0.7,
      'researcher-001'
    );
    
    expect(analogy.mapping.correspondences.length).toBeGreaterThan(0);
    expect(analogy.mapping.differences.length).toBeGreaterThan(0);
  });
});

describe('T462: Analogy ≠ Valid Transfer', () => {
  it('analogy exists independently of transfer assessment', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAnalogyTransferEngineRepository(ids, time);
    
    const mapping = {
      id: 'map-1',
      sourceDomain: 'A',
      targetDomain: 'B',
      correspondences: [],
      differences: [],
      evidence: [] as EvidenceId[],
      assumptions: [],
      uncertainty: '',
      provenance: {
        id: ids.nextProvenanceId(),
        producer: 'researcher-001',
        producerType: ActorType.HUMAN,
        method: 'analogy-creation',
        version: '1',
        createdAt: time.now(),
        inputs: [],
        assumptions: [],
      },
      createdAt: time.now(),
    };
    
    const analogy = repo.createAnalogy(caseId, 'Analogy', 'desc', 'c1' as ConceptId, 'c2' as ConceptId, mapping, 0.5, 'researcher-001');
    
    // Analogy exists but no transfer assessment yet
    const assessment = repo.getTransferAssessment('non-existent', caseId);
    expect(assessment).toBeNull();
  });
});

describe('T463: Transfer validity assessment', () => {
  it('transfer can be ACCEPTED, REJECTED, or PENDING_REVIEW', () => {
    expect(TransferValidity.ACCEPTED).not.toBe(TransferValidity.REJECTED);
    expect(TransferValidity.REJECTED).not.toBe(TransferValidity.PENDING_REVIEW);
    expect(TransferValidity.PENDING_REVIEW).not.toBe(TransferValidity.INSUFFICIENT_EVIDENCE);
  });
});

describe('T464: Source domain ≠ Target domain', () => {
  it('analogy mapping distinguishes source and target', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAnalogyTransferEngineRepository(ids, time);
    
    const mapping = {
      id: 'map-1',
      sourceDomain: 'Cardiovascular',
      targetDomain: 'Plumbing',
      correspondences: [],
      differences: [],
      evidence: [] as EvidenceId[],
      assumptions: [],
      uncertainty: '',
      provenance: {
        id: ids.nextProvenanceId(),
        producer: 'researcher-001',
        producerType: ActorType.HUMAN,
        method: 'analogy-creation',
        version: '1',
        createdAt: time.now(),
        inputs: [],
        assumptions: [],
      },
      createdAt: time.now(),
    };
    
    const analogy = repo.createAnalogy(caseId, 'Analogy', 'desc', 'c1' as ConceptId, 'c2' as ConceptId, mapping, 0.5, 'researcher-001');
    
    expect(analogy.mapping.sourceDomain).toBe('Cardiovascular');
    expect(analogy.mapping.targetDomain).toBe('Plumbing');
    expect(analogy.mapping.sourceDomain).not.toBe(analogy.mapping.targetDomain);
  });
});

describe('T465: Transfer hypothesis requires analogy', () => {
  it('cannot create transfer hypothesis without analogy', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAnalogyTransferEngineRepository(ids, time);
    
    expect(() => {
      repo.createTransferHypothesis('non-existent', caseId, 'desc', [], [], 0.5, 'researcher-001');
    }).toThrow(DomainError);
  });
});

describe('T466: Invalid transfer rejected', () => {
  it('transfer assessment can mark hypothesis as REJECTED', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const repo = createAnalogyTransferEngineRepository(ids, time);
    
    const mapping = {
      id: 'map-1',
      sourceDomain: 'A',
      targetDomain: 'B',
      correspondences: [],
      differences: [],
      evidence: [] as EvidenceId[],
      assumptions: [],
      uncertainty: '',
      provenance: {
        id: ids.nextProvenanceId(),
        producer: 'researcher-001',
        producerType: ActorType.HUMAN,
        method: 'analogy-creation',
        version: '1',
        createdAt: time.now(),
        inputs: [],
        assumptions: [],
      },
      createdAt: time.now(),
    };
    
    const analogy = repo.createAnalogy(caseId, 'Analogy', 'desc', 'c1' as ConceptId, 'c2' as ConceptId, mapping, 0.3, 'researcher-001');
    const hypothesis = repo.createTransferHypothesis(analogy.id, caseId, 'desc', [], [], 0.3, 'researcher-001');
    
    const assessment = repo.assessTransfer(
      hypothesis.id,
      caseId,
      TransferValidity.REJECTED,
      'Domains too different',
      [] as EvidenceId[],
      ['fundamental mismatch'],
      'expert-001'
    );
    
    expect(assessment.validity).toBe(TransferValidity.REJECTED);
  });
});

// ============================================================
// WORLD MODEL TESTS (T491-T520)
// ============================================================

describe('T491: World state execution modes', () => {
  it('OBSERVED, PREDICTED, SIMULATED, UNKNOWN are distinct', () => {
    expect(ExecutionMode.OBSERVED).not.toBe(ExecutionMode.PREDICTED);
    expect(ExecutionMode.PREDICTED).not.toBe(ExecutionMode.SIMULATED);
    expect(ExecutionMode.SIMULATED).not.toBe(ExecutionMode.NOT_EXECUTED);
  });
});

describe('T492: Predicted state ≠ Observed state', () => {
  it('world state tracks execution mode', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model = wmRepo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const observedState = wmRepo.createWorldState(
      caseId,
      model.id,
      'Observed',
      'desc',
      [{ id: 'v1', name: 'var', type: 'numeric', value: 100, epistemicStatus: EpistemicStatus.OBSERVED }],
      ExecutionMode.OBSERVED,
      'researcher-001'
    );
    
    const predictedState = wmRepo.createWorldState(
      caseId,
      model.id,
      'Predicted',
      'desc',
      [{ id: 'v2', name: 'var', type: 'numeric', value: 120, epistemicStatus: EpistemicStatus.INFERENCE }],
      ExecutionMode.PREDICTED,
      'researcher-001'
    );
    
    expect(observedState.executionMode).toBe(ExecutionMode.OBSERVED);
    expect(predictedState.executionMode).toBe(ExecutionMode.PREDICTED);
    expect(observedState.executionMode).not.toBe(predictedState.executionMode);
  });
});

describe('T493: Simulated state ≠ Reality', () => {
  it('simulated state has SIMULATED execution mode', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model = wmRepo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const simState = wmRepo.createWorldState(
      caseId,
      model.id,
      'Simulated',
      'desc',
      [{ id: 'v1', name: 'var', type: 'numeric', value: 150, epistemicStatus: EpistemicStatus.SIMULATION_RESULT }],
      ExecutionMode.SIMULATED,
      'researcher-001'
    );
    
    expect(simState.executionMode).toBe(ExecutionMode.SIMULATED);
    expect(simState.executionMode).not.toBe(ExecutionMode.OBSERVED);
  });
});

describe('T494: Transition requires provenance', () => {
  it('transition includes provenance information', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model = wmRepo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const state1 = wmRepo.createWorldState(caseId, model.id, 'S1', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    const state2 = wmRepo.createWorldState(caseId, model.id, 'S2', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const transition = wmRepo.createTransition(
      caseId,
      model.id,
      'Transition',
      'desc',
      state1.id,
      state2.id,
      ['precondition1'],
      ['effect1'],
      [] as EvidenceId[],
      undefined,
      'low uncertainty',
      'broad scope',
      'researcher-001'
    );
    
    expect(transition.provenance).toBeDefined();
    expect(transition.provenance.producer).toBe('researcher-001');
  });
});

describe('T495: World model does not duplicate Evidence', () => {
  it('world model references evidence by ID', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const evidenceIds = ['ev-1', 'ev-2'] as EvidenceId[];
    
    const model = wmRepo.createWorldModel(
      caseId,
      'Model',
      'desc',
      evidenceIds,
      [] as any,
      [] as any,
      'researcher-001'
    );
    
    expect(model.referencedEvidence).toEqual(evidenceIds);
    // Evidence is referenced, not duplicated
  });
});

describe('T496: Model disagreement preserved', () => {
  it('disagreement between models is recorded', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model1 = wmRepo.createWorldModel(caseId, 'Model1', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const model2 = wmRepo.createWorldModel(caseId, 'Model2', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const disagreement = wmRepo.createModelDisagreement(
      caseId,
      'Models disagree on outcome',
      [model1.id, model2.id],
      'predicted state values',
      [] as EvidenceId[],
      ['different assumptions'],
      'high uncertainty',
      true,
      'researcher-001'
    );
    
    expect(disagreement.modelIds).toContain(model1.id);
    expect(disagreement.modelIds).toContain(model2.id);
    expect(disagreement.humanReviewRequired).toBe(true);
    expect(disagreement.resolved).toBe(false);
  });
});

describe('T497: OOD assessment status', () => {
  it('IN_DISTRIBUTION, POSSIBLE_SHIFT, OUT_OF_DISTRIBUTION, UNKNOWN are distinct', () => {
    expect(OODStatus.IN_DISTRIBUTION).not.toBe(OODStatus.POSSIBLE_SHIFT);
    expect(OODStatus.POSSIBLE_SHIFT).not.toBe(OODStatus.OUT_OF_DISTRIBUTION);
    expect(OODStatus.OUT_OF_DISTRIBUTION).not.toBe(OODStatus.UNKNOWN);
  });
});

describe('T498: OOD UNKNOWN is valid', () => {
  it('OOD assessment can have UNKNOWN status', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model = wmRepo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state = wmRepo.createWorldState(caseId, model.id, 'State', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const assessment = wmRepo.createOODAssessment(
      caseId,
      model.id,
      state.id,
      OODStatus.UNKNOWN,
      ['insufficient data'],
      'Cannot determine distribution status',
      true,
      'researcher-001'
    );
    
    expect(assessment.status).toBe(OODStatus.UNKNOWN);
  });
});

describe('T499: OOD can escalate to review', () => {
  it('OOD assessment can require escalation', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model = wmRepo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state = wmRepo.createWorldState(caseId, model.id, 'State', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const assessment = wmRepo.createOODAssessment(
      caseId,
      model.id,
      state.id,
      OODStatus.OUT_OF_DISTRIBUTION,
      ['population shift detected'],
      'Model may not apply to new population',
      true,
      'researcher-001'
    );
    
    expect(assessment.escalationRequired).toBe(true);
  });
});

describe('T500: World model supersession', () => {
  it('old world model remains accessible after supersession', () => {
    const ids = createSequentialIdProvider();
    const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    const caseId = ids.nextResearchCaseId();
    const wmRepo = createWorldModelEngineRepository(ids, time);
    
    const model1 = wmRepo.createWorldModel(caseId, 'Model V1', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const model2 = wmRepo.createWorldModel(caseId, 'Model V2', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    wmRepo.supersedeWorldModel(model1.id, model2.id, caseId, 'Improved model', 'researcher-001');
    
    const oldModel = wmRepo.getWorldModel(model1.id, caseId);
    expect(oldModel).toBeDefined();
    expect(oldModel?.supersededBy).toBe(model2.id);
  });
});

// ============================================================
// WP4 DEMO TEST (T521)
// ============================================================

describe('T521: WP4 demo meets requirements', () => {
  it('demo includes all required elements', () => {
    const result = runWP4Demo();
    
    expect(result.conceptCandidates).toBeGreaterThanOrEqual(6);
    expect(result.concepts).toBeGreaterThanOrEqual(3);
    expect(result.abstractions).toBeGreaterThanOrEqual(2);
    expect(result.lattices).toBeGreaterThanOrEqual(1);
    expect(result.counterexamples).toBeGreaterThanOrEqual(3);
    expect(result.analogies).toBeGreaterThanOrEqual(2);
    expect(result.transferAccepted).toBeGreaterThanOrEqual(1);
    expect(result.transferRejected).toBeGreaterThanOrEqual(1);
    expect(result.worldModels).toBeGreaterThanOrEqual(2);
    expect(result.worldStates).toBeGreaterThanOrEqual(5);
    expect(result.transitions).toBeGreaterThanOrEqual(5);
    expect(result.modelDisagreements).toBeGreaterThanOrEqual(1);
    expect(result.oodAssessments).toBeGreaterThanOrEqual(2);
  });
});
