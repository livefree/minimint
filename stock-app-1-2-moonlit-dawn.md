# 个人美股投资追踪应用 — 实施计划

## Context

**问题与目标**: 用户希望有一款轻量、跨端（macOS + iOS）使用的个人美股投资追踪工具，集成实时/历史行情、自选清单、持仓与交易记录、盈亏与分红统计、丰富图表。当前项目目录为空白，需要从零起步。

**形态选择**: 用 **Next.js 15 (App Router) + PWA** 一份代码同时覆盖 macOS（浏览器 / 添加到 Dock）和 iOS（添加到主屏幕，全屏体验接近原生）。不引入 Swift / React Native，符合"不要太重"的诉求；跨设备通过云数据库自然同步，不强求实时。

**关键决策汇总**:
| 维度 | 选择 | 理由 |
|---|---|---|
| 前端框架 | Next.js 15 (App Router) + TypeScript | 全栈一体，部署简单，SSR + API Route 都在一个项目 |
| UI 库 | Tailwind v4 + shadcn/ui | 组件抄过来就能用，主题易切换 |
| 图表 | TradingView `lightweight-charts` + `recharts` | 前者画 K 线非常专业，后者画饼图/柱状图轻量 |
| 数据库 | **Neon Postgres** (Serverless) | 用户已可访问 Neon MCP；免费层足够个人使用；跨设备自动"同步" |
| ORM | Drizzle ORM | 类型推导好、迁移轻量 |
| 行情 API | **Finnhub** (实时报价 60/min) + **yahoo-finance2** npm（历史 K 线、分红、拆股，无限速但非官方） | 用户已选定的组合 |
| 数据获取 | TanStack Query (React Query v5) | 缓存 + 重试 + 后台刷新 |
| 部署 | Vercel | 与 Neon 零运维组合，免费够用 |
| PWA | `next-pwa` 或手写 manifest + service worker | iOS 主屏图标 + 离线壳 |
| 认证 | 单密码登录 (BetterAuth 或自建 cookie + bcrypt 校验环境变量哈希) | 数据敏感但单用户，避免引入 Clerk/NextAuth 复杂度，未来要多用户再升级 |

## 架构概览

```
[Browser / PWA on iOS+macOS]
        │
        ▼
[Next.js App Router]
  ├─ /app  ── React Server Components + Client Components
  ├─ /api  ── Route Handlers (quotes proxy, mutations, jobs)
  └─ /lib  ── DB (Drizzle), market data adapters
        │
        ├──► Neon Postgres (持仓 / 交易 / watchlist / 缓存)
        ├──► Finnhub REST API (实时报价、公司信息)
        └──► yahoo-finance2 (历史 K 线、分红、拆股)
```

## 数据模型 (Drizzle schema)

存放于 `db/schema.ts`：

- `securities` — `symbol` (PK), `name`, `exchange`, `currency`, `type` ("EQUITY" | "ETF")
- `watchlists` — `id`, `name`, `sort_order`, `created_at`
- `watchlist_items` — `watchlist_id`, `symbol`, `added_at` (复合 PK)
- `accounts` — `id`, `name` (e.g. "Fidelity 个人"), `currency`, `created_at`
- `transactions` — `id`, `account_id`, `symbol`, `kind` ("BUY" | "SELL" | "DIV" | "SPLIT" | "FEE" | "CASH"), `quantity` (numeric), `price` (numeric), `fees` (numeric), `executed_at`, `note`
- `quote_cache` — `symbol` (PK), `price`, `prev_close`, `day_high`, `day_low`, `volume`, `updated_at`（限流保护）
- `prices_daily` — `symbol`, `date`, `open`, `high`, `low`, `close`, `adj_close`, `volume`（复合 PK；首次加载后增量更新）
- `dividends` — `symbol`, `ex_date`, `amount`（用于历史分红 + 个人分红统计）

**持仓 / 盈亏由 transactions 推导**，不存快照表，确保单一事实源。计算函数放 `lib/portfolio.ts`，默认采用**加权平均成本**法（也可以加 FIFO 选项）。

## 交互与视觉 — "App-like" 规范

目标：在浏览器里复刻 iOS / macOS 原生应用的手感，让 PWA 装到主屏后没有"网页味"。这一节是交给设计 agent 时的硬性约束。

### UX 对标 (Source of Truth)

