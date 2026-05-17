# mini-stock — Design Handoff (v4)

> 多档案家庭股票追踪 App 的设计稿。v4 完整版,已通过工程侧 lint:tokens 合约审核,可直接交稿。

---

## v4 更新摘要

本轮关闭了 `uploads/REVISIONS.md` 全部修订单 + `FEEDBACK-v3.md` 全部 P0/P1/P2 反馈。

- **P0** 工程阻塞已解锁:全部 hex / 半 pt 字号 / 裸 fontWeight 替换为 token,新增 8 个 `--acct-*` · 15 个 `--gics-*` · 3 个 `--on-*` 字色 token + 5 个新 typography role
- **P1** 8 个补漏画板:MarketStatusStrip 4 态、PIN Entry 3 态、Dashboard 收起态、Overflow 对齐、Trade 错误态
- **P2** 13 个提前交付画板:Mac Market 四子页、Symbol 成本线、Trade 重复/批量、事件详情、Onboarding 5 屏、Privacy L2

> 详见 `CHANGELOG.md`,每个画板的 ID / 文件 / 闭合的反馈编号都有记录。

---

## 快速开始

直接在浏览器打开 **`index.html`** 即可查看全部设计稿。

- 顶部工具栏右侧 **Tweaks** 按钮可切换图表样式、Watchlist 行布局、排序模式、隐私模式
- 画布支持拖拽、缩放、全屏聚焦单个画板(双击)、拖动重排
- 不需要安装任何依赖,React + Babel 走 CDN

要交付给工程团队时,把整个文件夹打包发给他们 + 这份 README 即可。

---

## 文件清单

### 工程入口
| 文件 | 说明 |
|---|---|
| `index.html` | 入口页面,按顺序加载所有 babel 脚本 |
| `styles.css` | **设计令牌的唯一权威来源**。R-T0 合约的全部 RGB-triple 颜色 / 半 pt 字号 / tracking / hairline / Inter Variable 字体声明 |
| `app.jsx` | 设计画布配置 — 把每一块设计作为 `<DCArtboard>` 挂在带标题的 `<DCSection>` 里;底部的 `<TweaksPanel>` 暴露全局调节项 |

### 数据层
| 文件 | 说明 |
|---|---|
| `data.jsx` | 假数据:18 个 symbol,3 个 profile(Sam / Mom / Dad),4 个账户。所有派生指标(净值、当日 P/L、配置)按 profile 隔离计算 |

### 组件
| 文件 | 说明 |
|---|---|
| `components.jsx` | 基础组件:`Sparkline`、`PriceChart`(area/line/candle)、`AllocationDonut`、`KindPill`、`Icon` 图标库(40+ SF-symbol 风格手画 SVG)、`StatTile`、`Skeleton`、`Banner` |
| `surfaces.jsx` | 通用菜单/弹窗 — Apple 风 `Popover`、`MenuRow`、Watchlist 上下文菜单、Yahoo 风 portfolio 菜单、`SortSheet`、`Settings`、Yahoo 隔夜指示 `Overnight` |
| `tweaks-panel.jsx` | 设计画布右下角的 Tweaks 面板组件库 |
| `design-canvas.jsx` | 画布外壳(starter component) |

