# Theodore Ouyang 个人网站最终项目执行手册

> 状态：最终确认版，可直接复制给实施 AI，不包含代码修改  
> 项目：`www.theodoreoy.com`  
> 仓库：`C:\Users\theod\OneDrive\文档\个人作品\130U.github.io`  
> 核心命题：Cognition Replica Shell + Theodore Content + Dithered Entrance
> 已确认的移动端控制文字：`Menu` / `Close`

参考边界：

- 正文结构与视觉基准：`https://cognition.com/`
- 散点入口交互基准：`https://emilkowal.ski/ui/agents-with-taste`
- 当前内容与路由基准：`https://www.theodoreoy.com/`

## 0. 结论

这个方向是成立的，而且比“把两个网站的元素混在一个页面里”更成熟。

正确的组合方式不是让 Cognition 的排版、旧版深蓝星空和 Emil 的粒子效果同时争夺注意力，而是建立两个连续场景：

1. 访客进入网站，首先只看到一个白色、全屏、可交互的散点字标入口。
2. 继续向下滚动，入口结束，完整进入 Cognition 式白色网站。
3. 从这一刻开始，全站统一使用 Cognition 的网格、左侧导航、排版比例、细边框和留白纪律。
4. 页面内出现的事实、履历、说明、联系方式和导航名称全部来自 Theodore 当前网站。

它的价值在于分工明确：

- Emil 式入口负责个人记忆点和设计判断。
- Cognition 式正文负责可信度、秩序和阅读效率。
- Theodore 的原始内容负责真实性。

最终不应被描述成“Cognition 和 Agents with Taste 的混搭网站”，而应被理解为：一个有独立入口仪式的 Theodore 个人网站，正文采用 Cognition 级别的结构纪律。

## 1. 已确认的设计方向

### 1.1 视觉目标

正文部分进行高保真、独立实现的 Cognition 页面复刻。目标不是抽象地“参考”或“借鉴”，而是在以下层面尽可能接近参考网站：

- 页面底色与黑白关系
- 桌面端左侧固定导览和右侧正文的比例
- 宽屏网格与纵向结构线
- 标题、正文、导航、数字和链接的层级
- 大段留白和章节间距
- 细边框、无卡片阴影、无玻璃质感的组件语言
- 桌面端和移动端的导航行为
- 克制的 hover、focus 和滚动反馈

### 1.2 内容目标

将 Theodore 当前网站的全部有效内容放入这套结构中，不复制 Cognition 的以下内容：

- Cognition 名称与 logo
- Devin 品牌内容
- 客户 logo、客户名称和客户案例
- Cognition 的文字、图片和数据
- Cognition 的源代码、CSS 文件、字体文件和私有素材

这是视觉和结构的独立重建，不是抓取或复制对方项目文件。

### 1.3 首页目标

首页必须比 Cognition 多一个独立的第一幕：

- 首屏只呈现 Agents with Taste 风格的散点图。
- 散点图同时呈现 `THEODORE` 与 `OUYANG`，不做两个词交替循环。
- 背景从第一帧开始就是 Cognition 式暖白色。
- Cognition 导览和正文不覆盖在入口上方。
- 用户向下滚动后才看到 Home 正文和左侧导览。

### 1.4 视觉替换范围

新的要求等同于批准替换旧视觉世界。因此实施时应退出以下旧样式：

- 深蓝星空背景
- 全屏环境粒子
- 玻璃拟态顶部导航
- 大圆角悬浮导航容器
- Shantell Sans 作为主要界面字体
- 内页持续出现的独立浮动 profile card
- 蓝色渐变、发光和装饰性模糊

保留的是内容、信息架构、路由、可访问性语义和散点交互的个人性，不是旧版视觉材料。

## 2. 不可违反的内容与结构边界

### 2.1 所有原始文字锁定

实施 AI 不得改写、润色、缩短、扩写、翻译或纠正任何现有可见文字，包括：

- 页面标题
- 页面正文
- 教育经历与课程名称
- Past Experience 的组织、项目、日期、地点、职位、摘要和 bullet
- Home 的 Profile、About、Coordinates 内容
- 导航文字
- 联系方式
- 页脚
- 元数据标题和 description
- alt、aria-label、skip link 等无障碍文字

允许改变的只有文字的布局位置、字号、行宽、字体、颜色和响应式排列。

### 2.2 信息架构锁定

以下公开路由和导航名称保持不变：

| 页面 | 路由 | 导航文字 |
|---|---|---|
| Home | `/` | `Home` |
| Education | `/education/` | `Education` |
| Past Experience | `/past-experience/` | `Past Experience` |
| Current Chapter | `/now/` | `Current Chapter` |

五个 Past Experience 子路由及其 slug 也保持不变：

