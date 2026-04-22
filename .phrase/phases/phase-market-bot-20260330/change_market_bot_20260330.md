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
change021 日期:2026-03-30 | 文件:服务器:/opt/node-v24.14.1-linux-x64 | 操作:Add | 影响:Node 运行时 | 说明:在目标腾讯云服务器安装独立 Node 24.14.1 运行时，供行情机器人 cron 使用 | 关联:task004
change022 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Add | 影响:服务器部署目录 | 说明:在目标腾讯云服务器同步 Node 版机器人脚本、env、包装脚本与日志目录，并完成 dry-run、预检日志和 cron 安装 | 关联:task004
change023 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:OneBot 自建说明 | 说明:补充 Linux 服务器通过 Docker 部署 NapCat 并将 OneBot 绑定到本机回环地址的用法说明 | 关联:task005
change024 日期:2026-03-30 | 文件:服务器:/home/ubuntu/napcat/docker-compose.yml | 操作:Add | 影响:OneBot 服务器部署 | 说明:在目标腾讯云服务器上新增 NapCat Docker 编排，绑定 127.0.0.1:3000/3001/6099 并持久化 QQ 与配置目录 | 关联:task005
change025 日期:2026-03-30 | 文件:服务器:/home/ubuntu/napcat/qrcode.png | 操作:Add | 影响:QQ 登录入口 | 说明:从 NapCat 容器导出二维码图片，并保留 WebUI token 与扫码登录入口供人工授权 | 关联:task005
change026 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:OneBot 发送通道 | 说明:补充 OneBot WebSocket Server 兼容能力，并统一为 HTTP 优先、WS 兜底的配置解析与发送逻辑 | 关联:task006
change027 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot-run.sh | 操作:Modify | 影响:服务器预检 | 说明:让包装脚本同时支持 OneBot HTTP 健康检查和 WebSocket TCP 可达性预检 | 关联:task006
change028 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 ONEBOT_WS_URL 示例并说明 HTTP/WS 二选一的约束 | 关联:task006
change029 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:配置验证 | 说明:补充 OneBot WebSocket 配置解析测试并校验 HTTP 优先级 | 关联:task006
change030 日期:2026-03-30 | 文件:miniprogram/package.json | 操作:Modify | 影响:运行依赖 | 说明:新增 ws 依赖，用于 OneBot WebSocket Server 直连发送 | 关联:task006
change031 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:OneBot 说明 | 说明:补充 HTTP/WS 双接入方式、服务器预检行为和最新示例 env | 关联:task006
change032 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步最新脚本与 ws 依赖到目标腾讯云服务器，并再次通过 dry-run 与真实推送验证群播报成功 | 关联:task006
change033 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:36kr 新闻抓取与消息内容 | 说明:将 36kr 新闻抓取切换为当前可用的分类首屏 gateway 接口，稳定输出过去24小时科技5条与AI 5条，并保持 XAU、XAG、WTI、ETH、USDX、SH 的精简价格格式 | 关联:task007
change034 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地实际运行配置 | 说明:将实际运行条数调整为科技5条、AI 5条、财经10条，确保 dry-run 与线上播报条数一致 | 关联:task007
change035 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:更新最新价格顺序、USDX 说明以及 36kr 科技/AI 与东方财富财经新闻来源描述 | 关联:task007
change036 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步修正后的脚本与 env 到目标腾讯云服务器，并通过服务器 dry-run、OneBot 在线检查和 09:40/18:40 cron 校验确认新播报已就绪 | 关联:task007
change037 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:价格播报与新闻抓取 | 说明:将六项价格统一为中文名（英文代码）+ 24h 涨跌幅展示，科技与 AI 新闻切换到 Google News，财经新闻优先走东方财富妙享 skill，并把白银/原油/美元指数/上证行情抓取改为新浪优先、东方财富兜底以兼容本地与服务器环境 | 关联:task008
change038 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新价格来源、Google News 与东方财富妙享 skill 的实际说明，保持文档与当前播报版本一致 | 关联:task008
change039 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地运行配置 | 说明:补充东方财富妙享 skill 所需的 API key 与查询词，确保财经新闻默认走 skill 接口 | 关联:task008
change040 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步新版脚本与配置到目标腾讯云服务器，并通过线上 dry-run 校验价格与新闻均可正常生成 | 关联:task008
change041 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:Google 科技/AI 新闻筛选 | 说明:将 Google News 查询词调整为更偏全球公司、芯片、模型、智能体和算力主题，并新增标题噪音过滤与相关性排序，减少政务、院校和活动类结果 | 关联:task009
change042 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:新闻筛选验证 | 说明:补充 Google 新闻选择逻辑测试，校验噪音标题会被过滤且更相关的科技条目优先保留 | 关联:task009
change043 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 Google News 标题过滤与相关性排序说明，解释为何当前结果更偏全球科技/AI 行业动态 | 关联:task009
change044 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步优化后的 Google News 查询与筛选逻辑到目标腾讯云服务器，并通过服务器 dry-run 确认新闻结果更干净 | 关联:task009
change045 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:东方财富财经新闻筛选 | 说明:在妙享 skill 与公开快讯结果上新增经济日历/基建泛资讯过滤，并按股市、利率、汇率、财报、公司与政策等关键词做轻量排序，让财经 Top 10 更偏市场播报 | 关联:task010
change046 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:财经新闻验证 | 说明:补充财经新闻去噪与排序测试，校验经济日历和基建类快讯会被过滤，市场类新闻优先保留 | 关联:task010
change047 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充财经新闻的去噪与轻排序说明，明确当前 Top 10 更偏市场和公司动态 | 关联:task010
change048 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步优化后的财经新闻筛选逻辑到目标腾讯云服务器，并通过服务器 dry-run 确认财经列表更聚焦市场播报 | 关联:task010
change049 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:OneBot 多目标推送 | 说明:在保留现有群播报配置的前提下新增 ONEBOT_EXTRA_TARGETS，支持同一轮消息同时发送到多个 group/private 目标，并在控制台输出目标与真实消息 ID | 关联:task011
change050 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:OneBot 配置验证 | 说明:补充 ONEBOT_EXTRA_TARGETS 的解析与去重测试，校验群和私聊目标可同时配置 | 关联:task011
change051 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 ONEBOT_EXTRA_TARGETS 示例，说明如何追加私聊 QQ 或额外群目标 | 关联:task011
change052 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 OneBot 多目标与私聊 QQ 配置说明，明确可通过 private:QQ号 追加个人接收者 | 关联:task011
change053 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地实际运行配置 | 说明:在现有群目标外追加一个 private 目标，使私聊接收者成为同步接收者 | 关联:task012
change054 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.env | 操作:Modify | 影响:线上运行配置 | 说明:将新增 private 目标同步到目标腾讯云服务器的实际运行 env，并通过真实推送验证群与私聊目标同时生效 | 关联:task012
change055 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:科技/AI 新闻源与展示结构 | 说明:将科技与 AI 新闻合并为一个区块，并把数据源从聚合搜索结果切换为 IT之家、雷峰网、蓝点网的直连 feed，同时按中文科技/AI 关键词进行去噪和相关性排序 | 关联:task013
change056 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:科技/AI 新闻验证 | 说明:将测试更新为合并后的科技/AI Top 10 结构，并校验中文 feed 新闻的筛选与排序逻辑 | 关联:task013
change057 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 MARKET_TECH_AI_NEWS_LIMIT，并保留旧变量作为兼容回退，明确合并后新闻条数默认值 | 关联:task013
change058 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.env | 操作:Modify | 影响:本地实际运行配置 | 说明:显式写入 MARKET_TECH_AI_NEWS_LIMIT=10，使合并后的科技/AI 新闻区块固定输出 Top 10 | 关联:task013
change059 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:将新闻源说明更新为 IT之家、雷峰网、蓝点网，并把展示结构改为单一的科技/AI Top 10 区块 | 关联:task013
change060 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步合并后的科技/AI 新闻源与配置到目标腾讯云服务器，并通过服务器 dry-run 验证新新闻源生效 | 关联:task013
change061 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:价格文案、新闻总结与消息分片 | 说明:将价格文案收紧为黄金/白银/原油/以太坊/美元/上证并移除 24h 字样，同时让新闻总结优先选取完整短句、过滤 URL/半句噪音，并改为按总长度贪心合并消息块以减少 OneBot 分片 | 关联:task014
change062 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:消息与总结验证 | 说明:补充完整短句总结与贪心合并分片测试，并把价格文案断言更新为新简称和新涨跌幅格式 | 关联:task014
change063 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新价格简称、涨跌幅展示方式，以及新闻避免截断和减少分片的行为说明 | 关联:task014
change064 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步防截断与新价格文案逻辑到目标腾讯云服务器，并通过服务器 dry-run 验证线上播报已切到黄金/白银/原油/以太坊/美元/上证的新格式 | 关联:task014
change065 日期:2026-03-30 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 新闻标题、筛选与分隔样式 | 说明:将科技/AI 区块标题改为 AI，并收紧 AI 正负关键词以减少泛手机/活动资讯，同时压缩消息模块分隔线前后的空行 | 关联:task015
change066 日期:2026-03-30 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:AI 区块验证 | 说明:把测试标题断言改为 AI Top，并将筛选正例调整为更贴近 AI 新闻的数据样本 | 关联:task015
change067 日期:2026-03-30 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新 AI Top 10 标题、AI 偏向筛选说明和模块间距压缩说明 | 关联:task015
change068 日期:2026-03-30 | 文件:服务器:/home/ubuntu/stock-bot | 操作:Modify | 影响:线上运行版本 | 说明:同步 AI Top 10 标题、AI 偏向筛选和紧凑分隔样式到目标腾讯云服务器，并通过服务器 dry-run 验证线上输出已生效 | 关联:task015
change069 日期:2026-03-31 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:财经清洗与候选抓取 | 说明:为财经快讯新增站点前缀/公告模板/小程序码清洗、低质量残句过滤与标题兜底逻辑，并把东方财富原始候选抓取量扩到目标条数的四倍以便筛掉噪音后仍保留 Top 10 | 关联:task016
change070 日期:2026-03-31 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:财经筛选验证 | 说明:补充时代财经AI快讯、业绩说明会和公告说明会类样本，验证财经筛选会优先保留真正的市场动态 | 关联:task016
change071 日期:2026-03-31 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充财经区会额外清洗公告腔和汇总晨报，并优先用完整标题替换低质量残句的说明 | 关联:task016
change072 日期:2026-03-31 | 文件:.github/workflows/ci.yml | 操作:Add | 影响:GitHub 持续集成 | 说明:新增 GitHub Actions 工作流，在 push 到 main 和 Pull Request 时进入 miniprogram 子目录执行 npm test、lint、format:check 与 typecheck | 关联:task017
change073 日期:2026-03-31 | 文件:README.md | 操作:Modify | 影响:仓库首页说明 | 说明:新增仓库根 README 的持续集成说明，便于在 GitHub 首页直接了解自动校验内容 | 关联:task017
change074 日期:2026-03-31 | 文件:README.md | 操作:Modify | 影响:GitHub 仓库首页 | 说明:在仓库根 README 顶部新增 GitHub Actions CI badge，便于在仓库首页直接查看当前自动检查状态 | 关联:task018
change075 日期:2026-03-31 | 文件:GitHub仓库:tinyhu666/QQbotStock | 操作:Modify | 影响:仓库元信息 | 说明:将 GitHub 仓库描述更新为 QQ 行情播报机器人与微信小程序工程说明，并验证新仓库名 QQbotStock 已生效 | 关联:task018
change076 日期:2026-03-31 | 文件:GitHub仓库:tinyhu666/QQbotStock/main | 操作:Modify | 影响:分支保护检查 | 说明:检查私有仓库 main 分支保护时，GitHub 返回当前账号套餐需升级到 GitHub Pro 或改为公开仓库，故未强行写入失败配置 | 关联:task018
change077 日期:2026-03-31 | 文件:README.md | 操作:Modify | 影响:仓库首页说明 | 说明:以 GitHub 网页端当前 README 为准同步本地首页内容，并将标题和 CI badge 链接统一更新为 qq-market-bot | 关联:task019
change078 日期:2026-03-31 | 文件:GitHub仓库:tinyhu666/qq-market-bot | 操作:Modify | 影响:仓库名称与 URL | 说明:将 GitHub 私有仓库从 QQbotStock 更名为 qq-market-bot，统一仓库展示名称与远端地址 | 关联:task019
change079 日期:2026-03-31 | 文件:.git/config | 操作:Modify | 影响:origin 远端 | 说明:将本地 origin 更新为 git@github.com:tinyhu666/qq-market-bot.git，确保后续 push 指向新仓库 | 关联:task019
change080 日期:2026-03-31 | 文件:miniprogram/README.md | 操作:Modify | 影响:示例配置说明 | 说明:将公开 README 中的真实群号和私聊 QQ 示例替换为占位演示值，避免继续暴露真实接收目标 | 关联:task020
change081 日期:2026-03-31 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:测试示例数据 | 说明:将测试中的真实群号、私聊 QQ 和真实 QQ 官方 appId 替换为演示值，保留相同断言结构 | 关联:task020
change082 日期:2026-03-31 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:把 phase 任务中的真实服务器域名、群号和私聊 QQ 替换为占位符，并新增仓库去敏任务 | 关联:task020
change083 日期:2026-03-31 | 文件:.phrase/phases/phase-market-bot-20260330/change_market_bot_20260330.md | 操作:Modify | 影响:阶段变更记录 | 说明:把 phase change 文档中的真实服务器域名和私聊接收者描述替换为通用表述，减少公开运维标识暴露 | 关联:task020
change084 日期:2026-03-31 | 文件:本地备份:/tmp/qq-market-bot-pre-history-rewrite-20260331-021948.bundle | 操作:Add | 影响:历史回滚保障 | 说明:在改写 Git 历史前创建完整 bundle 备份，便于必要时恢复重写前的全部提交链 | 关联:task021
change085 日期:2026-03-31 | 文件:Git历史:main | 操作:Modify | 影响:提交对象与历史内容 | 说明:对仓库全部历史提交执行字符串替换重写，清除旧的真实群号、私聊 QQ、服务器域名和旧 appId，并清理 refs/original 与 reflog | 关联:task021
change086 日期:2026-03-31 | 文件:GitHub仓库:tinyhu666/qq-market-bot/main | 操作:Modify | 影响:远端主分支历史 | 说明:通过 force-with-lease 推送新的提交链，让 GitHub 远端 main 与本地历史去敏结果保持一致 | 关联:task021
change087 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:三段定时价格播报与新闻源链路 | 说明:将价格区扩展到 XAU/XAG/WTI/ETH/NDX/SPX/USDX/SH，补充新浪全球指数解析，并把财经新闻主源切到第一财经资讯页与 36氪快讯，同时为 AI 新闻新增 36氪 文章源、近似去重和多标题清洗 | 关联:task022
change088 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 NDX/SPX、AI 近似去重、多标题清洗以及财经标题型源去重与 clickbait 过滤测试 | 关联:task022
change089 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.cron.example | 操作:Modify | 影响:定时执行模板 | 说明:将 cron 示例更新为每天 09:25、13:25、18:25 执行 | 关联:task022
change090 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新三段定时时间、八个价格品种、新的 AI/财经新闻源和最新输出结构说明 | 关联:task022
change091 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充三段定时、NDX/SPX 和标题型新闻源优化的阶段优先级与风险说明 | 关联:task022
change092 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:将当前目标更新为 09:25/13:25/18:25 的八品种播报，并明确新新闻源链路与验收标准 | 关联:task022
change093 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task022，记录三段定时、NDX/SPX 与新新闻源替换需求 | 关联:task022
change094 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:NDX/SPX 行情抓取 | 说明:将 NDX/SPX 默认数据源从新浪全球指数切换为 CNBC 行情页，并在页面不可用时回退到 Stooq 价格快照，避免服务器出口被新浪拦截导致上线失败 | 关联:task023
change095 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 CNBC 页面解析与 Stooq 兜底抓取测试，覆盖服务器侧 NDX/SPX 替代源链路 | 关联:task023
change096 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:将 NDX/SPX 数据源说明更新为 CNBC+Stooq，并补充 ONEBOT_EXTRA_TARGETS 同时追加多个私聊接收者的示例 | 关联:task023
change097 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:补充服务器访问新浪全球指数接口被拦截时的替代源要求，以及群+多个私聊接收者的验收条件 | 关联:task023
change098 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充新浪接口 Forbidden 风险、CNBC 结构变更风险，以及多个私聊接收者的优先级 | 关联:task023
change099 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:修正 task022 的 NDX/SPX 描述并新增完成 task023，记录第二个私聊接收者和服务器侧替代源上线 | 关联:task023
change100 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.env | 操作:Modify | 影响:OneBot 接收目标 | 说明:将 ONEBOT_EXTRA_TARGETS 更新为两个私聊接收者，确保同一轮播报同时送达群和两个个人 QQ | 关联:task023
change101 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.mjs | 操作:Modify | 影响:线上 NDX/SPX 行情链路 | 说明:同步支持 CNBC+Stooq 的最新脚本到服务器运行目录，并替换旧的新浪全球指数实现 | 关联:task023
change102 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:线上验证脚本 | 说明:同步新的 CNBC/Stooq 单元测试到服务器，并使用独立 Node 运行时完成远端测试通过 | 关联:task023
change103 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/README.md | 操作:Modify | 影响:服务器部署目录说明 | 说明:同步最新 README 到服务器目录，保持线上目录中的运维说明与仓库现状一致 | 关联:task023
change104 日期:2026-04-01 | 文件:服务器:crontab | 操作:Modify | 影响:定时执行 | 说明:确认服务器 cron 采用每天 09:25、13:25、18:25 执行包装脚本，并完成 dry-run 与真实推送验证 | 关联:task023
change105 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:跨时段新闻去重 | 说明:新增按上海时区记录当天已发送新闻的状态文件读写，并在第二次、第三次推送前过滤当天已发过的 AI/财经条目 | 关联:task024
change106 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充“上午已发过的新闻在当天后续推送里会被过滤，并在无新增时提示今天暂无新的新闻”的集成测试 | 关联:task024
change107 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 MARKET_DAILY_NEWS_DEDUPE 与 MARKET_NEWS_STATE_FILE 示例，明确默认开启当天三次推送不重复逻辑 | 关联:task024
change108 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充当天三次推送去重规则、无新增新闻提示，以及新闻状态文件配置说明 | 关联:task024
change109 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:补充按天去重、无新增提示和状态文件容错的验收要求 | 关联:task024
change110 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:新增每天三次推送间新闻不重复的优先级要求与状态文件损坏风险记录 | 关联:task024
change111 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task024，记录跨时段新闻去重需求与验证方式 | 关联:task024
change112 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.mjs | 操作:Modify | 影响:线上跨时段新闻去重 | 说明:将支持当天新闻状态记忆的最新脚本同步到服务器运行目录，用于拦截 09:25/13:25/18:25 三次推送中的重复新闻 | 关联:task024
change113 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot-news-state.json | 操作:Add | 影响:线上新闻去重状态 | 说明:首次真实推送后生成当天新闻指纹状态文件，记录已发送的 AI/财经新闻，供同日后续推送过滤重复内容 | 关联:task024
change114 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/logs/qq-market-bot.log | 操作:Modify | 影响:线上验证日志 | 说明:完成一次真实推送后立刻执行 dry-run，确认财经区已显示“今天暂无新的新闻。”，验证跨时段去重在服务器端生效 | 关联:task024
change115 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI Top 10 生成链路 | 说明:新增 Gemini 主调用、DeepSeek 备用回退和本地规则兜底，并将 Gemini 默认超时调到 45 秒，同时补上模型返回条数不足时自动回填到 Top 10 的逻辑 | 关联:task025
change116 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 Gemini 主调用、DeepSeek 回退，以及模型少返回时自动补齐剩余 AI 条目的测试 | 关联:task025
change117 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:新增 AI 新闻 LLM 的主备 provider、Gemini/DeepSeek 模型与 API key 配置项，并同步默认 45 秒超时 | 关联:task025
change118 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 AI Top 10 由大模型筛选与总结、Gemini 主 DeepSeek 备的配置说明，并更新每天三次播报与超时默认值文档 | 关联:task025
change119 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:把 AI 新闻改为大模型筛选与中文总结，并明确 Gemini/DeepSeek 鉴权、额度、超时异常时的回退验收标准 | 关联:task025
change120 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:新增 AI Top 10 的大模型化优先级，并记录 Gemini / DeepSeek 回退和超时风险 | 关联:task025
change121 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task025，记录 AI 新闻改由大模型处理及服务器主备 key 配置要求 | 关联:task025
change122 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.env | 操作:Modify | 影响:线上 AI 新闻模型配置 | 说明:将服务器运行配置更新为 Gemini 主 provider、DeepSeek 备用 provider，并写入对应模型、API key 与 45 秒超时设置 | 关联:task025
change123 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.mjs | 操作:Modify | 影响:线上 AI Top 10 生成链路 | 说明:同步带有 Gemini/DeepSeek 主备与 Top 10 自动补齐逻辑的最新脚本到服务器运行目录 | 关联:task025
change124 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:线上验证脚本 | 说明:同步新的 AI 新闻 LLM 测试到服务器，并使用独立 Node 运行时完成远端测试通过 | 关联:task025
change125 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/README.md | 操作:Modify | 影响:服务器部署目录说明 | 说明:同步最新 README 到服务器目录，保持线上运维目录对 LLM 主备配置与默认超时的说明一致 | 关联:task025
change126 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot-run.sh --dry-run | 操作:Modify | 影响:线上 dry-run 验证 | 说明:验证服务器配置已生效，远端 dry-run 成功输出 AI Top 10 与财经 Top 10，确认不会再出现 AI Top 6 的回归 | 关联:task025
change127 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:新闻生成与去重链路 | 说明:为 AI 候选增加国际/国内分类与 7+3 配比回填，为财经新闻增加大模型精简总结，并把跨栏目去重扩展到同轮播报和当天状态记忆 | 关联:task026
change128 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充国际/国内分类、AI 7+3 配比、财经新闻 LLM 总结以及 AI/财经跨栏目去重测试 | 关联:task026
change129 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 AI Top 10 采用 7 条国际 + 3 条国内新闻、财经新闻也走大模型总结，以及跨栏目去重的行为说明 | 关联:task026
change130 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增 AI 7+3 配比、财经新闻大模型总结与 AI/财经跨栏目去重的目标、边界与验收标准 | 关联:task026
change131 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 AI 国际/国内配比优先级、财经摘要大模型化，以及跨栏目去重风险记录 | 关联:task026
change132 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task026，记录 AI 7+3 配比、财经 LLM 总结和跨栏目去重需求 | 关联:task026
change133 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.mjs | 操作:Modify | 影响:线上新闻生成与去重链路 | 说明:同步带有 AI 7+3 配比、财经新闻 LLM 精简总结和跨栏目去重逻辑的最新脚本到服务器运行目录 | 关联:task026
change134 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:线上验证脚本 | 说明:同步 task026 的新增测试到服务器，并用独立 Node 运行时验证 20 项测试全部通过 | 关联:task026
change135 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/README.md | 操作:Modify | 影响:服务器部署目录说明 | 说明:同步最新 README 到服务器目录，使线上运维文档与 AI 7+3 配比、财经 LLM 总结和跨栏目去重行为保持一致 | 关联:task026
change136 日期:2026-04-01 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot-run.sh --dry-run | 操作:Modify | 影响:线上 dry-run 验证 | 说明:使用临时新闻状态文件完成远端 dry-run，确认 Gemini 超时时会回退 DeepSeek，AI 区仍为 7+3 配比且财经区改为更精简的不重复摘要 | 关联:task026
change137 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 新闻候选源与解析链路 | 说明:将 AI 候选源升级为 OpenAI News、Google AI、NVIDIA、VentureBeat、量子位与 AIBase 组合，并新增 Atom/HTML 解析、源权重和半句标题过滤 | 关联:task027
change138 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 AIBase 列表解析、Atom feed 解析及高权重源优先排序测试 | 关联:task027
change139 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:更新 AI 新闻源说明，明确国际/国内主候选源组合、AIBase 低权重补充和 Atom/HTML 兼容策略 | 关联:task027
change140 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:补充 AI 新闻主候选源升级目标，以及对 RSS/Atom/HTML 多入口解析的验收与风险描述 | 关联:task027
change141 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 AI 源升级优先级与多类 feed 结构变动风险，并记录 task027 | 关联:task027
change142 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task027，记录 AI 候选源切换、AIBase 低权重接入及半句标题过滤需求 | 关联:task027
change143 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:最终消息去重与 AI 候选过滤 | 说明:补充低优先级聚合源 clickbait 标题过滤，并在 AI/财经区块组装为最终消息前基于标题和摘要联合做一次消息级去重 | 关联:task028
change144 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充消息级去重与低质量聚合标题过滤测试，并把 dry-run 断言更新为重复新闻被去重后显示“今天暂无新的新闻。” | 关联:task028
change145 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充每条最终消息发送前还会执行一次消息级去重的行为说明，明确不会在同一条消息内重复同题新闻 | 关联:task028
change146 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增消息级去重目标、边界条件和验收标准，明确大模型摘要近似时仍需去重 | 关联:task028
change147 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充消息级去重优先级与标题+摘要联合去重风险记录，并登记 task028 | 关联:task028
change148 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task028，记录最终消息内不重复新闻与无新增提示的要求 | 关联:task028
change149 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 成品摘要过滤 | 说明:为 AI 大模型输出补充营销腔、英文残留、口语化和评论腔识别规则，并在摘要不合格时优先回退到更稳妥的原标题或其他候选条目 | 关联:task029
change150 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 AI clickbait、英文残留、口语化总结回退测试，覆盖大模型输出质量过滤场景 | 关联:task029
change151 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 AI 大模型总结如果出现营销腔、半句或 clickbait 风格，会自动回退标题或其他候选条目的说明 | 关联:task029
change152 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增 AI 成品摘要风格过滤目标与验收要求，明确英文残留和评论腔不能直接进入最终播报 | 关联:task029
change153 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 AI 成品摘要过滤优先级与模型风格失真风险，并登记 task029 | 关联:task029
change154 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task029，记录 AI 最终摘要质量继续收紧的需求与验证方式 | 关联:task029
change155 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 提示词与最终摘要质量 | 说明:继续收紧 AI LLM prompt，并新增主体不明确、招聘/校招、自媒体腔和八卦反转类摘要/标题过滤规则，优先回退到更稳妥的标题表达 | 关联:task030
change156 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充主体不明确摘要回退测试，并把招聘/校招、自媒体腔样例加入 AI 候选过滤测试 | 关联:task030
change157 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 AI 总结会继续过滤主体不明确、招聘/校招和自媒体腔输出的说明 | 关联:task030
change158 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增 AI 硬新闻口吻、主体明确和招聘/自媒体腔过滤的验收要求 | 关联:task030
change159 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 AI 提示词继续收紧和 Gemini/DeepSeek 回退风格一致性的优先级与风险 | 关联:task030
change160 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task030，记录 AI 硬新闻口吻和招聘/主体不明确内容过滤的需求与验证方式 | 关联:task030
change161 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 热度排序与最终榜单 | 说明:为 AI 候选补充基于来源权威度、事件信号、发布时间与跨源覆盖的热度分，并把 AI LLM 输出改为过去24小时热榜的统一排序结果，在满足 7+3 配比前提下按总热度混排 | 关联:task031
change162 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 AI 热度排序测试，并将 AI LLM 测试更新为统一热榜 items 输出，校验最终结果按热度混排且保持 7+3 配比 | 关联:task031
change163 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 AI Top 10 改为过去24小时热榜、热度评分维度以及 7+3 前提下按总热度混排的说明 | 关联:task031
change164 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增 AI Top 10 作为过去24小时统一热榜的目标、边界条件与验收要求 | 关联:task031
change165 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 AI 热榜混排优先级与热度评分依赖来源权重、时间和覆盖度的风险说明 | 关联:task031
change166 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task031，记录过去24小时 AI 热榜、7+3 配比和总热度混排需求 | 关联:task031
change167 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 热榜质量与区域识别 | 说明:补充联想、高德等国内公司关键词，并继续收紧会员优惠、限时折扣类促销文案过滤，避免 7+3 配比失真和热榜混入平台活动广告 | 关联:task031
change168 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充联想/高德的国内区域识别断言，并将促销文案样例纳入 AI 候选过滤测试 | 关联:task031
change169 日期:2026-04-01 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 热榜最终排序与摘要回退 | 说明:让 AI Top 10 在最终输出时优先保持大模型返回的热榜顺序，并在摘要漏掉仓库名、产品名、模型名或版本号时自动回退标题 | 关联:task032
change170 日期:2026-04-01 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 AI 热榜顺序不再被本地热度分洗牌，以及摘要遗漏关键仓库名时回退标题的回归测试 | 关联:task032
change171 日期:2026-04-01 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 AI 热榜最终顺序优先尊重大模型返回结果，以及摘要遗漏关键实体名时自动回退标题的说明 | 关联:task032
change172 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增 AI 热榜最终顺位保持和关键仓库名/模型名保留要求 | 关联:task032
change173 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 AI 热榜收尾阶段二次重排与关键实体名丢失的风险和优先级 | 关联:task032
change174 日期:2026-04-01 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task032，记录 AI 热榜顺序保持与关键实体名保留需求 | 关联:task032
change175 日期:2026-04-02 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 默认候选源 | 说明:将 AIBase 从默认 AI 主榜候选源列表中移除，仅保留 HTML 列表页解析器备用，优先保证 AI Top 10 质量 | 关联:task033
change176 日期:2026-04-02 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:同步更新 AI 新闻默认源说明，明确 AIBase 默认禁用、仅保留备用解析器 | 关联:task033
change177 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:将 AIBase 调整为备用解析能力，不再属于默认主榜候选源组合 | 关联:task033
change178 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充质量优先时可直接移除低质量聚合补充源，并记录 7+3 可能短时回填的风险 | 关联:task033
change179 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task033，记录 AIBase 默认移除和质量优先策略 | 关联:task033
change180 日期:2026-04-02 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:新闻去重主流程 | 说明:移除当天跨时段新闻状态过滤与写回，仅保留单轮消息内和跨栏目去重，避免热点在后续时段被跳过 | 关联:task034
change181 日期:2026-04-02 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:将跨时段去重测试改为“不同时间段允许重复热点”，并断言不再写入当天新闻状态 | 关联:task034
change182 日期:2026-04-02 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:更新新闻去重说明为仅限单条最终消息内，不再进行跨时段去重 | 关联:task034
change183 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:将新闻去重口径调整为只在单轮消息内生效，明确不同时间段允许重复热点 | 关联:task034
change184 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:将去重优先级改为单轮消息内去重，并记录跨时段重复是可接受取舍 | 关联:task034
change185 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task034，记录只保留单条消息内去重的需求与验证方式 | 关联:task034
change186 日期:2026-04-02 | 文件:/home/ubuntu/stock-bot/scripts/qq-market-bot.env | 操作:Modify | 影响:OneBot 接收目标 | 说明:清空 `ONEBOT_EXTRA_TARGETS`，仅保留群 `91637082` 作为唯一播报目标，暂时移除两个私聊 QQ 以降低风控风险 | 关联:task035
change187 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task035，记录 OneBot 推送暂时只保留群聊目标的运营调整 | 关联:task035
change188 日期:2026-04-02 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 新闻默认模型配置 | 说明:将 AI 新闻 LLM 默认 provider 与 fallback 都切为 DeepSeek，并同步更新脚本帮助文案中的默认口径 | 关联:task036
change189 日期:2026-04-02 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:将示例环境变量改为 DeepSeek-only，并把 Gemini 配置调整为手动切换时才启用的注释项 | 关联:task036
change190 日期:2026-04-02 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:将 AI 新闻 LLM 的默认说明改为 DeepSeek-only，并明确 Gemini 仅作为手动切回时的兼容 provider | 关联:task036
change191 日期:2026-04-02 | 文件:服务器:/home/ubuntu/stock-bot/scripts/qq-market-bot.env | 操作:Modify | 影响:线上 AI 新闻模型配置 | 说明:清空线上 Gemini API key，并将主 provider 与 fallback 都切为 DeepSeek，避免继续触发 Gemini 配额和双 provider 调用 | 关联:task036
change192 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:将默认 AI 模型链路从 Gemini 主、DeepSeek 备更新为默认 DeepSeek-only | 关联:task036
change193 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:同步更新 AI 模型默认链路优先级与 DeepSeek-only 风险说明 | 关联:task036
change194 日期:2026-04-02 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task036，记录移除 Gemini API key 并切为 DeepSeek-only 的运维调整 | 关联:task036
change195 日期:2026-04-03 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:AI 热榜摘要链路 | 说明:将英文国际 AI 热榜改为按热榜顺序逐条调用 DeepSeek 生成中文硬新闻摘要，并在模型摘要不合格时增加规则化中文兜底与更窄的关键词保护，修复 AI 区异常缩水到 2-4 条和空话摘要问题 | 关联:task037
change196 日期:2026-04-03 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 AI 摘要尾句清洗断言，并覆盖关键词保留与标题回退相关回归，保证英文国际源不会再被误杀 | 关联:task037
change197 日期:2026-04-03 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:新增英文国际 AI 标题逐条摘要、规则化中文兜底与“不再跨时段去重”的当前规格说明，并补充 AI 区异常缩水的边界与验收要求 | 关联:task037
change198 日期:2026-04-03 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充英文国际 AI 标题逐条总结优先级，以及 DeepSeek 对英文标题漏项时需要规则兜底的风险记录 | 关联:task037
change199 日期:2026-04-03 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task037，记录 AI Top 不再异常缩水且过滤空话摘要的修复任务 | 关联:task037
change200 日期:2026-04-19 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:消息模块与新闻抓取 | 说明:新增 `Follow Builder` 独立区块，接入 `follow-builders` 公开 feed 的 X/blogs/podcasts 数据，并补充筛选、LLM 总结与跨栏目去重链路 | 关联:task038
change201 日期:2026-04-19 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 `Follow Builder` 模块的配置、选择逻辑与最终消息输出断言，并更新 runMarketPush dry-run/去重回归测试 | 关联:task038
change202 日期:2026-04-19 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:新增 `Follow Builder` 模块说明、数据源口径、消息去重描述与示例输出 | 关联:task038
change203 日期:2026-04-19 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:补充 `MARKET_FOLLOW_BUILDER_NEWS_LIMIT` 示例项，方便独立控制 Follow Builder 模块条数 | 关联:task038
change204 日期:2026-04-19 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:将消息结构更新为价格 + AI + Follow Builder + 财经，并补充该模块的目标、边界与验收要求 | 关联:task038
change205 日期:2026-04-19 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 Follow Builder 模块接入优先级，以及 raw GitHub feed 为空和跨栏目撞题的风险说明 | 关联:task038
change206 日期:2026-04-19 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task038，记录 Follow Builder 作为独立消息模块接入的需求与验证方式 | 关联:task038
change207 日期:2026-04-19 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:X/blog 区块输出 | 说明:将新增模块更名为 `X/blog`，收敛为 `X + blog` 源，并把最终消息固定为最多前 5 条加统一详情链接，优先跳转到真实详情页 | 关联:task039
change208 日期:2026-04-19 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充 X/blog 标题、前 5 条预览和详情链接断言，并更新现有 dry-run 与最终消息回归测试 | 关联:task039
change209 日期:2026-04-19 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:将新增模块说明统一更名为 X/blog，并补充“最多 5 条 + 点击查看详情链接”的展示规则 | 关联:task039
change210 日期:2026-04-19 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:将消息结构中的 Follow Builder 更名为 X/blog，并补充最终消息只展示前 5 条和详情链接优先跳真实详情页的验收标准 | 关联:task039
change211 日期:2026-04-19 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 X/blog 固定前 5 条预览的优先级，以及超出部分通过统一详情链接承接的风险说明 | 关联:task039
change212 日期:2026-04-19 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task039，记录 X/blog 更名、长度控制与详情链接需求 | 关联:task039
change213 日期:2026-04-20 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:X/blog 候选聚合与总结 | 说明:将 X/blog 候选改为按博主聚合，同一博主多条动态先合并再总结，并加强候选提示词避免重复刷屏 | 关联:task040
change214 日期:2026-04-20 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:补充同一博主多条动态合并为单条记录的断言，验证保留合并信息且不再重复展示同一博主 | 关联:task040
change215 日期:2026-04-20 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:补充 X/blog 模块按博主聚合、同一博主只保留一条合并记录的当前行为说明 | 关联:task040
change216 日期:2026-04-20 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:补充 X/blog 模块按博主聚合和单轮消息单博主只保留一条的验收要求 | 关联:task040
change217 日期:2026-04-20 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:补充 X/blog 候选按博主聚合的优先级，避免单轮消息被同一博主多条动态刷屏 | 关联:task040
change218 日期:2026-04-20 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task040，记录 X/blog 按博主聚合和去重收紧需求 | 关联:task040
change219 日期:2026-04-22 | 文件:miniprogram/scripts/qq-market-bot.mjs | 操作:Modify | 影响:新闻模块与 AI 候选筛选 | 说明:移除 `X/blog` 模块的抓取、配置与输出链路，并新增 AI 硬新闻信号过滤，优先保留主体明确且带动作的行业新闻 | 关联:task041
change220 日期:2026-04-22 | 文件:miniprogram/tests/qq-market-bot.test.mjs | 操作:Modify | 影响:脚本验证 | 说明:删除 `X/blog` 相关回归断言，改为验证当前仅保留 AI/财经结构与消息级去重 | 关联:task041
change221 日期:2026-04-22 | 文件:miniprogram/README.md | 操作:Modify | 影响:机器人说明文档 | 说明:将消息结构回写为价格 + AI + 财经，并补充 AI 候选优先保留硬新闻信号的当前口径 | 关联:task041
change222 日期:2026-04-22 | 文件:miniprogram/scripts/qq-market-bot.env.example | 操作:Modify | 影响:示例配置 | 说明:移除已废弃的 `MARKET_FOLLOW_BUILDER_NEWS_LIMIT` 示例项，保持当前配置口径与运行链路一致 | 关联:task041
change223 日期:2026-04-22 | 文件:.phrase/phases/phase-market-bot-20260330/spec_market_bot_20260330.md | 操作:Modify | 影响:阶段规格 | 说明:移除 `X/blog` 当前规格，更新为三段消息结构并补充 AI 质量收紧要求 | 关联:task041
change224 日期:2026-04-22 | 文件:.phrase/phases/phase-market-bot-20260330/plan_market_bot_20260330.md | 操作:Modify | 影响:阶段计划 | 说明:移除 `X/blog` 优先级与风险描述，补充当前 AI 质量优先与硬新闻候选筛选的执行计划 | 关联:task041
change225 日期:2026-04-22 | 文件:.phrase/phases/phase-market-bot-20260330/task_market_bot_20260330.md | 操作:Modify | 影响:阶段任务记录 | 说明:新增并完成 task041，记录移除 `X/blog` 和继续修复 AI 新闻质量的需求 | 关联:task041
