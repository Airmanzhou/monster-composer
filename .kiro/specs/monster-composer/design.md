# Design — Monster Composer

Implements `.kiro/specs/monster-composer/requirements.md`.

## 1. Architecture

Static ES modules, no build step, no backend, no external dependency.

```
index.html          shell: canvas, three organ cards, graveyard list, status bar
styles.css          all styling (dark lab theme, 320px-safe)
src/sync.js         pure phase/vitality maths  (no DOM, no side effects)
src/organs.js       heart / lung / voice organ modules (pure-ish, draw into ctx)
src/audio.js        Web Audio heartbeat + breath, speechSynthesis voice, mute
src/graveyard.js    localStorage archive (versioned key, failure tolerant)
src/app.js          wiring: state, single rAF loop, controls, share URL
tools/verify.mjs    headless self-check of src/sync.js maths
```

Dependency direction is strictly one-way: `app.js → organs.js → sync.js`.
`tools/verify.mjs` imports `src/sync.js` directly, so the maths is testable without a DOM.

## 2. Data flow

1. `app.js` owns a single `state` object and one `requestAnimationFrame` loop.
2. Each frame the loop computes `dt` (seconds, clamped to 0.05 to survive tab switches),
   advances every organ's phase accumulator, and computes vitality via `sync.js`.
3. `organs.js` draws each organ onto the shared canvas using the frame's phase values.
4. `audio.js` is driven by the same frame values: the heart schedules a beat when its phase
   crosses 0, the lung crossfades a breath envelope, the voice speaks on its own phase.
5. Control events mutate `state` only. The next frame reads the new values — no direct
   redraw path exists, so the UI can never desynchronise from the animation.
6. Releasing an `OFFSET` slider settles that organ onto the current `HEART` phase
   (`offset = wrap(phaseOf(HEART) - organ.phase)`), which is the one control gesture that can
   produce an exact phase coincidence. The ring target marker drawn on the lung and voice rings
   sits at the heartbeat's angle, so the gesture is visible as well as numeric.

State shape:

```js
state = {
  vigor: 1.0,          // global amplitude multiplier, 0.2 – 1.5
  alive: false,
  vitality: 0,
  muted: false,
  stitching: false,
  stitchUntil: 0,
  graceUntil: 0,       // no death before this timestamp
  deadSince: 0,        // when vitality last sat at 0
  time: 0,
}
```

The per-organ parameters live on the organ modules themselves (`organ.params`), not in `state`:

```js
HEART: { rate: 0.60, phase: 0.0, offset: 0.0, amplitude: 1.0 }
LUNG:  { rate: 0.52, phase: 0.0, offset: 0.0, amplitude: 1.0 }
VOICE: { rate: 0.56, phase: 0.0, offset: 0.0, amplitude: 1.0 }
```

The three rates differ on purpose: the organs start in phase and drift apart, so the player's
first real decision is to give them the same rate. Equal rates plus equal offsets keep them
locked forever.

Each organ exposes `{ id, label, params, update, draw, describe }` (requirement 1.5).

## 3. Interfaces

### `src/sync.js`

| Function | Contract |
|---|---|
| `circularDistance(a, b)` | shortest distance between two phases expressed as fractions of a cycle; result in `[0, 0.5]` |
| `syncScore(a, b)` | `1` when the two phases are identical, `0` once they are `TOLERANCE` apart or more; clamped to `[0, 1]` |
| `vitality(phases)` | `round(100 * min(sync(h,l), sync(h,v)))`; `100` only when all three phases coincide |
| `mutate(params, random)` | returns a new params object with `offset` shifted by up to ±0.5 cycle and `amplitude` scaled by 0.7–1.3 |
| `TOLERANCE` | exported constant, `0.18` cycle |

`vitality` deliberately uses `min` of the two pairwise scores (not an average) so requirement 3.4
holds exactly: a single de-synchronised pair caps the result.

### `src/organs.js`

Every organ module is an object literal with the same shape, so `app.js` can treat them
uniformly and the renderer never special-cases an organ.

