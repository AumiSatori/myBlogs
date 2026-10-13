# AGENTS.md

本文件是给 AI 编码助手的项目说明（WorkBuddy / Claude Code / Codex 等读取）。改动本项目前请先读完「关键约定」与「Live2D 看板娘」两节。

## 项目概览

| 项 | 值 |
| --- | --- |
| 项目 | 个人技术博客（Hexo 静态站） |
| 技术栈 | Hexo 8.1.2 + hexo-theme-butterfly 5.7.0 + Node 22 |
| 部署 | Cloudflare（Git 集成，push 即自动构建） |
| 线上地址 | https://myblogs.jjyilinfeng1234.workers.dev |
| 源码仓库 | https://github.com/AumiSatori/myBlogs |
| 站点语言 | zh-CN，时区 Asia/Shanghai |

站内内容为中文。提交信息使用中文，格式参考既有历史（`feat:` / `fix:` / `docs:` / `chore:` / `config:`）。

## 常用命令

```bash
npm run server          # 本地预览 http://localhost:4000（改文件自动刷新）
npx hexo new "文章标题"  # 新建文章 → source/_posts/
npm run build           # hexo generate，产物在 public/
```

> ⚠️ `npm run clean`（= `hexo clean`）在本机**会被系统的批量删除保护拦截而失败**。需要重建时**跳过 clean，直接 `npx hexo generate`** —— generate 会覆盖 `public/` 中的同名文件，效果等价。

## 目录结构

```
myBlogs/
├── _config.yml              # 站点总配置（标题、作者、域名、主题选择）
├── _config.butterfly.yml    # 主题配置（菜单、搜索、深色模式、inject 注入）
├── source/
│   ├── _posts/              # 文章（Markdown，一篇一个文件）
│   ├── about/               # 关于页
│   ├── tags/ categories/    # 标签页、分类页
│   ├── img/                 # 站点图片
│   └── live2d/              # Live2D 看板娘（全自托管，见下文）
├── scaffolds/               # 新建文章的模板
├── public/                  # 构建产物（已 gitignore，不提交）
└── package.json
```

## 关键约定

### 1. `source/` 会进仓库，`public/` 不会

`.gitignore` 忽略了 `public/`、`node_modules/`、`db.json`、`.idea/`。因此：

- **`source/` 下的所有静态资源都会提交到 Git**，包括 Live2D 模型（当前约 12M）。Cloudflare 构建时再拷进 `public/`。
- 往 `source/` 放东西前先想清楚体积，大文件别随手扔进去。

### 2. 注入机制

主题自定义代码统一走 `_config.butterfly.yml` 的 `inject`：

```yaml
inject:
  head:      # 插入 </head> 前
  bottom:    # 插入 </body> 前
    - <script src="/live2d/autoload.js"></script>
```

### 3. 部署流程

改内容 → `git add` → `git commit` → `git push` → Cloudflare 自动重新构建发布（约 1~2 分钟）。**不需要手动执行 `hexo deploy`**（`_config.yml` 的 `deploy.type` 留空）。

### 4. 站点根路径

`_config.yml` 的 `root: /`。所有静态资源引用**使用绝对路径**（如 `/live2d/autoload.js`），换域名不受影响。

## Live2D 看板娘

