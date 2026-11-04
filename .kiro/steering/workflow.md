---
inclusion: always
---

# Working agreement for this repo

This repository is built **spec-driven with Kiro**. The artifacts under `.kiro/` are the source of
truth, not documentation afterthoughts.

## Order of work

1. `.kiro/specs/<feature>/requirements.md` — EARS statements, reviewed before any code.
2. `.kiro/specs/<feature>/design.md` — architecture and data flow.
3. `.kiro/specs/<feature>/tasks.md` — numbered, checkable implementation tasks.
4. Implementation, then mark the corresponding tasks done in `tasks.md`.

## Rules

- Do not change behaviour that no requirement covers without editing the requirement first.
- Every requirement must be traceable to a passing check in `tools/verify.mjs` or to a manual
  verification note written into `tasks.md`.
- `.kiro/` is **never** added to `.gitignore`. The judges require the folder to be present in the
  repository root and committed, because it is the evidence that Kiro was used.
- The public GitHub repository is the submission artifact: source, `LICENSE`, and `.kiro/` must all
  be visible in the "About" section.

## Custom agent

`.kiro/agents/surgeon.json` defines the project agent. Use it for any change touching
`src/organs.js` or `src/sync.js` — it encodes the organ-interface contract and the
zero-dependency rule.