### 设计稿(按主题分文件)
| 文件 | 说明 |
|---|---|
| `screens-ios.jsx` | iOS v1:旧 5-tab 时代的 Dashboard / Watchlist / Symbol / Trade / Account。保留用于对比 |
| `screens-mac.jsx` | macOS v1:旧版同上 |
| `screens-home-v2.jsx` | **R-N1** Home 整合版(iOS + Mac)— 新版 4-tab IA 的首页,Yahoo 风。`ProfileChip`、`Eyebrow`、`NavHeaderV2`、`MarketStatusStrip`、`NetWorthHero`、`AccountsRibbon`、`UniRow`(同时表达持有 + 关注两种态)、`SEC` section accent palette、`ACCT_COLORS` 账户色板 |
| `screens-v2-portfolio.jsx` | **R-N2** Portfolio Fidelity 风 — iOS Positions 视图,Symbol detail v2 带粘性 Trade CTA |
| `screens-v3-tabs.jsx` ⭐ | **R-N2 / R-N3 续作** — Portfolio Summary/Activity/Balances + Account Selector + Overflow Menu(iOS & Mac),Market Trending/ETF/News(iOS),Mac Sector Heatmap |
| `screens-v2-market.jsx` | **R-N3** Market Overview(iOS + Mac),iOS Me tab,3 个 state overlay |
| `screens-profiles.jsx` | **R-P0–P7** 多档案系统全套:`profileRgb` helper、`ProfileAvatar`、`ProfileBadge`、`HouseholdHero`、9 个 profile 相关画板 |
| `screens-interactions.jsx` | **R-I1 / R-I2 / R-S1** 图表 crosshair、Trade 字段状态、numpad、剩余 state overlays |
| `screens-flows.jsx` | **R-SC2 / R-I5 / R-I4 / R-I3** CSV 导入向导(4 步)、⌘K 命令面板、iOS 全屏搜索、大标题坍缩(Home)、滑动操作、长按菜单、下拉刷新 |
| `screens-v3-misc.jsx` ⭐ | **R-I3 / R-P1 / R-P3 / R-P5 / R-P6 / R-N4 / R-SC5 / R-A2** 剩余画板:Watchlist/Portfolio 坍缩态、状态栏档案 chip 特写、Profile PIN 设置、档案切换警告、Trade-from-Symbol、Mac 切换过渡帧、Mac 家庭聚合视图、Mac 单 symbol 跨档案分解、iPad Home、Mac 紧凑 Watchlist、Mac 键盘焦点 |
| `screens-v4-feedback.jsx` ⭐ | **FEEDBACK-v3.md 全部** P0 账户色板选择器 + P1 4 画板 + P2 13 画板。token-first 编写,无清理债务 |

### 文档
| 文件 | 说明 |
|---|---|
| `design-spec.html` | 设计规范的原始单页文档(令牌表 / 字体 / 组件清单等) |
| `uploads/REVISIONS.md` | v1 → v2 的完整修订单(产品决策来源) |
| `CHANGELOG.md` | 本轮修订改了哪些文件、添了哪些画板 |
| `README.md` | **这个文件** |

---

## 设计系统要点

### 1. 颜色 token(R-T0.a)
全部颜色以 RGB triple(空格分隔)存储,不带 `rgb()` 外壳:

```css
--up:    52  211 153;   /* 涨绿 */
--down:  251 113 133;   /* 跌红 */
--mint:  107 232 184;   /* 品牌 */
```

**消费方式**(强制):
- CSS: `color: rgb(var(--up));` · `background: rgb(var(--up) / 0.18);`
- Tailwind v4: `text-up` · `bg-up/20`(自动展开 `<alpha-value>`)
- 禁用 hex 字面值出现在组件代码里

### 2. 字号 token(R-T0.b)
按**角色**命名,不按尺寸命名 — 防止工程随便挑错号:

```css
--t-meta:        10.5px  /* 大写元数据 */
--t-eyebrow:     11.5px  /* section eyebrow */
--t-row:         14px    /* 表格行 */
--t-row-strong:  16px    /* StockRow symbol */
--t-h:           22px    /* 小标题 */
--t-h-2:         26px    /* symbol 详情 */
--t-display:     32px+   /* hero 大数字 */
```

对应 utility class 在 `styles.css` 内 `.t-*`(已实现)。**禁用** `text-[13.5px]` 之类的任意值。

### 3. 表面层级(R-T1 / R-V1)
5 级表面 + hairline 材料:
| 层级 | token | 用途 |
|---|---|---|
| page | `--bg` | 整页底色 |
| bar | `--bg-elev` | 状态栏 / 导航 / 侧边栏 |
| card | `--surface-1` + `--hairline-top` | **默认数据卡片** |
| hero | `--surface-1` + `--hairline-top` + `--hero-grad-*` | net worth、symbol 价格大块 |
| inset | `--surface-2` + `--hairline-bottom` | 输入框、segmented、chip 容器 |
| active | `--surface-3` | 选中态、hover 行 |
| modal | `surface-1@98%` + 大投影 | sheet、popover、alert |

