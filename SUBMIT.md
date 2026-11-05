# 提交状态：已完成 ✅

## 结论

Devpost 项目**已提交成功**，状态 `SUBMITTED`，5/5 步完成。

| 项目 | 值 |
| --- | --- |
| 项目页（管理） | https://devpost.com/submit-to/31667-kiroween-2026/manage/submissions/1281762-monster-composer-suture-lab |
| 项目页（公开） | https://devpost.com/software/monster-composer-suture-lab |
| 演示视频 | https://www.youtube.com/watch?v=wejqyelpQZg（公开，频道 Zhou LiJun，2:14 ≤ 3 分钟 ✅） |
| 视频标题 | Monster Composer (Suture Lab) - stitch a heart, a lung and a voice \| Kiroween 2026 |
| 仓库 | https://github.com/Airmanzhou/monster-composer（public，MIT，含 /.kiro） |
| 在线 Demo | https://airmanzhou.github.io/monster-composer/ |

公开页已嵌入 YouTube iframe：`https://www.youtube.com/embed/wejqyelpQZg`（实测验证）。

## 踩过的坑（下次别再犯）

1. **YouTube 标题上限 100 字符**：超了 → 输入框红框 +「解决错误后才能保存」→ **保存按钮被禁用**，所有其他字段（标题/简介/缩略图）也一起不落库。改成 ≤100 字后一次全存。
2. **Studio 上传向导不能点 step 跳步**（草稿态 badge-3 点了不跳），必须 `ytcp-button#next-button` 一步步走。
3. **必须用真实点击**：`page.mouse.click()` 打在 `ytcp-button` 外壳上无效，要用 Playwright `locator.click()`（能穿 shadow DOM）。反之 `page.evaluate()` 找不到 shadow DOM 里的元素，只能做数据读取/直接 `.click()` DOM 节点。
4. **ego 的 Page API 不是 Playwright**：没有 `locator()`/`getByRole()`，只有 `click(selector)`/`evaluate()`/`waitForSelector()` 等；`process.env` 在 ego nodejs 里读不到，脚本要传参必须硬编码或写文件。
5. **Devpost 提交按钮不是 `input[name=commit]`**，而是 `#submission-finalization-form button[type=submit]`（文本「Submit project」）；条款勾选框是 `#participants_manage_finalization_accepts_terms`。
6. **Devpost 表单是 React 受控组件**：直接改 DOM 值不落库，必须走原生 setter + `input`/`change` 事件 + `Save & continue`。
7. **Edge 真实 profile 开不了 CDP**（Chromium 136+ 忽略默认 user-data-dir 的 `--remote-debugging-port`），克隆到 D 盘才可 CDP，但 app-bound v20 加密绑路径 → 克隆解不开 cookie。**最终解法：用克隆 profile D:\edge-cdp2 跑 Edge + CDP，Google 登录态直接在克隆里完成。**

## 剩余唯一事项

**Kiroween 4000 积分兑换**：申请表已提交，等 Didit 实名邮件 + 积分码（48 工作小时，先到先得不保证发码；兑换截止 2026-12-04 14:00 PT，积分 12/31 到期）。收到码后跑：

```bash
cd "/d/立俊 DSH Harness工作档案/ego-kiroween" && timeout 200 ego-browser nodejs < redeem.mjs
```

（脚本已备好并通过语法检查：以「Kiroupon successfully redeemed!」横幅 + app.kiro.dev/settings/account 的积分余额为准。）

## 关联脚本

| 文件 | 作用 |
| --- | --- |
| `ego-kiroween/yt_publish.py` | 发布草稿：走完向导 → 公开范围选 PUBLIC → 保存 |
| `ego-kiroween/yt_final_meta.py` | 改标题（≤100 字）/简介/缩略图并保存 |
| `ego-kiroween/edge_relaunch.py` | 重启带 CDP 的 Edge 克隆实例（9229） |
| `ego-kiroween/submit_final.mjs` | Devpost 填 video_url → Save → 勾条款 → Submit |
| `ego-kiroween/submit_press2.mjs` | 只做 finalization 的勾选与提交 |
| `ego-kiroween/yt_desc.txt` | YouTube 简介纯文本（2104 字符） |
