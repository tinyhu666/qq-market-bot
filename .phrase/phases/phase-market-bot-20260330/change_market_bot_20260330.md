# change_market_bot_20260330

change001 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Add | 影响:定时行情抓取与 QQ 推送 | 说明:新增 Twelve Data 报价抓取、OneBot/QQ 官方机器人双通道推送入口 | 关联:task001
change002 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Add | 影响:运行配置 | 说明:补充行情机器人示例环境变量模板 | 关联:task001
change003 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.cron.example | 操作:Add | 影响:定时执行 | 说明:补充每天 09:30 和 18:30 的 cron 模板 | 关联:task001
change004 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Add | 影响:脚本验证 | 说明:为配置解析、消息格式和 dry-run 流程补充测试 | 关联:task001
change005 日期:2026-03-30 | 文件:miniprogram/package.json | 操作:Modify | 影响:npm scripts | 说明:新增 market 推送与脚本测试命令 | 关联:task001
change006 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:使用说明 | 说明:补充行情机器人配置、运行方式和 QQ 官方限制说明 | 关联:task001
change007 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Add | 影响:本地敏感配置 | 说明:写入 QQ 官方机器人 appid 与 appsecret 的本地忽略配置文件 | 关联:task001
change008 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:QQ 官方机器人鉴权检查 | 说明:新增 --check-auth 并允许 dry-run/auth-check 跳过目标 openid 校验 | 关联:task001
change009 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:官方机器人接入说明 | 说明:补充 group_openid/openid 说明与官方鉴权检查命令 | 关联:task001
change010 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:价格+新闻播报 | 说明:新增 Google News RSS 新闻抓取、中文摘要、价格+新闻格式拼接与超长分片发送 | 关联:task002
change011 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:消息验证 | 说明:补充价格+新闻格式、超长新闻分片和 dry-run 新闻流程测试 | 关联:task002
change012 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:使用说明 | 说明:补充全球科技/AI新闻和财经新闻播报说明、可选环境变量与消息结构 | 关联:task002
change013 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充新闻条数、摘要长度与单条消息长度配置 | 关联:task002
change014 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地运行配置 | 说明:切换为 OneBot 默认配置并移除 QQ 官方机器人敏感凭证 | 关联:task003
change015 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:方案说明 | 说明:将当前推荐和本地默认配置切换为 OneBot 口径，并补充 OneBot target ID 说明 | 关联:task003
change016 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:ETH/USD 行情抓取 | 说明:将第二个价格品种调整为 ETH/USD，并统一回落到 Twelve Data，去除受地域限制的外部交易所依赖 | 关联:task003
change017 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:数据源说明 | 说明:将价格播报品种更新为 XAU/USD 与 ETH/USD，并补充当前实际来源 | 关联:task003
change018 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot-run.sh | 操作:Add | 影响:Linux 服务器运行入口 | 说明:新增包装脚本，统一加载 env、调用 Node 版机器人，并在 OneBot 不可达时写入清晰预检日志 | 关联:task004
change019 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.cron.example | 操作:Modify | 影响:服务器 cron 模板 | 说明:将 cron 示例改为调用包装脚本并改成服务器可替换的绝对路径形式 | 关联:task004
change020 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:服务器部署说明 | 说明:补充 Linux 服务器安装 Node、同步脚本、dry-run 与 cron 安装步骤，并说明远程 OneBot 地址要求 | 关联:task004
change021 日期:2026-03-30 | 文件:服务器:/opt/node-v24.14.1-linux-x64 | 操作:Add | 影响:Node 运行时 | 说明:在 redacted-host.example 安装独立 Node 24.14.1 运行时，供行情机器人 cron 使用 | 关联:task004
change022 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Add | 影响:服务器部署目录 | 说明:在 redacted-host.example 下同步 Node 版机器人脚本、env、包装脚本与日志目录，并完成 dry-run、预检日志和 cron 安装 | 关联:task004
change023 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:OneBot 自建说明 | 说明:补充 Linux 服务器通过 Docker 部署 NapCat 并将 OneBot 绑定到本机回环地址的用法说明 | 关联:task005
change024 日期:2026-03-30 | 文件:服务器:/home/ubuntu/napcat/docker-compose.yml | 操作:Add | 影响:OneBot 服务器部署 | 说明:在 redacted-host.example 上新增 NapCat Docker 编排，绑定 127.0.0.1:3000/3001/6099 并持久化 QQ 与配置目录 | 关联:task005
change025 日期:2026-03-30 | 文件:服务器:/home/ubuntu/napcat/qrcode.png | 操作:Add | 影响:QQ 登录入口 | 说明:从 NapCat 容器导出二维码图片，并保留 WebUI token 与扫码登录入口供人工授权 | 关联:task005
change026 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:OneBot 发送通道 | 说明:补充 OneBot WebSocket Server 兼容能力，并统一为 HTTP 优先、WS 兜底的配置解析与发送逻辑 | 关联:task006
change027 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot-run.sh | 操作:Modify | 影响:服务器预检 | 说明:让包装脚本同时支持 OneBot HTTP 健康检查和 WebSocket TCP 可达性预检 | 关联:task006
change028 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 ONEBOT_WS_URL 示例并说明 HTTP/WS 二选一的约束 | 关联:task006
change029 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:配置验证 | 说明:补充 OneBot WebSocket 配置解析测试并校验 HTTP 优先级 | 关联:task006
change030 日期:2026-03-30 | 文件:miniprogram/package.json | 操作:Modify | 影响:运行依赖 | 说明:新增 ws 依赖，用于 OneBot WebSocket Server 直连发送 | 关联:task006
change031 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:OneBot 说明 | 说明:补充 HTTP/WS 双接入方式、服务器预检行为和最新示例 env | 关联:task006
change032 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步最新脚本与 ws 依赖到 redacted-host.example，并再次通过 dry-run 与真实推送验证群播报成功 | 关联:task006
change033 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:36kr 新闻抓取与消息内容 | 说明:将 36kr 新闻抓取切换为当前可用的分类首屏 gateway 接口，稳定输出过去24小时科技5条与AI 5条，并保持 XAU、XAG、WTI、ETH、USDX、SH 的精简价格格式 | 关联:task007
change034 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地实际运行配置 | 说明:将实际运行条数调整为科技5条、AI 5条、财经10条，确保 dry-run 与线上播报条数一致 | 关联:task007
change035 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:更新最新价格顺序、USDX 说明以及 36kr 科技/AI 与东方财富财经新闻来源描述 | 关联:task007
change036 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步修正后的脚本与 env 到 redacted-host.example，并通过服务器 dry-run、OneBot 在线检查和 09:40/18:40 cron 校验确认新播报已就绪 | 关联:task007
change037 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:价格播报与新闻抓取 | 说明:将六项价格统一为中文名（英文代码）+ 24h 涨跌幅展示，科技与 AI 新闻切换到 Google News，财经新闻优先走东方财富妙享 skill，并把白银/原油/美元指数/上证行情抓取改为新浪优先、东方财富兜底以兼容本地与服务器环境 | 关联:task008
change038 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新价格来源、Google News 与东方财富妙享 skill 的实际说明，保持文档与当前播报版本一致 | 关联:task008
change039 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地运行配置 | 说明:补充东方财富妙享 skill 所需的 API key 与查询词，确保财经新闻默认走 skill 接口 | 关联:task008
change040 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步新版脚本与配置到 redacted-host.example，并通过线上 dry-run 校验价格与新闻均可正常生成 | 关联:task008
change041 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:Google 科技/AI 新闻筛选 | 说明:将 Google News 查询词调整为更偏全球公司、芯片、模型、智能体和算力主题，并新增标题噪音过滤与相关性排序，减少政务、院校和活动类结果 | 关联:task009
change042 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:新闻筛选验证 | 说明:补充 Google 新闻选择逻辑测试，校验噪音标题会被过滤且更相关的科技条目优先保留 | 关联:task009
change043 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 Google News 标题过滤与相关性排序说明，解释为何当前结果更偏全球科技/AI 行业动态 | 关联:task009
change044 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步优化后的 Google News 查询与筛选逻辑到 redacted-host.example，并通过服务器 dry-run 确认新闻结果更干净 | 关联:task009
change045 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:东方财富财经新闻筛选 | 说明:在妙享 skill 与公开快讯结果上新增经济日历/基建泛资讯过滤，并按股市、利率、汇率、财报、公司与政策等关键词做轻量排序，让财经 Top 10 更偏市场播报 | 关联:task010
change046 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:财经新闻验证 | 说明:补充财经新闻去噪与排序测试，校验经济日历和基建类快讯会被过滤，市场类新闻优先保留 | 关联:task010
change047 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充财经新闻的去噪与轻排序说明，明确当前 Top 10 更偏市场和公司动态 | 关联:task010
change048 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步优化后的财经新闻筛选逻辑到 redacted-host.example，并通过服务器 dry-run 确认财经列表更聚焦市场播报 | 关联:task010
change049 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:OneBot 多目标推送 | 说明:在保留现有群播报配置的前提下新增 ONEBOT_EXTRA_TARGETS，支持同一轮消息同时发送到多个 group/private 目标，并在控制台输出目标与真实消息 ID | 关联:task011
change050 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:OneBot 配置验证 | 说明:补充 ONEBOT_EXTRA_TARGETS 的解析与去重测试，校验群和私聊目标可同时配置 | 关联:task011
change051 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 ONEBOT_EXTRA_TARGETS 示例，说明如何追加私聊 QQ 或额外群目标 | 关联:task011
change052 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 OneBot 多目标与私聊 QQ 配置说明，明确可通过 private:QQ号 追加个人接收者 | 关联:task011
change053 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地实际运行配置 | 说明:在现有群目标外追加 ONEBOT_EXTRA_TARGETS=private:REDACTED_PRIVATE_QQ，使 QQ REDACTED_PRIVATE_QQ 成为同步接收者 | 关联:task012
change054 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.env | 操作:Modify | 影响:线上运行配置 | 说明:将 private:REDACTED_PRIVATE_QQ 同步到 redacted-host.example 的实际运行 env，并通过真实推送验证群与私聊目标同时生效 | 关联:task012
change055 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:科技/AI 新闻源与展示结构 | 说明:将科技与 AI 新闻合并为一个区块，并把数据源从聚合搜索结果切换为 IT之家、雷峰网、蓝点网的直连 feed，同时按中文科技/AI 关键词进行去噪和相关性排序 | 关联:task013
change056 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:科技/AI 新闻验证 | 说明:将测试更新为合并后的科技/AI Top 10 结构，并校验中文 feed 新闻的筛选与排序逻辑 | 关联:task013
change057 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 MARKET_TECH_AI_NEWS_LIMIT，并保留旧变量作为兼容回退，明确合并后新闻条数默认值 | 关联:task013
change058 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地实际运行配置 | 说明:显式写入 MARKET_TECH_AI_NEWS_LIMIT=10，使合并后的科技/AI 新闻区块固定输出 Top 10 | 关联:task013
change059 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:将新闻源说明更新为 IT之家、雷峰网、蓝点网，并把展示结构改为单一的科技/AI Top 10 区块 | 关联:task013
change060 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步合并后的科技/AI 新闻源与配置到 redacted-host.example，并通过服务器 dry-run 验证新新闻源生效 | 关联:task013
change061 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:价格文案、新闻总结与消息分片 | 说明:将价格文案收紧为黄金/白银/原油/以太坊/美元/上证并移除 24h 字样，同时让新闻总结优先选取完整短句、过滤 URL/半句噪音，并改为按总长度贪心合并消息块以减少 OneBot 分片 | 关联:task014
change062 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:消息与总结验证 | 说明:补充完整短句总结与贪心合并分片测试，并把价格文案断言更新为新简称和新涨跌幅格式 | 关联:task014
change063 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新价格简称、涨跌幅展示方式，以及新闻避免截断和减少分片的行为说明 | 关联:task014
change064 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步防截断与新价格文案逻辑到 redacted-host.example，并通过服务器 dry-run 验证线上播报已切到黄金/白银/原油/以太坊/美元/上证的新格式 | 关联:task014
change065 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 新闻标题、筛选与分隔样式 | 说明:将科技/AI 区块标题改为 AI，并收紧 AI 正负关键词以减少泛手机/活动资讯，同时压缩消息模块分隔线前后的空行 | 关联:task015
change066 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:AI 区块验证 | 说明:把测试标题断言改为 AI Top，并将筛选正例调整为更贴近 AI 新闻的数据样本 | 关联:task015
change067 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新 AI Top 10 标题、AI 偏向筛选说明和模块间距压缩说明 | 关联:task015
change068 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步 AI Top 10 标题、AI 偏向筛选和紧凑分隔样式到 redacted-host.example，并通过服务器 dry-run 验证线上输出已生效 | 关联:task015
change069 日期:2026-03-31 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:财经清洗与候选抓取 | 说明:为财经快讯新增站点前缀/公告模板/小程序码清洗、低质量残句过滤与标题兜底逻辑，并把东方财富原始候选抓取量扩到目标条数的四倍以便筛掉噪音后仍保留 Top 10 | 关联:task016
change070 日期:2026-03-31 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:财经筛选验证 | 说明:补充时代财经AI快讯、业绩说明会和公告说明会类样本，验证财经筛选会优先保留真正的市场动态 | 关联:task016
change071 日期:2026-03-31 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充财经区会额外清洗公告腔和汇总晨报，并优先用完整标题替换低质量残句的说明 | 关联:task016
change072 日期:2026-03-31 | 文件:.github/workflows/ci.yml | 操作:Add | 影响:GitHub 持续集成 | 说明:新增 GitHub Actions 工作流，在 push 到 main 和 Pull Request 时进入 miniprogram 子目录执行 npm test、lint、format:check 与 typecheck | 关联:task017
change073 日期:2026-03-31 | 文件:README.md | 操作:Modify | 影响:仓库首页说明 | 说明:新增仓库根 README 的持续集成说明，便于在 GitHub 首页直接了解自动校验内容 | 关联:task017
