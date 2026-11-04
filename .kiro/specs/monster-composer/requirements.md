# Requirements — Monster Composer

Spec-driven requirements for the Kiroween 2026 "Frankenstein" entry.
Notation: EARS (Easy Approach to Requirements Syntax).
Traceability: every requirement maps to a check in `tools/verify.mjs` or a note in `tasks.md`.

## 1. Organ modules

1.1 When the app starts, the system shall expose exactly three organ modules, identified as
`HEART`, `LUNG`, and `VOICE`.

1.2 Where an organ module is rendered, the system shall draw it from a single shared clock value so
that all three organs are phase-comparable.

1.3 When the user changes an organ parameter control, the system shall apply the new value to that
organ on the next animation frame.

1.4 When the user activates the `MUTATE` control of an organ, the system shall randomize that
organ's phase offset within ±0.5 of its period and its amplitude within ±30 % of its nominal value.

1.5 Each organ module shall expose the interface `{ id, label, params, update, draw, describe }`.

1.6 When the user releases the `OFFSET` control of an organ, the system shall settle that organ
onto the current phase of the `HEART`, so that the two coincide exactly.

1.7 The `OFFSET` control shall resolve to at least four decimal places, so that a settled organ
can reach an exact phase coincidence.

## 2. Rendering

2.1 The system shall render the creature on a single Canvas 2D surface.

2.2 When the page loads, the system shall start exactly one animation loop, and shall never start a
second one.

2.3 Where the `AudioContext` API is unavailable or blocked, the system shall continue rendering
without audio and shall not raise an uncaught error.

## 3. Stitching

3.1 When the user activates the `STITCH` control, the system shall play a suture animation of
1200 ms, reset the three organ clocks to the same cycle, and then start the creature's organ
loop.

3.2 While a creature is alive, the system shall compute a vitality value in the closed range
[0, 100].

3.3 The system shall compute vitality from the circular phase distance between the `HEART` and
`LUNG` phases and between the `HEART` and `VOICE` phases.

3.4 The system shall report a vitality of 100 only when all three organs are in phase.

3.5 Where vitality is 0, the system shall grant a grace period of 6 seconds after stitching, and
shall mark the creature as deceased only when vitality has stayed at 0 for 1.5 continuous seconds.

3.6 Where the creature is deceased, the system shall let the user revive it either by activating
`STITCH` again or by settling an organ onto the heartbeat.

## 4. Graveyard

4.1 When a creature reaches full vitality, the system shall offer to archive it.

4.2 The system shall persist archived creatures in `localStorage` under a versioned key.

4.3 When the user activates `REANIMATE` on an archived creature, the system shall restore that
creature's parameters and resume its loop.

4.4 The system shall survive a `localStorage` read or write failure by keeping the app usable and
reporting the failure to the user.

## 5. Sharing

5.1 When the user activates the `SHARE` control, the system shall encode the current organ
parameters into the URL hash.

5.2 When the page loads with a non-empty hash, the system shall restore the organ parameters from
that hash.

5.3 Where a hash cannot be decoded, the system shall ignore it and start with default parameters.

## 6. Accessibility and small screens

6.1 Every interactive control shall be focusable and shall have an accessible name.

6.2 The system shall remain usable at a viewport width of 320 CSS pixels.

6.3 The system shall provide a mute control that silences all audio output.

6.4 Where the `speechSynthesis` API is unavailable, the system shall still allow the voice organ
to be adjusted and shall not raise an uncaught error.

## 7. Verification

7.1 The repository shall contain `tools/verify.mjs` which exits with code 0 when the phase-sync and
vitality computations are correct.

7.2 The application shall run with no build step, no backend, and no external runtime dependency.

7.3 The application shall be deployable as static files to GitHub Pages.
