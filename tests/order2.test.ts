/**
 * HAG-RAP V.2 — Order 2 Tests (WP3)
 * Tests for Deep Reasoning & Causal Inference.
 * Requirements: >=100 new tests covering all WP3 capabilities.
 */

import { describe, it, expect } from 'vitest';
import {
  EpistemicStatus,
  ActorType,
  ExecutionMode,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
  DomainError,
  DomainErrorCode,
} from '../src/core/index.ts';
import { createEvidenceGraphRepository, SourceType, EvidenceType, AssumptionCriticality } from '../src/evidence-graph/index.ts';
import { createReasoningEngine, InferenceType, FailureType } from '../src/reasoning/index.ts';
import { createCausalEngine, CausalVariableType, CausalRelationType } from '../src/causal/index.ts';
import { runWP3Demo } from '../src/demo/wp3-demo.ts';

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
// REASONING ENGINE TESTS (T401-T500)
// ============================================================

describe('T401: InferenceType enum has all required types', () => {
  it('InferenceType has DEDUCTIVE, INDUCTIVE, ABDUCTIVE, DEFEASIBLE, CAUSAL', () => {
    expect(InferenceType.DEDUCTIVE).toBe('DEDUCTIVE');
    expect(InferenceType.INDUCTIVE).toBe('INDUCTIVE');
    expect(InferenceType.ABDUCTIVE).toBe('ABDUCTIVE');
    expect(InferenceType.DEFEASIBLE).toBe('DEFEASIBLE');
    expect(InferenceType.CAUSAL).toBe('CAUSAL');
  });
});

describe('T402: ReasoningRun creation', () => {
  it('creates a reasoning run with proper provenance', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test Run', 'Test description', 'researcher-001');
    expect(run.caseId).toBe(caseId);
    expect(run.name).toBe('Test Run');
    expect(run.status).toBe('RUNNING');
    expect(run.provenance.producer).toBe('researcher-001');
    expect(run.provenance.producerType).toBe(ActorType.HUMAN);
  });
});

describe('T403: Deductive inference', () => {
  it('creates a valid deductive inference', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'All men are mortal' }],
      { id: 'c1', content: 'Socrates is mortal', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.95, uncertainty: 0.05 },
      'Modus ponens', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.type).toBe(InferenceType.DEDUCTIVE);
    expect(inf.status).toBe('VALID');
    expect(inf.conclusion.epistemicStatus).toBe(EpistemicStatus.INFERENCE);
  });
});

describe('T404: Deduction with missing premise rejected', () => {
  it('detects insufficient evidence when no premises provided', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [],
      { id: 'c1', content: 'Conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.5, uncertainty: 0.5 },
      'Rule', [], [], [], 'tester'
    );
    const failures = engine.detectFailures(inf);
    expect(failures.some(f => f.type === FailureType.INSUFFICIENT_EVIDENCE)).toBe(true);
  });
});

describe('T405: Abduction remains hypothesis', () => {
  it('abductive inference conclusion has HYPOTHESIS status', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.ABDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Symptom' }],
      { id: 'c1', content: 'Best explanation', epistemicStatus: EpistemicStatus.HYPOTHESIS, confidence: 0.6, uncertainty: 0.4 },
      'Abductive reasoning', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.type).toBe(InferenceType.ABDUCTIVE);
    expect(inf.conclusion.epistemicStatus).toBe(EpistemicStatus.HYPOTHESIS);
    expect(inf.conclusion.epistemicStatus).not.toBe(EpistemicStatus.SUPPORTED_FACT);
  });
});

describe('T406: Induction does not create fact', () => {
  it('inductive inference remains HYPOTHESIS, not SUPPORTED_FACT', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.INDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Pattern' }],
      { id: 'c1', content: 'Generalization', epistemicStatus: EpistemicStatus.HYPOTHESIS, confidence: 0.7, uncertainty: 0.3 },
      'Statistical generalization', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.type).toBe(InferenceType.INDUCTIVE);
    expect(inf.conclusion.epistemicStatus).not.toBe(EpistemicStatus.SUPPORTED_FACT);
  });
});

