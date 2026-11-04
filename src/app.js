/**
 * Monster Composer - the wiring.
 *
 * Owns the state, builds the organ cards, and runs exactly one animation
 * loop. Every visual reads the same frame values, so the picture can never
 * drift away from the numbers behind it.
 */

import { createAudio } from "./audio.js";
import * as graveyard from "./graveyard.js";
import { ORGANS } from "./organs.js";
import { mutate, phaseOf, vitality, wrap } from "./sync.js";

const TAU = Math.PI * 2;
const STITCH_MS = 1200;

const canvas = document.getElementById("creature");
const ctx = canvas.getContext("2d");
const vitalFill = document.getElementById("vital-fill");
const vitalValue = document.getElementById("vital-value");
const vitalMeter = document.getElementById("vital-meter");
const statusLine = document.getElementById("status");
const organCards = document.getElementById("organ-cards");
const graveyardList = document.getElementById("graveyard-list");
const archiveHint = document.getElementById("archive-hint");
const saveButton = document.getElementById("save");
const saveForm = document.getElementById("save-form");
const nameInput = document.getElementById("monster-name");
const stitchButton = document.getElementById("stitch");
const shareButton = document.getElementById("share");
const muteButton = document.getElementById("mute");
const vigorInput = document.getElementById("vigor");

const audio = createAudio();
const byId = Object.fromEntries(ORGANS.map((organ) => [organ.id, organ]));

const state = {
  vigor: 1,
  alive: false,
  vitality: 0,
  muted: false,
  stitching: false,
  stitchUntil: 0,
  graceUntil: 0,
  deadSince: 0,
  time: 0,
};

const lastPhase = {};
for (const organ of ORGANS) lastPhase[organ.id] = phaseOf(organ.params);

const view = {
  cx: 0,
  cy: 0,
  baseRadius: 1,
  size: 1,
  vigor: 1,
  vitality: 0,
  alive: false,
  referencePhase: 0,
  time: 0,
};

/* ------------------------------------------------------------------ */
/* organ cards                                                        */
/* ------------------------------------------------------------------ */

const organControls = new Map();

function buildOrganCards() {
  for (const organ of ORGANS) {
    const card = document.createElement("div");
    card.className = "organ-card";
    card.style.setProperty("--organ-color", organ.color);

    const head = document.createElement("div");
    head.className = "organ-head";

    const title = document.createElement("h3");
    title.textContent = organ.label;

    const mutateButton = document.createElement("button");
    mutateButton.type = "button";
    mutateButton.textContent = "MUTATE";
    mutateButton.setAttribute("aria-label", `Mutate the ${organ.label.toLowerCase()}`);
    mutateButton.addEventListener("click", () => {
      const next = mutate(organ.params);
      organ.params.offset = next.offset;
      organ.params.amplitude = next.amplitude;
      syncControls(organ);
      setStatus(`${organ.label} mutated — the rhythm slipped.`);
    });

    head.append(title, mutateButton);

    const fields = document.createElement("div");
    fields.className = "fields";

    const rate = buildField("RATE", 0.05, 2.5, 0.01, organ.params.rate, (value) => {
      organ.params.rate = value;
    });

    const offset = buildField(
      "OFFSET",
      0,
      1,
      0.0001,
      organ.params.offset,
      (value) => {
        organ.params.offset = value;
      },
      () => {
        // The suture pulls itself tight: settle this organ onto the heartbeat.
        organ.params.offset = wrap(phaseOf(byId.HEART.params) - organ.params.phase);
        syncControls(organ);
        if (!state.alive) {
          // Pulling the parts back together is enough to bring it back.
          state.alive = true;
          state.graceUntil = performance.now() + 6000;
          state.deadSince = 0;
          setStatus(`${organ.label} settled onto the heartbeat — it is breathing again.`);
          return;
        }
        setStatus(`${organ.label} settled onto the heartbeat.`);
      },
    );

    const amplitude = buildField("AMP", 0.2, 1.6, 0.05, organ.params.amplitude, (value) => {
      organ.params.amplitude = value;
    });

    fields.append(rate.row, offset.row, amplitude.row);

    card.append(head, fields);
    organCards.append(card);

    organControls.set(organ.id, { rate, offset, amplitude });
  }
}

