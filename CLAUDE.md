# Project Instructions

This project uses [metaswarm](https://github.com/dsifry/metaswarm), a multi-agent orchestration framework for Gemini CLI. It provides 18 specialized agents, a 9-phase development workflow, and quality gates that enforce TDD, coverage thresholds, and spec-driven development.

## How to Work in This Project

### Starting work

```text
/start-task
```

This is the default entry point. It primes the agent with relevant knowledge, guides you through scoping, and picks the right level of process for the task.

### For complex features (multi-file, spec-driven)

Describe what you want built, include a Definition of Done, and ask for the full workflow:

```text
I want you to build [description]. [Tech stack, DoD items, file scope.]
Use the full metaswarm orchestration workflow.
```

This triggers the full pipeline: Research → Plan → Design Review Gate → Work Unit Decomposition → Orchestrated Execution (4-phase loop per unit) → Final Review → PR.

### Available Commands

| Command | Purpose |
|---|---|
| `/start-task` | Begin tracked work on a task |
| `/prime` | Load relevant knowledge before starting |
| `/review-design` | Trigger parallel design review gate (5 agents) |
| `/pr-shepherd <pr>` | Monitor a PR through to merge |
| `/self-reflect` | Extract learnings after a PR merge |
| `/handle-pr-comments` | Handle PR review comments |
| `/brainstorm` | Refine an idea before implementation |
| `/create-issue` | Create a well-structured GitHub Issue |
| `/external-tools-health` | Check status of external AI tools (Codex, Gemini) |
| `/setup` | Interactive guided setup — detects project, configures metaswarm |
| `/update` | Update metaswarm to latest version |
| `/status` | Run diagnostic checks on your installation |
| `/start` | Alias for `/start-task` |

### Visual Review

Use the `visual-review` skill to take screenshots of web pages, presentations, or UIs for visual inspection. Requires Playwright (`npx playwright install chromium`). See `skills/visual-review/SKILL.md`.

## Testing

- **TDD is mandatory** — Write tests first, watch them fail, then implement
- **100% test coverage required** — Lines, branches, functions, and statements. Enforced via `.coverage-thresholds.json` as a blocking gate before PR creation and task completion
- Test command: `npm test`
- Coverage command: `npm run test:coverage`

## Coverage

Coverage thresholds are defined in `.coverage-thresholds.json` — this is the **source of truth** for coverage requirements.
If a GitHub Issue specifies different coverage requirements, update `.coverage-thresholds.json` to match before implementation begins. Do not silently use a different threshold.

The validation phase of orchestrated execution reads `.coverage-thresholds.json` and runs the enforcement command. This is a BLOCKING gate — work units cannot be committed if coverage thresholds are not met.

## Quality Gates

- **Design Review Gate**: Parallel 5-agent review after design is drafted (`/review-design`)
- **Plan Review Gate**: Automatic adversarial review after any implementation plan is drafted. Spawns 3 independent reviewers (Feasibility, Completeness, Scope & Alignment) in parallel — ALL must PASS before the plan is presented to the user.
- **Coverage Gate**: Reads `.coverage-thresholds.json` and runs the enforcement command — BLOCKING gate before PR creation

## Workflow Enforcement (MANDATORY)

These rules ensure the full metaswarm pipeline is followed.

### After Brainstorming

When `brainstorming` (or any brainstorming skill) completes and commits a design document:

1. **STOP** — do NOT proceed directly to implementation
2. **RUN the Design Review Gate** — invoke `/review-design`
3. **WAIT** for all review agents to approve
4. **ONLY THEN** proceed to planning/implementation

### After Any Plan Is Created

When a planning skill produces an implementation plan:

1. **STOP** — do NOT begin implementation
2. **RUN the Plan Review Gate**
3. **WAIT** for all 3 adversarial reviewers to PASS
4. **ONLY THEN** present the plan to the user for approval

### Before Finishing a Development Branch

When implementation is complete:

1. **STOP** — before merge/PR
2. **RUN `/self-reflect`** to capture learnings
3. **COMMIT** the knowledge base updates
4. **THEN** proceed to finishing the branch

## Code Quality

- TypeScript strict mode, no `any` types
- All quality gates must pass before PR creation