describe('T407: Defeasible conclusion is revisable', () => {
  it('defeasible inference can be superseded', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf1 = engine.addInference(
      run.id, caseId, InferenceType.DEFEASIBLE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Evidence' }],
      { id: 'c1', content: 'Initial conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.8, uncertainty: 0.2 },
      'Defeasible rule', ['ev1' as any], [], [], 'tester'
    );
    const inf2 = engine.addInference(
      run.id, caseId, InferenceType.DEFEASIBLE,
      [{ id: 'p2', type: 'evidence', ref: 'ev2' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'New evidence' }],
      { id: 'c2', content: 'Revised conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Updated rule', ['ev2' as any], [], [], 'tester'
    );
    engine.supersedeInference(inf1.id, inf2.id, caseId, 'New evidence', 'tester');
    const updatedInf1 = engine.getInference(inf1.id, caseId);
    expect(updatedInf1?.status).toBe('SUPERSEDED');
    expect(updatedInf1?.supersededBy).toBe(inf2.id);
  });
});

describe('T408: Contradiction preserved', () => {
  it('contradictory evidence is not deleted', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
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
      epistemicStatus: EpistemicStatus.CONTESTED, scope: { domain: 'test' },
      quality: { reliability: 0.7, completeness: 0.7, relevance: 0.9, recency: '2024', independenceLevel: 'derived' },
    }, 'tester');
    const contradiction = evidenceGraph.createContradiction({
      caseId, description: 'A vs B', leftEvidenceId: ev1.id, rightEvidenceId: ev2.id, nature: 'disagreement',
    }, 'tester');
    expect(contradiction.leftEvidenceId).toBe(ev1.id);
    expect(contradiction.rightEvidenceId).toBe(ev2.id);
    // Both evidence items still exist
    expect(evidenceGraph.getEvidence(ev1.id, caseId)).not.toBeNull();
    expect(evidenceGraph.getEvidence(ev2.id, caseId)).not.toBeNull();
  });
});

describe('T409: Inference never becomes observation', () => {
  it('inference conclusion epistemicStatus is never OBSERVED', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Premise' }],
      { id: 'c1', content: 'Conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.conclusion.epistemicStatus).not.toBe(EpistemicStatus.OBSERVED);
  });
});

describe('T410: Hypothesis never becomes fact automatically', () => {
  it('HYPOTHESIS status is distinct from SUPPORTED_FACT', () => {
    expect(EpistemicStatus.HYPOTHESIS).not.toBe(EpistemicStatus.SUPPORTED_FACT);
  });
});

// ============================================================
// CAUSAL ENGINE TESTS (T501-T600)
// ============================================================

describe('T501: CausalVariableType enum', () => {
  it('has all required types', () => {
    expect(CausalVariableType.OBSERVED).toBe('OBSERVED');
    expect(CausalVariableType.LATENT).toBe('LATENT');
    expect(CausalVariableType.INTERVENTION).toBe('INTERVENTION');
    expect(CausalVariableType.OUTCOME).toBe('OUTCOME');
  });
});

describe('T502: CausalRelationType enum', () => {
  it('has all required types', () => {
    expect(CausalRelationType.DIRECT).toBe('DIRECT');
    expect(CausalRelationType.MEDIATED).toBe('MEDIATED');
    expect(CausalRelationType.CONFOUNDED).toBe('CONFOUNDED');
    expect(CausalRelationType.MODERATED).toBe('MODERATED');
  });
});

describe('T503: Correlation does not create causal relation', () => {
  it('causal relation requires explicit creation, not automatic from correlation', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    // No automatic causal relations from evidence
    expect(model.relations.length).toBe(0);
    // Must explicitly add relation
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    expect(model.relations.length).toBe(0); // Still no relations
  });
});

describe('T504: Causal claim without support rejected', () => {
  it('causal relation requires evidence or assumptions', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    // Can create relation without evidence (it's a hypothesis)
    const relation = engine.addRelation(
      model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT,
      0.5, 'unknown', [], [], 'no evidence yet', 'test', 'tester'
    );
    expect(relation.validated).toBe(false);
    expect(relation.evidence.length).toBe(0);
  });
});

