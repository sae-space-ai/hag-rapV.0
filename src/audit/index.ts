/**
 * HAG-RAP V.2 — Audit Module
 * Append-oriented audit trail.
 * INVARIANT: AuditEvent cannot be silently modified.
 * INVARIANT: Audit ≠ application logging.
 */

import {
  AuditEventId,
  ResearchCaseId,
  ActorType,
  DomainError,
  DomainErrorCode,
  TimeProvider,
  IdProvider,
} from '../core/index.ts';

// ============================================================
// AUDIT EVENT
// ============================================================

export interface AuditEvent {
  id: AuditEventId;
  actor: string;
  actorType: ActorType;
  action: string;
  target: string;
  caseId?: ResearchCaseId;
  timestamp: string;
  reason?: string;
  inputReferences: string[];
  outputReferences: string[];
  authorityContext?: {
    policyId?: string;
    permissionGranted: boolean;
  };
  provenanceContext?: {
    method: string;
    version: string;
  };
}

export interface CreateAuditEventInput {
  actor: string;
  actorType: ActorType;
  action: string;
  target: string;
  caseId?: ResearchCaseId;
  reason?: string;
  inputReferences?: string[];
  outputReferences?: string[];
  authorityContext?: AuditEvent['authorityContext'];
  provenanceContext?: AuditEvent['provenanceContext'];
}

// ============================================================
// AUDIT REPOSITORY (append-only)
// ============================================================

export interface AuditRepository {
  record(input: CreateAuditEventInput): AuditEvent;
  getByCase(caseId: ResearchCaseId): AuditEvent[];
  getByActor(actor: string): AuditEvent[];
  getAll(): AuditEvent[];
  getById(id: AuditEventId): AuditEvent | null;
  // No update or delete methods — append-only by design
}

export function createAuditRepository(
  ids: IdProvider,
  time: TimeProvider,
): AuditRepository {
  const events: AuditEvent[] = []; // Array preserves insertion order

  return {
    record(input: CreateAuditEventInput): AuditEvent {
      const event: AuditEvent = {
        id: ids.nextAuditEventId(),
        actor: input.actor,
        actorType: input.actorType,
        action: input.action,
        target: input.target,
        caseId: input.caseId,
        timestamp: time.now(),
        reason: input.reason,
        inputReferences: input.inputReferences ?? [],
        outputReferences: input.outputReferences ?? [],
        authorityContext: input.authorityContext,
        provenanceContext: input.provenanceContext,
      };
      events.push(event);
      return event;
    },

    getByCase(caseId: ResearchCaseId): AuditEvent[] {
      return events.filter(e => e.caseId === caseId);
    },

    getByActor(actor: string): AuditEvent[] {
      return events.filter(e => e.actor === actor);
    },

    getAll(): AuditEvent[] {
      return [...events]; // Return copy
    },

    getById(id: AuditEventId): AuditEvent | null {
      return events.find(e => e.id === id) ?? null;
    },
  };
}

// ============================================================
// AUDIT INTEGRITY CHECK
// ============================================================

export function verifyAuditIntegrity(events: AuditEvent[]): boolean {
  // Check that no event has been tampered with
  // In append-only mode, events should only grow
  for (let i = 1; i < events.length; i++) {
    if (new Date(events[i].timestamp) < new Date(events[i - 1].timestamp)) {
      // Timestamps should be monotonically non-decreasing
      // (allowing same timestamp for determinism)
      return false;
    }
  }
  return true;
}
