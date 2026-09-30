/**
 * HAG-RAP V.2 — Workspace Module (WP2)
 * ScientificCaseWorkspace orchestrator and ScientificCasePackage.
 * INVARIANT: Orchestrator, not God Object.
 */

import {
  ResearchCaseId,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';
import { EvidenceGraphRepository, createEvidenceGraphRepository } from '../evidence-graph/index.ts';
import { RequirementsRepository, createRequirementsRepository } from '../requirements/index.ts';
import { TrustworthinessRepository, createTrustworthinessRepository } from '../trustworthiness/index.ts';
import { ResearchBoundaryRepository, createResearchBoundaryRepository } from '../research-boundary/index.ts';
import { ValidationRepository, createValidationRepository } from '../validation/index.ts';
import { ExplanationService, createExplanationService } from '../explanation/index.ts';

// ============================================================
// SCIENTIFIC CASE WORKSPACE
// ============================================================

export interface ScientificCaseWorkspace {
  caseId: ResearchCaseId;
  evidenceGraph: EvidenceGraphRepository;
  requirements: RequirementsRepository;
  trustworthiness: TrustworthinessRepository;
  researchBoundary: ResearchBoundaryRepository;
  validation: ValidationRepository;
  explanation: ExplanationService;
}

export function createScientificCaseWorkspace(
  caseId: ResearchCaseId,
  ids: IdProvider,
  time: TimeProvider,
): ScientificCaseWorkspace {
  const evidenceGraph = createEvidenceGraphRepository(ids, time);
  const requirements = createRequirementsRepository(ids, time);
  const trustworthiness = createTrustworthinessRepository(ids, time);
  const researchBoundary = createResearchBoundaryRepository(ids, time);
  const validation = createValidationRepository(ids, time);
  const explanation = createExplanationService(evidenceGraph, requirements, trustworthiness, time);

  return {
    caseId,
    evidenceGraph,
    requirements,
    trustworthiness,
    researchBoundary,
    validation,
    explanation,
  };
}

// ============================================================
// SCIENTIFIC CASE PACKAGE (export/import)
// ============================================================

export interface ScientificCasePackage {
  version: string;
  caseId: ResearchCaseId;
  exportedAt: string;
  data: {
    sources: any[];
    evidence: any[];
    claims: any[];
    assumptions: any[];
    uncertainties: any[];
    contradictions: any[];
    relations: any[];
    requirements: any[];
    risks: any[];
    controls: any[];
    validationCriteria: any[];
    fundamentalRights: any[];
    humanOversight: any[];
    abstentionPolicies: any[];
    dataGovernance: any[];
    securityRequirements: any[];
    researchBoundary: any;
    metricDefinitions: any[];
    acceptanceCriteria: any[];
    benchmarkSpecifications: any[];
    scientificScenarios: any[];
    validationProtocols: any[];
  };
}

export function exportScientificCase(workspace: ScientificCaseWorkspace, time: TimeProvider): ScientificCasePackage {
  const { caseId, evidenceGraph, requirements, trustworthiness, researchBoundary, validation } = workspace;

  return {
    version: '2.0.0',
    caseId,
    exportedAt: time.now(),
    data: {
      sources: evidenceGraph.getSourcesByCase(caseId),
      evidence: evidenceGraph.getEvidenceByCase(caseId),
      claims: evidenceGraph.getClaimsByCase(caseId),
      assumptions: evidenceGraph.getAssumptionsByCase(caseId),
      uncertainties: evidenceGraph.getUncertaintiesByCase(caseId),
      contradictions: evidenceGraph.getContradictionsByCase(caseId),
      relations: evidenceGraph.getRelationsByCase(caseId),
      requirements: requirements.getRequirementsByCase(caseId),
      risks: requirements.getRisksByCase(caseId),
      controls: requirements.getControlsByCase(caseId),
      validationCriteria: requirements.getValidationCriteriaByCase(caseId),
      fundamentalRights: trustworthiness.getFundamentalRightsByCase(caseId),
      humanOversight: trustworthiness.getHumanOversightByCase(caseId),
      abstentionPolicies: trustworthiness.getAbstentionPoliciesByCase(caseId),
      dataGovernance: trustworthiness.getDataGovernanceByCase(caseId),
      securityRequirements: trustworthiness.getSecurityRequirementsByCase(caseId),
      researchBoundary: researchBoundary.getPolicy(caseId),
      metricDefinitions: validation.getMetricDefinitionsByCase(caseId),
      acceptanceCriteria: validation.getAcceptanceCriteriaByCase(caseId),
      benchmarkSpecifications: validation.getBenchmarkSpecificationsByCase(caseId),
      scientificScenarios: validation.getScientificScenariosByCase(caseId),
      validationProtocols: validation.getValidationProtocolsByCase(caseId),
    },
  };
}

export function validateScientificCasePackage(pkg: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!pkg || typeof pkg !== 'object') {
    errors.push('Package must be an object');
    return { valid: false, errors };
  }

  const p = pkg as any;

  if (typeof p.version !== 'string') {
    errors.push('Missing or invalid version');
  }

  if (typeof p.caseId !== 'string') {
    errors.push('Missing or invalid caseId');
  }

  if (!p.data || typeof p.data !== 'object') {
    errors.push('Missing or invalid data field');
    return { valid: false, errors };
  }

  // Check for prototype pollution
  const serialized = JSON.stringify(pkg);
  if (serialized.includes('__proto__') || serialized.includes('constructor')) {
    errors.push('Potential prototype pollution detected');
  }

  return { valid: errors.length === 0, errors };
}
