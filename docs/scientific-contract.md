# HAG-RAP V.2 — Scientific Contract

This document establishes the invariants that the HAG-RAP V.2 architecture must preserve at all times. Violation of any contract constitutes a defect requiring immediate correction.

## Epistemic Distinctions

### S01: FACT ≠ ASSUMPTION
A supported fact is grounded in evidence. An assumption is explicitly acknowledged as unverified. The system must never automatically promote an assumption to fact status.

### S02: INFERENCE ≠ OBSERVATION
An inference is derived from premises. An observation is directly measured. The system must preserve this distinction in all storage, display, and export operations.

### S03: UNKNOWN ≠ FALSE
Unknown means the system lacks information. False means the system has determined negation. Treating unknown as false leads to silent errors.

### S04: UNKNOWN ≠ TRUE
Unknown does not imply truth. Absence of disconfirmation is not confirmation.

### S05: MISSING ≠ NEGATIVE
Absence of evidence is not evidence of absence. A missing data point must not be interpreted as a negative measurement.

### S06: PREDICTION ≠ OBSERVATION
A prediction is a model output about future or unobserved states. It must never be stored, displayed, or exported as if it were an observation.

### S07: SIMULATION ≠ REALITY
A simulation is a controlled execution within defined boundaries. It must never be confused with real-world execution or observation.

### S08: CORRELATION ≠ CAUSATION
Statistical correlation between variables does not establish causal relationship. Causal claims require explicit causal modeling with intervention analysis.

### S09: CONSENSUS ≠ TRUTH
Agreement among sources does not constitute truth. Consensus may reflect shared bias, limited evidence scope, or systematic error.

### S10: CONFIDENCE ≠ CORRECTNESS
A high confidence score does not guarantee correctness. Confidence reflects internal model certainty, not external validity.

## Abstraction Distinctions

### S11: CANDIDATE ABSTRACTION ≠ VALIDATED ABSTRACTION
A candidate concept has not been validated against counterexamples. Validation requires explicit evaluation.

### S12: SIMILARITY ≠ VALID ANALOGY
Structural similarity between domains does not constitute a valid analogical transfer. Transfer validity requires explicit assessment.

## Planning Distinctions

### S13: CANDIDATE PLAN ≠ ADMISSIBLE PLAN
A plan that exists as a candidate has not been evaluated for admissibility against constraints and authority boundaries.

### S14: ADMISSIBLE PLAN ≠ HUMAN APPROVED PLAN
An admissible plan satisfies technical criteria. Human approval is a separate governance action requiring explicit human decision.

## Authority Distinctions

### S15: CAPABILITY ≠ PERMISSION
The system may be technically capable of an action without having permission to execute it. Capability is necessary but not sufficient.

### S16: PERMISSION ≠ AUTHORITY
Permission to act within defined boundaries does not constitute authority to redefine those boundaries. Authority remains with the human governor.

### S17: DELEGATION DOES NOT CREATE AUTHORITY
Delegating an action to another agent does not transfer or create authority. The delegating agent cannot grant authority it does not possess.

### S18: HUMAN APPROVAL CANNOT BE FABRICATED
No automated process may generate, simulate, or infer human approval. HumanDecision records require explicit human actor attribution.

## Historical Integrity

### S19: HISTORY CANNOT BE SILENTLY REWRITTEN
Previous versions, decisions, and audit events must be preserved. New versions supersede but do not erase.

### S20: SCIENTIFIC VALIDATION REQUIRES EXPERIMENT
Software tests passing does not constitute scientific validation. Scientific claims require executed experiments with evidence.

### S21: SOFTWARE PASS ≠ SCIENTIFIC SUCCESS
A build passing, tests passing, or type checking passing does not demonstrate scientific achievement. These are engineering quality gates.

## Evidence and Conclusion

### S22: UNSUPPORTED CONCLUSION REMAINS UNSUPPORTED
A conclusion without evidence trace remains explicitly unsupported. The system must not silently assign support.

### S23: CRITICAL UNCERTAINTY MAY REQUIRE ABSTENTION
When uncertainty is critical and cannot be resolved, the system should abstain from action rather than proceed with insufficient grounds.

## Human Governance

### S24: HUMAN INTERVENTION MUST BE ATTRIBUTABLE
Every human intervention must record who acted, when, why, and what changed. Anonymous or unattributable interventions are rejected.

## External AI

### S25: MODEL OUTPUT ≠ CANONICAL TRUTH
Output from external AI models (LLMs, etc.) is candidate content requiring typed ingestion, provenance assignment, epistemic classification, and validation before entering canonical state.

## Execution Modes

### S26: SIMULATED EXECUTION ≠ REAL EXECUTION
A simulated execution must never be recorded, displayed, or exported as if it were a real execution. The execution mode distinction survives all operations.

## Versioning

### S27: NEW VERSION DOES NOT ERASE OLD VERSION
Creating a new version preserves the previous version. The system can reconstruct any historical state.

## Planning Authority

### S28: PLANNING CANNOT REDEFINE HUMAN AUTHORITY
The planning module may modify plans within authorized boundaries. It cannot redefine what goals are acceptable, what constraints are negotiable, or who has authority.

## Permission and Knowledge

### S29: UNKNOWN CANNOT CREATE PERMISSION
Lack of knowledge about a prohibition does not create permission. The system must not interpret unknown restrictions as permission to act.

## Explanation

### S30: EXPLANATION MUST BE GROUNDED IN TRACE
Every explanation must reference actual system state, provenance, audit events, or decisions. Explanations cannot fabricate provenance, human approval, or evidence that does not exist in the trace.

---

## Enforcement

These contracts are enforced through:
1. **Type system**: EpistemicStatus, ExecutionMode, ActorType, ScientificMaturity enums prevent conflation at compile time.
2. **Domain errors**: DomainError with specific codes prevents silent violations at runtime.
3. **Case isolation**: Repository methods enforce case boundaries.
4. **Audit trail**: Append-only audit records all state changes.
5. **Tests T001-T080**: Automated verification of all critical invariants.
6. **Architecture rules**: Forbidden dependency patterns prevent structural violations.
