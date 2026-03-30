# qq-market-bot

[![CI](https://github.com/tinyhu666/qq-market-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/tinyhu666/qq-market-bot/actions/workflows/ci.yml)

一个以QQ机器人为前端、以 Node 定时任务为行情播报引擎的项目。

## 当前能力

- 每天北京时间 `09:40`、`18:40` 定时推送行情到 QQ
- 价格顺序固定为：
  - 黄金（XAU/USD）
  - 白银（XAG/USD）
  - 原油（WTI）
  - 以太坊（ETH/USD）
  - 美元（USDX）
  - 上证（SH）
- 新闻部分包含：
  - `AI Top 10`
  - `财经 Top 10`
- 支持同时发送到 QQ 群和 QQ 私聊

## 快速入口

- 项目说明：[miniprogram/README.md](miniprogram/README.md)
- 机器人主脚本：[miniprogram/scripts/qq-market-bot.mjs](miniprogram/scripts/qq-market-bot.mjs)
- 示例配置：[miniprogram/scripts/qq-market-bot.env.example](miniprogram/scripts/qq-market-bot.env.example)
- 阶段任务记录：[.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md](.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md)

## 本地开发

```bash
cd miniprogram
npm install
npm test
npm run lint
npm run typecheck
```

如果要本地预览机器人播报内容：

```bash
cd miniprogram
set -a && source ./scripts/qq-market-bot.env && set +a
node ./scripts/qq-market-bot.mjs --dry-run
```

## 持续集成

仓库已配置 GitHub Actions，在 `push` 到 `main` 或提交 Pull Request 时自动执行：

- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
