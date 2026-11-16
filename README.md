1. 仓库：https://github.com/R33333x/guizhou-trip；发布版本保留在 main 分支。
2. Cloudflare → Workers & Pages → 创建 Worker → 导入该仓库；构建命令留空，部署命令 npx wrangler deploy，静态资源目录 public。
3. 公开网址：https://guizhou-trip.tc6vrhdy6t.workers.dev；main 推送后由 Cloudflare 自动部署。
缺失资料在页面标为待确认，联系方式见群公告；上线前请核对公开内容。
页面不自动请求外部资源；12 张民宿照片保留原始分辨率并内嵌。行李勾选保存在当前浏览器；天气为标注日期的快照，可点击来源查看最新预报。离线重新打开请保存 index.html。

设计：标题与菜单共用连续植物背景；卡片使用 Liquid Glass React 1.1.1。依赖已打包进 HTML，无需在线加载。可复现的材质源码与构建说明见 ui/liquid-glass/README.md；Cloudflare 直接发布 public，无需额外构建。

日间采用 D 配色（冰蓝底、苔绿与湖蓝花纹）；夜间采用 B 配色（炭黑底、苔绿与湖蓝花纹）。支持跟随系统及保存手动主题选择。
