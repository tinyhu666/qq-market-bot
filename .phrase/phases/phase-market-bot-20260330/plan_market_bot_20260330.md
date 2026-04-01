# plan_market_bot_20260330

## Milestones

1. 定义配置和消息格式
2. 实现行情抓取、新闻抓取和 QQ 推送
3. 补充 cron 模板、README 和基础测试
4. 将 Node 版脚本部署到腾讯云轻量服务器并补安全预检
5. 在同一台服务器自建 OneBot 服务并准备扫码登录入口
6. 将播报升级为 `09:25/13:25/18:25` 三段定时，并补齐 `NDX/SPX` 与新新闻源链路

## Scope

- `miniprogram/scripts/qq-market-bot.mjs`
- `miniprogram/scripts/qq-market-bot.env.example`
- `miniprogram/scripts/qq-market-bot.cron.example`
- `miniprogram/scripts/qq-market-bot-run.sh`
- `miniprogram/scripts/qq-market-bot.env`
- `miniprogram/tests/qq-market-bot.test.mjs`
- `miniprogram/package.json`
- `miniprogram/README.md`

## Priorities

- P0: 定时任务可执行、消息可发出
- P1: 新闻摘要可稳定插入播报，且消息超长时可自动分片
- P1: 财经新闻优先改用标题型主源，减少重复、截断和公告腔
- P1: 在当前 Twelve Data 套餐下仍能稳定返回 `NDX/SPX`，且不依赖服务器出口对新浪全球指数接口放行
- P1: 同一轮播报支持在群之外继续追加多个私聊接收者
- P1: 每天三次推送之间要记住当天已发送新闻，避免 AI/财经区重复
- P2: 增加 dry-run 与基础自动化校验
- P2: 服务器部署与 cron 在 OneBot 暂不可达时也能保留清晰预检日志
- P2: 服务器自建 OneBot 时默认只绑定回环地址，避免把管理面板直接暴露公网

## Risks & Dependencies

- Twelve Data 依赖 API key
- Twelve Data 当前套餐不覆盖 `NDX`、`SPX` 指数，且服务器出口对新浪全球指数接口会返回 `Forbidden`
- `CNBC` 页面行情结构若调整，需要保留 `Stooq` 之类可直接抓取价格的兜底源
- `第一财经` 资讯页与 `36氪` feed 的 HTML / RSS 结构可能调整，需要保留东方财富回退链路
- 新闻去重状态文件如果损坏或丢失，不应阻塞推送主流程，但会导致当天历史记忆失效
- QQ 官方机器人从 2025-04-21 起对主动消息策略有调整，需要在 README 中提前说明
- OneBot 实现间鉴权头兼容性可能存在差异，默认按 `Authorization: Bearer` 处理
- 如果服务器上没有 OneBot 服务，`ONEBOT_HTTP_URL` 需要改成服务器可达地址，否则只能完成 dry-run 和预检日志验证
- 自建 NapCat 后仍需要人工扫码登录 QQ，登录动作无法在当前会话内全自动完成