function buildField(label, min, max, step, value, onChange, onSettle) {
  const row = document.createElement("label");
  row.className = "field";

  const name = document.createElement("span");
  name.textContent = label;

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute("aria-label", `${label.toLowerCase()}`);

  const output = document.createElement("output");
  const show = (v) => {
    output.textContent = label === "OFFSET" ? `${(v * 100).toFixed(1)}%` : v.toFixed(2);
  };
  show(value);

  input.addEventListener("input", () => {
    const v = Number(input.value);
    show(v);
    onChange(v);
  });

  if (onSettle) {
    input.addEventListener("change", () => onSettle(Number(input.value)));
  }

  row.append(name, input, output);
  return { row, input, output, show };
}

function syncControls(organ) {
  const controls = organControls.get(organ.id);
  if (!controls) return;
  controls.rate.input.value = String(organ.params.rate);
  controls.rate.show(organ.params.rate);
  controls.offset.input.value = String(organ.params.offset);
  controls.offset.show(organ.params.offset);
  controls.amplitude.input.value = String(organ.params.amplitude);
  controls.amplitude.show(organ.params.amplitude);
}

/* ------------------------------------------------------------------ */
/* canvas                                                             */
/* ------------------------------------------------------------------ */

function resizeCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const size = canvas.clientWidth || 460;
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  view.size = size;
  view.cx = size / 2;
  view.cy = size / 2;
  view.baseRadius = size * 0.42;
}

function drawBackdrop() {
  const { cx, cy, baseRadius } = view;
  const glow = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 1.05);
  glow.addColorStop(0, "rgba(120, 150, 200, 0.16)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 1.05, 0, TAU);
  ctx.fill();
}

function drawBody() {
  const { cx, cy, baseRadius, time, vitality: v, alive } = view;
  const ratio = v / 100;
  const bodyRadius = baseRadius * 0.26;

  ctx.save();

  // body
  ctx.beginPath();
  const points = 48;
  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * TAU;
    const wobble =
      1 + 0.05 * Math.sin(angle * 3 + time * 2) + 0.03 * Math.sin(angle * 5 - time * 1.3);
    const r = bodyRadius * wobble;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.92;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = alive ? `hsl(${120 * ratio}, 62%, 44%)` : "hsl(205, 16%, 40%)";
  ctx.globalAlpha = alive ? 0.55 + 0.45 * ratio : 0.6;
  ctx.fill();

  // the seam that holds the parts together
  const seamY = cy - bodyRadius * 0.12;
  ctx.globalAlpha = alive ? 0.95 : 0.4;
  ctx.strokeStyle = "#10141b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 12; i += 1) {
    const t = i / 12;
    const x = cx - bodyRadius + t * bodyRadius * 2;
    const y = seamY + (i % 2 === 0 ? -3 : 3);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#e8eef7";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 6; i += 1) {
    const x = cx - bodyRadius * 0.8 + (i / 6) * bodyRadius * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, seamY - 7);
    ctx.lineTo(x, seamY + 7);
    ctx.stroke();
  }

  // eyes
  const eyeY = cy - bodyRadius * 0.42;
  const eyeOffset = bodyRadius * 0.4;
  const look = Math.sin(time * 0.9) * bodyRadius * 0.05;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + side * eyeOffset, eyeY, bodyRadius * 0.2, bodyRadius * 0.24, 0, 0, TAU);
    ctx.fillStyle = "#f2f6ff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + side * eyeOffset + look, eyeY + bodyRadius * 0.03, bodyRadius * 0.1, 0, TAU);
    ctx.fillStyle = "#10141b";
    ctx.fill();
  }

  ctx.restore();
}

function drawSuturing() {
  const { cx, cy, baseRadius } = view;
  const remaining = Math.max(0, state.stitchUntil - performance.now());
  const progress = 1 - remaining / STITCH_MS;

  ctx.save();
  ctx.globalAlpha = 0.25 + 0.6 * progress;
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 0.3, 0, TAU * progress);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* the single loop                                                    */
/* ------------------------------------------------------------------ */

