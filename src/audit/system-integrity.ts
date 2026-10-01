/**
 * HAG-RAP V.2 - System Integrity Audit Module
 * Performs comprehensive audit across all work packages (O0-O6)
 */

import { ResearchCaseId, EvidenceId, ClaimId, AssumptionId, InferenceId } from '../core/index';

export interface AuditFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  description: string;
  location: string;
  evidence: string[];
  recommendation?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ACCEPTED';
  timestamp: string;
}

export interface AuditReport {
  id: string;
  caseId: ResearchCaseId;
  timestamp: string;
  auditor: string;
  scope: string[];
  findings: AuditFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  status: 'PASS' | 'FAIL' | 'CONDITIONAL_PASS';
}

export class SystemIntegrityAuditor {
  private findings: AuditFinding[] = [];
  private findingCounter = 0;

  constructor(private caseId: ResearchCaseId) {}

  private generateFindingId(): string {
    this.findingCounter++;
    return `AUDIT-${this.caseId.slice(-8)}-${this.findingCounter.toString().padStart(4, '0')}`;
  }

  /**
   * Audit 1: Check for duplicate canonical truth
   */
  auditNoDuplicateTruth(
    entities: Array<{ id: string; type: string; content: string }>
  ): void {
    const contentMap = new Map<string, string[]>();
    
    for (const entity of entities) {
      const key = `${entity.type}:${entity.content}`;
      if (!contentMap.has(key)) {
        contentMap.set(key, []);
      }
      contentMap.get(key)!.push(entity.id);
    }

    for (const [key, ids] of contentMap.entries()) {
      if (ids.length > 1) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'CRITICAL',
          category: 'DUPLICATE_TRUTH',
          description: `Duplicate canonical truth detected for ${key}`,
          location: `Entities: ${ids.join(', ')}`,
          evidence: ids,
          recommendation: 'Merge duplicates or verify if intentional',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 2: Check for broken IDs/references
   */
  auditReferences(
    references: Array<{ from: string; to: string; type: string }>
  ): void {
    const validIds = new Set(references.map(r => r.to));
    
    for (const ref of references) {
      if (!validIds.has(ref.to)) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'HIGH',
          category: 'BROKEN_REFERENCE',
          description: `Broken reference: ${ref.from} -> ${ref.to} (${ref.type})`,
          location: ref.from,
          evidence: [ref.from, ref.to],
          recommendation: 'Fix or remove broken reference',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 3: Check for cross-case leakage
   */
  auditCaseIsolation(
    entities: Array<{ id: string; caseId: ResearchCaseId; type: string }>
  ): void {
    const caseEntities = new Map<ResearchCaseId, string[]>();
    
    for (const entity of entities) {
      if (!caseEntities.has(entity.caseId)) {
        caseEntities.set(entity.caseId, []);
      }
      caseEntities.get(entity.caseId)!.push(entity.id);
    }

    // Check if any entity appears in multiple cases (should not happen)
    const allIds = entities.map(e => e.id);
    const uniqueIds = new Set(allIds);
    
    if (allIds.length !== uniqueIds.size) {
      this.findings.push({
        id: this.generateFindingId(),
        severity: 'CRITICAL',
        category: 'CASE_ISOLATION_VIOLATION',
        description: 'Entity ID appears in multiple cases',
        location: 'Case isolation boundary',
        evidence: allIds.filter((id, index) => allIds.indexOf(id) !== index),
        recommendation: 'Enforce strict case isolation',
        status: 'OPEN',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Audit 4: Check for orphan records
   */
  auditOrphanRecords(
    parentChild: Array<{ parent: string; child: string; relation: string }>
  ): void {
    const parentIds = new Set(parentChild.map(pc => pc.parent));
    const childIds = new Set(parentChild.map(pc => pc.child));
    
    // Children without parents
    for (const child of childIds) {
      if (!parentIds.has(child)) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'MEDIUM',
          category: 'ORPHAN_RECORD',
          description: `Orphan record detected: ${child} has no parent`,
          location: child,
          evidence: [child],
          recommendation: 'Assign parent or remove orphan',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 5: Check for invalid state transitions
   */
  auditStateTransitions(
    transitions: Array<{
      entity: string;
      from: string;
      to: string;
      valid: boolean;
    }>
  ): void {
    for (const transition of transitions) {
      if (!transition.valid) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'HIGH',
          category: 'INVALID_TRANSITION',
          description: `Invalid state transition: ${transition.entity} from ${transition.from} to ${transition.to}`,
          location: transition.entity,
          evidence: [transition.from, transition.to],
          recommendation: 'Review state machine logic',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 6: Check for lost provenance
   */
  auditProvenance(
    entities: Array<{ id: string; type: string; hasProvenance: boolean }>
  ): void {
    for (const entity of entities) {
      if (!entity.hasProvenance) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'HIGH',
          category: 'LOST_PROVENANCE',
          description: `Missing provenance for ${entity.type}: ${entity.id}`,
          location: entity.id,
          evidence: [entity.id],
          recommendation: 'Add provenance tracking',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 7: Check for silent supersession
   */
  auditSupersession(
    versions: Array<{
      id: string;
      version: number;
      supersededBy?: string;
      explicit: boolean;
    }>
  ): void {
    for (const version of versions) {
      if (version.supersededBy && !version.explicit) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'MEDIUM',
          category: 'SILENT_SUPERSESSION',
          description: `Silent supersession detected for ${version.id}`,
          location: version.id,
          evidence: [version.id, version.supersededBy],
          recommendation: 'Make supersession explicit with reason',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 8: Check for authority escalation
   */
  auditAuthorityEscalation(
    actions: Array<{
      actor: string;
      action: string;
      requiredLevel: string;
      actorLevel: string;
      escalated: boolean;
    }>
  ): void {
    for (const action of actions) {
      if (action.escalated) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'CRITICAL',
          category: 'AUTHORITY_ESCALATION',
          description: `Authority escalation: ${action.actor} performed ${action.action} (required: ${action.requiredLevel}, had: ${action.actorLevel})`,
          location: action.actor,
          evidence: [action.actor, action.action],
          recommendation: 'Review authority boundaries',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 9: Check for simulation/reality confusion
   */
  auditSimulationReality(
    entities: Array<{
      id: string;
      type: string;
      mode: 'REAL' | 'SIMULATED' | 'COUNTERFACTUAL';
      labeled: boolean;
    }>
  ): void {
    for (const entity of entities) {
      if (!entity.labeled) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'HIGH',
          category: 'SIMULATION_REALITY_CONFUSION',
          description: `Unlabeled execution mode for ${entity.type}: ${entity.id}`,
          location: entity.id,
          evidence: [entity.id],
          recommendation: 'Label execution mode explicitly',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Audit 10: Check for target/result confusion
   */
  auditTargetResult(
    metrics: Array<{
      id: string;
      type: 'TARGET' | 'RESULT';
      value: number;
      distinguished: boolean;
    }>
  ): void {
    for (const metric of metrics) {
      if (!metric.distinguished) {
        this.findings.push({
          id: this.generateFindingId(),
          severity: 'HIGH',
          category: 'TARGET_RESULT_CONFUSION',
          description: `Target/result not distinguished for metric: ${metric.id}`,
          location: metric.id,
          evidence: [metric.id],
          recommendation: 'Clearly separate targets from results',
          status: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Generate final audit report
   */
  generateReport(auditor: string, scope: string[]): AuditReport {
    const summary = {
      critical: this.findings.filter(f => f.severity === 'CRITICAL').length,
      high: this.findings.filter(f => f.severity === 'HIGH').length,
      medium: this.findings.filter(f => f.severity === 'MEDIUM').length,
      low: this.findings.filter(f => f.severity === 'LOW').length,
      info: this.findings.filter(f => f.severity === 'INFO').length,
      total: this.findings.length
    };

    let status: 'PASS' | 'FAIL' | 'CONDITIONAL_PASS';
    if (summary.critical > 0) {
      status = 'FAIL';
    } else if (summary.high > 0) {
      status = 'CONDITIONAL_PASS';
    } else {
      status = 'PASS';
    }

    return {
      id: `AUDIT-REPORT-${this.caseId.slice(-8)}-${Date.now()}`,
      caseId: this.caseId,
      timestamp: new Date().toISOString(),
      auditor,
      scope,
      findings: this.findings,
      summary,
      status
    };
  }

  /**
   * Resolve a finding
   */
  resolveFinding(findingId: string, resolution: string): void {
    const finding = this.findings.find(f => f.id === findingId);
    if (finding) {
      finding.status = 'RESOLVED';
      finding.recommendation = resolution;
    }
  }
}
