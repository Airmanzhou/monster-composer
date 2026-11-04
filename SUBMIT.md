# 提交剩余的最后一步

## 状态（2026-11-04 22:10 实测）

Devpost 项目页 id **1281762**，slug `1281762-monster-composer-suture-lab`：

| 步骤 | 状态 |
| --- | --- |
| Project overview（标题 / tagline） | ✅ 已填并落库 |
| Project details（描述 4887 字符、标签、demo URL、缩略图） | ✅ 已填并落库 |
| Additional info（国家 China、类目 Frankenstein、仓库 URL、demo URL、凭据说明、Kiro 使用说明 2805 字符） | ✅ 已填并落库 |
| 项目缩略图（`software_photos/005/786/343`） | ✅ 已上传 |
| **Demo video URL（`software[video_url]`）** | ❌ **空 —— 唯一缺项** |

Devpost 当前提示原文：`Please complete required fields in Project details before submitting.`
步骤进度：`3/5 steps done`。

## 需要你做的（唯一一件）

1. 用**你自己的 Chrome** 打开 <https://www.youtube.com/upload>，上传
   `D:\立俊 DSH Harness工作档案\kiroween-2026\video\monster-composer-demo.mp4`
   （1280x720 / H.264 / 133 秒 / 3.4 MB，已满足 ≤3 分钟）。
   标题 / 简介 / 标签见 `video/YOUTUBE-UPLOAD.md`（简介可直接整段复制）。
   自定义缩略图用 `video/thumbnail.jpg`。
2. **可见性设为 Public**（默认"不公开"评委点不开）。
3. 把视频链接发我，形如 `https://www.youtube.com/watch?v=XXXXXXXXXXX`。

> ego 浏览器里 YouTube Studio 是空白页（SPA 不渲染），已验证不可用，所以这一步只能你本人做。

## 我收到链接后一条命令搞定

```bash
cd "/d/立俊 DSH Harness工作档案/ego-kiroween" && timeout 280 ego-browser nodejs < submit.mjs "https://www.youtube.com/watch?v=XXXXXXXXXXX"
```

`submit.mjs` 会：填 `software[video_url]` → 点 Save & continue → 重新加载校验落库 →
到 finalization 勾选条款 → 点 Submit → 回读最终状态。

已实测通过的部分（无视频链接时跑过）：`save: "clicked BUTTON Save & continue"`，
重载后 caption 与 description 仍在（`verify.caption` / `verify.descLen`）。
