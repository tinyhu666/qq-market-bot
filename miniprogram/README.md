# 微信小程序开发环境

这个目录已经初始化为一个可直接导入微信开发者工具的原生小程序项目，并补齐了 TypeScript、微信 API 类型声明、ESLint、Prettier，以及一套适合继续做业务开发的模板结构。

## 已完成内容

- 原生小程序目录结构：`miniprogram/`
- 微信开发者工具配置：`project.config.json`
- TypeScript 类型检查：`typescript` + `miniprogram-api-typings`
- 代码规范：`eslint` + `prettier`
- 业务模板能力：环境配置、请求封装、登录态示例、分包页面、通用卡片组件

## 本地环境要求

- Node.js `20+`
- 微信开发者工具

说明：当前机器上的 Node 版本是 `v24.14.0`，已经满足本项目要求。

## 如何开始

1. 安装依赖：

   ```bash
   npm install
   ```

2. 安装并打开微信开发者工具，选择“导入项目”。

3. 项目目录选择当前目录：

   ```text
   /Users/hurui/Downloads/stock/miniprogram
   ```

4. 首次体验可以直接使用 `touristappid` 打开项目；正式开发前，请把 [project.config.json](/Users/hurui/Downloads/stock/miniprogram/project.config.json) 里的 `appid` 替换成你自己的小程序 AppID。

5. 后续开发主要在 `miniprogram/` 目录下进行。
6. 正式接后端前，优先修改 `miniprogram/config/env.ts` 里的 `baseURL`。

## 常用命令

```bash
npm run lint
npm run typecheck
npm run format
```

## 目录说明

```text
miniprogram/
  app.ts
  app.json
  app.wxss
  sitemap.json
  config/
    env.ts
  constants/
    storage.ts
  components/
    section-card/
      index.ts
      index.wxml
      index.wxss
      index.json
  pages/
    index/
      index.ts
      index.wxml
      index.wxss
      index.json
  packageUser/
    pages/
      profile/
        index.ts
        index.wxml
        index.wxss
        index.json
  services/
    auth.ts
  types/
    app.ts
    network.ts
    user.ts
  utils/
    request.ts
    storage.ts
    toast.ts
typings/
  app.d.ts
```

## 开发建议

- 新增页面后，记得把路径补到 `miniprogram/app.json` 的 `pages` 中。
- 新增分包页面时，优先放到 `subpackages`，避免主包膨胀。
- 如果后续引入运行时 npm 包，需要在微信开发者工具里执行一次“工具 -> 构建 npm”。
- `miniprogram-api-typings` 只提供类型提示，不会增加小程序包体积。
- `miniprogram/utils/request.ts` 已经封装统一请求入口，真实项目建议只通过这一层发请求。
- `miniprogram/services/auth.ts` 目前是演示登录流程，后续可替换为服务端 `code2Session` 或自有鉴权接口。

## 当前模板包含什么

- 首页已经改成项目导航页，可直接跳转到分包页面查看示例。
- `config/env.ts` 集中管理 `dev/test/prod` 配置。
- `utils/request.ts` 内置 `baseURL`、`Authorization` 注入和错误提示。
- `services/auth.ts` 提供了一个可运行的本地登录态示例，方便后面替换为真实后端。
- `components/section-card` 是一个轻量卡片组件，后续页面可直接复用。

## 推荐下一步

1. 把 `miniprogram/config/env.ts` 中的域名替换成自己的测试环境。
2. 接入真实登录接口，把 `services/auth.ts` 里的 mock token 改成后端返回值。
3. 新建一个业务分包，例如订单、商品或个人中心，把页面继续按模块拆分。

## QQ 行情机器人定时任务

仓库现在额外带了一套独立的 Node 定时脚本，用于在每天北京时间 `09:25`、`13:25`、`18:25` 推送以下顺序的行情：

