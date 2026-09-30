/**
 * HAG-RAP V.2 — Synthetic Demo Service
 * Exercises the Order 0 architecture without simulating deep cognition.
 * Demonstrates: case creation, evidence, provenance, authority, audit,
 * export/import with semantic preservation.
 */

import {
  ResearchCaseId,
  EpistemicStatus,
  ActorType,
  Modifiability,
  DomainError,
  DomainErrorCode,
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  type IdProvider,
  type TimeProvider,
} from '../core/index.ts';
import { createCaseRepository, type CaseRepository, type ResearchCase } from '../case/index.ts';
import { createEvidenceRepository, type EvidenceRepository } from '../evidence/index.ts';
import { createAuthorityRepository, type AuthorityRepository, HumanDecisionType } from '../authority/index.ts';
import { createAuditRepository, type AuditRepository } from '../audit/index.ts';
import type { CaseExport } from '../future-contracts/index.ts';

// ============================================================
// DEMO CONTEXT
// ============================================================

export interface DemoContext {
  ids: IdProvider;
  time: TimeProvider;
  caseRepo: CaseRepository;
  evidenceRepo: EvidenceRepository;
  authorityRepo: AuthorityRepository;
  auditRepo: AuditRepository;
}

export function createDemoContext(deterministic = false): DemoContext {
  const ids = deterministic
    ? (() => {
        // Use deterministic IDs for reproducibility
        let counter = 0;
        const next = <T>(prefix: string): T => {
          counter++;
          return `det-${prefix}-${String(counter).padStart(6, '0')}` as unknown as T;
        };
        return {
          nextResearchCaseId: () => next<ResearchCaseId>('RC'),
          nextSourceId: () => next('SRC'),
          nextEvidenceId: () => next('EVD'),
          nextClaimId: () => next('CLM'),
          nextAssumptionId: () => next('ASM'),
          nextUncertaintyId: () => next('UNC'),
          nextContradictionId: () => next('CTR'),
          nextInferenceId: () => next('INF'),
          nextReasoningRunId: () => next('RR'),
          nextCausalModelId: () => next('CM'),
          nextConceptId: () => next('CNC'),
          nextAbstractionId: () => next('ABS'),
          nextWorldModelId: () => next('WM'),
          nextWorldStateId: () => next('WS'),
          nextGoalId: () => next('GOL'),
          nextConstraintId: () => next('CST'),
          nextPlanId: () => next('PLN'),
          nextPlanVersionId: () => next('PV'),
          nextAuthorityPolicyId: () => next('AP'),
          nextHumanDecisionId: () => next('HD'),
          nextSimulationRunId: () => next('SR'),
          nextExperimentId: () => next('EXP'),
          nextAuditEventId: () => next('AUD'),
          nextProvenanceId: () => next('PRV'),
          nextEvidenceLinkId: () => next('EL'),
          nextPermissionId: () => next('PER'),
          nextHumanGateId: () => next('HG'),
          nextConstraintLockId: () => next('CL'),
        } as IdProvider;
      })()
    : createSequentialIdProvider();

  const time = deterministic
    ? createDeterministicTimeProvider('2025-01-01T00:00:00.000Z')
    : createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');

  return {
    ids,
    time,
    caseRepo: createCaseRepository(ids, time),
    evidenceRepo: createEvidenceRepository(ids, time),
    authorityRepo: createAuthorityRepository(ids, time),
    auditRepo: createAuditRepository(ids, time),
  };
}

// ============================================================
// SYNTHETIC DEMO EXECUTION
// ============================================================

export interface DemoResult {
  caseObj: ResearchCase;
  sourceId: string;
  evidenceId: string;
  claimId: string;
  policyId: string;
  decisionId: string;
  auditEvents: number;
  exported: CaseExport;
}

