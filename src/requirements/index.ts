/**
 * HAG-RAP V.2 — Requirements Module (WP2)
 * Scientific requirements with full traceability.
 * INVARIANT: SATISFIED only through explicit evaluation.
 */

import {
  ResearchCaseId,
  SourceId,
  EvidenceId,
  ActorType,
  Provenance,
  Versioned,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// REQUIREMENT TYPES
// ============================================================

export enum RequirementType {
  SCIENTIFIC = 'SCIENTIFIC',
  FUNCTIONAL = 'FUNCTIONAL',
  TRUSTWORTHINESS = 'TRUSTWORTHINESS',
  HUMAN_GOVERNANCE = 'HUMAN_GOVERNANCE',
  DATA_GOVERNANCE = 'DATA_GOVERNANCE',
  SECURITY = 'SECURITY',
  ETHICAL = 'ETHICAL',
  FUNDAMENTAL_RIGHTS = 'FUNDAMENTAL_RIGHTS',
  PERFORMANCE = 'PERFORMANCE',
  RESOURCE = 'RESOURCE',
  INTEROPERABILITY = 'INTEROPERABILITY',
  VALIDATION = 'VALIDATION',
}

export enum RequirementStatus {
  DEFINED = 'DEFINED',
  IN_EVALUATION = 'IN_EVALUATION',
  SATISFIED = 'SATISFIED',
  PARTIALLY_SATISFIED = 'PARTIALLY_SATISFIED',
  NOT_SATISFIED = 'NOT_SATISFIED',
  WAIVED = 'WAIVED',
}

// ============================================================
// REQUIREMENT
// ============================================================

export type RequirementId = string & { readonly __brand: 'RequirementId' };
export type RiskId = string & { readonly __brand: 'RiskId' };
export type ControlId = string & { readonly __brand: 'ControlId' };
export type ValidationCriterionId = string & { readonly __brand: 'ValidationCriterionId' };

export interface ScientificRequirement {
  id: RequirementId;
  caseId: ResearchCaseId;
  title: string;
  description: string;
  requirementType: RequirementType;
  status: RequirementStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sources: SourceId[];
  evidence: EvidenceId[];
  risks: RiskId[];
  controls: ControlId[];
  validationCriteria: ValidationCriterionId[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// RISK
// ============================================================

export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Risk {
  id: RiskId;
  caseId: ResearchCaseId;
  description: string;
  severity: RiskSeverity;
  likelihood: 'low' | 'medium' | 'high';
  affectedRequirements: RequirementId[];
  mitigatedBy: ControlId[];
  residualRisk: RiskSeverity;
  accepted: boolean;
  acceptanceRationale?: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONTROL
// ============================================================

export interface Control {
  id: ControlId;
  caseId: ResearchCaseId;
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  mitigatesRisks: RiskId[];
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// VALIDATION CRITERION
// ============================================================

export interface ValidationCriterion {
  id: ValidationCriterionId;
  caseId: ResearchCaseId;
  description: string;
  measurable: boolean;
  threshold?: string;
  method?: string;
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// REQUIREMENTS REPOSITORY
// ============================================================

export interface RequirementsRepository {
  createRequirement(input: Omit<ScientificRequirement, 'id' | 'risks' | 'controls' | 'validationCriteria' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): ScientificRequirement;
  getRequirement(id: RequirementId, caseId: ResearchCaseId): ScientificRequirement | null;
  getRequirementsByCase(caseId: ResearchCaseId): ScientificRequirement[];
  updateRequirementStatus(id: RequirementId, caseId: ResearchCaseId, status: RequirementStatus, updatedBy: string): ScientificRequirement;

  createRisk(input: Omit<Risk, 'id' | 'mitigatedBy' | 'residualRisk' | 'accepted' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Risk;
  getRisk(id: RiskId, caseId: ResearchCaseId): Risk | null;
  getRisksByCase(caseId: ResearchCaseId): Risk[];

  createControl(input: Omit<Control, 'id' | 'mitigatesRisks' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): Control;
  getControl(id: ControlId, caseId: ResearchCaseId): Control | null;
  getControlsByCase(caseId: ResearchCaseId): Control[];

  createValidationCriterion(input: Omit<ValidationCriterion, 'id' | 'provenance' | 'versioning' | 'createdAt' | 'updatedAt'>, createdBy: string): ValidationCriterion;
  getValidationCriterion(id: ValidationCriterionId, caseId: ResearchCaseId): ValidationCriterion | null;
  getValidationCriteriaByCase(caseId: ResearchCaseId): ValidationCriterion[];
}

export function createRequirementsRepository(
  ids: IdProvider,
  time: TimeProvider,
): RequirementsRepository {
  const requirements = new Map<RequirementId, ScientificRequirement>();
  const risks = new Map<RiskId, Risk>();
  const controls = new Map<ControlId, Control>();
  const criteria = new Map<ValidationCriterionId, ValidationCriterion>();

  const nextReqId = (): RequirementId => ids.nextEvidenceId() as unknown as RequirementId;
  const nextRiskId = (): RiskId => ids.nextEvidenceId() as unknown as RiskId;
  const nextControlId = (): ControlId => ids.nextEvidenceId() as unknown as ControlId;
  const nextCriterionId = (): ValidationCriterionId => ids.nextEvidenceId() as unknown as ValidationCriterionId;

  return {
    createRequirement(input, createdBy): ScientificRequirement {
      const now = time.now();
      const id = nextReqId();
      const provId = ids.nextProvenanceId();
      const req: ScientificRequirement = {
        ...input,
        id,
        risks: [],
        controls: [],
        validationCriteria: [],
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'requirement-definition',
          version: '1',
          createdAt: now,
          inputs: input.sources,
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      requirements.set(id, req);
      return req;
    },

    getRequirement(id, caseId): ScientificRequirement | null {
      const r = requirements.get(id);
      if (!r) return null;
      if (r.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Requirement ${id} belongs to case ${r.caseId}, not ${caseId}`);
      }
      return r;
    },

    getRequirementsByCase(caseId): ScientificRequirement[] {
      return Array.from(requirements.values()).filter(r => r.caseId === caseId);
    },

    updateRequirementStatus(id, caseId, status, updatedBy): ScientificRequirement {
      const req = requirements.get(id);
      if (!req) {
        throw new DomainError(DomainErrorCode.NOT_FOUND, `Requirement ${id} not found`);
      }
      if (req.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Requirement ${id} belongs to case ${req.caseId}, not ${caseId}`);
      }
      const now = time.now();
      const updated: ScientificRequirement = {
        ...req,
        status,
        updatedAt: now,
        versioning: {
          ...req.versioning,
          version: req.versioning.version + 1,
          changeReason: `Status updated to ${status} by ${updatedBy}`,
        },
      };
      requirements.set(id, updated);
      return updated;
    },

    createRisk(input, createdBy): Risk {
      const now = time.now();
      const id = nextRiskId();
      const provId = ids.nextProvenanceId();
      const risk: Risk = {
        ...input,
        id,
        mitigatedBy: [],
        residualRisk: input.severity,
        accepted: false,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'risk-identification',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      risks.set(id, risk);
      return risk;
    },

    getRisk(id, caseId): Risk | null {
      const r = risks.get(id);
      if (!r) return null;
      if (r.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Risk ${id} belongs to case ${r.caseId}, not ${caseId}`);
      }
      return r;
    },

    getRisksByCase(caseId): Risk[] {
      return Array.from(risks.values()).filter(r => r.caseId === caseId);
    },

    createControl(input, createdBy): Control {
      const now = time.now();
      const id = nextControlId();
      const provId = ids.nextProvenanceId();
      const control: Control = {
        ...input,
        id,
        mitigatesRisks: [],
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'control-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      controls.set(id, control);
      return control;
    },

    getControl(id, caseId): Control | null {
      const c = controls.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Control ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getControlsByCase(caseId): Control[] {
      return Array.from(controls.values()).filter(c => c.caseId === caseId);
    },

    createValidationCriterion(input, createdBy): ValidationCriterion {
      const now = time.now();
      const id = nextCriterionId();
      const provId = ids.nextProvenanceId();
      const criterion: ValidationCriterion = {
        ...input,
        id,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'criterion-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
        updatedAt: now,
      };
      criteria.set(id, criterion);
      return criterion;
    },

    getValidationCriterion(id, caseId): ValidationCriterion | null {
      const c = criteria.get(id);
      if (!c) return null;
      if (c.caseId !== caseId) {
        throw new DomainError(DomainErrorCode.CASE_ISOLATION_VIOLATION,
          `CASE_ISOLATION_VIOLATION: Criterion ${id} belongs to case ${c.caseId}, not ${caseId}`);
      }
      return c;
    },

    getValidationCriteriaByCase(caseId): ValidationCriterion[] {
      return Array.from(criteria.values()).filter(c => c.caseId === caseId);
    },
  };
}