- `黄金（XAU/USD）`
- `白银（XAG/USD）`
- `原油（WTI）`
- `以太坊（ETH/USD）`
- `纳指100（NDX）`
- `标普500（SPX）`
- `美元（USDX）`
- `上证（SH）`

同时附带：

- `OpenAI News`、`Google AI`、`NVIDIA`、`The Decoder`、`AI News`、`量子位` 等源过去 `24` 小时内合并后的 AI 热榜
- `第一财经资讯页` + `36氪快讯` 组合出的财经 `10` 条，不足时再回退到东方财富

消息格式采用“时间 + 价格列表 + 新闻列表”的精简形式。实现文件在 [scripts/qq-market-bot.mjs](/Users/hurui/Downloads/stock/miniprogram/scripts/qq-market-bot.mjs)。

当前价格抓取策略为：

- `XAU`、`ETH`：`Twelve Data`
- `NDX`、`SPX`：`CNBC` 行情页优先，必要时回退到 `Stooq` 价格快照
- `XAG`、`WTI`、`USDX`、`SH`：新浪公开行情接口优先，必要时回退到东方财富公开行情接口

价格区块会按 `中文名（英文代码）` 展示，并直接附带涨跌幅百分比。

### 支持的推送模式

- `OneBot v11`：适合 `NapCat`、`go-cqhttp` 一类本地 QQ 机器人，稳定支持主动定时推送。
- `QQ 官方机器人 OpenAPI`：保留接入能力，但请注意官方文档在 `2026-03-12` 的“发送消息”页里仍提示“主动推送能力于 `2025-04-21` 起不再提供”，群/单聊主动消息也有严格频控，所以如果你要做每天三次的稳定播报，更推荐 `OneBot`。

当前仓库里的本地忽略文件 [qq-market-bot.env](/Users/hurui/Downloads/stock/miniprogram/scripts/qq-market-bot.env) 已经切到 `OneBot` 方案，并移除了之前的 QQ 官方机器人凭证。

新闻部分默认改为：

- `AI` 新闻优先抓取 `OpenAI News`、`Google AI`、`NVIDIA Blog`、`NVIDIA Technical Blog`、`VentureBeat AI`、`The Decoder`、`AI News` 这类国际源
- 国内 AI 候选默认优先使用 `量子位`；`AIBase` 会作为低优先级回填源参与补量，但同一轮最多保留 `1` 条，并且会对同事件改写稿做额外去重
- 财经新闻优先使用 `第一财经` 资讯页与 `36氪快讯` 的标题型源；如果结果不足，再回退到东方财富妙享 `skill` 或公开 `7*24` 快讯接口

AI 新闻会先在这些源之间做一层标题过滤、源权重排序、热度评分和近似去重，再把候选条目交给大模型做最终筛选和一句话总结。当前默认只使用 `DeepSeek`；如果未配置或调用失败，则继续回退到本地规则筛选，保证播报不中断。仓库里仍保留 `Gemini` 兼容能力，但只有在你显式填写 `GEMINI_API_KEY` 并把 provider 切回 `gemini` 时才会启用。如果模型生成了明显营销腔、半句、英文残留、口语化、主体不明确、招聘/校招或 clickbait 风格的总结，脚本会自动回退到更稳妥的原标题，并在必要时用其他候选补齐条数；如果总结漏掉了标题里的关键仓库名、产品名、模型名或版本号，也会直接回退标题，避免把事件写成模糊概述。在候选量足够时，`AI Top 10` 会尽量固定为 `7` 条国际 AI 新闻 + `3` 条国内 AI 新闻，最终顺序优先尊重大模型返回的热榜次序，不会在收尾阶段再被本地热度分二次洗牌。

为了进一步提升 AI 区质量，候选现在不只看“是否提到 AI”，还会优先要求有明确主体和动作信号，例如模型/产品发布、开源、融资、收购、合作、财报、监管或基础设施更新；像专访、解读、教程、体验、趋势评论、活动预告和泛观点内容会被提前降权或过滤。