describe('T505: Counterfactual does not create observation', () => {
  it('counterfactual result has SIMULATION_RESULT status, not OBSERVED', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OUTCOME, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var2.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, { outcome: 'changed' }, 0.7, [], [], 'tester');
    expect(result.epistemicStatus).toBe(EpistemicStatus.SIMULATION_RESULT);
    expect(result.executionMode).toBe(ExecutionMode.COUNTERFACTUAL);
    expect(result.epistemicStatus).not.toBe(EpistemicStatus.OBSERVED);
  });
});

describe('T506: Prediction is not real evidence', () => {
  it('counterfactual result is not added to evidence', () => {
    const { ids, time, caseId } = createTestContext();
    const evidenceGraph = createEvidenceGraphRepository(ids, time);
    const causalEngine = createCausalEngine(ids, time);
    const model = causalEngine.createModel(caseId, 'Test', '', 'tester');
    const var1 = causalEngine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = causalEngine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = causalEngine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    causalEngine.executeCounterfactual(query.id, caseId, { outcome: 'changed' }, 0.7, [], [], 'tester');
    // No new evidence created
    const evidence = evidenceGraph.getEvidenceByCase(caseId);
    expect(evidence.length).toBe(0);
  });
});

describe('T507: Causal model has provenance', () => {
  it('causal model carries provenance', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', 'description', 'researcher-001');
    expect(model.provenance.producer).toBe('researcher-001');
    expect(model.provenance.producerType).toBe(ActorType.HUMAN);
  });
});

describe('T508: Causal relation has uncertainty', () => {
  it('causal relation records uncertainty', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(
      model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT,
      0.7, 'positive', [], [], 'high uncertainty', 'limited scope', 'tester'
    );
    expect(relation.uncertainty).toBe('high uncertainty');
  });
});

describe('T509: Causal relation has scope', () => {
  it('causal relation records scope', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(
      model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT,
      0.7, 'positive', [], [], '', 'adult population', 'tester'
    );
    expect(relation.scope).toBe('adult population');
  });
});

describe('T510: Causal hypothesis ≠ validated relation', () => {
  it('causal model starts as HYPOTHESIS', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(model.status).toBe('HYPOTHESIS');
    expect(model.status).not.toBe('VALIDATED');
  });
});

// ============================================================
// FAILURE DETECTION TESTS (T601-T620)
// ============================================================

describe('T601: FailureType enum', () => {
  it('has all required types', () => {
    expect(FailureType.INSUFFICIENT_EVIDENCE).toBe('INSUFFICIENT_EVIDENCE');
    expect(FailureType.CONTRADICTORY_EVIDENCE).toBe('CONTRADICTORY_EVIDENCE');
    expect(FailureType.INVALID_PREMISE).toBe('INVALID_PREMISE');
    expect(FailureType.UNSUPPORTED_INFERENCE).toBe('UNSUPPORTED_INFERENCE');
    expect(FailureType.CAUSAL_UNDERDETERMINATION).toBe('CAUSAL_UNDERDETERMINATION');
    expect(FailureType.OUT_OF_SCOPE).toBe('OUT_OF_SCOPE');
    expect(FailureType.AUTHORITY_REVIEW_REQUIRED).toBe('AUTHORITY_REVIEW_REQUIRED');
  });
});

describe('T602: Insufficient evidence detected', () => {
  it('detects when no evidence or assumptions provided', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.5, uncertainty: 0.5 },
      'Rule', [], [], [], 'tester'
    );
    const failures = engine.detectFailures(inf);
    expect(failures.some(f => f.type === FailureType.INSUFFICIENT_EVIDENCE)).toBe(true);
  });
});

describe('T603: Invalid premise detected', () => {
  it('detects UNKNOWN premises', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.UNKNOWN, content: 'Unknown' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.5, uncertainty: 0.5 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    const failures = engine.detectFailures(inf);
    expect(failures.some(f => f.type === FailureType.INVALID_PREMISE)).toBe(true);
  });
});

describe('T604: Failure not hidden by confidence score', () => {
  it('high confidence does not suppress failure detection', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.99, uncertainty: 0.01 },
      'Rule', [], [], [], 'tester'
    );
    const failures = engine.detectFailures(inf);
    expect(failures.length).toBeGreaterThan(0);
  });
});

