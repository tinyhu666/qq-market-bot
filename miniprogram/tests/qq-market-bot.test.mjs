import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReportMessages,
  classifyTechAiNewsRegion,
  dedupeNewsSectionsForMessage,
  fetchNewsSection,
  fetchQuote,
  formatReport,
  generateFinanceNewsWithLlm,
  generateTechAiNewsWithLlm,
  normalizeSummaryLine,
  normalizeTechAiGeneratedSummaryLine,
  parseAibaseNewsItems,
  parseTechAiSourceItems,
  readConfig,
  runMarketPush,
  selectFinanceNewsItems,
  selectTechAiHotlistItems,
  selectTechAiNewsItems,
} from '../scripts/qq-market-bot.mjs';

test('readConfig parses onebot configuration', () => {
  const config = readConfig({
    TWELVE_DATA_API_KEY: 'demo-key',
    QQ_BOT_MODE: 'onebot',
    ONEBOT_HTTP_URL: 'http://127.0.0.1:3000/',
    ONEBOT_MESSAGE_TYPE: 'group',
    ONEBOT_TARGET_ID: '123456',
  });

  assert.equal(config.mode, 'onebot');
  assert.equal(config.onebotTransport, 'http');
  assert.equal(config.onebotHttpUrl, 'http://127.0.0.1:3000');
  assert.equal(config.onebotMessageType, 'group');
  assert.equal(config.onebotTargetId, '123456');
  assert.deepEqual(config.onebotTargets, [
    {
      messageType: 'group',
      targetId: '123456',
    },
  ]);
  assert.deepEqual(
    config.symbols.map((item) => item.label),
    ['XAU', 'XAG', 'WTI', 'ETH', 'NDX', 'SPX', 'USDX', 'SH'],
  );
});

test('readConfig parses onebot websocket configuration', () => {
  const config = readConfig({
    TWELVE_DATA_API_KEY: 'demo-key',
    QQ_BOT_MODE: 'onebot',
    ONEBOT_WS_URL: 'ws://127.0.0.1:3001/',
    ONEBOT_MESSAGE_TYPE: 'group',
    ONEBOT_TARGET_ID: '123456',
  });

  assert.equal(config.mode, 'onebot');
  assert.equal(config.onebotTransport, 'ws');
  assert.equal(config.onebotWsUrl, 'ws://127.0.0.1:3001');
  assert.equal(config.onebotHttpUrl, '');
});

test('readConfig defaults ai llm provider to deepseek only', () => {
  const config = readConfig({
    TWELVE_DATA_API_KEY: 'demo-key',
    QQ_BOT_MODE: 'onebot',
    ONEBOT_HTTP_URL: 'http://127.0.0.1:3000',
    ONEBOT_MESSAGE_TYPE: 'group',
    ONEBOT_TARGET_ID: '123456',
  });

  assert.equal(config.aiNewsLlmProvider, 'deepseek');
  assert.equal(config.aiNewsLlmFallbackProvider, 'deepseek');
});

test('readConfig parses onebot extra targets for group and private delivery', () => {
  const config = readConfig({
    TWELVE_DATA_API_KEY: 'demo-key',
    QQ_BOT_MODE: 'onebot',
    ONEBOT_HTTP_URL: 'http://127.0.0.1:3000',
    ONEBOT_MESSAGE_TYPE: 'group',
    ONEBOT_TARGET_ID: '123456789',
    ONEBOT_EXTRA_TARGETS: 'private:987654321,group:123456,private:987654321',
  });

  assert.deepEqual(config.onebotTargets, [
    {
      messageType: 'group',
      targetId: '123456789',
    },
    {
      messageType: 'private',
      targetId: '987654321',
    },
    {
      messageType: 'group',
      targetId: '123456',
    },
  ]);
});

test('readConfig allows missing official target in dry-run/auth-check flows', () => {
  const config = readConfig(
    {
      TWELVE_DATA_API_KEY: 'demo-key',
      QQ_BOT_MODE: 'qq-official',
      QQ_BOT_APP_ID: '1234567890',
      QQ_BOT_CLIENT_SECRET: 'demo-secret',
    },
    {
      allowMissingTarget: true,
    },
  );

  assert.equal(config.mode, 'qq-official');
  assert.equal(config.qqAppId, '1234567890');
  assert.equal(config.qqTargetType, '');
  assert.equal(config.qqTargetId, '');
});

test('formatReport renders compact quote + news sections', () => {
  const report = formatReport(
    [
      {
        label: 'XAU',
        displayName: '黄金（XAU/USD）',
        price: 3123.56,
        decimals: 2,
        percentChange: 1.23,
      },
      {
        label: 'XAG',
        displayName: '白银（XAG/USD）',
        price: 33.187,
        decimals: 3,
        percentChange: 1.78,
      },
      {
        label: 'WTI',
        displayName: '原油（WTI）',
        price: 81.22,
        decimals: 2,
        percentChange: -0.56,
      },
      {
        label: 'ETH',
        displayName: '以太坊（ETH/USD）',
        price: 1845.12,
        decimals: 2,
        percentChange: 3.45,
      },
      {
        label: 'USDX',
        displayName: '美元（USDX）',
        price: 100.24,
        decimals: 2,
        percentChange: 0.07,
      },
      {
        label: 'NDX',
        displayName: '纳指100（NDX）',
        price: 23740.19,
        decimals: 2,
        percentChange: 3.43,
      },
      {
        label: 'SPX',
        displayName: '标普500（SPX）',
        price: 6528.52,
        decimals: 2,
        percentChange: 2.91,
      },
      {
        label: 'SH',
        displayName: '上证（SH）',
        price: 3230.18,
        decimals: 2,
        percentChange: 0.24,
      },
    ],
    [
      {
        category: 'tech-ai',
        title: 'AI',
        error: '',
        items: [
          {
            title: '苹果折叠屏',
            publishedAt: new Date('2026-03-30T08:05:00+08:00'),
            summary: '苹果折叠屏 iPhone 将采用侧边 Touch ID 方案。',
          },
        ],
      },
      {
        category: 'finance',
        title: '财经',
        error: '',
        items: [
          {
            publishedAt: new Date('2026-03-30T08:10:00+08:00'),
            summary: '俄罗斯表示愿向古巴供应石油。',
          },
        ],
      },
    ],
    new Date('2026-03-30T09:40:00+08:00'),
    'Asia/Shanghai',
  );

  assert.match(report, /时间：2026-03-30 09:40/);
  assert.match(report, /黄金（XAU\/USD）：3,123\.56（\+1\.23%）/);
  assert.match(report, /白银（XAG\/USD）：33\.187（\+1\.78%）/);
  assert.match(report, /原油（WTI）：81\.22（-0\.56%）/);
  assert.match(report, /以太坊（ETH\/USD）：1,845\.12（\+3\.45%）/);
  assert.match(report, /纳指100（NDX）：23,740\.19（\+3\.43%）/);
  assert.match(report, /标普500（SPX）：6,528\.52（\+2\.91%）/);
  assert.match(report, /美元（USDX）：100\.24（\+0\.07%）/);
  assert.match(report, /上证（SH）：3,230\.18（\+0\.24%）/);
  assert.match(report, /【AI Top 1】/);
  assert.match(report, /【财经 Top 1】/);
  assert.doesNotMatch(report, /数据源/u);
  assert.doesNotMatch(report, /来源：/u);
});