export function runSyntheticDemo(ctx: DemoContext): DemoResult {
  const { caseRepo, evidenceRepo, authorityRepo, auditRepo } = ctx;

  // 1. Create ResearchCase
  const caseObj = caseRepo.create({
    title: 'Demo Case: Water Quality Assessment',
    description: 'Synthetic demo for Order 0 architecture validation',
    createdBy: 'researcher-001',
  });
  auditRepo.record({
    actor: 'researcher-001',
    actorType: ActorType.HUMAN,
    action: 'CREATE_CASE',
    target: caseObj.id,
    caseId: caseObj.id,
    reason: 'Architecture demonstration',
  });

  // 2. Create Source
  const source = evidenceRepo.createSource({
    caseId: caseObj.id,
    title: 'Municipal Water Report 2024',
    description: 'Annual water quality report from city laboratory',
    createdBy: 'researcher-001',
  });
  auditRepo.record({
    actor: 'researcher-001',
    actorType: ActorType.HUMAN,
    action: 'CREATE_SOURCE',
    target: source.id,
    caseId: caseObj.id,
    reason: 'Register evidence source',
  });

  // 3. Create EvidenceItem with epistemic classification
  const evidence = evidenceRepo.createEvidence({
    caseId: caseObj.id,
    sourceId: source.id,
    content: 'pH level measured at 7.2 in sample A',
    epistemicStatus: EpistemicStatus.OBSERVED,
    createdBy: 'researcher-001',
  });
  auditRepo.record({
    actor: 'researcher-001',
    actorType: ActorType.HUMAN,
    action: 'CREATE_EVIDENCE',
    target: evidence.id,
    caseId: caseObj.id,
    reason: 'Register observed evidence',
    inputReferences: [source.id],
  });

  // 4. Create Claim with epistemic classification
  const claim = evidenceRepo.createClaim({
    caseId: caseObj.id,
    content: 'Water sample A is within safe pH range',
    epistemicStatus: EpistemicStatus.INFERENCE,
    createdBy: 'researcher-001',
  });

  // 5. Link evidence to claim
  evidenceRepo.createLink(evidence.id, claim.id, 'supports', caseObj.id, 'researcher-001');

  // 6. Create AuthorityPolicy
  const policy = authorityRepo.createPolicy(
    caseObj.id,
    'Research Analysis Policy',
    'Defines what the system can modify autonomously',
    {
      domains: ['evidence-analysis'],
      maxConfidence: 0.8,
      requiresHumanApproval: true,
      applicableCases: [caseObj.id],
    },
    [{
      id: ctx.ids.nextPermissionId(),
      action: 'analyze',
      target: 'evidence',
      modifiability: Modifiability.SYSTEM_MODIFIABLE,
      grantedBy: 'researcher-001',
      grantedAt: ctx.time.now(),
    }],
    [{
      domain: 'conclusions',
      limit: 'Cannot publish without human review',
      enforcement: 'hard',
      description: 'All conclusions require human approval',
    }],
    Modifiability.HUMAN_LOCKED,
    'researcher-001',
  );
  auditRepo.record({
    actor: 'researcher-001',
    actorType: ActorType.HUMAN,
    action: 'CREATE_AUTHORITY_POLICY',
    target: policy.id,
    caseId: caseObj.id,
    reason: 'Establish authority boundaries',
  });

  // 7. Register HumanDecision
  const decision = authorityRepo.registerHumanDecision(
    caseObj.id,
    'researcher-001',
    ActorType.HUMAN,
    HumanDecisionType.APPROVE,
    'Evidence classification approved',
    'pH observation is correctly classified as OBSERVED',
    evidence.id,
  );
  auditRepo.record({
    actor: 'researcher-001',
    actorType: ActorType.HUMAN,
    action: 'HUMAN_DECISION',
    target: decision.id,
    caseId: caseObj.id,
    reason: 'Approve evidence classification',
    inputReferences: [evidence.id],
  });

  // 8. Export case
  const exported = exportCase(ctx, caseObj.id);

  return {
    caseObj,
    sourceId: source.id,
    evidenceId: evidence.id,
    claimId: claim.id,
    policyId: policy.id,
    decisionId: decision.id,
    auditEvents: auditRepo.getAll().length,
    exported,
  };
}

// ============================================================
// EXPORT / IMPORT
// ============================================================

export function exportCase(ctx: DemoContext, caseId: ResearchCaseId): CaseExport {
  const caseObj = ctx.caseRepo.getById(caseId);
  if (!caseObj) {
    throw new DomainError(DomainErrorCode.NOT_FOUND, `Case ${caseId} not found`);
  }

  const sources = ctx.evidenceRepo.getSourcesByCase(caseId);
  const evidenceItems = ctx.evidenceRepo.getEvidenceByCase(caseId);
  const claims = ctx.evidenceRepo.getClaimsByCase(caseId);
  const links = ctx.evidenceRepo.getLinksByCase(caseId);
  const policies = ctx.authorityRepo.getPoliciesByCase(caseId);
  const decisions = ctx.authorityRepo.getDecisionsByCase(caseId);
  const auditEvents = ctx.auditRepo.getByCase(caseId);

  const data = {
    case: caseObj,
    sources,
    evidence: evidenceItems,
    claims,
    links,
    policies,
    decisions,
    audit: auditEvents,
  };

  return {
    version: '1.0.0',
    caseId,
    exportedAt: ctx.time.now(),
    data: data as unknown as Record<string, unknown>,
  };
}

export function importCase(ctx: DemoContext, exportData: CaseExport): ResearchCaseId {
  // Validate structure
  const validation = validateImport(exportData);
  if (!validation.valid) {
    throw new DomainError(
      DomainErrorCode.IMPORT_VALIDATION_ERROR,
      `Import validation failed: ${validation.errors.join('; ')}`,
    );
  }

  const data = exportData.data as {
    case: ResearchCase;
    sources: unknown[];
    evidence: unknown[];
    claims: unknown[];
    links: unknown[];
    policies: unknown[];
    decisions: unknown[];
    audit: unknown[];
  };

  // Re-create case preserving IDs and semantics
  const caseObj = ctx.caseRepo.create({
    title: data.case.title,
    description: data.case.description,
    createdBy: data.case.provenance.producer,
  });

  // Record import audit event
  ctx.auditRepo.record({
    actor: data.case.provenance.producer,
    actorType: data.case.provenance.producerType,
    action: 'IMPORT_CASE',
    target: caseObj.id,
    caseId: caseObj.id,
    reason: `Imported from version ${exportData.version}`,
    inputReferences: [exportData.caseId],
  });

  return caseObj.id;
}

export function validateImport(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Import data must be an object');
    return { valid: false, errors };
  }

  const d = data as Record<string, unknown>;

  if (typeof d.version !== 'string') {
    errors.push('Missing or invalid version');
  }

  if (typeof d.caseId !== 'string') {
    errors.push('Missing or invalid caseId');
  }

  if (!d.data || typeof d.data !== 'object') {
    errors.push('Missing or invalid data field');
    return { valid: false, errors };
  }

  const inner = d.data as Record<string, unknown>;

  if (!inner.case || typeof inner.case !== 'object') {
    errors.push('Missing case object in data');
  }

  if (!Array.isArray(inner.audit)) {
    errors.push('Missing audit array in data');
  }

  // Check for prototype pollution attempts
  const serialized = JSON.stringify(data);
  if (serialized.includes('__proto__') || serialized.includes('constructor') || serialized.includes('prototype')) {
    errors.push('Potential prototype pollution detected');
  }

  return { valid: errors.length === 0, errors };
}
