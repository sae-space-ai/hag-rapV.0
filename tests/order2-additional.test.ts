/**
 * HAG-RAP V.2 — Order 2 Additional Tests (WP3)
 * Additional tests to reach >=100 new tests for Order 2.
 */

import { describe, it, expect } from 'vitest';
import {
  EpistemicStatus,
  ActorType,
  ExecutionMode,
  createDeterministicIdProvider,
  createDeterministicTimeProvider,
  DomainError,
} from '../src/core/index.ts';
import { createReasoningEngine, InferenceType, FailureType } from '../src/reasoning/index.ts';
import { createCausalEngine, CausalVariableType, CausalRelationType } from '../src/causal/index.ts';

function createTestContext() {
  const ids = createDeterministicIdProvider('test');
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();
  return { ids, time, caseId };
}

// ============================================================
// ADDITIONAL REASONING TESTS (T801-T850)
// ============================================================

describe('T801: ReasoningRun has timestamps', () => {
  it('ReasoningRun has createdAt and updatedAt', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    expect(run.createdAt).toBeDefined();
    expect(run.updatedAt).toBeDefined();
  });
});

describe('T802: Inference has timestamps', () => {
  it('Inference has createdAt and updatedAt', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.createdAt).toBeDefined();
    expect(inf.updatedAt).toBeDefined();
  });
});

describe('T803: Inference has reasoningRunId', () => {
  it('Inference references its run', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.reasoningRunId).toBe(run.id);
  });
});

describe('T804: Inference has caseId', () => {
  it('Inference has caseId field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.caseId).toBe(caseId);
  });
});

describe('T805: Inference has assumptions array', () => {
  it('Inference has assumptions field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], ['asm1' as any], [], 'tester');
    expect(inf.assumptions).toContain('asm1');
  });
});

describe('T806: Inference has evidence array', () => {
  it('Inference has evidence field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', ['ev1' as any], [], [], 'tester');
    expect(inf.evidence).toContain('ev1');
  });
});

describe('T807: Conclusion has confidence', () => {
  it('Conclusion has confidence field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.85, uncertainty: 0.15 }, 'Rule', [], [], [], 'tester');
    expect(inf.conclusion.confidence).toBe(0.85);
  });
});

describe('T808: Conclusion has uncertainty', () => {
  it('Conclusion has uncertainty field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.85, uncertainty: 0.15 }, 'Rule', [], [], [], 'tester');
    expect(inf.conclusion.uncertainty).toBe(0.15);
  });
});

describe('T809: Premise has type', () => {
  it('Premise has type field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.premises[0].type).toBe('evidence');
  });
});

describe('T810: Premise has epistemicStatus', () => {
  it('Premise has epistemicStatus field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], [], [], 'tester');
    expect(inf.premises[0].epistemicStatus).toBe(EpistemicStatus.OBSERVED);
  });
});

// ============================================================
// ADDITIONAL CAUSAL TESTS (T851-T900)
// ============================================================

describe('T851: CausalModel has timestamps', () => {
  it('CausalModel has createdAt and updatedAt', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(model.createdAt).toBeDefined();
    expect(model.updatedAt).toBeDefined();
  });
});

describe('T852: CausalModel has caseId', () => {
  it('CausalModel has caseId field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(model.caseId).toBe(caseId);
  });
});

describe('T853: CausalModel has variables array', () => {
  it('CausalModel has variables field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(Array.isArray(model.variables)).toBe(true);
  });
});

describe('T854: CausalModel has relations array', () => {
  it('CausalModel has relations field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(Array.isArray(model.relations)).toBe(true);
  });
});

describe('T855: CausalModel has status', () => {
  it('CausalModel has status field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    expect(model.status).toBeDefined();
  });
});

describe('T856: CausalVariable has name', () => {
  it('CausalVariable has name field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const variable = engine.addVariable(model.id, caseId, { name: 'Blood Pressure', type: CausalVariableType.OBSERVED, domain: 'medical', description: '' });
    expect(variable.name).toBe('Blood Pressure');
  });
});

describe('T857: CausalVariable has description', () => {
  it('CausalVariable has description field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const variable = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: 'Test variable' });
    expect(variable.description).toBe('Test variable');
  });
});

describe('T858: CausalRelation has sourceId', () => {
  it('CausalRelation has sourceId field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    expect(relation.sourceId).toBe(var1.id);
  });
});

describe('T859: CausalRelation has targetId', () => {
  it('CausalRelation has targetId field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    expect(relation.targetId).toBe(var2.id);
  });
});

describe('T860: CausalRelation has type', () => {
  it('CausalRelation has type field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const relation = engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.MEDIATED, 0.7, 'positive', [], [], '', '', 'tester');
    expect(relation.type).toBe(CausalRelationType.MEDIATED);
  });
});

