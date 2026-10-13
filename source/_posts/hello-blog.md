---
title: 博客搭建记：Hexo + Butterfly + Cloudflare Pages
date: 2026-10-13 09:33:00
tags:
  - Hexo
  - Butterfly
  - Cloudflare
categories:
  - 折腾记录
---

这是一篇示例文章，用来展示博客的排版效果。之后可以删掉它，换成第一篇文章。

## 为什么选这套组合

| 环节 | 选择 | 理由 |
| --- | --- | --- |
| 博客引擎 | Hexo | 中文生态好，Markdown 写作，主题丰富 |
| 主题 | Butterfly | 深色模式、代码高亮、评论系统开箱即用 |
| 托管 | Cloudflare Pages | 免费、不限带宽，国内访问在免费托管里最稳 |

## 日常写作流程

```bash
# 新建一篇文章
npx hexo new "文章标题"

# 本地预览（http://localhost:4000）
npm run server

# 推送到 GitHub 后，Cloudflare Pages 自动构建发布
git add . && git commit -m "post: 新文章" && git push
```

## 代码高亮效果

```java
public class HelloBlog {
    public static void main(String[] args) {
        System.out.println("Hello, Blog!");
    }
}
```

```sql
SELECT id, title, created_at
FROM articles
WHERE status = 'published'
ORDER BY created_at DESC;
```

## 文字排版效果

普通段落、**加粗**、*斜体*、`行内代码`、[链接](https://hexo.io) 都正常显示。

> 好记性不如烂笔头。

- 无序列表第一项
- 无序列表第二项

1. 有序列表第一项
2. 有序列表第二项

---

以上就是全部演示，右上角可以切换深色/浅色模式。
