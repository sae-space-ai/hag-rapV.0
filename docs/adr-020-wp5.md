# ADR-018: Deep Planning & Continual Replanning (WP5)

## Status
Accepted

## Context
HAG-RAP V.2 requires a planning engine capable of generating, evaluating, and revising plans while maintaining strict separation between planning capabilities and authority. The system must support hierarchical, contingent, and uncertainty-aware planning without allowing the planner to override human authority or modify non-negotiable constraints.

## Decision
Implemented WP5 with the following components:

### Core Planning Structures
- **PlanningGoal**: Objectives with priority, success criteria, and authority ownership
- **PlanningConstraint**: HARD/SOFT constraints with modifiability levels (NON_NEGOTIABLE, HUMAN_LOCKED, SYSTEM_MODIFIABLE, LOCAL_DISCRETION, ADVISORY)
- **PlanningOperator**: Reusable actions with preconditions, effects, and resource requirements
- **Plan**: Multi-dimensional state tracking (lifecycle, admissibility, adaptation, authority, execution mode)

### Plan Lifecycle Management
- **PlanLifecycle**: DRAFT → EVALUATED → SELECTED → EXECUTING → COMPLETED/FAILED/ABANDONED
- **PlanAdmissibility**: NOT_EVALUATED, ADMISSIBLE, INADMISSIBLE, CONTESTED
- **PlanAdaptation**: STABLE, DEVIATED, REPAIRING, REPLANNING, SAFE_STOPPED
- **PlanAuthority**: WITHIN_AUTHORITY, HUMAN_REVIEW_REQUIRED, AUTHORITY_BLOCKED
- **ExecutionMode**: NOT_EXECUTED, SIMULATED, OBSERVED (maintaining WP3 separation)

### Deviation & Replanning
- **PlanDeviation**: Detection of expected vs actual state mismatches
- **FailureDetection**: Recording of plan failures with severity levels
- **PlanRepair**: Local repair attempts with success probability
- **PlanRevision**: Creation of new plan versions when major changes occur
- **ReplanningTrigger**: Events that trigger replanning (DEVIATION, NEW_EVIDENCE, HUMAN_REQUEST, WORLD_STATE_CHANGE, CONSTRAINT_VIOLATION)
- **SafeStop**: Controlled plan termination requiring human authorization to resume

### Key Invariants Enforced
1. **CANDIDATE PLAN ≠ ADMISSIBLE PLAN**: Plans must be evaluated before being considered admissible
2. **ADMISSIBLE PLAN ≠ SELECTED PLAN**: Human approval required for selection
3. **SELECTED PLAN ≠ HUMAN APPROVED PLAN**: Selection and approval are distinct
4. **PLAN ≠ EXECUTION**: Planning is separate from execution
5. **SIMULATED ≠ EXECUTED**: Simulation does not count as real execution
6. **NON_NEGOTIABLE constraints are immutable**: Planner cannot modify these
7. **HUMAN_LOCKED goals are immutable**: Planner cannot modify these
8. **Authority cannot be escalated**: Planner operates within defined boundaries
9. **Cross-case isolation**: Plans cannot access data from other cases
10. **Score does not override prohibition**: High evaluation scores cannot violate hard constraints

### Authority Boundaries
The planner can:
- Generate and evaluate plan alternatives
- Detect deviations and propose repairs
- Trigger replanning when conditions change
- Recommend safe stops when risks are unacceptable

The planner cannot:
- Modify NON_NEGOTIABLE or HUMAN_LOCKED constraints
- Escalate its own authority
- Fabricate human decisions
- Continue execution after safe-stop without human authorization
- Override human governance decisions

## Consequences

### Positive
- Clear separation between planning capabilities and authority
- Comprehensive plan lifecycle tracking
- Robust deviation detection and replanning support
- Strong authority boundaries prevent overreach
- Full provenance and versioning for auditability

### Negative
- Increased complexity in plan management
- Requires careful coordination between planning and authority modules
- Replanning creates multiple plan versions that must be tracked

### Neutral
- Planning engine does not implement actual execution (deferred to future work)
- Counterfactual evaluation uses existing WP3/WP4 infrastructure

## Implementation Details

### Files Created
- `src/planning/index.ts`: Core planning engine with repository pattern
- `src/demo/wp5-demo.ts`: Synthetic demonstration of planning capabilities
- `tests/order4.test.ts`: 43 tests covering core planning functionality
- `tests/order4-additional.test.ts`: 23 additional tests for edge cases

### Test Coverage
- 66 new tests for WP5 (43 + 23)
- Total test suite: 466 tests (all passing)
- Coverage includes: goals, constraints, operators, plans, lifecycle management, admissibility, authority, execution mode, deviations, failures, repairs, revisions, triggers, safe stops, cross-case isolation, and plan references

### Integration with Previous Orders
- **WP2**: Plans reference evidence, claims, and requirements by ID
- **WP3**: Plans reference reasoning inferences and causal models
- **WP4**: Plans reference world models and abstractions
- **Authority**: Plans respect authority policies and human governance
- **Audit**: All plan changes are tracked with provenance

## Verification
- Typecheck: PASS
- Tests: 466/466 PASS
- Build: PASS
- Post-build regression: PASS
- No correctable defects

## Related Decisions
- ADR-008: Orthogonal State Model (plan state dimensions)
- ADR-009: Authority First-Class (planner authority boundaries)
- ADR-011: Simulation vs Reality (execution mode separation)
- ADR-017: WP2 Scientific Foundations (evidence references)
- ADR-018: WP3 Deep Reasoning (inference references)
- ADR-019: WP4 Deep Abstraction (world model references)