1. `/past-experience/artificial-intelligence/`
2. `/past-experience/data-science/`
3. `/past-experience/environmental-social-and-governance/`
4. `/past-experience/finance/`
5. `/past-experience/stem-academic-competitions-and-training/`

### 2.3 允许的布局调整

用户已经将“Cognition 高保真复刻”设为新的视觉优先级，因此以下结构调整被视为合理范围：

- 顶部横向导航改为桌面端左侧 sticky navigation。
- 内页左侧导览不再重复头像、个人简介或联系方式。
- profile 的唯一完整版本集中放在 Home 正文中。
- Education、Past Experience 和 Current Chapter 进入同一套 Cognition shell。
- 页面原有内容块可重新放入网格，但块内文字顺序不能被任意打乱。

这不是删除 profile 内容，而是去除内页重复展示，使阅读结构更接近 Cognition。

### 2.4 已确认的新增界面文字

移动端正式使用 `Menu` 和 `Close` 两个控制标签。它们属于界面控制，不属于个人内容。

这一决定已经由 Theodore 确认。它比无标签 hamburger 更符合参考网站，也更容易访问。

`Menu` 和 `Close` 是唯二允许新增的可见界面文字，必须进入 visible copy manifest 的显式 allowlist。除这两个控制标签外，不新增任何可见文案。

## 3. 全站体验顺序

```text
进入 /
  ↓
100dvh 白色散点入口
  ↓ 用户自然滚动
Home 正文开始，同时左侧 Cognition 式导览进入并保持 sticky
  ↓
Profile / About
  ↓
Coordinates
  ↓
Footer

从左侧导览进入其他路由
  ↓
沿用同一 Cognition shell，不重复播放散点入口
```

入口只属于 Home。Education、Past Experience、Current Chapter 和五个经历子页应直接进入正文，不先播放散点入口。

从内页返回 Home 时，Home 仍然从顶部入口开始。这是品牌首页的正常行为，不做 session 内自动跳过，也不加入“已看过”状态。

## 4. 第一幕：Dithered Entrance

### 4.1 入口角色

这不是登录、认证或 loading screen。它是一个可滚动的品牌入口，也就是网站的第一章节。

不能加入：

- 登录框
- Enter 按钮
- 进度条
- 自动倒计时
- 自动跳转
- 音效
- 深蓝背景
- Cognition 导览覆盖层

### 4.2 画面构图

桌面端：

- section 高度：`100dvh`
- 背景：`#f7f6f5`
- 主视觉在视口几何中心稍偏上
- 主视觉 CSS 尺寸：推荐 `360px × 360px`
- 大屏上限：`420px × 420px`
- 圆角：约主视觉宽度的 18% 至 20%
- 主视觉外部不放标题、副标题或介绍文字
- 当前已有的 `Scroll` 可保留在底部中央，并保持非常弱的对比度

移动端：

- section 高度：`100svh`，并以 `100dvh` 增强支持
- 主视觉宽度：`min(78vw, 320px)`
- 上下保留安全区，不被浏览器工具栏裁切
- 触摸时保持页面可以正常纵向滚动

### 4.3 名字如何同时放入散点图

采用一个固定的双行 wordmark mask：

```text
┌──────────────────┐
│    THEODORE      │
│     OUYANG       │
└──────────────────┘
```

具体规则：

- 两个词从第一帧起同时存在。
- `THEODORE` 占上半区，`OUYANG` 占下半区。
- 两行共享一个视觉宽度，而不是共享同一字号。
- `THEODORE` 因字符更多，字号略小或字宽略压缩。
- `OUYANG` 字号略大，补足下半区的重量。
- 两行之间保留一条可呼吸的负空间，不使用分隔线。
- 文字不是 DOM 文本叠在粒子上，而是直接决定粒子掩码。
- 不使用 `THEODORE → 粒子 → OUYANG → 粒子` 的循环。

推荐视觉是“一个稳定的名字标志被鼠标暂时扰动，然后自然恢复”，而不是“一个不停表演的动画”。这会更成熟。

### 4.4 形状语言

外轮廓采用 Agents with Taste 图标相近的圆角方形密度场，但不复制它的内部图案。内部信息完全由 Theodore 的名字构成。

散点分为两种密度：

- 字形主体：较密、较黑、优先保证识别。
- 方形背景与边缘：较疏，用来形成 dither 质感。

外围可保留极少量游离点，但游离点不能扩散到整个视口，也不能重建旧版星空感。

### 4.5 交互规则

#### Pointer repel

- 指针影响半径：约 `100px`
- 最大位移：约 `40px`
- 衰减：cubic falloff
- 恢复平滑系数：约 `0.12 / frame`
- 影响只发生在 canvas 内部
- 离开 canvas 后所有点平滑回到初始位置

#### Pointer release ripple

