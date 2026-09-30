/**
 * HAG-RAP V.2 — Assurance Framework (WP6)
 * Formal verification and assurance cases
 */

import {
  type ResearchCaseId,
  type EvidenceId,
  ActorType,
  type Provenance,
  type TimeProvider,
  type IdProvider,
} from '../core/index.ts';

// ============================================================
// ASSURANCE TYPES
// ============================================================

export enum AssuranceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  WAIVED = 'WAIVED',
}

export enum VerificationMethod {
  STATIC_ANALYSIS = 'STATIC_ANALYSIS',
  DYNAMIC_TESTING = 'DYNAMIC_TESTING',
  FORMAL_PROOF = 'FORMAL_PROOF',
  MODEL_CHECKING = 'MODEL_CHECKING',
  THEOREM_PROVING = 'THEOREM_PROVING',
  RUNTIME_MONITORING = 'RUNTIME_MONITORING',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

// ============================================================
// ASSURANCE PROPERTY
// ============================================================

export interface AssuranceProperty {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  category: 'SAFETY' | 'SECURITY' | 'RELIABILITY' | 'CORRECTNESS' | 'AUTHORITY' | 'GOVERNANCE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  formalSpecification?: string;
  naturalLanguageSpec: string;
}

// ============================================================
// INVARIANT
// ============================================================

export interface Invariant {
  id: string;
  caseId: ResearchCaseId;
  propertyId: string;
  name: string;
  description: string;
  expression: string;
  scope: string;
  verificationMethod: VerificationMethod;
}

// ============================================================
// CONSTRAINT CHECK
// ============================================================

export interface ConstraintCheck {
  id: string;
  caseId: ResearchCaseId;
  invariantId: string;
  checkType: 'AUTHORITY_BOUNDARY' | 'NON_NEGOTIABLE' | 'HUMAN_LOCKED' | 'CASE_ISOLATION' | 'PROVENANCE_REQUIRED' | 'STATE_TRANSITION' | 'SAFE_STOP' | 'SIMULATION_REALITY';
  result: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'NOT_CHECKED';
  evidence: EvidenceId[];
  checkedAt: string;
  checkedBy: string;
}

// ============================================================
// VERIFICATION RESULT
// ============================================================

export interface VerificationResult {
  id: string;
  caseId: ResearchCaseId;
  propertyId: string;
  method: VerificationMethod;
  result: 'VERIFIED' | 'FAILED' | 'INCONCLUSIVE' | 'NOT_VERIFIED';
  confidence: number; // 0-1
  evidence: EvidenceId[];
  assumptions: string[];
  limitations: string[];
  verifiedAt: string;
  verifiedBy: string;
  toolUsed?: string;
  toolVersion?: string;
}

// ============================================================
// ASSURANCE EVIDENCE
// ============================================================

export interface AssuranceEvidence {
  id: string;
  caseId: ResearchCaseId;
  propertyId: string;
  evidenceId: EvidenceId;
  relevance: 'DIRECT' | 'INDIRECT' | 'SUPPORTING';
  weight: number; // 0-1
}

// ============================================================
// RESIDUAL RISK
// ============================================================

export interface ResidualRisk {
  id: string;
  caseId: ResearchCaseId;
  propertyId: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation: string;
  accepted: boolean;
  acceptedBy?: string;
  acceptedAt?: string;
  rationale?: string;
}

// ============================================================
// ASSURANCE CASE
// ============================================================

export interface AssuranceCase {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  intendedPurpose: string;
  properties: string[]; // AssuranceProperty IDs
  status: AssuranceStatus;
  overallConfidence: number; // 0-1
  residualRisks: string[]; // ResidualRisk IDs
  createdAt: string;
  updatedAt: string;
  provenance: Provenance;
}

// ============================================================
// ASSURANCE REPOSITORY
// ============================================================

export interface AssuranceRepository {
  // Assurance Properties
  createProperty(caseId: ResearchCaseId, name: string, description: string, category: AssuranceProperty['category'], priority: AssuranceProperty['priority'], naturalLanguageSpec: string, formalSpecification?: string): AssuranceProperty;
  getProperty(id: string, caseId: ResearchCaseId): AssuranceProperty | null;
  getPropertiesByCase(caseId: ResearchCaseId): AssuranceProperty[];

