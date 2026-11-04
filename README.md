# Monster Composer · 缝合工坊

> 把三具各自为政的器官，缝成一只会呼吸的活物。

**Kiroween 2026 · Frankenstein 类目**

---

## 它是什么

一只缝合怪由三具器官组成：

| 器官 | 它在做什么 |
| --- | --- |
| **HEART** 心脏 | 推动全身的搏动，体温与亮度随它起伏 |
| **LUNG** 肺 | 决定呼吸的深浅与节律 |
| **VOICE** 声带 | 发出嗓音与声波 |

三具器官各跑各的时钟。**它们越同步，怪物越有生机**；一旦相位错开超过容差，缝合线就会崩开，怪物死亡。

所以这台机器不是三个滑杆，是一个**相位差**。你要做的不是把参数推到最好看，而是把三条节奏调到同一个拍子上。

## 怎么玩

1. 打开页面，怪物已经在呼吸 —— 它是活的，不是等你去点开始。
2. 按 **STITCH** 缝合：三具器官的时钟被重置到同一拍，怪物正式活过来（还会给你 6 秒缓冲）。
3. 接下来是真正的活儿：三个器官的 **RATE** 不同，相位会越漂越开。把三个 **RATE** 调成同一个值，
   相位差就锁住了；然后拖动 **OFFSET**，松手时线会自己收紧，把那具器官**吸附到心跳上**。
4. 看右上角 **VIGOR**：100 = 三者完全同相。
5. **MUTATE** 会随机打乱某个器官的相位/振幅，像一次器官排异 —— 再吸附一次就能救回来。
6. **SHARE** 把当前参数编码进 URL，直接发给朋友，他打开就是同一只怪物。
7. 死了以后进 **停尸房（Graveyard）**：存档留在浏览器本地，可以 **REANIMATE** 复活。
8. **MUTE** 静音（音频默认不自动播放，首次用户手势后才创建 AudioContext）。

### 读懂三条环

画布外圈三道同心圆环分别是三个器官的节奏环。**空心小圈 = 心跳当前的位置**，
实心点 = 该器官现在的位置。把肺和声带的实心点拖到空心圈上，就是"合拍"。

## 运行

零依赖、零构建步骤。因为用了 ES module，本地必须走 HTTP（`file://` 不行）：

```bash
node tools/serve.mjs        # http://127.0.0.1:4173
```

自检（10 组断言，覆盖相位数学、变异边界、器官接口契约）：

```bash
node tools/verify.mjs        # 退出码 0 = 全绿
```

## 技术约束（刻意为之）

这个项目的设计目标不是"功能多"，而是**在任何一台机器上打开都能跑**：

- **零后端** —— 纯静态，GitHub Pages 直接部署。
- **零外部依赖** —— 不用 CDN、不用 npm 包、不用网络字体。离线打开也能跑。
- **单一 `requestAnimationFrame` 循环** —— 三个器官只是循环里的三个 tick，不允许第二个循环。
- **AudioContext 懒创建** —— 必须在首个用户手势里 new，否则浏览器静音。
- **Canvas 2D** —— 不引渲染库。
- **响应式** —— 320px 宽仍然可用。

## 目录

```
index.html            页面骨架
styles.css            样式
src/sync.js           相位数学：wrap / circularDistance / syncScore / vitality / mutate
src/organs.js         HEART / LUNG / VOICE 三个器官模块（统一接口）
src/audio.js          Web Audio 封装
src/graveyard.js      localStorage 停尸房
src/app.js            主循环与交互
tools/verify.mjs      无框架自检
tools/serve.mjs       零依赖静态服务器
.kiro/                Kiro 工作流资产（steering / specs / agent）
```

`.kiro/` 目录里是这个项目在 Kiro 里的工作上下文：产品与技术约定写在 steering，需求与设计写在 specs。细节见 [KIRO-USAGE.md](./KIRO-USAGE.md)。

## License

[MIT](./LICENSE)
