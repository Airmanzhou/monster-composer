/**
 * Headless self-check for the Monster Composer maths.
 *
 *   node tools/verify.mjs        -> exits 0 when everything holds
 *
 * No test framework, no dependencies: the whole point is that the project
 * stays build-step free, so the check has to stay build-step free too.
 */

import assert from "node:assert/strict";
import { ORGANS } from "../src/organs.js";
import {
  TOLERANCE,
  advance,
  circularDistance,
  clamp01,
  mutate,
  phaseOf,
  syncScore,
  vitality,
  wrap,
} from "../src/sync.js";

const checks = [];
function check(name, fn) {
  fn();
  checks.push(name);
}

/* 1. circular distance is circular, not linear. */
check("circular distance wraps around the cycle", () => {
  assert.equal(circularDistance(0, 0), 0);
  assert.ok(Math.abs(circularDistance(0, 0.9) - 0.1) < 1e-9);
  assert.ok(Math.abs(circularDistance(0.95, 0.05) - 0.1) < 1e-9);
  assert.ok(Math.abs(circularDistance(0.2, 0.7) - 0.5) < 1e-9);
});

/* 2. identical phases score a perfect sync. */
check("identical phases score 1", () => {
  for (const phase of [0, 0.13, 0.5, 0.87, 0.999]) {
    assert.equal(syncScore(phase, phase), 1);
  }
});

/* 3. the sync score stays inside [0, 1] and dies at the tolerance. */
check("sync score is bounded and reaches 0 at the tolerance", () => {
  assert.equal(syncScore(0, TOLERANCE), 0);
  assert.equal(syncScore(0, TOLERANCE * 2), 0);
  for (let i = 0; i <= 200; i += 1) {
    const score = syncScore(0, i / 200);
    assert.ok(score >= 0 && score <= 1, `sync score out of range: ${score}`);
  }
  assert.equal(clamp01(4), 1);
  assert.equal(clamp01(-4), 0);
});

/* 4. three identical organs are at full vitality. */
check("identical phases give exactly 100 vitality", () => {
  for (const phase of [0, 0.25, 0.5, 0.75]) {
    assert.equal(vitality({ HEART: phase, LUNG: phase, VOICE: phase }), 100);
  }
});

/* 5. one de-synchronised pair caps the result below 100. */
check("one out-of-phase pair drags vitality below 100", () => {
  const phases = { HEART: 0, LUNG: 0, VOICE: 0.4 };
  assert.ok(vitality(phases) < 100);
  assert.equal(vitality(phases), 0);
});

/* 6. vitality stays inside [0, 100] over a randomised sweep. */
check("vitality stays in [0, 100] over a randomised sweep", () => {
  for (let i = 0; i < 5000; i += 1) {
    const phases = {
      HEART: Math.random(),
      LUNG: Math.random(),
      VOICE: Math.random(),
    };
    const value = vitality(phases);
    assert.ok(Number.isInteger(value), "vitality must be an integer");
    assert.ok(value >= 0 && value <= 100, `vitality out of range: ${value}`);
  }
});

/* 7. mutate respects its documented bounds. */
check("mutate keeps the offset within half a cycle and the amplitude within 0.7 - 1.3", () => {
  const base = { rate: 1, phase: 0.2, offset: 0.75, amplitude: 1 };
  for (let i = 0; i < 5000; i += 1) {
    const next = mutate(base);
    assert.ok(next.offset >= 0 && next.offset < 1, "offset must stay normalised");
    const shift = Math.abs(circularDistance(next.offset, base.offset));
    assert.ok(shift <= 0.5 + 1e-9, `offset shifted too far: ${shift}`);
    assert.ok(next.amplitude >= 0.7 - 1e-9 && next.amplitude <= 1.3 + 1e-9, "amplitude out of bounds");
    assert.equal(next.rate, base.rate);
    assert.equal(base.offset, 0.75, "mutate must not mutate its input");
  }
});

/* 8. phase advance and wrapping behave. */
check("advance moves the phase forward and wraps at 1", () => {
  const params = { rate: 0.25, phase: 0.9, offset: 0 };
  advance(params, 1);
  assert.ok(Math.abs(params.phase - 0.15) < 1e-9, `unexpected phase ${params.phase}`);
  assert.equal(wrap(1.25), 0.25);
  assert.equal(wrap(-0.25), 0.75);
  assert.ok(Math.abs(phaseOf({ phase: 0.9, offset: 0.2 }) - 0.1) < 1e-9);
});

/* 8b. wrapping must not lose precision: the tolerance edge has to stay exact. */
check("wrap keeps values inside the cycle exact", () => {
  assert.equal(wrap(TOLERANCE), TOLERANCE);
  assert.equal(wrap(0.5), 0.5);
  assert.equal(wrap(0), 0);
  assert.equal(wrap(0.25), 0.25);
  assert.equal(syncScore(0, TOLERANCE), 0);
});

/* 8c. three organs on the same rate and phase stay in phase forever. */
check("equal rates keep the organs locked together", () => {
  const heart = { rate: 0.6, phase: 0, offset: 0 };
  const lung = { rate: 0.6, phase: 0, offset: 0 };
  const voice = { rate: 0.6, phase: 0, offset: 0 };
  for (let i = 0; i < 600; i += 1) {
    advance(heart, 1 / 60);
    advance(lung, 1 / 60);
    advance(voice, 1 / 60);
  }
  assert.equal(vitality({ HEART: phaseOf(heart), LUNG: phaseOf(lung), VOICE: phaseOf(voice) }), 100);
});

/* 8d. an organ can be settled onto another organ's phase exactly. */
check("an organ can be settled onto the heartbeat exactly", () => {
  const heart = { rate: 0.6, phase: 0.37, offset: 0 };
  const lung = { rate: 0.6, phase: 0.12, offset: 0 };
  lung.offset = wrap(phaseOf(heart) - lung.phase);
  assert.equal(phaseOf(lung), phaseOf(heart));
  assert.equal(vitality({ HEART: phaseOf(heart), LUNG: phaseOf(lung), VOICE: phaseOf(heart) }), 100);
});

/* 9. every organ module honours the shared interface. */
check("every organ module exposes the shared interface", () => {
  assert.deepEqual(
    ORGANS.map((organ) => organ.id),
    ["HEART", "LUNG", "VOICE"],
  );
  for (const organ of ORGANS) {
    for (const key of ["id", "label", "params", "update", "draw", "describe"]) {
      assert.ok(organ[key] !== undefined, `${organ.id} is missing ${key}`);
    }
    assert.equal(typeof organ.update, "function");
    assert.equal(typeof organ.draw, "function");
    assert.equal(typeof organ.describe, "function");
    assert.equal(typeof organ.params.rate, "number");
    assert.equal(typeof organ.params.offset, "number");
    assert.equal(typeof organ.params.amplitude, "number");
  }
});

/* 10. an organ's update() advances only its own phase. */
check("an organ update advances its own phase and nothing else", () => {
  const organ = ORGANS[0];
  const before = { ...organ.params };
  organ.update(0.5);
  assert.notEqual(organ.params.phase, before.phase);
  assert.equal(organ.params.rate, before.rate);
  assert.equal(organ.params.offset, before.offset);
  assert.equal(organ.params.amplitude, before.amplitude);
});

console.log(`Monster Composer — ${checks.length} checks passed`);
for (const name of checks) console.log(`  ok  ${name}`);
