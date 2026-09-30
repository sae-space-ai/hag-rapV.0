/**
 * HAG-RAP V.2 — Authority Module
 * Authority is first-class from Order 0.
 * Distinguishes: CAPABILITY, OPERATIONAL_CRITERIA, PERMISSION, DISCRETION, AUTHORITY, ASSURANCE.
 * INVARIANT: CAPABILITY ≠ PERMISSION. PERMISSION ≠ AUTHORITY.
 * INVARIANT: AI cannot fabricate human approval.
 * INVARIANT: Delegation does not create authority.
 */

import {
  ResearchCaseId,
  AuthorityPolicyId,
  HumanDecisionId,
  PermissionId,
  HumanGateId,
  ConstraintLockId,
  ActorType,
  Modifiability,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// AUTHORITY POLICY
// ============================================================

export interface AuthorityPolicy {
  id: AuthorityPolicyId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  scope: AuthorityScope;
  permissions: Permission[];
  boundaries: AuthorityBoundary[];
  modifiability: Modifiability;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorityScope {
  domains: string[];
  maxConfidence: number;
  requiresHumanApproval: boolean;
  applicableCases: ResearchCaseId[];
}

export interface Permission {
  id: PermissionId;
  action: string;
  target: string;
  modifiability: Modifiability;
  grantedBy: string;
  grantedAt: string;
}

export interface AuthorityBoundary {
  domain: string;
  limit: string;
  enforcement: 'hard' | 'soft';
  description: string;
}

// ============================================================
// HUMAN DECISION
// ============================================================

export interface HumanDecision {
  id: HumanDecisionId;
  caseId: ResearchCaseId;
  actor: string;
  actorType: ActorType;
  decisionType: HumanDecisionType;
  content: string;
  rationale: string;
  targetRef?: string;
  provenance: Provenance;
  createdAt: string;
}

export enum HumanDecisionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  OVERRIDE = 'OVERRIDE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  CHANGE_PRIORITY = 'CHANGE_PRIORITY',
  REQUEST_ALTERNATIVE = 'REQUEST_ALTERNATIVE',
  REQUEST_EVIDENCE = 'REQUEST_EVIDENCE',
  REQUEST_COUNTERFACTUAL = 'REQUEST_COUNTERFACTUAL',
  STOP = 'STOP',
  RESUME = 'RESUME',
  CORRECT = 'CORRECT',
  CHALLENGE = 'CHALLENGE',
}

// ============================================================
// HUMAN GATE
// ============================================================

export interface HumanGate {
  id: HumanGateId;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requiredBy: string;
  decision?: HumanDecisionId;
  createdAt: string;
}

// ============================================================
// CONSTRAINT LOCK
// ============================================================

export interface ConstraintLock {
  id: ConstraintLockId;
  caseId: ResearchCaseId;
  constraintRef: string;
  modifiability: Modifiability;
  lockedBy: string;
  lockedAt: string;
  reason: string;
}

// ============================================================
// AUTHORITY VIOLATION
// ============================================================

export interface AuthorityViolation {
  actor: string;
  actorType: ActorType;
  attemptedAction: string;
  policyId: AuthorityPolicyId;
  reason: string;
  timestamp: string;
}

// ============================================================
// CAPABILITY DECLARATION
// ============================================================

export interface CapabilityDeclaration {
  name: string;
  description: string;
  limitations: string[];
  confidenceBound: number;
  verified: boolean;
}

// ============================================================
// AUTHORITY REPOSITORY
// ============================================================

export interface AuthorityRepository {
  createPolicy(caseId: ResearchCaseId, name: string, description: string, scope: AuthorityScope, permissions: Permission[], boundaries: AuthorityBoundary[], modifiability: Modifiability, createdBy: string): AuthorityPolicy;
  getPolicy(id: AuthorityPolicyId, caseId: ResearchCaseId): AuthorityPolicy | null;
  getPoliciesByCase(caseId: ResearchCaseId): AuthorityPolicy[];

  registerHumanDecision(caseId: ResearchCaseId, actor: string, actorType: ActorType, decisionType: HumanDecisionType, content: string, rationale: string, targetRef?: string): HumanDecision;
  getDecision(id: HumanDecisionId, caseId: ResearchCaseId): HumanDecision | null;
  getDecisionsByCase(caseId: ResearchCaseId): HumanDecision[];

  createHumanGate(caseId: ResearchCaseId, name: string, description: string, requiredBy: string): HumanGate;
  resolveGate(gateId: HumanGateId, decisionId: HumanDecisionId, caseId: ResearchCaseId): HumanGate;

  createConstraintLock(caseId: ResearchCaseId, constraintRef: string, modifiability: Modifiability, lockedBy: string, reason: string): ConstraintLock;

  checkPermission(policyId: AuthorityPolicyId, action: string, target: string, caseId: ResearchCaseId): boolean;
}

export function createAuthorityRepository(
  ids: IdProvider,
  time: TimeProvider,
): AuthorityRepository {
  const policies = new Map<AuthorityPolicyId, AuthorityPolicy>();
  const decisions = new Map<HumanDecisionId, HumanDecision>();
  const gates = new Map<HumanGateId, HumanGate>();
  const locks = new Map<ConstraintLockId, ConstraintLock>();

  return {
    createPolicy(caseId, name, description, scope, permissions, boundaries, modifiability, createdBy): AuthorityPolicy {
      const now = time.now();
      const id = ids.nextAuthorityPolicyId();
      const provId = ids.nextProvenanceId();
      const policy: AuthorityPolicy = {
        id,
        caseId,
        name,
        description,
        scope,
        permissions,
        boundaries,
        modifiability,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'authority-policy-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      policies.set(id, policy);
      return policy;
    },

    getPolicy(id, caseId): AuthorityPolicy | null {
      const p = policies.get(id);
      if (!p) return null;
      if (p.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `Policy ${id} belongs to case ${p.caseId}, not ${caseId}`);
      }
      return p;
    },

    getPoliciesByCase(caseId): AuthorityPolicy[] {
      return Array.from(policies.values()).filter(p => p.caseId === caseId);
    },

    registerHumanDecision(caseId, actor, actorType, decisionType, content, rationale, targetRef): HumanDecision {
      // INVARIANT: HumanDecision requires HUMAN actor type
      if (actorType !== ActorType.HUMAN) {
        throw new DomainError(DomainErrorCode.HUMAN_ACTOR_SPOOFING,
          `HumanDecision requires ActorType.HUMAN, got ${actorType}`);
      }
      const now = time.now();
      const id = ids.nextHumanDecisionId();
      const provId = ids.nextProvenanceId();
      const decision: HumanDecision = {
        id,
        caseId,
        actor,
        actorType,
        decisionType,
        content,
        rationale,
        targetRef,
        provenance: {
          id: provId,
          producer: actor,
          producerType: ActorType.HUMAN,
          method: 'human-decision',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
      };
      decisions.set(id, decision);
      return decision;
    },

    getDecision(id, caseId): HumanDecision | null {
      const d = decisions.get(id);
      if (!d) return null;
      if (d.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `Decision ${id} belongs to case ${d.caseId}, not ${caseId}`);
      }
      return d;
    },

    getDecisionsByCase(caseId): HumanDecision[] {
      return Array.from(decisions.values()).filter(d => d.caseId === caseId);
    },

    createHumanGate(caseId, name, description, requiredBy): HumanGate {
      const now = time.now();
      const id = ids.nextHumanGateId();
      const gate: HumanGate = {
        id,
        caseId,
        name,
        description,
        status: 'PENDING',
        requiredBy,
        createdAt: now,
      };
      gates.set(id, gate);
      return gate;
    },

    resolveGate(gateId, decisionId, caseId): HumanGate {
      const gate = gates.get(gateId);
      if (!gate) throw new DomainError(DomainErrorCode.NOT_FOUND, `Gate ${gateId} not found`);
      if (gate.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `Gate ${gateId} belongs to case ${gate.caseId}, not ${caseId}`);
      }
      const decision = decisions.get(decisionId);
      if (!decision) throw new DomainError(DomainErrorCode.NOT_FOUND, `Decision ${decisionId} not found`);

      const resolved: HumanGate = {
        ...gate,
        status: decision.decisionType === HumanDecisionType.REJECT ? 'REJECTED' : 'APPROVED',
        decision: decisionId,
      };
      gates.set(gateId, resolved);
      return resolved;
    },

    createConstraintLock(caseId, constraintRef, modifiability, lockedBy, reason): ConstraintLock {
      const now = time.now();
      const id = ids.nextConstraintLockId();
      const lock: ConstraintLock = {
        id,
        caseId,
        constraintRef,
        modifiability,
        lockedBy,
        lockedAt: now,
        reason,
      };
      locks.set(id, lock);
      return lock;
    },

    checkPermission(policyId, action, target, caseId): boolean {
      const policy = policies.get(policyId);
      if (!policy) return false;
      if (policy.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `Policy ${policyId} belongs to case ${policy.caseId}, not ${caseId}`);
      }
      return policy.permissions.some(
        p => p.action === action && p.target === target
      );
    },
  };
}
