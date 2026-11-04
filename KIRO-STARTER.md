# 用 Kiro CLI 真跑一遍（参赛必需）

Devpost 官方规则写得很硬：**参赛项目必须是用 Kiro 构建的，Kiro 用量不足会被评委直接取消资格**
（"Insufficient use of Kiro will result in disqualification at the Judges' sole discretion"）。

当前状态：Monster Composer 的代码与 `.kiro/` 规格是**别的工具写的**，Kiro 自己一次都没碰过这个仓库。
所以下面这三步不是"走个形式"，是补上真实的使用证据。

## 步骤

### 1. 登录

```bash
kiro-cli login
```

浏览器会弹出授权，用 **lorenxiang863@gmail.com**（和 Devpost 报名、Kiro 账号同一个 Google 账号）登录。
登录后可以确认：

```bash
kiro-cli whoami
```

### 2. 进项目目录再启动（目录决定 Kiro 能读到什么）

```bash
cd "/d/立俊 DSH Harness工作档案/kiroween-2026"
kiro-cli
```

在 `kiroween-2026` 目录里启动，Kiro 才会自动拾取工作区根的 `AGENTS.md` 与
`.kiro/steering/` 三份 steering 文件（product / tech / workflow）。
`~/.kiro/steering/` 里的全局文件任何目录都能读，但项目级的两份 `.kiro/specs/` 只有在这个目录里才有。

### 3. 粘这一段，让 Kiro 走完整规格闭环

```
Read AGENTS.md and every file under .kiro/steering/ first, then work in this repository.

Goal: add a "rhythm coach" to Monster Composer.

Requirements to satisfy:
- When vitality < 100, the status bar must name the single organ that is furthest out of phase
  with the HEART (use the circular distance already implemented in src/sync.js) and say which
  control to turn: RATE if its rate differs from the heart's rate, OFFSET if the phase differs.
- Keyboard shortcuts: Space = STITCH, S = SHARE, M = MUTE, with the shortcuts ignored while the
  user is typing in a text field.
- Respect prefers-reduced-motion: when it is set, the canvas must not animate continuously.

Process (do not skip steps, this is the evidence the judges read):
1. Create a NEW spec directory .kiro/specs/rhythm-coach/ with requirements.md (EARS wording),
   design.md (architecture, data flow, interfaces, data models, error handling, test strategy)
   and tasks.md. Do not edit .kiro/specs/monster-composer/ - it belongs to the earlier pass.
2. Implement the feature in src/ following the tech steering (native ES modules, no dependencies,
   no build step, one requestAnimationFrame loop only).
3. Extend tools/verify.mjs with assertions for the new behaviour and run
   `node tools/verify.mjs` until it passes.
4. Update the new spec's tasks.md with what you actually observed, not what you intended.
5. Summarise the change in a short section appended to KIRO-USAGE.md.

Constraints:
- Zero new dependencies, zero CDN, zero network calls.
- Do not add a second requestAnimationFrame loop.
- Do not gitignore .kiro/ - the .kiro folder must stay visible in the repository.
- Keep the single source of truth for rules in src/sync.js; do not duplicate the phase maths.
```

### 4. 做完之后

把这次会话里 Kiro 实际做的事补进 `KIRO-USAGE.md`（哪个 agent 用了、哪些 steering 文件起了作用、
新 spec 目录叫什么、Kiro 自己写了哪些文件、verify 加了几条断言），然后：

```bash
cd "/d/立俊 DSH Harness工作档案/kiroween-2026"
git add -A && git commit -m "feat: rhythm coach, keyboard shortcuts and reduced-motion support (authored in Kiro CLI)"
git push
```

GitHub Pages 会自动重新部署，提交表单里的公开 URL 不用改。

## 为什么这一步值得做

- 参赛资格：评委看的是"你真的用了 Kiro 吗"，`.kiro/specs/rhythm-coach/` 这种**由 Kiro 自己写出来的
  新 spec 目录**是最硬的证据，比任何文字描述都有用。
- 12 月的 4000 积分只允许用于构建参赛项目 —— 这次实跑同时也是让积分花得合规的动作。
- 顺带把产品做厚：节奏诊断 + 键盘快捷键 + 无障碍减弱动效这三条，是演示视频里最好讲的三帧画面。
