/**
 * HAG-RAP V.2 — Research Boundary Module (WP2)
 * Machine-readable policy defining the research scope.
 * INVARIANT: HAG-RAP V.2 is a controlled experimental demonstrator.
 */

import {
  ResearchCaseId,
  ActorType,
  Provenance,
  Versioned,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// RESEARCH BOUNDARY POLICY
// ============================================================

export enum AllowedDataType {
  SYNTHETIC = 'SYNTHETIC',
  PUBLIC_NON_PERSONAL = 'PUBLIC_NON_PERSONAL',
  GENERATED_BENCHMARK = 'GENERATED_BENCHMARK',
  CONTROLLED_LAB = 'CONTROLLED_LAB',
}

export enum ProhibitedDomain {
  EMPLOYMENT_DECISIONS = 'EMPLOYMENT_DECISIONS',
  EDUCATION_DECISIONS = 'EDUCATION_DECISIONS',
  CREDIT_DECISIONS = 'CREDIT_DECISIONS',
  HEALTH_DECISIONS = 'HEALTH_DECISIONS',
  LAW_ENFORCEMENT = 'LAW_ENFORCEMENT',
  ESSENTIAL_PUBLIC_SERVICES = 'ESSENTIAL_PUBLIC_SERVICES',
  LEGAL_RIGHTS = 'LEGAL_RIGHTS',
}

export interface ResearchBoundaryPolicy {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  allowedDataTypes: AllowedDataType[];
  prohibitedDomains: ProhibitedDomain[];
  operationalUse: boolean; // Must be false for research
  provenance: Provenance;
  versioning: Versioned;
  createdAt: string;
}

// ============================================================
// RESEARCH BOUNDARY REPOSITORY
// ============================================================

export interface ResearchBoundaryRepository {
  createPolicy(input: Omit<ResearchBoundaryPolicy, 'id' | 'provenance' | 'versioning' | 'createdAt'>, createdBy: string): ResearchBoundaryPolicy;
  getPolicy(caseId: ResearchCaseId): ResearchBoundaryPolicy | null;
  validateUsage(caseId: ResearchCaseId, dataType: AllowedDataType, domain?: ProhibitedDomain): { allowed: boolean; reason?: string };
}

export function createResearchBoundaryRepository(
  ids: IdProvider,
  time: TimeProvider,
): ResearchBoundaryRepository {
  const policies = new Map<string, ResearchBoundaryPolicy>();

  return {
    createPolicy(input, createdBy): ResearchBoundaryPolicy {
      const now = time.now();
      const id = `RBP-${ids.nextEvidenceId()}`;
      const policy: ResearchBoundaryPolicy = {
        ...input,
        id,
        provenance: {
          id: ids.nextProvenanceId(),
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'research-boundary-definition',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        versioning: { version: 1, createdAt: now, createdBy },
        createdAt: now,
      };
      policies.set(id, policy);
      return policy;
    },

    getPolicy(caseId): ResearchBoundaryPolicy | null {
      for (const policy of policies.values()) {
        if (policy.caseId === caseId) return policy;
      }
      return null;
    },

    validateUsage(caseId, dataType, domain?): { allowed: boolean; reason?: string } {
      const policy = this.getPolicy(caseId);
      if (!policy) {
        return { allowed: false, reason: 'No research boundary policy defined' };
      }

      // Check data type
      if (!policy.allowedDataTypes.includes(dataType)) {
        return { allowed: false, reason: `Data type ${dataType} not allowed` };
      }

      // Check prohibited domain
      if (domain && policy.prohibitedDomains.includes(domain)) {
        return { allowed: false, reason: `Domain ${domain} is prohibited` };
      }

      // Check operational use
      if (policy.operationalUse) {
        return { allowed: false, reason: 'Operational use is prohibited for research demonstrator' };
      }

      return { allowed: true };
    },
  };
}
