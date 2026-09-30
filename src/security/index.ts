/**
 * HAG-RAP V.2 — Security (WP6)
 * Security findings and containment
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
// SECURITY FINDING SEVERITY
// ============================================================

export enum SecuritySeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

// ============================================================
// SECURITY FINDING STATUS
// ============================================================

export enum SecurityStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  CONTAINED = 'CONTAINED',
  REMEDIATING = 'REMEDIATING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
}

// ============================================================
// SECURITY FINDING
// ============================================================

export interface SecurityFinding {
  id: string;
  caseId: ResearchCaseId;
  severity: SecuritySeverity;
  affectedComponent: string;
  description: string;
  evidence: EvidenceId[];
  status: SecurityStatus;
  detectedAt: string;
  detectedBy: string;
  containedAt?: string;
  containedBy?: string;
  containmentActions?: string[];
  remediationPlan?: string;
  remediationStartedAt?: string;
  remediationCompletedAt?: string;
  remediationVerifiedAt?: string;
  remediationVerifiedBy?: string;
  retestPassed?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  provenance: Provenance;
}

// ============================================================
// SECURITY REPOSITORY
// ============================================================

export interface SecurityRepository {
  createSecurityFinding(
    caseId: ResearchCaseId,
    severity: SecuritySeverity,
    affectedComponent: string,
    description: string,
    evidence: EvidenceId[],
    detectedBy: string,
  ): SecurityFinding;
  
  getSecurityFinding(id: string, caseId: ResearchCaseId): SecurityFinding | null;
  getSecurityFindingsByCase(caseId: ResearchCaseId): SecurityFinding[];
  getSecurityFindingsBySeverity(caseId: ResearchCaseId, severity: SecuritySeverity): SecurityFinding[];
  getUnresolvedCriticalFindings(caseId: ResearchCaseId): SecurityFinding[];
  
  updateSecurityStatus(id: string, caseId: ResearchCaseId, status: SecurityStatus, updatedBy: string): SecurityFinding;
  containSecurityFinding(id: string, caseId: ResearchCaseId, containmentActions: string[], containedBy: string): SecurityFinding;
  remediateSecurityFinding(id: string, caseId: ResearchCaseId, remediationPlan: string, remediatedBy: string): SecurityFinding;
  verifyRemediation(id: string, caseId: ResearchCaseId, retestPassed: boolean, verifiedBy: string): SecurityFinding;
  resolveSecurityFinding(id: string, caseId: ResearchCaseId, resolution: string, resolvedBy: string): SecurityFinding;
  
  canReleaseDemo(caseId: ResearchCaseId): boolean;
}

export function createSecurityRepository(
  ids: IdProvider,
  time: TimeProvider,
): SecurityRepository {
  const findings = new Map<string, SecurityFinding>();

  return {
    createSecurityFinding(caseId, severity, affectedComponent, description, evidence, detectedBy): SecurityFinding {
      const id = `sec-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const finding: SecurityFinding = {
        id,
        caseId,
        severity,
        affectedComponent,
        description,
        evidence,
        status: SecurityStatus.DETECTED,
        detectedAt: now,
        detectedBy,
        provenance: {
          id: provId,
          producer: detectedBy,
          producerType: ActorType.SYSTEM,
          method: 'security-finding-detection',
          version: '1',
          createdAt: now,
          inputs: evidence,
          assumptions: [],
        },
      };
      
      findings.set(id, finding);
      return finding;
    },

    getSecurityFinding(id, caseId): SecurityFinding | null {
      const finding = findings.get(id);
      if (!finding) return null;
      if (finding.caseId !== caseId) {
        throw new Error(`Case isolation violation: security finding ${id} belongs to case ${finding.caseId}, not ${caseId}`);
      }
      return finding;
    },

    getSecurityFindingsByCase(caseId): SecurityFinding[] {
      return Array.from(findings.values()).filter(f => f.caseId === caseId);
    },

    getSecurityFindingsBySeverity(caseId, severity): SecurityFinding[] {
      return Array.from(findings.values()).filter(f => f.caseId === caseId && f.severity === severity);
    },

    getUnresolvedCriticalFindings(caseId): SecurityFinding[] {
      return Array.from(findings.values()).filter(f => 
        f.caseId === caseId && 
        f.severity === SecuritySeverity.CRITICAL && 
        f.status !== SecurityStatus.RESOLVED &&
        f.status !== SecurityStatus.FALSE_POSITIVE
      );
    },

    updateSecurityStatus(id, caseId, status, updatedBy): SecurityFinding {
      const finding = findings.get(id);
      if (!finding) throw new Error(`Security finding ${id} not found`);
      if (finding.caseId !== caseId) {
        throw new Error(`Case isolation violation: security finding ${id} belongs to case ${finding.caseId}, not ${caseId}`);
      }
      
      const updated: SecurityFinding = {
        ...finding,
        status,
      };
      
      findings.set(id, updated);
      return updated;
    },

    containSecurityFinding(id, caseId, containmentActions, containedBy): SecurityFinding {
      const finding = findings.get(id);
      if (!finding) throw new Error(`Security finding ${id} not found`);
      if (finding.caseId !== caseId) {
        throw new Error(`Case isolation violation: security finding ${id} belongs to case ${finding.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: SecurityFinding = {
        ...finding,
        status: SecurityStatus.CONTAINED,
        containedAt: now,
        containedBy,
        containmentActions,
      };
      
      findings.set(id, updated);
      return updated;
    },

    remediateSecurityFinding(id, caseId, remediationPlan, remediatedBy): SecurityFinding {
      const finding = findings.get(id);
      if (!finding) throw new Error(`Security finding ${id} not found`);
      if (finding.caseId !== caseId) {
        throw new Error(`Case isolation violation: security finding ${id} belongs to case ${finding.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: SecurityFinding = {
        ...finding,
        status: SecurityStatus.REMEDIATING,
        remediationPlan,
        remediationStartedAt: now,
      };
      
      findings.set(id, updated);
      return updated;
    },

    verifyRemediation(id, caseId, retestPassed, verifiedBy): SecurityFinding {
      const finding = findings.get(id);
      if (!finding) throw new Error(`Security finding ${id} not found`);
      if (finding.caseId !== caseId) {
        throw new Error(`Case isolation violation: security finding ${id} belongs to case ${finding.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: SecurityFinding = {
        ...finding,
        retestPassed,
        remediationVerifiedAt: now,
        remediationVerifiedBy: verifiedBy,
      };
      
      findings.set(id, updated);
      return updated;
    },

    resolveSecurityFinding(id, caseId, resolution, resolvedBy): SecurityFinding {
      const finding = findings.get(id);
      if (!finding) throw new Error(`Security finding ${id} not found`);
      if (finding.caseId !== caseId) {
        throw new Error(`Case isolation violation: security finding ${id} belongs to case ${finding.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: SecurityFinding = {
        ...finding,
        status: SecurityStatus.RESOLVED,
        resolution,
        resolvedAt: now,
        resolvedBy,
      };
      
      findings.set(id, updated);
      return updated;
    },

    canReleaseDemo(caseId): boolean {
      const criticalUnresolved = this.getUnresolvedCriticalFindings(caseId);
      return criticalUnresolved.length === 0;
    },
  };
}
