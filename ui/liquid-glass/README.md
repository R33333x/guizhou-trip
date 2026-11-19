# 玻璃材质与连续植物封面

实际使用 `liquid-glass-react@1.1.1`、React 19.2.0。组件仅作为 aria-hidden、inert 的卡片材质层；原始按钮、清单、文本和焦点由页面原有逻辑管理。切换页签时卸载隐藏卡片的 React 根，重绘清单后重新挂载。每个根使用独立 identifierPrefix，避免 SVG 滤镜串扰。

在本目录执行 `npm ci --ignore-scripts`，再执行 `npm run build`（需要 Node.js 与 Python 3）。构建只替换 public/index.html 中标记的样式和脚本区域，保留内容数据；产物仍为无需联网加载依赖的单个 HTML。依赖版本由 package-lock.json 锁定。

标题与导航共用 `.trip-cover` 的一张原创 SVG 植物背景和同一坐标系的 WebGL 采样；改变菜单高度时不会从标题下缘重新起图。正文区域共享第二个 WebGL 场景，按实际卡片和按钮的圆角折射背后的植物背景；只渲染当前视口附近，滚动时更新采样位置。文字与照片不参与折射。无 WebGL 时，上游标准折射图转用于 backdrop-filter，避免对半透明 SourceGraphic 直接应用产生灰块。

边缘只由宿主卡片绘制一层低对比描边与轻微高光，禁用上游额外的 screen / overlay 遮罩亮边和内层阴影，避免 Safari 在半像素圆角处叠出白边。选中按钮改用湖蓝色轮廓，避免夜间使用文字色产生亮白框。材质层使用扣除宿主边框后的内圆角并独立裁切，不裁切文字、焦点或弹出内容。日夜配色共用同一结构。

Safari/Firefox 对 SVG backdrop 位移的支持有限；Safari 显式使用模糊与边缘光泽，页头和正文 WebGL 折射独立提供。减少透明度时禁用材质，减少动态效果时禁用回弹和指针跟随。WebGL 不可用时保留 CSS 背景和导航。

上游许可证保存在 public/index.html 源码及内联 bundle 的 legal comments。参考：
- https://github.com/rdev/liquid-glass-react
- https://github.com/dashersw/liquid-glass-js

配色：白天采用方案 D（冰蓝底、苔绿主叶、湖蓝副叶、炭黑字）；夜间采用方案 B（炭黑底、苔绿主叶、湖蓝副叶、冰蓝字）。palette.js 将已有主题偏好与系统主题映射到 data-palette；CSS 和 WebGL 背景采样共用同一套配色。

边缘采用最高 3× 设备分辨率和距离场抗锯齿，削弱重复白边；日夜玻璃使用低浓度着色与轻微高光。主题改变时即使两套正文 SVG 完全相同，也重新合成背景底色。静止时不持续渲染；减少透明度或 WebGL 上下文丢失后回退为 CSS 材质。

植物背景包含蕨叶、羽状枝叶、裂叶、扇叶花、八瓣花与羽眼装饰。正文使用桌面 1120×1680、手机 430×1560 的原创透明 SVG 纵向循环；CSS 与 WebGL 共享 48px 起点及相同缩放、循环高度，长行程和住宿页面滚动到底仍有花纹与折射。封面保留同一连续画布，补充小型花朵和羽眼。
