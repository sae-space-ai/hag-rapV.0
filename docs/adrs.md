# HAG-RAP V.2 — Architecture Decision Records

## ADR-001: Greenfield HAG-RAP V.2

**CONTEXT**: HAG-RAP V.1 revealed architectural patterns that led to destructive refactoring requirements. A fresh start was needed to establish correct foundations before implementing cognitive capabilities.

**DECISION**: Build HAG-RAP V.2 as a complete greenfield implementation. No code, types, or architectural patterns are imported from V.1. V.1 serves only as engineering experience informing what to avoid.

**CONSEQUENCES**: Clean dependency graph. No legacy debt. Ability to establish correct bounded contexts from the start. Cost: initial implementation time.

**ALTERNATIVES REJECTED**: Incremental migration (rejected: would carry forward structural problems). Refactoring V.1 (rejected: coupling too deep to safely refactor).

---

## ADR-002: Bounded Contexts

**CONTEXT**: A monolithic architecture leads to unintended coupling, where changes in one area break unrelated areas. Scientific domains have distinct semantics that must not be conflated.

**DECISION**: Define explicit bounded contexts: core, case, evidence, epistemics, provenance, authority, reasoning, causal, abstraction, world-model, planning, governance, assurance, simulation, multiagent, evaluation, audit, security, adapters, persistence, experiments, ui. Each context communicates through public contracts only.

**CONSEQUENCES**: Isolated changes. Clear ownership. Enforced boundaries. Cost: more boilerplate for context boundaries.

