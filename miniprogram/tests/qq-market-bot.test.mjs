import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReportMessages,
  fetchQuote,
  formatReport,
  normalizeSummaryLine,
  readConfig,
  runMarketPush,
  selectFinanceNewsItems,
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

test('runMarketPush filters news already sent earlier the same day', async () => {
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

  assert.equal(techSection.items.length, 1);
  assert.match(
    techSection.items[0].summary,
    /Anthropic 发布新一代 Claude 模型/u,
  );
  assert.equal(financeSection.items.length, 0);
  assert.equal(financeSection.emptyText, '今天暂无新的新闻。');
  assert.doesNotMatch(result.message, /OpenAI 扩展 Responses API/u);
  assert.match(result.message, /Anthropic 发布新一代 Claude 模型/u);
  assert.match(result.message, /今天暂无新的新闻。/u);
  assert.ok(writtenState);
  assert.equal(writtenState.days['2026-04-01']['tech-ai'].length, 2);
  assert.equal(writtenState.days['2026-04-01'].finance.length, 1);
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
      items: [
        {
          title: `${category} 新闻 1`,
          publishedAt: new Date('2026-03-30T09:00:00+08:00'),
          summary: '这是中文总结。',
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
  assert.match(result.message, /【财经 Top 1】/);
});