let loopId = null;
let previous = 0;

function frame(now) {
  loopId = requestAnimationFrame(frame);

  const dt = Math.min(0.05, (now - previous) / 1000);
  previous = now;
  state.time = now / 1000;

  for (const organ of ORGANS) {
    organ.update(dt);
    const phase = phaseOf(organ.params);
    const previousPhase = lastPhase[organ.id];
    if (previousPhase > 0.75 && phase < 0.25) {
      triggerOrgan(organ);
    }
    lastPhase[organ.id] = phase;
  }

  if (state.alive) {
    state.vitality = vitality({
      HEART: phaseOf(byId.HEART.params),
      LUNG: phaseOf(byId.LUNG.params),
      VOICE: phaseOf(byId.VOICE.params),
    });
    const now = performance.now();
    if (state.vitality <= 0 && now > state.graceUntil) {
      if (state.deadSince === 0) state.deadSince = now;
      if (now - state.deadSince > 1500) {
        state.alive = false;
        state.deadSince = 0;
        state.vitality = 0;
        setStatus("Deceased. The organs fell out of phase — press STITCH to try again.");
      }
    } else {
      state.deadSince = 0;
    }
  }

  view.vigor = state.vigor;
  view.vitality = state.vitality;
  view.alive = state.alive;
  view.referencePhase = phaseOf(byId.HEART.params);
  view.time = state.time;

  ctx.clearRect(0, 0, view.size, view.size);
  drawBackdrop();
  drawBody();
  for (const organ of ORGANS) organ.draw(ctx, view);
  if (state.stitching) drawSuturing();

  paintVitals();
}

function triggerOrgan(organ) {
  const intensity = Math.max(0.05, organ.params.amplitude * state.vigor);
  if (organ.id === "HEART") audio.beat(intensity);
  else if (organ.id === "LUNG") audio.breath(intensity);
  else audio.speak(intensity);
}

function paintVitals() {
  vitalFill.style.width = `${state.vitality}%`;
  vitalValue.textContent = String(state.vitality);
  vitalMeter.setAttribute("aria-valuenow", String(state.vitality));
  const canArchive = state.alive && state.vitality >= 99;
  saveButton.disabled = !canArchive;
  archiveHint.textContent = canArchive
    ? "Vitality is 100 - it can be put to rest in the graveyard."
    : "Archive unlocks when vitality reaches 100.";
}

/* ------------------------------------------------------------------ */
/* actions                                                            */
/* ------------------------------------------------------------------ */

function setStatus(text) {
  statusLine.textContent = text;
}

function stitch() {
  audio.ensure();
  // Stitching aligns the three clocks: every organ starts the same cycle.
  for (const organ of ORGANS) {
    organ.params.phase = 0;
    lastPhase[organ.id] = organ.params.offset;
  }
  state.stitching = true;
  state.stitchUntil = performance.now() + STITCH_MS;
  state.deadSince = 0;
  state.graceUntil = state.stitchUntil + 6000;
  setStatus("Stitching the organs together...");
  window.setTimeout(() => {
    state.stitching = false;
    state.alive = true;
    setStatus(
      audio.webAudioAvailable
        ? "It breathes. Keep the three rhythms in phase."
        : "It breathes. Audio is unavailable in this browser, so it is silent.",
    );
  }, STITCH_MS);
}

