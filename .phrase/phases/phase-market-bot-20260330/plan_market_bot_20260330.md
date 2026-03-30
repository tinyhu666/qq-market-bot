# plan_market_bot_20260330

## Milestones

1. 定义配置和消息格式
2. 实现行情抓取、新闻抓取和 QQ 推送
3. 补充 cron 模板、README 和基础测试
4. 将 Node 版脚本部署到腾讯云轻量服务器并补安全预检
5. 在同一台服务器自建 OneBot 服务并准备扫码登录入口

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
- P2: 增加 dry-run 与基础自动化校验
- P2: 服务器部署与 cron 在 OneBot 暂不可达时也能保留清晰预检日志
- P2: 服务器自建 OneBot 时默认只绑定回环地址，避免把管理面板直接暴露公网

## Risks & Dependencies

- Twelve Data 依赖 API key
- Google News RSS 结果质量会随检索词和地区变化，需要做过滤和降级处理
- QQ 官方机器人从 2025-04-21 起对主动消息策略有调整，需要在 README 中提前说明
- OneBot 实现间鉴权头兼容性可能存在差异，默认按 `Authorization: Bearer` 处理
- 如果服务器上没有 OneBot 服务，`ONEBOT_HTTP_URL` 需要改成服务器可达地址，否则只能完成 dry-run 和预检日志验证
- 自建 NapCat 后仍需要人工扫码登录 QQ，登录动作无法在当前会话内全自动完成
