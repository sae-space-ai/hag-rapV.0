/**
 * HAG-RAP V.2 — Adversarial Testing Framework (WP6)
 * Controlled adversarial testing campaigns
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
// ATTACK TYPES
// ============================================================

export enum AttackType {
  TAMPERED_EVIDENCE = 'TAMPERED_EVIDENCE',
  AUTHORITY_ESCALATION = 'AUTHORITY_ESCALATION',
  PROMPT_INJECTION = 'PROMPT_INJECTION',
  MODEL_OUTPUT_INJECTION = 'MODEL_OUTPUT_INJECTION',
  CROSS_CASE_CONTAMINATION = 'CROSS_CASE_CONTAMINATION',
  PROVENANCE_DELETION = 'PROVENANCE_DELETION',
  CONSTRAINT_BYPASS = 'CONSTRAINT_BYPASS',
  FAKE_HUMAN_APPROVAL = 'FAKE_HUMAN_APPROVAL',
  UNSAFE_REPLANNING = 'UNSAFE_REPLANNING',
  AUDIT_MUTATION = 'AUDIT_MUTATION',
}

// ============================================================
// ATTACK STATUS
// ============================================================

export enum AttackStatus {
  DETECTED = 'DETECTED',
  MITIGATED = 'MITIGATED',
  NOT_DETECTED = 'NOT_DETECTED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
}

// ============================================================
// ADVERSARIAL TEST
// ============================================================

export interface AdversarialTest {
  id: string;
  caseId: ResearchCaseId;
  attackType: AttackType;
  description: string;
  targetComponent: string;
  attackPayload: string;
  expectedDetection: boolean;
  actualDetection: boolean;
  status: AttackStatus;
  executedAt: string;
  executedBy: string;
  detectionMechanism?: string;
  mitigationApplied?: string;
  retestRequired: boolean;
  retestPassed?: boolean;
  retestAt?: string;
  provenance: Provenance;
}

// ============================================================
// ADVERSARIAL CAMPAIGN
// ============================================================

export interface AdversarialCampaign {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  scope: string;
  tests: string[]; // AdversarialTest IDs
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
  startedAt?: string;
  completedAt?: string;
  totalTests: number;
  detectedAttacks: number;
  mitigatedAttacks: number;
  undetectedAttacks: number;
  provenance: Provenance;
}

// ============================================================
// ADVERSARIAL REPOSITORY
// ============================================================

export interface AdversarialRepository {
  // Adversarial Tests
  createAdversarialTest(
    caseId: ResearchCaseId,
    attackType: AttackType,
    description: string,
    targetComponent: string,
    attackPayload: string,
    expectedDetection: boolean,
    executedBy: string,
  ): AdversarialTest;
  
  getAdversarialTest(id: string, caseId: ResearchCaseId): AdversarialTest | null;
  getAdversarialTestsByCase(caseId: ResearchCaseId): AdversarialTest[];
  getAdversarialTestsByType(caseId: ResearchCaseId, attackType: AttackType): AdversarialTest[];
  
  updateTestResult(id: string, caseId: ResearchCaseId, actualDetection: boolean, status: AttackStatus, detectionMechanism?: string): AdversarialTest;
  applyMitigation(id: string, caseId: ResearchCaseId, mitigationApplied: string): AdversarialTest;
  retestAttack(id: string, caseId: ResearchCaseId, retestPassed: boolean, retestedBy: string): AdversarialTest;
  
  // Adversarial Campaigns
  createCampaign(caseId: ResearchCaseId, name: string, description: string, scope: string, createdBy: string): AdversarialCampaign;
  getCampaign(id: string, caseId: ResearchCaseId): AdversarialCampaign | null;
  getCampaignsByCase(caseId: ResearchCaseId): AdversarialCampaign[];
  
  addTestToCampaign(campaignId: string, caseId: ResearchCaseId, testId: string): AdversarialCampaign;
  startCampaign(campaignId: string, caseId: ResearchCaseId): AdversarialCampaign;
  completeCampaign(campaignId: string, caseId: ResearchCaseId): AdversarialCampaign;
  updateCampaignStatistics(campaignId: string, caseId: ResearchCaseId): AdversarialCampaign;
  
  // Statistics
  getDetectionRate(caseId: ResearchCaseId): number;
  getMitigationRate(caseId: ResearchCaseId): number;
  getUndetectedAttacks(caseId: ResearchCaseId): AdversarialTest[];
}

export function createAdversarialRepository(
  ids: IdProvider,
  time: TimeProvider,
): AdversarialRepository {
  const tests = new Map<string, AdversarialTest>();
  const campaigns = new Map<string, AdversarialCampaign>();

  return {
    // Tests
    createAdversarialTest(caseId, attackType, description, targetComponent, attackPayload, expectedDetection, executedBy): AdversarialTest {
      const id = `adv-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const test: AdversarialTest = {
        id,
        caseId,
        attackType,
        description,
        targetComponent,
        attackPayload,
        expectedDetection,
        actualDetection: false,
        status: AttackStatus.NOT_DETECTED,
        executedAt: now,
        executedBy,
        retestRequired: false,
        provenance: {
          id: provId,
          producer: executedBy,
          producerType: ActorType.HUMAN,
          method: 'adversarial-test-execution',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      
      tests.set(id, test);
      return test;
    },

    getAdversarialTest(id, caseId): AdversarialTest | null {
      const test = tests.get(id);
      if (!test) return null;
      if (test.caseId !== caseId) {
        throw new Error(`Case isolation violation: adversarial test ${id} belongs to case ${test.caseId}, not ${caseId}`);
      }
      return test;
    },

    getAdversarialTestsByCase(caseId): AdversarialTest[] {
      return Array.from(tests.values()).filter(t => t.caseId === caseId);
    },

    getAdversarialTestsByType(caseId, attackType): AdversarialTest[] {
      return Array.from(tests.values()).filter(t => t.caseId === caseId && t.attackType === attackType);
    },

    updateTestResult(id, caseId, actualDetection, status, detectionMechanism): AdversarialTest {
      const test = tests.get(id);
      if (!test) throw new Error(`Adversarial test ${id} not found`);
      if (test.caseId !== caseId) {
        throw new Error(`Case isolation violation: adversarial test ${id} belongs to case ${test.caseId}, not ${caseId}`);
      }
      
      const updated: AdversarialTest = {
        ...test,
        actualDetection,
        status,
        detectionMechanism,
        retestRequired: !actualDetection && test.expectedDetection,
      };
      
      tests.set(id, updated);
      return updated;
    },

    applyMitigation(id, caseId, mitigationApplied): AdversarialTest {
      const test = tests.get(id);
      if (!test) throw new Error(`Adversarial test ${id} not found`);
      if (test.caseId !== caseId) {
        throw new Error(`Case isolation violation: adversarial test ${id} belongs to case ${test.caseId}, not ${caseId}`);
      }
      
      const updated: AdversarialTest = {
        ...test,
        status: AttackStatus.MITIGATED,
        mitigationApplied,
      };
      
      tests.set(id, updated);
      return updated;
    },

    retestAttack(id, caseId, retestPassed, retestedBy): AdversarialTest {
      const test = tests.get(id);
      if (!test) throw new Error(`Adversarial test ${id} not found`);
      if (test.caseId !== caseId) {
        throw new Error(`Case isolation violation: adversarial test ${id} belongs to case ${test.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: AdversarialTest = {
        ...test,
        retestPassed,
        retestAt: now,
      };
      
      tests.set(id, updated);
      return updated;
    },

    // Campaigns
    createCampaign(caseId, name, description, scope, createdBy): AdversarialCampaign {
      const id = `camp-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const campaign: AdversarialCampaign = {
        id,
        caseId,
        name,
        description,
        scope,
        tests: [],
        status: 'PLANNED',
        totalTests: 0,
        detectedAttacks: 0,
        mitigatedAttacks: 0,
        undetectedAttacks: 0,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'adversarial-campaign-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      
      campaigns.set(id, campaign);
      return campaign;
    },

    getCampaign(id, caseId): AdversarialCampaign | null {
      const campaign = campaigns.get(id);
      if (!campaign) return null;
      if (campaign.caseId !== caseId) {
        throw new Error(`Case isolation violation: campaign ${id} belongs to case ${campaign.caseId}, not ${caseId}`);
      }
      return campaign;
    },

    getCampaignsByCase(caseId): AdversarialCampaign[] {
      return Array.from(campaigns.values()).filter(c => c.caseId === caseId);
    },

    addTestToCampaign(campaignId, caseId, testId): AdversarialCampaign {
      const campaign = campaigns.get(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
      if (campaign.caseId !== caseId) {
        throw new Error(`Case isolation violation: campaign ${campaignId} belongs to case ${campaign.caseId}, not ${caseId}`);
      }
      
      const updated: AdversarialCampaign = {
        ...campaign,
        tests: [...campaign.tests, testId],
        totalTests: campaign.totalTests + 1,
      };
      
      campaigns.set(campaignId, updated);
      return updated;
    },

    startCampaign(campaignId, caseId): AdversarialCampaign {
      const campaign = campaigns.get(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
      if (campaign.caseId !== caseId) {
        throw new Error(`Case isolation violation: campaign ${campaignId} belongs to case ${campaign.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: AdversarialCampaign = {
        ...campaign,
        status: 'IN_PROGRESS',
        startedAt: now,
      };
      
      campaigns.set(campaignId, updated);
      return updated;
    },

    completeCampaign(campaignId, caseId): AdversarialCampaign {
      const campaign = campaigns.get(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
      if (campaign.caseId !== caseId) {
        throw new Error(`Case isolation violation: campaign ${campaignId} belongs to case ${campaign.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: AdversarialCampaign = {
        ...campaign,
        status: 'COMPLETED',
        completedAt: now,
      };
      
      campaigns.set(campaignId, updated);
      return updated;
    },

    updateCampaignStatistics(campaignId, caseId): AdversarialCampaign {
      const campaign = campaigns.get(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
      if (campaign.caseId !== caseId) {
        throw new Error(`Case isolation violation: campaign ${campaignId} belongs to case ${campaign.caseId}, not ${caseId}`);
      }
      
      let detected = 0;
      let mitigated = 0;
      let undetected = 0;
      
      for (const testId of campaign.tests) {
        const test = tests.get(testId);
        if (test) {
          if (test.actualDetection) detected++;
          if (test.status === AttackStatus.MITIGATED) mitigated++;
          if (test.status === AttackStatus.NOT_DETECTED && test.expectedDetection) undetected++;
        }
      }
      
      const updated: AdversarialCampaign = {
        ...campaign,
        detectedAttacks: detected,
        mitigatedAttacks: mitigated,
        undetectedAttacks: undetected,
      };
      
      campaigns.set(campaignId, updated);
      return updated;
    },

    // Statistics
    getDetectionRate(caseId): number {
      const allTests = this.getAdversarialTestsByCase(caseId);
      if (allTests.length === 0) return 0;
      const detected = allTests.filter(t => t.actualDetection).length;
      return detected / allTests.length;
    },

    getMitigationRate(caseId): number {
      const allTests = this.getAdversarialTestsByCase(caseId);
      if (allTests.length === 0) return 0;
      const mitigated = allTests.filter(t => t.status === AttackStatus.MITIGATED).length;
      return mitigated / allTests.length;
    },

    getUndetectedAttacks(caseId): AdversarialTest[] {
      return Array.from(tests.values()).filter(t => 
        t.caseId === caseId && 
        !t.actualDetection && 
        t.expectedDetection &&
        t.status !== AttackStatus.MITIGATED
      );
    },
  };
}
