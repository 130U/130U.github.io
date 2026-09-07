# 网站架构

[打开交互架构图](https://www.theodoreoy.com/architecture/)

从内容源到浏览器，查看 Theodore 网站的构建、发布与交互边界。架构图支持中英文标识检索、深浅主题、关系追踪和图片导出；下载 `index.html` 后也可离线查看。

| 文件 | 用途 |
| --- | --- |
| `site.json` | 依据当前代码编写的 Archify 架构定义 |
| `index.html` | 独立运行的交互架构图 |
| `README.md` | 访问方式与维护入口 |
| `LICENSE` | Archify 查看器的 MIT 许可 |

内容与路由由 `website/app/lib/content/` 和 `website/content/` 管理。Next.js 在构建期生成静态页面；GitHub Actions 验证并发布 `website/out/`，GitHub Pages 通过自定义域名交付。导航与首页 Canvas 动效在浏览器运行，网站无需运行时 API、数据库或身份认证。

更新架构时，以代码和 `.github/workflows/pages.yml` 为依据编辑 `site.json`，使用安装的 Archify 校验并生成 HTML：

```sh
node <archify>/bin/archify.mjs validate architecture architecture/site.json --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture architecture/site.json architecture/index.html --quality showcase --json
```

`<archify>` 为本机 Archify Skill 所在目录。完整网站检查执行 `npm --prefix website run check`；构建脚本将架构 HTML 一并发布至 `/architecture/`。

查看器由 Archify 生成，采用 MIT 许可。在线时可加载 Google Fonts 的 JetBrains Mono 字体；离线时使用系统字体，图表与交互仍可用。
