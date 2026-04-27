# issue_market_bot_20260330

issue001 [x] 标题:OneBot 预检未携带鉴权且包装脚本硬依赖固定 Node 路径导致定时推送入口失效 | 模块:scripts/运行入口 | 优先级:P0 | 关联:task044 | 解决:2026-04-27

## 现象

- `2026-04-27` 用户反馈当天消息没有正常推送。
- 主脚本在加载 `.env` 后可以正常生成完整播报，但包装脚本可能在发送前退出。

## 复现

- `cd miniprogram && bash scripts/qq-market-bot-run.sh --dry-run`：在未提供 `/opt/node-v24.14.1-linux-x64/bin/node` 时直接失败。
- `cd miniprogram && NODE_BIN=$(command -v node) bash scripts/qq-market-bot-run.sh --dry-run`：当 `ONEBOT_HTTP_URL` 不可达时，包装脚本在预检阶段直接退出。
- `cd miniprogram && NODE_BIN=$(command -v node) MARKET_SKIP_ENDPOINT_CHECK=1 bash scripts/qq-market-bot-run.sh --dry-run`：主流程仍能生成完整的价格、AI 和财经播报，说明核心抓取与组装链路正常。

## 根因

- 包装脚本默认硬编码 `/opt/node-v24.14.1-linux-x64/bin/node`，没有回退到系统 `PATH` 中的 `node`，导致运行入口对环境路径过于脆弱。
- OneBot HTTP 预检没有复用 `ONEBOT_ACCESS_TOKEN`，且没有识别 `get_status` 中的 `data.online=false`，容易在发送前把可达但未授权或已离线的服务误判为不可用。

## 修复

- 包装脚本优先使用显式 `NODE_BIN`，否则先尝试 `/opt` 运行时，再回退到系统 `node`。
- OneBot HTTP 预检补充 `Authorization: Bearer` 透传，并对 `status` 与 `data.online` 做解析，输出更明确的预检日志。
- 回写包装脚本执行位，避免按 cron 模板直接执行时命中 `Permission denied`。

issue002 [x] 标题:DeepSeek V4 Pro 默认 thinking 与 JSON 输出链路不兼容导致摘要偶发空内容回退 | 模块:scripts/AI摘要 | 优先级:P1 | 关联:task046 | 解决:2026-04-27

## 现象

- 在把默认模型切到 `deepseek-v4-pro` 之后，真实 `dry-run` 中出现 `DeepSeek 未返回可用的结构化结果` 日志。
- 主流程能够继续回退原标题候选，但这会让 AI 区质量和稳定性变差。

## 复现

- `cd miniprogram && MARKET_SKIP_ENDPOINT_CHECK=1 bash scripts/qq-market-bot-run.sh --dry-run`：在真实请求下出现 DeepSeek 结构化结果为空的回退日志。
- 单测模拟 DeepSeek 首次返回空 `content`、仅包含 `reasoning_content` 的响应时，原实现会直接失败，不会重试。

## 根因

- DeepSeek 官方文档说明 `deepseek-v4-pro` 的 `thinking` 默认值为 `enabled`，而当前摘要链路使用的是严格 `json_object` 输出。
- DeepSeek 官方文档同时说明 JSON Output 偶发可能返回空 `content`；原实现对这种结构化空响应没有做请求级重试。

## 修复

- 对 DeepSeek 的结构化 JSON 摘要请求显式传入 `thinking: { type: 'disabled' }`，切到非思考模式。
- 为结构化空 `content` 和不可解析 JSON 增加一次最小重试，降低 V4 默认行为变更带来的瞬时抖动。
- 新增回归测试，锁住“关闭 thinking + 空结构化响应自动重试”的兼容行为。

issue003 [x] 标题:线上 NapCat QQ 登录态在 2026-04-22 失效导致 OneBot 离线并阻断自动推送 | 模块:服务器/NapCat 登录态 | 优先级:P0 | 关联:task047 | 解决:2026-04-27

## 现象