整套 UX 显式沿用以下两套成熟产品，设计 agent 在出稿时应直接参考：

1. **Apple Stocks (iOS / macOS)** — 主要参考。负责导航骨架、字体、颜色、卡片节奏、图表交互、触觉。
2. **Yahoo Finance (iOS / Web)** — 辅助参考。负责更丰富的数据密度、tab 化的个股详情（Statistics / Holders / Financials / Analysis 风格分段）、新闻流呈现、组合业绩对比图。

**默认遵循 Apple HIG**；当 Apple Stocks 没有覆盖的功能（持仓管理、交易录入、多账户、CSV 导入、业绩对照），按 Yahoo Finance 的形态做，但视觉风格保持 Apple 化（圆角、blur、SF 字体、系统色），避免拼贴感。

#### 沿用 Apple Stocks 的具体模式

- **Large Title 导航**：页面顶部大字标题，下滚时折叠为常规 NavBar 标题（iOS 标准行为）。
- **List 间切换**：顶部一行可横滑的 list chips（"@Watchlist"、"我的持仓"、"科技股"），当前项加粗 + 下划线，与 Apple Stocks 顶部分类条一致。
- **股票行 (StockRow)** 复刻 Apple Stocks：
  - 左：symbol 粗体 18pt + 公司名 13pt 次要色（两行）
  - 中：迷你日内 sparkline，整日数据，红绿单色，无网格
  - 右：当前价（17pt tabular-nums）+ 下方一个**填充圆角胶囊** "+1.23%" 或 "-2.34%"（这是 Apple Stocks 标志性元素，胶囊背景即语义色，文字白色，圆角 6px）
  - 行高 ~64px，分隔线极浅或省略
- **个股详情**:
  - 顶部超大价格（34–44pt SF Pro Display semibold），下面"+1.23 (+0.56%) 今天"
  - 默认 **Mountain (area) chart** 带渐变填充（Apple Stocks 默认形态），蜡烛作为可切换的次级模式
  - 时间段水平 scrollable bar：`1D | 1W | 1M | 3M | 6M | YTD | 1Y | 2Y | 5Y | 10Y | ALL`（完全按 Apple Stocks 顺序）
  - 触摸/光标拖过图表时显示横线 + 时间气泡 + 价格气泡，**触觉 light tap**
  - 图表下方 **horizontal scroll 的 stat tiles**（Open / High / Low / Vol / Avg Vol / 52W High / 52W Low / Mkt Cap / P/E / Yield / Beta / EPS），每片是小卡片，左对齐标签 + 右对齐数字
  - 再下方 News 卡片瀑布（Apple Stocks 风格：大缩略图 + 标题 + 来源 + 时间）
- **TabBar**：底部 SF Symbols 风格图标 + 文字（≤12pt），活动项强调色 (Apple Blue `#0A84FF` 暗 / `#007AFF` 浅)。
- **Context Menu (长按)**：弹出半透明 blur 卡片 + 预览缩略图 + 动作列表（详情 / 加入持仓 / 移除 / 分享），与 Apple Stocks 长按 watchlist 项的行为一致。
- **Sheet (底部抽屉)**：支持 iOS 风格 `detents`（medium / large 两档），顶部小灰条 grabber，下拉关闭带阻尼。
- **触觉**：切换时间段、长按、保存交易都触发 `navigator.vibrate(10)`（iOS Safari 实际不响应，但 Chrome on Android 会；保留代码为未来）。

#### 沿用 Yahoo Finance 的具体模式

- **个股详情 Sub-tabs**：在主图表 + stat tiles 之后，提供 `概览 / 财务 / 统计 / 分红 / 持有人 / 新闻` 顶部分段（Yahoo 风格），但 v1 只实现 `概览 / 我的持仓 / 分红 / 新闻`，其余 placeholder。
- **持仓表的数据密度**：列可配置（Yahoo 的"自定义列"），默认列 = 数量 / 成本价 / 现价 / 市值 / 日内盈亏 / 累计盈亏 / 占比。表头点击排序，长按列拖动改顺序。
- **业绩对比图**：账户净值曲线叠加 SPY / QQQ 基准线（Yahoo Finance Portfolio 的对比模式），可勾选基准。
- **新闻聚合**：每条卡片显示 thumbnail + headline + publisher + relative time + tickers chip（Yahoo 风格元数据条）。

#### 视觉色板（Apple 系统色，深色优先）