- 触发：pointer up
- 波速：约 `225px / s`
- 波环宽度：约 `37px`
- 最大作用强度：约 `20px`
- 生命周期：约 `675ms`
- 波纹结束后不残留振动

#### 初次出现

- mask 完成后整体以 `opacity` 淡入
- 时长：约 `800ms`
- easing：`cubic-bezier(0.16, 1, 0.3, 1)`
- 不逐字打字，不逐点随机飞入，不加入 logo reveal 剧情

### 4.6 Reduced motion

当用户启用 `prefers-reduced-motion: reduce`：

- 仍显示完整双行散点字标。
- 禁用 pointer repel、ripple 和淡入位移。
- 入口仍可正常滚动。
- 不将 canvas 隐藏，也不让用户失去品牌信息。

## 5. 第二幕：Cognition Replica Shell

### 5.1 核心结构

桌面端正文使用 15 列外部网格：

- 左侧导航：3 列
- 右侧主内容：12 列
- 页面左右 padding：`64px`
- 网格之间使用真实内容边界形成的 1px 纵线
- 纵线颜色：`rgba(0, 0, 0, 0.06)`
- 左侧导览从 Home 正文开始处进入 sticky 状态
- sticky top 根据视口高度和内容位置校准，不悬浮成卡片

这里的纵线必须组织真实内容，不额外铺满装饰性“工程网格”。

### 5.2 左侧导览

从上到下：

1. Theodore 自有的 `LO` 两字母微型字标，约 `20px` 宽
2. 四个现有导航链接
3. 当前页面使用 `#2200ff` 和 2px 竖线标记

标记不能复制 Cognition logo。它使用无边框、无底板的 `LO` 排印字标，形成 Theodore 自己的识别系统。

桌面端导航视觉：

- 文字：15px sans
- 行高：约 1.3
- 非活动状态：near-black
- 活动状态：`#2200ff`
- active marker：`2px × 12px`
- 无背景 pill
- 无圆角容器
- 无阴影

### 5.3 右侧正文

正文以 Cognition 的大标题、serif body 和 section rhythm 为基准：

- 第一内容 section 顶部留白：约 `180px`
- 后续 section 通过真实段落高度与大块留白分隔
- 主标题最大宽度约 9 至 10 个网格列
- 长正文最大阅读宽度控制在 64 至 72 个字符
- 数字、日期和元数据贴合网格起点
- 只用空白与细线建立层级，不使用卡片阴影

### 5.4 首页入口与 sticky 导览的衔接

首页的 Cognition shell 不能从页面顶部开始 sticky，否则左侧导航会出现在散点入口上。

实现逻辑：

- `DitheredEntrance` 是 shell 之前的独立 section。
- shell 自身从 `#home-profile` 开始。
- 导览只在 shell 的范围内 sticky。
- 入口和 shell 共享同一背景色，因此滚动过渡不是颜色转场。
- 两幕边界用网格开始、正文出现和一条结构线表达，不做渐变幕布。
- skip link 必须是 Home DOM 中第一个可聚焦元素，目标直接指向 `#home-profile`。
- canvas 本身不进入 tab sequence，不能阻挡用户跳过入口。

### 5.5 已确认的移动端导航行为

收起状态：

- 顶栏左侧显示 `LO` 与 Theodore Ouyang wordmark。
- 顶栏右侧显示 `Menu`。
- `Menu` 是普通文字按钮，不使用 hamburger icon，不使用 pill 背景。

展开状态：

- `Menu` 原位变为 `Close`。
- 导航面板从顶栏下方展开，使用与页面一致的 `#f7f6f5` 背景。
- 四个现有导航链接纵向排列，顺序不变。
- 当前页面继续使用蓝色文字和细竖线标记。
- 面板不使用 blur、glass、drop shadow 或深色 backdrop。
- 展开时锁定页面背景滚动，并把键盘焦点限制在菜单内。

关闭条件：

- 点击 `Close`。
- 按下 Escape。
- 点击任一导航链接。
- 路由完成后自动关闭。

无障碍要求：

- 按钮使用 `aria-expanded` 和 `aria-controls`。
- 面板拥有清楚的 navigation label。
- 关闭后焦点返回原控制按钮。
- 动画仅使用 opacity 和 transform，约 180ms 至 220ms。
- reduced motion 下取消位移动画，状态立即切换。

## 6. 视觉系统规格

### 6.1 颜色

| Token | 建议值 | 用途 |
|---|---:|---|
| `--page` | `#f7f6f5` | 全站背景 |
| `--ink` | `#0b0b0b` | 标题与主要文字 |
| `--muted` | `#777773` | 次要信息 |
| `--rule` | `rgba(0,0,0,0.06)` | 网格与结构线 |
| `--rule-strong` | `rgba(0,0,0,0.24)` | 明确边框与 focus 辅助 |
| `--accent` | `#2200ff` | active navigation 与链接状态 |
| `--dither` | `#070707` | 入口粒子 |

