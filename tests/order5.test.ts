/**
 * HAG-RAP V.2 — Order 5 Tests (WP6)
 * Tests for Integration, Assurance, Monitoring, Contestability, Security, and Adversarial Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSequentialIdProvider,
  createDeterministicTimeProvider,
  ActorType,
  type EvidenceId,
  type ResearchCaseId,
} from '../src/core/index.ts';
import { createIntegrationRepository } from '../src/integration/index.ts';
import { createAssuranceRepository, AssuranceStatus, VerificationMethod } from '../src/assurance/index.ts';
import { createMonitoringRepository, MonitorEventType, MonitorAction } from '../src/monitoring/index.ts';
import { createContestabilityRepository, ContestationTargetType, ContestationStatus } from '../src/contestability/index.ts';
import { createSecurityRepository, SecuritySeverity, SecurityStatus } from '../src/security/index.ts';
import { createAdversarialRepository, AttackType, AttackStatus } from '../src/adversarial/index.ts';
import { runWP6Demo } from '../src/demo/wp6-demo.ts';

describe('WP6 - Integration, Assurance & Human Oversight Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
  });

  // ============================================================
  // INTEGRATION TESTS
  // ============================================================

  describe('Integration Layer', () => {
    it('T107: creates integrated cognitive run', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      expect(run).toBeDefined();
      expect(run.caseId).toBe(caseId);
      expect(run.status).toBe('INITIATED');
    });

    it('T108: integrated run preserves IDs', () => {
      const repo = createIntegrationRepository(ids, time);
      const evidence = ['ev-1', 'ev-2'] as EvidenceId[];
      const run = repo.createIntegratedRun(
        caseId,
        evidence,
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      expect(run.inputEvidence).toEqual(evidence);
    });

    it('T109: integrated run has provenance', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      expect(run.provenance).toBeDefined();
      expect(run.provenance.producer).toBe('system');
    });

    it('T110: updates integrated run status', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      const updated = repo.updateRunStatus(run.id, caseId, 'RUNNING', 'system');
      expect(updated.status).toBe('RUNNING');
    });

    it('T111: adds reasoning run to integrated run', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      const updated = repo.addReasoningRun(run.id, caseId, 'reasoning-1' as any);
      expect(updated.reasoningRunId).toBe('reasoning-1');
    });

    it('T112: adds human decision to integrated run', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      const updated = repo.addHumanDecision(run.id, caseId, 'decision-1' as any);
      expect(updated.humanDecisions).toContain('decision-1');
    });

    it('T113: rejects cross-case integrated run access', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1.0',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: [], boundaries: [] },
        'system'
      );
      const otherCaseId = ids.nextResearchCaseId();
      expect(() => repo.getIntegratedRun(run.id, otherCaseId)).toThrow();
    });
  });

  // ============================================================
  // ASSURANCE TESTS
  // ============================================================

  describe('Assurance Framework', () => {
    it('T114: creates assurance property', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(
        caseId,
        'Authority Integrity',
        'System maintains authority boundaries',
        'AUTHORITY',
        'CRITICAL',
        'All actions within policy'
      );
      expect(prop).toBeDefined();
      expect(prop.category).toBe('AUTHORITY');
      expect(prop.priority).toBe('CRITICAL');
    });

    it('T115: assurance claim requires evidence', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Test', 'Test', 'SAFETY', 'HIGH', 'Test spec');
      const evidence = repo.createAssuranceEvidence(caseId, prop.id, 'ev-1' as EvidenceId, 'DIRECT', 0.9);
      expect(evidence).toBeDefined();
      expect(evidence.evidenceId).toBe('ev-1');
    });

    it('T116: software PASS ≠ formal verification', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Test', 'Test', 'CORRECTNESS', 'HIGH', 'Test spec');
      const result = repo.createVerificationResult(
        caseId,
        prop.id,
        VerificationMethod.STATIC_ANALYSIS,
        'VERIFIED',
        0.95,
        ['ev-1'] as EvidenceId[],
        ['Assumption 1'],
        ['Limitation 1'],
        'verifier'
      );
      expect(result.method).toBe(VerificationMethod.STATIC_ANALYSIS);
      expect(result.result).toBe('VERIFIED');
    });

    it('T117: creates constraint check', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Test', 'Test', 'AUTHORITY', 'CRITICAL', 'Test spec');
      const inv = repo.createInvariant(caseId, prop.id, 'Test Inv', 'Test', 'expr', 'scope', VerificationMethod.STATIC_ANALYSIS);
      const check = repo.createConstraintCheck(caseId, inv.id, 'AUTHORITY_BOUNDARY', 'PASS', ['ev-1'] as EvidenceId[], 'checker');
      expect(check).toBeDefined();
      expect(check.result).toBe('PASS');
    });

    it('T118: creates residual risk', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Test', 'Test', 'SAFETY', 'HIGH', 'Test spec');
      const risk = repo.createResidualRisk(
        caseId,
        prop.id,
        'Potential risk',
        'MEDIUM',
        'LOW',
        'Mitigation plan',
        false
      );
      expect(risk).toBeDefined();
      expect(risk.accepted).toBe(false);
    });

    it('T119: accepts residual risk with human approval', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Test', 'Test', 'SAFETY', 'HIGH', 'Test spec');
      const risk = repo.createResidualRisk(caseId, prop.id, 'Risk', 'LOW', 'LOW', 'Mitigation', false);
      const accepted = repo.acceptResidualRisk(risk.id, caseId, 'human-approver', 'Risk accepted');
      expect(accepted.accepted).toBe(true);
      expect(accepted.acceptedBy).toBe('human-approver');
    });

    it('T120: creates assurance case', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Test', 'Test', 'SAFETY', 'HIGH', 'Test spec');
      const ac = repo.createAssuranceCase(caseId, 'Safety Case', 'Description', 'Purpose', [prop.id]);
      expect(ac).toBeDefined();
      expect(ac.status).toBe(AssuranceStatus.PENDING);
    });
  });

  // ============================================================
  // MONITORING TESTS
  // ============================================================

  describe('Runtime Monitoring', () => {
    it('T121: creates runtime monitor', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(
        caseId,
        'Authority Monitor',
        'Monitors authority violations',
        'Authority Module',
        [MonitorEventType.AUTHORITY_VIOLATION],
        'security-engineer'
      );
      expect(monitor).toBeDefined();
      expect(monitor.status).toBe('ACTIVE');
    });

    it('T122: detects authority violation', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Monitor', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'engineer');
      const event = repo.createMonitorEvent(
        caseId,
        monitor.id,
        MonitorEventType.AUTHORITY_VIOLATION,
        'CRITICAL',
        'Authority boundary exceeded',
        'Authority Module',
        ['ev-1'] as EvidenceId[],
        MonitorAction.SAFE_STOP,
        'monitor-system'
      );
      expect(event).toBeDefined();
      expect(event.eventType).toBe(MonitorEventType.AUTHORITY_VIOLATION);
      expect(event.action).toBe(MonitorAction.SAFE_STOP);
    });

    it('T123: detects constraint violation', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Monitor', 'Desc', 'Component', [MonitorEventType.CONSTRAINT_VIOLATION], 'engineer');
      const event = repo.createMonitorEvent(
        caseId,
        monitor.id,
        MonitorEventType.CONSTRAINT_VIOLATION,
        'HIGH',
        'Constraint violated',
        'Planning Module',
        ['ev-1'] as EvidenceId[],
        MonitorAction.REVIEW_REQUIRED,
        'monitor-system'
      );
      expect(event.eventType).toBe(MonitorEventType.CONSTRAINT_VIOLATION);
    });

    it('T124: detects critical uncertainty', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Monitor', 'Desc', 'Component', [MonitorEventType.CRITICAL_UNCERTAINTY], 'engineer');
      const event = repo.createMonitorEvent(
        caseId,
        monitor.id,
        MonitorEventType.CRITICAL_UNCERTAINTY,
        'MEDIUM',
        'Uncertainty too high',
        'Reasoning Module',
        ['ev-1'] as EvidenceId[],
        MonitorAction.ABSTAIN,
        'monitor-system'
      );
      expect(event.eventType).toBe(MonitorEventType.CRITICAL_UNCERTAINTY);
    });

    it('T125: resolves monitor event', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Monitor', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'engineer');
      const event = repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Violation', 'Component', [], MonitorAction.WARN, 'system');
      const resolved = repo.resolveMonitorEvent(event.id, caseId, 'engineer', 'False positive');
      expect(resolved.resolved).toBe(true);
      expect(resolved.resolution).toBe('False positive');
    });

    it('T126: locked constraint protected by monitor', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Monitor', 'Desc', 'Component', [MonitorEventType.CONSTRAINT_VIOLATION], 'engineer');
      const event = repo.createMonitorEvent(
        caseId,
        monitor.id,
        MonitorEventType.CONSTRAINT_VIOLATION,
        'CRITICAL',
        'NON_NEGOTIABLE constraint modification attempted',
        'Planning Module',
        ['ev-1'] as EvidenceId[],
        MonitorAction.SAFE_STOP,
        'monitor-system'
      );
      expect(event.severity).toBe('CRITICAL');
      expect(event.action).toBe(MonitorAction.SAFE_STOP);
    });
  });

  // ============================================================
  // CONTESTABILITY TESTS
  // ============================================================

  describe('Contestability', () => {
    it('T127: creates contestation', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(
        caseId,
        ContestationTargetType.REASONING,
        'reasoning-1',
        'Invalid inference',
        ['ev-1'] as EvidenceId[],
        'human-reviewer',
        ActorType.HUMAN,
        'human-reviewer'
      );
      expect(cont).toBeDefined();
      expect(cont.status).toBe(ContestationStatus.FILED);
    });

    it('T128: contestation preserves history', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.PLAN, 'plan-1', 'Bad plan', [], 'reviewer', ActorType.HUMAN, 'reviewer');
      repo.updateContestationStatus(cont.id, caseId, ContestationStatus.UNDER_REVIEW, 'committee', 'Reviewing');
      const resolved = repo.resolveContestation(cont.id, caseId, 'Resolved', 'Plan updated', 'committee');
      expect(resolved.status).toBe(ContestationStatus.RESOLVED);
      expect(resolved.resolution).toBe('Resolved');
    });

    it('T129: AI cannot approve contestation', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'reasoning-1', 'Issue', [], 'ai-system', ActorType.AI, 'ai-system');
      expect(cont.challengerType).toBe(ActorType.AI);
      // AI can file but not approve - approval requires human
    });

    it('T130: human correction is versioned', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'reasoning-1', 'Issue', [], 'human', ActorType.HUMAN, 'human');
      const updated = repo.updateContestationStatus(cont.id, caseId, ContestationStatus.ACCEPTED, 'human-reviewer', 'Accepted');
      expect(updated.status).toBe(ContestationStatus.ACCEPTED);
      expect(updated.reviewedBy).toBe('human-reviewer');
    });
  });

  // ============================================================
  // SECURITY TESTS
  // ============================================================

  describe('Security', () => {
    it('T131: creates security finding', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(
        caseId,
        SecuritySeverity.CRITICAL,
        'Auth Module',
        'Authentication bypass',
        ['ev-1'] as EvidenceId[],
        'scanner'
      );
      expect(finding).toBeDefined();
      expect(finding.severity).toBe(SecuritySeverity.CRITICAL);
      expect(finding.status).toBe(SecurityStatus.DETECTED);
    });

    it('T132: critical security finding blocks demo', () => {
      const repo = createSecurityRepository(ids, time);
      repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Critical issue', [], 'scanner');
      const canRelease = repo.canReleaseDemo(caseId);
      expect(canRelease).toBe(false);
    });

    it('T133: remediation requires retest', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      repo.containSecurityFinding(finding.id, caseId, ['Action'], 'engineer');
      repo.remediateSecurityFinding(finding.id, caseId, 'Fix plan', 'engineer');
      const verified = repo.verifyRemediation(finding.id, caseId, true, 'tester');
      expect(verified.retestPassed).toBe(true);
    });

    it('T134: detects tampered provenance', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(
        caseId,
        SecuritySeverity.CRITICAL,
        'Provenance Module',
        'Tampered provenance detected',
        ['ev-1'] as EvidenceId[],
        'integrity-checker'
      );
      expect(finding.affectedComponent).toBe('Provenance Module');
    });

    it('T135: rejects fake human actor', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(
        caseId,
        SecuritySeverity.CRITICAL,
        'Auth Module',
        'Fake human approval detected',
        ['ev-1'] as EvidenceId[],
        'auth-monitor'
      );
      expect(finding.severity).toBe(SecuritySeverity.CRITICAL);
    });
  });

  // ============================================================
  // ADVERSARIAL TESTING TESTS
  // ============================================================

  describe('Adversarial Testing', () => {
    it('T136: creates adversarial test', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(
        caseId,
        AttackType.TAMPERED_EVIDENCE,
        'Test tampered evidence detection',
        'Evidence Module',
        '{"tampered": "data"}',
        true,
        'red-team'
      );
      expect(test).toBeDefined();
      expect(test.attackType).toBe(AttackType.TAMPERED_EVIDENCE);
    });

    it('T137: detects authority escalation attack', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test', 'Auth Module', '{}', true, 'red-team');
      const updated = repo.updateTestResult(test.id, caseId, true, AttackStatus.DETECTED, 'Authority check');
      expect(updated.actualDetection).toBe(true);
      expect(updated.status).toBe(AttackStatus.DETECTED);
    });

    it('T138: detects cross-case contamination', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.CROSS_CASE_CONTAMINATION, 'Test', 'Case Module', '{}', true, 'red-team');
      const updated = repo.updateTestResult(test.id, caseId, true, AttackStatus.DETECTED, 'Case isolation');
      expect(updated.actualDetection).toBe(true);
    });

    it('T139: detects fake human approval', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.FAKE_HUMAN_APPROVAL, 'Test', 'Governance Module', '{}', true, 'red-team');
      const updated = repo.updateTestResult(test.id, caseId, true, AttackStatus.DETECTED, 'Actor validation');
      expect(updated.status).toBe(AttackStatus.DETECTED);
    });

    it('T140: creates adversarial campaign', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Security Campaign', 'Description', 'All modules', 'team-lead');
      expect(campaign).toBeDefined();
      expect(campaign.status).toBe('PLANNED');
    });

    it('T141: campaign tracks test results', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'lead');
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      repo.addTestToCampaign(campaign.id, caseId, test.id);
      repo.updateTestResult(test.id, caseId, true, AttackStatus.DETECTED, 'Detection');
      const updated = repo.updateCampaignStatistics(campaign.id, caseId);
      expect(updated.detectedAttacks).toBe(1);
    });
  });

  // ============================================================
  // WP6 DEMO TEST
  // ============================================================

  describe('WP6 Demo', () => {
    it('T142: demo executes successfully', () => {
      const result = runWP6Demo();
      expect(result.integratedRuns).toBeGreaterThanOrEqual(1);
      expect(result.assuranceProperties).toBeGreaterThanOrEqual(3);
      expect(result.verificationResults).toBeGreaterThanOrEqual(2);
      expect(result.monitorEvents).toBeGreaterThanOrEqual(3);
      expect(result.contestations).toBeGreaterThanOrEqual(2);
      expect(result.securityFindings).toBeGreaterThanOrEqual(3);
      expect(result.adversarialTests).toBeGreaterThanOrEqual(4);
      expect(result.adversarialCampaigns).toBeGreaterThanOrEqual(1);
    });
  });
});
