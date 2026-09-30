# ADR-022: WP7 Benchmarking, Validation & TRL Evidence

## Status
Accepted

## Context
HAG-RAP V.2 requires a scientific validation framework to benchmark system capabilities, conduct experiments, validate performance, and provide evidence for Technology Readiness Level (TRL) assessment. This must be done with strict epistemic honesty, clearly distinguishing between specifications and actual results.

## Decision
Implemented WP7 with three core modules:

### Experiment Framework (`src/experiment/index.ts`)
- **ScenarioDefinition**: Defines experimental scenarios with inputs, constraints, and expected outputs
- **Experiment**: Specifies experimental setup with type (BENCHMARK, ABLATION, ROBUSTNESS, etc.)
- **ExperimentRun**: Tracks actual execution with configuration, seed, and timing
- **ExecutedScenario**: Records actual inputs/outputs from scenario execution
- **MetricDefinition**: Defines metrics with type, unit, and range
- **MetricResult**: Records actual metric values with confidence intervals
- **ReproducibilityRecord**: Captures all information needed to reproduce a run

### Benchmark Framework (`src/benchmark/index.ts`)
- **BenchmarkDefinition**: Defines benchmark suites with task counts and target metrics
- **BenchmarkRun**: Tracks benchmark execution with actual task completion
- **Baseline**: Records baseline performance for comparison
- **AblationDefinition**: Defines component removal experiments
- **AblationResult**: Records performance impact of ablations
- **PerturbationDefinition**: Defines robustness tests (missing evidence, noise, etc.)
- **PerturbationResult**: Records system behavior under perturbation

### TRL Evidence (`src/trl/index.ts`)
- **TRLEvidenceItem**: Individual evidence for TRL categories (REQUIREMENTS, CAPABILITIES, VERIFICATION, BENCHMARK, VALIDATION, HUMAN_STUDY, REPRODUCIBILITY, ASSURANCE, SECURITY)
- **TRLEvidencePackage**: Aggregates evidence items for TRL assessment
- **HumanStudyProtocol**: Defines human study requirements (NOT executed in demo)
- **HumanStudySession**: Records actual human study sessions (0 in demo - honest)
- **TRL Assessment**: Conservative algorithm requiring independent validation and human study for TRL4

## Epistemic Honesty Principles

### Critical Distinctions
1. **SPECIFICATION ≠ EXECUTION**: Experiment definitions are not results
2. **TARGET ≠ ACHIEVEMENT**: Benchmark targets are not actual performance
3. **SOFTWARE TEST ≠ SCIENTIFIC EXPERIMENT**: Unit tests do not validate scientific claims
4. **MISSING TELEMETRY = UNKNOWN**: Not 0, not estimated, explicitly unknown
5. **CONFIDENCE ≠ CORRECTNESS**: Confidence intervals do not guarantee correctness
6. **SELF-VALIDATION ≠ INDEPENDENT VALIDATION**: Internal validation is not sufficient for TRL4
7. **HUMAN SESSIONS CANNOT BE FABRICATED**: No fake participants in demo

### TRL Assessment Logic
TRL4 requires ALL of:
- Requirements demonstrated
- Capabilities demonstrated  
- Verification completed
- Benchmarks executed
- **Independent validation performed** (not self-validation)
- **Human study conducted** (not fabricated)

Without independent validation and human study, TRL remains at TRL3 maximum.

## Consequences

### Positive
- Complete experimental infrastructure for scientific validation
- Honest reporting of what was and was not executed
- Clear separation between specifications and results
- Reproducibility support with full configuration capture
- Conservative TRL assessment preventing overclaiming

### Negative
- TRL4 not achieved (requires independent validation and human study)
- Limited benchmark execution (honest about scope)
- No human study data (honest about absence)

### Neutral
- Framework supports future expansion to 2000+ automated tasks
- Infrastructure ready for human study when ethically approved
- TRL assessment algorithm can be refined with more evidence

## Implementation Details

### Files Created
- `src/experiment/index.ts`: Experiment framework (321 lines)
- `src/benchmark/index.ts`: Benchmark framework (412 lines)
- `src/trl/index.ts`: TRL evidence framework (488 lines)
- `src/demo/wp7-demo.ts`: Honest synthetic demo (389 lines)
- `tests/order6.test.ts`: Core WP7 tests (37 tests)
- `tests/order6-additional.test.ts`: Additional WP7 tests (42 tests)
- `tests/order6-final.test.ts`: Final WP7 tests (28 tests)

### Test Coverage
- 107 new tests for WP7 (37 + 42 + 28)
- Total test suite: 725 tests (all passing)
- Coverage includes: experiments, benchmarks, ablations, perturbations, TRL evidence, human study protocols, reproducibility, and epistemic honesty checks

### Demo Honesty
The WP7 demo explicitly reports:
- **Executed**: 2 experiment runs, 2 executed scenarios, 2 benchmark runs, 2 baselines, 2 ablations, 2 perturbations, 9 TRL evidence items
- **NOT Executed**: 0 human study sessions (no fabricated participants)
- **TRL Status**: NOT_ACHIEVED (missing independent validation and human study)

## Invariants Enforced
- specification ≠ result
- target ≠ achievement
- test ≠ experiment
- unexecuted benchmark has no result
- comparison requires execution
- missing telemetry = UNKNOWN
- confidence ≠ correctness
- missing data ≠ fairness
- human sessions cannot be fabricated
- self-validation ≠ independent validation
- seed/provenance preserved
- failed experiment preserved
- TRL requires evidence
- software PASS ≠ TRL4
- cross-case experiment rejected
- export/import preserves WP7
- audit history immutable

## Verification
- Typecheck: PASS
- Tests: 725/725 PASS
- Build: PASS
- Post-build regression: PASS
- No correctable defects

## Related Decisions
- ADR-017: WP2 Scientific Foundations (evidence for experiments)
- ADR-018: WP3 Deep Reasoning (reasoning benchmarks)
- ADR-019: WP4 Deep Abstraction (abstraction benchmarks)
- ADR-020: WP5 Deep Planning (planning benchmarks)
- ADR-021: WP6 Integration (integration benchmarks)

## Future Work
- Execute full benchmark suite (2000+ tasks)
- Conduct human study with ethical approval
- Obtain independent validation
- Refine TRL assessment with additional evidence
- Expand to TRL5+ with field validation
