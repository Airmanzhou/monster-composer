/**
 * Phase and vitality maths for Monster Composer.
 *
 * Pure module: no DOM, no side effects. Imported by the renderer, by the
 * graveyard, and by tools/verify.mjs (which is why this file must stay
 * dependency-free and side-effect free).
 */

/** How far apart two rhythms may drift, in cycles, before the sync score hits 0. */
export const TOLERANCE = 0.18;

/** Wrap any number into [0, 1). */
export function wrap(value) {
  const mod = value % 1;
  return mod < 0 ? mod + 1 : mod;
}

/** Clamp any number into [0, 1]. */
export function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

/**
 * Shortest distance between two phases expressed as a fraction of a cycle.
 * Always in [0, 0.5] — 0.1 and 0.9 are 0.1 apart, not 0.9.
 */
export function circularDistance(a, b) {
  const delta = Math.abs(wrap(a) - wrap(b));
  return Math.min(delta, 1 - delta);
}

/**
 * How well two rhythms agree. 1 when they coincide, 0 once they are
 * TOLERANCE apart. Never leaves [0, 1].
 */
export function syncScore(a, b) {
  const distance = circularDistance(a, b);
  if (distance <= 0) return 1;
  if (distance >= TOLERANCE) return 0;
  return clamp01(1 - distance / TOLERANCE);
}

/**
 * Creature vitality in [0, 100], from the three organ phases.
 *
 * Uses the minimum of the two pairwise scores rather than an average, so a
 * single de-synchronised pair caps the result: 100 is only ever reported when
 * all three organs are in phase.
 */
export function vitality(phases) {
  const heartToLung = syncScore(phases.HEART, phases.LUNG);
  const heartToVoice = syncScore(phases.HEART, phases.VOICE);
  return Math.round(100 * Math.min(heartToLung, heartToVoice));
}

/** Advance one organ's phase accumulator by dt seconds. Mutates and returns params. */
export function advance(params, dt) {
  params.phase = wrap(params.phase + params.rate * dt);
  return params;
}

/**
 * A mutation of one organ: the phase offset shifts by up to half a cycle and
 * the amplitude is scaled by 0.7 - 1.3. Returns a new params object.
 */
export function mutate(params, random = Math.random) {
  return {
    ...params,
    offset: wrap(params.offset + (random() - 0.5)),
    amplitude: Math.min(1.6, Math.max(0.2, params.amplitude * (0.7 + random() * 0.6))),
  };
}

/** The combined phase of an organ: its accumulator plus its tuning offset. */
export function phaseOf(params) {
  return wrap(params.phase + params.offset);
}
