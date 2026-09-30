/**
 * HAG-RAP V.2 — Trustworthiness Module (WP2)
 * Trustworthiness by design: risks, fundamental rights, human oversight,
 * data governance, security, abstention/escalation policies.
 */

import {
  ResearchCaseId,
  AuthorityPolicyId,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// FUNDAMENTAL RIGHTS
// ============================================================

export enum FundamentalRight {
  PRIVACY = 'PRIVACY',
  NON_DISCRIMINATION = 'NON_DISCRIMINATION',
  FREEDOM_OF_EXPRESSION = 'FREEDOM_OF_EXPRESSION',
  DIGNITY = 'DIGNITY',
  FAIR_TRIAL = 'FAIR_TRIAL',
  EDUCATION = 'EDUCATION',
  EMPLOYMENT = 'EMPLOYMENT',
  HEALTH = 'HEALTH',
}

export interface FundamentalRightsConsideration {
  id: string;
  caseId: ResearchCaseId;
  right: FundamentalRight;
  description: string;
  impacted: boolean;
  mitigation: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// HUMAN OVERSIGHT
// ============================================================

export interface HumanOversightRequirement {
  id: string;
  caseId: ResearchCaseId;
  description: string;
  linkedAuthorityPolicy?: AuthorityPolicyId;
  triggerConditions: string[];
  escalationPolicy: EscalationDecision;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// ESCALATION POLICY
// ============================================================

export enum EscalationDecision {
  CONTINUE = 'CONTINUE',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  ABSTAIN_REQUIRED = 'ABSTAIN_REQUIRED',
  SAFE_STOP_REQUIRED = 'SAFE_STOP_REQUIRED',
}

export interface AbstentionEscalationPolicy {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  criteria: EscalationCriterion[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

export interface EscalationCriterion {
  condition: string;
  decision: EscalationDecision;
  rationale: string;
}

export function evaluateEscalation(
  policy: AbstentionEscalationPolicy,
  context: {
    insufficientEvidence: boolean;
    criticalContradiction: boolean;
    criticalUnknown: boolean;
    invalidProvenance: boolean;
    authorityBoundaryCrossed: boolean;
    missingHumanDecision: boolean;
    unacceptableResidualRisk: boolean;
  },
): EscalationDecision {
  // Evaluate criteria in order
  for (const criterion of policy.criteria) {
    const matches = evaluateCriterion(criterion.condition, context);
    if (matches) {
      return criterion.decision;
    }
  }
  return EscalationDecision.CONTINUE;
}

function evaluateCriterion(condition: string, context: Record<string, boolean>): boolean {
  // Simple condition evaluator
  if (condition === 'insufficient_evidence') return context.insufficientEvidence;
  if (condition === 'critical_contradiction') return context.criticalContradiction;
  if (condition === 'critical_unknown') return context.criticalUnknown;
  if (condition === 'invalid_provenance') return context.invalidProvenance;
  if (condition === 'authority_boundary') return context.authorityBoundaryCrossed;
  if (condition === 'missing_human_decision') return context.missingHumanDecision;
  if (condition === 'unacceptable_residual_risk') return context.unacceptableResidualRisk;
  return false;
}

// ============================================================
// DATA GOVERNANCE
// ============================================================

export enum DataClassification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SYNTHETIC = 'SYNTHETIC',
  GENERATED = 'GENERATED',
}

export interface DataGovernanceProfile {
  id: string;
  caseId: ResearchCaseId;
  dataClassification: DataClassification;
  personalData: boolean;
  retentionPeriod: string;
  accessRestrictions: string[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// SECURITY REQUIREMENT
// ============================================================

export interface SecurityRequirement {
  id: string;
  caseId: ResearchCaseId;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigations: string[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// TRUSTWORTHINESS REPOSITORY
// ============================================================

export interface TrustworthinessRepository {
  createFundamentalRightsConsideration(input: Omit<FundamentalRightsConsideration, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): FundamentalRightsConsideration;
  getFundamentalRightsByCase(caseId: ResearchCaseId): FundamentalRightsConsideration[];

  createHumanOversightRequirement(input: Omit<HumanOversightRequirement, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): HumanOversightRequirement;
  getHumanOversightByCase(caseId: ResearchCaseId): HumanOversightRequirement[];

  createAbstentionPolicy(input: Omit<AbstentionEscalationPolicy, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): AbstentionEscalationPolicy;
  getAbstentionPoliciesByCase(caseId: ResearchCaseId): AbstentionEscalationPolicy[];

  createDataGovernanceProfile(input: Omit<DataGovernanceProfile, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): DataGovernanceProfile;
  getDataGovernanceByCase(caseId: ResearchCaseId): DataGovernanceProfile[];

  createSecurityRequirement(input: Omit<SecurityRequirement, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): SecurityRequirement;
  getSecurityRequirementsByCase(caseId: ResearchCaseId): SecurityRequirement[];
}

export function createTrustworthinessRepository(
  ids: IdProvider,
  time: TimeProvider,
): TrustworthinessRepository {
  const frcs = new Map<string, FundamentalRightsConsideration>();
  const hors = new Map<string, HumanOversightRequirement>();
  const policies = new Map<string, AbstentionEscalationPolicy>();
  const dgs = new Map<string, DataGovernanceProfile>();
  const secs = new Map<string, SecurityRequirement>();

  const nextId = (prefix: string): string => {
    const id = ids.nextEvidenceId();
    return `${prefix}-${id}`;
  };

  return {
    createFundamentalRightsConsideration(input, createdBy): FundamentalRightsConsideration {
      const now = time.now();
      const id = nextId('FRC');
      const item: FundamentalRightsConsideration = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'fundamental-rights-assessment',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      frcs.set(id, item);
      return item;
    },

    getFundamentalRightsByCase(caseId): FundamentalRightsConsideration[] {
      return Array.from(frcs.values()).filter(f => f.caseId === caseId);
    },

    createHumanOversightRequirement(input, createdBy): HumanOversightRequirement {
      const now = time.now();
      const id = nextId('HOR');
      const item: HumanOversightRequirement = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'human-oversight-definition',
          version: '1',
          createdAt: now,
          inputs: input.linkedAuthorityPolicy ? [input.linkedAuthorityPolicy] : [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      hors.set(id, item);
      return item;
    },

    getHumanOversightByCase(caseId): HumanOversightRequirement[] {
      return Array.from(hors.values()).filter(h => h.caseId === caseId);
    },

    createAbstentionPolicy(input, createdBy): AbstentionEscalationPolicy {
      const now = time.now();
      const id = nextId('AEP');
      const item: AbstentionEscalationPolicy = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'abstention-policy-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      policies.set(id, item);
      return item;
    },

    getAbstentionPoliciesByCase(caseId): AbstentionEscalationPolicy[] {
      return Array.from(policies.values()).filter(p => p.caseId === caseId);
    },

    createDataGovernanceProfile(input, createdBy): DataGovernanceProfile {
      const now = time.now();
      const id = nextId('DGP');
      const item: DataGovernanceProfile = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'data-governance-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      dgs.set(id, item);
      return item;
    },

    getDataGovernanceByCase(caseId): DataGovernanceProfile[] {
      return Array.from(dgs.values()).filter(d => d.caseId === caseId);
    },

    createSecurityRequirement(input, createdBy): SecurityRequirement {
      const now = time.now();
      const id = nextId('SEC');
      const item: SecurityRequirement = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'security-requirement-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      secs.set(id, item);
      return item;
    },

    getSecurityRequirementsByCase(caseId): SecurityRequirement[] {
      return Array.from(secs.values()).filter(s => s.caseId === caseId);
    },
  };
}
