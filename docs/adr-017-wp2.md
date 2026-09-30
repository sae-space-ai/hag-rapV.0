# ADR-017: WP2 Scientific Foundations

## Context
HAG-RAP V.2 requires a solid scientific foundation before implementing cognitive engines (WP3-WP7). Order 0 established architectural contracts but did not implement executable scientific capabilities. WP2 must provide the first layer of executable scientific infrastructure: evidence graph, requirements, trustworthiness, validation, and explanation.

## Decision
Implement WP2 as modular scientific foundations with the following bounded contexts:
- **Evidence Graph**: Sources, evidence items, claims, assumptions, uncertainties, contradictions with typed relations (SUPPORTS, REFUTES, CONTRADICTS, DERIVED_FROM, ASSUMES, SUPERSEDES)
- **Requirements**: Scientific requirements with traceability to sources, evidence, risks, controls, and validation criteria
- **Trustworthiness**: Fundamental rights, human oversight, abstention/escalation policies, data governance, security requirements
- **Research Boundary**: Machine-readable policy defining allowed data types and prohibited domains
- **Validation**: Metric definitions, acceptance criteria, benchmark specifications, scientific scenarios, validation protocols
- **Explanation**: Grounded explanation queries (WHY_SUPPORTED, WHAT_REFUTES, WHAT_ASSUMPTIONS, etc.)

All entities carry provenance, versioning, and case isolation. No cross-case references allowed.

## Consequences
- **Positive**: First executable scientific layer ready for WP3-WP7 integration
- **Positive**: Clear separation between specification (validation) and results (future experiments)
- **Positive**: Trustworthiness-by-design with human oversight linked to authority policies
- **Positive**: Research boundary prevents operational misuse
- **Neutral**: 133 new tests added (total 221 tests)
- **Neutral**: No cognitive engines implemented (WP3-WP7 remain NOT_IMPLEMENTED)

## Alternatives Rejected
- **Monolithic evidence store**: Rejected because it would violate modularity principle and make future refactoring difficult
- **Immediate WP3 implementation**: Rejected because scientific foundations must be solid before reasoning engines
- **Generic validation framework**: Rejected because scientific validation requires specific semantics (SPECIFICATION ≠ RESULT)

## Invariants Enforced
- SOURCE ≠ EVIDENCE ≠ CLAIM ≠ FACT
- ASSUMPTION ≠ FACT (requires explicit validation)
- INFERENCE ≠ OBSERVATION
- PREDICTION ≠ OBSERVATION
- SIMULATION ≠ REALITY
- UNKNOWN ≠ FALSE/TRUE
- MISSING ≠ NEGATIVE
- CONFIDENCE ≠ CORRECTNESS
- CORRELATION ≠ CAUSATION
- CONSENSUS ≠ TRUTH
- SPECIFICATION ≠ RESULT
- METRIC DEFINITION ≠ METRIC RESULT
- SOFTWARE TEST ≠ SCIENTIFIC EXPERIMENT
- BUILD PASS ≠ SCIENTIFIC SUCCESS
- TRL4 ≠ ACHIEVED

## Implementation Status
- Evidence Graph: IMPLEMENTED
- Requirements: IMPLEMENTED
- Trustworthiness: IMPLEMENTED
- Research Boundary: IMPLEMENTED
- Validation: IMPLEMENTED
- Explanation: IMPLEMENTED
- Deep Reasoning Engine: NOT_IMPLEMENTED
- Causal Engine: NOT_IMPLEMENTED
- Abstraction Engine: NOT_IMPLEMENTED
- World Model Engine: NOT_IMPLEMENTED
- Planner Engine: NOT_IMPLEMENTED
- Formal Assurance Engine: NOT_IMPLEMENTED
- Scientific Benchmarks: NOT_EXECUTED
- TRL4: NOT_ACHIEVED