test('normalizeSummaryLine prefers complete clauses over raw truncation', () => {
  const summary = normalizeSummaryLine(
    '3月30日，美的集团(000333.SZ)公告称，公司董事会审议通过回购方案，拟以集中竞价方式回购股份。',
    24,
  );

  assert.match(summary, /回购方案/u);
  assert.doesNotMatch(summary, /…/u);
});

test('normalizeTechAiGeneratedSummaryLine strips speculative trailing clauses', () => {
  assert.equal(
    normalizeTechAiGeneratedSummaryLine(
      'OpenAI宣布收购TBPN，此举可能增强其技术布局与市场竞争力。',
      52,
    ),
    'OpenAI宣布收购TBPN。',
  );
  assert.equal(
    normalizeTechAiGeneratedSummaryLine(
      '谷歌AI宣布Gemini API推出成本与可靠性平衡新方案，预计2026年实施。',
      52,
    ),
    '谷歌AI宣布Gemini API推出成本与可靠性平衡新方案。',
  );
});

test('buildReportMessages greedily packs sections into fewer messages', () => {
  const messages = buildReportMessages(
    [
      {
        label: 'XAU',
        displayName: '黄金（XAU/USD）',
        price: 3123.56,
        decimals: 2,
        percentChange: 1.23,
      },
    ],
    [
      {
        category: 'tech-ai',
        title: 'AI',
        error: '',
        items: [
          {
            title: '科技新闻 1',
            publishedAt: new Date('2026-03-30T08:00:00+08:00'),
            summary: 'OpenAI 推出企业级智能体平台，支持工作流编排和安全控制。',
          },
        ],
      },
      {
        category: 'finance',
        title: '财经',
        error: '',
        items: [
          {
            title: '财经新闻 1',
            publishedAt: new Date('2026-03-30T08:05:00+08:00'),
            summary: '美联储官员重申将依据通胀与就业数据决定后续利率路径。',
          },
        ],
      },
    ],
    new Date('2026-03-30T09:40:00+08:00'),
    'Asia/Shanghai',
    190,
  );

  assert.equal(messages.length, 1);
  assert.match(messages[0], /【AI Top 1】/);
  assert.match(messages[0], /【财经 Top 1】/);
});

test('buildReportMessages splits long news sections', () => {
  const messages = buildReportMessages(
    [
      {
        label: 'XAU',
        displayName: '黄金（XAU/USD）',
        price: 3123.56,
        decimals: 2,
        percentChange: 1.23,
      },
    ],
    [
      {
        category: 'tech-ai',
        title: 'AI',
        error: '',
        items: Array.from({ length: 3 }, (_, index) => ({
          title: `测试新闻 ${index + 1}`,
          publishedAt: new Date('2026-03-30T08:00:00+08:00'),
          summary:
            '这是一条比较长的中文总结，用于验证消息会在长度阈值内自动拆分发送。',
        })),
      },
    ],
    new Date('2026-03-30T09:40:00+08:00'),
    'Asia/Shanghai',
    120,
  );

  assert.equal(messages.length > 1, true);
  assert.match(messages[0], /【行情定时播报】/);
  assert.match(messages[0], /时间：2026-03-30 09:40/);
});

test('selectTechAiNewsItems filters noisy titles, trims multi-topic headlines, and removes duplicates', () => {
  const items = selectTechAiNewsItems(
    [
      {
        title: '市场监管总局政务服务平台全新上线：服务分类更清晰、入口醒目',
        summary: '市场监管总局政务服务平台全新上线。',
        source: '某媒体',
        publishedAt: new Date('2026-03-30T08:00:00+08:00'),
      },
      {
        title: '特斯拉将建超级芯片工厂',
        summary: '特斯拉将建超级芯片工厂。',
        source: '某媒体',
        publishedAt: new Date('2026-03-30T09:00:00+08:00'),
      },
      {
        title: 'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力',
        summary: 'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力。',
        source: '某媒体',
        publishedAt: new Date('2026-03-30T09:10:00+08:00'),
      },
      {
        title: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
        summary: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
        source: '某媒体',
        publishedAt: new Date('2026-03-30T09:20:00+08:00'),
      },
      {
        title:
          'OpenAI 扩展 Responses API，为自主智能体提供基础设施，微软同步扩展 Copilot 功能',
        summary:
          'OpenAI 扩展 Responses API，为自主智能体提供基础设施，微软同步扩展 Copilot 功能。',
        source: '另一家媒体',
        publishedAt: new Date('2026-03-30T09:21:00+08:00'),
      },
      {
        title: '甚至在图像理解的基准测试中拿到了很高的分数',
        summary: '甚至在图像理解的基准测试中拿到了很高的分数。',
        source: '某聚合源',
        sourcePriority: 4,
        publishedAt: new Date('2026-03-30T09:22:00+08:00'),
      },
      {
        title: 'AI智能体之间真正自主支付的钱包，来了！',
        summary: '京东科技发布智能体自主支付钱包。',
        source: '某聚合源',
        sourcePriority: 4,
        publishedAt: new Date('2026-03-30T09:22:00+08:00'),
      },
      {
        title:
          '实测拿215项SOTA的Qwen3.5-Omni：摄像头一开，AI现场讲论文、撸代码',
        summary:
          '实测拿215项SOTA的Qwen3.5-Omni：摄像头一开，AI现场讲论文、撸代码。',
        source: '某聚合源',
        sourcePriority: 4,
        publishedAt: new Date('2026-03-30T09:23:00+08:00'),
      },
      {
        title: 'Anthropic 源码泄露案反转，谎称被开除的程序员竟是“钓鱼”大佬',
        summary: 'Anthropic 源码泄露案反转，谎称被开除的程序员竟是“钓鱼”大佬。',
        source: '某聚合源',
        sourcePriority: 4,
        publishedAt: new Date('2026-03-30T09:24:00+08:00'),
      },
      {
        title: '面向2027届应届生及实习生，计划在全球招募百位“AI种子”人才',
        summary: '面向2027届应届生及实习生，计划在全球招募百位“AI种子”人才。',
        source: '某媒体',
        sourcePriority: 6,
        publishedAt: new Date('2026-03-30T09:25:00+08:00'),
      },
      {
        title: '铂金会员可享视频模型8折灵感值优惠',
        summary: '铂金会员可享视频模型8折灵感值优惠。',
        source: '某媒体',
        sourcePriority: 5,
        publishedAt: new Date('2026-03-30T09:26:00+08:00'),
      },
      {
        title: '开盒Claude Code的原来是中国00后！曾怒怼Anthropic窃取用户代码',
        summary: '凭一己之力推动全球AI社区向前走了一大步。',
        source: '量子位',
        sourcePriority: 7,
        publishedAt: new Date('2026-03-30T09:27:00+08:00'),
      },
      {
        title: 'AI原生时代来临，商汤大装置如何重塑算力集群架构',
        summary: '商汤大装置分享AI原生云实践。',
        source: '量子位',
        sourcePriority: 7,
        publishedAt: new Date('2026-03-30T09:28:00+08:00'),
      },
      {
        title: 'OpenAI 专访：AI 创业者如何抓住下一波智能体机会',
        summary: '对话 OpenAI 前员工，讨论 AI 创业趋势与机会。',
        source: '某媒体',
        sourcePriority: 6,
        publishedAt: new Date('2026-03-30T09:29:00+08:00'),
      },
      {
        title: '为什么说多智能体协同会成为 2026 年最大趋势',
        summary: '行业观察认为多智能体协同将成为 2026 年最大趋势。',
        source: '某媒体',
        sourcePriority: 6,
        publishedAt: new Date('2026-03-30T09:30:00+08:00'),
      },
    ],
    {
      techAiNewsLimit: 3,
      newsSummaryMaxLength: 48,
    },
    new Date('2026-03-30T10:00:00+08:00'),
  );

  assert.equal(items.length, 3);
  assert.deepEqual(
    items.map((item) => item.title).sort(),
    [
      'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力',
      'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
      '特斯拉将建超级芯片工厂',
    ].sort(),
  );
  assert.deepEqual(
    items.map((item) => item.summary).sort(),
    [
      'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力。',
      'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
      '特斯拉将建超级芯片工厂。',
    ].sort(),
  );
});