右下角的看板娘，基于 [live2d-widget](https://github.com/stevenjoezhang/live2d-widget) v1.0.1（MIT）改造，**全部资源自托管，零外部 CDN 依赖**。

### 加载链

```
_config.butterfly.yml (inject.bottom)
  └─ /live2d/autoload.js?v=<版本号>            ← 自写加载器（版本号规则见踩坑第 10 条）
       ├─ 窄屏拦截：window.innerWidth < 992 直接 return
       ├─ 给 Image 打 crossOrigin 补丁（避免贴图跨域）
       ├─ await 加载 waifu.css?v= + waifu-tips.js?v=（后者是 ES module）
       ├─ await 加载 live2d-custom.css?v=      ← 必须晚于 waifu.css
       └─ initWidget({
              waifuPath:    /live2d/waifu-tips.json?v=,
              cubism2Path:  /live2d/live2d.min.js?v=,       ← Cubism 2 内核
              cubism5Path:  /live2dcubismcore.min.js?v=,    ← Cubism 4/5 内核
              tools: ['hitokoto','switch-model','switch-texture','photo','info','quit'],
              drag: false,
          })                                        ← 以上路径统一由 asset() 挂 ?v=
```

### 模型清单

| 目录 | 格式 | 内核 | 体积 | 说明 |
| --- | --- | --- | --- | --- |
| `whale-girl/` | Cubism 4（`.moc3`） | `live2dcubismcore.min.js` | 4.1M | **默认模型**，小鲸鱼女仆（大肥鱼） |
| `shizuku/` | Cubism 2（`.moc`） | `live2d.min.js` | 2.7M | |
| `izumi/` | Cubism 2（`.moc`） | `live2d.min.js` | 3.3M | 体积最大，可考虑删除 |
| `nito/` | Cubism 2（`.moc`） | `live2d.min.js` | 794K | |

`whale-girl` 含 2 张纹理、44 个表情（`.exp3.json`）、8 个动作（`motions/*.motion3.json`），入口文件为 `c_0120.model3.json`。

### 换模型 / 调位置 / 关闭

| 想做什么 | 到哪里改 |
| --- | --- |
| 换模型、调顺序、改默认 | `source/live2d/waifu-tips.json` 的 `models` 数组（**第 0 项即默认**） |
| 调看板娘大小 | `source/live2d/live2d-custom.css` 顶部的 `--waifu-size`（默认 240px；中等屏 992~1599px 自动降为 200px） |
| 调看板娘位置 / 让位间距 | 同上文件；`--waifu-gap` 控制看板娘顶部与 `#rightside` 的间距 |
| 换气泡文案 / 事件提示 | `source/live2d/waifu-tips.json` 的 `message` / `mouseover` / `click` / `seasons` |
| 关闭看板娘 | 注释掉 `_config.butterfly.yml` 里 `inject.bottom` 那行 |

新增模型时，把模型目录放进 `source/live2d/models/`，再往 `waifu-tips.json` 的 `models` 数组加一项：

```json
{
  "name": "模型名",
  "paths": ["/live2d/models/模型名/xxx.model3.json"],
  "message": "自我介绍文案"
}
```

Cubism 4 模型填 `.model3.json`，Cubism 2 模型填 `.model.json`。

### 踩坑记录（改这块前必读）

1. **`screen.width` 在无头 Chrome 下恒为 800**，不受 `--window-size` 影响。判断是否加载看板娘**必须用 `window.innerWidth`**。
2. **`live2d-custom.css` 必须晚于 `waifu.css` 加载**。`waifu.css` 是 autoload.js 运行时动态插进 `<head>` 的，写在 `inject.head` 里的 `<link>` 会被它覆盖（同优先级、后者胜）。⇒ 必须像现在这样在 autoload.js 里 `await` 加载。
3. **`#waifu-canvas` 是块级元素**，不给 `#waifu` 定宽它会撑满整个视口（模型被挤到屏幕左边，右下角什么都没有）。
4. **模型 json 里的 `sound` 字段**若指向未随包提供的音频，点击时会 404。本项目已用脚本批量清除该字段。
5. **Cubism 2 与 Cubism 4 是两套内核**：`.moc` 模型走 `live2d.min.js`（配 `chunk/index.js`），`.moc3` 模型走 `live2dcubismcore.min.js`（配 `chunk/index2.js`）。`initWidget` 的 `cubism2Path` / `cubism5Path` 两个参数**都要给**，否则切换到对应格式的模型时会静默失败（控制台报 "No cubismXPath set"）。
6. **`#waifu` 的 `bottom` 过渡时长是 3 秒**（`transition: ... bottom 3s ease-in-out`）。自动截图验证时**必须等 ≥4 秒**再截，否则会截到入场动画中途，看起来像模型被视口裁掉。
7. **`oh-my-live2d` 的官方模型域名 `model.oml2d.com` 已被抢注**，返回垃圾站 HTML，官方文档里的模型地址全部失效。不要回退到那套方案。
8. **看板娘尺寸统一由 `--waifu-size` 一个变量控制**，它同时决定 `#waifu` 宽度、`#live2d` 画布边长，以及 `#rightside` 的让位高度（`calc(var(--waifu-size) + var(--waifu-gap))`）。改尺寸**只改这个变量**，别去单独改 `#live2d` 的宽高，否则主题按钮组会错位。
   - ⚠️ 「大小」的观感按**面积**算：`--waifu-size` 减半 = 视觉上小到 **1/4**。
9. **`<canvas id="live2d">` 的 `width` / `height` 属性 ≠ 显示大小**，别被它误导：
   - 属性值 = **内部渲染缓冲分辨率**，由 `waifu-tips.js` 初始写成 `800x800`；
   - 显示大小 = `live2d-custom.css` 里 CSS 的 `--waifu-size`，两者互相独立；
   - **Cubism 4 模型**（`whale-girl`）加载后，运行时会**把属性改写**成 CSS 尺寸（如 `200x200`）；
     **Cubism 2 模型**（`shizuku` / `izumi` / `nito`）**不改写，保持 `800x800`**；
   - ⇒ 在 DevTools 里看到 `800x800` 属**正常现象**（说明当前加载的是 Cubism 2 模型），**显示尺寸仍由 CSS 决定**，且内部 800 反而让画面更锐利。要核对实际大小，看 **Computed** 里的 `width` / `height`，或直接看视觉。
10. **改了 `/live2d/` 下的文件、线上却没变 ⇒ 先怀疑缓存**。Cloudflare 对静态资源做长缓存，URL 不变时浏览器会一直吃旧文件。本项目用 **`?v=` 版本号**解决，**改完必须同步更新两处**（否则白改）：
    - `source/live2d/autoload.js` 顶部的 `ASSET_VERSION` —— 管 `waifu.css` / `live2d-custom.css` / `waifu-tips.js` / 两个内核 / `waifu-tips.json`；
    - `_config.butterfly.yml` 里 `autoload.js` 自己的 `?v=` —— 管**加载器本身**，不改它新版加载器根本进不来。
    - 约定：`20261013a` → `20261013b` → …（日期 + 递增字母）。
    - ⚠️ **局限**：模型文件（`models/**` 下的纹理 / 表情 / motion / `moc3`）与 `chunk/index*.js` **不带版本号**（前者路径写在 `waifu-tips.json` 里、后者由 `waifu-tips.js` 内部 `import()`），**替换同名模型文件时仍需手动强刷一次**。
    - 已实测：核心 6 个资源请求均带 `?v=`，模型资源 60 个请求不带（预期内）。

### 本地验证手法

静态完整性检查（不需要浏览器）：

```bash
# 校验 model3.json / model.json 里引用的文件是否齐全、有无 0 字节文件
# 用 python 遍历 FileReferences（Cubism 4）或顶层字段（Cubism 2）逐个 os.path.isfile
```

真实渲染验证（推荐）：

```bash
npx hexo generate
python -m http.server 8899 --directory public --bind 127.0.0.1
# 再用 puppeteer-core / playwright（executablePath 指向系统 Chrome）打开 http://127.0.0.1:8899/
```

检查项：

- `document.getElementById('live2d')` 存在、`canvas.width === 400`、WebGL 上下文未丢失
- 把 canvas 画到临时 2D canvas 上统计非透明像素占比（正常约 20%~55%，0% 说明模型没画出来）
- 监听 `console` / `pageerror` / `requestfailed`，确认无 Live2D 相关报错
- 依次点击 `#waifu-tool-switch-model` 遍历所有模型，核对 `localStorage.modelId` 与渲染结果

> ⚠️ 无头 Chrome 下 WebGL 需要 `--enable-unsafe-swiftshader`（新版 Chrome 默认禁用软件渲染）。

## 本机环境注意事项

- 系统为 **Windows**，命令行走 Git Bash。
- **`hexo clean` 会被批量删除保护拦截**（报 `SAFE_DELETE_BULK_GUARD_ERROR`），直接用 `npx hexo generate`。
- Playwright 的浏览器版本可能与 npx 缓存中的包不匹配，**优先用 `executablePath` 指向本机 Chrome**：`C:\Program Files\Google\Chrome\Application\chrome.exe`。
- `.workbuddy-ai/` 是 AI 助手的工作区数据（记忆、产物、临时文件），**已加入 `.gitignore`，不入库**。

## 变更记录

- 2026-10-13 建立本文件。
- 2026-10-13 Live2D 看板娘上线：live2d-widgets 全自托管方案，初版 3 个 Cubism 2 模型（shizuku / izumi / nito），默认 shizuku。
- 2026-10-13 新增 Cubism 4 模型 `whale-girl`（小鲸鱼女仆），接入 `live2dcubismcore.min.js` 双内核加载链，并设为默认模型。已验证 4 个模型均可正常渲染与切换。
- 2026-10-13 看板娘尺寸减半（480→240px，中等屏 400→200px），并把尺寸抽成 `--waifu-size` / `--waifu-gap` 变量统一控制；`#waifu-tool` 的纵向位置改为跟随尺寸计算。
- 2026-10-13 接入 **`?v=` 缓存版本号**：`autoload.js` 的 `ASSET_VERSION` + `_config.butterfly.yml` 里 `autoload.js` 的 `?v=`。起因是「改了 CSS、线上仍是旧的 480px」——静态资源被长缓存。现已覆盖 6 个核心资源。