describe('T861: Intervention has modelId', () => {
  it('Intervention references its model', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    expect(intervention.modelId).toBe(model.id);
  });
});

describe('T862: Intervention has variableId', () => {
  it('Intervention references its variable', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    expect(intervention.variableId).toBe(var1.id);
  });
});

describe('T863: Intervention has value', () => {
  it('Intervention has value field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 42 }, 'test', 'tester');
    expect(intervention.value).toEqual({ value: 42 });
  });
});

describe('T864: Intervention has description', () => {
  it('Intervention has description field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'Reduce X', 'tester');
    expect(intervention.description).toBe('Reduce X');
  });
});

describe('T865: CounterfactualQuery has modelId', () => {
  it('CounterfactualQuery references its model', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    expect(query.modelId).toBe(model.id);
  });
});

describe('T866: CounterfactualQuery has intervention', () => {
  it('CounterfactualQuery has intervention field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    expect(query.intervention).toBe(intervention);
  });
});

describe('T867: CounterfactualQuery has targetVariableId', () => {
  it('CounterfactualQuery has targetVariableId field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    expect(query.targetVariableId).toBe(var1.id);
  });
});

describe('T868: CounterfactualResult has predictedOutcome', () => {
  it('CounterfactualResult has predictedOutcome field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, { outcome: 'increased' }, 0.7, [], [], 'tester');
    expect(result.predictedOutcome).toEqual({ outcome: 'increased' });
  });
});

describe('T869: CounterfactualResult has confidence', () => {
  it('CounterfactualResult has confidence field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, {}, 0.85, [], [], 'tester');
    expect(result.confidence).toBe(0.85);
  });
});

describe('T870: CounterfactualResult has executionMode', () => {
  it('CounterfactualResult has executionMode field', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const intervention = engine.createIntervention(model.id, caseId, var1.id, { value: 1 }, 'test', 'tester');
    const query = engine.createCounterfactualQuery(caseId, model.id, intervention, var1.id, 'What if?', 'tester');
    const result = engine.executeCounterfactual(query.id, caseId, {}, 0.7, [], [], 'tester');
    expect(result.executionMode).toBe(ExecutionMode.COUNTERFACTUAL);
  });
});

describe('T871: getModelsByCase returns all models', () => {
  it('returns all models for case', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    engine.createModel(caseId, 'Model 1', '', 'tester');
    engine.createModel(caseId, 'Model 2', '', 'tester');
    const models = engine.getModelsByCase(caseId);
    expect(models.length).toBe(2);
  });
});

describe('T872: getVariables returns all variables', () => {
  it('returns all variables for model', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const variables = engine.getVariables(model.id, caseId);
    expect(variables.length).toBe(2);
  });
});

describe('T873: getRelations returns all relations', () => {
  it('returns all relations for model', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createCausalEngine(ids, time);
    const model = engine.createModel(caseId, 'Test', '', 'tester');
    const var1 = engine.addVariable(model.id, caseId, { name: 'X', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var2 = engine.addVariable(model.id, caseId, { name: 'Y', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    const var3 = engine.addVariable(model.id, caseId, { name: 'Z', type: CausalVariableType.OBSERVED, domain: 'test', description: '' });
    engine.addRelation(model.id, caseId, var1.id, var2.id, CausalRelationType.DIRECT, 0.7, 'positive', [], [], '', '', 'tester');
    engine.addRelation(model.id, caseId, var2.id, var3.id, CausalRelationType.DIRECT, 0.6, 'positive', [], [], '', '', 'tester');
    const relations = engine.getRelations(model.id, caseId);
    expect(relations.length).toBe(2);
  });
});

describe('T874: explainWhichAssumptions returns assumptions', () => {
  it('returns assumption IDs', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', [], ['asm1' as any, 'asm2' as any], [], 'tester');
    const assumptions = engine.explainWhichAssumptions(inf.id, caseId);
    expect(assumptions.length).toBe(2);
  });
});

describe('T875: explainWhatWouldChange returns string', () => {
  it('returns explanation string', () => {
    const { ids, time, caseId } = createTestContext();
    const engine = createReasoningEngine(ids, time);
    const run = engine.createRun(caseId, 'Test', '', 'tester');
    const inf = engine.addInference(run.id, caseId, InferenceType.DEDUCTIVE, [{ id: 'p1', type: 'evidence', ref: 'ev1' as any, epistemicStatus: EpistemicStatus.OBSERVED, content: 'E' }], { id: 'c1', content: 'C', epistemicStatus: EpistemicStatus.INFERENCE, confidence: 0.9, uncertainty: 0.1 }, 'Rule', ['ev1' as any], [], [], 'tester');
    const explanation = engine.explainWhatWouldChange(inf.id, caseId);
    expect(typeof explanation).toBe('string');
  });
});