- 线上 `cron` 仍保留 `2026-04-27 13:25` 定时入口，但 `2026-04-22 19:53:47` 起日志出现 `[KickedOffLine] ... 请重新登录`。
- `2026-04-22` 之后每次 `09:25/13:25/18:25` 的推送都在 OneBot 发送阶段超时，无法把已生成的播报发到目标群 `<group-id>`。
- `2026-04-27 11:33` 在服务器重启 NapCat 后，自动快速登录尝试返回“你的用户身份已失效，为保证账号安全，请你重新登录”，随后回退为二维码登录。

## 复现

- `ssh ubuntu@<server-host> 'tail -n 80 /home/ubuntu/stock-bot/logs/qq-market-bot.log'`：可看到 `2026-04-22 19:53:47` 的掉线日志，以及之后定时发送阶段的 `Timeout: NTEvent serviceAndMethod:NodeIKernelMsgService/sendMsg`。
- `ssh ubuntu@<server-host> 'curl -sS -H "Content-Type: application/json" -d "{}" http://127.0.0.1:3000/get_status'`：重启前返回 `online=false`，重启后在未重新授权前反复 `connection reset`。
- `ssh ubuntu@<server-host> 'docker logs --tail 120 napcat'`：可看到 `正在快速登录 <bot-qq>` 后立刻提示身份失效，并生成新的二维码登录入口。

## 根因

- 当前服务器上的 NapCat 容器没有配置可用的 `ACCOUNT + NAPCAT_QUICK_PASSWORD`（或 MD5 版本）回退凭据，只能依赖缓存登录态或人工扫码。
- QQ 账号 `<bot-qq>` 的缓存身份在 `2026-04-22` 已被平台判定失效，导致自动快速登录和后续 OneBot 发消息链路都不可用。

## 修复

- 已把线上脚本与配置更新到最新版本，确认中午 `2026-04-27 13:25` 的 `cron` 入口、DeepSeek V4 Pro 配置和 OneBot 预检逻辑都已就绪。
- 已把 `webui.json` 的 `autoLoginAccount` 设置为 `<bot-qq>` 并重启 NapCat，验证自动快速登录仍会因身份失效而回退。
- 已从容器导出最新二维码并完成人工扫码授权；恢复后 `get_status` 返回 `online=true`。
- 已通过 OneBot HTTP 直接发送探针消息，返回 `message_id=<message-id>`，确认 QQ 群发送链路恢复。
- 已在服务器执行真实 `./scripts/qq-market-bot-run.sh`，目标群 `<group-id>` 收到完整播报，返回 `message_id=<message-id>`。

issue004 [x] 标题:单个行情源超时会因 Promise.all 中断整轮推送 | 模块:scripts/行情抓取 | 优先级:P1 | 关联:task048 | 解决:2026-04-27

## 现象

- 在 `2026-04-27 18:13` 登录恢复后，服务器手动执行真实推送时，曾因 `secid=1.000001` 的上证行情请求超时而直接退出。
- 当时 OneBot 登录与发送链路已经恢复，但整轮播报仍会被单个价格源异常拖挂。

## 复现

- `ssh ubuntu@<server-host> 'cd /home/ubuntu/stock-bot && ./scripts/qq-market-bot-run.sh'`：在上证行情请求超时时，进程以非零状态退出。
- 本地与远端回归测试中模拟 `SH` 单项抓取失败时，旧实现会因为 `collectQuotes(...)=Promise.all(...)` 而直接 reject，无法继续生成消息。

## 根因

- `collectQuotes` 使用 `Promise.all` 并发拉取八个品种，任何一个 `quoteFetcher` reject 都会直接打断整轮价格收集。
- 价格区格式化逻辑默认每个品种都拥有有效数值，没有为“单项失败但整轮继续”预留退化输出。

## 修复

- 将价格收集从 `Promise.all` 改为 `Promise.allSettled`，让单个行情源失败时保留其余成功结果继续组装消息。
- 对失败品种写入明确诊断日志，并在最终播报中输出“数据暂缺”，而不是让整轮任务中断。
- 新增回归测试，锁住“SH 单项超时时，整轮推送仍可继续”的行为，并在远端再次通过 dry-run 与真实推送验证。