对英文国际标题里常见的评价型表达，例如 `breakthrough`、`fundamentally reshape`，脚本会优先改写成主体明确的中文硬新闻短句；而像 `时代结束`、`组团上班`、`进入“自动驾驶”时代` 这类趋势包装或比喻化标题，会被优先过滤，避免最终 QQ 消息读起来像媒体稿而不是行业快讯。

为适配新的国际源链路，脚本额外支持了解析 `Atom feed` 与 `HTML 列表页`：例如 `NVIDIA Technical Blog` 使用 `Atom`，`AIBase` 使用服务端渲染列表页解析。当前默认策略是“高质量国际/国内主源优先 + 低优先级补量源限流”，避免 AI 区长期缩到 `Top 3`，同时尽量不让聚合源主导最终热榜。

为了减少“半句标题”和媒体改写摘要造成的串题，AI 区在进入大模型前会优先使用标题做候选判断，并过滤掉明显以“甚至 / 毕竟 / 另外 / 同时 / 目前 / 对此”等承接词开头的残句条目。热度评分会综合来源权威度、事件动作信号、发布时间新鲜度与跨源覆盖度，尽量把真正影响面更大的过去24小时热点排在前面。

财经新闻会继续沿用当前的标题型数据源链路，减少“正文残句”和公告腔。脚本会优先过滤经济日历、多时间点提醒、基建/活动类弱相关快讯与 clickbait 标题，并优先保留股市、利率、汇率、财报、公司与政策类市场动态；最终输出前再交给大模型做一轮中文精简总结。

此外，财经区会额外清洗 `公告编号`、`证券代码`、`业绩说明会`、`小程序码`、`财经早餐/早报` 这类公告腔和汇总条目；对于 `第一财经` 这种列表页里标题重复两次的情况，脚本会自动折叠成单条完整标题。

每条新闻只保留一行总结文本，不展示跳转、来源和“摘要”标签。新闻行会优先压成完整短句，避免在 QQ 中出现生硬截断；同时脚本会按总长度重新组装消息块，并压缩模块之间的空行，尽量减少分片数量和视觉留白。

脚本现在只在“同一轮最终消息”里做去重：同一轮播报会做跨栏目去重，并且在每条最终要发出的消息组装完成前再做一次消息级去重，尽量避免同一事件在 `AI`、`财经` 甚至同一条消息内重复出现。不同时间段之间不再做“当天已发过”的跨时段去重，避免上午出现的热点在中午或晚上被错误跳过。

### 1. 准备配置

复制示例文件：

```bash
cp scripts/qq-market-bot.env.example scripts/qq-market-bot.env
```

然后按你的机器人类型填写：

- 通用必填：
  - `TWELVE_DATA_API_KEY`
  - `QQ_BOT_MODE=onebot` 或 `QQ_BOT_MODE=qq-official`
- 新闻相关可选：
  - `MARKET_TECH_AI_NEWS_LIMIT`，默认 `10`
  - `MARKET_TECH_NEWS_LIMIT`，默认 `5`
  - `MARKET_AI_NEWS_LIMIT`，默认 `5`
  - `MARKET_FINANCE_NEWS_LIMIT`，默认 `10`
  - `MARKET_NEWS_SUMMARY_MAX_LENGTH`，默认 `48`
  - `MARKET_MESSAGE_MAX_LENGTH`，默认 `1600`
  - `MARKET_AI_LLM_ENABLED`，可选；默认 `1`
  - `MARKET_AI_LLM_PROVIDER`，可选；默认 `deepseek`
  - `MARKET_AI_LLM_FALLBACK_PROVIDER`，可选；默认 `deepseek`
  - `MARKET_AI_LLM_TIMEOUT_MS`，可选；默认 `45000`
  - `DEEPSEEK_MODEL`，可选；默认 `deepseek-chat`
  - `DEEPSEEK_API_KEY`，可选；配置后作为 AI Top 10 的默认大模型
  - `GEMINI_MODEL`，可选；默认 `gemini-2.5-flash`
  - `GEMINI_API_KEY`，可选；仅在你手动把 provider 切回 `gemini` 时启用
  - `EASTMONEY_APIKEY`，可选；填写后开启东方财富妙享 `skill`
  - `EASTMONEY_SKILL_QUERY`，可选；默认 `最新财经快讯`
