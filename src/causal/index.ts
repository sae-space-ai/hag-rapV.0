/**
 * HAG-RAP V.2 — Causal Engine (WP3)
 * Causal modeling, interventions, and counterfactuals.
 * CORRELATION ≠ CAUSATION. COUNTERFACTUAL ≠ OBSERVATION.
 */

import {
  ResearchCaseId,
  EvidenceId,
  AssumptionId,
  CausalModelId,
  EpistemicStatus,
  ExecutionMode,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// CAUSAL VARIABLE
// ============================================================

export enum CausalVariableType {
  OBSERVED = 'OBSERVED',
  LATENT = 'LATENT',
  INTERVENTION = 'INTERVENTION',
  OUTCOME = 'OUTCOME',
}

export interface CausalVariable {
  id: string;
  name: string;
  type: CausalVariableType;
  domain: string;
  description: string;
}

// ============================================================
// CAUSAL RELATION
// ============================================================

export enum CausalRelationType {
  DIRECT = 'DIRECT',
  MEDIATED = 'MEDIATED',
  CONFOUNDED = 'CONFOUNDED',
  MODERATED = 'MODERATED',
}

export interface CausalRelation {
  id: string;
  sourceId: string; // CausalVariable ID
  targetId: string; // CausalVariable ID
  type: CausalRelationType;
  strength: number; // 0-1
  direction: 'positive' | 'negative' | 'unknown';
  evidence: EvidenceId[];
  assumptions: AssumptionId[];
  uncertainty: string;
  scope: string;
  validated: boolean;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// CAUSAL MODEL
// ============================================================

export interface CausalModel {
  id: CausalModelId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  variables: CausalVariable[];
  relations: CausalRelation[];
  status: 'HYPOTHESIS' | 'PARTIALLY_VALIDATED' | 'VALIDATED' | 'CONTESTED';
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// INTERVENTION
// ============================================================

export interface Intervention {
  id: string;
  modelId: CausalModelId;
  variableId: string;
  value: unknown;
  description: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// COUNTERFACTUAL QUERY
// ============================================================

export interface CounterfactualQuery {
  id: string;
  caseId: ResearchCaseId;
  modelId: CausalModelId;
  intervention: Intervention;
  targetVariableId: string;
  question: string;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// COUNTERFACTUAL RESULT
// ============================================================

export interface CounterfactualResult {
  id: string;
  queryId: string;
  predictedOutcome: unknown;
  confidence: number;
  epistemicStatus: EpistemicStatus.SIMULATION_RESULT; // Always SIMULATION_RESULT, never OBSERVED
  executionMode: ExecutionMode.COUNTERFACTUAL; // Always COUNTERFACTUAL
  assumptions: string[];
  limitations: string[];
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// CAUSAL ENGINE
// ============================================================

export interface CausalEngine {
  // Causal Models
  createModel(caseId: ResearchCaseId, name: string, description: string, createdBy: string): CausalModel;
  getModel(id: CausalModelId, caseId: ResearchCaseId): CausalModel | null;
  getModelsByCase(caseId: ResearchCaseId): CausalModel[];

  // Variables
  addVariable(modelId: CausalModelId, caseId: ResearchCaseId, variable: Omit<CausalVariable, 'id'>): CausalVariable;
  getVariables(modelId: CausalModelId, caseId: ResearchCaseId): CausalVariable[];

  // Relations
  addRelation(
    modelId: CausalModelId,
    caseId: ResearchCaseId,
    sourceId: string,
    targetId: string,
    type: CausalRelationType,
    strength: number,
    direction: 'positive' | 'negative' | 'unknown',
    evidence: EvidenceId[],
    assumptions: AssumptionId[],
    uncertainty: string,
    scope: string,
    createdBy: string,
  ): CausalRelation;
  getRelations(modelId: CausalModelId, caseId: ResearchCaseId): CausalRelation[];

  // Interventions
  createIntervention(modelId: CausalModelId, caseId: ResearchCaseId, variableId: string, value: unknown, description: string, createdBy: string): Intervention;

  // Counterfactuals
  createCounterfactualQuery(
    caseId: ResearchCaseId,
    modelId: CausalModelId,
    intervention: Intervention,
    targetVariableId: string,
    question: string,
    createdBy: string,
  ): CounterfactualQuery;
  executeCounterfactual(queryId: string, caseId: ResearchCaseId, predictedOutcome: unknown, confidence: number, assumptions: string[], limitations: string[], executedBy: string): CounterfactualResult;
  getCounterfactualResult(queryId: string, caseId: ResearchCaseId): CounterfactualResult | null;

  // Validation
  validateRelation(relationId: string, modelId: CausalModelId, caseId: ResearchCaseId, validatedBy: string): void;
}

export function createCausalEngine(
  ids: IdProvider,
  time: TimeProvider,
): CausalEngine {
  const models = new Map<CausalModelId, CausalModel>();
  const interventions = new Map<string, Intervention>();
  const queries = new Map<string, CounterfactualQuery>();
  const results = new Map<string, CounterfactualResult>();

  return {
    createModel(caseId, name, description, createdBy): CausalModel {
      const now = time.now();
      const id = ids.nextCausalModelId();
      const provId = ids.nextProvenanceId();
      const model: CausalModel = {
        id,
        caseId,
        name,
        description,
        variables: [],
        relations: [],
        status: 'HYPOTHESIS',
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'causal-model-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      models.set(id, model);
      return model;
    },

    getModel(id, caseId): CausalModel | null {
      const m = models.get(id);
      if (!m) return null;
      if (m.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Model ${id} belongs to case ${m.caseId}, not ${caseId}`);
      }
      return m;
    },

    getModelsByCase(caseId): CausalModel[] {
      return Array.from(models.values()).filter(m => m.caseId === caseId);
    },

    addVariable(modelId, caseId, variable): CausalVariable {
      const model = models.get(modelId);
      if (!model) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Model ${modelId} not found`);
      }
      if (model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Model ${modelId} belongs to case ${model.caseId}, not ${caseId}`);
      }

      const id = `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newVar: CausalVariable = { ...variable, id };
      model.variables.push(newVar);
      model.updatedAt = time.now();
      return newVar;
    },

    getVariables(modelId, caseId): CausalVariable[] {
      const model = this.getModel(modelId, caseId);
      if (!model) return [];
      return model.variables;
    },

    addRelation(modelId, caseId, sourceId, targetId, type, strength, direction, evidence, assumptions, uncertainty, scope, createdBy): CausalRelation {
      const model = models.get(modelId);
      if (!model) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Model ${modelId} not found`);
      }
      if (model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Model ${modelId} belongs to case ${model.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const provId = ids.nextProvenanceId();

      const relation: CausalRelation = {
        id,
        sourceId,
        targetId,
        type,
        strength,
        direction,
        evidence,
        assumptions,
        uncertainty,
        scope,
        validated: false,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'causal-relation-creation',
          version: '1',
          createdAt: now,
          inputs: [...evidence, ...assumptions],
          assumptions: assumptions.map(a => a.toString()),
        },
        createdAt: now,
      };

      model.relations.push(relation);
      model.updatedAt = now;
      return relation;
    },

    getRelations(modelId, caseId): CausalRelation[] {
      const model = this.getModel(modelId, caseId);
      if (!model) return [];
      return model.relations;
    },

    createIntervention(modelId, caseId, variableId, value, description, createdBy): Intervention {
      const model = models.get(modelId);
      if (!model) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Model ${modelId} not found`);
      }
      if (model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Model ${modelId} belongs to case ${model.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const provId = ids.nextProvenanceId();

      const intervention: Intervention = {
        id,
        modelId,
        variableId,
        value,
        description,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'intervention-creation',
          version: '1',
          createdAt: now,
          inputs: [variableId],
          assumptions: [],
        },
        createdAt: now,
      };

      interventions.set(id, intervention);
      return intervention;
    },

    createCounterfactualQuery(caseId, modelId, intervention, targetVariableId, question, createdBy): CounterfactualQuery {
      const model = models.get(modelId);
      if (!model) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Model ${modelId} not found`);
      }
      if (model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Model ${modelId} belongs to case ${model.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = `cfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const provId = ids.nextProvenanceId();

      const query: CounterfactualQuery = {
        id,
        caseId,
        modelId,
        intervention,
        targetVariableId,
        question,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'counterfactual-query-creation',
          version: '1',
          createdAt: now,
          inputs: [intervention.id, targetVariableId],
          assumptions: [],
        },
        createdAt: now,
      };

      queries.set(id, query);
      return query;
    },

    executeCounterfactual(queryId, caseId, predictedOutcome, confidence, assumptions, limitations, executedBy): CounterfactualResult {
      const query = queries.get(queryId);
      if (!query) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Query ${queryId} not found`);
      }
      if (query.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Query ${queryId} belongs to case ${query.caseId}, not ${caseId}`);
      }

      const now = time.now();
      const id = `cfr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const provId = ids.nextProvenanceId();

      const result: CounterfactualResult = {
        id,
        queryId,
        predictedOutcome,
        confidence,
        epistemicStatus: EpistemicStatus.SIMULATION_RESULT, // Always SIMULATION_RESULT
        executionMode: ExecutionMode.COUNTERFACTUAL, // Always COUNTERFACTUAL
        assumptions,
        limitations,
        provenance: {
          id: provId,
          producer: executedBy,
          producerType: ActorType.HUMAN,
          method: 'counterfactual-execution',
          version: '1',
          createdAt: now,
          inputs: [queryId],
          assumptions,
        },
        createdAt: now,
      };

      results.set(queryId, result);
      return result;
    },

    getCounterfactualResult(queryId, caseId): CounterfactualResult | null {
      const result = results.get(queryId);
      if (!result) return null;
      const query = queries.get(queryId);
      if (!query) return null;
      if (query.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Result for query ${queryId} belongs to case ${query.caseId}, not ${caseId}`);
      }
      return result;
    },

    validateRelation(relationId, modelId, caseId, validatedBy): void {
      const model = models.get(modelId);
      if (!model) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Model ${modelId} not found`);
      }
      if (model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Model ${modelId} belongs to case ${model.caseId}, not ${caseId}`);
      }

      const relation = model.relations.find(r => r.id === relationId);
      if (!relation) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Relation ${relationId} not found`);
      }

      relation.validated = true;
      model.updatedAt = time.now();

      // Update model status if all relations are validated
      if (model.relations.every(r => r.validated)) {
        model.status = 'VALIDATED';
      } else if (model.relations.some(r => r.validated)) {
        model.status = 'PARTIALLY_VALIDATED';
      }
    },
  };
}