test('selectTechAiHotlistItems keeps high-heat 7 plus 3 mix and fills remaining slots by heat', () => {
  const items = [
    ...Array.from({ length: 8 }, (_, index) => ({
      title: `International ${index + 1} 发布 AI 平台能力`,
      summary: `International ${index + 1} 发布 AI 平台能力。`,
      source: 'OpenAI News',
      region: 'international',
      publishedAt: new Date(`2026-03-30T0${Math.min(index, 9)}:00:00+08:00`),
      heatScore: 200 - index * 10,
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      title: `Domestic ${index + 1} 发布 大模型 能力`,
      summary: `Domestic ${index + 1} 发布 大模型 能力。`,
      source: '量子位',
      region: 'domestic',
      publishedAt: new Date(`2026-03-30T1${index}:00:00+08:00`),
      heatScore: 140 - index * 10,
    })),
  ];

  const selected = selectTechAiHotlistItems(items, {
    techAiNewsLimit: 10,
  });

  assert.equal(selected.length, 10);
  assert.equal(
    selected.filter((item) => item.region === 'international').length,
    8,
  );
  assert.equal(selected.filter((item) => item.region === 'domestic').length, 2);
  assert.equal(selected[0].title, 'International 1 发布 AI 平台能力');
  assert.ok(
    selected.some((item) => item.title === 'Domestic 2 发布 大模型 能力'),
  );
});

test('dedupeNewsSectionsForMessage removes duplicate topics within and across sections', () => {
  const sections = dedupeNewsSectionsForMessage([
    {
      category: 'tech-ai',
      title: 'AI',
      error: '',
      items: [
        {
          title: 'OpenAI launches enterprise agent workspace',
          summary: 'OpenAI 推出企业级智能体工作台。',
        },
        {
          title: 'OpenAI enterprise agent workspace launches',
          summary: 'OpenAI 发布企业级智能体工作台。',
        },
      ],
    },
    {
      category: 'finance',
      title: '财经',
      error: '',
      items: [
        {
          title: 'OpenAI agent workspace boosts AI infrastructure stocks',
          summary: 'OpenAI 推出企业级智能体工作台，带动 AI 基础设施概念走强。',
        },
        {
          title: 'A股成交额突破1万亿元',
          summary: 'A股成交额突破1万亿元。',
        },
      ],
    },
  ]);

  assert.equal(sections[0].items.length, 1);
  assert.equal(sections[1].items.length, 1);
  assert.match(sections[1].items[0].summary, /A股成交额突破1万亿元/u);
});

test('classifyTechAiNewsRegion separates international and domestic ai news', () => {
  assert.equal(
    classifyTechAiNewsRegion({
      title: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
      summary: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
      source: '某媒体',
    }),
    'international',
  );

  assert.equal(
    classifyTechAiNewsRegion({
      title: '阿里云发布通义千问新模型，强化企业智能体能力',
      summary: '阿里云发布通义千问新模型，强化企业智能体能力。',
      source: '某媒体',
    }),
    'domestic',
  );

  assert.equal(
    classifyTechAiNewsRegion({
      title: '联想集团宣布全面转型 AI 原生公司',
      summary: '联想集团宣布全面转型 AI 原生公司。',
      source: '某媒体',
    }),
    'domestic',
  );

  assert.equal(
    classifyTechAiNewsRegion({
      title: '高德全量开源通用机器人基座模型 ABot-M0',
      summary: '高德全量开源通用机器人基座模型 ABot-M0。',
      source: '某媒体',
    }),
    'domestic',
  );
});

test('parseAibaseNewsItems extracts title, summary, and relative time from listing cards', () => {
  const items = parseAibaseNewsItems(
    `
      <a href="/zh/news/26758">
        <div class="md:text-[18px] font600">Anthropic 发送 DMCA 通知，大规模下架 8100 个源码仓库</div>
        <div class="truncate2 mt-[6px]">Anthropic就Claude代码泄露事件发起法律行动，向GitHub提交DMCA通知要求删除非法源码仓库。</div>
        <div><i class="iconfont icon-rili"></i> 6 小时前</div>
      </a>
    `,
    {
      now: new Date('2026-04-01T18:00:00+08:00'),
      sourcePriority: 4,
    },
  );

  assert.equal(items.length, 1);
  assert.equal(
    items[0].title,
    'Anthropic 发送 DMCA 通知，大规模下架 8100 个源码仓库',
  );
  assert.match(items[0].summary, /Claude代码泄露/u);
  assert.equal(items[0].source, 'AIBase');
  assert.equal(items[0].sourcePriority, 4);
  assert.equal(items[0].region, 'domestic');
  assert.equal(items[0].publishedAt?.toISOString(), '2026-04-01T04:00:00.000Z');
});

test('parseTechAiSourceItems supports Atom feeds for international AI sources', () => {
  const items = parseTechAiSourceItems(
    `
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title><![CDATA[Maximize AI Infrastructure Throughput by Consolidating Underutilized GPU Workloads]]></title>
          <link rel="alternate" type="text/html" href="https://developer.nvidia.com/blog/maximize-ai-infrastructure-throughput-by-consolidating-underutilized-gpu-workloads/" />
          <updated>2026-03-25T16:36:00Z</updated>
          <published>2026-03-25T16:35:43Z</published>
          <summary type="html"><![CDATA[Lightweight ASR and TTS models can share GPU capacity more efficiently in production Kubernetes environments.]]></summary>
        </entry>
      </feed>
    `,
    {
      name: 'NVIDIA Technical Blog',
      format: 'atom',
      sourcePriority: 8,
      region: 'international',
    },
  );

  assert.equal(items.length, 1);
  assert.match(items[0].title, /GPU Workloads/u);
  assert.match(items[0].summary, /Kubernetes environments/u);
  assert.equal(items[0].source, 'NVIDIA Technical Blog');
  assert.equal(items[0].sourcePriority, 8);
  assert.equal(items[0].region, 'international');
  assert.equal(items[0].publishedAt?.toISOString(), '2026-03-25T16:35:43.000Z');
});