- OneBot 必填：
  - `ONEBOT_HTTP_URL` 或 `ONEBOT_WS_URL`
  - `ONEBOT_MESSAGE_TYPE=group` 或 `private`
  - `ONEBOT_TARGET_ID`
  - `ONEBOT_EXTRA_TARGETS`，可选；格式 `group:群号,private:QQ号`
  - `ONEBOT_ACCESS_TOKEN`（如果你的 OneBot HTTP 接口开了鉴权）
- QQ 官方机器人必填：
  - `QQ_BOT_APP_ID`
  - `QQ_BOT_CLIENT_SECRET`
  - `QQ_BOT_TARGET_TYPE=group` 或 `user`
  - `QQ_BOT_TARGET_ID`

### 2. 先本地 dry-run

```bash
set -a && source ./scripts/qq-market-bot.env && set +a
npm run market:push:dry-run
```

这一步不会真的发消息，只会打印出最终要发送的文本。

如果你使用的是 QQ 官方机器人，想先只验证 `appid/appsecret` 是否可用，不依赖目标群或用户 ID，可以执行：

```bash
set -a && source ./scripts/qq-market-bot.env && set +a
npm run market:auth:check
```

### 3. OneBot 目标 ID 说明

- `ONEBOT_MESSAGE_TYPE=group` 时，`ONEBOT_TARGET_ID` 填 QQ 群号
- `ONEBOT_MESSAGE_TYPE=private` 时，`ONEBOT_TARGET_ID` 填对方 QQ 号
- 如果你想在原有目标外再追加多个群或私聊 QQ，可以填写 `ONEBOT_EXTRA_TARGETS`
- 示例：`ONEBOT_EXTRA_TARGETS=private:123456789`
- 多个目标可写成：`ONEBOT_EXTRA_TARGETS=private:123456789,private:234567890,group:987654321`
- `ONEBOT_HTTP_URL` 填 OneBot HTTP API 地址，例如 `http://127.0.0.1:3000`
- `ONEBOT_WS_URL` 填 OneBot WebSocket Server 地址，例如 `ws://127.0.0.1:3001`
- `ONEBOT_HTTP_URL` 和 `ONEBOT_WS_URL` 二选一即可；都填时默认优先使用 HTTP

### 4. QQ 官方机器人目标 ID 说明

- `QQ_BOT_TARGET_TYPE=group` 时，`QQ_BOT_TARGET_ID` 不是群号，而是官方接口要求的 `group_openid`
- `QQ_BOT_TARGET_TYPE=user` 时，`QQ_BOT_TARGET_ID` 是用户 `openid`
- 这两个 ID 需要从 QQ 官方机器人的事件回调里拿到；发送消息接口本身也是按 `/v2/groups/{group_openid}/messages` 和 `/v2/users/{openid}/messages` 调用

### 5. 手动触发一次真实推送

```bash
set -a && source ./scripts/qq-market-bot.env && set +a
npm run market:push
```

推送内容结构大致如下：

```text
【行情定时播报】
时间：2026-03-30 09:25
黄金（XAU/USD）：...（...%）
白银（XAG/USD）：...（...%）
原油（WTI）：...（...%）
以太坊（ETH/USD）：...（...%）
纳指100（NDX）：...（...%）
标普500（SPX）：...（...%）
美元（USDX）：...（...%）
上证（SH）：...（...%）

【AI Top 10】
1. ...

【财经 Top 10】
1. ...
```