**ALTERNATIVES REJECTED**: Single module (rejected: leads to god objects). Feature-based folders (rejected: doesn't enforce semantic boundaries).

---

## ADR-003: Canonical IDs

**CONTEXT**: Using generic string IDs allows accidental interchange of identifiers between different entity types, leading to subtle bugs where a SourceId is used where an EvidenceId is expected.

**DECISION**: Implement branded/nominal typed IDs. Each entity type has its own ID type (ResearchCaseId, SourceId, EvidenceId, etc.) that is structurally a string but nominally distinct at the type level.

**CONSEQUENCES**: Compile-time prevention of ID type confusion. Deterministic ID generation for testing. Cost: slightly more verbose type annotations.

**ALTERNATIVES REJECTED**: Generic string IDs (rejected: no type safety). Numeric IDs (rejected: less debuggable). UUID-only (rejected: non-deterministic for testing).

---

## ADR-004: ResearchCase Isolation

**CONTEXT**: Without explicit case boundaries, objects from different research contexts can be accidentally mixed, leading to invalid cross-references and corrupted scientific state.

**DECISION**: ResearchCase is the primary aggregation boundary. All scientific objects belong to a case. Repository methods enforce case ownership. Cross-case access throws CASE_ISOLATION_VIOLATION.

**CONSEQUENCES**: Prevents accidental cross-contamination. Clear data ownership. Cost: must always pass caseId to repository methods.

**ALTERNATIVES REJECTED**: Global namespace (rejected: no isolation). Optional case references (rejected: doesn't enforce boundaries).

---

## ADR-005: Epistemic Separation

**CONTEXT**: Conflating epistemic states (e.g., treating an assumption as a fact, or unknown as false) leads to silent scientific errors that propagate through the system.

**DECISION**: Define explicit EpistemicStatus enum with distinct values: OBSERVED, SUPPORTED_FACT, CLAIM, ASSUMPTION, INFERENCE, HYPOTHESIS, PREDICTION, SIMULATION_RESULT, CONTESTED, SUPERSEDED, UNKNOWN. No implicit conversions between states.

**CONSEQUENCES**: All epistemic distinctions are explicit and preserved. Tests verify no automatic promotion. Cost: more verbose status management.

**ALTERNATIVES REJECTED**: Boolean true/false/unknown (rejected: loses too much distinction). String-based status (rejected: no compile-time safety).

---

## ADR-006: Provenance

**CONTEXT**: Scientific artifacts must be traceable to their origin. Without provenance, it is impossible to reconstruct why a conclusion was reached, who produced it, or under what assumptions.

**DECISION**: Provenance is a cross-cutting infrastructure. Every scientific artifact carries a Provenance object recording: producer, producerType, method, version, inputs, assumptions, supersedes, changeReason, humanIntervention.

**CONSEQUENCES**: Full traceability. Ability to reconstruct decision history. Cost: every artifact carries provenance overhead.

**ALTERNATIVES REJECTED**: Optional provenance (rejected: defeats purpose). External provenance store (rejected: loses locality).

---

## ADR-007: Versioning/Supersession

**CONTEXT**: Overwriting scientific state silently loses history. When a conclusion changes, the previous conclusion and the reason for change must be preserved.

**DECISION**: Every versioned artifact carries: version number, supersededBy reference, createdAt, createdBy, changeReason. New versions never destroy old ones.

**CONSEQUENCES**: Complete history reconstruction. Audit trail of scientific evolution. Cost: storage overhead for version history.

**ALTERNATIVES REJECTED**: In-place mutation (rejected: loses history). Event sourcing only (rejected: too complex for Order 0).

---

## ADR-008: Orthogonal State Dimensions

**CONTEXT**: Using a single status field for multiple independent dimensions (e.g., lifecycle + admissibility + authority) leads to combinatorial explosion and impossible states.

**DECISION**: Each independent dimension has its own enum. For planning: PlanLifecycle, PlanAdmissibility, PlanAdaptation, PlanAuthority, PlanExecutionMode are all separate and orthogonal.

**CONSEQUENCES**: No impossible state combinations. Clear semantics per dimension. Cost: more fields per entity.

**ALTERNATIVES REJECTED**: Single status with compound values (rejected: impossible states). Bit flags (rejected: poor readability).

---

## ADR-009: Authority First-Class

**CONTEXT**: Treating authority as an afterthought leads to systems where the AI can silently exceed its mandate or where human oversight is decorative rather than computational.

**DECISION**: Authority is a first-class domain from Order 0. AuthorityPolicy, Permission, AuthorityBoundary, ConstraintLock, and HumanDecision are core types. Modifiability levels (NON_NEGOTIABLE, HUMAN_LOCKED, SYSTEM_MODIFIABLE, LOCAL_DISCRETION, ADVISORY) are explicit.

**CONSEQUENCES**: Authority boundaries are enforced structurally. No silent escalation possible. Cost: more complex policy management.

**ALTERNATIVES REJECTED**: Implicit authority (rejected: leads to overreach). Role-based only (rejected: too coarse).

---

## ADR-010: Human Governance

**CONTEXT**: Human governance implemented as a simple "approve" button is insufficient. Real governance requires inspect, challenge, correct, reject, override, lock, unlock, and rationale recording.

**DECISION**: Governance supports the full range of human actions: INSPECT, CHALLENGE, CORRECT, REJECT, OVERRIDE, LOCK, UNLOCK, CHANGE_PRIORITY, REQUEST_ALTERNATIVE, REQUEST_EVIDENCE, REQUEST_COUNTERFACTUAL, STOP, RESUME, RECORD_RATIONALE. All actions are attributable.

**CONSEQUENCES**: Rich human oversight. Full audit trail of governance actions. Cost: more complex UI and state management.

**ALTERNATIVES REJECTED**: Approve/reject only (rejected: insufficient for real governance). No governance (rejected: violates core principle).

---

## ADR-011: Simulation vs Reality

**CONTEXT**: Confusing simulated execution with real execution leads to dangerous misunderstandings about system state and capabilities.

**DECISION**: ExecutionMode enum explicitly distinguishes: OBSERVED, PREDICTED, COUNTERFACTUAL, SIMULATED, REQUESTED, NOT_EXECUTED. These states never alias each other through any code path. The distinction survives memory, persistence, export, import, UI, and audit.

**CONSEQUENCES**: No confusion between what was simulated and what was observed. Cost: must track execution mode everywhere.

**ALTERNATIVES REJECTED**: Boolean simulated flag (rejected: loses granularity). Implicit mode (rejected: leads to confusion).

---

## ADR-012: External AI Adapter

**CONTEXT**: Direct dependency on specific LLM providers (OpenAI, Anthropic, etc.) creates vendor lock-in and allows model output to bypass scientific validation.

**DECISION**: External AI access goes through an adapter boundary. Model output is typed as ModelOutput with outputType indicating it is candidate content. It must pass through typed ingestion, provenance assignment, epistemic classification, and validation before entering canonical state. MODEL OUTPUT ≠ CANONICAL TRUTH.

**CONSEQUENCES**: Provider independence. All AI output is treated as candidate, not truth. Cost: additional ingestion pipeline.

**ALTERNATIVES REJECTED**: Direct API calls (rejected: vendor lock-in). Treating model output as evidence (rejected: violates S25).

---

## ADR-013: Scientific Tests vs Experiments

**CONTEXT**: Software tests (unit tests, integration tests) verify code correctness. Scientific experiments validate hypotheses about system behavior in the world. These are fundamentally different activities.

**DECISION**: Software tests use vitest and verify code invariants. Scientific experiments (Evaluation module) use Experiment, ExperimentRun, Benchmark, and MetricResult types with ScientificMaturity tracking. SOFTWARE TEST ≠ SCIENTIFIC EXPERIMENT.

**CONSEQUENCES**: Clear distinction between engineering quality and scientific validation. Cost: separate infrastructure for each.

**ALTERNATIVES REJECTED**: Using tests as experiments (rejected: wrong semantics). No experiments (rejected: cannot validate scientifically).

---

## ADR-014: Planning Architecture Before WP5

**CONTEXT**: The planning module needs to reference evidence, authority, and provenance without duplicating them. Planning states must be orthogonal.

**DECISION**: Planning contracts are reserved with explicit type definitions. PlanningPlan references (not duplicates) GoalId, ConstraintId, and uses orthogonal state enums. Planning does not create second copies of Evidence, WorldState, HumanDecision, AuthorityPolicy, or Provenance.

**CONSEQUENCES**: Clean separation. No duplication. Future planner can be implemented without restructuring. Cost: contracts must be designed correctly upfront.

**ALTERNATIVES REJECTED**: Embedding evidence in plans (rejected: duplication). Shared state (rejected: violates isolation).

---

## ADR-015: Audit vs Logging

**CONTEXT**: Application logs are for debugging. Audit trails are for accountability. Mixing them leads to audit gaps or log pollution.

**DECISION**: Audit is a separate append-only repository. AuditEvent records domain-level actions with actor, action, target, provenance context, and authority context. Application logging (console.log, etc.) is separate and not part of the audit trail.

**CONSEQUENCES**: Clear accountability trail. Logs don't pollute audit. Cost: dual tracking infrastructure.

**ALTERNATIVES REJECTED**: Unified log/audit (rejected: different semantics). Audit as log filter (rejected: loses completeness).

---

## ADR-016: Repository/Service Separation

**CONTEXT**: Mixing data access logic with business logic makes testing difficult and creates hidden dependencies.

**DECISION**: Repositories are pure data access interfaces. They store and retrieve entities. They enforce case isolation. They do not contain scientific logic. Services (future) orchestrate repositories and contain business logic.

**CONSEQUENCES**: Testable repositories. Clear separation of concerns. Cost: more files and interfaces.

**ALTERNATIVES REJECTED**: God services (rejected: untestable). Repository with business logic (rejected: hidden dependencies).
