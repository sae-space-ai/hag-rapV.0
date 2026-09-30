/**
 * HAG-RAP V.2 — Order 5 Final Tests (WP6)
 * Final comprehensive tests to reach 100+ new tests for WP6
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
import { createAssuranceRepository, VerificationMethod } from '../src/assurance/index.ts';
import { createMonitoringRepository, MonitorEventType, MonitorAction } from '../src/monitoring/index.ts';
import { createContestabilityRepository, ContestationTargetType } from '../src/contestability/index.ts';
import { createSecurityRepository, SecuritySeverity } from '../src/security/index.ts';
import { createAdversarialRepository, AttackType } from '../src/adversarial/index.ts';

describe('WP6 - Final Comprehensive Tests', () => {
  let ids: ReturnType<typeof createSequentialIdProvider>;
  let time: ReturnType<typeof createDeterministicTimeProvider>;
  let caseId: ResearchCaseId;

  beforeEach(() => {
    ids = createSequentialIdProvider();
    time = createDeterministicTimeProvider('2025-01-01T00:00:00.000Z');
    caseId = ids.nextResearchCaseId();
  });

  // ============================================================
  // INTEGRATION - PROVENANCE & METADATA
  // ============================================================

  describe('Integration - Provenance & Metadata', () => {
    it('T181: integrated run has start time', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      expect(run.startTime).toBeDefined();
    });

    it('T182: completed run has end time', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      const updated = repo.updateRunStatus(run.id, caseId, 'COMPLETED', 'system');
      expect(updated.endTime).toBeDefined();
    });

    it('T183: integrated run has authority context', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(
        caseId,
        ['ev-1'] as EvidenceId[],
        'v1',
        'wm-v1',
        'plan-1' as any,
        { policyId: 'policy-1', permissions: ['read', 'write'], boundaries: ['no-deletion'] },
        'system'
      );
      expect(run.authorityContext.policyId).toBe('policy-1');
      expect(run.authorityContext.permissions).toContain('read');
    });

    it('T184: integrated run tracks world model version', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v2.5', 'plan-1' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      expect(run.worldModelVersion).toBe('wm-v2.5');
    });

    it('T185: integrated run tracks plan version', () => {
      const repo = createIntegrationRepository(ids, time);
      const run = repo.createIntegratedRun(caseId, ['ev-1'] as EvidenceId[], 'v1', 'wm-v1', 'plan-v3' as any, { policyId: 'p1', permissions: [], boundaries: [] }, 'system');
      expect(run.planVersion).toBe('plan-v3');
    });
  });

  // ============================================================
  // ASSURANCE - VERIFICATION METHODS
  // ============================================================

  describe('Assurance - Verification Methods', () => {
    it('T186: uses DYNAMIC_TESTING method', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      const result = repo.createVerificationResult(caseId, prop.id, VerificationMethod.DYNAMIC_TESTING, 'VERIFIED', 0.85, [], [], [], 'tester');
      expect(result.method).toBe(VerificationMethod.DYNAMIC_TESTING);
    });

    it('T187: uses FORMAL_PROOF method', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'CORRECTNESS', 'CRITICAL', 'Spec');
      const result = repo.createVerificationResult(caseId, prop.id, VerificationMethod.FORMAL_PROOF, 'VERIFIED', 0.99, [], [], [], 'mathematician');
      expect(result.method).toBe(VerificationMethod.FORMAL_PROOF);
    });

    it('T188: uses MODEL_CHECKING method', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      const result = repo.createVerificationResult(caseId, prop.id, VerificationMethod.MODEL_CHECKING, 'VERIFIED', 0.95, [], [], [], 'tool');
      expect(result.method).toBe(VerificationMethod.MODEL_CHECKING);
    });

    it('T189: verification result has confidence', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      const result = repo.createVerificationResult(caseId, prop.id, VerificationMethod.STATIC_ANALYSIS, 'VERIFIED', 0.92, [], [], [], 'verifier');
      expect(result.confidence).toBe(0.92);
    });

    it('T190: verification result has limitations', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      const result = repo.createVerificationResult(caseId, prop.id, VerificationMethod.STATIC_ANALYSIS, 'VERIFIED', 0.9, [], [], ['Limitation 1', 'Limitation 2'], 'verifier');
      expect(result.limitations).toContain('Limitation 1');
      expect(result.limitations).toContain('Limitation 2');
    });

    it('T191: verification result has tool info', () => {
      const repo = createAssuranceRepository(ids, time);
      const prop = repo.createProperty(caseId, 'Prop', 'Desc', 'SAFETY', 'HIGH', 'Spec');
      const result = repo.createVerificationResult(caseId, prop.id, VerificationMethod.STATIC_ANALYSIS, 'VERIFIED', 0.9, [], [], [], 'verifier', 'ToolName', '1.0.0');
      expect(result.toolUsed).toBe('ToolName');
      expect(result.toolVersion).toBe('1.0.0');
    });
  });

  // ============================================================
  // MONITORING - EVENT DETAILS
  // ============================================================

  describe('Monitoring - Event Details', () => {
    it('T192: monitor event has component', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      const event = repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Authority Module', [], MonitorAction.WARN, 'sys');
      expect(event.component).toBe('Authority Module');
    });

    it('T193: monitor event has evidence', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      const event = repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Component', ['ev-1', 'ev-2'] as EvidenceId[], MonitorAction.WARN, 'sys');
      expect(event.evidence).toContain('ev-1');
      expect(event.evidence).toContain('ev-2');
    });

    it('T194: monitor event has provenance', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      const event = repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Component', [], MonitorAction.WARN, 'monitor-system');
      expect(event.provenance).toBeDefined();
      expect(event.provenance.producer).toBe('monitor-system');
    });

    it('T195: monitor tracks events detected', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Component', [], MonitorAction.WARN, 'sys');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'MEDIUM', 'Desc', 'Component', [], MonitorAction.LOG, 'sys');
      const updated = repo.getMonitor(monitor.id, caseId);
      expect(updated?.eventsDetected).toBe(2);
    });

    it('T196: monitor tracks last event time', () => {
      const repo = createMonitoringRepository(ids, time);
      const monitor = repo.createMonitor(caseId, 'Mon', 'Desc', 'Component', [MonitorEventType.AUTHORITY_VIOLATION], 'eng');
      repo.createMonitorEvent(caseId, monitor.id, MonitorEventType.AUTHORITY_VIOLATION, 'HIGH', 'Desc', 'Component', [], MonitorAction.WARN, 'sys');
      const updated = repo.getMonitor(monitor.id, caseId);
      expect(updated?.lastEventAt).toBeDefined();
    });
  });

  // ============================================================
  // CONTESTABILITY - DETAILS
  // ============================================================

  describe('Contestability - Details', () => {
    it('T197: contestation has grounds', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Invalid assumption in inference chain', [], 'challenger', ActorType.HUMAN, 'filer');
      expect(cont.grounds).toBe('Invalid assumption in inference chain');
    });

    it('T198: contestation has challenger info', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'human-expert', ActorType.HUMAN, 'filer');
      expect(cont.challenger).toBe('human-expert');
      expect(cont.challengerType).toBe(ActorType.HUMAN);
    });

    it('T199: contestation has filed timestamp', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      expect(cont.filedAt).toBeDefined();
    });

    it('T200: contestation resolution has resulting change', () => {
      const repo = createContestabilityRepository(ids, time);
      const cont = repo.createContestation(caseId, ContestationTargetType.REASONING, 'r1', 'Grounds', [], 'challenger', ActorType.HUMAN, 'filer');
      const resolved = repo.resolveContestation(cont.id, caseId, 'Resolved', 'Reasoning updated with new evidence', 'committee');
      expect(resolved.resultingChange).toBe('Reasoning updated with new evidence');
    });
  });

  // ============================================================
  // SECURITY - FINDING LIFECYCLE
  // ============================================================

  describe('Security - Finding Lifecycle', () => {
    it('T201: security finding has detected timestamp', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      expect(finding.detectedAt).toBeDefined();
    });

    it('T202: security finding has detector', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'security-scanner');
      expect(finding.detectedBy).toBe('security-scanner');
    });

    it('T203: security finding containment has timestamp', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.CRITICAL, 'Module', 'Issue', [], 'scanner');
      const contained = repo.containSecurityFinding(finding.id, caseId, ['Action'], 'engineer');
      expect(contained.containedAt).toBeDefined();
    });

    it('T204: security finding remediation has timestamp', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      const remediated = repo.remediateSecurityFinding(finding.id, caseId, 'Fix plan', 'engineer');
      expect(remediated.remediationStartedAt).toBeDefined();
    });

    it('T205: security finding verification has timestamp', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.HIGH, 'Module', 'Issue', [], 'scanner');
      repo.containSecurityFinding(finding.id, caseId, ['Action'], 'engineer');
      repo.remediateSecurityFinding(finding.id, caseId, 'Fix', 'engineer');
      const verified = repo.verifyRemediation(finding.id, caseId, true, 'tester');
      expect(verified.remediationVerifiedAt).toBeDefined();
    });

    it('T206: security finding resolution has timestamp', () => {
      const repo = createSecurityRepository(ids, time);
      const finding = repo.createSecurityFinding(caseId, SecuritySeverity.MEDIUM, 'Module', 'Issue', [], 'scanner');
      const resolved = repo.resolveSecurityFinding(finding.id, caseId, 'Fixed', 'engineer');
      expect(resolved.resolvedAt).toBeDefined();
    });
  });

  // ============================================================
  // ADVERSARIAL - TEST DETAILS
  // ============================================================

  describe('Adversarial - Test Details', () => {
    it('T207: adversarial test has target component', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Evidence Module', '{}', true, 'team');
      expect(test.targetComponent).toBe('Evidence Module');
    });

    it('T208: adversarial test has attack payload', () => {
      const repo = createAdversarialRepository(ids, time);
      const payload = '{"malicious": "data"}';
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', payload, true, 'team');
      expect(test.attackPayload).toBe(payload);
    });

    it('T209: adversarial test has expected detection', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      expect(test.expectedDetection).toBe(true);
    });

    it('T210: adversarial test has execution timestamp', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      expect(test.executedAt).toBeDefined();
    });

    it('T211: adversarial test has executor', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'red-team-001');
      expect(test.executedBy).toBe('red-team-001');
    });

    it('T212: adversarial test has detection mechanism', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      const updated = repo.updateTestResult(test.id, caseId, true, 'DETECTED' as any, 'Input validation');
      expect(updated.detectionMechanism).toBe('Input validation');
    });

    it('T213: adversarial test has provenance', () => {
      const repo = createAdversarialRepository(ids, time);
      const test = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'red-team');
      expect(test.provenance).toBeDefined();
      expect(test.provenance.producer).toBe('red-team');
    });
  });

  // ============================================================
  // ADVERSARIAL - CAMPAIGN DETAILS
  // ============================================================

  describe('Adversarial - Campaign Details', () => {
    it('T214: campaign has scope', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'All WP6 modules', 'lead');
      expect(campaign.scope).toBe('All WP6 modules');
    });

    it('T215: campaign has start timestamp', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'lead');
      const started = repo.startCampaign(campaign.id, caseId);
      expect(started.startedAt).toBeDefined();
    });

    it('T216: campaign has completion timestamp', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'lead');
      repo.startCampaign(campaign.id, caseId);
      const completed = repo.completeCampaign(campaign.id, caseId);
      expect(completed.completedAt).toBeDefined();
    });

    it('T217: campaign has provenance', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'team-lead');
      expect(campaign.provenance).toBeDefined();
      expect(campaign.provenance.producer).toBe('team-lead');
    });

    it('T218: campaign tracks total tests', () => {
      const repo = createAdversarialRepository(ids, time);
      const campaign = repo.createCampaign(caseId, 'Campaign', 'Desc', 'Scope', 'lead');
      const test1 = repo.createAdversarialTest(caseId, AttackType.TAMPERED_EVIDENCE, 'Test', 'Module', '{}', true, 'team');
      const test2 = repo.createAdversarialTest(caseId, AttackType.AUTHORITY_ESCALATION, 'Test', 'Module', '{}', true, 'team');
      repo.addTestToCampaign(campaign.id, caseId, test1.id);
      const updated = repo.addTestToCampaign(campaign.id, caseId, test2.id);
      expect(updated.totalTests).toBe(2);
    });
  });
});
