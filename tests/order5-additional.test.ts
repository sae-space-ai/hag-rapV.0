/**
 * HAG-RAP V.2 — Order 5 Additional Tests (WP6)
 * Additional comprehensive tests for WP6 modules
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

describe('WP6 - Additional Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
  });

  // ============================================================
  // ADDITIONAL INTEGRATION TESTS
  // ============================================================

  describe('Integration - Additional', () => {
    it('T143: adds causal model to integrated run', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      const updated = repo.addCausalModel(run.id, caseId, 'causal-1' as any);
      expect(updated.causalModelId).toBe('causal-1');
    });

    it('T144: adds abstraction to integrated run', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      const updated = repo.addAbstraction(run.id, caseId, 'abs-1' as any);
      expect(updated.abstractions).toContain('abs-1');
    });

    it('T145: adds audit event to integrated run', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      const updated = repo.addAuditEvent(run.id, caseId, 'audit-1' as any);
      expect(updated.auditTrail).toContain('audit-1');
    });

    it('T146: updates assurance status', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      const updated = repo.updateAssuranceStatus(run.id, caseId, 'VERIFIED');
      expect(updated.assuranceStatus).toBe('VERIFIED');
    });

    it('T147: retrieves integrated runs by case', () => {
      const repo = createIntegrationRepository(ids, time);
      repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      repo.createIntegratedRun(caseId, ['ev-2'] as EvidenceId[], 'v1', 'wm-v1', 'plan-2' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      const runs = repo.getIntegratedRunsByCase(caseId);
      expect(runs.length).toBe(2);
    });
  });

  // ============================================================
  // ADDITIONAL ASSURANCE TESTS
  // ============================================================

  describe('Assurance - Additional', () => {
    it('T148: retrieves properties by case', () => {
      const repo = createAssuranceRepository(ids, time);
      repo.createProperty(caseId, 'Prop1', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      repo.createProperty(caseId, 'Prop2', 'Desc', 'SECURITY', 'MEDIUM', 'Spec');
      const props = repo.getPropertiesByCase(caseId);
      expect(props.length).toBe(2);
    });

    it('T149: retrieves invariants by case', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      repo.createInvariant(caseId, prop.id, 'Inv1', 'Desc', 'expr', 'scope', VerificationMethod.STATIC_ANALYSIS);
      repo.createInvariant(caseId, prop.id, 'Inv2', 'Desc', 'expr', 'scope', VerificationMethod.DYNAMIC_TESTING);
      const invs = repo.getInvariantsByCase(caseId);
      expect(invs.length).toBe(2);
    });

    it('T150: retrieves verification results by case', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      repo.createVerificationResult(caseId, prop.id, VerificationMethod.STATIC_ANALYSIS, 'VERIFIED', 0.9, [], [], [], 'verifier');
      repo.createVerificationResult(caseId, prop.id, VerificationMethod.DYNAMIC_TESTING, 'FAILED', 0.5, [], [], [], 'verifier');
      const results = repo.getVerificationResultsByCase(caseId);
      expect(results.length).toBe(2);
    });

    it('T151: retrieves residual risks by case', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      repo.createResidualRisk(caseId, prop.id, 'Risk1', 'HIGH', 'MEDIUM', 'Mitigation', false);
      repo.createResidualRisk(caseId, prop.id, 'Risk2', 'LOW', 'LOW', 'Mitigation', true, 'approver', 'Rationale');
      const risks = repo.getResidualRisksByCase(caseId);
      expect(risks.length).toBe(2);
    });

    it('T152: retrieves assurance cases by case', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      repo.createAssuranceCase(caseId, 'Case1', 'Desc', 'Purpose', [prop.id]);
      repo.createAssuranceCase(caseId, 'Case2', 'Desc', 'Purpose', [prop.id]);
      const cases = repo.getAssuranceCasesByCase(caseId);
      expect(cases.length).toBe(2);
    });

    it('T153: updates assurance case status', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      const ac = repo.createAssuranceCase(caseId, 'Case', 'Desc', 'Purpose', [prop.id]);
      const updated = repo.updateAssuranceCaseStatus(ac.id, caseId, AssuranceStatus.VERIFIED, 0.95);
      expect(updated.status).toBe(AssuranceStatus.VERIFIED);
      expect(updated.overallConfidence).toBe(0.95);
    });
  });

  // ============================================================
  // ADDITIONAL MONITORING TESTS
  // ============================================================

  describe('Monitoring - Additional', () => {
    it('T154: retrieves monitors by case', () => {
      const repo = createMonitoringRepository(ids, time);
      repo.createMonitor(caseId, 'Mon1', 'Desc', 'Comp', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      repo.createMonitor(caseId, 'Mon2', 'Desc', 'Comp', [MonitorEventType.CONSTRAINT_VIOLATION], 'eng');
      const monitors = repo.getMonitorsByCase(caseId);
      expect(monitors.length).toBe(2);
    });

    it('T155: updates monitor status', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Comp', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      const updated = repo.updateMonitorStatus(monitor.id, caseId, 'PAUSED');
      expect(updated.status).toBe('PAUSED');
    });

    it('T156: retrieves events by type', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Comp', [MonitorEventType.AUTHORITY_VIOLATION, MonitorEventType.CONSTRAINT_VIOLATION], 'eng');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Comp', [], MonitorAction.WARN, 'sys');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.CONSTRAINT_VIOLATION, 'MEDIUM', 'Desc', 'Comp', [], MonitorAction.LOG, 'sys');
      const events = repo.getMonitorEventsByType(caseId, MonitorEventType.AUTHORITY_VIOLATION);
      expect(events.length).toBe(1);
    });

    it('T157: gets event count by type', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Comp', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Comp', [], MonitorAction.WARN, 'sys');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'MEDIUM', 'Desc', 'Comp', [], MonitorAction.LOG, 'sys');
      const count = repo.getEventCountByType(caseId, MonitorEventType.AUTHORITY_VIOLATION);
      expect(count).toBe(2);
    });

    it('T158: gets unresolved event count', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Comp', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Comp', [], MonitorAction.WARN, 'sys');
      const event2 = repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'MEDIUM', 'Desc', 'Comp', [], MonitorAction.LOG, 'sys');
      repo.resolveMonitorEvent(event2.id, caseId, 'eng', 'Resolved');
      const count = repo.getUnresolvedEventCount(caseId);
      expect(count).toBe(1);
    });

    it('T159: gets critical event count', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Comp', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'CRITICAL', 'Desc', 'Comp', [], MonitorAction.SAFE_STOP, 'sys');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Comp', [], MonitorAction.WARN, 'sys');
      const count = repo.getCriticalEventCount(caseId);
      expect(count).toBe(1);
    });
  });

  // ============================================================
  // ADDITIONAL CONTESTABILITY TESTS
  // ============================================================

  describe('Contestability - Additional', () => {
    it('T160: retrieves contestations by case', () => {
      const repo = createContestabilityRepository(ids, time);
      repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      repo.createContestation(caseId, ContestationTargetType.PLAN, 'p1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      const contestations = repo.getContestationsByCase(caseId);
      expect(contestations.length).toBe(2);
    });

    it('T161: retrieves contestations by target', () => {
      const repo = createContestabilityRepository(ids, time);
      repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds2', [], 'challenger', ActorType.HUMAN, 'filer');
      repo.createContestation(caseId, ContestationTargetType.PLAN, 'p1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      const contestations = repo.getContestationsByTarget(caseId, ContestationTargetType.REASONING, 'r1');
      expect(contestations.length).toBe(2);
    });

    it('T162: withdraws contestation', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      const withdrawn = repo.withdrawContestation(cont.id, caseId, 'challenger', 'No longer relevant');
      expect(withdrawn.status).toBe(ContestationStatus.WITHDRAWN);
    });

    it('T163: adds audit event to contestation', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      const updated = repo.addAuditEvent(cont.id, caseId, 'audit-1');
      expect(updated.auditTrail).toContain('audit-1');
    });
  });

  // ============================================================
  // ADDITIONAL SECURITY TESTS
  // ============================================================

  describe('Security - Additional', () => {
    it('T164: retrieves findings by case', () => {
      const repo = createSecurityRepository(ids, time);
      repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      repo.createSecurityFinding(caseId, SecuritySeverity.MEDIUM, 'Module', 'Issue', [], 'scanner');
      const findings = repo.getSecurityFindingsByCase(caseId);
      expect(findings.length).toBe(2);
    });

    it('T165: retrieves findings by severity', () => {
      const repo = createSecurityRepository(ids, time);
      repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Issue', [], 'scanner');
      repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Issue2', [], 'scanner');
      const findings = repo.getSecurityFindingsBySeverity(caseId, SecuritySeverity.CRITICAL);
      expect(findings.length).toBe(2);
    });

    it('T166: gets unresolved critical findings', () => {
      const repo = createSecurityRepository(ids, time);
      const f1 = repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Issue', [], 'scanner');
      repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Issue2', [], 'scanner');
      repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue3', [], 'scanner');
      repo.resolveSecurityFinding(f1.id, caseId, 'Resolved', 'engineer');
      const unresolved = repo.getUnresolvedCriticalFindings(caseId);
      expect(unresolved.length).toBe(1);
    });

    it('T167: updates security status', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      const updated = repo.updateSecurityStatus(finding.id, caseId, SecurityStatus.INVESTIGATING, 'engineer');
      expect(updated.status).toBe(SecurityStatus.INVESTIGATING);
    });

    it('T168: contains security finding', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Issue', [], 'scanner');
      const contained = repo.containSecurityFinding(finding.id, caseId, ['Action1', 'Action2'], 'engineer');
      expect(contained.status).toBe(SecurityStatus.CONTAINED);
      expect(contained.containmentActions).toContain('Action1');
    });

    it('T169: remediates security finding', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      const remediated = repo.remediateSecurityFinding(finding.id, caseId, 'Fix plan', 'engineer');
      expect(remediated.status).toBe(SecurityStatus.REMEDIATING);
      expect(remediated.remediationPlan).toBe('Fix plan');
    });

    it('T170: resolves security finding', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.MEDIUM, 'Module', 'Issue', [], 'scanner');
      const resolved = repo.resolveSecurityFinding(finding.id, caseId, 'Issue fixed', 'engineer');
      expect(resolved.status).toBe(SecurityStatus.RESOLVED);
      expect(resolved.resolution).toBe('Issue fixed');
    });
  });

  // ============================================================
  // ADDITIONAL ADVERSARIAL TESTS
  // ============================================================

  describe('Adversarial - Additional', () => {
    it('T171: retrieves tests by case', () => {
      const repo = createAdversarialRepository(ids, time);
      repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test', 'Module', '{}', true, 'team');
      const tests = repo.getAdversarialTestsByCase(caseId);
      expect(tests.length).toBe(2);
    });

    it('T172: retrieves tests by type', () => {
      const repo = createAdversarialRepository(ids, time);
      repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test1', 'Module', '{}', true, 'team');
      repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test2', 'Module', '{}', true, 'team');
      repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test3', 'Module', '{}', true, 'team');
      const tests = repo.getAdversarialTestsByType(caseId, AttackType.TAMPERED_EVIDENCE);
      expect(tests.length).toBe(2);
    });

    it('T173: applies mitigation to test', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      const mitigated = repo.applyMitigation(test.id, caseId, 'Enhanced validation');
      expect(mitigated.status).toBe(AttackStatus.MITIGATED);
      expect(mitigated.mitigationApplied).toBe('Enhanced validation');
    });

    it('T174: retests attack', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      repo.updateTestResult(test.id, caseId, true, AttackStatus.DETECTED, 'Detection');
      repo.applyMitigation(test.id, caseId, 'Mitigation');
      const retested = repo.retestAttack(test.id, caseId, true, 'tester');
      expect(retested.retestPassed).toBe(true);
      expect(retested.retestAt).toBeDefined();
    });

    it('T175: retrieves campaigns by case', () => {
      const repo = createAdversarialRepository(ids, time);
      repo.createCampaign(caseId, 'Campaign1', 'Desc', 'Scope', 'lead');
      repo.createCampaign(caseId, 'Campaign2', 'Desc', 'Scope', 'lead');
      const campaigns = repo.getCampaignsByCase(caseId);
      expect(campaigns.length).toBe(2);
    });

    it('T176: starts campaign', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'lead');
      const started = repo.startCampaign(campaign.id, caseId);
      expect(started.status).toBe('IN_PROGRESS');
      expect(started.startedAt).toBeDefined();
    });

    it('T177: completes campaign', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'lead');
      repo.startCampaign(campaign.id, caseId);
      const completed = repo.completeCampaign(campaign.id, caseId);
      expect(completed.status).toBe('COMPLETED');
      expect(completed.completedAt).toBeDefined();
    });

    it('T178: gets detection rate', () => {
      const repo = createAdversarialRepository(ids, time);
      const test1 = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      const test2 = repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test', 'Module', '{}', true, 'team');
      repo.updateTestResult(test1.id, caseId, true, AttackStatus.DETECTED, 'Detection');
      repo.updateTestResult(test2.id, caseId, false, AttackStatus.NOT_DETECTED);
      const rate = repo.getDetectionRate(caseId);
      expect(rate).toBe(0.5);
    });

    it('T179: gets mitigation rate', () => {
      const repo = createAdversarialRepository(ids, time);
      const test1 = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      const test2 = repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test', 'Module', '{}', true, 'team');
      repo.updateTestResult(test1.id, caseId, true, AttackStatus.DETECTED, 'Detection');
      repo.applyMitigation(test1.id, caseId, 'Mitigation');
      repo.updateTestResult(test2.id, caseId, true, AttackStatus.DETECTED, 'Detection');
      const rate = repo.getMitigationRate(caseId);
      expect(rate).toBe(0.5);
    });

    it('T180: gets undetected attacks', () => {
      const repo = createAdversarialRepository(ids, time);
      const test1 = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      const test2 = repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test', 'Module', '{}', true, 'team');
      repo.updateTestResult(test1.id, caseId, false, AttackStatus.NOT_DETECTED);
      repo.updateTestResult(test2.id, caseId, true, AttackStatus.DETECTED, 'Detection');
      const undetected = repo.getUndetectedAttacks(caseId);
      expect(undetected.length).toBe(1);
    });
  });
});