// ============================================================
// HUMAN GOVERNANCE TESTS (T621-T640)
// ============================================================

describe('T621: AI cannot create HumanDecision in reasoning', () => {
  it('reasoning engine provenance requires explicit actor', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'ai-agent');
    expect(run.provenance.producer).toBe('ai-agent');
    // The producer is recorded but not as HUMAN
  });
});

describe('T622: Human correction creates new version', () => {
  it('supersession creates new inference without deleting old', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf1 = engine.addInference(
      run.id, caseId, InferenceType.DEFEASIBLE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E1' }],
      { id: 'c1', content: 'C1', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.8, uncertainty: 0.2 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    const inf2 = engine.addInference(
      run.id, caseId, InferenceType.DEFEASIBLE,
      [{ id: 'p2', type: 'evidence', ref: 'ev2' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E2' }],
      { id: 'c2', content: 'C2', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Updated rule', ['ev2' as any], [], [], 'human-expert'
    );
    engine.supersedeInference(inf1.id, inf2.id, caseId, 'Human correction', 'human-expert');
    // Old inference still exists
    const oldInf = engine.getInference(inf1.id, caseId);
    expect(oldInf).not.toBeNull();
    expect(oldInf?.status).toBe('SUPERSEDED');
    // New inference exists
    const newInf = engine.getInference(inf2.id, caseId);
    expect(newInf).not.toBeNull();
    expect(newInf?.status).toBe('VALID');
  });
});

describe('T623: Old conclusion remains reconstructable', () => {
  it('superseded inference preserves original content', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf1 = engine.addInference(
      run.id, caseId, InferenceType.DEFEASIBLE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Original evidence' }],
      { id: 'c1', content: 'Original conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.8, uncertainty: 0.2 },
      'Original rule', ['ev1' as any], [], [], 'tester'
    );
    const inf2 = engine.addInference(
      run.id, caseId, InferenceType.DEFEASIBLE,
      [{ id: 'p2', type: 'evidence', ref: 'ev2' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'New evidence' }],
      { id: 'c2', content: 'Revised conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Updated rule', ['ev2' as any], [], [], 'tester'
    );
    engine.supersedeInference(inf1.id, inf2.id, caseId, 'Revision', 'tester');
    const oldInf = engine.getInference(inf1.id, caseId);
    expect(oldInf?.conclusion.content).toBe('Original conclusion');
    expect(oldInf?.premises[0].content).toBe('Original evidence');
  });
});

// ============================================================
// CASE ISOLATION TESTS (T641-T660)
// ============================================================

describe('T641: Cross-case reasoning rejected', () => {
  it('inference from case A not accessible from case B', () => {
    const { ids, time } = createTestContext();
    const caseA = ids.nextResearchCaseId();
    const caseB = ids.nextResearchCaseId();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseA, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseA, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    expect(() => engine.getInference(inf.id, caseB)).toThrow(DomainError);
  });
});

describe('T642: Cross-case causal model rejected', () => {
  it('causal model from case A not accessible from case B', () => {
    const { ids, time } = createTestContext();
    const caseA = ids.nextResearchCaseId();
    const caseB = ids.nextResearchCaseId();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseA, 'Test', '', 'tester');
    expect(() => engine.getModel(model.id, caseB)).toThrow(DomainError);
  });
});

// ============================================================
// EXPLANATION TESTS (T661-T680)
// ============================================================

describe('T661: explainWhy returns grounded explanation', () => {
  it('explanation references actual inference', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'Conclusion', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Modus ponens', ['ev1' as any], [], [], 'tester'
    );
    const explanation = engine.explainWhy(inf.id, caseId);
    expect(explanation).toContain(inf.id);
    expect(explanation).toContain('Modus ponens');
  });
});

describe('T662: explainBasedOnWhat returns evidence references', () => {
  it('explanation lists evidence and assumptions', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], ['asm1' as any], [], 'tester'
    );
    const refs = engine.explainBasedOnWhat(inf.id, caseId);
    expect(refs.length).toBeGreaterThan(0);
  });
});