function encodeShare() {
  const payload = { o: {}, v: state.vigor };
  for (const organ of ORGANS) {
    payload.o[organ.id] = [organ.params.rate, organ.params.offset, organ.params.amplitude];
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeShare(hash) {
  try {
    const normalised = hash.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalised + "===".slice((normalised.length + 3) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload.o !== "object" || payload.o === null) return false;
    for (const organ of ORGANS) {
      const values = payload.o[organ.id];
      if (!Array.isArray(values) || values.length < 3) return false;
      const [rate, offset, amplitude] = values;
      if (![rate, offset, amplitude].every((v) => typeof v === "number" && Number.isFinite(v))) {
        return false;
      }
      organ.params.rate = rate;
      organ.params.offset = offset;
      organ.params.amplitude = amplitude;
    }
    if (typeof payload.v === "number" && Number.isFinite(payload.v)) {
      state.vigor = payload.v;
      vigorInput.value = String(payload.v);
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function share() {
  const url = `${window.location.origin}${window.location.pathname}#m=${encodeShare()}`;
  window.location.hash = `m=${encodeShare()}`;
  try {
    await navigator.clipboard.writeText(url);
    setStatus("Share link copied to the clipboard.");
  } catch (error) {
    setStatus("Share link is in the address bar.");
  }
}

function reanimate(entry) {
  for (const organ of ORGANS) {
    const saved = entry.organs && entry.organs[organ.id];
    if (!saved) continue;
    organ.params.rate = saved.rate;
    organ.params.offset = saved.offset;
    organ.params.amplitude = saved.amplitude;
    syncControls(organ);
  }
  if (typeof entry.vigor === "number") {
    state.vigor = entry.vigor;
    vigorInput.value = String(entry.vigor);
  }
  state.alive = true;
  state.graceUntil = performance.now() + 6000;
  state.deadSince = 0;
  for (const organ of ORGANS) lastPhase[organ.id] = phaseOf(organ.params);
  setStatus(`${entry.name} is back on the table.`);
}

function renderGraveyard() {
  const { entries, error } = graveyard.load();
  graveyardList.replaceChildren();

  if (error) {
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent = "The graveyard is unavailable in this browser (storage is blocked).";
    graveyardList.append(note);
    return;
  }

  if (entries.length === 0) {
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent = "Nothing buried yet. Bring a monster to full vitality and archive it.";
    graveyardList.append(note);
    return;
  }

  for (const entry of entries) {
    const item = document.createElement("li");

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = entry.name;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = ORGANS.map((organ) => {
      const saved = entry.organs && entry.organs[organ.id];
      return `${organ.id.toLowerCase()} ${saved ? saved.rate.toFixed(2) : "?"}`;
    }).join(" · ");

    const revive = document.createElement("button");
    revive.type = "button";
    revive.textContent = "REANIMATE";
    revive.addEventListener("click", () => reanimate(entry));

    const bury = document.createElement("button");
    bury.type = "button";
    bury.textContent = "DELETE";
    bury.addEventListener("click", () => {
      const result = graveyard.remove(entry.id);
      if (result.error) setStatus("The graveyard is unavailable in this browser.");
      renderGraveyard();
    });

    item.append(name, meta, revive, bury);
    graveyardList.append(item);
  }
}

/* ------------------------------------------------------------------ */
/* boot                                                               */
/* ------------------------------------------------------------------ */

buildOrganCards();
renderGraveyard();
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

stitchButton.addEventListener("click", stitch);
shareButton.addEventListener("click", share);

muteButton.addEventListener("click", () => {
  state.muted = !state.muted;
  audio.setMuted(state.muted);
  muteButton.setAttribute("aria-pressed", String(state.muted));
  muteButton.textContent = state.muted ? "MUTED" : "MUTE";
});

vigorInput.addEventListener("input", () => {
  state.vigor = Number(vigorInput.value);
});

saveForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim() || "Nameless Thing";
  const entry = {
    id: `monster-${Date.now()}`,
    name,
    savedAt: new Date().toISOString(),
    vigor: state.vigor,
    organs: Object.fromEntries(
      ORGANS.map((organ) => [
        organ.id,
        {
          rate: organ.params.rate,
          offset: organ.params.offset,
          amplitude: organ.params.amplitude,
        },
      ]),
    ),
  };
  const result = graveyard.add(entry);
  if (result.error) {
    setStatus("The graveyard is unavailable in this browser, so nothing was archived.");
    return;
  }
  nameInput.value = "";
  renderGraveyard();
  setStatus(`${name} is resting in the graveyard.`);
});

const hash = window.location.hash;
if (hash.startsWith("#m=")) {
  if (decodeShare(hash.slice(3))) {
    setStatus("Creature restored from the share link.");
    for (const organ of ORGANS) syncControls(organ);
  }
}

previous = performance.now();
loopId = requestAnimationFrame(frame);