全站保持单一 light theme。这是用户明确指定的视觉方向，因此不跟随系统自动切换 dark mode。

### 6.2 字体

对参考网站的浏览器测量显示，它使用 `nbInternational` 和 `stkBureauSerif`。这些字体文件不从 Cognition 复制。

生产方案分两层：

1. 如果 Theodore 合法持有相应或接近字体授权，则使用本地授权文件。
2. 没有商业授权时，使用可合法部署的 metric approximation。

推荐无授权基线：

- Sans：`Helvetica Neue`, `Helvetica`, `Arial`, sans-serif
- Serif：`Source Serif 4`, `Georgia`, serif

验收重点是字体指标和阅读节奏，而不是字体名字：

| 层级 | Desktop | Mobile | 其他 |
|---|---|---|---|
| H1 | 36px / 1.1 | 24px / 1.2 | 400 weight, -0.02em tracking |
| H2 | 24px / 1.2 | 20px / 1.25 | sans |
| Body | 15px / 1.5 | 15px / 1.5 | serif |
| Navigation | 15px / 1.3 | 15px / 1.3 | sans |
| Metadata | 12px / 1.4 | 12px / 1.4 | sans |

当前 Shantell Sans 不再用于导航、标题或正文。它可暂时保留在仓库中，直到确认没有其他资产依赖，再决定是否清理。

### 6.3 线条、圆角和阴影

- 正文结构以 1px hairline 为主。
- 普通内容容器圆角为 0。
- 唯一大圆角是散点入口的图形轮廓。
- 链接和导航不使用 pill。
- 全站不使用 drop shadow。
- focus ring 必须清晰，不能为了“极简”而消失。

## 7. 每一页的具体呈现

### 7.1 Home `/`

#### Section A：Dithered Entrance

内容：双行 `THEODORE` 与 `OUYANG` 散点字标，以及当前已有的 `Scroll`。

布局：全屏独立入口，不显示导航、头像、简介和联系方式。

#### Section B：Profile / About

映射到 Cognition 首页第一个主要内容 section：

- `Profile` 保留为小型结构标签。
- `Theodore Ouyang` 作为主 H1。
- 两条 profile summary 位于 H1 下方或同一网格的次级列。
- `About` 与现有两段 biography 放在 H1 下方的 serif 阅读区。
- 不改写、不合并、不缩短任何句子。

构图目标是 Cognition 首页首段的节奏，而不是把内容重新装进 profile card。

#### Section C：Coordinates

映射到 Cognition 首页第二个网格 section。使用 4 列视觉单元：

1. Location
2. Education
3. Email
4. Online

这样可以借用 Cognition logo wall 的秩序，但不制造客户或品牌 logo。所有信息都是真实的 Theodore 内容。

Home 不显示肖像，让姓名、简介与联系方式成为唯一阅读主线。

#### Footer

保留当前两行 footer 文字。视觉改为直接位于网格底部的细线区域，不使用深色 footer 或独立卡片。

### 7.2 Education `/education/`

#### Section A：Page intro

- 原有 `Education` 作为 H1。
- 左侧导航 active 状态切换到 Education。
- 右侧首段顶部节奏与 Cognition 首页一致。

#### Section B：Degrees

两条 Duke University 学位记录改为纵向 editorial entries：

- 日期占 1 至 2 列。
- 学校、学位、concentration、advisor 和 scholarship 占余下列。
- 两条记录之间使用一条真实分隔线。
- 不把学位拆成卡片，也不使用 icon。

#### Section C：Selected Coursework

四个现有课程组保持不变：

- Desktop：4 列，组名在上，课程列表在下。
- Tablet：2 列。
- Mobile：1 列。
- 课程不改名、不删减、不重新排序。

长列表通过组间留白和列结构组织，不在每门课下面画分隔线。

### 7.3 Past Experience `/past-experience/`

#### Section A：Page intro

保留当前标题和 lede，放入 Cognition 式大标题区域。

#### Section B：Domain directory

五个现有领域继续使用 `01` 至 `05`：

- 每行由 number、domain name、arrow 构成。
- 整行可点击。
- hover 时只改变文字色、arrow 位移和 rule 强度。
- 不做 bento card，不增加摘要，不增加统计数字。

现有 domain number 已经承担结构编号，因此这一 section 不再额外增加装饰性编号。

### 7.4 五个 Past Experience 子页

所有子页共享同一模板。

#### Header

- 保留 back link。
- 保留 domain number。
- 保留 domain name。
- 左侧导航的 Past Experience 继续保持 active。

#### Entry list

每个 experience entry 使用 Cognition 式 editorial record：