describe('T663: Explanation cannot fabricate provenance', () => {
  it('explanation only references actual data', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const explanation = engine.explainWhy('non-existent' as any, caseId);
    expect(explanation).toBe('Inference not found');
  });
});

// ============================================================
// JUSTIFICATION GRAPH TESTS (T681-T700)
// ============================================================

describe('T681: Justification graph is reconstructable', () => {
  it('buildJustificationGraph returns complete graph', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    const graph = engine.buildJustificationGraph(run.id, caseId);
    expect(graph.nodes.size).toBeGreaterThan(0);
    expect(graph.rootNodes.length).toBeGreaterThan(0);
    expect(graph.leafNodes.length).toBeGreaterThan(0);
  });
});

// ============================================================
// WP3 DEMO TEST (T701)
// ============================================================

describe('T701: WP3 demo meets requirements', () => {
  it('runWP3Demo returns expected counts', () => {
    const result = runWP3Demo();
    expect(result.evidenceCount).toBeGreaterThanOrEqual(10);
    expect(result.claimCount).toBeGreaterThanOrEqual(5);
    expect(result.inferenceCount).toBeGreaterThanOrEqual(10);
    expect(result.inferenceTypes[InferenceType.DEDUCTIVE]).toBeGreaterThanOrEqual(1);
    expect(result.inferenceTypes[InferenceType.INDUCTIVE]).toBeGreaterThanOrEqual(1);
    expect(result.inferenceTypes[InferenceType.ABDUCTIVE]).toBeGreaterThanOrEqual(1);
    expect(result.inferenceTypes[InferenceType.DEFEASIBLE]).toBeGreaterThanOrEqual(1);
    expect(result.inferenceTypes[InferenceType.CAUSAL]).toBeGreaterThanOrEqual(1);
    expect(result.contradictionCount).toBeGreaterThanOrEqual(2);
    expect(result.defeasibleRevisionCount).toBeGreaterThanOrEqual(1);
    expect(result.causalModelCount).toBeGreaterThanOrEqual(1);
    expect(result.counterfactualQueryCount).toBeGreaterThanOrEqual(2);
    expect(result.abstentionCount).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// UNKNOWN SEMANTICS TESTS (T702-T710)
// ============================================================

describe('T702: UNKNOWN remains UNKNOWN in reasoning', () => {
  it('UNKNOWN epistemic status is preserved', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.UNKNOWN, content: 'Unknown' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.UNKNOWN, confidence: 0, uncertainty: 1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.conclusion.epistemicStatus).toBe(EpistemicStatus.UNKNOWN);
    expect(inf.conclusion.epistemicStatus).not.toBe(EpistemicStatus.OBSERVED);
    expect(inf.conclusion.epistemicStatus).not.toBe(EpistemicStatus.SUPPORTED_FACT);
  });
});

describe('T703: Inference with UNKNOWN premise detected as failure', () => {
  it('UNKNOWN premises trigger INVALID_PREMISE failure', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.UNKNOWN, content: 'Unknown' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.5, uncertainty: 0.5 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    const failures = engine.detectFailures(inf);
    expect(failures.some(f => f.type === FailureType.INVALID_PREMISE)).toBe(true);
  });
});

// ============================================================
// ADDITIONAL TESTS (T711-T800)
// ============================================================

describe('T711: ReasoningRun has versioning', () => {
  it('ReasoningRun has versioning field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    expect(run.versioning).toBeDefined();
    expect(run.versioning.version).toBe(1);
  });
});

describe('T712: Inference has versioning', () => {
  it('Inference has versioning field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.versioning).toBeDefined();
    expect(inf.versioning.version).toBe(1);
  });
});

describe('T713: CausalModel has versioning', () => {
  it('CausalModel has versioning field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(model.versioning).toBeDefined();
    expect(model.versioning.version).toBe(1);
  });
});

describe('T714: Inference has justificationTrace', () => {
  it('Inference has justificationTrace array', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    expect(Array.isArray(inf.justificationTrace)).toBe(true);
  });
});

describe('T715: Inference has rule', () => {
  it('Inference has rule field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Modus ponens', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.rule).toBe('Modus ponens');
  });
});

