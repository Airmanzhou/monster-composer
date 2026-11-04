# How Kiro was used

Kiroween 2026 requires a write-up on how Kiro was used. This file is that write-up, and it is
also the repository's own record of the Kiro assets it ships.

The project is **spec-driven inside Kiro**. Every behavioural rule lives in
`.kiro/specs/monster-composer/`, every convention lives in `.kiro/steering/`, and the project
agent lives in `.kiro/agents/`. The code is the output of those documents, not the other way
round.

## What ships in this repository

| Path | Kiro feature | What it does here |
| --- | --- | --- |
| `.kiro/specs/monster-composer/requirements.md` | Feature spec | 22 EARS requirements (`Ubiquitous` / `Event-driven` / `State-driven` / `Unwanted`), numbered so every implementation decision can point back at one. |
| `.kiro/specs/monster-composer/design.md` | Feature spec | Architecture, data flow, interface tables for every module, data models, the error-handling table, and the test strategy. |
| `.kiro/specs/monster-composer/tasks.md` | Feature spec | The task list, each task tagged with the requirement it satisfies, plus **manual verification notes** that record what was *observed* rather than what was intended. |
| `.kiro/steering/product.md` | Steering (`inclusion: always`) | The product contract: Frankenstein category, zero backend, zero build step, zero external runtime dependency, 320 px floor, "the creature must already be breathing on first paint". |
| `.kiro/steering/tech.md` | Steering (`inclusion: fileMatch` on `**/*.js`, `**/*.mjs`, `**/*.css`, `**/*.html`) | The stack and the house style: native ES modules, one `requestAnimationFrame`, lazy `AudioContext`, two-space indent, double quotes, named constants, and the shared organ interface `{ id, label, params, update, draw, describe }`. |
| `.kiro/steering/workflow.md` | Steering (`inclusion: always`) | The working order: requirements → design → tasks → implement → tick the task only after writing its verification note. It also states the two hard rules: `.kiro/` is never git-ignored, and the public repository *is* the submission. |
| `.kiro/agents/surgeon.json` | Custom agent | A project-scoped agent (`tools: read, write, shell`) that works the spec files first and runs `node tools/verify.mjs` before it reports anything as done. |
| `AGENTS.md` | Workspace instructions | Loaded from the repository root on every session, so the rules hold even when a steering file is not explicitly invoked. |

## The loop this project runs on

```
.kiro/steering/*.md  →  .kiro/specs/monster-composer/requirements.md
                      →  .kiro/specs/monster-composer/design.md
                      →  .kiro/specs/monster-composer/tasks.md
                      →  implementation
                      →  node tools/verify.mjs  (exit 0)
                      →  write the observation back into tasks.md
```

Two decisions in this repository came straight out of that loop, and both are recorded in the
specs rather than only in the code:

1. **`wrap()` had to stop adding 1 before the modulo.** `((v % 1) + 1) % 1` turned `0.18` into
   `0.17999999999999993`, which broke the tolerance edge: `syncScore(0, TOLERANCE)` returned
   `3.33e-16` instead of `0`, and the self-check failed. The fix was to change the implementation
   (`mod = v % 1; return mod < 0 ? mod + 1 : mod`) rather than to loosen the assertion, and
   `tools/verify.mjs` now keeps a regression guard for it.
2. **Dying on the first frame was a specification bug, not a code bug.** The original rule said
   "vitality 0 ⇒ deceased", which made the creature die the instant it was stitched. The
   requirement was rewritten (3.5 / 3.6) into a grace period plus a settle gesture, and
   `design.md` records it in the error-handling table.

## Running it in Kiro

The repository is designed to be opened in Kiro directly:

- **Kiro IDE / CLI** — open the folder; Kiro picks up `.kiro/steering/` and `.kiro/specs/`
  automatically. `node tools/verify.mjs` is the acceptance command.
- **Kiro Web** (`app.kiro.dev`) — zero install. Sign in, open the repository, and the steering
  and specs in the repo are read from the checkout. Note that Web sessions do not run
  event-driven hooks.

To work on the project in Kiro, ask for the spec to be followed rather than for code to be
written:

> Read `.kiro/specs/monster-composer/requirements.md` and `design.md` first, then implement
> task `T3.4` from `tasks.md`. Keep `tools/verify.mjs` green and write the observation into
> `tasks.md` when you are done.

## Tooling used

- **Kiro** — the spec-driven development loop above: steering, feature specs, a project agent,
  and the model that executes the tasks.
- **Node.js** (built in, no packages) — `tools/verify.mjs` (13 assertions over the phase
  mathematics) and `tools/serve.mjs` (a 40-line static server so the ES modules can run
  locally).
- **GitHub Pages** — the app is static files, so the submission's "accessible app URL" is the
  Pages deployment of this repository.

No framework, no bundler, no runtime dependency. The whole creature is about 900 lines of
plain JavaScript and Canvas 2D.