test('selectTechAiNewsItems prefers higher-priority sources when relevance is similar', () => {
  const items = selectTechAiNewsItems(
    [
      {
        title: 'AIBase 汇总：OpenAI 推出企业级智能体工作台',
        summary: 'OpenAI 推出企业级智能体工作台，强调企业流程编排。',
        source: 'AIBase',
        sourcePriority: 4,
        region: 'domestic',
        publishedAt: new Date('2026-04-01T17:55:00+08:00'),
      },
      {
        title: 'OpenAI launches enterprise agent workspace',
        summary:
          'OpenAI launches enterprise agent workspace for secure workflow orchestration.',
        source: 'OpenAI News',
        sourcePriority: 10,
        region: 'international',
        publishedAt: new Date('2026-04-01T17:30:00+08:00'),
      },
    ],
    {
      techAiNewsLimit: 1,
      newsSummaryMaxLength: 48,
    },
    new Date('2026-04-01T18:00:00+08:00'),
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].source, 'OpenAI News');
  assert.equal(items[0].region, 'international');
});

test('selectTechAiNewsItems prefers hotter stories by source authority, freshness, and event signal', () => {
  const items = selectTechAiNewsItems(
    [
      {
        title: 'OpenAI 完成新一轮巨额融资并扩大企业级智能体投入',
        summary: 'OpenAI 完成新一轮巨额融资并扩大企业级智能体投入。',
        source: 'OpenAI News',
        sourcePriority: 10,
        region: 'international',
        publishedAt: new Date('2026-04-01T17:30:00+08:00'),
      },
      {
        title: '某媒体对 AI 未来趋势进行圆桌讨论',
        summary: '某媒体对 AI 未来趋势进行圆桌讨论。',
        source: '某媒体',
        sourcePriority: 6,
        region: 'international',
        publishedAt: new Date('2026-04-01T17:50:00+08:00'),
      },
    ],
    {
      techAiNewsLimit: 2,
      newsSummaryMaxLength: 48,
    },
    new Date('2026-04-01T18:00:00+08:00'),
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].source, 'OpenAI News');
  assert.match(items[0].title, /巨额融资/u);
  assert.ok(items[0].heatScore > 0);
});

test('selectTechAiNewsItems uses capped low-priority backfill without letting a noisy source dominate', () => {
  const items = selectTechAiNewsItems(
    [
      {
        title: 'OpenAI launches enterprise agent workspace',
        summary:
          'OpenAI launches enterprise agent workspace for secure workflow orchestration.',
        source: 'OpenAI News',
        sourcePriority: 10,
        region: 'international',
        publishedAt: new Date('2026-04-21T17:30:00+08:00'),
      },
      {
        title:
          'Google launches Deep Research and Deep Research Max agents to automate complex research',
        summary:
          'Google launches Deep Research and Deep Research Max agents to automate complex research.',
        source: 'The Decoder',
        sourcePriority: 6,
        region: 'international',
        publishedAt: new Date('2026-04-21T18:00:00+08:00'),
      },
      {
        title: 'Snowflake expands its technical and mainstream AI platforms',
        summary: 'Snowflake expands its technical and mainstream AI platforms.',
        source: 'AI News',
        sourcePriority: 4,
        region: 'international',
        publishedAt: new Date('2026-04-21T18:05:00+08:00'),
      },
      {
        title: '腾讯云开源 CubeSandbox：打造 AI Agent 的高性能“安全屋”',
        summary: '腾讯云开源 CubeSandbox：打造 AI Agent 的高性能“安全屋”。',
        source: 'AIBase',
        sourcePriority: 3,
        region: 'domestic',
        publishedAt: new Date('2026-04-21T18:10:00+08:00'),
      },
      {
        title: 'Meta推出内部监测工具，利用员工键鼠操作数据训练AI模型',
        summary: 'Meta推出内部监测工具，利用员工键鼠操作数据训练AI模型。',
        source: 'AIBase',
        sourcePriority: 3,
        region: 'international',
        publishedAt: new Date('2026-04-21T18:11:00+08:00'),
      },
      {
        title:
          '谷歌推出 Gemini3.1Pro 深度研究代理:支持 MCP 协议与多模态自主研究',
        summary:
          '谷歌推出 Gemini3.1Pro 深度研究代理，支持 MCP 协议与多模态自主研究。',
        source: 'AIBase',
        sourcePriority: 3,
        region: 'international',
        publishedAt: new Date('2026-04-21T18:12:00+08:00'),
      },
      {
        title: '全国高校首个纪检监察大模型“清鉴”正式发布',
        summary: '全国高校首个纪检监察大模型“清鉴”正式发布。',
        source: 'AIBase',
        sourcePriority: 3,
        region: 'domestic',
        publishedAt: new Date('2026-04-21T18:13:00+08:00'),
      },
    ],
    {
      techAiNewsLimit: 6,
      newsSummaryMaxLength: 48,
    },
    new Date('2026-04-21T19:00:00+08:00'),
  );

  assert.ok(items.some((item) => item.source === 'OpenAI News'));
  assert.ok(items.some((item) => item.source === 'The Decoder'));
  assert.ok(items.some((item) => item.source === 'AI News'));
  assert.equal(items.filter((item) => item.source === 'AIBase').length, 1);
  assert.ok(
    items.every((item) => !/高校|纪检|监察/u.test(item.title || item.summary)),
  );
});

test('selectTechAiNewsItems dedupes rewritten low-priority stories about the same event', () => {
  const items = selectTechAiNewsItems(
    [
      {
        title: 'AI 研究实验室 NeoCognition 获 4000 万美元融资',
        summary: 'AI 研究实验室 NeoCognition 获 4000 万美元融资。',
        source: 'AIBase',
        sourcePriority: 3,
        region: 'domestic',
        publishedAt: new Date('2026-04-21T18:10:00+08:00'),
      },
      {
        title: 'AI智能体实验室 NeoCognition 获 4000 万美元种子轮融资',
        summary: 'AI智能体实验室 NeoCognition 获 4000 万美元种子轮融资。',
        source: 'AIBase',
        sourcePriority: 3,
        region: 'domestic',
        publishedAt: new Date('2026-04-21T18:11:00+08:00'),
      },
      {
        title: 'Google launches Deep Research and Deep Research Max agents',
        summary: 'Google launches Deep Research and Deep Research Max agents.',
        source: 'The Decoder',
        sourcePriority: 6,
        region: 'international',
        publishedAt: new Date('2026-04-21T18:12:00+08:00'),
      },
    ],
    {
      techAiNewsLimit: 3,
      newsSummaryMaxLength: 48,
    },
    new Date('2026-04-21T19:00:00+08:00'),
  );

  assert.equal(items.length, 2);
  assert.equal(
    items.filter((item) => /NeoCognition/u.test(item.title || item.summary))
      .length,
    1,
  );
  assert.ok(
    items.some((item) => /Deep Research/u.test(item.title || item.summary)),
  );
});