| Member | Meaning |
|---|---|
| `id` | `"HEART"` / `"LUNG"` / `"VOICE"` |
| `label` | human label shown in the UI |
| `params` | `{ rate, phase, offset, amplitude }` — mutated in place by `update()` |
| `update(dt)` | advances `params.phase` by `rate * dt` (wrapped to `[0, 1)`) |
| `draw(ctx, view)` | draws the organ into the shared canvas |
| `describe()` | one-line human description used in the graveyard list |

### `src/graveyard.js`

| Function | Contract |
|---|---|
| `load()` | returns the stored array; on parse failure returns `[]` and reports the failure |
| `save(list)` | writes under the versioned key `monster-composer:graveyard:v1`; returns `false` when storage is unavailable |
| `add(entry)` | prepends an entry, de-duplicating by `id` |
| `remove(id)` | drops an entry |

All storage calls are wrapped in `try/catch` (requirement 4.4) — a private-mode browser must
not break the app.

## 4. Data models

**Archived creature** — what the graveyard stores:

```js
{ id, name, savedAt, organs: { HEART: { rate, offset, amplitude }, ... }, vigor }
```

Only the three tunable parameters are stored; the phase accumulator is transient.

**Share payload** — encoded into the URL hash (requirement 5.1/5.2):

```
#m=<base64url of JSON { o: { HEART:[rate, offset, amplitude], ... }, v: vigor }>
```

Base64url of a compact JSON array keeps the URL short and avoids `encodeURIComponent` noise.
Malformed hashes are ignored and defaults are used (requirement 5.3).

## 5. Error handling

| Situation | Behaviour |
|---|---|
| `AudioContext` missing or blocked | rendering continues silently; a one-line note appears in the status bar (requirement 2.3) |
| `speechSynthesis` missing | the VOICE organ still animates; only its audible output is skipped (requirement 6.4) |
| `localStorage` unavailable | graveyard section is disabled and the status bar says so; the app stays usable (requirement 4.4) |
| malformed share hash | hash is ignored, default parameters are used (requirement 5.3) |
| the organs drift out of phase | vitality falls to 0; the creature survives a 6 s grace period and only dies after 1.5 continuous seconds at 0, and either `STITCH` or a settle gesture brings it back (requirements 3.5, 3.6) |
| `wrap()` loses precision | `wrap` must not add 1 before the modulo: `((v % 1) + 1) % 1` turns `0.18` into `0.17999999999999993`, which breaks the tolerance edge. The implementation is `mod = v % 1; return mod < 0 ? mod + 1 : mod` |
| tab backgrounded and `dt` spikes | `dt` is clamped to 0.05 s so the animation does not jump |
| `requestAnimationFrame` already running | guarded by a single `loopId`; a second loop is never started (requirement 2.2) |

## 6. Unit testing strategy

`tools/verify.mjs` is a plain Node script (no framework, no dependencies) that imports
`src/sync.js` and asserts:

1. `circularDistance(0, 0)` is `0`; `circularDistance(0, 0.9)` equals `circularDistance(0, 0.1)`.
2. `syncScore(a, a) === 1` for arbitrary `a`.
3. `syncScore` is `0` at or beyond `TOLERANCE` and never leaves `[0, 1]`.
4. `vitality` of three identical phases is exactly `100`.
5. `vitality` of two matching organs and one de-synchronised organ is below `100` — i.e. the
   `min` rule from requirement 3.4 holds.
6. `vitality` never leaves `[0, 100]` over a randomised sweep.
7. `mutate` keeps `offset` within ±0.5 cycle and `amplitude` within 0.7–1.3 of the original.
8. `advance` moves the phase and wraps at 1.
9. `wrap` keeps values inside the cycle exact — the tolerance edge must not drift
   (`wrap(TOLERANCE) === TOLERANCE`), which is the regression guard for the precision bug above.
10. Three organs with an equal rate and phase stay locked at vitality 100 after ten simulated
    seconds.
11. An organ can be settled onto another organ's phase exactly, and the pair then reports
    vitality 100.

The script exits `0` on success and `1` on the first failed assertion, so it is usable both
locally and as a Kiro `PostFileSave` hook command.

## 7. Non-goals

- No persistence beyond `localStorage`; no accounts, no network calls.
- No service worker, no PWA manifest — GitHub Pages must serve the folder as-is.
- No third-party library of any kind.
