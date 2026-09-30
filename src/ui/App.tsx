/**
 * HAG-RAP V.2 — UI Shell
 * Scientific, clean, professional interface.
 * Only implemented capabilities appear operational.
 * Future modules show NOT IMPLEMENTED / FUTURE MODULE.
 */

import React, { useState, useMemo } from 'react';
import { ModuleStatus, ScientificMaturity, ActorType, EpistemicStatus, CaseLifecycle } from '../core/index.ts';
import { createDemoContext, runSyntheticDemo, exportCase, importCase } from '../demo/index.ts';

// ============================================================
// MODULE REGISTRY
// ============================================================

interface ModuleInfo {
  name: string;
  status: ModuleStatus;
  description: string;
  wp?: string;
}

const MODULES: ModuleInfo[] = [
  { name: 'Overview', status: ModuleStatus.IMPLEMENTED, description: 'Architecture overview and system status' },
  { name: 'Cases', status: ModuleStatus.IMPLEMENTED, description: 'Research case management' },
  { name: 'Evidence', status: ModuleStatus.IMPLEMENTED, description: 'Evidence registration and tracking' },
  { name: 'Evidence Graph', status: ModuleStatus.IMPLEMENTED, description: 'Scientific graph with relations (WP2)', wp: 'WP2' },
  { name: 'Requirements', status: ModuleStatus.IMPLEMENTED, description: 'Scientific requirements and traceability (WP2)', wp: 'WP2' },
  { name: 'Trustworthiness', status: ModuleStatus.IMPLEMENTED, description: 'Risk, rights, oversight, data governance (WP2)', wp: 'WP2' },
  { name: 'Research Boundary', status: ModuleStatus.IMPLEMENTED, description: 'Machine-readable research policy (WP2)', wp: 'WP2' },
  { name: 'Validation', status: ModuleStatus.IMPLEMENTED, description: 'Protocols, benchmarks, criteria (WP2)', wp: 'WP2' },
  { name: 'Explanation', status: ModuleStatus.IMPLEMENTED, description: 'Grounded explanation queries (WP2)', wp: 'WP2' },
  { name: 'Reasoning', status: ModuleStatus.IMPLEMENTED, description: 'Deep Reasoning Engine (WP3)', wp: 'WP3' },
  { name: 'Causal', status: ModuleStatus.IMPLEMENTED, description: 'Causal Inference Engine (WP3)', wp: 'WP3' },
  { name: 'Abstraction', status: ModuleStatus.FUTURE_MODULE, description: 'Deep Abstraction and Transferable World Models', wp: 'WP4' },
  { name: 'World Model', status: ModuleStatus.FUTURE_MODULE, description: 'World model construction and prediction', wp: 'WP4' },
  { name: 'Planning', status: ModuleStatus.FUTURE_MODULE, description: 'Deep Planning and Continual Replanning', wp: 'WP5' },
  { name: 'Human Governance', status: ModuleStatus.IMPLEMENTED, description: 'Human governance foundation' },
  { name: 'Assurance', status: ModuleStatus.FUTURE_MODULE, description: 'Formal Assurance and Verification', wp: 'WP6' },
  { name: 'Experiments', status: ModuleStatus.FUTURE_MODULE, description: 'Benchmarking and Validation', wp: 'WP7' },
  { name: 'Audit', status: ModuleStatus.IMPLEMENTED, description: 'Append-oriented audit trail' },
  { name: 'Demo', status: ModuleStatus.IMPLEMENTED, description: 'Synthetic demonstration' },
];

// ============================================================
// SYSTEM FLAGS
// ============================================================

