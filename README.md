1. 将这三个文件推送到 GitHub 仓库的 main 分支。
2. Cloudflare → Workers & Pages → 创建 Worker → 导入该仓库；构建命令留空，部署命令 npx wrangler deploy，静态资源目录 public。
3. 完成首次部署，访问面板提供的公开 workers.dev 地址；此后 main 推送自动部署。
缺失资料在页面标为待确认，联系方式见群公告；上线前请核对公开内容。
页面无外部资源；已打开后断网仍可使用，离线重新打开请先保存 index.html（不含 Service Worker）。