test('selectFinanceNewsItems filters calendar noise, clickbait, and duplicate headlines', () => {
  const items = selectFinanceNewsItems(
    [
      {
        title: '',
        summary:
          '① 15:00 瑞士3月KOF经济领先指标 ② 16:30 英国2月央行抵押贷款许可 ③ 17:00 欧元区3月工业景气指数。',
        source: '东方财富',
        publishedAt: new Date('2026-03-30T15:00:00+08:00'),
      },
      {
        title: '',
        summary: '目前，“十五五”重大工程——沿江高铁的标志性项目，正在加紧施工。',
        source: '东方财富',
        publishedAt: new Date('2026-03-30T15:10:00+08:00'),
      },
      {
        title: '',
        summary:
          '沪指涨0.24%，深证成指跌0.25%，创业板指跌0.68%。成交额超1.9万亿。',
        source: '东方财富',
        publishedAt: new Date('2026-03-30T15:20:00+08:00'),
      },
      {
        title: '',
        summary:
          '国家药监局表示，今年前三个月，我国创新药对外授权交易总额超过600亿美元。',
        source: '东方财富',
        publishedAt: new Date('2026-03-30T15:30:00+08:00'),
      },
      {
        title: '美诺华：关于召开2025年度业绩说明会的公告',
        summary:
          '42时代财经时代财经AI快讯，3月30日，美诺华（603538.SH）发布公告。',
        source: '东方财富',
        publishedAt: new Date('2026-03-30T15:40:00+08:00'),
      },
      {
        title: '',
        summary:
          '2026-018），为方便广大投资者更全面、深入地了解公司 2025 年年度经营业绩的具体情况。',
        source: '东方财富',
        publishedAt: new Date('2026-03-30T15:50:00+08:00'),
      },
      {
        title: 'A股成交额突破1万亿元',
        summary: 'A股成交额突破1万亿元',
        source: '第一财经',
        publishedAt: new Date('2026-03-30T15:55:00+08:00'),
      },
      {
        title: 'A股成交额突破1万亿元',
        summary: 'A股成交额突破1万亿元',
        source: '36氪快讯',
        publishedAt: new Date('2026-03-30T15:56:00+08:00'),
      },
      {
        title: '凌晨突发！超级利好 全线暴涨！',
        summary: '凌晨突发！超级利好 全线暴涨！',
        source: '某快讯',
        publishedAt: new Date('2026-03-30T15:57:00+08:00'),
      },
    ],
    {
      financeNewsLimit: 2,
    },
    new Date('2026-03-30T16:00:00+08:00'),
  );

  assert.equal(items.length, 2);
  assert.deepEqual(
    items.map((item) => item.summary).sort(),
    [
      'A股成交额突破1万亿元',
      '沪指涨0.24%，深证成指跌0.25%，创业板指跌0.68%。成交额超1.9万亿。',
    ].sort(),
  );
});

test('runMarketPush allows repeated hot news across different push times', async () => {
  let storedState = {
    version: 1,
    days: {
      '2026-04-01': {
        'tech-ai': ['OpenAI 扩展 Responses API，为自主智能体提供基础设施'],
        finance: ['A股成交额突破1万亿元'],
      },
    },
  };
  let writtenState = null;

  const result = await runMarketPush({
    env: {
      TWELVE_DATA_API_KEY: 'demo-key',
      QQ_BOT_MODE: 'onebot',
      ONEBOT_HTTP_URL: 'http://127.0.0.1:3000',
      ONEBOT_MESSAGE_TYPE: 'group',
      ONEBOT_TARGET_ID: '123456',
    },
    generatedAt: new Date('2026-04-01T13:25:00+08:00'),
    quoteFetcher: async () => ({
      symbol: 'XAU/USD',
      price: 3123.56,
      percentChange: 1.23,
      exchange: '',
      sourceTimestamp: '2026-04-01 13:25:00',
    }),
    newsFetcher: async (category) =>
      category === 'tech-ai'
        ? {
            category,
            title: 'AI',
            error: '',
            items: [
              {
                title: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
                publishedAt: new Date('2026-04-01T12:30:00+08:00'),
                summary:
                  'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
              },
              {
                title: 'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力',
                publishedAt: new Date('2026-04-01T13:00:00+08:00'),
                summary:
                  'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力。',
              },
            ],
          }
        : {
            category,
            title: '财经',
            error: '',
            items: [
              {
                title: 'A股成交额突破1万亿元',
                publishedAt: new Date('2026-04-01T12:45:00+08:00'),
                summary: 'A股成交额突破1万亿元',
              },
            ],
          },
    newsStateStore: {
      read: async () => storedState,
      write: async (nextState) => {
        writtenState = nextState;
        storedState = nextState;
      },
    },
    messagePusher: async (_config, messages) => ({
      dryRun: false,
      messages,
    }),
  });

  const techSection = result.newsSections.find(
    (section) => section.category === 'tech-ai',
  );
  const financeSection = result.newsSections.find(
    (section) => section.category === 'finance',
  );

  assert.equal(techSection.items.length, 2);
  assert.match(result.message, /OpenAI 扩展 Responses API/u);
  assert.match(result.message, /Anthropic 发布新一代 Claude 模型/u);
  assert.equal(financeSection.items.length, 1);
  assert.match(result.message, /A股成交额突破1万亿元/u);
  assert.equal(writtenState, null);
});

test('runMarketPush removes duplicate stories between ai and finance sections', async () => {
  const result = await runMarketPush({
    env: {
      TWELVE_DATA_API_KEY: 'demo-key',
      QQ_BOT_MODE: 'onebot',
      ONEBOT_HTTP_URL: 'http://127.0.0.1:3000',
      ONEBOT_MESSAGE_TYPE: 'group',
      ONEBOT_TARGET_ID: '123456',
    },
    generatedAt: new Date('2026-04-01T18:25:00+08:00'),
    quoteFetcher: async () => ({
      symbol: 'XAU/USD',
      price: 3123.56,
      percentChange: 1.23,
      exchange: '',
      sourceTimestamp: '2026-04-01 18:25:00',
    }),
    newsFetcher: async (category) =>
      category === 'tech-ai'
        ? {
            category,
            title: 'AI',
            error: '',
            items: [
              {
                title: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
                summary:
                  'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
                publishedAt: new Date('2026-04-01T17:50:00+08:00'),
                fingerprint:
                  'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
              },
            ],
          }
        : {
            category,
            title: '财经',
            error: '',
            items: [
              {
                title: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
                summary:
                  'OpenAI 扩展 Responses API 带动相关 AI 基础设施概念走强。',
                publishedAt: new Date('2026-04-01T18:00:00+08:00'),
                fingerprint:
                  'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
              },
              {
                title: 'A股成交额突破1万亿元',
                summary: 'A股成交额突破1万亿元',
                publishedAt: new Date('2026-04-01T18:05:00+08:00'),
              },
            ],
          },
    newsStateStore: {
      read: async () => ({
        version: 1,
        days: {},
      }),
      write: async () => {},
    },
    messagePusher: async (_config, messages) => ({
      dryRun: false,
      messages,
    }),
  });

  const financeSection = result.newsSections.find(
    (section) => section.category === 'finance',
  );

  assert.equal(financeSection.items.length, 1);
  assert.match(financeSection.items[0].summary, /A股成交额突破1万亿元/u);
  assert.doesNotMatch(
    result.message,
    /OpenAI 扩展 Responses API 带动相关 AI 基础设施概念走强/u,
  );
});