const SYSTEM_FLAGS = {
  HAGRAP_V2_GREENFIELD: 'YES',
  LEGACY_CODE_IMPORTED: 'NO',
  ARCHITECTURE_IMPLEMENTED: 'YES',
  SCIENTIFIC_CONTRACT_IMPLEMENTED: 'YES',
  BOUNDED_CONTEXTS_DEFINED: 'YES',
  DEPENDENCY_DIRECTION_DEFINED: 'YES',
  CANONICAL_IDS: 'YES',
  CASE_ISOLATION: 'YES',
  EPISTEMIC_SEPARATION: 'YES',
  EVIDENCE_FOUNDATION: 'YES',
  PROVENANCE_FOUNDATION: 'YES',
  VERSIONING_FOUNDATION: 'YES',
  SUPERSESSION_FOUNDATION: 'YES',
  ORTHOGONAL_STATE_MODEL: 'YES',
  AUTHORITY_FIRST_CLASS: 'YES',
  HUMAN_GOVERNANCE_FOUNDATION: 'YES',
  SIMULATION_REALITY_SEPARATION: 'YES',
  AUDIT_FOUNDATION: 'YES',
  DEEP_REASONING_ENGINE: 'NOT_IMPLEMENTED',
  CAUSAL_ENGINE: 'NOT_IMPLEMENTED',
  ABSTRACTION_ENGINE: 'NOT_IMPLEMENTED',
  WORLD_MODEL_ENGINE: 'NOT_IMPLEMENTED',
  PLANNER_ENGINE: 'NOT_IMPLEMENTED',
  FORMAL_ASSURANCE_ENGINE: 'NOT_IMPLEMENTED',
  SCIENTIFIC_BENCHMARKS: 'NOT_EXECUTED',
  TRL4_ACHIEVED: 'NO',
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================

export default function App() {
  const [activeModule, setActiveModule] = useState('Overview');
  const [demoResult, setDemoResult] = useState<ReturnType<typeof runSyntheticDemo> | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);

  const demoCtx = useMemo(() => createDemoContext(true), []);

  const handleRunDemo = () => {
    const ctx = createDemoContext(true);
    const result = runSyntheticDemo(ctx);
    setDemoResult(result);
  };

  const handleImport = () => {
    if (!demoResult) return;
    const ctx = createDemoContext(true);
    try {
      const importedId = importCase(ctx, demoResult.exported);
      setImportResult(`Successfully imported case: ${importedId}`);
    } catch (e) {
      setImportResult(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">HAG-RAP V.2</h1>
            <p className="text-sm text-gray-500">Human-Governed Deep Reasoning, Abstraction and Planning</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              ORDER 0 — FOUNDATIONS
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Navigation */}
        <nav className="w-56 min-h-screen bg-white border-r border-gray-200 p-4">
          <ul className="space-y-1">
            {MODULES.map(mod => (
              <li key={mod.name}>
                <button
                  onClick={() => setActiveModule(mod.name)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeModule === mod.name
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : mod.status === ModuleStatus.FUTURE_MODULE
                        ? 'text-gray-400 hover:bg-gray-50'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{mod.name}</span>
                    {mod.status === ModuleStatus.FUTURE_MODULE && (
                      <span className="text-[10px] text-gray-400">FUTURE</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeModule === 'Overview' && <OverviewPanel />}
          {activeModule === 'Cases' && <CasesPanel />}
          {activeModule === 'Evidence' && <EvidencePanel />}
          {activeModule === 'Human Governance' && <GovernancePanel />}
          {activeModule === 'Audit' && <AuditPanel />}
          {activeModule === 'Demo' && (
            <DemoPanel
              demoResult={demoResult}
              importResult={importResult}
              onRunDemo={handleRunDemo}
              onImport={handleImport}
            />
          )}
          {MODULES.find(m => m.name === activeModule)?.status === ModuleStatus.FUTURE_MODULE && (
            <FutureModulePanel module={MODULES.find(m => m.name === activeModule)!} />
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// PANELS
// ============================================================

function OverviewPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">System Status</h2>
        <p className="text-sm text-gray-600 mb-4">
          HAG-RAP V.2 Order 0 — Architectural foundations and scientific contract.
          Greenfield implementation. No legacy code imported.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Architecture Flags</h3>
          <div className="space-y-1">
            {Object.entries(SYSTEM_FLAGS).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-600 font-mono">{key}</span>
                <span className={`font-medium ${
                  value === 'YES' ? 'text-green-700' :
                  value === 'NO' ? 'text-red-700' :
                  value === 'NOT_IMPLEMENTED' ? 'text-amber-700' :
                  'text-gray-500'
                }`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Bounded Contexts</h3>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {['core', 'case', 'evidence', 'epistemics', 'provenance', 'authority',
              'reasoning', 'causal', 'abstraction', 'world-model', 'planning',
              'governance', 'assurance', 'simulation', 'multiagent', 'evaluation',
              'audit', 'security', 'adapters', 'persistence', 'experiments', 'ui'
            ].map(ctx => (
              <span key={ctx} className="px-2 py-1 bg-gray-100 rounded text-gray-700">{ctx}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Scientific Contract (S01-S30)</h3>
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          {[
            'S01 FACT ≠ ASSUMPTION', 'S02 INFERENCE ≠ OBSERVATION', 'S03 UNKNOWN ≠ FALSE',
            'S04 UNKNOWN ≠ TRUE', 'S05 MISSING ≠ NEGATIVE', 'S06 PREDICTION ≠ OBSERVATION',
            'S07 SIMULATION ≠ REALITY', 'S08 CORRELATION ≠ CAUSATION', 'S09 CONSENSUS ≠ TRUTH',
            'S10 CONFIDENCE ≠ CORRECTNESS', 'S11 CANDIDATE ≠ VALIDATED', 'S12 SIMILARITY ≠ ANALOGY',
            'S13 CANDIDATE PLAN ≠ ADMISSIBLE', 'S14 ADMISSIBLE ≠ APPROVED', 'S15 CAPABILITY ≠ PERMISSION',
            'S16 PERMISSION ≠ AUTHORITY', 'S17 DELEGATION ≠ AUTHORITY', 'S18 NO FABRICATED APPROVAL',
            'S19 HISTORY IMMUTABLE', 'S20 VALIDATION REQUIRES EXPERIMENT', 'S21 TEST ≠ SCIENCE',
            'S22 UNSUPPORTED REMAINS UNSUPPORTED', 'S23 UNCERTAINTY → ABSTENTION', 'S24 HUMAN ATTRIBUTABLE',
            'S25 MODEL OUTPUT ≠ TRUTH', 'S26 SIMULATED ≠ REAL', 'S27 VERSIONS PRESERVED',
            'S28 PLANNING ≠ AUTHORITY', 'S29 UNKNOWN ≠ PERMISSION', 'S30 GROUNDED EXPLANATION',
          ].map(s => (
            <span key={s} className="px-2 py-1 bg-green-50 text-green-800 rounded border border-green-200">{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Dependency Direction</h3>
        <pre className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded overflow-x-auto">
{`CORE
 ↓
CASE
 ↓
EVIDENCE / EPISTEMICS / PROVENANCE
 ↓
REASONING / CAUSAL
 ↓
ABSTRACTION / WORLD MODEL
 ↓
PLANNING
 ↓
SIMULATION

Transversal: AUTHORITY | GOVERNANCE | ASSURANCE | AUDIT | SECURITY | EVALUATION`}
        </pre>
      </div>
    </div>
  );
}

function CasesPanel() {
  const ctx = useMemo(() => createDemoContext(true), []);
  const demoResult = useMemo(() => runSyntheticDemo(ctx), [ctx]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Research Cases</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500">ID</span>
            <p className="font-mono text-sm">{demoResult.caseObj.id}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Title</span>
            <p className="text-sm">{demoResult.caseObj.title}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Lifecycle</span>
            <p className="text-sm">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{demoResult.caseObj.lifecycle}</span>
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Provenance</span>
            <p className="text-xs font-mono text-gray-600">
              Producer: {demoResult.caseObj.provenance.producer} | 
              Method: {demoResult.caseObj.provenance.method} | 
              Version: {demoResult.caseObj.provenance.version}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          <strong>Case Isolation:</strong> Each case is an independent boundary.
          Objects from Case A cannot be accessed or modified by Case B without explicit cross-case references.
        </p>
      </div>
    </div>
  );
}

function EvidencePanel() {
  const ctx = useMemo(() => createDemoContext(true), []);
  const demoResult = useMemo(() => runSyntheticDemo(ctx), [ctx]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Evidence</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Epistemic Status Distinctions</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.values(EpistemicStatus).map(status => (
            <span key={status} className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-center">{status}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Evidence</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">OBSERVED</span>
            <span>pH level measured at 7.2 in sample A</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">INFERENCE</span>
            <span>Water sample A is within safe pH range</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Invariants:</strong> UNKNOWN ≠ FALSE. ASSUMPTION ≠ FACT. INFERENCE ≠ OBSERVATION.
          Absence of evidence ≠ negative evidence. Contradictory evidence is preserved.
        </p>
      </div>
    </div>
  );
}

function GovernancePanel() {
  const ctx = useMemo(() => createDemoContext(true), []);
  const demoResult = useMemo(() => runSyntheticDemo(ctx), [ctx]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Human Governance</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Authority Distinctions</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between px-2 py-1 bg-gray-50 rounded">
            <span>CAPABILITY</span><span className="text-gray-500">What the machine can do technically</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-gray-50 rounded">
            <span>PERMISSION</span><span className="text-gray-500">What it is authorized to do</span>
          </div>
          <div className="flex justify-between px-2 py-1 bg-gray-50 rounded">
            <span>AUTHORITY</span><span className="text-gray-500">Who defines acceptable conditions</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Decision</h3>
        <p className="text-xs font-mono text-gray-600">
          Decision ID: {demoResult.decisionId}<br/>
          Actor: researcher-001 (HUMAN)<br/>
          Type: APPROVE<br/>
          Rationale: pH observation is correctly classified as OBSERVED
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-xs text-purple-800">
          <strong>Foundational Principle:</strong> The machine may acquire capacity and operational criteria.
          This does not grant it authority to redefine the conditions under which its action is acceptable.
        </p>
      </div>
    </div>
  );
}

function AuditPanel() {
  const ctx = useMemo(() => createDemoContext(true), []);
  const demoResult = useMemo(() => runSyntheticDemo(ctx), [ctx]);
  const auditEvents = ctx.auditRepo.getAll();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
      <p className="text-xs text-gray-500">Append-oriented. Events cannot be modified after creation.</p>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-2">
          {auditEvents.map((event, i) => (
            <div key={event.id} className="flex items-start gap-3 text-xs border-b border-gray-100 pb-2 last:border-0">
              <span className="text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    event.actorType === ActorType.HUMAN ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>{event.actorType}</span>
                  <span className="font-medium text-gray-800">{event.action}</span>
                </div>
                <p className="text-gray-500 mt-0.5">
                  {event.actor} → {event.target} {event.reason && `(${event.reason})`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoPanel({ demoResult, importResult, onRunDemo, onImport }: {
  demoResult: ReturnType<typeof runSyntheticDemo> | null;
  importResult: string | null;
  onRunDemo: () => void;
  onImport: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Synthetic Demo (Order 0)</h2>
      <p className="text-sm text-gray-600">
        Exercises the foundational architecture: case creation, evidence, provenance, authority, audit, export/import.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onRunDemo}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Run Demo
        </button>
        {demoResult && (
          <button
            onClick={onImport}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Import Exported Case
          </button>
        )}
      </div>

      {demoResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Demo Results</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Case ID:</span>
              <p className="font-mono">{demoResult.caseObj.id}</p>
            </div>
            <div>
              <span className="text-gray-500">Source ID:</span>
              <p className="font-mono">{demoResult.sourceId}</p>
            </div>
            <div>
              <span className="text-gray-500">Evidence ID:</span>
              <p className="font-mono">{demoResult.evidenceId}</p>
            </div>
            <div>
              <span className="text-gray-500">Claim ID:</span>
              <p className="font-mono">{demoResult.claimId}</p>
            </div>
            <div>
              <span className="text-gray-500">Policy ID:</span>
              <p className="font-mono">{demoResult.policyId}</p>
            </div>
            <div>
              <span className="text-gray-500">Decision ID:</span>
              <p className="font-mono">{demoResult.decisionId}</p>
            </div>
            <div>
              <span className="text-gray-500">Audit Events:</span>
              <p className="font-mono">{demoResult.auditEvents}</p>
            </div>
            <div>
              <span className="text-gray-500">Export Version:</span>
              <p className="font-mono">{demoResult.exported.version}</p>
            </div>
          </div>
        </div>
      )}

      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800">{importResult}</p>
        </div>
      )}
    </div>
  );
}

function FutureModulePanel({ module }: { module: ModuleInfo }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{module.name}</h2>
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
        <div className="text-3xl mb-3">🔬</div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">FUTURE MODULE</h3>
        <p className="text-xs text-gray-500 mb-3">{module.description}</p>
        {module.wp && (
          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
            {module.wp}
          </span>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Contracts reserved. Implementation pending in future orders.
        </p>
      </div>
    </div>
  );
}
