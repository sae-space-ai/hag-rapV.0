/**
 * HAG-RAP V.2 — Abstraction Engine (WP4)
 * Abstractions, lattices, applicability envelopes.
 * INVARIANT: Abstraction ≠ Truth. Generality ≠ Universality.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ClaimId,
  ConceptId,
  AbstractionId,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// ABSTRACTION LEVEL
// ============================================================

export enum AbstractionLevel {
  CONCRETE = 'CONCRETE',
  INTERMEDIATE = 'INTERMEDIATE',
  GENERAL = 'GENERAL',
}

// ============================================================
// APPLICABILITY ENVELOPE
// ============================================================

export interface ApplicabilityEnvelope {
  supportedContexts: string[];
  unsupportedContexts: string[];
  knownLimitations: string[];
  requiredConditions: string[];
  counterexamples: string[];
  distributionAssumptions: string[];
  uncertainty: string;
  oodIndicators: string[];
}

// ============================================================
// ABSTRACTION
// ============================================================

export interface Abstraction {
  id: AbstractionId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  level: AbstractionLevel;
  generalizesFrom: ConceptId[];
  evidence: EvidenceId[];
  counterexamples: string[];
  applicabilityEnvelope: ApplicabilityEnvelope;
  supersededBy?: AbstractionId;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ABSTRACTION LATTICE
// ============================================================

export interface AbstractionLattice {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  abstractions: AbstractionId[];
  rootAbstractionId?: AbstractionId;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ABSTRACTION RELATION
// ============================================================

export enum AbstractionRelationType {
  GENERALIZES = 'GENERALIZES',
  SPECIALIZES = 'SPECIALIZES',
  RELATED_TO = 'RELATED_TO',
}

export interface AbstractionRelation {
  id: string;
  sourceAbstractionId: AbstractionId;
  targetAbstractionId: AbstractionId;
  relationType: AbstractionRelationType;
  strength: number; // 0-1
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// ABSTRACTION ENGINE REPOSITORY
// ============================================================

export interface AbstractionEngineRepository {
  // Abstractions
  createAbstraction(
    caseId: ResearchCaseId,
    name: string,
    description: string,
    level: AbstractionLevel,
    generalizesFrom: ConceptId[],
    evidence: EvidenceId[],
    counterexamples: string[],
    applicabilityEnvelope: ApplicabilityEnvelope,
    createdBy: string,
  ): Abstraction;
  getAbstraction(id: AbstractionId, caseId: ResearchCaseId): Abstraction | null;
  getAbstractionsByCase(caseId: ResearchCaseId): Abstraction[];
  supersedeAbstraction(oldId: AbstractionId, newId: AbstractionId, caseId: ResearchCaseId, reason: string, supersededBy: string): void;

  // Lattices
  createLattice(caseId: ResearchCaseId, name: string, description: string, abstractions: AbstractionId[], rootAbstractionId: AbstractionId | undefined, createdBy: string): AbstractionLattice;
  getLattice(id: string, caseId: ResearchCaseId): AbstractionLattice | null;
  getLatticesByCase(caseId: ResearchCaseId): AbstractionLattice[];

  // Relations
  addAbstractionRelation(
    sourceAbstractionId: AbstractionId,
    targetAbstractionId: AbstractionId,
    caseId: ResearchCaseId,
    relationType: AbstractionRelationType,
    strength: number,
    createdBy: string,
  ): AbstractionRelation;
  getAbstractionRelations(abstractionId: AbstractionId, caseId: ResearchCaseId): AbstractionRelation[];
}

export function createAbstractionEngineRepository(
  ids: IdProvider,
  time: TimeProvider,
): AbstractionEngineRepository {
  const abstractions = new Map<AbstractionId, Abstraction>();
  const lattices = new Map<string, AbstractionLattice>();
  const relations = new Map<string, AbstractionRelation>();

  return {
    createAbstraction(caseId, name, description, level, generalizesFrom, evidence, counterexamples, applicabilityEnvelope, createdBy): Abstraction {
      const now = time.now();
      const id = ids.nextAbstractionId();
      const provId = ids.nextProvenanceId();
      const abstraction: Abstraction = {
        id,
        caseId,
        name,
        description,
        level,
        generalizesFrom,
        evidence,
        counterexamples,
        applicabilityEnvelope,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'abstraction-creation',
          version: '1',
          createdAt: now,
          inputs: [...generalizesFrom, ...evidence],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      abstractions.set(id, abstraction);
      return abstraction;
    },

    getAbstraction(id, caseId): Abstraction | null {
      const a = abstractions.get(id);
      if (!a) return null;
      if (a.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Abstraction ${id} belongs to case ${a.caseId}, not ${caseId}`);
      }
      return a;
    },

    getAbstractionsByCase(caseId): Abstraction[] {
      return Array.from(abstractions.values()).filter(a => a.caseId === caseId);
    },

    supersedeAbstraction(oldId, newId, caseId, reason, supersededBy): void {
      const oldAbs = abstractions.get(oldId);
      if (!oldAbs) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Abstraction ${oldId} not found`);
      }
      if (oldAbs.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Abstraction ${oldId} belongs to case ${oldAbs.caseId}, not ${caseId}`);
      }

      const newAbs = abstractions.get(newId);
      if (!newAbs) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Abstraction ${newId} not found`);
      }
      if (newAbs.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Abstraction ${newId} belongs to case ${newAbs.caseId}, not ${caseId}`);
      }

      const now = time.now();
      oldAbs.supersededBy = newId;
      oldAbs.updatedAt = now;
      oldAbs.versioning = {
        ...oldAbs.versioning,
        version: oldAbs.versioning.version + 1,
        changeReason: reason,
      };
    },

    createLattice(caseId, name, description, abstractions, rootAbstractionId, createdBy): AbstractionLattice {
      const now = time.now();
      const id = `lat-${ids.nextAbstractionId()}`;
      const provId = ids.nextProvenanceId();
      const lattice: AbstractionLattice = {
        id,
        caseId,
        name,
        description,
        abstractions,
        rootAbstractionId,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'abstraction-lattice-creation',
          version: '1',
          createdAt: now,
          inputs: abstractions,
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      lattices.set(id, lattice);
      return lattice;
    },

    getLattice(id, caseId): AbstractionLattice | null {
      const l = lattices.get(id);
      if (!l) return null;
      if (l.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Lattice ${id} belongs to case ${l.caseId}, not ${caseId}`);
      }
      return l;
    },

    getLatticesByCase(caseId): AbstractionLattice[] {
      return Array.from(lattices.values()).filter(l => l.caseId === caseId);
    },

    addAbstractionRelation(sourceAbstractionId, targetAbstractionId, caseId, relationType, strength, createdBy): AbstractionRelation {
      const source = abstractions.get(sourceAbstractionId);
      if (!source || source.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Source abstraction not found or wrong case`);
      }

      const target = abstractions.get(targetAbstractionId);
      if (!target || target.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Target abstraction not found or wrong case`);
      }

      const now = time.now();
      const id = `ar-${ids.nextEvidenceLinkId()}`;
      const provId = ids.nextProvenanceId();
      const relation: AbstractionRelation = {
        id,
        sourceAbstractionId,
        targetAbstractionId,
        relationType,
        strength,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'abstraction-relation-creation',
          version: '1',
          createdAt: now,
          inputs: [sourceAbstractionId, targetAbstractionId],
          assumptions: [],
        },
        createdAt: now,
      };
      relations.set(id, relation);
      return relation;
    },

    getAbstractionRelations(abstractionId, caseId): AbstractionRelation[] {
      return Array.from(relations.values()).filter(r => {
        const source = abstractions.get(r.sourceAbstractionId);
        return source && source.caseId === caseId && (r.sourceAbstractionId === abstractionId || r.targetAbstractionId === abstractionId);
      });
    },
  };
}
