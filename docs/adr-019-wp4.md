# ADR-019: WP4 Deep Abstraction & Transferable World Models

## Context
HAG-RAP V.2 requires cognitive capabilities to build abstractions from evidence, transfer knowledge across domains via analogy, and maintain compositional world models. Order 0 established foundations, Order 1 implemented scientific foundations (WP2), Order 2 implemented reasoning and causal engines (WP3). WP4 must provide abstraction, analogy/transfer, and world modeling capabilities.

## Decision
Implement WP4 as four interconnected engines:

### Concept Model
- **ConceptCandidate**: Pattern recognition with evidence and counterexamples
- **Concept**: Validated abstraction with explicit scope and uncertainty
- **Counterexample**: Preserved even after validation
- **ConceptRelation**: IS_A, PART_OF, RELATED_TO, OPPOSITE_OF

### Abstraction Engine
- **Abstraction**: Hierarchical generalization with applicability envelope
- **AbstractionLattice**: Structured hierarchy from CONCRETE to GENERAL
- **ApplicabilityEnvelope**: Explicit supported/unsupported contexts, limitations, OOD indicators
- **AbstractionRelation**: GENERALIZES, SPECIALIZES, RELATED_TO

### Analogy & Transfer Engine
- **Analogy**: Structural mapping between domains with correspondences and differences
- **AnalogicalMapping**: Element-by-element correspondence with confidence
- **TransferHypothesis**: Predicted consequences of applying analogy
- **TransferAssessment**: ACCEPTED, REJECTED, PENDING_REVIEW, INSUFFICIENT_EVIDENCE

### World Model Engine
- **WorldModel**: Compositional model referencing Evidence/Claims/CausalModel by ID
- **WorldState**: State variables with epistemic status (OBSERVED, INFERRED, PREDICTED, SIMULATED, UNKNOWN)
- **Transition**: State changes with preconditions, effects, evidence basis, causal basis
- **ModelDisagreement**: Multiple incompatible interpretations preserved
- **OODAssessment**: IN_DISTRIBUTION, POSSIBLE_SHIFT, OUT_OF_DISTRIBUTION, UNKNOWN

## Consequences
- **Positive**: First abstraction layer enabling knowledge transfer
- **Positive**: Explicit applicability envelopes prevent over-generalization
- **Positive**: World models reference rather than duplicate evidence
- **Positive**: Model disagreements preserved for human review
- **Positive**: OOD detection enables appropriate escalation
- **Positive**: 68 new tests added (total 400 tests)
- **Neutral**: No planning engine yet (WP5 remains NOT_IMPLEMENTED)

## Alternatives Rejected
- **Automatic concept discovery**: Rejected because patterns require human validation
- **Universal abstractions**: Rejected because all abstractions have limited scope
- **Similarity-based analogy**: Rejected because structural mapping is required
- **Single world model**: Rejected because multiple interpretations must be preserved
- **Automatic OOD detection**: Rejected because requires explicit criteria

## Invariants Enforced
- ConceptCandidate ≠ Validated Concept
- Similarity ≠ Analogy (requires structural mapping)
- Analogy ≠ Valid Transfer (requires assessment)
- Source Domain ≠ Target Domain
- Transfer Hypothesis ≠ Observation
- Generality ≠ Universality (all abstractions have limits)
- Abstraction ≠ Truth (scope-limited)
- Predicted State ≠ Observed State
- Simulated State ≠ Reality
- World Model references Evidence (does not duplicate)
- Model Disagreement preserved (not auto-resolved)
- OOD UNKNOWN is valid status
- Cross-case access rejected
- Superseded abstractions remain reconstructable

## Implementation Status
- Concept Model: IMPLEMENTED
- Abstraction Engine: IMPLEMENTED
- Abstraction Lattice: IMPLEMENTED
- Applicability Envelope: IMPLEMENTED
- Analogy & Transfer: IMPLEMENTED
- World Model Engine: IMPLEMENTED
- Model Disagreement: IMPLEMENTED
- OOD Assessment: IMPLEMENTED
- Human Abstraction Governance: IMPLEMENTED
- Planner Engine: NOT_IMPLEMENTED
- Formal Assurance Engine: NOT_IMPLEMENTED
- WP7 Scientific Validation: NOT_EXECUTED
- TRL4: NOT_ACHIEVED

## Demo
WP4 demo includes:
- 6 ConceptCandidates
- 3 validated Concepts
- 3 Abstractions (CONCRETE, INTERMEDIATE, GENERAL)
- 1 AbstractionLattice
- 3 Counterexamples
- 2 Analogies with structural mappings
- 1 accepted transfer, 1 rejected transfer
- 2 WorldModels
- 5 WorldStates (OBSERVED, PREDICTED, SIMULATED, UNKNOWN)
- 5 Transitions
- 1 ModelDisagreement
- 2 OOD Assessments (POSSIBLE_SHIFT, OUT_OF_DISTRIBUTION)
