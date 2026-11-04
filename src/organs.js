/**
 * The three organs.
 *
 * Every organ module exposes the same interface so the renderer never has to
 * special-case one:
 *
 *   { id, label, params, update(dt), draw(ctx, view), describe() }
 *
 * `params` is { rate, phase, offset, amplitude }:
 *   rate      - cycles per second
 *   phase     - the running phase accumulator, advanced by update()
 *   offset    - the player's tuning offset, added to the phase for everything
 *               the organ does (its ring marker, its envelope, its sound)
 *   amplitude - how loudly the organ behaves
 */

import { advance, phaseOf } from "./sync.js";

const TAU = Math.PI * 2;

/** Draw one organ's rhythm ring: the track, the alignment target, the marker. */
function drawRing(ctx, view, organ, radius) {
  const { cx, cy } = view;
  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.strokeStyle = organ.color;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // The alignment target: where the heartbeat is right now. The heart is the
  // reference, so only the other two organs get a target to chase.
  if (organ.id !== "HEART") {
    const targetAngle = view.referencePhase * TAU;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(targetAngle) * radius, cy + Math.sin(targetAngle) * radius, 4.5, 0, TAU);
    ctx.strokeStyle = organ.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // The marker: where this organ actually is.
  const angle = phaseOf(organ.params) * TAU;
  const x = cx + Math.cos(angle) * radius;
  const y = cy + Math.sin(angle) * radius;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, TAU);
  ctx.fillStyle = organ.color;
  ctx.fill();

  ctx.restore();
}

export const heart = {
  id: "HEART",
  label: "HEART",
  color: "#ff5d73",
  ringScale: 0.4,
  params: { rate: 0.6, phase: 0, offset: 0, amplitude: 1 },

  update(dt) {
    advance(this.params, dt);
  },

  draw(ctx, view) {
    drawRing(ctx, view, this, view.baseRadius * this.ringScale);

    const beat = Math.pow(1 - phaseOf(this.params), 5);
    const radius = view.baseRadius * (0.09 + 0.08 * beat * this.params.amplitude * view.vigor);

    ctx.save();
    ctx.globalAlpha = 0.55 + 0.45 * beat;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(view.cx, view.cy, radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  },

  describe() {
    return `heart · ${this.params.rate.toFixed(2)} Hz`;
  },
};

export const lung = {
  id: "LUNG",
  label: "LUNG",
  color: "#4fd1c5",
  ringScale: 0.58,
  params: { rate: 0.52, phase: 0, offset: 0, amplitude: 1 },

  update(dt) {
    advance(this.params, dt);
  },

  draw(ctx, view) {
    drawRing(ctx, view, this, view.baseRadius * this.ringScale);

    const breath = 0.5 - 0.5 * Math.cos(phaseOf(this.params) * TAU);
    const spread = view.baseRadius * (0.12 + 0.07 * breath * this.params.amplitude * view.vigor);

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = this.color;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(
        view.cx + side * spread * 1.3,
        view.cy + spread * 0.4,
        spread * 0.55,
        spread * 0.85,
        side * 0.25,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.restore();
  },

  describe() {
    return `lung · ${this.params.rate.toFixed(2)} Hz`;
  },
};

export const voice = {
  id: "VOICE",
  label: "VOICE",
  color: "#b794f6",
  ringScale: 0.76,
  params: { rate: 0.56, phase: 0, offset: 0, amplitude: 1 },

  update(dt) {
    advance(this.params, dt);
  },

  draw(ctx, view) {
    drawRing(ctx, view, this, view.baseRadius * this.ringScale);

    const wave = Math.abs(Math.sin(phaseOf(this.params) * TAU));
    const bars = 9;
    const width = view.baseRadius * 0.3;

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let i = 0; i < bars; i += 1) {
      const t = i / (bars - 1);
      const x = view.cx - width / 2 + t * width;
      const height =
        view.baseRadius *
        0.11 *
        wave *
        this.params.amplitude *
        view.vigor *
        (0.35 + 0.65 * Math.sin(t * Math.PI));
      ctx.beginPath();
      ctx.moveTo(x, view.cy - height);
      ctx.lineTo(x, view.cy + height);
      ctx.stroke();
    }
    ctx.restore();
  },

  describe() {
    return `voice · ${this.params.rate.toFixed(2)} Hz`;
  },
};

export const ORGANS = [heart, lung, voice];