- entry number 占最左窄列。
- organization 为 H2。
- Location、Website、Position、Dates 按现有顺序排列。
- Project 保持独立层级。
- summaries 与 bullets 保持原顺序和原文字。
- 每条 entry 之间使用大留白和一条结构线。
- metadata 在所有尺寸保持一列键值结构，避免横向扫描时割裂 Location、Website、Position 与 Dates。

不把经历包装成卡片，不加入公司 logo，不用 timeline 圆点。

### 7.5 Current Chapter `/now/`

#### Section A：Title

- 保留 `Current Chapter` context。
- 保留现有 H1。
- 使用 Cognition 首段的标题比例。

#### Section B：Brief

- 保留完整原段落。
- 使用 serif body。
- 阅读宽度不超过 72ch。
- 不新增 CTA、时间、状态 badge 或 project list。

这个页面应保持最安静，因为内容本身很短。不要为了填满页面制造新模块。

### 7.6 Not Found

现有 404 页面也应继承背景、字体、网格和导航行为，但不新增散点入口。其现有文字同样进入 copy lock。

## 8. 散点图工程实现方案

### 8.1 技术选择

使用 React Client Component + Canvas2D，不使用 GIF、视频、SVG 点阵、Three.js 或 GSAP。

原因：

- 这是二维点阵位移，不需要 3D 渲染器。
- Canvas2D 更轻，更容易控制 DPR 和 pointer hit area。
- 不引入新的动画依赖。
- 可以只在状态变化时运行 RAF，减少空闲耗电。

### 8.2 建议组件

```text
app/components/dithered-entrance/
  DitheredEntrance.tsx
  DitheredEntrance.module.css
  dither-mask.ts
  dither-motion.ts
  dither-types.ts
```

### 8.3 掩码生成

1. 在离屏 canvas 中绘制两行 wordmark。
2. 按统一 grid 采样 alpha 和 luminance。
3. 使用项目自有的 dither threshold 或 Floyd-Steinberg 生成 boolean mask。
4. 将 mask 预计算为 typed array 或 bitset。
5. runtime 只读取目标点，不在每帧重新测量字体或读像素。

参考文章的公开页面不能证明其原始离线 dithering 算法。因此 Floyd-Steinberg 只能被描述为本项目的重建选择，不能宣称是 Emil 的原始源码实现。

### 8.4 点数据

每个点至少保存：

- homeX
- homeY
- currentX
- currentY
- velocityX
- velocityY
- radius
- density 或 alpha

grid 基线可从约 `205 × 205` 采样开始，目标实际可见点约 14,000 至 18,000。最终以字形清晰度和移动端帧率决定，不追求固定数量。

### 8.5 RAF 生命周期

RAF 只在以下状态运行：

- 初次淡入
- pointer 位于影响区
- 仍有点未回到 home position
- ripple 仍在传播

静止后停止循环。pointer move 不写 React state，而是写 ref 或普通 runtime object。

### 8.6 DPR 和 resize

- canvas CSS 尺寸与 drawing buffer 分离。
- drawing buffer 按 `min(devicePixelRatio, 2)` 放大。
- resize 使用 ResizeObserver。
- resize 结束后重建 mask，不在连续 resize 的每一帧重复计算。
- 防止 high-DPR 设备产生过大的像素缓冲区。

### 8.7 输入事件

统一使用 Pointer Events：

- pointermove
- pointerleave
- pointerup
- pointercancel

canvas 不捕获滚轮，不阻止页面滚动。触摸 drag 若与纵向滚动冲突，应优先让页面滚动，仅在短 tap release 时产生 ripple。

### 8.8 静态 fallback

若 canvas 初始化失败：

- 显示预渲染的静态点阵 PNG 或普通文字 fallback。
- 页面仍然可滚动到 Home。
- 真实文字必须存在于可访问树中，例如通过 visually hidden heading，而不是只存在于像素里。

## 9. 响应式规则

### Desktop：`≥ 1024px`

- 15 列网格
- 64px 左右 padding
- 3 列 sticky rail + 12 列正文
- H1 36px
- section top rhythm 180px

### Tablet：`768px - 1023px`

- 可压缩为 12 列
- rail 宽度约 3 列
- page padding 32px
- 课程组 2 列
- Coordinates 可从 5 列变为 3 + 2

### Mobile：`< 768px`

- page padding 20px
- 桌面 rail 隐藏
- 顶部显示轻量 Menu 控制
- 菜单展开后显示四个原导航链接
- section top rhythm 88px
- H1 24px
- 所有内容单列
- metadata term 和 value 保持清晰配对
- menu 展开必须锁定焦点顺序，但不要用沉重全屏动画

### Narrow mobile：`≤ 390px`

- 名字入口不允许横向裁切
- 长 domain name 与课程名称允许自然换行
- Email 不得溢出视口
- 触摸目标至少 44px 高

## 10. 动效语法

全站只有入口是高表现力动效。正文保持接近 Cognition 的静态纪律。

