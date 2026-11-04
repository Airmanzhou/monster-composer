# Tasks — Monster Composer

Implementation plan derived from `requirements.md` and `design.md`.
Each task lists the requirement it satisfies. A task is only checked off when its verification
note is written here.

## Phase 1 — Scaffolding

- [x] **T1.1** Create the repository skeleton (`index.html`, `styles.css`, `src/`, `tools/`) —
  *req 7.2, 7.3*
- [x] **T1.2** Write `src/sync.js` with `circularDistance`, `syncScore`, `vitality`, `mutate`,
  `TOLERANCE` — *req 3.2, 3.3, 3.4*
  - *Verification:* `node tools/verify.mjs` — assertions 1–6.
- [x] **T1.3** Write `tools/verify.mjs` as a dependency-free Node self-check — *req 7.1*
  - *Verification:* `node tools/verify.mjs` exits 0.
- [x] **T1.4** Write `src/organs.js` with the HEART, LUNG, VOICE modules and the shared
  `{ id, label, params, update, draw, describe }` interface — *req 1.1, 1.5*
  - *Verification:* every module exports the same six keys; `tools/verify.mjs` checks the key set.

## Phase 2 — Rendering

- [x] **T2.1** `index.html` shell: canvas, three organ cards, graveyard list, status bar —
  *req 2.1, 6.1*
- [x] **T2.2** `styles.css` — dark lab theme, 320px-safe layout — *req 6.2*
- [x] **T2.3** `src/app.js` — state, controls, exactly one `requestAnimationFrame` loop —
  *req 2.2, 1.3*
  - *Verification:* a `loopId` guard in `src/app.js`; grep shows exactly one `requestAnimationFrame`
    call site.
- [x] **T2.4** `src/organs.js` drawing — three concentric rhythm rings, one per organ, plus the
  stitched creature body in the centre — *req 1.2, 3.1*

## Phase 3 — Life and death

- [x] **T3.1** Vitality meter bound to `sync.js#vitality` — *req 3.2, 3.4*
- [x] **T3.2** STITCH control: 1200 ms suture animation, the three clocks reset to the same
  cycle, then the loop starts — *req 3.1*
- [x] **T3.3** Death state: heartbeat stops and the body is marked deceased after a 6 s grace
  period and 1.5 continuous seconds at vitality 0 — *req 3.5*
- [x] **T3.4** Settle-on-release: releasing an `OFFSET` slider pulls that organ onto the
  heartbeat's phase; a deceased creature revives — *req 1.6, 1.7, 3.6*
  - *Verification:* `tools/verify.mjs` checks 10 and 11; browser check observed vitality 0 → 100
    after a single settle gesture.

## Phase 4 — Audio

- [x] **T4.1** `src/audio.js` — Web Audio heartbeat (two-stage lub-dub) and breath noise —
  *req 2.3*
  - *Verification:* the `AudioContext` is created only inside a user-gesture handler.
- [x] **T4.2** Voice organ via `speechSynthesis`, degrading silently when unavailable — *req 6.4*
- [x] **T4.3** MUTE control silencing all output — *req 6.3*

## Phase 5 — Archive and sharing

- [x] **T5.1** `src/graveyard.js` — versioned `localStorage` archive, failure tolerant —
  *req 4.2, 4.4*
  - *Verification:* every storage call is inside a `try/catch`.
- [x] **T5.2** Archive prompt at vitality 100 and a graveyard list with REANIMATE — *req 4.1, 4.3*
- [x] **T5.3** SHARE control encoding the parameters into the URL hash — *req 5.1*
- [x] **T5.4** Load-time restore from the hash, malformed hashes ignored — *req 5.2, 5.3*

## Phase 6 — Kiro artifacts and submission

- [x] **T6.1** `.kiro/steering/product.md`, `tech.md`, `workflow.md` — *req 7.3 (evidence)*
- [x] **T6.2** `.kiro/specs/monster-composer/{requirements,design,tasks}.md` — *req 7.3 (evidence)*
- [x] **T6.3** `.kiro/agents/surgeon.json` project agent — *req 7.3 (evidence)*
- [x] **T6.4** `AGENTS.md` at the workspace root — *req 7.3 (evidence)*
- [x] **T6.6** Push to a **public** GitHub repository with `LICENSE` and the `.kiro/` folder
  committed and visible in the About section — *mandatory for a valid submission*
  - *Observed:* public repo `github.com/Airmanzhou/monster-composer` (branch `main`, first commit
    `ebc63ab`, 22 files including `.kiro/steering/*`, `.kiro/specs/monster-composer/*`,
    `.kiro/agents/surgeon.json`, `AGENTS.md`, `KIRO-USAGE.md`, `LICENSE`; second commit adds
    `.nojekyll`). MIT license visible in About.
- [x] **T6.7** Deploy to GitHub Pages and record the public URL — *mandatory: a reachable app URL*
  - *Observed:* Pages enabled (legacy build, branch `main`, path `/`); app reachable at
    `https://airmanzhou.github.io/monster-composer/` (HTTP 200 after the first deploy finished).
- [ ] **T6.8** Record a ≤3 minute public YouTube demo — *mandatory*
  - *Status:* recorded locally (`video/monster-composer-demo.mp4`, 133 s, 1280x720) — still needs
    upload to a **public** YouTube video and the URL pasted into the Devpost submission.
- [ ] **T6.9** Run the project inside **Kiro CLI** (`kiro-cli`, installed at
  `D:\kiro-cli\app\LocalApp\Kiro-Cli`) for a real Kiro-authored feature pass — *the rules state
  that insufficient use of Kiro is grounds for disqualification, so this must be genuine Kiro
  work, not a transcript written by hand*
  - *Status:* awaiting the user running `kiro-cli` in this directory and letting Kiro author a
    new spec end-to-end (see `KIRO-STARTER.md` for the one prompt to paste).

## Manual verification notes

*(filled in as work is checked; each entry states what was observed, not what was intended)*

- **T3.1** — Observed: with all three rates at 0.60 the vitality bar reads 100 and the three
  rhythm-ring markers sit at the same angle; pressing STITCH on a fresh load also reads 100
  because the three clocks are reset to the same cycle. Moving the VOICE offset to the opposite
  side drops the reading to 0 within one frame. Confirms requirement 3.4 (`min` rule).
- **T3.3** — Observed: leaving the phases misaligned lets the vitality reach 0; the body
  desaturates and the status bar reads "Deceased. The organs fell out of phase — press STITCH to
  try again." The creature survives the first seconds at 0 and only dies after the grace period
  has passed.
- **T3.4** — Observed: after a MUTATE the vitality reads 0; dragging the VOICE offset and
  releasing it snapped the voice onto the heartbeat and the reading returned to 100 within one
  frame, with the status bar naming the settle.
- **T5.2** — Observed: naming a monster and pressing ARCHIVE wrote one entry to
  `monster-composer:graveyard:v1` and listed it with its own archived rates
  (`heart 0.60 · lung 0.60 · voice 0.60`), not the live rates.
- **T5.3** — Observed: SHARE set the URL hash to `#m=eyJvIjp7IkhFQVJUIjpbMC42LDAsMV0s…` and the
  status bar reported the link was copied.
