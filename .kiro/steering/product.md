---
inclusion: always
---

# Product context — Kiroween 2026 "Frankenstein" entry

## What this is

`Monster Composer` (缝合工坊) is a browser-only, zero-backend web app for the Kiroween 2026
hackathon. The user "stitches" three separately-behaving organs — HEART, LUNG, VOICE — into one
living creature. The creature survives only as long as the three organs stay in phase with each other.

## Category

**Frankenstein** — disparate parts (a heartbeat, a breath, a voice) reassembled into one new,
unprecedented organism.

## Non-negotiable constraints

- **Zero backend.** Everything runs in the browser. Deployment target is GitHub Pages.
- **No build step.** Plain ES modules + plain CSS. `index.html` must work when opened from disk.
- **No external runtime dependency** — no CDN scripts, no npm packages, no webfonts.
- **Single public URL** — a judge must be able to open it and use it immediately.
- **Mobile-width friendly** (usable down to 320 CSS px) because judges may try a phone.

## Audience

A Devpost judge who will spend 30–90 seconds. The first screen must already show a creature
breathing and pulsing — never an empty form.

## Success criterion

A judge drags three sliders, presses **STITCH**, and within 3 seconds sees and hears the creature
come alive; then presses **REANIMATE** on a monster in the graveyard.