  // Invariants
  createInvariant(caseId: ResearchCaseId, propertyId: string, name: string, description: string, expression: string, scope: string, verificationMethod: VerificationMethod): Invariant;
  getInvariant(id: string, caseId: ResearchCaseId): Invariant | null;
  getInvariantsByCase(caseId: ResearchCaseId): Invariant[];

  // Constraint Checks
  createConstraintCheck(caseId: ResearchCaseId, invariantId: string, checkType: ConstraintCheck['checkType'], result: ConstraintCheck['result'], evidence: EvidenceId[], checkedBy: string): ConstraintCheck;
  getConstraintCheck(id: string, caseId: ResearchCaseId): ConstraintCheck | null;
  getConstraintChecksByCase(caseId: ResearchCaseId): ConstraintCheck[];

  // Verification Results
  createVerificationResult(caseId: ResearchCaseId, propertyId: string, method: VerificationMethod, result: VerificationResult['result'], confidence: number, evidence: EvidenceId[], assumptions: string[], limitations: string[], verifiedBy: string, toolUsed?: string, toolVersion?: string): VerificationResult;
  getVerificationResult(id: string, caseId: ResearchCaseId): VerificationResult | null;
  getVerificationResultsByCase(caseId: ResearchCaseId): VerificationResult[];

  // Assurance Evidence
  createAssuranceEvidence(caseId: ResearchCaseId, propertyId: string, evidenceId: EvidenceId, relevance: AssuranceEvidence['relevance'], weight: number): AssuranceEvidence;
  getAssuranceEvidence(id: string, caseId: ResearchCaseId): AssuranceEvidence | null;
  getAssuranceEvidenceByCase(caseId: ResearchCaseId): AssuranceEvidence[];

  // Residual Risks
  createResidualRisk(caseId: ResearchCaseId, propertyId: string, description: string, severity: ResidualRisk['severity'], likelihood: ResidualRisk['likelihood'], mitigation: string, accepted: boolean, acceptedBy?: string, rationale?: string): ResidualRisk;
  getResidualRisk(id: string, caseId: ResearchCaseId): ResidualRisk | null;
  getResidualRisksByCase(caseId: ResearchCaseId): ResidualRisk[];
  acceptResidualRisk(id: string, caseId: ResearchCaseId, acceptedBy: string, rationale: string): ResidualRisk;

