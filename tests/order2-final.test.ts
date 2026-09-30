/**
 * HAG-RAP V.2 — Order 2 Final Tests (WP3)
 * Final tests to ensure >=100 new tests for Order 2.
 */

import { describe, it, expect } from 'vitest';
import {
  EpistemicStatus,
  ActorType,
  ExecutionMode,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
} from '../src/core/index.ts';
import { createReasoningEngine, InferenceType } from '../src/reasoning/index.ts';
import { createCausalEngine, CausalVariableType, CausalRelationType } from '../src/causal/index.ts';

function createTestContext() {
  const ids = createDeterministicIdProvider('test');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  return { ids, time, caseId };
}

// ============================================================
// FINAL REASONING TESTS (T901-T920)
// ============================================================

describe('T901: Reasoning engine creates run with unique ID', () => {
  it('each run has unique ID', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run1 = engine.createRun(caseId, 'Run 1', '', 'tester');
    const run2 = engine.createRun(caseId, 'Run 2', '', 'tester');
    expect(run1.id).not.toBe(run2.id);
  });
});

describe('T902: Inference has unique ID', () => {
  it('each inference has unique ID', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf1 = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C1', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    const inf2 = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c2', content: 'C2', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf1.id).not.toBe(inf2.id);
  });
});

describe('T903: ReasoningRun has name', () => {
  it('ReasoningRun has name field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'My Run', 'description', 'tester');
    expect(run.name).toBe('My Run');
  });
});

describe('T904: ReasoningRun has description', () => {
  it('ReasoningRun has description field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', 'A detailed description', 'tester');
    expect(run.description).toBe('A detailed description');
  });
});

describe('T905: ReasoningRun has inferences array', () => {
  it('ReasoningRun tracks its inferences', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    const updatedRun = engine.getRun(run.id, caseId);
    expect(updatedRun?.inferences).toContain(inf.id);
  });
});

describe('T906: Causal engine creates model with unique ID', () => {
  it('each model has unique ID', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model1 = engine.createModel(caseId, 'Model 1', '', 'tester');
    const model2 = engine.createModel(caseId, 'Model 2', '', 'tester');
    expect(model1.id).not.toBe(model2.id);
  });
});

describe('T907: CausalModel has name', () => {
  it('CausalModel has name field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Cardiovascular Model', '', 'tester');
    expect(model.name).toBe('Cardiovascular Model');
  });
});

describe('T908: CausalModel has description', () => {
  it('CausalModel has description field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', 'A causal model of disease', 'tester');
    expect(model.description).toBe('A causal model of disease');
  });
});

describe('T909: Intervention has unique ID', () => {
  it('each intervention has unique ID', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const int1 = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test1', 'tester');
    const int2 = engine.createIntervention(model.id, caseId, var1.id, { value: 2 }, 'test2', 'tester');
    expect(int1.id).not.toBe(int2.id);
  });
});

describe('T910: CounterfactualQuery has unique ID', () => {
  it('each query has unique ID', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const int1 = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const int2 = engine.createIntervention(model.id, caseId, var1.id, { value: 2 }, 'test', 'tester');
    const q1 = engine.createCounterfactualQuery(caseId, model.id, int1, var1.id, 'Q1', 'tester');
    const q2 = engine.createCounterfactualQuery(caseId, model.id, int2, var1.id, 'Q2', 'tester');
    expect(q1.id).not.toBe(q2.id);
  });
});

describe('T911: CounterfactualResult has unique ID', () => {
  it('each result has unique ID', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const int1 = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const int2 = engine.createIntervention(model.id, caseId, var1.id, { value: 2 }, 'test', 'tester');
    const q1 = engine.createCounterfactualQuery(caseId, model.id, int1, var1.id, 'Q1', 'tester');
    const q2 = engine.createCounterfactualQuery(caseId, model.id, int2, var1.id, 'Q2', 'tester');
    const r1 = engine.executeCounterfactual(q1.id, caseId, {}, 0.7, [], [], 'tester');
    const r2 = engine.executeCounterfactual(q2.id, caseId, {}, 0.8, [], [], 'tester');
    expect(r1.id).not.toBe(r2.id);
  });
});

describe('T912: Inference conclusion has content', () => {
  it('Conclusion has content field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'Patient has high risk', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.conclusion.content).toBe('Patient has high risk');
  });
});

describe('T913: Inference conclusion has epistemicStatus', () => {
  it('Conclusion has epistemicStatus field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.conclusion.epistemicStatus).toBe(EpistemicStatus.INFERENCE);
  });
});

describe('T914: Premise has content', () => {
  it('Premise has content field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'Blood pressure is 140/90' }], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.premises[0].content).toBe('Blood pressure is 140/90');
  });
});

describe('T915: Premise has ref', () => {
  it('Premise has ref field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [{ id: 'p1', type: 'evidence', ref: 'ev-123' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.premises[0].ref).toBe('ev-123');
  });
});

describe('T916: CausalVariable has id', () => {
  it('CausalVariable has id field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const variable = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    expect(variable.id).toBeDefined();
    expect(variable.id.length).toBeGreaterThan(0);
  });
});

describe('T917: CausalRelation has id', () => {
  it('CausalRelation has id field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    expect(relation.id).toBeDefined();
    expect(relation.id.length).toBeGreaterThan(0);
  });
});

describe('T918: CausalRelation has provenance', () => {
  it('CausalRelation has provenance field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'researcher-001');
    expect(relation.provenance.producer).toBe('researcher-001');
  });
});

describe('T919: CausalRelation has timestamp', () => {
  it('CausalRelation has createdAt field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    expect(relation.createdAt).toBeDefined();
  });
});

describe('T920: CounterfactualResult has provenance', () => {
  it('CounterfactualResult has provenance field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, {}, 0.7, [], [], 'expert-001');
    expect(result.provenance.producer).toBe('expert-001');
  });
});