```
--bg            #000000        (深) / #F2F2F7 (浅)   ← iOS systemGroupedBackground
--surface-1     #1C1C1E        / #FFFFFF             ← secondarySystemGroupedBackground
--surface-2     #2C2C2E        / #F2F2F7             ← tertiary
--separator     rgba(84,84,88,0.65) / rgba(60,60,67,0.29)
--text-primary  #FFFFFF        / #000000
--text-secondary rgba(235,235,245,0.6) / rgba(60,60,67,0.6)
--accent        #0A84FF        / #007AFF             ← systemBlue
--up            #30D158        / #34C759             ← systemGreen
--down          #FF453A        / #FF3B30             ← systemRed
--up-bg         rgba(48,209,88,0.18)                 ← 涨胶囊填充
--down-bg       rgba(255,69,58,0.18)                 ← 跌胶囊填充
```

#### 字体

- 优先级：`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif`
- 大数字用 `SF Pro Display` semibold；正文用 `SF Pro Text`；所有数字 `font-variant-numeric: tabular-nums`，金额 / 价格永不跳位。
- Web 字体不自带 SF Pro（Apple 授权限制），靠系统 fallback；非 Apple 平台优雅降级到 Inter。

#### 图标

- 使用 [Lucide](https://lucide.dev) icon set，挑选与 SF Symbols 视觉近似的 line 风格（粗 1.5px，圆 stroke linecap）。
- 关键 tab 图标参考 Apple Stocks: `chart-line` (Home) / `eye` (Watchlists) / `plus-circle` (Trade) / `wallet` (Accounts) / `user-circle` (Me)。

### 整体导航骨架

- **iOS / 窄屏 (≤ 768px)**: 顶部仅显示当前页标题 + 上下文按钮；底部固定 **TabBar**（5 个 tab：Home / Watchlists / Trade / Accounts / Me），SafeArea 自动 padding。
- **桌面 / 宽屏 (≥ 1024px)**: 左侧固定 **Sidebar**（同样 5 项 + 收起按钮），顶部命令栏（全局搜索 ⌘K、刷新、主题切换）。
- **中等屏 (769–1023px)**: 左侧 icon-only Rail。
- 当前 tab 高亮采用"圆角胶囊"背景，切换有 200ms `ease-out` 透明度 + Y 轴位移过渡。

### 页面切换与手势

- 路由切换使用 `framer-motion` 的 `AnimatePresence`：进入 `x: 100%` → `0`，退出反向（仅在二级页 ↔ 详情页之间生效，TabBar 之间是淡入淡出避免方向感冲突）。
- **iOS 边缘左滑返回**：监听 `touchstart` 在屏幕左 20px，水平拖动 > 60px 触发 `router.back()`，过程跟手位移给反馈。
- 下拉刷新：列表页顶部 `pull-to-refresh`，到阈值触发 `refetch()`，带橡皮筋阻尼。
- 长按上下文菜单：watchlist 行 / 持仓行长按 0.5s 弹出 actionsheet（删除 / 置顶 / 移到其它 list）。
- 卡片点击有 `scale: 0.98` 的按压反馈（`whileTap`）。

### 视觉系统（补充）

- **暗色为默认**，跟随系统切换；色板见上方 Apple 系统色定义。
- **圆角**：卡片 14px（iOS continuous corner），按钮 12px，输入框 10px，胶囊 999px。
- **阴影**：暗色模式几乎不用阴影，靠 `--surface-1/2` 层级 + 极轻 `1px` 顶部内描边 (`inset 0 0.5px 0 rgba(255,255,255,0.06)`) 提供质感；浅色模式用 `0 1px 2px rgba(0,0,0,0.04)`。
- **Frosted blur**：固定 TabBar、Sheet 头部、Context Menu 用 `backdrop-filter: blur(30px) saturate(180%)` + 半透明背景，与 iOS Material 一致。
- **触达**：所有可点元素 ≥ 44×44pt。
- **Loading**：用 skeleton（行情数字位、图表占位）而非 spinner；价格初次加载占位用细横条。
- **Empty / Error**：参考 iOS HIG，用 SF Symbol 风格大图标 (lucide outline 64px) + 标题 + 一句副文案 + 主 CTA。

### 设计 Token（交给 Claude Design 时直接使用）

```
spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48
radius:  sm 8 / md 12 / lg 16 / xl 24 / pill 999
type:    display 32-700 / title 22-600 / body 16-400 / caption 13-500 / mono-num 16-500 tabular
motion:  fast 150ms / base 220ms / slow 320ms — all ease-out
elevation: card / sheet / modal (差异通过 surface 色与 blur 实现)
```

### PWA / iOS 适配细节

- `<meta name="apple-mobile-web-app-capable" content="yes">`，状态栏 `black-translucent`
- 主屏图标含 maskable 与圆角两套（iOS 自动裁剪外圈，maskable 给 Android）
- 启动屏（splash）按 iPhone 各尺寸预生成
- `viewport-fit=cover` + `env(safe-area-inset-*)` 处理刘海与底部 home indicator
- 禁用浏览器的拖拽选中长按图片菜单（除非在交易表单等编辑场景）

---

## 功能与页面 — 详细方案

> 每个页面包含：信息架构、状态、组件清单、关键交互、空/错状态、性能策略。

### 1. Dashboard `/`（首页）

**目的**: 30 秒内回答"我整体怎么样、今天怎么样、我该看哪只股"。

**信息架构 (从上到下)**:

1. **Header**: 问候语 "晚上好" + 当前日期；右上角通知/设置 icon。
2. **NetWorthCard (主卡)**: 总市值（大字），今日浮动 ▲ $1,234.56 (+1.23%)；底部一行小字"已实现 +$XXX · 累计分红 $XXX"。点击展开净值曲线弹出层。
3. **NetWorthSparkline**: 24h / 1W / 1M / 3M / 1Y / All 分段切换的迷你曲线（lightweight-charts area mode），背景渐变绿/红表示区间涨跌。
4. **TodayMoversStrip**: 横滑卡片，自己持仓中今日涨跌最猛的 5 只，每张卡显示 symbol、价、涨跌幅、迷你 day-spark。
5. **AllocationDonut**: 资产配置环形图（个股 / ETF / 现金），点击切换"按行业"视图。
6. **AccountsSummaryList**: 各账户一行，左 logo + 名 + 币种，右市值 + 今日盈亏色块。
7. **RecentActivity**: 最近 5 条交易记录（带 BUY/SELL pill）。
8. **NewsRail (可选 v2)**: 自己持仓相关新闻流。

**状态**:
- 加载：所有数字位 skeleton；曲线骨架占位。
- 空（没交易 / 没账户）：插画 + "添加你的第一个账户" CTA。
- 离线 / API 失败：顶部黄色 banner "实时报价不可用，显示最近缓存（10 分钟前）"。

**关键交互**:
- 顶部下拉刷新整页。
- AllocationDonut 长按某扇区高亮 + 显示明细。
- NetWorthCard 点击切换"显示金额 / 显示百分比"。
- 隐私模式（眼睛 icon）一键把所有数字换成 `••••`，公共场合用。

**性能**:
- 服务端 RSC 预取持仓汇总（直接查 DB），实时报价客户端 hook 异步覆盖。
- Sparkline 数据按日聚合，单 symbol 最多 365 点。

---

### 2. Watchlists `/watchlists`

**目的**: 看自选股的现价与变动。

**信息架构**:

- **顶部**: 横向滚动的 list 切换 chip（"我的关注" / "美股科技" / "ETF" / "+ 新建"）。当前 list 名旁边显示 N 只。
- **工具条**: 搜索框 + 排序下拉（涨跌幅 / 字母 / 自定义） + 多选按钮（进入编辑态后可批量删除/移动）。
- **股票行 (StockRow)** — 这是核心组件：
  - 左：symbol（粗）+ 公司名（次要）+ 行业小标签
  - 中：迷你日内 sparkline（30 分钟一根，红/绿）
  - 右：价格（tabular-nums）+ 涨跌（▲/▼ 颜色 + 金额 + 百分比 pill）
  - 行高 64px；点击进详情；左滑露出"加入持仓 / 移除"快捷动作（iOS 风格 swipe）

**状态**:
- 加载：8 行 skeleton。
- 空 list：插画 + 搜索框 + "搜索一只股票加入"。
- 搜索结果下拉：实时联想，显示 symbol / name / 交易所 / 已在 list 标记。

**关键交互**:
- 拖拽排序（按住右侧 grip icon，整行抬起 + 阴影）。
- 长按行：弹 actionsheet（详情 / 添加交易 / 设置提醒 / 移除）。
- 创建 list：弹底部 sheet，输入名 + 选颜色 + 可选模板（"美股大盘"=SPY/QQQ/DIA 预填）。

**性能**:
- 报价用 TanStack Query，`staleTime: 30s`，`refetchInterval: 盘中 30s / 盘后 5min`（基于美东时间判断）。
- 一次批量拉取该 list 所有 symbol 的 quote（Finnhub 没有 batch，需要后端 fan-out + 30s 缓存）。

---

### 3. Symbol 详情 `/s/[symbol]`

**目的**: 看个股价格走势、关键指标，决策买卖。

**信息架构（垂直滚动）**:

1. **Hero**: 公司 logo + symbol + 公司名；当前价大字；今日涨跌；交易所/币种小字。右上角"加入 watchlist" / "记录交易"两个 icon button。
2. **PriceChart (核心)**: TradingView lightweight-charts 蜡烛图，高度自适应（移动 320px / 桌面 480px）。
   - 顶部 range 切换：`1D / 1W / 1M / 3M / 1Y / 5Y / Max`
   - 类型切换：蜡烛 / 折线 / Mountain（面积）
   - 叠加：MA 20/50/200 toggle、成交量副图 toggle
   - 十字光标显示 OHLC tooltip，跟手指/光标
   - 横屏自动全屏（移动端）
3. **KeyStatsGrid**: 2 列 / 3 行的小卡片矩阵 — 市值、PE TTM、EPS、52w 高、52w 低、股息率、Beta、平均成交量。
4. **MyPositionCard**（如果持有）: 持仓数、平均成本、未实现盈亏、占组合比例；CTA "查看交易记录"。
5. **TransactionsHere**: 我在此股的所有交易（mini 表，可滚动）。
6. **DividendHistory**: 近 8 期分红柱状图（recharts），含除权日 + 金额。
7. **CompanyInfo**: CEO、员工数、总部、行业、简介（可展开），数据来自 Finnhub `/profile2`。
8. **News (v2)**: 最新 5 条相关新闻。

**状态**:
- 加载：每个 section 独立 skeleton，PriceChart 优先加载。
- 错误（symbol 不存在）：404 风格 + "返回 watchlist" 按钮。
- 历史数据 API 挂：图表区显示 "暂无历史数据"，其它信息保留。

**关键交互**:
- 双指捏合缩放图表时间窗（lightweight-charts 内置）。
- 图表区右上角"全屏"按钮 → 横屏沉浸视图。
- "记录交易" → 弹底部 sheet 预填 symbol。

---

### 4. Trade Sheet（底部抽屉，全局可调用）

**目的**: 在任何页面快速录入一笔交易。

**触发**: TabBar 中央的"+"按钮，或股票详情页的"记录交易"。

**结构**:
- 标题 "新增交易" + 关闭。
- Segmented control: `买入 / 卖出 / 分红 / 拆股`。
- 字段（动态根据类型）：
  - 账户（下拉）
  - Symbol（搜索 + 联想，预填若来自详情页）
  - 数量（数字键盘）
  - 单价（数字键盘；分红场景为每股金额；拆股为比例如 4:1）
  - 手续费（折叠默认收起）
  - 日期时间（默认现在）
  - 备注
- 底部固定 **总额预览** + 大按钮"保存"。

**校验**:
- 卖出时校验账户内当前持仓 ≥ 数量，不足红色 inline 提示但允许（兼容历史数据导入）。
- 价格 / 数量 > 0。

**交互**:
- 抽屉支持下拉关闭（带阻尼）。
- 保存后 toast "已记录" + 触觉震动；自动刷新相关 query。

---

### 5. Accounts `/accounts` 与 `/accounts/[id]`

#### `/accounts` 列表
- 顶部"账户"标题 + "+ 新建"。
- 每个 account 一张 **AccountCard**: 名 + 券商 logo + 币种；右侧市值 + 今日盈亏色块；底部 mini 资产分布条（堆叠的彩色块按持仓占比）。
- 点击进详情。

#### `/accounts/[id]` 详情
**Tabs (顶部分段)**: `持仓 / 交易 / 业绩 / 分红`

- **持仓 tab**:
  - 排序条（市值 / 涨跌幅 / 占比 / 成本基差）
  - **PositionRow**: symbol + 名 / 股数 · 均价 → 市值 + 今日盈亏 / 累计盈亏（百分比+金额）+ 右侧迷你环显示占组合比例。
  - 点击进 symbol 详情。
- **交易 tab**:
  - 时间倒序，按月分组（"2026 年 5 月"）。
  - 每行：日期 + 类型 pill + symbol + 数量 × 价格 + 总额；右滑删除，左滑编辑。
  - 顶部筛选（类型 / symbol / 日期范围）。
  - 右上角 **导入 CSV** 按钮 → 弹 sheet，支持映射列 + 预览。
- **业绩 tab**:
  - 资产净值时间序列（含资金流入修正的真实回报率 TWR）
  - 月度盈亏柱状图（绿/红）
  - 已实现 vs 未实现盈亏对比
  - 与 SPY 收益对照线
- **分红 tab**:
  - 年度分红汇总卡（今年至今 $X，去年 $Y）
  - 即将到来的除权日列表
  - 历史分红表，可按 symbol 聚合查看 yield on cost

**新建账户 sheet**: 名称 / 券商（预设列表 + 自定义） / 币种 / 初始现金。

---

### 6. 全局搜索 `⌘K` / 顶部搜索

- 触发：桌面 `⌘K`，移动顶部搜索 icon。
- 输入即搜：上方 "我的持仓中" 命中（带 # 标），下方 "市场" 命中（Finnhub）。
- 键盘上下 + Enter 进详情。
- 历史搜索 chip。

---

### 7. Settings / Me `/settings`

**Sections**:
- **账号**: 邮箱（仅展示）、修改密码、登出。
- **外观**: 主题（跟随系统 / 浅 / 深）、强调色、色弱友好色板。
- **隐私**: 隐私模式默认开关、PIN/Face ID 解锁（PWA on iOS 暂不可，留 placeholder）。
- **数据**: 导出全部为 JSON / CSV；导入；清空（带二次确认）。
- **行情**: 报价刷新频率、是否使用历史回填、API 状态指示（Finnhub 实时 ✓ / Yahoo 历史 ✓）。
- **关于**: 版本号、隐私政策（本地文档）、反馈邮箱。

---

### 8. 通用组件清单（交给设计 agent 单独画）

- TabBar / Sidebar / NavHeader
- StockRow（list 用）/ PositionRow（持仓用）/ TransactionRow
- StatCard（KPI 卡） / NetWorthCard（带 sparkline 的 hero 卡）
- PriceChart（lightweight-charts 包装） / SparklineMini / AllocationDonut / DividendBarChart / NetWorthAreaChart
- TradeSheet / NewListSheet / NewAccountSheet / FilterSheet
- ChipSelector / SegmentedControl / SearchInput / NumberPad
- Skeleton 套件 / EmptyState 套件 / ErrorBanner / Toast
- PriceText（带 ▲▼ 与颜色 + tabular-nums） / PercentPill / KindPill (BUY/SELL/DIV/SPLIT)

设计 agent 应输出：上述每个页面的视觉稿（深浅双版）+ 通用组件库 + token 文档。

## 行情数据适配层 `lib/market/`

- `lib/market/finnhub.ts` — `getQuote(symbol)`, `searchSymbols(q)`, `getProfile(symbol)`
- `lib/market/yahoo.ts` — `getHistory(symbol, range)`, `getDividends(symbol)`, `getSplits(symbol)`
- `lib/market/index.ts` — 对外统一 `getQuote`、`getHistory` 接口，内部带缓存（`quote_cache` 30s TTL，`prices_daily` 当日盘后落库）
- 所有外部调用走 Next.js `/api/*` Route Handler，前端不直接持有 Finnhub key

## 认证方案

- `/login` 页面，输入密码
- 环境变量 `APP_PASSWORD_HASH` (bcrypt)，服务端校验后下发 httpOnly 签名 cookie
- `middleware.ts` 拦截除 `/login`、`/api/auth/*`、静态资源外的所有路由
- 未来要多用户可换成 Neon Auth / BetterAuth，schema 已经预留 `user_id` 字段（先填一个常量 `"me"`）

## PWA 配置

- `public/manifest.webmanifest`：name、short_name、icons (192/512/maskable)、`display: standalone`、`theme_color`
- iOS 特殊 meta：`apple-mobile-web-app-capable`、`apple-touch-icon`、`apple-mobile-web-app-status-bar-style`
- service worker（next-pwa 自动注入）：API 网络优先、静态资源 stale-while-revalidate

## 项目结构（关键路径）

```
minimint/
├─ app/
│  ├─ (auth)/login/page.tsx
│  ├─ (app)/
│  │   ├─ layout.tsx          # 顶部导航 + 受保护 wrapper
│  │   ├─ page.tsx            # Dashboard
│  │   ├─ watchlists/page.tsx
│  │   ├─ s/[symbol]/page.tsx
│  │   ├─ accounts/page.tsx
│  │   ├─ accounts/[id]/page.tsx
│  │   └─ settings/page.tsx
│  └─ api/
│      ├─ auth/login/route.ts
│      ├─ quote/[symbol]/route.ts
│      ├─ history/[symbol]/route.ts
│      ├─ search/route.ts
│      ├─ transactions/route.ts
│      └─ watchlists/route.ts
├─ components/                 # shadcn 组件 + 业务组件 (PriceChart, PositionTable...)
├─ db/
│  ├─ schema.ts
│  ├─ client.ts                # drizzle + @neondatabase/serverless
│  └─ migrations/
├─ lib/
│  ├─ market/                  # finnhub.ts, yahoo.ts, index.ts
│  ├─ portfolio.ts             # 持仓 / 盈亏计算
│  └─ auth.ts
├─ middleware.ts
├─ public/manifest.webmanifest, icons/
├─ drizzle.config.ts
├─ next.config.ts
├─ package.json
└─ .env.local                  # DATABASE_URL, FINNHUB_API_KEY, APP_PASSWORD_HASH, SESSION_SECRET
```

## 实施步骤

1. **脚手架**：`pnpm create next-app` (TS, Tailwind, App Router) → 加 shadcn/ui、Drizzle、TanStack Query、`@neondatabase/serverless`、`finnhub`、`yahoo-finance2`、`lightweight-charts`、`recharts`、`zod`、`bcryptjs`、`jose`（JWT）
2. **数据库**：通过 Neon MCP 创建 project `minimint`，写 schema，跑首次 migration
3. **认证骨架**：login 页面 + middleware + 一个写死的 dashboard 占位
4. **行情适配层**：实现 `lib/market/*`，写两条 API route (`/api/quote`, `/api/history`)，前端 hook `useQuote(symbol)` / `useHistory(symbol, range)`
5. **Watchlist 流**：CRUD + 实时报价表
6. **Symbol 详情 + K 线图**
7. **Accounts 与 transactions**：表单录入 + 持仓 / 盈亏计算
8. **图表与 Dashboard 汇总**
9. **PWA manifest + 图标 + service worker**
10. **CSV 导入、分红回填**
11. **部署 Vercel + Neon 生产数据库**

## 验证方式

- **本地端到端**：`pnpm dev` → `/login` → 进 Dashboard → 新增账户 → 录入一笔 AAPL 买入 → Watchlist 添加 AAPL → 详情页看到 K 线 → 账户页看到持仓与未实现盈亏
- **数据校验**：手动算一笔 buy 100 @ 150、当前 180 的浮盈，对照 UI 显示
- **API 限流**：连续刷新 Watchlist，确认 Finnhub 调用走缓存（`quote_cache` 30s TTL）
- **跨端**：macOS Safari 打开 → 添加到 Dock；iPhone Safari 打开 → 添加到主屏，确认离线壳、状态栏样式
- **类型 & lint**：`pnpm tsc --noEmit && pnpm lint`
- **生产烟测**：部署到 Vercel，连 Neon prod 库，用 iPhone 走一遍完整流程

## 风险与备选

- **yahoo-finance2 非官方，可能突然挂掉** → 备选 Twelve Data (800/天 免费) 或 Tiingo（1000/小时）；历史数据落库后即使 API 挂也不影响存量
- **Finnhub 免费层不提供盘前盘后** → 接受
- **iOS PWA 推送支持有限** → 暂不做推送，后续要做再考虑 Web Push + iOS 16.4+
- **持仓成本算法** → 默认加权平均，预留接口未来支持 FIFO / LIFO / 指定批次

## 不做的事 (避免范围爆炸)

- 不做下单 / 券商账户 OAuth 接入
- 不做社区 / 评论 / AI 投资建议
- 不做多币种汇率换算（先 USD 单币种）
- 不做期权 / 期货 / 加密
- 不做实时 WebSocket 推送（按需轮询足够）
