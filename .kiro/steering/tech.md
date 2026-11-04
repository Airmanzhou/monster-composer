---
inclusion: fileMatch
fileMatchPattern: ["**/*.js", "**/*.mjs", "**/*.css", "**/*.html"]
---

# Technical conventions

## Stack

- Vanilla ES modules (`<script type="module">`). No bundler, no transpiler, no framework.
- Canvas 2D for the creature rendering. Web Audio API for heartbeat and breath.
  `speechSynthesis` for the voice organ, degrading silently when unavailable.
- `localStorage` for the graveyard archive. No cookies, no personal data, no network calls.

## Rendering

- One `requestAnimationFrame` loop in `src/app.js`. Every organ module reads the same
  clock value so the three organs stay phase-comparable.
- Create the `AudioContext` lazily on the first user gesture — browsers block it before that.

## Style

- 2-space indent, double quotes, semicolons, ES modules with explicit `.js` extensions.
- Named constants instead of magic numbers.
- Every organ module exports `{ id, label, params, update, draw, describe }` so the renderer can
  treat the three organs uniformly. This interface is the contract; do not change it silently.
- No `console.log` in committed code, no dead branches, no commented-out code.

## Verification

`node tools/verify.mjs` must exit 0. It re-implements the phase-sync maths and asserts that the
vitality function stays inside `[0, 100]` and reaches 100 only at perfect phase alignment.
Keep that file green on every change.