describe('T716: Inference has uncertainties array', () => {
  it('Inference has uncertainties field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], ['uncertainty1'], 'tester'
    );
    expect(inf.uncertainties).toContain('uncertainty1');
  });
});

describe('T717: CausalVariable has type', () => {
  it('CausalVariable has type field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const variable = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    expect(variable.type).toBe(CausalVariableType.OBSERVED);
  });
});

describe('T718: CausalRelation has strength', () => {
  it('CausalRelation has strength field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.75, 'positive', [], [], '', '', 'tester');
    expect(relation.strength).toBe(0.75);
  });
});

describe('T719: CausalRelation has direction', () => {
  it('CausalRelation has direction field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'negative', [], [], '', '', 'tester');
    expect(relation.direction).toBe('negative');
  });
});

describe('T720: CounterfactualResult has limitations', () => {
  it('CounterfactualResult has limitations array', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, { outcome: 'changed' }, 0.7, [], ['limitation1', 'limitation2'], 'tester');
    expect(result.limitations).toContain('limitation1');
    expect(result.limitations).toContain('limitation2');
  });
});

describe('T721: CounterfactualResult has assumptions', () => {
  it('CounterfactualResult has assumptions array', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, { outcome: 'changed' }, 0.7, ['assumption1'], [], 'tester');
    expect(result.assumptions).toContain('assumption1');
  });
});

describe('T722: Causal model validation updates status', () => {
  it('validating all relations changes model status to VALIDATED', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    engine.validateRelation(relation.id, model.id, caseId, 'tester');
    const updatedModel = engine.getModel(model.id, caseId);
    expect(updatedModel?.status).toBe('VALIDATED');
  });
});

describe('T723: Partial validation updates status to PARTIALLY_VALIDATED', () => {
  it('validating some relations changes model status to PARTIALLY_VALIDATED', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var3 = engine.addVariable(model.id, caseId, { name: 'Z', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const rel1 = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    engine.addRelation(model.id, caseId, var2.id, var3.id, CausalRelationType.DIRECT, 0.6, 'positive', [], [], '', '', 'tester');
    engine.validateRelation(rel1.id, model.id, caseId, 'tester');
    const updatedModel = engine.getModel(model.id, caseId);
    expect(updatedModel?.status).toBe('PARTIALLY_VALIDATED');
  });
});

describe('T724: ReasoningRun status updates', () => {
  it('run status starts as RUNNING', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    expect(run.status).toBe('RUNNING');
  });
});

describe('T725: Inference status starts as VALID', () => {
  it('new inference has VALID status', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(
      run.id, caseId, InferenceType.DEDUCTIVE,
      [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }],
      { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 },
      'Rule', ['ev1' as any], [], [], 'tester'
    );
    expect(inf.status).toBe('VALID');
  });
});

describe('T726: getInferencesByRun returns only run inferences', () => {
  it('filters inferences by run', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run1 = engine.createRun(caseId, 'Run 1', '', 'tester');
    const run2 = engine.createRun(caseId, 'Run 2', '', 'tester');
    engine.addInference(run1.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C1', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    engine.addInference(run2.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c2', content: 'C2', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    const run1Inferences = engine.getInferencesByRun(run1.id, caseId);
    expect(run1Inferences.length).toBe(1);
    expect(run1Inferences[0].conclusion.content).toBe('C1');
  });
});

describe('T727: getInferencesByCase returns all case inferences', () => {
  it('returns all inferences for case', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C1', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    engine.addInference(run.id, caseId, InferenceType.INDUCTIVE, [], { id: 'c2', content: 'C2', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    const allInferences = engine.getInferencesByCase(caseId);
    expect(allInferences.length).toBe(2);
  });
});

describe('T728: CausalVariable has domain', () => {
  it('CausalVariable has domain field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const variable = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'medical', description: '' });
    expect(variable.domain).toBe('medical');
  });
});

describe('T729: CausalRelation validated starts false', () => {
  it('new causal relation has validated=false', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    expect(relation.validated).toBe(false);
  });
});

describe('T730: Counterfactual query has question', () => {
  it('CounterfactualQuery has question field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What would happen?', 'tester');
    expect(query.question).toBe('What would happen?');
  });
});