  // Assurance Cases
  createAssuranceCase(caseId: ResearchCaseId, name: string, description: string, intendedPurpose: string, properties: string[]): AssuranceCase;
  getAssuranceCase(id: string, caseId: ResearchCaseId): AssuranceCase | null;
  getAssuranceCasesByCase(caseId: ResearchCaseId): AssuranceCase[];
  updateAssuranceCaseStatus(id: string, caseId: ResearchCaseId, status: AssuranceStatus, overallConfidence: number): AssuranceCase;
}

export function createAssuranceRepository(
  ids: IdProvider,
  time: TimeProvider,
): AssuranceRepository {
  const properties = new Map<string, AssuranceProperty>();
  const invariants = new Map<string, Invariant>();
  const constraintChecks = new Map<string, ConstraintCheck>();
  const verificationResults = new Map<string, VerificationResult>();
  const assuranceEvidence = new Map<string, AssuranceEvidence>();
  const residualRisks = new Map<string, ResidualRisk>();
  const assuranceCases = new Map<string, AssuranceCase>();

  return {
    // Properties
    createProperty(caseId, name, description, category, priority, naturalLanguageSpec, formalSpecification): AssuranceProperty {
      const id = `prop-${ids.nextEvidenceId()}`;
      const property: AssuranceProperty = {
        id,
        caseId,
        name,
        description,
        category,
        priority,
        formalSpecification,
        naturalLanguageSpec,
      };
      properties.set(id, property);
      return property;
    },

    getProperty(id, caseId): AssuranceProperty | null {
      const prop = properties.get(id);
      if (!prop) return null;
      if (prop.caseId !== caseId) {
        throw new Error(`Case isolation violation: property ${id} belongs to case ${prop.caseId}, not ${caseId}`);
      }
      return prop;
    },

    getPropertiesByCase(caseId): AssuranceProperty[] {
      return Array.from(properties.values()).filter(p => p.caseId === caseId);
    },

    // Invariants
    createInvariant(caseId, propertyId, name, description, expression, scope, verificationMethod): Invariant {
      const id = `inv-${ids.nextEvidenceId()}`;
      const invariant: Invariant = {
        id,
        caseId,
        propertyId,
        name,
        description,
        expression,
        scope,
        verificationMethod,
      };
      invariants.set(id, invariant);
      return invariant;
    },

    getInvariant(id, caseId): Invariant | null {
      const inv = invariants.get(id);
      if (!inv) return null;
      if (inv.caseId !== caseId) {
        throw new Error(`Case isolation violation: invariant ${id} belongs to case ${inv.caseId}, not ${caseId}`);
      }
      return inv;
    },

    getInvariantsByCase(caseId): Invariant[] {
      return Array.from(invariants.values()).filter(i => i.caseId === caseId);
    },

    // Constraint Checks
    createConstraintCheck(caseId, invariantId, checkType, result, evidence, checkedBy): ConstraintCheck {
      const id = `cc-${ids.nextEvidenceId()}`;
      const now = time.now();
      const check: ConstraintCheck = {
        id,
        caseId,
        invariantId,
        checkType,
        result,
        evidence,
        checkedAt: now,
        checkedBy,
      };
      constraintChecks.set(id, check);
      return check;
    },

    getConstraintCheck(id, caseId): ConstraintCheck | null {
      const check = constraintChecks.get(id);
      if (!check) return null;
      if (check.caseId !== caseId) {
        throw new Error(`Case isolation violation: check ${id} belongs to case ${check.caseId}, not ${caseId}`);
      }
      return check;
    },

    getConstraintChecksByCase(caseId): ConstraintCheck[] {
      return Array.from(constraintChecks.values()).filter(c => c.caseId === caseId);
    },

    // Verification Results
    createVerificationResult(caseId, propertyId, method, result, confidence, evidence, assumptions, limitations, verifiedBy, toolUsed, toolVersion): VerificationResult {
      const id = `vr-${ids.nextEvidenceId()}`;
      const now = time.now();
      const vr: VerificationResult = {
        id,
        caseId,
        propertyId,
        method,
        result,
        confidence,
        evidence,
        assumptions,
        limitations,
        verifiedAt: now,
        verifiedBy,
        toolUsed,
        toolVersion,
      };
      verificationResults.set(id, vr);
      return vr;
    },

    getVerificationResult(id, caseId): VerificationResult | null {
      const vr = verificationResults.get(id);
      if (!vr) return null;
      if (vr.caseId !== caseId) {
        throw new Error(`Case isolation violation: verification result ${id} belongs to case ${vr.caseId}, not ${caseId}`);
      }
      return vr;
    },

    getVerificationResultsByCase(caseId): VerificationResult[] {
      return Array.from(verificationResults.values()).filter(v => v.caseId === caseId);
    },

    // Assurance Evidence
    createAssuranceEvidence(caseId, propertyId, evidenceId, relevance, weight): AssuranceEvidence {
      const id = `ae-${ids.nextEvidenceId()}`;
      const ae: AssuranceEvidence = {
        id,
        caseId,
        propertyId,
        evidenceId,
        relevance,
        weight,
      };
      assuranceEvidence.set(id, ae);
      return ae;
    },

    getAssuranceEvidence(id, caseId): AssuranceEvidence | null {
      const ae = assuranceEvidence.get(id);
      if (!ae) return null;
      if (ae.caseId !== caseId) {
        throw new Error(`Case isolation violation: assurance evidence ${id} belongs to case ${ae.caseId}, not ${caseId}`);
      }
      return ae;
    },

    getAssuranceEvidenceByCase(caseId): AssuranceEvidence[] {
      return Array.from(assuranceEvidence.values()).filter(a => a.caseId === caseId);
    },

    // Residual Risks
    createResidualRisk(caseId, propertyId, description, severity, likelihood, mitigation, accepted, acceptedBy, rationale): ResidualRisk {
      const id = `rr-${ids.nextEvidenceId()}`;
      const now = time.now();
      const rr: ResidualRisk = {
        id,
        caseId,
        propertyId,
        description,
        severity,
        likelihood,
        mitigation,
        accepted,
        acceptedBy,
        acceptedAt: accepted ? now : undefined,
        rationale,
      };
      residualRisks.set(id, rr);
      return rr;
    },

    getResidualRisk(id, caseId): ResidualRisk | null {
      const rr = residualRisks.get(id);
      if (!rr) return null;
      if (rr.caseId !== caseId) {
        throw new Error(`Case isolation violation: residual risk ${id} belongs to case ${rr.caseId}, not ${caseId}`);
      }
      return rr;
    },

    getResidualRisksByCase(caseId): ResidualRisk[] {
      return Array.from(residualRisks.values()).filter(r => r.caseId === caseId);
    },

    acceptResidualRisk(id, caseId, acceptedBy, rationale): ResidualRisk {
      const rr = residualRisks.get(id);
      if (!rr) throw new Error(`Residual risk ${id} not found`);
      if (rr.caseId !== caseId) {
        throw new Error(`Case isolation violation: residual risk ${id} belongs to case ${rr.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: ResidualRisk = {
        ...rr,
        accepted: true,
        acceptedBy,
        acceptedAt: now,
        rationale,
      };
      
      residualRisks.set(id, updated);
      return updated;
    },

    // Assurance Cases
    createAssuranceCase(caseId, name, description, intendedPurpose, properties): AssuranceCase {
      const id = `ac-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      const ac: AssuranceCase = {
        id,
        caseId,
        name,
        description,
        intendedPurpose,
        properties,
        status: AssuranceStatus.PENDING,
        overallConfidence: 0,
        residualRisks: [],
        createdAt: now,
        updatedAt: now,
        provenance: {
          id: provId,
          producer: 'system',
          producerType: ActorType.SYSTEM,
          method: 'assurance-case-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      assuranceCases.set(id, ac);
      return ac;
    },

    getAssuranceCase(id, caseId): AssuranceCase | null {
      const ac = assuranceCases.get(id);
      if (!ac) return null;
      if (ac.caseId !== caseId) {
        throw new Error(`Case isolation violation: assurance case ${id} belongs to case ${ac.caseId}, not ${caseId}`);
      }
      return ac;
    },

    getAssuranceCasesByCase(caseId): AssuranceCase[] {
      return Array.from(assuranceCases.values()).filter(a => a.caseId === caseId);
    },

    updateAssuranceCaseStatus(id, caseId, status, overallConfidence): AssuranceCase {
      const ac = assuranceCases.get(id);
      if (!ac) throw new Error(`Assurance case ${id} not found`);
      if (ac.caseId !== caseId) {
        throw new Error(`Case isolation violation: assurance case ${id} belongs to case ${ac.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: AssuranceCase = {
        ...ac,
        status,
        overallConfidence,
        updatedAt: now,
      };
      
      assuranceCases.set(id, updated);
      return updated;
    },
  };
}