允许：

- 导航 active marker 的 160ms 至 220ms 过渡
- 链接下划线或颜色的 160ms 至 220ms 过渡
- domain arrow 在 hover 时移动 3px 至 4px
- mobile menu 的 opacity + transform 过渡
- 入口散点 repel、return 和 ripple

禁止：

- 每个 section 都 scroll reveal
- 滚动视差
- 页面级横向 scroll hijack
- GSAP pinning
- 大面积 blur 动画
- 无限漂浮粒子
- 鼠标自定义 cursor
- 按钮磁吸
- 文字循环切换

正文成熟感来自稳定，不来自处处在动。

## 11. 代码级改动地图

### 11.1 当前技术基线

- Next.js `16.2.12`
- React / React DOM `19.2.8`
- TypeScript `5.9.3`
- Tailwind CSS `4.2.1`，通过 PostCSS 接入
- Three.js `0.160.0`，目前只为旧粒子系统服务
- Node.js `>=22.13.0`
- `output: "export"`
- `trailingSlash: true`
- GitHub Pages 静态部署
- 无数据库、无认证、无 runtime API、无 Server Action、无 middleware

新方案继续使用现有 Next.js 静态导出架构，不迁移框架，不引入 CMS，不增加后端。

### 11.2 允许修改

| 文件 | 目标 |
|---|---|
| `app/page.tsx` | 在 Home shell 前接入 Dithered Entrance，并重排 Home sections |
| `app/components/SiteShell.tsx` | 重建为 Cognition 式 desktop rail + mobile menu |
| `app/globals.css` | 新颜色、网格、排版、页面公共规则 |
| `app/home.module.css` | 入口和 Home sections 的局部样式 |
| `app/layout.tsx` | 只在需要时调整合法字体加载与全局 shell 支持 |
| `app/not-found.tsx` | 接入同一视觉 shell |
| `tests/*.test.mjs` | 将旧视觉断言更新为本手册批准的新 shell、入口和内容保护断言 |
| `package.json` | 仅在确认 Three.js 无引用后移除 Three.js 与对应 types |

### 11.3 必须保持 byte-for-byte 不变

以下文件已经被 `scripts/check-protected-sources.mjs` 锁定。实现 AI 不得修改、移动、重命名或删除：

- `app/education/page.tsx`
- `app/now/page.tsx`
- `app/past-experience/page.tsx`
- `app/past-experience/[slug]/page.tsx`
- `app/past-experience/components/ExperienceDomainPage.tsx`
- `app/lib/content/experience.ts`
- `content/past-experience/archive-through-2026-06-30.md`

Education、Past Experience 和 Current Chapter 的新布局必须通过以下方式实现：

- 重建 `SiteShell`
- 重写 `app/globals.css` 中已有 class 的布局规则
- 使用现有语义结构和 class names 进行 grid 映射
- 必要时通过 CSS pseudo-element 添加纯装饰线条，但不得生成新内容文字

不得通过削弱、删除或绕过 `check-protected-sources.mjs` 来让检查通过。

### 11.4 预计新增

- `app/components/dithered-entrance/DitheredEntrance.tsx`
- `app/components/dithered-entrance/DitheredEntrance.module.css`
- `app/components/dithered-entrance/dither-mask.ts`
- `app/components/dithered-entrance/dither-motion.ts`
- `app/components/dithered-entrance/dither-types.ts`
- `scripts/verify-visible-copy.mjs`
- `content/visible-copy-manifest.json`

### 11.5 预计退出或清理

当前 `app/components/particle-background/` 不再服务首页。清理顺序必须是：

1. 新入口完成。
2. 全站确认没有 import。
3. build 和 route 验证通过。
4. 再删除旧 particle 文件。
5. 若 Three.js 没有其他用途，再从依赖中移除。

不能在新入口完成前先删除旧实现。

旧测试中凡是要求“深蓝视觉”“旧粒子模式”“内页共享 profile sidebar”或“Shantell Sans 全站角色”的断言，都应被新批准的设计事实替换。内容数量、路由、metadata、archive、链接、无障碍和部署政策测试继续保留，不能为了改版整体删除测试文件。

## 12. 内容保护机制

### 12.1 Visible copy manifest

实施开始前，从当前版本抽取每个公开路由的所有可见字符串与关键 aria 字符串，生成基线 manifest。

建议结构：

```text
route
  source file
  ordered visible strings
  hrefs
  heading levels
  aria labels
```

改版后由脚本对比：

- 缺失字符串
- 新增字符串
- 被修改字符串
- 顺序变化
- href 变化

`Menu` 和 `Close` 已获确认，应进入显式 allowlist，而不是被脚本静默忽略。

### 12.2 Past Experience 原始档案

`content/past-experience/archive-through-2026-06-30.md` 继续是经历事实的唯一来源。