每个 `radius ≥ 12` 的卡片**必须**加 `box-shadow: var(--hairline-top)`。

### 4. 档案色板(R-P2)— 关键安全特性
8 种独立 accent。当前激活档案绑定到 `--current-profile`,以此调亮:
- 侧边栏 3px 左条
- NavHeader 档案名颜色
- 主 CTA 背景(Save / Add / Record Trade)
- iOS TabBar 激活态(仅 Home + Portfolio)

**优先级**:`semantic (up/down) > profile (chrome + CTAs) > section (eyebrows)`。绿涨红跌**永远**用 `--up` / `--down`,与档案无关 — 颜色语义不能被档案颠覆。

### 5. Section accent(R-T3)
4 种,**只用于** eyebrow + 24×1px 下划线,不染卡片:
```
--sec-portfolio  mint     #6BE8B8   组合 / 账户
--sec-watchlist  sky      #7AB6FF   关注列表
--sec-symbol     lavender #C9B6FF   symbol 详情
--sec-activity   amber    #FFC176   交易 / 新闻
```

### 6. 账户色板(R-N2.b)
另一套 8 色(柔和、与档案色板有意区分),用于:
- Home AccountsRibbon 顶部色条
- Portfolio Positions 表格行左边 stripe(All accounts 模式)
- Symbol detail 内 MyPosition 行
- Trade Sheet 账户下拉 swatch

---

## IA(信息架构)v2

```
operator (一个人)
└── profile (多档案,如 Sam / Mom / Dad / __all__ 虚拟聚合)
    ├── Home          首页 - Yahoo 风,单页滚动看完家庭"今天怎么样"
    ├── Portfolio     组合 - Fidelity 风,4 子页 (Summary · Positions · Activity · Balances)
    ├── Market        市场 - Yahoo 风,与档案无关 (Overview · Stocks · ETF · News · Sectors)
    └── Me            设置 - 档案管理 / 外观 / 隐私 / 数据 / 市场源 / App
```

**没有中央 FAB**。Trade 入口走上下文路径:
1. Symbol detail 底部粘性 "Trade" 按钮(主路径)
2. Portfolio "…" overflow menu(次)
3. Home "…" overflow menu(三)

Trade Sheet 全部走 R-P3 的"3 行 profile-attributed header" — 防止跨档案误下单。

---

## Tweaks panel

`app.jsx` 顶部 `TWEAK_DEFAULTS`(被 `EDITMODE-BEGIN/END` 标记包裹,可被设计编辑模式持久化):

```js
{
  "chartStyle": "area",      // 图表类型
  "rowLayout":  "apple",     // StockRow 布局
  "sortMode":   "Manual",    // Watchlist 排序
  "privacy":    false        // 隐私模式
}
```

后续可按 REVISIONS.md `tweaks_panel_v2` 扩展 `heroGradient` / `elevation` / `sectionEyebrows` / `stateOverlay` 等开关。

---

## 工程对接建议

1. **先落地 R-T0 合约**(令牌格式) — 一切其他工作的硬前置
2. **R-N0–N6 + R-P0–P3 并行** — IA 与多档案是平级 blocker,所有屏幕的形状都依赖它们
3. **R-T1 / R-T2 / R-V1 / R-V2** — 一次性改完表面层级 + 分组节奏
4. **R-S1** — 9 个 state overlay,工程拿来做 Storybook
5. **R-I1** — 图表 crosshair,也是 Market 多线图复用的核心
6. 之后按 REVISIONS.md `priority_order_for_implementation` 推进

详细的 ESLint / stylelint 规则建议见 REVISIONS.md 的 R-T0.g 表。

---

## 联系 & 反馈

- 修订需求请直接编辑 `uploads/REVISIONS.md` 并标记位置(R-X / U-Y 编号)
- 视觉评审走 `index.html` 顶部的"Assets" 面板,逐画板批准 / 退回
- 单画板专注查看:在画布上双击任一卡片进入全屏 overlay
