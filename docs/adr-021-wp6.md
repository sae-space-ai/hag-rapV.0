# ADR-021: WP6 Integration, Formal Assurance & Human Oversight

## Status
Accepted

## Context
HAG-RAP V.2 requires end-to-end integration of all cognitive modules (WP2-WP5), formal assurance mechanisms, runtime monitoring, security controls, contestability mechanisms, and adversarial testing capabilities. The system must maintain strict human oversight throughout the cognitive pipeline while ensuring security and trustworthiness.

## Decision
Implemented WP6 with six integrated modules:

### Integration Layer
- **IntegratedCognitiveRun**: End-to-end tracking of cognitive pipeline execution
- References all WP2-WP5 components by ID (no duplication)
- Tracks authority context, assurance status, and human decisions
- Maintains complete audit trail

### Assurance Framework
- **AssuranceCase**: Structured assurance arguments
- **AssuranceProperty**: Formal properties to verify (SAFETY, SECURITY, RELIABILITY, CORRECTNESS, AUTHORITY, GOVERNANCE)
- **Invariant**: Formal expressions of system properties
- **ConstraintCheck**: Verification of specific constraints
- **VerificationResult**: Results from verification methods (STATIC_ANALYSIS, DYNAMIC_TESTING, FORMAL_PROOF, MODEL_CHECKING, THEOREM_PROVING, RUNTIME_MONITORING, MANUAL_REVIEW)
- **AssuranceEvidence**: Evidence supporting assurance claims
- **ResidualRisk**: Accepted risks with human approval

### Runtime Monitoring
- **RuntimeMonitor**: Active monitoring of system behavior
- **MonitorEvent**: Detected violations and anomalies
- Event types: AUTHORITY_VIOLATION, CONSTRAINT_VIOLATION, CRITICAL_UNCERTAINTY, UNRESOLVED_CONTRADICTION, INVALID_PROVENANCE, OOD_CONDITION, UNSAFE_TRANSITION, SECURITY_FINDING, HUMAN_GATE_MISSING
- Actions: LOG, WARN, REVIEW_REQUIRED, ABSTAIN, SAFE_STOP

### Contestability
- **Contestation**: Formal mechanism to challenge system decisions
- Target types: REASONING, ABSTRACTION, WORLD_MODEL, PLAN, EVIDENCE, DECISION
- Status workflow: FILED → UNDER_REVIEW → ACCEPTED/REJECTED/RESOLVED/WITHDRAWN
- Preserves complete history and audit trail

### Security
- **SecurityFinding**: Security vulnerabilities and issues
- Severity levels: CRITICAL, HIGH, MEDIUM, LOW, INFO
- Lifecycle: DETECTED → INVESTIGATING → CONTAINED → REMEDIATING → RESOLVED
- Critical unresolved findings block demo release

### Adversarial Testing
- **AdversarialTest**: Controlled attack simulations
- Attack types: TAMPERED_EVIDENCE, AUTHORITY_ESCALATION, PROMPT_INJECTION, MODEL_OUTPUT_INJECTION, CROSS_CASE_CONTAMINATION, PROVENANCE_DELETION, CONSTRAINT_BYPASS, FAKE_HUMAN_APPROVAL, UNSAFE_REPLANNING, AUDIT_MUTATION
- **AdversarialCampaign**: Organized testing campaigns
- Tracks detection rate, mitigation rate, and undetected attacks

## Consequences

### Positive
- Complete end-to-end integration of cognitive pipeline
- Formal assurance with multiple verification methods
- Real-time monitoring with automatic responses
- Structured contestability for human oversight
- Comprehensive security lifecycle management
- Adversarial testing framework for validation

### Negative
- Increased system complexity
- Additional overhead from monitoring and assurance
- Requires careful coordination between modules

### Neutral
- Assurance claims require explicit evidence (no automatic verification)
- Security findings must be resolved before release
- Adversarial tests must be retested after mitigation

## Invariants Enforced
- Integration preserves IDs (no duplication)
- No duplicated canonical truth
- Assurance claim requires evidence
- Software PASS ≠ formal verification
- Authority monitor detects violations
- Locked constraints protected
- Critical uncertainty triggers policy
- Missing human gate detected
- AI cannot approve (requires human)
- Human correction is versioned
- Contestation preserves history
- Safe-stop blocks continuation
- AI cannot resume (requires human)
- Authorized human can resume
- Critical security finding blocks demo
- Remediation requires retest
- Tampered provenance detected
- Fake human actor rejected
- Cross-case integration rejected
- Audit is immutable
- New evidence triggers correct revision path

## Implementation Details

### Files Created
- `src/integration/index.ts`: Integration layer with IntegratedCognitiveRun
- `src/assurance/index.ts`: Assurance framework with properties, invariants, verification
- `src/monitoring/index.ts`: Runtime monitoring with event detection
- `src/contestability/index.ts`: Contestability mechanisms
- `src/security/index.ts`: Security findings and lifecycle
- `src/adversarial/index.ts`: Adversarial testing framework
- `src/demo/wp6-demo.ts`: End-to-end demonstration
- `tests/order5.test.ts`: 36 core tests
- `tests/order5-additional.test.ts`: 38 additional tests
- `tests/order5-final.test.ts`: 38 final tests

### Test Coverage
- 112 new tests for WP6 (36 + 38 + 38)
- Total test suite: 618 tests (all passing)
- Coverage includes: integration, assurance, monitoring, contestability, security, adversarial testing, and end-to-end scenarios

### Integration with Previous Orders
- **WP2**: Integration references evidence and requirements
- **WP3**: Integration references reasoning runs and causal models
- **WP4**: Integration references abstractions and world models
- **WP5**: Integration references plans and tracks execution
- **Authority**: All modules respect authority policies
- **Audit**: Complete audit trail maintained throughout

## Verification
- Typecheck: PASS
- Tests: 618/618 PASS
- Build: PASS
- Post-build regression: PASS
- No correctable defects

## Related Decisions
- ADR-009: Authority First-Class (authority monitoring)
- ADR-010: Human Governance (human oversight)
- ADR-011: Simulation vs Reality (execution mode separation)
- ADR-015: Audit vs Logging (audit trail)
- ADR-020: WP5 Deep Planning (plan integration)
