# 给 Claude Design 的 v3 → v4 反馈

> 工程侧第二轮审核 · 2026-05-17
> M1(See a stock)已上生产,M2(Record a trade)即将启动。v3 已闭合大部分缺口,以下是开工前需要处理的几项,按优先级排序。

## P0 — 阻塞 M2 开工

### 1. 令牌登记:`ACCT_COLORS` + `SECT_HUES` + `--on-mint`

v3 的多处文件直接引用了 `ACCT_COLORS[a.id]` 作为既存常量,但 8 色账户调色板从未写入 [`styles.css`](styles.css)。同时 [`screens-v3-tabs.jsx:8-24`](screens-v3-tabs.jsx) 的 `SECT_HUES` 是 15 个原始 hex 字面值。

**请处理**:
- 在 `styles.css` 中按 R-T0.a 格式(RGB 三元组,空格分隔)登记 8 个 `--acct-*` 令牌(R-N2.b 承诺过的 slate / steel / bronze / olive / plum / rust / ocean / sand)
- 同样登记 11 个 GICS 行业令牌 `--sec-tech / --sec-energy / --sec-financial …`
- 新增 `--on-mint`(亮色背景上的深墨色)替代散落在 v3 各处的 `#07120D / #0B0B12 / #06160E`
- 把 `screens-v3-tabs.jsx` 和 `screens-v3-misc.jsx` 里所有 raw hex 替换为 `var(--*)`

**原因**:工程侧 `lint:tokens` CI 检查会拒绝任何含 hex 字面值的组件文件,这一步不做,任何画板都没法被 `design-implementer` 接稿。

### 2. 任意字号清理

v3 多处仍有 `fontSize: 12.5 / 13.5 / 14.5`、`fontWeight: 800`:
- [`screens-v3-tabs.jsx`](screens-v3-tabs.jsx) 行 255 / 332 / 345 / 350 / 541 / 544
- [`screens-v3-misc.jsx`](screens-v3-misc.jsx) 行 230 / 247 / 1450 / 1560

**请处理**:全部归到 `.t-*` 角色类(`.t-meta` / `.t-aux` / `.t-row` / `.t-row-strong` / `.t-h-sub` / `.t-h`)。若现有 7 个角色不够用,扩 `styles.css` 的角色字号集合 + 加新 `.t-*` 类 — 不要在组件里写裸数字。

### 3. 账户↔颜色分配规则

Trade Sheet 假设 `ACCT_COLORS[a.id]` 已经有值,但没写明"新建账户时如何挑色"。

**请处理**:在 `REVISIONS.md` R-N2.b 下加一条子项,定义分配算法。建议:按创建顺序循环 8 色,允许用户在 Account Editor 手动改。给出 Account Editor 中色块选择器的画板(8 色 swatch 网格,带 checkmark)。

---

## P1 — 阻塞 M3,M2 期间可并行

### 4. 补 `MarketStatusStrip` 关市态(R-N1 #2 / U-2)

现有 `screens-home-v2.jsx` 只画了开盘态。R-N1 #2 + U-2 承诺收盘期间显示"Pre-market +0.42% · Opens in 6h"。

**请补**:同一条 Strip 的 4 个变体画板 — `Pre-market` / `Market open` / `After-hours` / `Closed (weekend)`。每个变体的左侧 dot 颜色 + 文字 + 倒计时格式都不同。

### 5. 补 `IOSProfilePINEntry`(R-P6)

v3 有 PIN Setup,没有 PIN Entry。切换到受保护档案时需要的输入门。

**请补**:全屏 4 点数字键盘 + 顶部"Switch to Mom"标题 + 失败抖动态 + "忘记 PIN?清除该档案"逃生口。注意脚部仍要带 R-P6 的"不是安全边界,只防误操作"免责说明。

### 6. 补 `IOSDashboardCollapsed`(R-I3 第三帧)

v3 给了 Watchlist 和 Portfolio 的坍缩态,Dashboard 漏了。R-I3 明确要求三个 tab 都画。

### 7. OverflowMenu 与 R-N4 不一致

[`IOSPortfolioOverflowMenu`](screens-v3-tabs.jsx) 加了 R-N4 没列出的 `Hide closed positions` / `Set alert…`,漏了 `Refresh`。

**请处理**:做一个选择 — 要么改画板回归 R-N4,要么改 REVISIONS.md R-N4 列表对齐画板,任选一种但必须二选一。同样的核对也请用在 Home 和 Symbol detail 的 overflow menu 上。

### 8. Trade Sheet 校验语义

`IOSTradeSheetFromSymbol` 显示静态文本 "Available cash · 19 sh"。这是:
- (a) 硬校验:不足时禁用 Save?
- (b) 软提示:允许继续但加 banner?
- (c) 信息态:只显示不阻塞?

R-I2 在 `screens-interactions.jsx` 里有错误态画板,但 Trade Sheet 没引用。**请补**:在 `IOSTradeSheetFromSymbol` 旁边加 1 张 error 态画板,明确选哪种语义。

---

## P2 — M4 范围,但越早画越好

### 9. Mac Market 子页

v3 给了 iOS 的 Stocks / ETF / News + Mac Sector Heatmap,但 Mac 的 Overview / Stocks / ETF / News 四个画板都缺。M4 启动前要补齐,Mac 用户的 Market tab 不能只有一张热力图。

### 10. U-3 持仓成本线 + 买卖标记

SymbolDetail 的图表上叠加买入价水平线 + 买卖点 marker。已在 P3 backlog,但若 M2 期间能画,可以早一个 sprint 落地。

### 11. U-4 Trade 录入易用性

当前 `IOSTradeSheetFromSymbol` 只画了"happy path"。请补:
- 日期默认到最近交易日(周末打开默认上周五)
- 重复检测态:同日同 symbol 同方向已录入时的提示 banner
- 批量录入模式(R-SC2 CSV 导入流之外的快速录入):一个底栏"+ Add another"

### 12. U-6 UpcomingEvents 详情

Home 上有 UpcomingEventsCard 单态,但点入某个事件(分红日 / 财报日)后跳哪里?需要一张详情画板,或明确告诉工程"点击 = 跳到 SymbolDetail 的对应 section"。

### 13. U-7 Onboarding(M4 必须)

M4 之前需要 4-5 张 Onboarding 画板:welcome → set password → import or skip → create first profile → done。

### 14. U-8 隐私模式 L2

"Tap to reveal" 在 L1 已展示,L2(profile name 也脱敏成 P1/P2/P3)还没画。

---

## 资料引用

- 工程合约总览:[`CLAUDE.md`](../../CLAUDE.md) §"non-negotiable engineering contracts"(8 条)
- 当前 sprint 范围:[`MVP_PLAN.md`](../../MVP_PLAN.md) §3(M2)
- 工程 backlog:[`BACKLOG.md`](../../BACKLOG.md) P0 部分
- 上一轮变更记录:[`CHANGELOG.md`](CHANGELOG.md)

## 一句话总结

v3 整体可接稿。**P0 三件事大约 1 天工作量**(令牌补登 + 字号清理 + 账户色规则),做完之后 M2 可以无阻碍开工。P1 / P2 在 M2 进行期间并行交付即可。
