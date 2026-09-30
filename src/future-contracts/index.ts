/**
 * HAG-RAP V.2 — Future Contracts
 * These modules reserve type contracts for WP3-WP7.
 * They do NOT implement engines. They define the interfaces
 * that future implementations must satisfy.
 */

import {
  ResearchCaseId,
  EvidenceId,
  InferenceId,
  ReasoningRunId,
  CausalModelId,
  ConceptId,
  AbstractionId,
  WorldModelId,
  WorldStateId,
  GoalId,
  ConstraintId,
  PlanId,
  PlanVersionId,
  SimulationRunId,
  ExperimentId,
  EpistemicStatus,
  ExecutionMode,
  ScientificMaturity,
  ActorType,
  Provenance,
} from '../core/index.ts';

// ============================================================
// REASONING CONTRACTS (WP3)
// ============================================================

export enum InferenceType {
  DEDUCTIVE = 'DEDUCTIVE',
  INDUCTIVE = 'INDUCTIVE',
  ABDUCTIVE = 'ABDUCTIVE',
  DEFEASIBLE = 'DEFEASIBLE',
  CAUSAL = 'CAUSAL',
}

export interface Premise {
  ref: string;
  epistemicStatus: EpistemicStatus;
}

export interface Conclusion {
  content: string;
  epistemicStatus: EpistemicStatus;
  confidence: number;
}

export interface Inference {
  id: InferenceId;
  caseId: ResearchCaseId;
  type: InferenceType;
  premises: Premise[];
  conclusion: Conclusion;
  justificationTrace: string[];
  provenance: Provenance;
}

export interface ReasoningRun {
  id: ReasoningRunId;
  caseId: ResearchCaseId;
  inferences: InferenceId[];
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  failure?: ReasoningFailure;
  provenance: Provenance;
}

export interface ReasoningFailure {
  code: string;
  message: string;
  failedInference?: InferenceId;
}

export interface JustificationTrace {
  inferenceId: InferenceId;
  steps: string[];
}

// ============================================================
// CAUSAL CONTRACTS (WP3)
// ============================================================

export interface CausalVariable {
  id: string;
  name: string;
  type: 'observed' | 'latent' | 'intervention';
  domain: string;
}

export interface CausalRelation {
  source: string;
  target: string;
  relationType: 'direct' | 'mediated' | 'confounded';
  strength: number;
  evidence: EvidenceId[];
}

export interface CausalModel {
  id: CausalModelId;
  caseId: ResearchCaseId;
  variables: CausalVariable[];
  relations: CausalRelation[];
  provenance: Provenance;
}

export interface Intervention {
  variable: string;
  value: unknown;
  description: string;
}

export interface CounterfactualQuery {
  modelId: CausalModelId;
  intervention: Intervention;
  outcomeVariable: string;
}

export interface CounterfactualResult {
  query: CounterfactualQuery;
  predictedOutcome: unknown;
  confidence: number;
  epistemicStatus: EpistemicStatus.SIMULATION_RESULT;
  // INVARIANT: CounterfactualResult cannot become Observation
}

// ============================================================
// ABSTRACTION CONTRACTS (WP4)
// ============================================================

export interface Concept {
  id: ConceptId;
  caseId: ResearchCaseId;
  name: string;
  definition: string;
  maturity: 'CANDIDATE' | 'VALIDATED' | 'SUPERSEDED';
  evidence: EvidenceId[];
  counterexamples: string[];
  provenance: Provenance;
}

export interface ConceptCandidate {
  name: string;
  supportingEvidence: EvidenceId[];
  counterexamples: string[];
  confidence: number;
}

export interface Abstraction {
  id: AbstractionId;
  caseId: ResearchCaseId;
  level: number;
  concepts: ConceptId[];
  applicabilityEnvelope: string;
  provenance: Provenance;
}

export interface AbstractionLevel {
  level: number;
  description: string;
  concepts: ConceptId[];
}

