/**
 * HAG-RAP V.2 — Order 3 Additional Tests (WP4)
 * Additional tests to reach >=100 new tests for Order 3.
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

function createTestContext() {
  const ids = createSequentialIdProvider();
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  return { ids, time, caseId };
}

// ============================================================
// ADDITIONAL CONCEPT TESTS (T522-T550)
// ============================================================

describe('T522: Concept has provenance', () => {
  it('concept includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.provenance).toBeDefined();
    expect(concept.provenance.producer).toBe('expert-001');
  });
});

describe('T523: Concept has versioning', () => {
  it('concept includes versioning information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.versioning).toBeDefined();
    expect(concept.versioning.version).toBe(1);
  });
});

describe('T524: Concept has timestamps', () => {
  it('concept has createdAt and updatedAt', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.createdAt).toBeDefined();
    expect(concept.updatedAt).toBeDefined();
  });
});

describe('T525: Concept has scope', () => {
  it('concept includes scope field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'adult population', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.scope).toBe('adult population');
  });
});

describe('T526: Concept has uncertainty', () => {
  it('concept includes uncertainty field', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'moderate uncertainty', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    expect(concept.uncertainty).toBe('moderate uncertainty');
  });
});

describe('T527: Concept evidence can be added', () => {
  it('concept evidence links evidence to concept', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    const ce = repo.addConceptEvidence(concept.id, caseId, 'ev-1' as EvidenceId, 'positive', 0.9, 'researcher-001');
    
    expect(ce.conceptId).toBe(concept.id);
    expect(ce.evidenceId).toBe('ev-1');
    expect(ce.supportType).toBe('positive');
  });
});

describe('T528: Counterexample can be resolved', () => {
  it('counterexample resolution is recorded', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const candidate = repo.createCandidate(caseId, 'Test', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const concept = repo.validateConcept(candidate.id, caseId, 'expert-001');
    
    const cx = repo.addCounterexample(concept.id, caseId, 'counterexample', undefined, 'major', 'researcher-001');
    repo.resolveCounterexample(cx.id, concept.id, caseId, 'Resolved by new evidence', 'expert-001');
    
    const counterexamples = repo.getCounterexamples(concept.id, caseId);
    expect(counterexamples[0].resolved).toBe(true);
    expect(counterexamples[0].resolution).toBe('Resolved by new evidence');
  });
});

describe('T529: Concept relation has strength', () => {
  it('concept relation includes strength value', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const cand1 = repo.createCandidate(caseId, 'C1', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const cand2 = repo.createCandidate(caseId, 'C2', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const c1 = repo.validateConcept(cand1.id, caseId, 'expert-001');
    const c2 = repo.validateConcept(cand2.id, caseId, 'expert-001');
    
    const relation = repo.addConceptRelation(c1.id, c2.id, caseId, ConceptRelationType.RELATED_TO, 0.75, 'researcher-001');
    
    expect(relation.strength).toBe(0.75);
  });
});

describe('T530: Get concepts by case', () => {
  it('returns all concepts for a case', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createConceptModelRepository(ids, time);
    
    const cand1 = repo.createCandidate(caseId, 'C1', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    const cand2 = repo.createCandidate(caseId, 'C2', 'def', [] as EvidenceId[], [], 'scope', 'unc', 'researcher-001');
    repo.validateConcept(cand1.id, caseId, 'expert-001');
    repo.validateConcept(cand2.id, caseId, 'expert-001');
    
    const concepts = repo.getConceptsByCase(caseId);
    expect(concepts.length).toBe(2);
  });
});

// ============================================================
// ADDITIONAL ABSTRACTION TESTS (T551-T580)
// ============================================================

describe('T551: Abstraction has provenance', () => {
  it('abstraction includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abstraction = repo.createAbstraction(caseId, 'Test', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    
    expect(abstraction.provenance).toBeDefined();
    expect(abstraction.provenance.producer).toBe('researcher-001');
  });
});

describe('T552: Abstraction has versioning', () => {
  it('abstraction includes versioning information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abstraction = repo.createAbstraction(caseId, 'Test', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    
    expect(abstraction.versioning).toBeDefined();
    expect(abstraction.versioning.version).toBe(1);
  });
});

describe('T553: Abstraction generalizes from concepts', () => {
  it('abstraction references concepts it generalizes', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abstraction = repo.createAbstraction(
      caseId, 
      'Test', 
      'desc', 
      AbstractionLevel.GENERAL, 
      ['concept-1', 'concept-2'] as ConceptId[], 
      [] as EvidenceId[], 
      [], 
      envelope, 
      'researcher-001'
    );
    
    expect(abstraction.generalizesFrom).toContain('concept-1');
    expect(abstraction.generalizesFrom).toContain('concept-2');
  });
});

describe('T554: Abstraction has counterexamples', () => {
  it('abstraction tracks counterexamples', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abstraction = repo.createAbstraction(
      caseId, 
      'Test', 
      'desc', 
      AbstractionLevel.GENERAL, 
      [] as ConceptId[], 
      [] as EvidenceId[], 
      ['counterexample-1', 'counterexample-2'], 
      envelope, 
      'researcher-001'
    );
    
    expect(abstraction.counterexamples).toContain('counterexample-1');
    expect(abstraction.counterexamples).toContain('counterexample-2');
  });
});

describe('T555: Lattice has provenance', () => {
  it('lattice includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abs = repo.createAbstraction(caseId, 'Abs', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    const lattice = repo.createLattice(caseId, 'Lattice', 'desc', [abs.id], abs.id, 'researcher-001');
    
    expect(lattice.provenance).toBeDefined();
    expect(lattice.provenance.producer).toBe('researcher-001');
  });
});

describe('T556: Get abstractions by case', () => {
  it('returns all abstractions for a case', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    repo.createAbstraction(caseId, 'Abs1', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    repo.createAbstraction(caseId, 'Abs2', 'desc', AbstractionLevel.INTERMEDIATE, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    
    const abstractions = repo.getAbstractionsByCase(caseId);
    expect(abstractions.length).toBe(2);
  });
});

describe('T557: Get lattices by case', () => {
  it('returns all lattices for a case', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abs = repo.createAbstraction(caseId, 'Abs', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    repo.createLattice(caseId, 'Lat1', 'desc', [abs.id], abs.id, 'researcher-001');
    repo.createLattice(caseId, 'Lat2', 'desc', [abs.id], abs.id, 'researcher-001');
    
    const lattices = repo.getLatticesByCase(caseId);
    expect(lattices.length).toBe(2);
  });
});

describe('T558: Abstraction relation has provenance', () => {
  it('abstraction relation includes provenance', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createAbstractionEngineRepository(ids, time);
    
    const envelope = {
      supportedContexts: [], unsupportedContexts: [], knownLimitations: [], requiredConditions: [], counterexamples: [], distributionAssumptions: [], uncertainty: '', oodIndicators: []
    };
    
    const abs1 = repo.createAbstraction(caseId, 'Abs1', 'desc', AbstractionLevel.GENERAL, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    const abs2 = repo.createAbstraction(caseId, 'Abs2', 'desc', AbstractionLevel.INTERMEDIATE, [] as ConceptId[], [] as EvidenceId[], [], envelope, 'researcher-001');
    
    const relation = repo.addAbstractionRelation(abs1.id, abs2.id, caseId, AbstractionRelationType.SPECIALIZES, 0.8, 'researcher-001');
    
    expect(relation.provenance).toBeDefined();
    expect(relation.provenance.producer).toBe('researcher-001');
  });
});

// ============================================================
// ADDITIONAL ANALOGY TESTS (T581-T610)
// ============================================================

describe('T581: Analogy has provenance', () => {
  it('analogy includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
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
    
    expect(analogy.provenance).toBeDefined();
    expect(analogy.provenance.producer).toBe('researcher-001');
  });
});

describe('T582: Analogy has versioning', () => {
  it('analogy includes versioning information', () => {
    const { ids, time, caseId } = createTestContext();
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
    
    expect(analogy.versioning).toBeDefined();
    expect(analogy.versioning.version).toBe(1);
  });
});

describe('T583: Analogy has strength', () => {
  it('analogy includes strength value', () => {
    const { ids, time, caseId } = createTestContext();
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
    
    const analogy = repo.createAnalogy(caseId, 'Analogy', 'desc', 'c1' as ConceptId, 'c2' as ConceptId, mapping, 0.85, 'researcher-001');
    
    expect(analogy.strength).toBe(0.85);
  });
});

describe('T584: Transfer hypothesis has provenance', () => {
  it('transfer hypothesis includes provenance', () => {
    const { ids, time, caseId } = createTestContext();
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
    const hypothesis = repo.createTransferHypothesis(analogy.id, caseId, 'desc', [], [], 0.5, 'researcher-001');
    
    expect(hypothesis.provenance).toBeDefined();
    expect(hypothesis.provenance.producer).toBe('researcher-001');
  });
});

describe('T585: Transfer hypothesis has confidence', () => {
  it('transfer hypothesis includes confidence value', () => {
    const { ids, time, caseId } = createTestContext();
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
    const hypothesis = repo.createTransferHypothesis(analogy.id, caseId, 'desc', [], [], 0.75, 'researcher-001');
    
    expect(hypothesis.confidence).toBe(0.75);
  });
});

describe('T586: Transfer assessment has provenance', () => {
  it('transfer assessment includes provenance', () => {
    const { ids, time, caseId } = createTestContext();
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
    const hypothesis = repo.createTransferHypothesis(analogy.id, caseId, 'desc', [], [], 0.5, 'researcher-001');
    const assessment = repo.assessTransfer(hypothesis.id, caseId, TransferValidity.ACCEPTED, 'rationale', [] as EvidenceId[], [], 'expert-001');
    
    expect(assessment.provenance).toBeDefined();
    expect(assessment.provenance.producer).toBe('expert-001');
  });
});

describe('T587: Get analogies by case', () => {
  it('returns all analogies for a case', () => {
    const { ids, time, caseId } = createTestContext();
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
    
    repo.createAnalogy(caseId, 'Analogy1', 'desc', 'c1' as ConceptId, 'c2' as ConceptId, mapping, 0.5, 'researcher-001');
    repo.createAnalogy(caseId, 'Analogy2', 'desc', 'c3' as ConceptId, 'c4' as ConceptId, mapping, 0.6, 'researcher-001');
    
    const analogies = repo.getAnalogiesByCase(caseId);
    expect(analogies.length).toBe(2);
  });
});

// ============================================================
// ADDITIONAL WORLD MODEL TESTS (T611-T640)
// ============================================================

describe('T611: World model has provenance', () => {
  it('world model includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    expect(model.provenance).toBeDefined();
    expect(model.provenance.producer).toBe('researcher-001');
  });
});

describe('T612: World model has versioning', () => {
  it('world model includes versioning information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    expect(model.versioning).toBeDefined();
    expect(model.versioning.version).toBe(1);
  });
});

describe('T613: World state has provenance', () => {
  it('world state includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state = repo.createWorldState(caseId, model.id, 'State', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    expect(state.provenance).toBeDefined();
    expect(state.provenance.producer).toBe('researcher-001');
  });
});

describe('T614: World state has versioning', () => {
  it('world state includes versioning information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state = repo.createWorldState(caseId, model.id, 'State', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    expect(state.versioning).toBeDefined();
    expect(state.versioning.version).toBe(1);
  });
});

describe('T615: World state has timestamp', () => {
  it('world state includes timestamp', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state = repo.createWorldState(caseId, model.id, 'State', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    expect(state.timestamp).toBeDefined();
  });
});

describe('T616: Transition has provenance', () => {
  it('transition includes provenance information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state1 = repo.createWorldState(caseId, model.id, 'S1', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    const state2 = repo.createWorldState(caseId, model.id, 'S2', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const transition = repo.createTransition(caseId, model.id, 'T', 'desc', state1.id, state2.id, [], [], [] as EvidenceId[], undefined, 'unc', 'scope', 'researcher-001');
    
    expect(transition.provenance).toBeDefined();
    expect(transition.provenance.producer).toBe('researcher-001');
  });
});

describe('T617: Transition has versioning', () => {
  it('transition includes versioning information', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state1 = repo.createWorldState(caseId, model.id, 'S1', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    const state2 = repo.createWorldState(caseId, model.id, 'S2', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const transition = repo.createTransition(caseId, model.id, 'T', 'desc', state1.id, state2.id, [], [], [] as EvidenceId[], undefined, 'unc', 'scope', 'researcher-001');
    
    expect(transition.versioning).toBeDefined();
    expect(transition.versioning.version).toBe(1);
  });
});

describe('T618: Model disagreement has provenance', () => {
  it('model disagreement includes provenance', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model1 = repo.createWorldModel(caseId, 'M1', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const model2 = repo.createWorldModel(caseId, 'M2', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const disagreement = repo.createModelDisagreement(caseId, 'desc', [model1.id, model2.id], 'point', [] as EvidenceId[], [], 'unc', true, 'researcher-001');
    
    expect(disagreement.provenance).toBeDefined();
    expect(disagreement.provenance.producer).toBe('researcher-001');
  });
});

describe('T619: Model disagreement has versioning', () => {
  it('model disagreement includes versioning', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model1 = repo.createWorldModel(caseId, 'M1', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const model2 = repo.createWorldModel(caseId, 'M2', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const disagreement = repo.createModelDisagreement(caseId, 'desc', [model1.id, model2.id], 'point', [] as EvidenceId[], [], 'unc', true, 'researcher-001');
    
    expect(disagreement.versioning).toBeDefined();
    expect(disagreement.versioning.version).toBe(1);
  });
});

describe('T620: OOD assessment has provenance', () => {
  it('OOD assessment includes provenance', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state = repo.createWorldState(caseId, model.id, 'State', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const assessment = repo.createOODAssessment(caseId, model.id, state.id, OODStatus.IN_DISTRIBUTION, [], 'rationale', false, 'researcher-001');
    
    expect(assessment.provenance).toBeDefined();
    expect(assessment.provenance.producer).toBe('researcher-001');
  });
});

describe('T621: Get world models by case', () => {
  it('returns all world models for a case', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    repo.createWorldModel(caseId, 'M1', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    repo.createWorldModel(caseId, 'M2', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    const models = repo.getWorldModelsByCase(caseId);
    expect(models.length).toBe(2);
  });
});

describe('T622: Get world states by model', () => {
  it('returns all world states for a model', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    repo.createWorldState(caseId, model.id, 'S1', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    repo.createWorldState(caseId, model.id, 'S2', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    const states = repo.getWorldStatesByModel(model.id, caseId);
    expect(states.length).toBe(2);
  });
});

describe('T623: Get transitions by model', () => {
  it('returns all transitions for a model', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state1 = repo.createWorldState(caseId, model.id, 'S1', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    const state2 = repo.createWorldState(caseId, model.id, 'S2', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    const state3 = repo.createWorldState(caseId, model.id, 'S3', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    repo.createTransition(caseId, model.id, 'T1', 'desc', state1.id, state2.id, [], [], [] as EvidenceId[], undefined, 'unc', 'scope', 'researcher-001');
    repo.createTransition(caseId, model.id, 'T2', 'desc', state2.id, state3.id, [], [], [] as EvidenceId[], undefined, 'unc', 'scope', 'researcher-001');
    
    const transitions = repo.getTransitionsByModel(model.id, caseId);
    expect(transitions.length).toBe(2);
  });
});

describe('T624: Get model disagreements by case', () => {
  it('returns all model disagreements for a case', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model1 = repo.createWorldModel(caseId, 'M1', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const model2 = repo.createWorldModel(caseId, 'M2', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    
    repo.createModelDisagreement(caseId, 'desc1', [model1.id, model2.id], 'point1', [] as EvidenceId[], [], 'unc1', true, 'researcher-001');
    repo.createModelDisagreement(caseId, 'desc2', [model1.id, model2.id], 'point2', [] as EvidenceId[], [], 'unc2', false, 'researcher-001');
    
    const disagreements = repo.getModelDisagreementsByCase(caseId);
    expect(disagreements.length).toBe(2);
  });
});

describe('T625: Get OOD assessments by model', () => {
  it('returns all OOD assessments for a model', () => {
    const { ids, time, caseId } = createTestContext();
    const repo = createWorldModelEngineRepository(ids, time);
    
    const model = repo.createWorldModel(caseId, 'Model', 'desc', [] as EvidenceId[], [] as any, [] as any, 'researcher-001');
    const state1 = repo.createWorldState(caseId, model.id, 'S1', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    const state2 = repo.createWorldState(caseId, model.id, 'S2', 'desc', [], ExecutionMode.OBSERVED, 'researcher-001');
    
    repo.createOODAssessment(caseId, model.id, state1.id, OODStatus.IN_DISTRIBUTION, [], 'rationale1', false, 'researcher-001');
    repo.createOODAssessment(caseId, model.id, state2.id, OODStatus.POSSIBLE_SHIFT, [], 'rationale2', true, 'researcher-001');
    
    const assessments = repo.getOODAssessmentsByModel(model.id, caseId);
    expect(assessments.length).toBe(2);
  });
});
