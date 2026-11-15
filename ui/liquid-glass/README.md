# 玻璃材质与连续植物封面

实际使用 `liquid-glass-react@1.1.1`、React 19.2.0。组件仅作为 aria-hidden、inert 的卡片材质层；原始按钮、清单、文本和焦点由页面原有逻辑管理。切换页签时卸载隐藏卡片的 React 根，重绘清单后重新挂载。每个根使用独立 identifierPrefix，避免 SVG 滤镜串扰。

在本目录执行 `npm ci --ignore-scripts`，再执行 `npm run build`（需要 Node.js 与 Python 3）。构建只替换 public/index.html 中标记的样式和脚本区域，保留内容数据；产物仍为无需联网加载依赖的单个 HTML。依赖版本由 package-lock.json 锁定。

标题与导航共用 `.trip-cover` 的一张原创 SVG 植物背景和同一坐标系的 WebGL 采样；改变菜单高度时不会从标题下缘重新起图。卡片用上游标准折射图、双层边缘和背景模糊；SVG filter 转用于 backdrop-filter，避免对半透明 SourceGraphic 直接应用产生灰块。上游独立边缘层尺寸跟随卡片，正文不参与滤镜。

Safari/Firefox 对 SVG backdrop 位移的支持有限；Safari 显式使用模糊与边缘光泽，页头 WebGL 折射独立提供。减少透明度时禁用材质，减少动态效果时禁用回弹和指针跟随。WebGL 不可用时保留 CSS 背景和导航。

上游许可证保存在 public/index.html 源码及内联 bundle 的 legal comments。参考：
- https://github.com/rdev/liquid-glass-react
- https://github.com/dashersw/liquid-glass-js