不把经历文字复制到 JSX，不建立第二份手工内容，不改变 parser 的 metadata order。

### 12.3 Route protection

构建后验证：

- 所有公开 route 都生成静态页面。
- canonical URL 不变。
- sitemap 和 robots 行为不变。
- GitHub Pages trailing slash 行为不变。
- 页面 title 和 description 不变。

### 12.4 必跑验证命令

开工前记录精确基线 commit，不要用会随时间移动的 branch 名代替：

```powershell
$env:REDESIGN_BASE_SHA = (git rev-parse HEAD).Trim()
git status --short
```

本地实现期间，即使尚未 commit，也要直接检查 protected working-tree files：

```powershell
git diff --exit-code -- app/education/page.tsx app/now/page.tsx app/past-experience/page.tsx 'app/past-experience/[slug]/page.tsx' app/past-experience/components/ExperienceDomainPage.tsx app/lib/content/experience.ts content/past-experience/archive-through-2026-06-30.md
git diff --cached --exit-code -- app/education/page.tsx app/now/page.tsx app/past-experience/page.tsx 'app/past-experience/[slug]/page.tsx' app/past-experience/components/ExperienceDomainPage.tsx app/lib/content/experience.ts content/past-experience/archive-through-2026-06-30.md
```

实现和测试更新完成后：

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:artifact
npm.cmd run check
npm.cmd audit --audit-level=moderate
npm.cmd audit --omit=dev --audit-level=moderate
```

如果之后获得授权并形成 commit，再运行仓库的 commit-range protection：

```powershell
$env:BASE_SHA = $env:REDESIGN_BASE_SHA
npm.cmd run check:protected-sources
```

`BASE_SHA is required` 只表示调用时缺少环境变量，不表示代码有缺陷。任何 protection failure 都必须通过恢复受保护文件解决，不能修改保护脚本或测试来规避。

## 13. 实施阶段

### Phase 0：设计确认与基线冻结

1. 将本手册作为最终实施基线。
2. 将已确认的 `Menu` / `Close` 写入 visible copy allowlist。
3. 截取当前站点 desktop 和 mobile 基线。
4. 截取 Cognition 参考区域，记录宽度、网格、字体和间距。
5. 生成 visible copy manifest。

输出：无代码视觉歧义、无内容歧义的开工基线。

### Phase 1：Cognition shell 高保真骨架

1. 建立颜色、字体、grid 和 rule tokens。
2. 重建 desktop rail。
3. 重建 mobile menu。
4. 先用 Home 正文验证 3/12 比例。
5. 在 1280、1440 和 390 宽度进行视觉对比。

输出：没有散点动效时，也已经像一个成熟的 Cognition 式站点。

### Phase 2：Dithered Entrance

1. 先做静态双行 mask。
2. 验证 `THEODORE` 与 `OUYANG` 同时清楚可读。
3. 加 pointer repel。
4. 加 pointer release ripple。
5. 加 idle RAF 停止机制。
6. 加 reduced motion 与 fallback。

输出：一个稳定、可识别、不过度表演的个人入口。

### Phase 3：逐页视觉映射

顺序：

1. Home
2. Education
3. Past Experience directory
4. 一个代表性 domain page
5. 其余四个 domain page
6. Current Chapter
7. Not Found

每完成一页立即运行 copy manifest 检查，不等到最后一起检查。

Education、Past Experience、五个 domain page 和 Current Chapter 只通过 `SiteShell` 与全局 CSS 进入新网格，受保护 page source 保持 byte-for-byte 不变。

### Phase 4：旧视觉退出

1. 移除旧 particle imports。
2. 移除旧深蓝和 glass CSS。
3. 检查 Shantell Sans 是否仍被使用。
4. 检查 Three.js 是否仍被使用。
5. 只清理确认无引用的文件和依赖。

### Phase 5：质量验证

一次批量检查：

- Desktop：1280 × 720、1440 × 900
- Mobile：390 × 844
- Keyboard navigation
- Reduced motion
- Canvas failure fallback
- Long course names
- Long Past Experience metadata
- Static export
- Lighthouse

发现问题后批量修复，再做一次最终确认，不进行无止境微调。

### Phase 6：发布

发布必须单独授权。完成本地实现与验证不自动意味着可以 push、开 PR 或部署 GitHub Pages。

## 14. 验收标准

### 14.1 第一印象

- 打开 Home 的第一屏只看到白色散点入口。
- `THEODORE` 与 `OUYANG` 从第一帧同时存在。
- 入口没有旧版星空、深蓝、glass nav 或 looping words。
- 向下滚动后才进入 Cognition shell。

### 14.2 Cognition 忠实度

- Desktop 明确呈现 3 列 rail + 12 列正文。
- 背景接近 `#f7f6f5`，不是纯白也不是奶油黄。
- 内容边界线为极淡 1px hairline。
- H1、body、nav 的视觉比例与测量规格一致。
- 导航 active 使用细竖线和蓝色文字，不使用 pill。
- 页面没有 card wall、阴影和装饰性 grid。

