/**
 * HAG-RAP V.2 — Explanation Module (WP2)
 * Grounded explanation queries.
 * INVARIANT: Explanations must be grounded in actual trace.
 */

import {
  ResearchCaseId,
  EvidenceId,
  ClaimId,
  AssumptionId,
  UncertaintyId,
  ContradictionId,
} from '../core/index.ts';
import { EvidenceGraphRepository } from '../evidence-graph/index.ts';
import { RequirementsRepository } from '../requirements/index.ts';
import { TrustworthinessRepository } from '../trustworthiness/index.ts';

// ============================================================
// EXPLANATION QUERY TYPES
// ============================================================

export enum ExplanationQueryType {
  WHY_SUPPORTED = 'WHY_SUPPORTED',
  WHAT_REFUTES = 'WHAT_REFUTES',
  WHAT_ASSUMPTIONS = 'WHAT_ASSUMPTIONS',
  WHAT_UNCERTAINTIES = 'WHAT_UNCERTAINTIES',
  WHAT_CONTRADICTIONS = 'WHAT_CONTRADICTIONS',
  WHAT_REQUIREMENTS = 'WHAT_REQUIREMENTS',
  WHAT_RISKS = 'WHAT_RISKS',
  WHAT_HUMAN_REVIEW = 'WHAT_HUMAN_REVIEW',
  WHAT_IS_UNKNOWN = 'WHAT_IS_UNKNOWN',
  WHAT_CHANGED = 'WHAT_CHANGED',
}

// ============================================================
// EXPLANATION
// ============================================================

export interface Explanation {
  query: ExplanationQueryType;
  targetId?: string;
  caseId: ResearchCaseId;
  grounded: boolean;
  content: string;
  references: string[];
  timestamp: string;
}

// ============================================================
// EXPLANATION SERVICE
// ============================================================

export interface ExplanationService {
  explain(query: ExplanationQueryType, targetId: string | undefined, caseId: ResearchCaseId): Explanation;
}

