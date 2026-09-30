# ADR-018: WP3 Deep Reasoning & Causal Inference

## Context
HAG-RAP V.2 requires cognitive engines to process evidence, draw conclusions, and model causal relationships. Order 0 established architectural foundations, Order 1 implemented scientific foundations (WP2). WP3 must provide the first cognitive capabilities: multi-step reasoning with 5 inference types and causal modeling with counterfactuals.

## Decision
Implement WP3 as two cognitive engines:

### Reasoning Engine
- **5 Inference Types**: DEDUCTIVE, INDUCTIVE, ABDUCTIVE, DEFEASIBLE, CAUSAL
- **Evidence-Grounded**: Every inference links to EvidenceItems, Premises, Assumptions
- **Justification Graph**: Reconstructable chain from SOURCE→EVIDENCE→PREMISE→INFERENCE→CONCLUSION
- **Failure Detection**: INSUFFICIENT_EVIDENCE, CONTRADICTORY_EVIDENCE, INVALID_PREMISE, etc.
- **Defeasible Revision**: Conclusions can be superseded without erasing history
- **Human Governance**: Integrated with AuthorityPolicy from WP2

### Causal Engine
- **Causal Models**: Variables, relations, interventions
- **Counterfactuals**: WHAT IF queries with COUNTERFACTUAL execution mode
- **Validation**: Relations can be validated, updating model status
- **Strict Separation**: CORRELATION≠CAUSATION, COUNTERFACTUAL≠OBSERVATION

## Consequences
- **Positive**: First cognitive layer ready for evidence processing
- **Positive**: Clear separation between inference types with distinct semantics
- **Positive**: Justification traceability for all conclusions
- **Positive**: Counterfactual reasoning without confusing simulation with reality
- **Positive**: 111 new tests added (total 332 tests)
- **Neutral**: No abstraction, world model, or planning yet (WP4-WP5 remain NOT_IMPLEMENTED)

## Alternatives Rejected
- **Single inference type**: Rejected because different reasoning patterns require different semantics
- **Automatic causal discovery**: Rejected because correlation does not imply causation
- **Mutable conclusions**: Rejected because history must be reconstructable
- **Confidence-only failure handling**: Rejected because failures must be explicit, not hidden by scores

## Invariants Enforced
- INFERENCE ≠ OBSERVATION (conclusions never become observations)
- HYPOTHESIS ≠ FACT (hypotheses require validation)
- CORRELATION ≠ CAUSATION (causal relations require explicit creation)
- COUNTERFACTUAL ≠ OBSERVATION (counterfactual results are SIMULATION_RESULT)
- PREDICTION ≠ EVIDENCE (predictions don't become evidence)
- UNKNOWN ≠ FALSE/TRUE (unknown remains unknown)
- SUPERSEDED conclusions remain reconstructable
- Cross-case reasoning is rejected
- AI cannot fabricate HumanDecision
- Failure not hidden by confidence score

## Implementation Status
- Reasoning Engine: IMPLEMENTED
- Causal Engine: IMPLEMENTED
- Justification Graph: IMPLEMENTED
- Failure Detection: IMPLEMENTED
- Defeasible Revision: IMPLEMENTED
- Counterfactual Engine: IMPLEMENTED
- Human Reasoning Governance: IMPLEMENTED
- Abstraction Engine: NOT_IMPLEMENTED
- World Model Engine: NOT_IMPLEMENTED
- Planner Engine: NOT_IMPLEMENTED
- Formal Assurance Engine: NOT_IMPLEMENTED
- TRL4: NOT_ACHIEVED

## Demo
WP3 demo includes:
- 11 EvidenceItems
- 5 Claims
- 10 Inferences (3 DEDUCTIVE, 2 INDUCTIVE, 2 ABDUCTIVE, 2 DEFEASIBLE, 1 CAUSAL)
- 2 Contradictions
- 1 Defeasible revision
- 1 CausalModel with 4 variables and 3 relations
- 2 CounterfactualQueries with results
- 1 Abstention/review case
