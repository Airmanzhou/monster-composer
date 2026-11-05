# YouTube 上传信息（演示视频）

文件：`video/monster-composer-demo.mp4`（1280x720 / H.264 / 133 秒 / 3.4 MB）
要求：≤3 分钟 ✅、公开可访问（不能设为"不公开"）⚠️、用你本人的 Google 账号上传。

## 标题

```
Monster Composer (Suture Lab) - stitch a heart, a lung and a voice | Kiroween 2026
```

## 简介（直接粘）

```
Monster Composer - Suture Lab
Kiroween 2026 · Frankenstein category

Three organs, three clocks. Stitch a HEART, a LUNG and a VOICE into one creature, then keep
all three rhythms in phase - the monster only breathes while they agree.

WHAT YOU SEE
- Three concentric rhythm rings, one per organ, and a central target that shows the heart's
  current phase. Drag a LUNG or a VOICE ring onto the target and release: the organ snaps into
  the heartbeat.
- VITALITY is the phase agreement between the heart and the other two organs. Green body =
  in phase, grey body = not stitched yet.
- STITCH aligns the three organs, SHARE encodes the current build into a link, MUTE silences the
  voice organ.
- The MORTUARY (graveyard) archives every creature you bring to 99+ vitality and lets you
  REANIMATE it later.

WHY IT IS A FRANKENSTEIN
Three parts that were never meant to work together - a heart that only beats, a lung that only
breathes, a voice that only speaks - are sutured into a single body with one shared pulse.
Nothing survives on its own; the monster lives only while the disparate parts stay in phase.

HOW KIRO WAS USED
- .kiro/steering/product.md, tech.md and workflow.md - the always-on rules that pinned the
  zero-dependency, zero-backend, single-URL constraints.
- .kiro/specs/monster-composer/ - requirements.md (EARS), design.md and tasks.md written before
  the code; the two biggest bugs (a floating point wrap() that broke the phase tolerance, and a
  creature that died the instant you stitched it) were fixed by rewriting the spec first.
- .kiro/agents/surgeon.json - the project agent used for the implementation pass.
- AGENTS.md - workspace rules loaded on every session.
- tools/verify.mjs - a 13-assertion self-check that runs after every change.

STACK
Plain ES modules, Canvas 2D, Web Audio, speechSynthesis, localStorage. No build step, no npm
dependencies, no CDN, no backend. The whole app is served as static files.

LIVE DEMO
https://airmanzhou.github.io/monster-composer/

REPOSITORY (public, includes the .kiro folder)
https://github.com/Airmanzhou/monster-composer
```

## 标签

```
kiroween, kiroween2026, kiro, aws, kiro ide, spec driven development, javascript, canvas,
web audio, creative coding, game, hackathon, ai, game jam
```

## 已完成（2026-11-05）

- 视频已上传并公开：https://www.youtube.com/watch?v=wejqyelpQZg
- Devpost 项目已提交（SUBMITTED，5/5 步），公开页 https://devpost.com/software/monster-composer-suture-lab 已嵌入该视频
- 注意：YouTube 标题上限 100 字符（上面的标题已按上限裁剪）

## 上传后要做的两件事

1. 可见性改成 **Public**（默认可能是"不公开"，那评委点不开）。
2. 复制视频链接，填进 Devpost 提交表单的 demo video URL 字段，然后 Submit。