### 6. 安装 cron

示例模板见 [scripts/qq-market-bot.cron.example](/Users/hurui/Downloads/stock/miniprogram/scripts/qq-market-bot.cron.example)，其中已经配置好每天北京时间 `09:25`、`13:25` 和 `18:25`。

安装方式：

```bash
mkdir -p logs
crontab ./scripts/qq-market-bot.cron.example
```

日志会落到 `miniprogram/logs/qq-market-bot.log`。

### 8. 部署到 Linux 服务器

如果你要把这套定时任务放到 Linux 服务器上，推荐直接复用 [qq-market-bot-run.sh](/Users/hurui/Downloads/stock/miniprogram/scripts/qq-market-bot-run.sh) 这个包装脚本：

1. 安装 Node `20+`，或者直接把官方二进制放到 `/opt/node-v24.14.1-linux-x64/bin/node`
2. 把下面这些文件同步到服务器某个目录，例如 `/home/ubuntu/stock-bot/`
   - `scripts/qq-market-bot.mjs`
   - `scripts/qq-market-bot.env`
   - `scripts/qq-market-bot-run.sh`
3. 确保脚本可执行：

   ```bash
   chmod +x ./scripts/qq-market-bot-run.sh
   ```

4. 先在服务器上 dry-run：

   ```bash
   ./scripts/qq-market-bot-run.sh --dry-run
   ```

5. 再把 [qq-market-bot.cron.example](/Users/hurui/Downloads/stock/miniprogram/scripts/qq-market-bot.cron.example) 里的绝对路径替换成服务器路径后安装：

   ```bash
   crontab ./scripts/qq-market-bot.cron.example
   ```

说明：

- `qq-market-bot-run.sh` 会先加载 `.env`，再调用 Node 版脚本。
- 如果当前走的是 `OneBot` 且 `ONEBOT_HTTP_URL` 不可达，包装脚本会先写一条明确日志后退出，不会让 cron 每次都打出一大串 Node 异常。
- 如果你用的是 `ONEBOT_WS_URL`，包装脚本会先做一次 TCP 可达性检查，再启动 Node 主脚本。
- 如果你的 OneBot 不在同一台服务器上，记得把 `ONEBOT_HTTP_URL` 或 `ONEBOT_WS_URL` 改成公网或内网可达地址，而不是默认的本机回环地址。

### 9. 服务器自建 OneBot

如果你希望把 `OneBot` 也和行情机器人一起放到同一台 Linux 服务器上，一个可行的落地方式是：

1. 在服务器安装 Docker
2. 部署 `NapCat` 容器
3. 把 `3000` 端口绑定到 `127.0.0.1`
4. 把 `6099` 的 WebUI 也绑定到 `127.0.0.1`
5. 通过 SSH 隧道或服务器日志拿到二维码并扫码登录 QQ

这样做的好处是：

- `qq-market-bot-run.sh` 可以直接走本机 `http://127.0.0.1:3000`
- OneBot HTTP API 不直接暴露公网
- QQ 登录态会持久化在服务器磁盘里，后续 cron 不需要重复登录

如果你后续也按这套方式部署，登录完成后通常只需要保持：

```env
QQ_BOT_MODE=onebot
ONEBOT_HTTP_URL=http://127.0.0.1:3000
# ONEBOT_WS_URL=ws://127.0.0.1:3001
ONEBOT_MESSAGE_TYPE=group
ONEBOT_TARGET_ID=123456789
# ONEBOT_EXTRA_TARGETS=private:987654321
```

### 7. 自动化验证

```bash
npm test
```

覆盖项：

- 配置解析
- 八个价格品种的精简消息格式
- 科技 / AI / 财经新闻分片
- dry-run 主流程

## 官方入口

- 微信开发者工具下载：<https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html>
- 微信小程序开发文档：<https://developers.weixin.qq.com/miniprogram/dev/framework/>
