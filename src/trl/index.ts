/**
 * HAG-RAP V.2 — TRL Evidence Package (WP7)
 * Technology Readiness Level evidence with strict epistemic honesty
 * 
 * CRITICAL INVARIANTS:
 * - Tests/build ≠ TRL4
 * - SELF-VALIDATION ≠ INDEPENDENT VALIDATION
 * - Missing evidence = NOT_DEMONSTRATED
 * - No fabricated TRL claims
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
// TRL LEVELS
// ============================================================

export enum TRLLevel {
  TRL1 = 'TRL1', // Basic principles observed
  TRL2 = 'TRL2', // Technology concept formulated
  TRL3 = 'TRL3', // Experimental proof of concept
  TRL4 = 'TRL4', // Technology validated in lab
  TRL5 = 'TRL5', // Technology validated in relevant environment
  TRL6 = 'TRL6', // Technology demonstrated in relevant environment
  TRL7 = 'TRL7', // System prototype demonstration in operational environment
  TRL8 = 'TRL8', // System complete and qualified
  TRL9 = 'TRL9', // Actual system proven in operational environment
}

// ============================================================
// EVIDENCE STATUS
// ============================================================

export enum EvidenceStatus {
  NOT_DEMONSTRATED = 'NOT_DEMONSTRATED',
  PARTIALLY_DEMONSTRATED = 'PARTIALLY_DEMONSTRATED',
  DEMONSTRATED = 'DEMONSTRATED',
  INDEPENDENTLY_VALIDATED = 'INDEPENDENTLY_VALIDATED',
}

// ============================================================
// TRL EVIDENCE CATEGORY
// ============================================================

export enum TRLEvidenceCategory {
  REQUIREMENTS = 'REQUIREMENTS',
  CAPABILITIES = 'CAPABILITIES',
  VERIFICATION = 'VERIFICATION',
  BENCHMARK = 'BENCHMARK',
  VALIDATION = 'VALIDATION',
  HUMAN_STUDY = 'HUMAN_STUDY',
  REPRODUCIBILITY = 'REPRODUCIBILITY',
  ASSURANCE = 'ASSURANCE',
  SECURITY = 'SECURITY',
}

// ============================================================
// TRL EVIDENCE ITEM
// ============================================================

export interface TRLEvidenceItem {
  id: string;
  caseId: ResearchCaseId;
  category: TRLEvidenceCategory;
  description: string;
  status: EvidenceStatus;
  evidenceIds: EvidenceId[];
  limitations: string[];
  openFailures: string[];
  provenance: Provenance;
  createdAt: string;
}

// ============================================================
// TRL EVIDENCE PACKAGE
// ============================================================

export interface TRLEvidencePackage {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  targetTRL: TRLLevel;
  achievedTRL: TRLLevel | 'NOT_ACHIEVED';
  evidenceItems: string[]; // TRLEvidenceItem IDs
  overallStatus: EvidenceStatus;
  limitations: string[];
  openFailures: string[];
  independentValidation: boolean;
  independentValidator?: string;
  provenance: Provenance;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// HUMAN STUDY PROTOCOL
// ============================================================

export interface HumanStudyProtocol {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  targetParticipants: number;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  tasks: string[];
  metrics: string[];
  ethicalApproval?: string;
  status: 'PLANNED' | 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED' | 'NOT_EXECUTED';
  actualParticipants: number;
  provenance: Provenance;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// HUMAN STUDY SESSION
// ============================================================

export interface HumanStudySession {
  id: string;
  protocolId: string;
  caseId: ResearchCaseId;
  participantId: string; // Anonymized
  consentObtained: boolean;
  consentTimestamp: string;
  tasksCompleted: string[];
  oversightActions: string[];
  contestations: string[];
  overrides: string[];
  safeStops: string[];
  usabilityFeedback?: string;
  startTime: string;
  endTime?: string;
  provenance: Provenance;
}

// ============================================================
// TRL REPOSITORY
// ============================================================

export interface TRLRepository {
  // TRL Evidence Items
  createTRLEvidenceItem(caseId: ResearchCaseId, category: TRLEvidenceCategory, description: string, status: EvidenceStatus, evidenceIds: EvidenceId[], limitations: string[], openFailures: string[], createdBy: string): TRLEvidenceItem;
  getTRLEvidenceItem(id: string, caseId: ResearchCaseId): TRLEvidenceItem | null;
  getTRLEvidenceItemsByCase(caseId: ResearchCaseId): TRLEvidenceItem[];
  getTRLEvidenceItemsByCategory(caseId: ResearchCaseId, category: TRLEvidenceCategory): TRLEvidenceItem[];

  // TRL Evidence Packages
  createTRLEvidencePackage(caseId: ResearchCaseId, name: string, description: string, targetTRL: TRLLevel, evidenceItemIds: string[], overallStatus: EvidenceStatus, limitations: string[], openFailures: string[], createdBy: string): TRLEvidencePackage;
  getTRLEvidencePackage(id: string, caseId: ResearchCaseId): TRLEvidencePackage | null;
  getTRLEvidencePackagesByCase(caseId: ResearchCaseId): TRLEvidencePackage[];
  updateTRLEvidencePackage(id: string, caseId: ResearchCaseId, achievedTRL: TRLLevel | 'NOT_ACHIEVED', overallStatus: EvidenceStatus, independentValidation: boolean, independentValidator?: string): TRLEvidencePackage;

  // Human Study Protocols
  createHumanStudyProtocol(caseId: ResearchCaseId, name: string, description: string, targetParticipants: number, inclusionCriteria: string[], exclusionCriteria: string[], tasks: string[], metrics: string[], ethicalApproval: string | undefined, createdBy: string): HumanStudyProtocol;
  getHumanStudyProtocol(id: string, caseId: ResearchCaseId): HumanStudyProtocol | null;
  getHumanStudyProtocolsByCase(caseId: ResearchCaseId): HumanStudyProtocol[];
  updateHumanStudyProtocolStatus(id: string, caseId: ResearchCaseId, status: HumanStudyProtocol['status'], actualParticipants: number): HumanStudyProtocol;

  // Human Study Sessions
  createHumanStudySession(protocolId: string, caseId: ResearchCaseId, participantId: string, consentObtained: boolean, tasksCompleted: string[], oversightActions: string[], contestations: string[], overrides: string[], safeStops: string[], usabilityFeedback: string | undefined, createdBy: string): HumanStudySession;
  getHumanStudySession(id: string, caseId: ResearchCaseId): HumanStudySession | null;
  getHumanStudySessionsByProtocol(protocolId: string, caseId: ResearchCaseId): HumanStudySession[];
  getHumanStudySessionsByCase(caseId: ResearchCaseId): HumanStudySession[];

  // TRL Assessment
  assessTRL(caseId: ResearchCaseId): { currentTRL: TRLLevel | 'NOT_ACHIEVED'; evidence: Record<TRLEvidenceCategory, EvidenceStatus>; limitations: string[] };
}

export function createTRLRepository(
  ids: IdProvider,
  time: TimeProvider,
): TRLRepository {
  const trlEvidenceItems = new Map<string, TRLEvidenceItem>();
  const trlEvidencePackages = new Map<string, TRLEvidencePackage>();
  const humanStudyProtocols = new Map<string, HumanStudyProtocol>();
  const humanStudySessions = new Map<string, HumanStudySession>();

  return {
    // TRL Evidence Items
    createTRLEvidenceItem(caseId, category, description, status, evidenceIds, limitations, openFailures, createdBy): TRLEvidenceItem {
      const id = `trlitem-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const item: TRLEvidenceItem = {
        id,
        caseId,
        category,
        description,
        status,
        evidenceIds,
        limitations,
        openFailures,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'trl-evidence-item-creation',
          version: '1',
          createdAt: now,
          inputs: evidenceIds,
          assumptions: [],
        },
        createdAt: now,
      };
      
      trlEvidenceItems.set(id, item);
      return item;
    },

    getTRLEvidenceItem(id, caseId): TRLEvidenceItem | null {
      const item = trlEvidenceItems.get(id);
      if (!item) return null;
      if (item.caseId !== caseId) {
        throw new Error(`Case isolation violation: TRL evidence item ${id} belongs to case ${item.caseId}, not ${caseId}`);
      }
      return item;
    },

    getTRLEvidenceItemsByCase(caseId): TRLEvidenceItem[] {
      return Array.from(trlEvidenceItems.values()).filter(i => i.caseId === caseId);
    },

    getTRLEvidenceItemsByCategory(caseId, category): TRLEvidenceItem[] {
      return Array.from(trlEvidenceItems.values()).filter(i => 
        i.caseId === caseId && i.category === category
      );
    },

    // TRL Evidence Packages
    createTRLEvidencePackage(caseId, name, description, targetTRL, evidenceItemIds, overallStatus, limitations, openFailures, createdBy): TRLEvidencePackage {
      const id = `trlpkg-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const pkg: TRLEvidencePackage = {
        id,
        caseId,
        name,
        description,
        targetTRL,
        achievedTRL: 'NOT_ACHIEVED',
        evidenceItems: evidenceItemIds,
        overallStatus,
        limitations,
        openFailures,
        independentValidation: false,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'trl-evidence-package-creation',
          version: '1',
          createdAt: now,
          inputs: evidenceItemIds,
          assumptions: [],
        },
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
      };
      
      trlEvidencePackages.set(id, pkg);
      return pkg;
    },

    getTRLEvidencePackage(id, caseId): TRLEvidencePackage | null {
      const pkg = trlEvidencePackages.get(id);
      if (!pkg) return null;
      if (pkg.caseId !== caseId) {
        throw new Error(`Case isolation violation: TRL evidence package ${id} belongs to case ${pkg.caseId}, not ${caseId}`);
      }
      return pkg;
    },

    getTRLEvidencePackagesByCase(caseId): TRLEvidencePackage[] {
      return Array.from(trlEvidencePackages.values()).filter(p => p.caseId === caseId);
    },

    updateTRLEvidencePackage(id, caseId, achievedTRL, overallStatus, independentValidation, independentValidator): TRLEvidencePackage {
      const pkg = trlEvidencePackages.get(id);
      if (!pkg) throw new Error(`TRL evidence package ${id} not found`);
      if (pkg.caseId !== caseId) {
        throw new Error(`Case isolation violation: TRL evidence package ${id} belongs to case ${pkg.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: TRLEvidencePackage = {
        ...pkg,
        achievedTRL,
        overallStatus,
        independentValidation,
        independentValidator,
        updatedAt: now,
      };
      
      trlEvidencePackages.set(id, updated);
      return updated;
    },

    // Human Study Protocols
    createHumanStudyProtocol(caseId, name, description, targetParticipants, inclusionCriteria, exclusionCriteria, tasks, metrics, ethicalApproval, createdBy): HumanStudyProtocol {
      const id = `protocol-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const protocol: HumanStudyProtocol = {
        id,
        caseId,
        name,
        description,
        targetParticipants,
        inclusionCriteria,
        exclusionCriteria,
        tasks,
        metrics,
        ethicalApproval,
        status: 'NOT_EXECUTED',
        actualParticipants: 0,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'human-study-protocol-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
        createdAt: now,
        updatedAt: now,
      };
      
      humanStudyProtocols.set(id, protocol);
      return protocol;
    },

    getHumanStudyProtocol(id, caseId): HumanStudyProtocol | null {
      const protocol = humanStudyProtocols.get(id);
      if (!protocol) return null;
      if (protocol.caseId !== caseId) {
        throw new Error(`Case isolation violation: human study protocol ${id} belongs to case ${protocol.caseId}, not ${caseId}`);
      }
      return protocol;
    },

    getHumanStudyProtocolsByCase(caseId): HumanStudyProtocol[] {
      return Array.from(humanStudyProtocols.values()).filter(p => p.caseId === caseId);
    },

    updateHumanStudyProtocolStatus(id, caseId, status, actualParticipants): HumanStudyProtocol {
      const protocol = humanStudyProtocols.get(id);
      if (!protocol) throw new Error(`Human study protocol ${id} not found`);
      if (protocol.caseId !== caseId) {
        throw new Error(`Case isolation violation: human study protocol ${id} belongs to case ${protocol.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: HumanStudyProtocol = {
        ...protocol,
        status,
        actualParticipants,
        updatedAt: now,
      };
      
      humanStudyProtocols.set(id, updated);
      return updated;
    },

    // Human Study Sessions
    createHumanStudySession(protocolId, caseId, participantId, consentObtained, tasksCompleted, oversightActions, contestations, overrides, safeStops, usabilityFeedback, createdBy): HumanStudySession {
      const protocol = humanStudyProtocols.get(protocolId);
      if (!protocol) throw new Error(`Human study protocol ${protocolId} not found`);
      if (protocol.caseId !== caseId) {
        throw new Error(`Case isolation violation: human study protocol ${protocolId} belongs to case ${protocol.caseId}, not ${caseId}`);
      }
      
      const id = `session-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const session: HumanStudySession = {
        id,
        protocolId,
        caseId,
        participantId,
        consentObtained,
        consentTimestamp: now,
        tasksCompleted,
        oversightActions,
        contestations,
        overrides,
        safeStops,
        usabilityFeedback,
        startTime: now,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'human-study-session-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      
      humanStudySessions.set(id, session);
      return session;
    },

    getHumanStudySession(id, caseId): HumanStudySession | null {
      const session = humanStudySessions.get(id);
      if (!session) return null;
      if (session.caseId !== caseId) {
        throw new Error(`Case isolation violation: human study session ${id} belongs to case ${session.caseId}, not ${caseId}`);
      }
      return session;
    },

    getHumanStudySessionsByProtocol(protocolId, caseId): HumanStudySession[] {
      return Array.from(humanStudySessions.values()).filter(s => 
        s.caseId === caseId && s.protocolId === protocolId
      );
    },

    getHumanStudySessionsByCase(caseId): HumanStudySession[] {
      return Array.from(humanStudySessions.values()).filter(s => s.caseId === caseId);
    },

    // TRL Assessment
    assessTRL(caseId): { currentTRL: TRLLevel | 'NOT_ACHIEVED'; evidence: Record<TRLEvidenceCategory, EvidenceStatus>; limitations: string[] } {
      const items = this.getTRLEvidenceItemsByCase(caseId);
      
      const evidence: Record<TRLEvidenceCategory, EvidenceStatus> = {
        [TRLEvidenceCategory.REQUIREMENTS]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.CAPABILITIES]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.VERIFICATION]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.BENCHMARK]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.VALIDATION]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.HUMAN_STUDY]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.REPRODUCIBILITY]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.ASSURANCE]: EvidenceStatus.NOT_DEMONSTRATED,
        [TRLEvidenceCategory.SECURITY]: EvidenceStatus.NOT_DEMONSTRATED,
      };
      
      const limitations: string[] = [];
      
      for (const item of items) {
        evidence[item.category] = item.status;
        limitations.push(...item.limitations);
      }
      
      // Determine current TRL based on evidence
      // Conservative assessment: TRL4 requires independent validation and human study
      let currentTRL: TRLLevel | 'NOT_ACHIEVED' = 'NOT_ACHIEVED';
      
      // TRL3: Basic experimental proof of concept
      if (evidence[TRLEvidenceCategory.REQUIREMENTS] !== EvidenceStatus.NOT_DEMONSTRATED &&
          evidence[TRLEvidenceCategory.CAPABILITIES] !== EvidenceStatus.NOT_DEMONSTRATED) {
        currentTRL = TRLLevel.TRL3;
      }
      
      // TRL4 requires:
      // - Technology validated in lab (VERIFICATION + BENCHMARK)
      // - Independent validation (VALIDATION must be DEMONSTRATED or INDEPENDENTLY_VALIDATED)
      // - Human study evidence (HUMAN_STUDY must be at least PARTIALLY_DEMONSTRATED)
      if (currentTRL === TRLLevel.TRL3 &&
          evidence[TRLEvidenceCategory.VERIFICATION] !== EvidenceStatus.NOT_DEMONSTRATED &&
          evidence[TRLEvidenceCategory.BENCHMARK] !== EvidenceStatus.NOT_DEMONSTRATED &&
          (evidence[TRLEvidenceCategory.VALIDATION] === EvidenceStatus.DEMONSTRATED || 
           evidence[TRLEvidenceCategory.VALIDATION] === EvidenceStatus.INDEPENDENTLY_VALIDATED) &&
          evidence[TRLEvidenceCategory.HUMAN_STUDY] !== EvidenceStatus.NOT_DEMONSTRATED) {
        currentTRL = TRLLevel.TRL4;
      }
      
      return {
        currentTRL,
        evidence,
        limitations: [...new Set(limitations)],
      };
    },
  };
}