export function createExplanationService(
  evidenceGraph: EvidenceGraphRepository,
  requirements: RequirementsRepository,
  trustworthiness: TrustworthinessRepository,
  time: { now(): string },
): ExplanationService {
  return {
    explain(query, targetId, caseId): Explanation {
      const now = time.now();
      let content = '';
      let references: string[] = [];
      let grounded = true;

      switch (query) {
        case ExplanationQueryType.WHY_SUPPORTED: {
          if (!targetId) {
            content = 'No target specified';
            grounded = false;
            break;
          }
          const claim = evidenceGraph.getClaim(targetId as ClaimId, caseId);
          if (!claim) {
            content = `Claim ${targetId} not found`;
            grounded = false;
            break;
          }
          const supportingEvidence = claim.supportedBy.map(eid => {
            const ev = evidenceGraph.getEvidence(eid, caseId);
            return ev ? `${ev.id}: ${ev.content}` : eid;
          });
          content = `Claim "${claim.statement}" is supported by:\n${supportingEvidence.join('\n')}`;
          references = claim.supportedBy;
          break;
        }

        case ExplanationQueryType.WHAT_REFUTES: {
          if (!targetId) {
            content = 'No target specified';
            grounded = false;
            break;
          }
          const claim = evidenceGraph.getClaim(targetId as ClaimId, caseId);
          if (!claim) {
            content = `Claim ${targetId} not found`;
            grounded = false;
            break;
          }
          const refutingEvidence = claim.refutedBy.map(eid => {
            const ev = evidenceGraph.getEvidence(eid, caseId);
            return ev ? `${ev.id}: ${ev.content}` : eid;
          });
          content = `Claim "${claim.statement}" is refuted by:\n${refutingEvidence.join('\n')}`;
          references = claim.refutedBy;
          break;
        }

        case ExplanationQueryType.WHAT_ASSUMPTIONS: {
          const assumptions = evidenceGraph.getAssumptionsByCase(caseId);
          content = `Case has ${assumptions.length} assumption(s):\n`;
          content += assumptions.map(a => `- ${a.id}: ${a.statement} (criticality: ${a.criticality}, validated: ${a.validated})`).join('\n');
          references = assumptions.map(a => a.id);
          break;
        }

        case ExplanationQueryType.WHAT_UNCERTAINTIES: {
          const uncertainties = evidenceGraph.getUncertaintiesByCase(caseId);
          content = `Case has ${uncertainties.length} uncertainty(ies):\n`;
          content += uncertainties.map(u => `- ${u.id}: ${u.description} (type: ${u.uncertaintyType}, severity: ${u.severity})`).join('\n');
          references = uncertainties.map(u => u.id);
          break;
        }

        case ExplanationQueryType.WHAT_CONTRADICTIONS: {
          const contradictions = evidenceGraph.getContradictionsByCase(caseId);
          content = `Case has ${contradictions.length} contradiction(s):\n`;
          content += contradictions.map(c => `- ${c.id}: ${c.description} (resolved: ${c.resolved})`).join('\n');
          references = contradictions.map(c => c.id);
          break;
        }

        case ExplanationQueryType.WHAT_REQUIREMENTS: {
          const reqs = requirements.getRequirementsByCase(caseId);
          content = `Case has ${reqs.length} requirement(s):\n`;
          content += reqs.map(r => `- ${r.id}: ${r.title} (status: ${r.status}, type: ${r.requirementType})`).join('\n');
          references = reqs.map(r => r.id);
          break;
        }

        case ExplanationQueryType.WHAT_RISKS: {
          const risks = requirements.getRisksByCase(caseId);
          content = `Case has ${risks.length} risk(s):\n`;
          content += risks.map(r => `- ${r.id}: ${r.description} (severity: ${r.severity}, accepted: ${r.accepted})`).join('\n');
          references = risks.map(r => r.id);
          break;
        }

        case ExplanationQueryType.WHAT_HUMAN_REVIEW: {
          const oversight = trustworthiness.getHumanOversightByCase(caseId);
          content = `Case has ${oversight.length} human oversight requirement(s):\n`;
          content += oversight.map(o => `- ${o.id}: ${o.description} (escalation: ${o.escalationPolicy})`).join('\n');
          references = oversight.map(o => o.id);
          break;
        }

        case ExplanationQueryType.WHAT_IS_UNKNOWN: {
          const uncertainties = evidenceGraph.getUncertaintiesByCase(caseId);
          const unknownUncertainties = uncertainties.filter(u => 
            u.uncertaintyType === 'UNKNOWN' || u.uncertaintyType === 'MISSING_INFORMATION'
          );
          content = `Case has ${unknownUncertainties.length} unknown(s):\n`;
          content += unknownUncertainties.map(u => `- ${u.id}: ${u.description}`).join('\n');
          references = unknownUncertainties.map(u => u.id);
          break;
        }

        case ExplanationQueryType.WHAT_CHANGED: {
          if (!targetId) {
            content = 'No target specified';
            grounded = false;
            break;
          }
          // Check if it's a contradiction with history
          const contradiction = evidenceGraph.getContradiction(targetId as ContradictionId, caseId);
          if (contradiction) {
            content = `Contradiction ${targetId} history:\n`;
            content += contradiction.history.map(h => `- ${h.timestamp}: ${h.event}`).join('\n');
            if (contradiction.resolution) {
              content += `\nResolution: ${contradiction.resolution}`;
            }
            references = contradiction.history.map(h => h.provenance.id);
            break;
          }
          content = `No change history available for ${targetId}`;
          grounded = false;
          break;
        }

        default:
          content = 'Unknown query type';
          grounded = false;
      }

      return {
        query,
        targetId,
        caseId,
        grounded,
        content,
        references,
        timestamp: now,
      };
    },
  };
}
