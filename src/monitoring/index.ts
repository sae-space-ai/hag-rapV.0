/**
 * HAG-RAP V.2 — Runtime Monitoring (WP6)
 * Real-time monitoring of system behavior and constraint violations
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
// MONITOR EVENT TYPES
// ============================================================

export enum MonitorEventType {
  AUTHORITY_VIOLATION = 'AUTHORITY_VIOLATION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  CRITICAL_UNCERTAINTY = 'CRITICAL_UNCERTAINTY',
  UNRESOLVED_CONTRADICTION = 'UNRESOLVED_CONTRADICTION',
  INVALID_PROVENANCE = 'INVALID_PROVENANCE',
  OOD_CONDITION = 'OOD_CONDITION',
  UNSAFE_TRANSITION = 'UNSAFE_TRANSITION',
  SECURITY_FINDING = 'SECURITY_FINDING',
  HUMAN_GATE_MISSING = 'HUMAN_GATE_MISSING',
}

// ============================================================
// MONITOR ACTIONS
// ============================================================

export enum MonitorAction {
  LOG = 'LOG',
  WARN = 'WARN',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  ABSTAIN = 'ABSTAIN',
  SAFE_STOP = 'SAFE_STOP',
}

// ============================================================
// MONITOR EVENT
// ============================================================

export interface MonitorEvent {
  id: string;
  caseId: ResearchCaseId;
  eventType: MonitorEventType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  component: string;
  evidence: EvidenceId[];
  action: MonitorAction;
  detectedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  provenance: Provenance;
}

// ============================================================
// RUNTIME MONITOR
// ============================================================

export interface RuntimeMonitor {
  id: string;
  caseId: ResearchCaseId;
  name: string;
  description: string;
  monitoredComponent: string;
  eventTypes: MonitorEventType[];
  status: 'ACTIVE' | 'PAUSED' | 'DISABLED';
  eventsDetected: number;
  lastEventAt?: string;
  createdAt: string;
  updatedAt: string;
  provenance: Provenance;
}

// ============================================================
// MONITORING REPOSITORY
// ============================================================

export interface MonitoringRepository {
  // Runtime Monitors
  createMonitor(caseId: ResearchCaseId, name: string, description: string, monitoredComponent: string, eventTypes: MonitorEventType[], createdBy: string): RuntimeMonitor;
  getMonitor(id: string, caseId: ResearchCaseId): RuntimeMonitor | null;
  getMonitorsByCase(caseId: ResearchCaseId): RuntimeMonitor[];
  updateMonitorStatus(id: string, caseId: ResearchCaseId, status: RuntimeMonitor['status']): RuntimeMonitor;

  // Monitor Events
  createMonitorEvent(caseId: ResearchCaseId, monitorId: string, eventType: MonitorEventType, severity: MonitorEvent['severity'], description: string, component: string, evidence: EvidenceId[], action: MonitorAction, detectedBy: string): MonitorEvent;
  getMonitorEvent(id: string, caseId: ResearchCaseId): MonitorEvent | null;
  getMonitorEventsByCase(caseId: ResearchCaseId): MonitorEvent[];
  getMonitorEventsByType(caseId: ResearchCaseId, eventType: MonitorEventType): MonitorEvent[];
  resolveMonitorEvent(id: string, caseId: ResearchCaseId, resolvedBy: string, resolution: string): MonitorEvent;

  // Statistics
  getEventCountByType(caseId: ResearchCaseId, eventType: MonitorEventType): number;
  getUnresolvedEventCount(caseId: ResearchCaseId): number;
  getCriticalEventCount(caseId: ResearchCaseId): number;
}

export function createMonitoringRepository(
  ids: IdProvider,
  time: TimeProvider,
): MonitoringRepository {
  const monitors = new Map<string, RuntimeMonitor>();
  const events = new Map<string, MonitorEvent>();

  return {
    // Monitors
    createMonitor(caseId, name, description, monitoredComponent, eventTypes, createdBy): RuntimeMonitor {
      const id = `mon-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const monitor: RuntimeMonitor = {
        id,
        caseId,
        name,
        description,
        monitoredComponent,
        eventTypes,
        status: 'ACTIVE',
        eventsDetected: 0,
        createdAt: now,
        updatedAt: now,
        provenance: {
          id: provId,
          producer: createdBy,
          producerType: ActorType.HUMAN,
          method: 'monitor-creation',
          version: '1',
          createdAt: now,
          inputs: [],
          assumptions: [],
        },
      };
      
      monitors.set(id, monitor);
      return monitor;
    },

    getMonitor(id, caseId): RuntimeMonitor | null {
      const monitor = monitors.get(id);
      if (!monitor) return null;
      if (monitor.caseId !== caseId) {
        throw new Error(`Case isolation violation: monitor ${id} belongs to case ${monitor.caseId}, not ${caseId}`);
      }
      return monitor;
    },

    getMonitorsByCase(caseId): RuntimeMonitor[] {
      return Array.from(monitors.values()).filter(m => m.caseId === caseId);
    },

    updateMonitorStatus(id, caseId, status): RuntimeMonitor {
      const monitor = monitors.get(id);
      if (!monitor) throw new Error(`Monitor ${id} not found`);
      if (monitor.caseId !== caseId) {
        throw new Error(`Case isolation violation: monitor ${id} belongs to case ${monitor.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: RuntimeMonitor = {
        ...monitor,
        status,
        updatedAt: now,
      };
      
      monitors.set(id, updated);
      return updated;
    },

    // Events
    createMonitorEvent(caseId, monitorId, eventType, severity, description, component, evidence, action, detectedBy): MonitorEvent {
      const id = `me-${ids.nextEvidenceId()}`;
      const now = time.now();
      const provId = ids.nextProvenanceId();
      
      const event: MonitorEvent = {
        id,
        caseId,
        eventType,
        severity,
        description,
        component,
        evidence,
        action,
        detectedAt: now,
        resolved: false,
        provenance: {
          id: provId,
          producer: detectedBy,
          producerType: ActorType.SYSTEM,
          method: 'monitor-event-detection',
          version: '1',
          createdAt: now,
          inputs: evidence,
          assumptions: [],
        },
      };
      
      events.set(id, event);
      
      // Update monitor statistics
      const monitor = monitors.get(monitorId);
      if (monitor && monitor.caseId === caseId) {
        monitor.eventsDetected++;
        monitor.lastEventAt = now;
        monitor.updatedAt = now;
      }
      
      return event;
    },

    getMonitorEvent(id, caseId): MonitorEvent | null {
      const event = events.get(id);
      if (!event) return null;
      if (event.caseId !== caseId) {
        throw new Error(`Case isolation violation: event ${id} belongs to case ${event.caseId}, not ${caseId}`);
      }
      return event;
    },

    getMonitorEventsByCase(caseId): MonitorEvent[] {
      return Array.from(events.values()).filter(e => e.caseId === caseId);
    },

    getMonitorEventsByType(caseId, eventType): MonitorEvent[] {
      return Array.from(events.values()).filter(e => e.caseId === caseId && e.eventType === eventType);
    },

    resolveMonitorEvent(id, caseId, resolvedBy, resolution): MonitorEvent {
      const event = events.get(id);
      if (!event) throw new Error(`Monitor event ${id} not found`);
      if (event.caseId !== caseId) {
        throw new Error(`Case isolation violation: event ${id} belongs to case ${event.caseId}, not ${caseId}`);
      }
      
      const now = time.now();
      const updated: MonitorEvent = {
        ...event,
        resolved: true,
        resolvedAt: now,
        resolvedBy,
        resolution,
      };
      
      events.set(id, updated);
      return updated;
    },

    // Statistics
    getEventCountByType(caseId, eventType): number {
      return Array.from(events.values()).filter(e => e.caseId === caseId && e.eventType === eventType).length;
    },

    getUnresolvedEventCount(caseId): number {
      return Array.from(events.values()).filter(e => e.caseId === caseId && !e.resolved).length;
    },

    getCriticalEventCount(caseId): number {
      return Array.from(events.values()).filter(e => e.caseId === caseId && e.severity === 'CRITICAL').length;
    },
  };
}
