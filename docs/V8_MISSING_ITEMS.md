# FCC v8 — Second Wave

Implemented in this wave:
- knowledge freshness metadata and checker
- experiment runner/ledger path
- Autoloop v2 protocol and launcher
- FCC score definition + calculator
- Da Vinci Visual QA v2 protocol
- `/orq council` protocol
- worktree policy
- evaluator/experiment/state artifacts remain first-class

Follow-up still requiring external browser/runtime tooling: actual screenshot capture and visual diffing, and full multi-worktree orchestration in the CLI.

## Runtime status\nThe second wave now wires council, context freshness, experiment decisions, autoloop v2 entrypoint, FCC scoring, visual QA capture validation, and worktree checks. Browser screenshot capture/diff remains environment-dependent and is intentionally guarded by `scripts/visual-qa.mjs`.\n