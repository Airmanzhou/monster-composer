# Monster Composer — agent instructions

Spec-driven project for the Kiroween 2026 hackathon (Frankenstein category).

**Read first:** `.kiro/steering/product.md`, `.kiro/steering/tech.md`, `.kiro/steering/workflow.md`.

**Source of truth:** `.kiro/specs/monster-composer/requirements.md` → `design.md` → `tasks.md`.

**Hard constraints:** zero backend, no build step, no external runtime dependency, deployable to
GitHub Pages, usable at 320 px width.

**Check before claiming done:** `node tools/verify.mjs` must exit 0.

**Never:** add `.kiro` to `.gitignore`; add a network dependency; start a second
`requestAnimationFrame` loop; leave `console.log` in committed code; change the organ module
interface without updating `design.md`.