### 14.3 Theodore 内容完整性

- 四个主导航文字和路径全部不变。
- 五个 Past Experience 子路由全部不变。
- 所有现有文字逐项通过 manifest。
- Education 课程数量和顺序不变。
- Past Experience 仍从 Markdown archive 解析。
- Home bio、credentials 和 coordinates 全部仍可见，portrait 按最新确认移除。

### 14.4 动效

- pointer repel 可被打断并自然恢复。
- pointer release ripple 不阻止滚动。
- idle 时 RAF 停止。
- reduced motion 时显示稳定静态字标。
- 正文没有多余 scroll reveal 和连续环境动效。

### 14.5 性能

- Home 首次加载不依赖视频或大型 WebGL bundle。
- Canvas DPR 有上限。
- resize 不造成连续重算。
- CLS 小于 0.1。
- INP 目标小于 200ms。
- LCP 目标小于 2.5s。

### 14.6 无障碍

- canvas 信息有等价可访问文字。
- skip link 继续有效。
- keyboard 可到达全部导航和链接。
- mobile menu 可关闭并正确管理 focus。
- focus ring 清晰。
- 文字与背景达到 WCAG AA。

## 15. 下一次实施建议启用的 skills

### 第一阶段：设计与实现

只启用：

1. `design-taste-frontend`
2. `impeccable`
3. `emilkowalski-animate`

用途：

- `design-taste-frontend` 负责防止成品退回模板化 portfolio。
- `impeccable` 负责高保真页面结构、响应式、无障碍和最终视觉闭环。
- `emilkowalski-animate` 负责散点入口的动效目的、曲线、打断和 reduced motion。

同时使用浏览器插件进行 Cognition 对照和本地页面视觉 QA。

### 第二阶段：最终动效审查

实现完成后，再单独启用：

1. `emilkowalski-review-animations`

它是审查 skill，不应与第一阶段同时开启来干扰实现方向。

### 不需要启用

- `gpt-taste`：它偏向 AIDA、巨型字体、GSAP ScrollTrigger 和大跨度 scrolltelling，与本项目的 Cognition 克制结构冲突。
- `emilkowalski-animate-expo`：本项目不是 Expo。
- `emilkowalski-apple-design`：本项目不是 Apple 式材质或手势界面。
- `emilkowalski-ask-sonner`：没有 toast。
- `emilkowalski-pick-ui-library`：不需要新增 UI library。
- `emilkowalski-write-swift`：不涉及 Swift。
- `emilkowalski-animation-vocabulary`：交互名称已经明确。
- `emilkowalski-find-animation-opportunities`：本项目需要减少正文动效，不需要寻找更多机会。
- `emilkowalski-improve-animations`：当前阶段已经有明确动画规格。
- `emilkowalski-prototype`：除非 Theodore 下一步明确要求比较多个字标版本，否则不启用。
- `GitHub`：本地实现阶段不需要；只在用户要求提交、PR 或发布时启用。

## 16. 交给下一位 AI 的开工指令

> 在不修改任何现有文字、公开路由、metadata、Past Experience 数据源和内容顺序的前提下，将 `130U.github.io` 的视觉世界完整替换为本手册定义的 Cognition Replica Shell。Home 顶部先实现一个独立的 100dvh 白色 Dithered Entrance，点阵从第一帧同时构成 THEODORE 与 OUYANG，支持 pointer repel、release ripple、idle RAF stop、reduced motion 和静态 fallback。入口之后再开始 Cognition 式 3/12 desktop shell。所有内页直接使用该 shell，不重复入口。移动端使用已确认的 `Menu` 和 `Close`，并将它们作为唯二新增可见文字写入 copy allowlist。先冻结 visible copy manifest，再做 shell，再做 entrance，再逐页迁移。不要复制 Cognition 的 logo、文字、客户素材、CSS、字体文件或源代码。不要加入旧版深蓝、玻璃导航、持续星空、GSAP scrolltelling、卡片墙或其他新文案。发布动作必须另行获得授权。

## 17. 最终目标画面

访客打开网站时，看到的不是一份普通简历，也不是一个炫技粒子背景，而是一枚安静、可触碰、能自然恢复的 Theodore 点阵字标。

向下滚动后，表演结束。页面进入稳定的白色网格、精确的左侧导览、克制的大标题和清楚的履历阅读系统。此后每一页都像同一本严谨出版物的不同章节。

这个网站最终应该留下两层印象：

1. Theodore 有自己的视觉记忆点。
2. Theodore 有能力用成熟的结构承载复杂经历，而不是依赖装饰制造专业感。