export interface ApplicabilityEnvelope {
  domain: string;
  constraints: string[];
  knownExceptions: string[];
}

export interface Analogy {
  source: ConceptId;
  target: ConceptId;
  mapping: AnalogicalMapping;
  transferAssessment: TransferAssessment;
}

export interface AnalogicalMapping {
  correspondences: Array<{ source: string; target: string; relation: string }>;
}

export interface TransferAssessment {
  valid: boolean;
  confidence: number;
  limitations: string[];
  // INVARIANT: SIMILARITY ≠ ANALOGY. ANALOGY ≠ VALID TRANSFER.
}

// ============================================================
// WORLD MODEL CONTRACTS (WP4)
// ============================================================

export interface WorldModel {
  id: WorldModelId;
  caseId: ResearchCaseId;
  entities: WorldEntity[];
  relations: WorldRelation[];
  states: WorldState[];
  provenance: Provenance;
}

export interface WorldEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface WorldRelation {
  source: string;
  target: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface WorldState {
  id: WorldStateId;
  modelId: WorldModelId;
  entities: Record<string, unknown>;
  timestamp: string;
  executionMode: ExecutionMode;
}

export interface WorldTransition {
  fromState: WorldStateId;
  toState: WorldStateId;
  trigger: string;
}

export interface WorldPrediction {
  modelId: WorldModelId;
  predictedState: Partial<WorldState>;
  confidence: number;
  epistemicStatus: EpistemicStatus.PREDICTION;
  // INVARIANT: Prediction does not automatically become Evidence
}

export interface ModelDisagreement {
  models: WorldModelId[];
  pointOfDisagreement: string;
  description: string;
}

export interface OODAssessment {
  modelId: WorldModelId;
  input: unknown;
  isOOD: boolean;
  confidence: number;
}

// ============================================================
// PLANNING CONTRACTS (WP5)
// ============================================================

// ORTHOGONAL STATE DIMENSIONS — each independent
export enum PlanLifecycle {
  DRAFT = 'DRAFT',
  EVALUATED = 'EVALUATED',
  SELECTED = 'SELECTED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

export enum PlanAdmissibility {
  NOT_EVALUATED = 'NOT_EVALUATED',
  ADMISSIBLE = 'ADMISSIBLE',
  INADMISSIBLE = 'INADMISSIBLE',
  CONTESTED = 'CONTESTED',
  UNKNOWN = 'UNKNOWN',
}

export enum PlanAdaptation {
  STABLE = 'STABLE',
  DEVIATED = 'DEVIATED',
  REPAIRING = 'REPAIRING',
  REPLANNING = 'REPLANNING',
  SAFE_STOPPED = 'SAFE_STOPPED',
}

export enum PlanAuthority {
  WITHIN_AUTHORITY = 'WITHIN_AUTHORITY',
  HUMAN_REVIEW_REQUIRED = 'HUMAN_REVIEW_REQUIRED',
  AUTHORITY_BLOCKED = 'AUTHORITY_BLOCKED',
}

export enum PlanExecutionMode {
  NOT_EXECUTED = 'NOT_EXECUTED',
  SIMULATED = 'SIMULATED',
  CONTROLLED_EXECUTION = 'CONTROLLED_EXECUTION',
}

export interface PlanningGoal {
  id: GoalId;
  caseId: ResearchCaseId;
  description: string;
  priority: number;
}

export interface PlanningConstraint {
  id: ConstraintId;
  caseId: ResearchCaseId;
  description: string;
  modifiability: string; // references Modifiability
}

export interface PlanningOperator {
  name: string;
  preconditions: string[];
  effects: string[];
  resourceRequirements: string[];
}

export interface PlanningPlan {
  id: PlanId;
  caseId: ResearchCaseId;
  name: string;
  version: PlanVersionId;
  // ORTHOGONAL states — each independent
  lifecycle: PlanLifecycle;
  admissibility: PlanAdmissibility;
  adaptation: PlanAdaptation;
  authorityStatus: PlanAuthority;
  executionMode: PlanExecutionMode;
  steps: PlanStep[];
  goals: GoalId[];
  constraints: ConstraintId[];
  provenance: Provenance;
}

export interface PlanStep {
  id: string;
  operator: string;
  preconditions: string[];
  effects: string[];
  dependencies: string[];
}

export interface PlanHierarchy {
  planId: PlanId;
  parentPlanId?: PlanId;
  children: PlanId[];
}

export interface PlanDependency {
  fromPlan: PlanId;
  toPlan: PlanId;
  type: 'requires' | 'blocks' | 'enables';
}

export interface PlanAlternative {
  planId: PlanId;
  alternativeOf: PlanId;
  rationale: string;
}

export interface PlanBranch {
  planId: PlanId;
  branchPoint: string;
  branches: PlanId[];
}

export interface PlanEvaluation {
  planId: PlanId;
  criteria: Record<string, number>;
  overallScore: number;
  admissibility: PlanAdmissibility;
}

export interface PlanDeviation {
  planId: PlanId;
  expectedState: string;
  actualState: string;
  severity: 'minor' | 'major' | 'critical';
}

export interface PlanRepair {
  planId: PlanId;
  deviation: PlanDeviation;
  repairActions: string[];
}

export interface PlanRevision {
  planId: PlanId;
  reason: string;
  newVersion: PlanVersionId;
}

export interface SafeStop {
  planId: PlanId;
  reason: string;
  safeState: string;
}

export interface InformationGatheringAction {
  planId: PlanId;
  target: string;
  method: string;
}

// ============================================================
// ASSURANCE CONTRACTS (WP6)
// ============================================================

export interface AssuranceProperty {
  id: string;
  name: string;
  description: string;
  type: 'safety' | 'liveness' | 'invariant' | 'constraint';
}

export interface AssuranceInvariant {
  propertyId: string;
  expression: string;
  verified: boolean;
}

export interface ConstraintCheck {
  constraintId: string;
  satisfied: boolean;
  evidence: string[];
}

export interface RuntimeMonitor {
  id: string;
  propertyId: string;
  status: 'OK' | 'VIOLATED' | 'UNKNOWN';
  lastCheck: string;
}

export interface Hazard {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  controls: string[];
}

export interface AssuranceControl {
  hazardId: string;
  description: string;
  effectiveness: number;
}

export interface AssuranceEvidence {
  propertyId: string;
  evidence: string;
  verified: boolean;
}

export interface ResidualRisk {
  hazardId: string;
  level: number;
  accepted: boolean;
}

export interface SecurityFinding {
  id: string;
  severity: string;
  description: string;
  mitigated: boolean;
}

export interface VerificationResult {
  propertyId: string;
  result: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
  evidence: string[];
}

// ============================================================
// EVALUATION CONTRACTS (WP7)
// ============================================================

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  metrics: string[];
}

export interface Baseline {
  benchmarkId: string;
  results: Record<string, number>;
  timestamp: string;
}

export interface Experiment {
  id: ExperimentId;
  caseId: ResearchCaseId;
  name: string;
  protocol: string;
  maturity: ScientificMaturity;
  provenance: Provenance;
}

export interface ExperimentRun {
  experimentId: ExperimentId;
  timestamp: string;
  results: Record<string, number>;
  maturity: ScientificMaturity;
}

export interface Metric {
  name: string;
  description: string;
  unit: string;
}

export interface MetricResult {
  metricName: string;
  value: number;
  confidence: number;
}

export interface Ablation {
  component: string;
  withComponent: Record<string, number>;
  withoutComponent: Record<string, number>;
}

export interface Perturbation {
  type: string;
  magnitude: number;
  effect: Record<string, number>;
}

export interface ValidationProtocol {
  experimentId: ExperimentId;
  steps: string[];
  criteria: Record<string, string>;
}

export interface ValidationEvidence {
  protocolId: string;
  passed: boolean;
  evidence: string[];
}

// ============================================================
// MULTIAGENT CONTRACTS
// ============================================================

export interface AgentDeclaration {
  agentId: string;
  capabilities: string[];
  limitations: string[];
  confidenceStatus: string;
  dependencies: string[];
  commitments: string[];
  evidenceReferences: string[];
  authorityScope: string;
  verificationStatus: string;
}

export interface AgentRequest {
  fromAgent: string;
  toAgent: string;
  action: string;
  parameters: Record<string, unknown>;
  // INVARIANT: Delegation does not create authority
}

export interface AgentCommitment {
  agentId: string;
  commitment: string;
  expiresAt?: string;
}

// ============================================================
// SIMULATION CONTRACTS
// ============================================================

export interface SimulationRun {
  id: SimulationRunId;
  caseId: ResearchCaseId;
  description: string;
  executionMode: ExecutionMode.SIMULATED;
  results: Record<string, unknown>;
  provenance: Provenance;
  createdAt: string;
  // INVARIANT: SIMULATED ≠ OBSERVED
}

// ============================================================
// GOVERNANCE CONTRACTS
// ============================================================

export interface GovernanceAction {
  actor: string;
  actorType: ActorType;
  action: GovernanceActionType;
  target: string;
  rationale: string;
  timestamp: string;
}

export enum GovernanceActionType {
  INSPECT = 'INSPECT',
  CHALLENGE = 'CHALLENGE',
  CORRECT = 'CORRECT',
  REJECT = 'REJECT',
  OVERRIDE = 'OVERRIDE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  CHANGE_PRIORITY = 'CHANGE_PRIORITY',
  REQUEST_ALTERNATIVE = 'REQUEST_ALTERNATIVE',
  REQUEST_EVIDENCE = 'REQUEST_EVIDENCE',
  REQUEST_COUNTERFACTUAL = 'REQUEST_COUNTERFACTUAL',
  STOP = 'STOP',
  RESUME = 'RESUME',
  RECORD_RATIONALE = 'RECORD_RATIONALE',
}

// ============================================================
// EXTERNAL AI ADAPTER CONTRACTS
// ============================================================

export interface ModelOutput {
  provider: string;
  model: string;
  outputType: 'candidate_claim' | 'candidate_relation' | 'candidate_hypothesis' | 'candidate_abstraction' | 'candidate_plan' | 'explanation';
  content: unknown;
  confidence?: number;
  // INVARIANT: MODEL OUTPUT ≠ CANONICAL TRUTH
  // Must pass through typed ingestion, provenance, epistemic classification
}

export interface AdapterBoundary {
  ingestModelOutput(output: ModelOutput): { status: 'candidate'; requiresValidation: true };
  // No direct path from model output to canonical state
}

// ============================================================
// PERSISTENCE CONTRACTS
// ============================================================

export interface CaseExport {
  version: string;
  caseId: ResearchCaseId;
  exportedAt: string;
  data: Record<string, unknown>;
}

export interface PersistencePort {
  exportCase(caseId: ResearchCaseId): CaseExport;
  importCase(data: CaseExport): ResearchCaseId;
  validate(data: unknown): { valid: boolean; errors: string[] };
}

// ============================================================
// EXPLANATION CONTRACTS
// ============================================================

export interface ExplanationQuery {
  type: 'what_known' | 'what_assumed' | 'what_unknown' | 'what_contradicted' |
        'what_evidence' | 'what_inference' | 'why' | 'what_alternatives' |
        'why_this_plan' | 'why_not_other' | 'what_changed' | 'why_changed' |
        'what_can_modify' | 'what_cannot_modify' | 'who_has_authority' |
        'when_abstain' | 'when_stop';
  targetRef?: string;
  caseId: ResearchCaseId;
}

export interface Explanation {
  query: ExplanationQuery;
  grounded: boolean; // Must be grounded in actual trace
  content: string;
  references: string[];
  // INVARIANT: Explanation cannot fabricate provenance or human approval
}
