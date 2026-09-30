/**
 * HAG-RAP V.2 — World Model Engine (WP4)
 * World models, states, transitions, disagreements, OOD assessments.
 * INVARIANT: WorldModel references Evidence/Claims/CausalModel, does not duplicate.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ClaimId,
  CausalModelId,
  WorldModelId,
  WorldStateId,
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
// STATE VARIABLE
// ============================================================

export interface StateVariable {
  id: string;
  name: string;
  type: string;
  value: unknown;
  epistemicStatus: EpistemicStatus;
}

// ============================================================
// WORLD STATE
// ============================================================

export interface WorldState {
  id: WorldStateId;
  caseId: ResearchCaseId;
  worldModelId: WorldModelId;
  name: string;
  description: string;
  variables: StateVariable[];
  executionMode: ExecutionMode;
  timestamp: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// TRANSITION
// ============================================================

export interface Transition {
  id: string;
  caseId: ResearchCaseId;
  worldModelId: WorldModelId;
  name: string;
  description: string;
  fromStateId: WorldStateId;
  toStateId: WorldStateId;
  preconditions: string[];
  effects: string[];
  evidenceBasis: EvidenceId[];
  causalBasis?: CausalModelId;
  uncertainty: string;
  scope: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// MODEL DISAGREEMENT
// ============================================================

export interface ModelDisagreement {
  id: string;
  caseId: ResearchCaseId;
  description: string;
  modelIds: WorldModelId[];
  pointOfDisagreement: string;
  evidence: EvidenceId[];
  assumptions: string[];
  uncertainty: string;
  humanReviewRequired: boolean;
  resolved: boolean;
  resolution?: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// OOD ASSESSMENT
// ============================================================

export enum OODStatus {
  IN_DISTRIBUTION = 'IN_DISTRIBUTION',
  POSSIBLE_SHIFT = 'POSSIBLE_SHIFT',
  OUT_OF_DISTRIBUTION = 'OUT_OF_DISTRIBUTION',
  UNKNOWN = 'UNKNOWN',
}

export interface OODAssessment {
  id: string;
  caseId: ResearchCaseId;
  worldModelId: WorldModelId;
  stateId: WorldStateId;
  status: OODStatus;
  indicators: string[];
  rationale: string;
  escalationRequired: boolean;
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// WORLD MODEL
// ============================================================

export interface WorldModel {
  id: WorldModelId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  states: WorldStateId[];
  transitions: string[];
  referencedEvidence: EvidenceId[];
  referencedClaims: ClaimId[];
  referencedCausalModels: CausalModelId[];
  supersededBy?: WorldModelId;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// WORLD MODEL ENGINE REPOSITORY
// ============================================================

export interface WorldModelEngineRepository {
  // World Models
  createWorldModel(
    caseId: ResearchCaseId,
    name: string,
    description: string,
    referencedEvidence: EvidenceId[],
    referencedClaims: ClaimId[],
    referencedCausalModels: CausalModelId[],
    createdBy: string,
  ): WorldModel;
  getWorldModel(id: WorldModelId, caseId: ResearchCaseId): WorldModel | null;
  getWorldModelsByCase(caseId: ResearchCaseId): WorldModel[];
  supersedeWorldModel(oldId: WorldModelId, newId: WorldModelId, caseId: ResearchCaseId, reason: string, supersededBy: string): void;

  // World States
  createWorldState(
    caseId: ResearchCaseId,
    worldModelId: WorldModelId,
    name: string,
    description: string,
    variables: StateVariable[],
    executionMode: ExecutionMode,
    createdBy: string,
  ): WorldState;
  getWorldState(id: WorldStateId, caseId: ResearchCaseId): WorldState | null;
  getWorldStatesByModel(worldModelId: WorldModelId, caseId: ResearchCaseId): WorldState[];

  // Transitions
  createTransition(
    caseId: ResearchCaseId,
    worldModelId: WorldModelId,
    name: string,
    description: string,
    fromStateId: WorldStateId,
    toStateId: WorldStateId,
    preconditions: string[],
    effects: string[],
    evidenceBasis: EvidenceId[],
    causalBasis: CausalModelId | undefined,
    uncertainty: string,
    scope: string,
    createdBy: string,
  ): Transition;
  getTransition(id: string, caseId: ResearchCaseId): Transition | null;
  getTransitionsByModel(worldModelId: WorldModelId, caseId: ResearchCaseId): Transition[];

  // Model Disagreements
  createModelDisagreement(
    caseId: ResearchCaseId,
    description: string,
    modelIds: WorldModelId[],
    pointOfDisagreement: string,
    evidence: EvidenceId[],
    assumptions: string[],
    uncertainty: string,
    humanReviewRequired: boolean,
    createdBy: string,
  ): ModelDisagreement;
  getModelDisagreement(id: string, caseId: ResearchCaseId): ModelDisagreement | null;
  getModelDisagreementsByCase(caseId: ResearchCaseId): ModelDisagreement[];
  resolveModelDisagreement(id: string, caseId: ResearchCaseId, resolution: string, resolvedBy: string): void;

  // OOD Assessments
  createOODAssessment(
    caseId: ResearchCaseId,
    worldModelId: WorldModelId,
    stateId: WorldStateId,
    status: OODStatus,
    indicators: string[],
    rationale: string,
    escalationRequired: boolean,
    createdBy: string,
  ): OODAssessment;
  getOODAssessment(id: string, caseId: ResearchCaseId): OODAssessment | null;
  getOODAssessmentsByModel(worldModelId: WorldModelId, caseId: ResearchCaseId): OODAssessment[];
}

export function createWorldModelEngineRepository(
  ids: IdProvider,
  time: TimeProvider,
): WorldModelEngineRepository {
  const worldModels = new Map<WorldModelId, WorldModel>();
  const worldStates = new Map<WorldStateId, WorldState>();
  const transitions = new Map<string, Transition>();
  const disagreements = new Map<string, ModelDisagreement>();
  const oodAssessments = new Map<string, OODAssessment>();

  return {
    createWorldModel(caseId, name, description, referencedEvidence, referencedClaims, referencedCausalModels, createdBy): WorldModel {
      const now = time.now();
      const id = ids.nextWorldModelId();
      const provId = ids.nextProvenanceId();
      const model: WorldModel = {
        id,
        caseId,
        name,
        description,
        states: [],
        transitions: [],
        referencedEvidence,
        referencedClaims,
        referencedCausalModels,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'world-model-creation',
          version: '1',
          createdAt: now,
          inputs: [...referencedEvidence, ...referencedClaims, ...referencedCausalModels],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      worldModels.set(id, model);
      return model;
    },

    getWorldModel(id, caseId): WorldModel | null {
      const m = worldModels.get(id);
      if (!m) return null;
      if (m.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldModel ${id} belongs to case ${m.caseId}, not ${caseId}`);
      }
      return m;
    },

    getWorldModelsByCase(caseId): WorldModel[] {
      return Array.from(worldModels.values()).filter(m => m.caseId === caseId);
    },

    supersedeWorldModel(oldId, newId, caseId, reason, supersededBy): void {
      const oldModel = worldModels.get(oldId);
      if (!oldModel) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `WorldModel ${oldId} not found`);
      }
      if (oldModel.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldModel ${oldId} belongs to case ${oldModel.caseId}, not ${caseId}`);
      }

      const newModel = worldModels.get(newId);
      if (!newModel) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `WorldModel ${newId} not found`);
      }
      if (newModel.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldModel ${newId} belongs to case ${newModel.caseId}, not ${caseId}`);
      }

      const now = time.now();
      oldModel.supersededBy = newId;
      oldModel.updatedAt = now;
      oldModel.versioning = {
        ...oldModel.versioning,
        version: oldModel.versioning.version + 1,
        changeReason: reason,
      };
    },

    createWorldState(caseId, worldModelId, name, description, variables, executionMode, createdBy): WorldState {
      const model = worldModels.get(worldModelId);
      if (!model || model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldModel ${worldModelId} not found or wrong case`);
      }

      const now = time.now();
      const id = ids.nextWorldStateId();
      const provId = ids.nextProvenanceId();
      const state: WorldState = {
        id,
        caseId,
        worldModelId,
        name,
        description,
        variables,
        executionMode,
        timestamp: now,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'world-state-creation',
          version: '1',
          createdAt: now,
          inputs: [worldModelId],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      worldStates.set(id, state);
      model.states.push(id);
      model.updatedAt = now;
      return state;
    },

    getWorldState(id, caseId): WorldState | null {
      const s = worldStates.get(id);
      if (!s) return null;
      if (s.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldState ${id} belongs to case ${s.caseId}, not ${caseId}`);
      }
      return s;
    },

    getWorldStatesByModel(worldModelId, caseId): WorldState[] {
      return Array.from(worldStates.values()).filter(s => {
        const model = worldModels.get(s.worldModelId);
        return model && model.caseId === caseId && s.worldModelId === worldModelId;
      });
    },

    createTransition(caseId, worldModelId, name, description, fromStateId, toStateId, preconditions, effects, evidenceBasis, causalBasis, uncertainty, scope, createdBy): Transition {
      const model = worldModels.get(worldModelId);
      if (!model || model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldModel ${worldModelId} not found or wrong case`);
      }

      const now = time.now();
      const id = `tr-${ids.nextEvidenceLinkId()}`;
      const provId = ids.nextProvenanceId();
      const transition: Transition = {
        id,
        caseId,
        worldModelId,
        name,
        description,
        fromStateId,
        toStateId,
        preconditions,
        effects,
        evidenceBasis,
        causalBasis,
        uncertainty,
        scope,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'transition-creation',
          version: '1',
          createdAt: now,
          inputs: [fromStateId, toStateId, ...evidenceBasis],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      transitions.set(id, transition);
      model.transitions.push(id);
      model.updatedAt = now;
      return transition;
    },

    getTransition(id, caseId): Transition | null {
      const t = transitions.get(id);
      if (!t) return null;
      if (t.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Transition ${id} belongs to case ${t.caseId}, not ${caseId}`);
      }
      return t;
    },

    getTransitionsByModel(worldModelId, caseId): Transition[] {
      return Array.from(transitions.values()).filter(t => {
        const model = worldModels.get(t.worldModelId);
        return model && model.caseId === caseId && t.worldModelId === worldModelId;
      });
    },

    createModelDisagreement(caseId, description, modelIds, pointOfDisagreement, evidence, assumptions, uncertainty, humanReviewRequired, createdBy): ModelDisagreement {
      const now = time.now();
      const id = `md-${ids.nextContradictionId()}`;
      const provId = ids.nextProvenanceId();
      const disagreement: ModelDisagreement = {
        id,
        caseId,
        description,
        modelIds,
        pointOfDisagreement,
        evidence,
        assumptions,
        uncertainty,
        humanReviewRequired,
        resolved: false,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'model-disagreement-creation',
          version: '1',
          createdAt: now,
          inputs: [...modelIds, ...evidence],
          assumptions,
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      disagreements.set(id, disagreement);
      return disagreement;
    },

    getModelDisagreement(id, caseId): ModelDisagreement | null {
      const d = disagreements.get(id);
      if (!d) return null;
      if (d.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Disagreement ${id} belongs to case ${d.caseId}, not ${caseId}`);
      }
      return d;
    },

    getModelDisagreementsByCase(caseId): ModelDisagreement[] {
      return Array.from(disagreements.values()).filter(d => d.caseId === caseId);
    },

    resolveModelDisagreement(id, caseId, resolution, resolvedBy): void {
      const disagreement = disagreements.get(id);
      if (!disagreement) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Disagreement ${id} not found`);
      }
      if (disagreement.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Disagreement ${id} belongs to case ${disagreement.caseId}, not ${caseId}`);
      }

      const now = time.now();
      disagreement.resolved = true;
      disagreement.resolution = resolution;
      disagreement.updatedAt = now;
      disagreement.versioning = {
        ...disagreement.versioning,
        version: disagreement.versioning.version + 1,
        changeReason: `Resolved by ${resolvedBy}`,
      };
    },

    createOODAssessment(caseId, worldModelId, stateId, status, indicators, rationale, escalationRequired, createdBy): OODAssessment {
      const model = worldModels.get(worldModelId);
      if (!model || model.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: WorldModel ${worldModelId} not found or wrong case`);
      }

      const now = time.now();
      const id = `ood-${ids.nextUncertaintyId()}`;
      const provId = ids.nextProvenanceId();
      const assessment: OODAssessment = {
        id,
        caseId,
        worldModelId,
        stateId,
        status,
        indicators,
        rationale,
        escalationRequired,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'ood-assessment-creation',
          version: '1',
          createdAt: now,
          inputs: [worldModelId, stateId],
          assumptions: [],
        },
        createdAt: now,
      };
      oodAssessments.set(id, assessment);
      return assessment;
    },

    getOODAssessment(id, caseId): OODAssessment | null {
      const a = oodAssessments.get(id);
      if (!a) return null;
      if (a.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: OODAssessment ${id} belongs to case ${a.caseId}, not ${caseId}`);
      }
      return a;
    },

    getOODAssessmentsByModel(worldModelId, caseId): OODAssessment[] {
      return Array.from(oodAssessments.values()).filter(a => {
        const model = worldModels.get(a.worldModelId);
        return model && model.caseId === caseId && a.worldModelId === worldModelId;
      });
    },
  };
}
