/**
 * HAG-RAP V.2 — WP6 Synthetic Demo
 * End-to-end demonstration of Integration, Assurance, and Human Oversight
 */

import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  type EvidenceId,
  type ResearchCaseId,
} from '../core/index.ts';
import { createIntegrationRepository } from '../integration/index.ts';
import { createAssuranceRepository, AssuranceStatus, VerificationMethod } from '../assurance/index.ts';
import { createMonitoringRepository, MonitorEventType, MonitorAction } from '../monitoring/index.ts';
import { createContestabilityRepository, ContestationTargetType, ContestationStatus } from '../contestability/index.ts';
import { createSecurityRepository, SecuritySeverity, SecurityStatus } from '../security/index.ts';
import { createAdversarialRepository, AttackType, AttackStatus } from '../adversarial/index.ts';

export interface WP6DemoResult {
  integratedRuns: number;
  assuranceProperties: number;
  verificationResults: number;
  monitorEvents: number;
  contestations: number;
  securityFindings: number;
  adversarialTests: number;
  adversarialCampaigns: number;
}

export function runWP6Demo(): WP6DemoResult {
  const ids = createSequentialIdProvider();
  const time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
  const caseId = ids.nextResearchCaseId();

  const integrationRepo = createIntegrationRepository(ids, time);
  const assuranceRepo = createAssuranceRepository(ids, time);
  const monitoringRepo = createMonitoringRepository(ids, time);
  const contestabilityRepo = createContestabilityRepository(ids, time);
  const securityRepo = createSecurityRepository(ids, time);
  const adversarialRepo = createAdversarialRepository(ids, time);

  // ============================================================
  // INTEGRATED COGNITIVE RUN
  // ============================================================

  const inputEvidence = ['ev-1', 'ev-2', 'ev-3'] as EvidenceId[];
  
  const integratedRun = integrationRepo.createIntegratedRun(
    caseId,
    inputEvidence,
    'v1.0',
    'wm-v2',
    'plan-001' as any,
    {
      policyId: 'policy-001',
      permissions: ['read', 'analyze', 'propose'],
      boundaries: ['no-operational-decisions', 'human-approval-required'],
    },
    'system-orchestrator'
  );

  integrationRepo.addReasoningRun(integratedRun.id, caseId, 'reasoning-001' as any);
  integrationRepo.addCausalModel(integratedRun.id, caseId, 'causal-001' as any);
  integrationRepo.addAbstraction(integratedRun.id, caseId, 'abstraction-001' as any);
  integrationRepo.updateRunStatus(integratedRun.id, caseId, 'RUNNING', 'system-orchestrator');
  integrationRepo.addHumanDecision(integratedRun.id, caseId, 'decision-001' as any);
  integrationRepo.updateAssuranceStatus(integratedRun.id, caseId, 'VERIFIED');
  integrationRepo.updateRunStatus(integratedRun.id, caseId, 'COMPLETED', 'system-orchestrator');

  // ============================================================
  // ASSURANCE FRAMEWORK
  // ============================================================

  // Create assurance properties
  const prop1 = assuranceRepo.createProperty(
    caseId,
    'Authority Boundary Integrity',
    'System must not exceed defined authority boundaries',
    'AUTHORITY',
    'CRITICAL',
    'All actions must remain within authorized scope'
  );

  const prop2 = assuranceRepo.createProperty(
    caseId,
    'Non-Negotiable Constraint Protection',
    'NON_NEGOTIABLE constraints cannot be modified',
    'GOVERNANCE',
    'CRITICAL',
    'Constraints marked NON_NEGOTIABLE must remain immutable'
  );

  const prop3 = assuranceRepo.createProperty(
    caseId,
    'Case Isolation',
    'Data from one case cannot leak to another',
    'SECURITY',
    'HIGH',
    'Each research case must maintain strict isolation'
  );

  // Create invariants
  const inv1 = assuranceRepo.createInvariant(
    caseId,
    prop1.id,
    'Authority Check',
    'Verify all actions are within authority policy',
    'forall action: action.policy_id in authorized_policies',
    'All system actions',
    VerificationMethod.STATIC_ANALYSIS
  );

  const inv2 = assuranceRepo.createInvariant(
    caseId,
    prop2.id,
    'Constraint Immutability',
    'NON_NEGOTIABLE constraints cannot be changed',
    'forall c: c.modifiability = NON_NEGOTIABLE => c.value = const(c.value)',
    'Constraint modifications',
    VerificationMethod.FORMAL_PROOF
  );

  // Create constraint checks
  assuranceRepo.createConstraintCheck(
    caseId,
    inv1.id,
    'AUTHORITY_BOUNDARY',
    'PASS',
    ['ev-audit-1'] as EvidenceId[],
    'assurance-verifier'
  );

  assuranceRepo.createConstraintCheck(
    caseId,
    inv2.id,
    'NON_NEGOTIABLE',
    'PASS',
    ['ev-audit-2'] as EvidenceId[],
    'assurance-verifier'
  );

  // Create verification results
  assuranceRepo.createVerificationResult(
    caseId,
    prop1.id,
    VerificationMethod.STATIC_ANALYSIS,
    'VERIFIED',
    0.95,
    ['ev-verify-1'] as EvidenceId[],
    ['Static analysis covers all code paths'],
    ['Dynamic verification not performed'],
    'assurance-engineer',
    'CodeQL',
    '2.10.0'
  );

  assuranceRepo.createVerificationResult(
    caseId,
    prop2.id,
    VerificationMethod.FORMAL_PROOF,
    'VERIFIED',
    0.99,
    ['ev-verify-2'] as EvidenceId[],
    ['Formal model is complete'],
    ['Proof assistant limitations'],
    'assurance-engineer',
    'Coq',
    '8.15'
  );

  // Create assurance evidence
  assuranceRepo.createAssuranceEvidence(caseId, prop1.id, 'ev-1' as EvidenceId, 'DIRECT', 0.9);
  assuranceRepo.createAssuranceEvidence(caseId, prop2.id, 'ev-2' as EvidenceId, 'DIRECT', 0.95);

  // Create residual risks
  const risk1 = assuranceRepo.createResidualRisk(
    caseId,
    prop1.id,
    'Potential authority boundary bypass via edge case',
    'LOW',
    'LOW',
    'Additional runtime monitoring implemented',
    true,
    'risk-owner',
    'Risk accepted due to low likelihood and effective mitigation'
  );

  // Create assurance case
  const assuranceCase = assuranceRepo.createAssuranceCase(
    caseId,
    'HAG-RAP V.2 Safety Case',
    'Comprehensive assurance case for HAG-RAP V.2 system',
    'Demonstrate safe and trustworthy cognitive AI operation',
    [prop1.id, prop2.id, prop3.id]
  );

  assuranceRepo.updateAssuranceCaseStatus(assuranceCase.id, caseId, AssuranceStatus.VERIFIED, 0.95);

  // ============================================================
  // RUNTIME MONITORING
  // ============================================================

  // Create monitors
  const monitor1 = monitoringRepo.createMonitor(
    caseId,
    'Authority Monitor',
    'Monitors for authority boundary violations',
    'Authority Module',
    [MonitorEventType.AUTHORITY_VIOLATION],
    'security-engineer'
  );

  const monitor2 = monitoringRepo.createMonitor(
    caseId,
    'Constraint Monitor',
    'Monitors for constraint violations',
    'Planning Module',
    [MonitorEventType.CONSTRAINT_VIOLATION],
    'security-engineer'
  );

  const monitor3 = monitoringRepo.createMonitor(
    caseId,
    'Uncertainty Monitor',
    'Monitors for critical uncertainty levels',
    'Reasoning Module',
    [MonitorEventType.CRITICAL_UNCERTAINTY],
    'security-engineer'
  );

  // Create monitor events
  monitoringRepo.createMonitorEvent(
    caseId,
    monitor1.id,
    MonitorEventType.AUTHORITY_VIOLATION,
    'HIGH',
    'Attempted action outside authority boundary',
    'Authority Module',
    ['ev-sec-1'] as EvidenceId[],
    MonitorAction.SAFE_STOP,
    'authority-monitor'
  );

  monitoringRepo.createMonitorEvent(
    caseId,
    monitor2.id,
    MonitorEventType.CONSTRAINT_VIOLATION,
    'CRITICAL',
    'Attempted modification of NON_NEGOTIABLE constraint',
    'Planning Module',
    ['ev-sec-2'] as EvidenceId[],
    MonitorAction.SAFE_STOP,
    'constraint-monitor'
  );

  monitoringRepo.createMonitorEvent(
    caseId,
    monitor3.id,
    MonitorEventType.CRITICAL_UNCERTAINTY,
    'MEDIUM',
    'Uncertainty level exceeded threshold',
    'Reasoning Module',
    ['ev-sec-3'] as EvidenceId[],
    MonitorAction.REVIEW_REQUIRED,
    'uncertainty-monitor'
  );

  // Resolve some events
  const events = monitoringRepo.getMonitorEventsByCase(caseId);
  if (events.length > 0) {
    monitoringRepo.resolveMonitorEvent(events[0].id, caseId, 'security-engineer', 'False positive - action was within bounds');
  }

  // ============================================================
  // CONTESTABILITY
  // ============================================================

  // File contestations
  const cont1 = contestabilityRepo.createContestation(
    caseId,
    ContestationTargetType.REASONING,
    'reasoning-001',
    'Inference chain contains unsupported assumption',
    ['ev-contest-1'] as EvidenceId[],
    'human-reviewer-001',
    ActorType.HUMAN,
    'human-reviewer-001'
  );

  const cont2 = contestabilityRepo.createContestation(
    caseId,
    ContestationTargetType.PLAN,
    'plan-001',
    'Plan does not adequately address identified risks',
    ['ev-contest-2'] as EvidenceId[],
    'human-reviewer-002',
    ActorType.HUMAN,
    'human-reviewer-002'
  );

  // Update contestation status
  contestabilityRepo.updateContestationStatus(cont1.id, caseId, ContestationStatus.UNDER_REVIEW, 'review-committee', 'Reviewing assumption validity');
  contestabilityRepo.resolveContestation(cont1.id, caseId, 'Assumption validated with additional evidence', 'Reasoning run updated with new evidence', 'review-committee');

  contestabilityRepo.updateContestationStatus(cont2.id, caseId, ContestationStatus.ACCEPTED, 'review-committee', 'Risk mitigation plan accepted');

  // ============================================================
  // SECURITY
  // ============================================================

  // Create security findings
  const sec1 = securityRepo.createSecurityFinding(
    caseId,
    SecuritySeverity.CRITICAL,
    'Authentication Module',
    'Potential authentication bypass vulnerability',
    ['ev-sec-find-1'] as EvidenceId[],
    'security-scanner'
  );

  const sec2 = securityRepo.createSecurityFinding(
    caseId,
    SecuritySeverity.HIGH,
    'Data Storage',
    'Sensitive data not encrypted at rest',
    ['ev-sec-find-2'] as EvidenceId[],
    'security-scanner'
  );

  const sec3 = securityRepo.createSecurityFinding(
    caseId,
    SecuritySeverity.MEDIUM,
    'API Gateway',
    'Rate limiting not configured',
    ['ev-sec-find-3'] as EvidenceId[],
    'security-scanner'
  );

  // Contain and remediate
  securityRepo.containSecurityFinding(sec1.id, caseId, ['Disabled affected endpoint', 'Enabled additional logging'], 'security-engineer');
  securityRepo.remediateSecurityFinding(sec1.id, caseId, 'Implemented proper authentication checks', 'security-engineer');
  securityRepo.verifyRemediation(sec1.id, caseId, true, 'security-tester');
  securityRepo.resolveSecurityFinding(sec1.id, caseId, 'Vulnerability patched and verified', 'security-engineer');

  securityRepo.containSecurityFinding(sec2.id, caseId, ['Enabled encryption for sensitive fields'], 'security-engineer');

  // ============================================================
  // ADVERSARIAL TESTING
  // ============================================================

  // Create adversarial campaign
  const campaign = adversarialRepo.createCampaign(
    caseId,
    'WP6 Security Validation Campaign',
    'Comprehensive adversarial testing of WP6 security controls',
    'All WP6 modules',
    'security-team-lead'
  );

  adversarialRepo.startCampaign(campaign.id, caseId);

  // Create adversarial tests
  const adv1 = adversarialRepo.createAdversarialTest(
    caseId,
    AttackType.TAMPERED_EVIDENCE,
    'Attempt to inject tampered evidence',
    'Evidence Module',
    '{"evidence": "tampered_data"}',
    true,
    'red-team-001'
  );

  const adv2 = adversarialRepo.createAdversarialTest(
    caseId,
    AttackType.AUTHORITY_ESCALATION,
    'Attempt to escalate authority beyond policy',
    'Authority Module',
    '{"action": "escalate", "target": "admin"}',
    true,
    'red-team-001'
  );

  const adv3 = adversarialRepo.createAdversarialTest(
    caseId,
    AttackType.FAKE_HUMAN_APPROVAL,
    'Attempt to fabricate human approval',
    'Human Governance Module',
    '{"approval": "fake", "actor": "AI"}',
    true,
    'red-team-001'
  );

  const adv4 = adversarialRepo.createAdversarialTest(
    caseId,
    AttackType.CROSS_CASE_CONTAMINATION,
    'Attempt to access data from another case',
    'Case Isolation',
    '{"target_case": "other-case", "action": "read"}',
    true,
    'red-team-001'
  );

  // Add tests to campaign
  adversarialRepo.addTestToCampaign(campaign.id, caseId, adv1.id);
  adversarialRepo.addTestToCampaign(campaign.id, caseId, adv2.id);
  adversarialRepo.addTestToCampaign(campaign.id, caseId, adv3.id);
  adversarialRepo.addTestToCampaign(campaign.id, caseId, adv4.id);

  // Update test results
  adversarialRepo.updateTestResult(adv1.id, caseId, true, AttackStatus.DETECTED, 'Evidence validation checks');
  adversarialRepo.updateTestResult(adv2.id, caseId, true, AttackStatus.DETECTED, 'Authority boundary enforcement');
  adversarialRepo.updateTestResult(adv3.id, caseId, true, AttackStatus.DETECTED, 'Human actor type validation');
  adversarialRepo.updateTestResult(adv4.id, caseId, true, AttackStatus.DETECTED, 'Case isolation enforcement');

  // Apply mitigations
  adversarialRepo.applyMitigation(adv1.id, caseId, 'Enhanced evidence validation');
  adversarialRepo.applyMitigation(adv2.id, caseId, 'Strengthened authority checks');

  // Complete campaign
  adversarialRepo.updateCampaignStatistics(campaign.id, caseId);
  adversarialRepo.completeCampaign(campaign.id, caseId);

  return {
    integratedRuns: 1,
    assuranceProperties: 3,
    verificationResults: 2,
    monitorEvents: 3,
    contestations: 2,
    securityFindings: 3,
    adversarialTests: 4,
    adversarialCampaigns: 1,
  };
}