test('generateTechAiNewsWithLlm uses Gemini as primary provider', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary:
                          'OpenAI 扩展 Responses API，强化自主智能体基础设施能力。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          item: {
            title: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施',
            summary: 'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
            source: '某媒体',
            publishedAt: new Date('2026-04-01T09:00:00+08:00'),
            heatScore: 120,
          },
        },
        {
          candidateId: 'c02',
          item: {
            title: 'Anthropic 推出新一代 Claude Agent 工作流能力',
            summary: 'Anthropic 推出新一代 Claude Agent 工作流能力。',
            source: '另一家媒体',
            publishedAt: new Date('2026-04-01T09:30:00+08:00'),
            heatScore: 90,
          },
        },
      ],
      {
        techAiNewsLimit: 10,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 2);
    assert.match(items[0].summary, /Responses API/u);
    assert.match(items[0].fingerprint, /responsesapi/u);
    assert.match(items[1].summary, /Claude Agent/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm keeps 7 international and 3 domestic items when candidates are sufficient', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary: 'OpenAI 发布新能力，强化智能体基础设施。',
                      },
                      {
                        candidateId: 'c08',
                        summary: '阿里云发布通义千问新模型，强化企业智能体。',
                      },
                      {
                        candidateId: 'c02',
                        summary: 'Anthropic 发布新模型，强化代码与智能体能力。',
                      },
                      {
                        candidateId: 'c03',
                        summary: 'Google 推出新一代多模态模型。',
                      },
                      {
                        candidateId: 'c09',
                        summary: '百度发布文心新能力，推进智能体落地。',
                      },
                      {
                        candidateId: 'c04',
                        summary: 'Meta 发布开源推理模型。',
                      },
                      {
                        candidateId: 'c10',
                        summary: '腾讯升级混元模型并开放企业接口。',
                      },
                      {
                        candidateId: 'c05',
                        summary: 'NVIDIA 扩展 AI 基础设施布局。',
                      },
                      {
                        candidateId: 'c06',
                        summary: 'Microsoft 扩展 Copilot 企业能力。',
                      },
                      {
                        candidateId: 'c07',
                        summary: 'Apple 推进 AI 系统级能力。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  const candidates = [
    {
      title: 'OpenAI 发布新能力，强化智能体基础设施',
      region: 'international',
      heatScore: 200,
    },
    {
      title: 'Anthropic 发布新模型，强化代码与智能体能力',
      region: 'international',
      heatScore: 170,
    },
    {
      title: 'Google 推出新一代多模态模型',
      region: 'international',
      heatScore: 160,
    },
    {
      title: 'Meta 发布开源推理模型',
      region: 'international',
      heatScore: 135,
    },
    {
      title: 'NVIDIA 扩展 AI 基础设施布局',
      region: 'international',
      heatScore: 120,
    },
    {
      title: 'Microsoft 扩展 Copilot 企业能力',
      region: 'international',
      heatScore: 110,
    },
    {
      title: 'Apple 推进 AI 系统级能力',
      region: 'international',
      heatScore: 95,
    },
    {
      title: '阿里云发布通义千问新模型，强化企业智能体',
      region: 'domestic',
      heatScore: 180,
    },
    {
      title: '百度发布文心新能力，推进智能体落地',
      region: 'domestic',
      heatScore: 150,
    },
    {
      title: '腾讯升级混元模型并开放企业接口',
      region: 'domestic',
      heatScore: 130,
    },
  ].map((entry, index) => ({
    candidateId: `c${String(index + 1).padStart(2, '0')}`,
    region: entry.region,
    item: {
      title: entry.title,
      summary: `${entry.title}。`,
      source: '某媒体',
      publishedAt: new Date(`2026-04-01T0${Math.min(index, 9)}:00:00+08:00`),
      heatScore: entry.heatScore,
    },
  }));

  try {
    const items = await generateTechAiNewsWithLlm(candidates, {
      techAiNewsLimit: 10,
      newsSummaryMaxLength: 48,
      aiNewsLlmProvider: 'gemini',
      aiNewsLlmFallbackProvider: 'deepseek',
      geminiApiKey: 'gemini-key',
      deepseekApiKey: 'deepseek-key',
      aiNewsGeminiModel: 'gemini-2.5-flash',
      aiNewsDeepseekModel: 'deepseek-chat',
      aiNewsLlmTimeoutMs: 30000,
    });

    assert.equal(items.length, 10);
    assert.equal(
      items.filter((item) => item.region === 'international').length,
      7,
    );
    assert.equal(items.filter((item) => item.region === 'domestic').length, 3);
    assert.deepEqual(
      items.slice(0, 5).map((item) => item.title),
      [
        'OpenAI 发布新能力，强化智能体基础设施',
        '阿里云发布通义千问新模型，强化企业智能体',
        'Anthropic 发布新模型，强化代码与智能体能力',
        'Google 推出新一代多模态模型',
        '百度发布文心新能力，推进智能体落地',
      ],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm preserves llm hotlist order for selected items', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c02',
                        summary:
                          'Anthropic 发布 Claude Code 更新，强化开发者工作流。',
                      },
                      {
                        candidateId: 'c01',
                        summary:
                          'OpenAI 发布 Responses API 更新，扩展智能体调用能力。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'international',
          item: {
            title: 'OpenAI 发布 Responses API 更新并扩展智能体调用能力',
            summary: 'OpenAI 发布 Responses API 更新并扩展智能体调用能力。',
            source: 'OpenAI News',
            sourcePriority: 10,
            publishedAt: new Date('2026-04-01T10:00:00+08:00'),
            heatScore: 220,
          },
        },
        {
          candidateId: 'c02',
          region: 'international',
          item: {
            title: 'Anthropic 发布 Claude Code 更新并强化开发者工作流',
            summary: 'Anthropic 发布 Claude Code 更新并强化开发者工作流。',
            source: 'Anthropic',
            sourcePriority: 8,
            publishedAt: new Date('2026-04-01T11:00:00+08:00'),
            heatScore: 140,
          },
        },
      ],
      {
        techAiNewsLimit: 10,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 2);
    assert.equal(
      items[0].title,
      'Anthropic 发布 Claude Code 更新并强化开发者工作流',
    );
    assert.equal(
      items[1].title,
      'OpenAI 发布 Responses API 更新并扩展智能体调用能力',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm falls back to DeepSeek when Gemini fails', async () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  let requestCount = 0;
  globalThis.fetch = async (url) => {
    requestCount += 1;
    const requestUrl = String(url);

    if (requestUrl.includes('generativelanguage.googleapis.com')) {
      return {
        ok: false,
        text: async () =>
          JSON.stringify({ error: { message: 'quota exceeded' } }),
      };
    }

    if (requestUrl.includes('api.deepseek.com/chat/completions')) {
      return {
        ok: true,
        text: async () =>
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary:
                          'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力。',
                      },
                    ],
                  }),
                },
              },
            ],
          }),
      };
    }

    throw new Error(`unexpected url: ${requestUrl}`);
  };
  console.warn = () => {};

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          item: {
            title: 'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力',
            summary: 'Anthropic 发布新一代 Claude 模型，强化代码与智能体能力。',
            source: '某媒体',
            publishedAt: new Date('2026-04-01T10:00:00+08:00'),
            heatScore: 100,
          },
        },
      ],
      {
        techAiNewsLimit: 10,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(requestCount, 2);
    assert.equal(items.length, 1);
    assert.match(items[0].summary, /Claude 模型/u);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  }
});

