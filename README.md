# 我的技术博客

Hexo + Butterfly 主题 + Cloudflare Pages 的个人技术博客。

---

## 当前状态

- [x] 本地搭建完成：首页 / 文章 / 归档 / 标签 / 分类 / 关于、深色模式、本地搜索、代码高亮
- [ ] 上线部署（需要 GitHub 账号 + Cloudflare 账号，见下文）
- [ ] 评论系统启用（Giscus，等仓库建好后配置）
- [ ] 站点信息个性化（名字、头像、社交链接等）

## 目录速览

```
blog/
├── _config.yml             # 站点总配置（标题、作者、描述、域名……）
├── _config.butterfly.yml   # 主题配置（菜单、深色模式、评论、搜索……）
├── source/
│   ├── _posts/             # 文章（Markdown，一篇一个文件）
│   ├── about/              # 关于页
│   └── tags/  categories/  # 标签页、分类页（一般不用动）
├── scaffolds/              # 新建文章的模板
├── package.json
└── README.md               # 本文件
```

## 日常使用

```bash
# 本地预览（http://localhost:4000，改文章自动刷新）
npm run server

# 新建一篇文章 → 生成 source/_posts/文章标题.md
npx hexo new "文章标题"

# 清理 + 构建（产物在 public/，一般不用手动执行，推送后云端会自动构建）
npm run clean && npm run build
```

文章的文件头格式：

```markdown
---
title: 文章标题
date: 2026-10-13 10:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
description: （可选）首页列表里显示的摘要
---

正文用 Markdown 写……
```

## 部署到 Cloudflare Pages（免费）

### 第一步：推到 GitHub

本地仓库已初始化好（分支 `main`）。先在 GitHub 网页建一个仓库：

- 仓库名随意，例如 `blog`
- 建议设为 **Public**（之后启用评论 Giscus 需要）
- 不要勾选 "Add a README"（保持空仓库）

然后在本目录执行：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 第二步：连接 Cloudflare Pages

1. 登录 Cloudflare 控制台 → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选择博客仓库
3. 构建设置：
   - Build command：`npm run build`
   - Build output directory：`public`
   - 环境变量：`NODE_VERSION` = `22`
4. 保存并部署 → 获得免费域名 `xxx.pages.dev`

### 第三步：回填域名

把 `_config.yml` 里的 `url` 改成实际地址（如 `https://xxx.pages.dev`），提交推送，等重新部署完成。

> 之后每次 `git push`，Cloudflare 都会自动重新构建发布。

## 启用评论（Giscus）

Giscus 把评论存在 GitHub Discussions 里，免费、无需服务器。

1. GitHub 仓库 → **Settings** → **General** → **Features** → 勾选 **Discussions**
2. 打开 https://giscus.app/zh-CN ，填入仓库名，映射方式选 `pathname`
3. 记下页面给出的 **repo / repo_id / category_id**，填入 `_config.butterfly.yml`：

   ```yaml
   comments:
     use: giscus
   giscus:
     repo: 你的用户名/仓库名
     repo_id: R_xxxxxx
     category_id: DIC_xxxxxx
   ```

4. 推送，部署完成后评论区即生效

## 个性化清单

| 想改什么 | 到哪里改 |
| --- | --- |
| 站点名 / 作者 / 描述 | `_config.yml` 的 `title` / `author` / `description` |
| 头像 | 图片放到 `source/img/` 下，改 `_config.butterfly.yml` 的 `avatar.img` |
| 社交链接（GitHub 等） | `_config.butterfly.yml` 的 `social` |
| 首页大图 | `_config.butterfly.yml` 的 `index_img` / `default_top_img` |
| 首页大图高度 | `_config.butterfly.yml` 的 `index_top_img_height`（如改成 `480px`，默认全屏） |
| 侧栏 "Follow Me" 链接 | `_config.butterfly.yml` 的 `aside.card_author.button.link` |
| 网站图标 favicon | 放一张图到 `source/img/`，在 `_config.butterfly.yml` 加 `favicon: /img/你的图片名.png` |
| 主题色 | `_config.butterfly.yml` 中启用 `theme_color` 段 |

> 主题全部可配置项（中文文档）：https://butterfly.js.org/

## 参考文档

- Hexo 文档：https://hexo.io/zh-cn/docs/
- Butterfly 文档：https://butterfly.js.org/
- Cloudflare Pages：https://developers.cloudflare.com/pages/
- Giscus：https://giscus.app/zh-CN
