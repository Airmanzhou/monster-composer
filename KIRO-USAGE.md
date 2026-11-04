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

- **Kiro CLI** — open the folder; Kiro picks up `.kiro/steering/` and `.kiro/specs/`
  automatically. `node tools/verify.mjs` is the acceptance command. The CLI runs on the **free
  Builder ID tier**, so the whole loop below needs no paid subscription:

  ```
  kiro-cli login --license free --social google --use-device-flow
  kiro-cli chat "<task>" --no-interactive --trust-all-tools
  ```

- **Kiro IDE** — open the folder; the same steering and specs are picked up, with the IDE's
  own diff and approval UI.
- **Kiro Web** (`app.kiro.dev`) — zero install, but it **requires a paid subscription (Pro or
  higher)**; the free tier cannot open Web sessions. Sign in, open the repository, and the
  steering and specs in the repo are read from the checkout. Note that Web sessions do not run
  event-driven hooks.

To work on the project in Kiro, ask for the spec to be followed rather than for code to be
written:

> Read `.kiro/specs/monster-composer/requirements.md` and `design.md` first, then implement
> task `T3.4` from `tasks.md`. Keep `tools/verify.mjs` green and write the observation into
> `tasks.md` when you are done.

## A verified session, not a described one

The write-up above is the *design* of the loop. This is an actual run of it, recorded because a
hackathon submission that only claims Kiro usage is worth less than one that shows it.

**2026-11-04 — Kiro CLI 3.0.0, free Builder ID tier, model selection on `auto`.**

The task handed to the CLI was deliberately bounded: read `requirements.md` and `design.md`, run
the acceptance command, and append one dated entry to the *Manual verification notes* section of
`tasks.md` — no source file, no spec other than `tasks.md`, no installs, no server.

```
kiro-cli chat "<bounded task>" --no-interactive --trust-all-tools
```

What Kiro actually did:

1. Read `requirements.md` and `design.md`.
2. Ran `node tools/verify.mjs` — output `Monster Composer — 13 checks passed`, exit code `0`.
3. Mapped each of the 13 checks back to the requirement ids it covers (3.3, 3.2, 3.4, 1.4, 1.2,
   1.7, 1.6, 3.6, 1.1, 1.5, 1.3) and appended that mapping, the exact command, the output and the
   exit code to `tasks.md`.
4. **Found a real defect in the spec**: `design.md` §6 enumerated 11 assertions while the verifier
   was already running 13 — the two undocumented checks (organ-interface shape, organ-update
   isolation) were missing from the design's test list. Kiro recorded it as a non-failing
   documentation divergence and named which requirements the undocumented checks cover.
5. Also listed the requirements that `verify.mjs` does *not* exercise (audio fallback, stitch
   animation, graveyard, share hash, accessibility) and pointed at the manual browser notes that
   cover them instead — so the note does not overstate what was verified.

`design.md` was then corrected to list all 13 assertions and to say where the correction came
from, so the divergence is fixed in the spec rather than only recorded in a note. The diff is in
the repository history.

That is the whole point of shipping `.kiro/` in the repository: the next agent — human or
model — can pick the story up mid-flight, because the requirements, the design, the task list and
the verification evidence are all in the repo.

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