test('generateTechAiNewsWithLlm skips clickbait candidates and falls back from low-quality summaries', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary: 'ToB AI最贵重的门票。',
                      },
                      {
                        candidateId: 'c02',
                        summary:
                          '强调在AI向智能体进化过程中，安全与责任至关重要。',
                      },
                      {
                        candidateId: 'c03',
                        summary: 'Accelerating the next phase of AI.',
                      },
                      {
                        candidateId: 'c04',
                        summary: 'AI智能体之间真正自主支付的钱包，来了！',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'international',
          item: {
            title: 'ToB AI最贵重的门票',
            summary: 'ToB AI最贵重的门票。',
            source: '某聚合源',
            sourcePriority: 4,
            publishedAt: new Date('2026-04-01T10:00:00+08:00'),
            heatScore: 80,
          },
        },
        {
          candidateId: 'c02',
          region: 'international',
          item: {
            title: 'Anthropic 发布 AI 智能体安全白皮书',
            summary: 'Anthropic 发布 AI 智能体安全白皮书。',
            source: 'Anthropic News',
            sourcePriority: 10,
            publishedAt: new Date('2026-04-01T10:10:00+08:00'),
            heatScore: 150,
          },
        },
        {
          candidateId: 'c03',
          region: 'international',
          item: {
            title: 'Accelerating the next phase of AI',
            summary: 'Accelerating the next phase of AI.',
            source: 'OpenAI News',
            sourcePriority: 10,
            publishedAt: new Date('2026-04-01T10:15:00+08:00'),
            heatScore: 140,
          },
        },
        {
          candidateId: 'c04',
          region: 'international',
          item: {
            title: '京东科技发布 AI 智能体自主支付钱包',
            summary: '京东科技发布 AI 智能体自主支付钱包。',
            source: '某媒体',
            sourcePriority: 8,
            publishedAt: new Date('2026-04-01T10:18:00+08:00'),
            heatScore: 130,
          },
        },
        {
          candidateId: 'c05',
          region: 'international',
          item: {
            title: 'OpenAI 发布企业级智能体工作台',
            summary: 'OpenAI 发布企业级智能体工作台。',
            source: 'OpenAI News',
            sourcePriority: 10,
            publishedAt: new Date('2026-04-01T10:20:00+08:00'),
            heatScore: 160,
          },
        },
      ],
      {
        techAiNewsLimit: 3,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 3);
    assert.equal(
      items.some((item) => /最贵重的门票/u.test(item.summary)),
      false,
    );
    assert.equal(
      items.some((item) => /最贵重的门票/u.test(item.title)),
      false,
    );
    assert.equal(
      items.some((item) =>
        /Accelerating the next phase of AI/u.test(item.summary),
      ),
      false,
    );
    assert.equal(
      items.some((item) =>
        /Accelerating the next phase of AI/u.test(item.title),
      ),
      false,
    );
    assert.equal(
      items.some((item) =>
        /AI智能体之间真正自主支付的钱包，来了/u.test(item.summary),
      ),
      false,
    );
    assert.equal(
      items.some((item) =>
        /Anthropic 发布 AI 智能体安全白皮书/u.test(item.summary),
      ),
      true,
    );
    assert.equal(
      items.some((item) =>
        /京东科技发布 AI 智能体自主支付钱包/u.test(item.summary),
      ),
      true,
    );
    assert.equal(
      items.some((item) => /OpenAI 发布企业级智能体工作台/u.test(item.summary)),
      true,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm falls back to clean titles when llm summary is colloquial', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary: '能看能听能唠嗑，还能现场vibe coding。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'international',
          item: {
            title: '阿里云发布多模态模型升级',
            summary: '阿里云发布多模态模型升级。',
            source: '某媒体',
            sourcePriority: 8,
            publishedAt: new Date('2026-04-01T10:25:00+08:00'),
            heatScore: 100,
          },
        },
      ],
      {
        techAiNewsLimit: 1,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 1);
    assert.equal(/唠嗑|vibe coding/iu.test(items[0].summary), false);
    assert.match(items[0].summary, /阿里云发布多模态模型升级/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm falls back when llm summary lacks a clear subject', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary:
                          '旨在通过“一个通用大脑适配多种形态机器人”打破异构硬件壁垒。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'international',
          item: {
            title: '某机器人公司发布通用大脑平台',
            summary: '某机器人公司发布通用大脑平台。',
            source: '某媒体',
            sourcePriority: 8,
            publishedAt: new Date('2026-04-01T10:30:00+08:00'),
            heatScore: 100,
          },
        },
      ],
      {
        techAiNewsLimit: 1,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 1);
    assert.equal(/^旨在/u.test(items[0].summary), false);
    assert.match(items[0].summary, /某机器人公司发布通用大脑平台/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm falls back when llm summary is vague corporate sloganeering', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary:
                          '本财年定为“AI交付”之年，旨在确立在混合式人工智能领域的领先地位。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'international',
          item: {
            title: '联想宣布新财年转向 AI 交付并加码企业产品落地',
            summary: '联想宣布新财年转向 AI 交付并加码企业产品落地。',
            source: '某媒体',
            sourcePriority: 8,
            publishedAt: new Date('2026-04-01T10:35:00+08:00'),
            heatScore: 100,
          },
        },
      ],
      {
        techAiNewsLimit: 1,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 1);
    assert.equal(/本财年|领先地位/u.test(items[0].summary), false);
    assert.match(items[0].summary, /联想宣布新财年转向 AI 交付/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm falls back when llm summary drops key repository name', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary:
                          'Anthropic 发送 DMCA 通知，大规模下架 8100 个源码仓库。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'international',
          item: {
            title: 'Anthropic 发送 DMCA 通知，下架超 8100 个代码仓库',
            summary:
              'Anthropic就Claude代码泄露事件发起法律行动，GitHub已删除主仓库及超8100个相关分支，成为AI行业近年最大规模代码版权清理。',
            llmSummary:
              'Anthropic就Claude代码泄露事件发起法律行动，GitHub已删除主仓库及超8100个相关分支，成为AI行业近年最大规模代码版权清理。',
            source: 'VentureBeat AI',
            sourcePriority: 7,
            publishedAt: new Date('2026-04-01T12:00:00+08:00'),
            heatScore: 180,
          },
        },
      ],
      {
        techAiNewsLimit: 1,
        newsSummaryMaxLength: 80,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 1);
    assert.match(items[0].summary, /Claude Code/u);
    assert.match(items[0].summary, /8100/u);
    assert.doesNotMatch(items[0].summary, /删除主仓库及 8100/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateTechAiNewsWithLlm falls back when llm summary reads like strategy brochure copy', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary:
                          '未来所有产品、服务及流程都将以人工智能为核心重构，2024年被视为混合式AI的实战年。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateTechAiNewsWithLlm(
      [
        {
          candidateId: 'c01',
          region: 'domestic',
          item: {
            title: '联想集团宣布全面转型 AI 原生公司，开启 AI 交付新财年',
            summary: '联想集团宣布全面转型 AI 原生公司，开启 AI 交付新财年。',
            source: '量子位',
            sourcePriority: 7,
            publishedAt: new Date('2026-04-01T13:00:00+08:00'),
            heatScore: 110,
          },
        },
      ],
      {
        techAiNewsLimit: 1,
        newsSummaryMaxLength: 64,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 1);
    assert.match(items[0].summary, /联想集团/u);
    assert.doesNotMatch(items[0].summary, /未来所有产品/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generateFinanceNewsWithLlm rewrites finance candidates into concise market summaries', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () =>
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    items: [
                      {
                        candidateId: 'c01',
                        summary: 'A股成交额突破1万亿元，市场交投继续放量。',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
  });

  try {
    const items = await generateFinanceNewsWithLlm(
      [
        {
          candidateId: 'c01',
          item: {
            title: 'A股成交额突破1万亿元',
            summary: 'A股成交额突破1万亿元',
            source: '第一财经',
            publishedAt: new Date('2026-04-01T14:00:00+08:00'),
          },
        },
        {
          candidateId: 'c02',
          item: {
            title: '国际油价走低 布伦特原油期货跌近1%',
            summary: '国际油价走低 布伦特原油期货跌近1%',
            source: '36氪快讯',
            publishedAt: new Date('2026-04-01T14:05:00+08:00'),
          },
        },
      ],
      {
        financeNewsLimit: 10,
        newsSummaryMaxLength: 48,
        aiNewsLlmProvider: 'gemini',
        aiNewsLlmFallbackProvider: 'deepseek',
        geminiApiKey: 'gemini-key',
        deepseekApiKey: 'deepseek-key',
        aiNewsGeminiModel: 'gemini-2.5-flash',
        aiNewsDeepseekModel: 'deepseek-chat',
        aiNewsLlmTimeoutMs: 30000,
      },
    );

    assert.equal(items.length, 1);
    assert.match(items[0].summary, /市场交投继续放量/u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchQuote reads NDX/SPX from CNBC quote pages', async () => {
  const originalFetch = globalThis.fetch;
  const spxHtml = `
    <html>
      <body>
        <script>
          window.__DATA__={"quote":{"data":[{"symbol":".SPX","last":"6,528.52","previous_day_closing":"6,343.72","change_pct":"+2.91%","exchange":"INDEX","last_time":"2026-03-31T16:42:48.000-0400"}],"news":{"latestNews":[]}}};
        </script>
      </body>
    </html>
  `;

  globalThis.fetch = async () => ({
    ok: true,
    text: async () => spxHtml,
  });

  try {
    const quote = await fetchQuote(
      {
        symbol: 'SPX',
        label: 'SPX',
        provider: 'cnbc',
        cnbcSymbol: '.SPX',
        stooqSymbol: '^SPX',
        decimals: 2,
      },
      {
        twelveDataApiKey: 'demo-key',
      },
    );

    assert.equal(quote.price, 6528.52);
    assert.equal(quote.percentChange?.toFixed(2), '2.91');
    assert.equal(quote.exchange, 'INDEX');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchQuote falls back to Stooq when CNBC payload is unavailable', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    const requestUrl = String(url);

    if (requestUrl.includes('www.cnbc.com/quotes/')) {
      return {
        ok: true,
        text: async () => '<html><body>missing quote payload</body></html>',
      };
    }

    if (requestUrl.includes('stooq.com/q/l/')) {
      return {
        ok: true,
        text: async () =>
          '^SPX,20260331,230000,6395.88,6539.05,6395.88,6528.52,3882633104,\r\n',
      };
    }

    throw new Error(`unexpected url: ${requestUrl}`);
  };

  try {
    const quote = await fetchQuote(
      {
        symbol: 'SPX',
        label: 'SPX',
        provider: 'cnbc',
        cnbcSymbol: '.SPX',
        stooqSymbol: '^SPX',
        decimals: 2,
      },
      {
        twelveDataApiKey: 'demo-key',
      },
    );

    assert.equal(quote.price, 6528.52);
    assert.equal(quote.percentChange, null);
    assert.equal(quote.exchange, 'STOOQ');
    assert.equal(quote.sourceTimestamp, '2026-03-31 23:00:00');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('runMarketPush supports dry-run mode', async () => {
  const result = await runMarketPush({
    env: {
      TWELVE_DATA_API_KEY: 'demo-key',
      QQ_BOT_MODE: 'onebot',
      ONEBOT_HTTP_URL: 'http://127.0.0.1:3000',
      ONEBOT_MESSAGE_TYPE: 'group',
      ONEBOT_TARGET_ID: '123456',
      MARKET_BOT_DRY_RUN: '1',
    },
    quoteFetcher: async (symbolConfig) => ({
      symbol: symbolConfig.symbol,
      price:
        symbolConfig.label === 'XAU'
          ? 3123.56
          : symbolConfig.label === 'XAG'
            ? 33.187
            : symbolConfig.label === 'WTI'
              ? 81.22
              : symbolConfig.label === 'ETH'
                ? 1845.12
                : symbolConfig.label === 'NDX'
                  ? 23740.19
                  : symbolConfig.label === 'SPX'
                    ? 6528.52
                    : symbolConfig.label === 'USDX'
                      ? 100.24
                      : 3230.18,
      percentChange:
        symbolConfig.label === 'XAU'
          ? 1.23
          : symbolConfig.label === 'XAG'
            ? 1.78
            : symbolConfig.label === 'WTI'
              ? -0.56
              : symbolConfig.label === 'ETH'
                ? 3.45
                : symbolConfig.label === 'NDX'
                  ? 3.43
                  : symbolConfig.label === 'SPX'
                    ? 2.91
                    : symbolConfig.label === 'USDX'
                      ? 0.07
                      : 0.24,
      exchange: '',
      sourceTimestamp: '2026-03-30 09:29:00',
    }),
    newsFetcher: async (category) => ({
      category,
      title: category === 'finance' ? '财经' : 'AI',
      error: '',
      items:
        category === 'finance'
          ? []
          : [
              {
                title: `${category} 新闻 1`,
                publishedAt: new Date('2026-03-30T09:00:00+08:00'),
                summary:
                  'OpenAI 扩展 Responses API，为自主智能体提供基础设施。',
              },
            ],
    }),
  });

  assert.equal(result.result.dryRun, true);
  assert.match(result.message, /行情定时播报/);
  assert.match(result.message, /黄金（XAU\/USD）：3,123\.56（\+1\.23%）/);
  assert.match(result.message, /纳指100（NDX）：23,740\.19（\+3\.43%）/);
  assert.match(result.message, /标普500（SPX）：6,528\.52（\+2\.91%）/);
  assert.match(result.message, /美元（USDX）：100\.24（\+0\.07%）/);
  assert.match(result.message, /上证（SH）：3,230\.18（\+0\.24%）/);
  assert.match(result.message, /【AI Top 1】/);
  assert.match(result.message, /【财经 Top 0】/);
  assert.match(result.message, /暂无符合条件的新闻。/u);
});
