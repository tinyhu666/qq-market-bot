#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import WebSocket from 'ws';

const execFileAsync = promisify(execFile);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const QQ_ACCESS_TOKEN_URL = 'https://bots.qq.com/app/getAppAccessToken';
const QQ_OFFICIAL_API_BASE_URL = 'https://api.sgroup.qq.com';
const TWELVE_DATA_QUOTE_URL = 'https://api.twelvedata.com/quote';
const SINA_QUOTE_URL = 'https://hq.sinajs.cn/list=';
const CNBC_QUOTE_PAGE_URL = 'https://www.cnbc.com/quotes/';
const STOOQ_QUOTE_URL = 'https://stooq.com/q/l/';
const YICAI_INFO_URL = 'https://www.yicai.com/news/info/';
const THIRTY_SIX_KR_NEWSFLASH_FEED_URL = 'https://36kr.com/feed-newsflash';
const EASTMONEY_FAST_NEWS_URL =
  'https://np-weblist.eastmoney.com/comm/web/getFastNewsList';
const EASTMONEY_MIAOXIANG_NEWS_URL =
  'https://mkapi2.dfcfs.com/finskillshub/api/claw/news-search';
const EASTMONEY_FAST_NEWS_COLUMN = '102';
const FINANCE_NEWS_FETCH_MULTIPLIER = 4;
const NEWS_LOOKBACK_HOURS = 24;
const DEFAULT_TECH_NEWS_LIMIT = 5;
const DEFAULT_AI_NEWS_LIMIT = 5;
const DEFAULT_FINANCE_NEWS_LIMIT = 10;
const DEFAULT_MESSAGE_MAX_LENGTH = 1600;
const DEFAULT_NEWS_SUMMARY_MAX_LENGTH = 48;
const DEFAULT_ONEBOT_WS_TIMEOUT_MS = 10000;
const DEFAULT_DAILY_NEWS_FETCH_MULTIPLIER = 3;
const DEFAULT_NEWS_STATE_FILE = resolve(
  SCRIPT_DIR,
  'qq-market-bot-news-state.json',
);
const DAILY_NEWS_STATE_VERSION = 1;
const DAILY_NEWS_STATE_RETENTION_DAYS = 7;
const MESSAGE_SECTION_SEPARATOR = '\n----------------\n';
const NEWS_DUPLICATE_SIMILARITY_THRESHOLD = 0.88;
const DEFAULT_REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 QQMarketBot/1.0',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

const NEWS_CATEGORY_CONFIG = {
  'tech-ai': {
    title: 'AI',
  },
  finance: {
    title: '财经',
  },
};

const TECH_AI_NEWS_FEEDS = [
  {
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
  },
  {
    name: '雷峰网',
    url: 'https://www.leiphone.com/feed',
  },
  {
    name: '蓝点网',
    url: 'https://www.landiannews.com/feed',
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed-article',
  },
];

const TECH_AI_NEWS_FILTER_CONFIG = {
  coreKeywords: [
    'ai',
    '人工智能',
    '大模型',
    '智能体',
    'agent',
    'openai',
    'anthropic',
    'claude',
    'chatgpt',
    'gemini',
    'aigc',
    'deepseek',
    '千问',
    'qwen',
    'llm',
    '推理模型',
    '多模态',
    'mcp',
    '机器人',
    '开源模型',
    '训练',
    '推理',
    'api',
  ],
  infraKeywords: [
    '芯片',
    '半导体',
    '算力',
    '模型',
    '数据中心',
    '服务器',
    'gpu',
    'cuda',
    'mlx',
  ],
  entityKeywords: [
    '英伟达',
    'nvidia',
    '微软',
    'microsoft',
    '苹果',
    '华为',
    '特斯拉',
    '谷歌',
    'google',
    'meta',
    '亚马逊',
    'amazon',
    '阿里',
    '腾讯',
    '字节',
  ],
  excludeKeywords: [
    '政务',
    '谣言',
    '学校',
    '大学',
    '中学',
    '小学',
    '教育',
    '征集',
    '特刊',
    '监管总局',
    '刷走',
    '助残',
    '党建',
    '论坛',
    '医院',
    '卫生',
    '法院',
    '游戏',
    'gta',
    '名誉权',
    '周年庆',
    '旗舰店',
    '直播活动',
    '手机发布',
    '像素',
    '长焦',
    '折叠屏',
    '企业全情报',
    '纸扎',
  ],
};

const FINANCE_NEWS_FILTER_CONFIG = {
  positiveKeywords: [
    '美联储',
    '央行',
    '降息',
    '加息',
    'cpi',
    'pmi',
    '非农',
    '通胀',
    '利率',
    '汇率',
    '美元',
    '黄金',
    '白银',
    '原油',
    '油价',
    'a股',
    '港股',
    '美股',
    '沪指',
    '深证成指',
    '创业板',
    '纳指',
    '标普',
    '道指',
    '财报',
    'ipo',
    '并购',
    '回购',
    'qfii',
    '基金',
    '券商',
    '银行',
    '保险',
    '债券',
    '国债',
    '收益率',
    '创新药',
    '茅台',
    '谈判',
    '关税',
    '贸易',
    '出口',
    '经济',
    '成交额',
    '涨',
    '跌',
  ],
  excludeKeywords: [
    '沿江高铁',
    '重大工程',
    '论坛',
    '党建',
    '助残',
    '学校',
    '大学',
    '中学',
    '小学',
    '医院',
    '卫生',
    '小院',
    '考察',
    '联学联建',
    '财经早餐',
    '早报',
    '超级利好',
    '全线暴涨',
    '附股',
    '速看',
  ],
};

const DEFAULT_SYMBOLS = [
  {
    symbol: 'XAU/USD',
    label: 'XAU',
    displayName: '黄金（XAU/USD）',
    provider: 'twelvedata',
    decimals: 2,
  },
  {
    symbol: 'SI00Y',
    label: 'XAG',
    displayName: '白银（XAG/USD）',
    provider: 'sina',
    sinaSymbol: 'hf_XAG',
    sinaType: 'hf',
    secid: '101.SI00Y',
    decimals: 3,
  },
  {
    symbol: 'CL00Y',
    label: 'WTI',
    displayName: '原油（WTI）',
    provider: 'sina',
    sinaSymbol: 'hf_CL',
    sinaType: 'hf',
    secid: '102.CL00Y',
    decimals: 2,
  },
  {
    symbol: 'ETH/USD',
    label: 'ETH',
    displayName: '以太坊（ETH/USD）',
    provider: 'twelvedata',
    decimals: 2,
  },
  {
    symbol: 'NDX',
    label: 'NDX',
    displayName: '纳指100（NDX）',
    provider: 'cnbc',
    cnbcSymbol: '.NDX',
    stooqSymbol: '^NDX',
    decimals: 2,
  },
  {
    symbol: 'SPX',
    label: 'SPX',
    displayName: '标普500（SPX）',
    provider: 'cnbc',
    cnbcSymbol: '.SPX',
    stooqSymbol: '^SPX',
    decimals: 2,
  },
  {
    symbol: 'UDI',
    label: 'USDX',
    displayName: '美元（USDX）',
    provider: 'sina',
    sinaSymbol: 'DINIW',
    sinaType: 'usdx',
    secid: '100.UDI',
    decimals: 2,
  },
  {
    symbol: '000001',
    label: 'SH',
    displayName: '上证（SH）',
    provider: 'sina',
    sinaSymbol: 's_sh000001',
    sinaType: 'sh-index',
    secid: '1.000001',
    decimals: 2,
  },
];

function getRequiredEnv(env, key) {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`缺少环境变量 ${key}`);
  }
  return value;
}

function normalizeBaseURL(url) {
  return url.replace(/\/+$/, '');
}

function normalizeWebSocketURL(url) {
  return url.replace(/\/+$/, '');
}

function normalizeOneBotMessageType(value, fieldName) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  if (normalized !== 'group' && normalized !== 'private') {
    throw new Error(`${fieldName}=${value} 无效，仅支持 group 或 private`);
  }

  return normalized;
}

function toNumberLike(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLooseNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value)
    .replace(/,/g, '')
    .replace(/[％%]/g, '')
    .trim();

  return toNumberLike(normalized);
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

function formatTimestamp(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(date).replace(/\//g, '-');
}

function formatDateKey(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

function formatPrice(value, digits = null) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  const fractionDigits =
    Number.isInteger(digits) && digits >= 0
      ? digits
      : Math.abs(value) >= 1000
        ? 2
        : Math.abs(value) >= 1
          ? 4
          : 6;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatPercentChange(value) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const shortened = text
    .slice(0, Math.max(0, maxLength - 1))
    .replace(/[，,：:；;、\s]+$/u, '');

  return `${shortened}…`;
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function parseOneBotTargetList(rawValue) {
  return String(rawValue || '')
    .split(/[\n,]/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [messageType, targetId] = item.split(':');
      if (!messageType || !targetId) {
        throw new Error(
          `ONEBOT_EXTRA_TARGETS 条目 "${item}" 无效，格式应为 group:群号 或 private:QQ号`,
        );
      }

      return {
        messageType: normalizeOneBotMessageType(
          messageType,
          'ONEBOT_EXTRA_TARGETS',
        ),
        targetId: targetId.trim(),
      };
    });
}

function dedupeOneBotTargets(targets) {
  const seen = new Set();
  return targets.filter((target) => {
    const key = `${target.messageType}:${target.targetId}`;
    if (!target.targetId || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function stripHtml(text) {
  return normalizeWhitespace(decodeHtmlEntities(text).replace(/<[^>]*>/g, ' '));
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collapseRepeatedHeadline(text) {
  const normalized = normalizeWhitespace(String(text || ''))
    .replace(/\s+\d+\s*(?:分钟|小时|天)前$/u, '')
    .trim();

  if (!normalized) {
    return '';
  }

  const repeatedMatch = normalized.match(/^(.{6,140}?)(?:\1)+$/u);
  if (repeatedMatch) {
    return repeatedMatch[1];
  }

  const comparable = (value) =>
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .trim();

  for (
    let splitIndex = Math.floor(normalized.length / 2) + 4;
    splitIndex >= 6;
    splitIndex -= 1
  ) {
    const left = normalized.slice(0, splitIndex).trim();
    const right = normalized.slice(splitIndex).trim();

    if (!left || !right) {
      continue;
    }

    const comparableLeft = comparable(left);
    const comparableRight = comparable(right);

    if (
      comparableLeft.length >= 6 &&
      comparableRight.length >= 6 &&
      (comparableRight === comparableLeft ||
        comparableRight.startsWith(comparableLeft) ||
        comparableLeft.startsWith(comparableRight))
    ) {
      return left;
    }
  }

  return normalized;
}

function containsTechHeadlineEntity(text) {
  return /(?:苹果|微软|谷歌|google|openai|anthropic|claude|英伟达|nvidia|meta|亚马逊|amazon|特斯拉|华为|阿里|腾讯|字节|deepseek|qwen|gemini|ollama|mlx|cuda|linux|windows)/iu.test(
    text,
  );
}

function containsTechHeadlineVerb(text) {
  return /(?:回应|确认|发布|推出|上线|开源|升级|接入|支持|采用|收购|投资|融资|扩展)/u.test(
    text,
  );
}

function truncateMultiTopicTechHeadline(text) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return '';
  }

  const strongSegments = normalized
    .split(/[；;｜|]/u)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);

  if (strongSegments.length > 1) {
    return strongSegments[0];
  }

  const lastCommaIndex = Math.max(
    normalized.lastIndexOf('，'),
    normalized.lastIndexOf(','),
  );
  if (lastCommaIndex > 0) {
    const head = normalizeWhitespace(normalized.slice(0, lastCommaIndex));
    const tail = normalizeWhitespace(normalized.slice(lastCommaIndex + 1));

    if (
      head &&
      tail &&
      containsTechHeadlineEntity(head) &&
      containsTechHeadlineVerb(head) &&
      containsTechHeadlineEntity(tail) &&
      containsTechHeadlineVerb(tail)
    ) {
      return head;
    }
  }

  const commaSegments = normalized
    .split(/[，,]/u)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);

  if (commaSegments.length >= 2 && normalized.length >= 28) {
    const [firstSegment, secondSegment] = commaSegments;
    if (
      containsTechHeadlineEntity(firstSegment) &&
      containsTechHeadlineEntity(secondSegment) &&
      containsTechHeadlineVerb(firstSegment) &&
      containsTechHeadlineVerb(secondSegment)
    ) {
      return firstSegment;
    }
  }

  return normalized;
}

function normalizeNewsDuplicateText(text) {
  return normalizeWhitespace(stripHtml(decodeHtmlEntities(String(text || ''))))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function buildNewsBigrams(text) {
  if (!text) {
    return new Set();
  }

  if (text.length === 1) {
    return new Set([text]);
  }

  const grams = new Set();
  for (let index = 0; index < text.length - 1; index += 1) {
    grams.add(text.slice(index, index + 2));
  }

  return grams;
}

function calculateNormalizedNewsSimilarity(leftText, rightText) {
  const leftBigrams = buildNewsBigrams(leftText);
  const rightBigrams = buildNewsBigrams(rightText);

  if (!leftBigrams.size || !rightBigrams.size) {
    return 0;
  }

  let overlapCount = 0;
  for (const gram of leftBigrams) {
    if (rightBigrams.has(gram)) {
      overlapCount += 1;
    }
  }

  return (2 * overlapCount) / (leftBigrams.size + rightBigrams.size);
}

function isLikelyDuplicateNewsText(leftText, rightText) {
  const normalizedLeft = normalizeNewsDuplicateText(leftText);
  const normalizedRight = normalizeNewsDuplicateText(rightText);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  if (normalizedLeft === normalizedRight) {
    return true;
  }

  if (
    Math.min(normalizedLeft.length, normalizedRight.length) >= 10 &&
    (normalizedLeft.includes(normalizedRight) ||
      normalizedRight.includes(normalizedLeft))
  ) {
    return true;
  }

  return (
    calculateNormalizedNewsSimilarity(normalizedLeft, normalizedRight) >=
    NEWS_DUPLICATE_SIMILARITY_THRESHOLD
  );
}

function selectUniqueNewsEntries(entries, textSelector) {
  const uniqueEntries = [];
  const seenTexts = [];

  for (const entry of entries) {
    const normalizedText = textSelector(entry);
    if (!normalizedText) {
      continue;
    }

    if (
      seenTexts.some((seenText) =>
        isLikelyDuplicateNewsText(normalizedText, seenText),
      )
    ) {
      continue;
    }

    uniqueEntries.push(entry);
    seenTexts.push(normalizedText);
  }

  return uniqueEntries;
}

function normalizeTechAiNewsTitle(text) {
  return truncateMultiTopicTechHeadline(
    collapseRepeatedHeadline(
      normalizeWhitespace(
        stripHtml(text)
          .replace(/[|｜].*$/u, '')
          .replace(/_[^_]{1,20}$/u, '')
          .replace(/[：:]\s*Google News$/iu, ''),
      ),
    ),
  );
}

function normalizeFinanceHeadline(text) {
  return stripFinanceNoise(
    stripHtml(text)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+\d+\s*(?:分钟|小时|天)前$/u, '')
      .trim(),
  );
}

function buildNewsFingerprint(item, category) {
  const primaryText =
    category === 'finance'
      ? normalizeFinanceHeadline(item.title || item.summary || '')
      : normalizeTechAiNewsTitle(item.title || item.summary || '');
  const secondaryText =
    category === 'finance'
      ? normalizeFinanceHeadline(item.summary || '')
      : normalizeTechAiNewsTitle(item.summary || '');

  return normalizeNewsDuplicateText(primaryText || secondaryText || '');
}

function createEmptyDailyNewsState() {
  return {
    version: DAILY_NEWS_STATE_VERSION,
    days: {},
  };
}

function normalizeDailyNewsState(rawState) {
  const days = {};
  const sourceDays =
    rawState && typeof rawState === 'object' && rawState.days
      ? rawState.days
      : {};

  for (const [dateKey, categories] of Object.entries(sourceDays)) {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(dateKey)) {
      continue;
    }

    const normalizedCategories = {};
    for (const category of Object.keys(NEWS_CATEGORY_CONFIG)) {
      const seenFingerprints = Array.isArray(categories?.[category])
        ? categories[category]
            .map((item) => normalizeNewsDuplicateText(item))
            .filter(Boolean)
        : [];

      if (seenFingerprints.length > 0) {
        normalizedCategories[category] = seenFingerprints;
      }
    }

    days[dateKey] = normalizedCategories;
  }

  const keptDateKeys = Object.keys(days)
    .sort()
    .slice(-DAILY_NEWS_STATE_RETENTION_DAYS);
  const prunedDays = {};
  for (const dateKey of keptDateKeys) {
    prunedDays[dateKey] = days[dateKey];
  }

  return {
    version: DAILY_NEWS_STATE_VERSION,
    days: prunedDays,
  };
}

function shouldSkipNewsByFingerprint(fingerprint, seenFingerprints) {
  if (!fingerprint) {
    return false;
  }

  return seenFingerprints.some((seenFingerprint) =>
    isLikelyDuplicateNewsText(fingerprint, seenFingerprint),
  );
}

function limitForNewsCategory(category, config) {
  return category === 'finance'
    ? config.financeNewsLimit
    : config.techAiNewsLimit;
}

export function filterDailyDuplicateNews(
  newsSections,
  state,
  config,
  generatedAt = new Date(),
) {
  const normalizedState = normalizeDailyNewsState(state);
  const dateKey = formatDateKey(generatedAt, config.timeZone);

  return newsSections.map((section) => {
    const seenFingerprints = [
      ...((normalizedState.days[dateKey] || {})[section.category] || []),
    ];
    const uniqueItems = [];

    for (const item of section.items || []) {
      const fingerprint = buildNewsFingerprint(item, section.category);
      if (shouldSkipNewsByFingerprint(fingerprint, seenFingerprints)) {
        continue;
      }

      uniqueItems.push(item);
      if (fingerprint) {
        seenFingerprints.push(fingerprint);
      }
    }

    const limitedItems = uniqueItems.slice(
      0,
      limitForNewsCategory(section.category, config),
    );

    return {
      ...section,
      items: limitedItems,
      emptyText:
        section.items?.length > 0 && limitedItems.length === 0
          ? '今天暂无新的新闻。'
          : section.emptyText || '',
    };
  });
}

export function mergeDailyNewsState(
  state,
  newsSections,
  config,
  generatedAt = new Date(),
) {
  const normalizedState = normalizeDailyNewsState(state);
  const dateKey = formatDateKey(generatedAt, config.timeZone);
  const dayState = {
    ...(normalizedState.days[dateKey] || {}),
  };

  for (const section of newsSections) {
    const seenFingerprints = [...(dayState[section.category] || [])];

    for (const item of section.items || []) {
      const fingerprint = buildNewsFingerprint(item, section.category);
      if (
        fingerprint &&
        !shouldSkipNewsByFingerprint(fingerprint, seenFingerprints)
      ) {
        seenFingerprints.push(fingerprint);
      }
    }

    if (seenFingerprints.length > 0) {
      dayState[section.category] = seenFingerprints;
    }
  }

  return normalizeDailyNewsState({
    ...normalizedState,
    days: {
      ...normalizedState.days,
      [dateKey]: dayState,
    },
  });
}

async function readDailyNewsStateFromFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return normalizeDailyNewsState(JSON.parse(content));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return createEmptyDailyNewsState();
    }

    console.warn(
      `[qq-market-bot] 读取新闻去重状态失败，已忽略并继续：${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return createEmptyDailyNewsState();
  }
}

async function writeDailyNewsStateToFile(filePath, state) {
  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      `${JSON.stringify(normalizeDailyNewsState(state), null, 2)}\n`,
      'utf8',
    );
  } catch (error) {
    console.warn(
      `[qq-market-bot] 写入新闻去重状态失败，后续推送可能重复：${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function createDailyNewsStateStore(config) {
  return {
    read: () => readDailyNewsStateFromFile(config.newsStateFile),
    write: (state) => writeDailyNewsStateToFile(config.newsStateFile, state),
  };
}

function buildRequestOptions(options = {}) {
  return {
    ...options,
    headers: {
      ...DEFAULT_REQUEST_HEADERS,
      ...(options.headers || {}),
    },
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, buildRequestOptions(options));
  const bodyText = await response.text();

  let data = null;
  if (bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch (error) {
      if (!response.ok) {
        throw new Error(
          `请求失败 (${response.status})，返回了非 JSON 内容：${bodyText.slice(0, 200)}`,
        );
      }
      throw new Error(`接口返回了不可解析的 JSON：${bodyText.slice(0, 200)}`);
    }
  }

  if (!response.ok) {
    const message =
      data?.message || data?.msg || data?.error || `HTTP ${response.status}`;
    throw new Error(`请求失败：${message}`);
  }

  return data;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, buildRequestOptions(options));
  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(
      `请求文本内容失败 (${response.status})：${bodyText.slice(0, 200)}`,
    );
  }

  return bodyText;
}

async function fetchTextWithCurl(url, options = {}) {
  const normalizedOptions = buildRequestOptions(options);
  const method = (normalizedOptions.method || 'GET').toUpperCase();
  const args = ['-L', '-s', '--max-time', '20', '-X', method];

  for (const [key, value] of Object.entries(normalizedOptions.headers || {})) {
    args.push('-H', `${key}: ${value}`);
  }

  if (typeof normalizedOptions.body === 'string') {
    args.push('--data-raw', normalizedOptions.body);
  }

  args.push(String(url));

  const { stdout } = await execFileAsync('curl', args, {
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout;
}

async function fetchTextWithPython(url, options = {}) {
  const normalizedOptions = buildRequestOptions(options);
  const method = (normalizedOptions.method || 'GET').toUpperCase();
  const headersJson = JSON.stringify(normalizedOptions.headers || {});
  const body =
    typeof normalizedOptions.body === 'string' ? normalizedOptions.body : '';
  const script = `
import json
import sys
import urllib.request

url, method, headers_json, body = sys.argv[1:5]
headers = json.loads(headers_json)
data = body.encode("utf-8") if body else None
request = urllib.request.Request(url, data=data, headers=headers, method=method)
with urllib.request.urlopen(request, timeout=20) as response:
    sys.stdout.buffer.write(response.read())
`.trim();

  const { stdout } = await execFileAsync(
    'python3',
    ['-c', script, String(url), method, headersJson, body],
    {
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  return stdout;
}

async function fetchJsonWithCurl(url, options = {}) {
  const bodyText = await fetchTextWithCurl(url, options);

  try {
    return JSON.parse(bodyText);
  } catch (error) {
    throw new Error(`curl 返回了不可解析的 JSON：${bodyText.slice(0, 200)}`);
  }
}

async function fetchJsonWithPython(url, options = {}) {
  const bodyText = await fetchTextWithPython(url, options);

  try {
    return JSON.parse(bodyText);
  } catch (error) {
    throw new Error(`python 返回了不可解析的 JSON：${bodyText.slice(0, 200)}`);
  }
}

async function fetchEastmoneyJson(url) {
  try {
    return await fetchJson(url);
  } catch {
    try {
      return await fetchJsonWithPython(url);
    } catch {
      return fetchJsonWithCurl(url);
    }
  }
}

async function fetchTextWithFallbacks(url, options = {}) {
  try {
    return await fetchText(url, options);
  } catch {
    try {
      return await fetchTextWithPython(url, options);
    } catch {
      return fetchTextWithCurl(url, options);
    }
  }
}

function parseEastmoneyPublishedAt(value) {
  return value ? new Date(`${value.replace(' ', 'T')}+08:00`) : null;
}

function appendFullStop(text) {
  if (!text) {
    return '';
  }

  return /[。！？!?]$/.test(text) ? text : `${text}。`;
}

function stripSummaryLead(text) {
  return normalizeWhitespace(
    stripHtml(text)
      .replace(/^36氪获悉[，,\s]*/u, '')
      .replace(/^据[^，,]{1,20}[，,]\s*/u, '')
      .replace(/^当地时间\d{1,2}月\d{1,2}日[，,\s]*/u, '')
      .replace(/^北京时间\d{1,2}月\d{1,2}日[，,\s]*/u, '')
      .replace(/^\d{1,2}月\d{1,2}日[，,\s]*/u, '')
      .replace(/^今天(?:（\d{1,2}月\d{1,2}日）)?[，,\s]*/u, '')
      .replace(/^今日[，,\s]*/u, '')
      .replace(/^\[[^\]]+\]\s*/u, '')
      .replace(/https?:\/\/\S+/giu, '')
      .replace(/\/\/\S+/gu, '')
      .replace(/(?:或)?使用微信扫描下方小程序码[。.]?/gu, '')
      .replace(/\[点击查看全文]/g, '')
      .replace(/\(([0-9]{6}\.[A-Z]{2,4})\)/g, '')
      .replace(
        /（(?:界面|第一财经|财联社|央视新闻|新华社|证券时报)[^）]*）$/u,
        '',
      )
      .replace(
        /\((?:界面|第一财经|财联社|央视新闻|新华社|证券时报)[^)]*\)$/u,
        '',
      ),
  ).replace(/^[，,：:；;、\s]+/u, '');
}

function normalizeSummaryClause(text) {
  return normalizeWhitespace(
    String(text || '')
      .replace(/^[“"'‘’]+/u, '')
      .replace(/[”"'‘’]+$/u, '')
      .replace(
        /^(?:其中|另外|此外|同时|目前|对此|对于|关于|而且|并且|不过|但是|受访时|回应称)\s*/u,
        '',
      ),
  ).replace(/^[，,：:；;、\s]+|[，,：:；;、\s]+$/gu, '');
}

function scoreSummaryCandidate(text, maxLength) {
  if (!text) {
    return Number.NEGATIVE_INFINITY;
  }

  const completed = appendFullStop(text);
  if (completed.length > maxLength) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = Math.min(completed.length, maxLength);

  if (completed.length >= 10) {
    score += 12;
  }

  if (
    /(?:发布|推出|回购|融资|开源|上线|升级|达成|通过|上涨|下跌|直播|谈判|降息|加息|财报|芯片|模型|智能体|数据中心|指数|原油|黄金|白银|以太坊|美元|上证|苹果|微软|阿里|openai|nvidia|linux|微信)/iu.test(
      completed,
    )
  ) {
    score += 24;
  }

  if (/[，,：:]/u.test(completed)) {
    score += 6;
  }

  if (
    /^(?:在|对|就|于|并|而|但|若|拟|将|被|由|与|及|因|其|其中|此外|同时|当地时间|北京时间|期限|此次|同比|环比|且|或|敬请|如果|本次|本公司|注意风险|也|表示|希望)/u.test(
      completed,
    )
  ) {
    score -= 24;
  }

  return score;
}

export function normalizeSummaryLine(text, maxLength) {
  if (!text) {
    return '';
  }

  const normalized = stripSummaryLead(text);

  if (!normalized) {
    return '';
  }

  const completed = appendFullStop(normalized);
  if (completed.length <= maxLength) {
    return completed;
  }

  const clauses = normalized
    .split(/[。！？!?；;，,：:]/u)
    .map((item) => normalizeSummaryClause(item))
    .filter(Boolean);
  const candidates = [];

  for (let index = 0; index < clauses.length; index += 1) {
    candidates.push(clauses[index]);

    if (clauses[index + 1]) {
      candidates.push(`${clauses[index]}，${clauses[index + 1]}`);
    }

    if (clauses[index + 1] && clauses[index + 2]) {
      candidates.push(
        `${clauses[index]}，${clauses[index + 1]}，${clauses[index + 2]}`,
      );
    }
  }

  const uniqueCandidates = [...new Set(candidates)]
    .map((item) => item.replace(/[，,：:；;、\s]+$/u, ''))
    .filter(Boolean);

  let bestCandidate = '';
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of uniqueCandidates) {
    const score = scoreSummaryCandidate(candidate, maxLength);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate) {
    return appendFullStop(bestCandidate);
  }

  return truncateText(completed, maxLength);
}

function isLowQualitySummaryLine(text) {
  if (!text) {
    return true;
  }

  if (/https?:\/\/\S+|\/\/\S+/iu.test(text)) {
    return true;
  }

  if (/微信扫描下方小程序码/u.test(text)) {
    return true;
  }

  if (
    /^(?:期限|此次|同比|环比|且|或|敬请|如果|本次|本公司|注意风险)/u.test(text)
  ) {
    return true;
  }

  const hanLength = (text.match(/[\u4e00-\u9fff]/gu) || []).length;
  return hanLength < 6;
}

function stripFinanceNoise(text) {
  return normalizeWhitespace(
    stripHtml(text)
      .replace(
        /^(?:\d+\s*)?(?:时代财经(?:时代财经)?(?:AI)?快讯|财联社(?:电报)?|证券时报(?:e公司)?|第一财经|界面新闻|央视新闻|新华社|东方财富(?:choice数据)?|cfi\.cn讯|快讯|ai快讯)[：:,，\s]*/iu,
        '',
      )
      .replace(
        /^证券代码[:：]?\s*\d+\s+证券简称[:：]?\S+\s+公告编号[:：]?\S+[，,\s]*/u,
        '',
      )
      .replace(/^公告编号[:：]?\S+[，,\s]*/u, '')
      .replace(/^\d{4}-\d{2,4}）?[，,\s]*/u, '')
      .replace(/\s*[■◆●]\s*/gu, '。')
      .replace(/(?:点击(?:查看|进入)|详情请见|原文链接).*$/u, '')
      .replace(/(?:扫码|扫描).{0,20}(?:小程序码|二维码).*$/u, '')
      .replace(/为方便广大投资者[\s\S]*$/u, '')
      .replace(/投资者可于[\s\S]*$/u, '')
      .replace(/，[^，。]{0,12}说[。.]?$/u, '')
      .replace(/（文章来源[^）]*）$/u, '')
      .replace(/\((?:文章来源|来源)[^)]*\)$/u, ''),
  );
}

function containsFinanceActionKeyword(text) {
  const haystack = `${text || ''}`.toLowerCase();
  return (
    FINANCE_NEWS_FILTER_CONFIG.positiveKeywords.some((keyword) =>
      includesKeyword(haystack, keyword),
    ) ||
    /(?:拟|将|宣布|达成|突破|成功|走强|走高|调整|回购|财报|谈判|下滑|上涨|下跌|融资|分红|增持|减持|重组)/u.test(
      text,
    )
  );
}

function isLowQualityFinanceSummaryLine(text) {
  if (isLowQualitySummaryLine(text)) {
    return true;
  }

  if (
    /(?:公告编号|证券代码|证券简称|小程序码|二维码|业绩说明会|投资者关系活动|关于召开|年度经营业绩)/u.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /^(?:本公司自\d{4}年|经研究决定|为方便广大投资者|投资者可于|强调)/u.test(
      text,
    )
  ) {
    return true;
  }

  if (/^(?:也|表示|希望)/u.test(text)) {
    return true;
  }

  if (/发布公告。?$/u.test(text) && !containsFinanceActionKeyword(text)) {
    return true;
  }

  return false;
}

function scoreFinanceSummaryLine(text, source = '') {
  if (!text || isLowQualityFinanceSummaryLine(text)) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = scoreFinanceNewsItem({
    title: text,
    summary: text,
    source,
  });

  if (containsFinanceActionKeyword(text)) {
    score += 6;
  }

  if (
    /，(?:中国证监会|特朗普|美国总统|俄罗斯政府|伊朗外交部发言人|巴加埃|国家药监局)/u.test(
      text,
    )
  ) {
    score -= 8;
  }

  score += Math.min(text.length, 80) / 10;
  return score;
}

function chooseFinanceSummary(summary, fallbackSummary, source = '') {
  const summaryScore = scoreFinanceSummaryLine(summary, source);
  const fallbackScore = scoreFinanceSummaryLine(fallbackSummary, source) + 2;

  return fallbackScore >= summaryScore ? fallbackSummary : summary;
}

function stripEastmoneyHeadline(text) {
  const match = text.match(/^【([^】]+)】([\s\S]*)$/u);
  if (!match) {
    return text;
  }

  const body = normalizeWhitespace(match[2] || '');
  return body || match[1];
}

function isWithinLookbackWindow(date, hours, now = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    return false;
  }

  return now.valueOf() - date.valueOf() <= hours * 60 * 60 * 1000;
}

function extractXmlTagValue(xml, tagName) {
  const pattern = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`,
    'i',
  );
  const match = xml.match(pattern);
  if (!match) {
    return '';
  }

  return match[1]
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .trim();
}

function parseRssItems(xml) {
  const items = [];
  const pattern = /<item>([\s\S]*?)<\/item>/gi;
  let match = pattern.exec(xml);

  while (match) {
    items.push(match[1]);
    match = pattern.exec(xml);
  }

  return items;
}

function parseRssFeedItems(xml, sourceName = '') {
  return parseRssItems(xml)
    .map((itemXml) => {
      const title = decodeHtmlEntities(
        stripHtml(extractXmlTagValue(itemXml, 'title')),
      );
      const source =
        sourceName ||
        decodeHtmlEntities(stripHtml(extractXmlTagValue(itemXml, 'source')));
      const publishedAtText =
        extractXmlTagValue(itemXml, 'pubDate') ||
        extractXmlTagValue(itemXml, 'dc:date');
      const publishedAt = publishedAtText ? new Date(publishedAtText) : null;
      const cleanedTitle = normalizeTechAiNewsTitle(
        source && title.endsWith(` - ${source}`)
          ? title.slice(0, -` - ${source}`.length)
          : title,
      );

      return {
        title: cleanedTitle,
        summary: cleanedTitle,
        source,
        publishedAt,
      };
    })
    .filter((item) => item.title);
}

function parseGenericRssHeadlineItems(xml, sourceName = '') {
  return parseRssItems(xml)
    .map((itemXml) => {
      const title = collapseRepeatedHeadline(
        normalizeWhitespace(stripHtml(extractXmlTagValue(itemXml, 'title'))),
      );
      const source =
        sourceName ||
        decodeHtmlEntities(stripHtml(extractXmlTagValue(itemXml, 'source')));
      const publishedAtText =
        extractXmlTagValue(itemXml, 'pubDate') ||
        extractXmlTagValue(itemXml, 'dc:date');

      return {
        title,
        summary: title,
        source,
        publishedAt: publishedAtText ? new Date(publishedAtText) : null,
      };
    })
    .filter((item) => item.title);
}

function buildTechAiNewsItem(item, maxLength) {
  const cleanedTitle = normalizeTechAiNewsTitle(
    item.title || item.summary || '',
  );
  const summary = normalizeSummaryLine(item.summary || item.title, maxLength);
  const fallbackSummary = normalizeSummaryLine(cleanedTitle, maxLength);

  return {
    title: cleanedTitle || item.title,
    summary:
      summary && !isLowQualitySummaryLine(summary) ? summary : fallbackSummary,
    publishedAt: item.publishedAt,
  };
}

function includesKeyword(text, keyword) {
  return text.includes(keyword.toLowerCase());
}

function countMatchedKeywords(text, keywords = []) {
  return keywords.reduce(
    (count, keyword) => count + (includesKeyword(text, keyword) ? 1 : 0),
    0,
  );
}

function isExcludedTechAiNewsItem(item) {
  const haystack = `${item.title} ${item.source || ''}`.toLowerCase();
  return (TECH_AI_NEWS_FILTER_CONFIG.excludeKeywords || []).some((keyword) =>
    includesKeyword(haystack, keyword),
  );
}

function isRelevantTechAiNewsItem(item) {
  const haystack =
    `${item.title} ${item.summary || ''} ${item.source || ''}`.toLowerCase();
  const coreKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.coreKeywords,
  );
  const infraKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.infraKeywords,
  );

  return coreKeywordHits > 0 || infraKeywordHits > 0;
}

function scoreTechAiNewsItem(item) {
  const haystack =
    `${item.title} ${item.summary || ''} ${item.source || ''}`.toLowerCase();
  const coreKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.coreKeywords,
  );
  const infraKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.infraKeywords,
  );
  const entityKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.entityKeywords,
  );

  return coreKeywordHits * 4 + infraKeywordHits * 2 + entityKeywordHits;
}

export function selectTechAiNewsItems(
  items,
  config,
  now = new Date(),
  limit = config.techAiNewsLimit,
) {
  const candidates = items
    .filter((item) =>
      isWithinLookbackWindow(item.publishedAt, NEWS_LOOKBACK_HOURS, now),
    )
    .map((item) => ({
      item,
      excluded: isExcludedTechAiNewsItem(item),
      relevant: isRelevantTechAiNewsItem(item),
      score: scoreTechAiNewsItem(item),
      publishedAt:
        item.publishedAt instanceof Date ? item.publishedAt.valueOf() : 0,
    }))
    .filter((entry) => !entry.excluded && entry.relevant)
    .sort(
      (left, right) =>
        right.score - left.score || right.publishedAt - left.publishedAt,
    );

  const dedupedCandidates = selectUniqueNewsEntries(candidates, (entry) =>
    normalizeTechAiNewsTitle(entry.item.title || entry.item.summary || ''),
  );
  const preferred = dedupedCandidates.filter((entry) => entry.score > 0);
  const fallback = dedupedCandidates.filter((entry) => entry.score === 0);

  return [...preferred, ...fallback]
    .slice(0, limit)
    .map((entry) =>
      buildTechAiNewsItem(entry.item, config.newsSummaryMaxLength),
    );
}

function buildEastmoneyFinanceNewsItem(item, maxLength) {
  const financeMaxLength = Math.max(maxLength, 68);
  const cleanedSummarySource = stripFinanceNoise(
    stripEastmoneyHeadline(item.summary || item.title || ''),
  );
  const cleanedTitleSource = stripFinanceNoise(
    stripEastmoneyHeadline(item.title || item.summary || ''),
  );
  const summary = normalizeSummaryLine(cleanedSummarySource, financeMaxLength);
  const fallbackSummary = normalizeSummaryLine(
    cleanedTitleSource,
    financeMaxLength,
  );
  const publishedAt =
    item.publishedAt instanceof Date
      ? item.publishedAt
      : parseEastmoneyPublishedAt(item.showTime || '');

  return {
    title: cleanedTitleSource || item.title || '',
    summary: chooseFinanceSummary(summary, fallbackSummary, item.source || ''),
    source: item.source || '',
    publishedAt,
  };
}

function isFinanceCalendarItem(item) {
  const haystack = `${item.title || ''} ${item.summary || ''}`;
  return /[①②③④⑤⑥⑦⑧⑨⑩].*[①②③④⑤⑥⑦⑧⑨⑩]/u.test(haystack);
}

function isExcludedFinanceNewsItem(item) {
  if (isFinanceCalendarItem(item)) {
    return true;
  }

  const normalizedSummary = normalizeWhitespace(item.summary || '');
  const normalizedTitle = normalizeWhitespace(item.title || '');
  if (
    isLowQualityFinanceSummaryLine(normalizedSummary) &&
    (!normalizedTitle || isLowQualityFinanceSummaryLine(normalizedTitle))
  ) {
    return true;
  }

  const haystack =
    `${item.title || ''} ${item.summary || ''} ${item.source || ''}`.toLowerCase();
  return FINANCE_NEWS_FILTER_CONFIG.excludeKeywords.some((keyword) =>
    includesKeyword(haystack, keyword),
  );
}

function scoreFinanceNewsItem(item) {
  const haystack =
    `${item.title || ''} ${item.summary || ''} ${item.source || ''}`.toLowerCase();
  return FINANCE_NEWS_FILTER_CONFIG.positiveKeywords.reduce(
    (score, keyword) => score + (includesKeyword(haystack, keyword) ? 1 : 0),
    0,
  );
}

export function selectFinanceNewsItems(items, config, now = new Date()) {
  const limit = config.financeNewsLimit;
  const candidates = items
    .filter(
      (item) =>
        !(item.publishedAt instanceof Date) ||
        isWithinLookbackWindow(item.publishedAt, NEWS_LOOKBACK_HOURS, now),
    )
    .map((item) => ({
      item,
      excluded: isExcludedFinanceNewsItem(item),
      score: scoreFinanceNewsItem(item),
      publishedAt:
        item.publishedAt instanceof Date ? item.publishedAt.valueOf() : 0,
    }))
    .filter((entry) => !entry.excluded)
    .sort(
      (left, right) =>
        right.score - left.score || right.publishedAt - left.publishedAt,
    );

  const dedupedCandidates = selectUniqueNewsEntries(candidates, (entry) =>
    normalizeFinanceHeadline(entry.item.summary || entry.item.title || ''),
  );
  const preferred = dedupedCandidates.filter((entry) => entry.score > 0);
  const fallback = dedupedCandidates.filter((entry) => entry.score === 0);

  return [...preferred, ...fallback].slice(0, limit).map((entry) => entry.item);
}

async function fetchTechAiNewsCategory(config) {
  const category = 'tech-ai';
  const candidateLimit =
    config.techAiNewsLimit * DEFAULT_DAILY_NEWS_FETCH_MULTIPLIER;
  const feedResults = await Promise.allSettled(
    TECH_AI_NEWS_FEEDS.map(async (feed) => {
      try {
        const xml = await fetchText(feed.url);
        return parseRssFeedItems(xml, feed.name);
      } catch {
        const xml = await fetchTextWithCurl(feed.url);
        return parseRssFeedItems(xml, feed.name);
      }
    }),
  );

  const items = selectTechAiNewsItems(
    feedResults
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value),
    config,
    new Date(),
    candidateLimit,
  );

  if (items.length === 0) {
    const errors = feedResults
      .filter((result) => result.status === 'rejected')
      .map((result) =>
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason),
      )
      .filter(Boolean)
      .join('；');

    if (errors) {
      throw new Error(errors);
    }
  }

  return {
    category,
    title: NEWS_CATEGORY_CONFIG[category].title,
    items,
    error: '',
  };
}

function buildFinanceHeadlineNewsItem(item, maxLength) {
  const financeMaxLength = Math.max(maxLength, 68);
  const cleanedTitle = normalizeFinanceHeadline(
    collapseRepeatedHeadline(item.title || item.summary || ''),
  );
  const summary = normalizeSummaryLine(cleanedTitle, financeMaxLength);

  return {
    title: cleanedTitle,
    summary: summary || appendFullStop(cleanedTitle),
    source: item.source || '',
    publishedAt: item.publishedAt instanceof Date ? item.publishedAt : null,
  };
}

function parseYicaiFinanceItems(html, now = new Date()) {
  const items = [];
  const pattern = /<a[^>]+href="(\/news\/\d+\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match = pattern.exec(html);

  while (match) {
    const title = normalizeFinanceHeadline(
      collapseRepeatedHeadline(stripHtml(match[2] || '')),
    );

    if (title && title.length >= 6) {
      items.push({
        title,
        summary: title,
        source: '第一财经',
        publishedAt: new Date(now.valueOf() - items.length * 60 * 1000),
      });
    }

    match = pattern.exec(html);
  }

  return items;
}

async function fetchYicaiFinanceItems(config) {
  const html = await fetchTextWithFallbacks(YICAI_INFO_URL);
  return parseYicaiFinanceItems(html).map((item) =>
    buildFinanceHeadlineNewsItem(item, config.newsSummaryMaxLength),
  );
}

async function fetch36KrFinanceItems(config) {
  const xml = await fetchTextWithFallbacks(THIRTY_SIX_KR_NEWSFLASH_FEED_URL);
  return parseGenericRssHeadlineItems(xml, '36氪快讯').map((item) =>
    buildFinanceHeadlineNewsItem(item, config.newsSummaryMaxLength),
  );
}

async function fetchEastmoneyFinanceCategory(config) {
  const category = 'finance';
  const candidateLimit =
    config.financeNewsLimit * DEFAULT_DAILY_NEWS_FETCH_MULTIPLIER;
  const url = new URL(EASTMONEY_FAST_NEWS_URL);
  url.searchParams.set('client', 'web');
  url.searchParams.set('biz', 'web_724');
  url.searchParams.set('fastColumn', EASTMONEY_FAST_NEWS_COLUMN);
  url.searchParams.set('sortEnd', '');
  url.searchParams.set(
    'pageSize',
    String(
      Math.max(
        config.financeNewsLimit * FINANCE_NEWS_FETCH_MULTIPLIER,
        candidateLimit,
      ),
    ),
  );
  url.searchParams.set('req_trace', String(Date.now()));

  const response = await fetchEastmoneyJson(url);
  const items = selectFinanceNewsItems(
    (response?.data?.fastNewsList || []).map((item) =>
      buildEastmoneyFinanceNewsItem(item, config.newsSummaryMaxLength),
    ),
    config,
    new Date(),
    candidateLimit,
  );

  return {
    category,
    title: NEWS_CATEGORY_CONFIG[category].title,
    items,
    error: '',
  };
}

function extractEastmoneySkillFinanceItems(response) {
  return response?.data?.data?.llmSearchResponse?.data || [];
}

async function fetchEastmoneyFinanceSkillCategory(config) {
  const category = 'finance';
  const candidateLimit =
    config.financeNewsLimit * DEFAULT_DAILY_NEWS_FETCH_MULTIPLIER;
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.eastmoneyApiKey,
    },
    body: JSON.stringify({
      query: config.eastmoneySkillQuery,
    }),
  };

  let response = null;
  try {
    response = await fetchJson(EASTMONEY_MIAOXIANG_NEWS_URL, requestOptions);
  } catch {
    try {
      response = await fetchJsonWithPython(
        EASTMONEY_MIAOXIANG_NEWS_URL,
        requestOptions,
      );
    } catch {
      response = await fetchJsonWithCurl(
        EASTMONEY_MIAOXIANG_NEWS_URL,
        requestOptions,
      );
    }
  }

  const items = selectFinanceNewsItems(
    extractEastmoneySkillFinanceItems(response)
      .filter((item) =>
        ['NEWS', 'INV_NEWS'].includes(item?.informationType || ''),
      )
      .map((item) =>
        buildEastmoneyFinanceNewsItem(
          {
            title: item?.title || '',
            summary: item?.content || item?.title || '',
            showTime: item?.date || '',
            source: item?.source || '',
          },
          config.newsSummaryMaxLength,
        ),
      ),
    config,
    new Date(),
    candidateLimit,
  );

  return {
    category,
    title: NEWS_CATEGORY_CONFIG[category].title,
    items,
    error: '',
  };
}

async function fetchFinanceNewsCategory(config) {
  const category = 'finance';
  const candidateLimit =
    config.financeNewsLimit * DEFAULT_DAILY_NEWS_FETCH_MULTIPLIER;
  const primaryResults = await Promise.allSettled([
    fetchYicaiFinanceItems(config),
    fetch36KrFinanceItems(config),
  ]);
  const primaryItems = primaryResults
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);
  const errors = primaryResults
    .filter((result) => result.status === 'rejected')
    .map((result) =>
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason),
    )
    .filter(Boolean);

  let selectedItems = selectFinanceNewsItems(
    primaryItems,
    config,
    new Date(),
    candidateLimit,
  );

  if (selectedItems.length < config.financeNewsLimit) {
    const fallbackFetchers = [];

    if (config.eastmoneyApiKey) {
      fallbackFetchers.push(fetchEastmoneyFinanceSkillCategory(config));
    }

    fallbackFetchers.push(fetchEastmoneyFinanceCategory(config));

    const fallbackResults = await Promise.allSettled(fallbackFetchers);
    const fallbackItems = fallbackResults
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value.items || []);

    errors.push(
      ...fallbackResults
        .filter((result) => result.status === 'rejected')
        .map((result) =>
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
        )
        .filter(Boolean),
    );

    selectedItems = selectFinanceNewsItems(
      [...primaryItems, ...fallbackItems],
      config,
      new Date(),
      candidateLimit,
    );
  }

  if (selectedItems.length === 0 && errors.length > 0) {
    throw new Error(errors.join('；'));
  }

  return {
    category,
    title: NEWS_CATEGORY_CONFIG[category].title,
    items: selectedItems,
    error: '',
  };
}

export async function fetchNewsSection(category, config) {
  if (category === 'finance') {
    return fetchFinanceNewsCategory(config);
  }

  return fetchTechAiNewsCategory(config);
}

export function readConfig(
  env = process.env,
  { allowMissingTarget = false, allowMissingMarketDataKey = false } = {},
) {
  const mode = (env.QQ_BOT_MODE || 'onebot').trim();
  const timeZone = (env.MARKET_BOT_TIMEZONE || 'Asia/Shanghai').trim();
  const dryRun = env.MARKET_BOT_DRY_RUN === '1';

  const config = {
    mode,
    timeZone,
    dryRun,
    dailyNewsDedupEnabled: env.MARKET_DAILY_NEWS_DEDUPE !== '0',
    newsStateFile: resolve(
      process.cwd(),
      (env.MARKET_NEWS_STATE_FILE || DEFAULT_NEWS_STATE_FILE).trim(),
    ),
    techNewsLimit: toPositiveInteger(
      env.MARKET_TECH_NEWS_LIMIT,
      DEFAULT_TECH_NEWS_LIMIT,
    ),
    aiNewsLimit: toPositiveInteger(
      env.MARKET_AI_NEWS_LIMIT,
      DEFAULT_AI_NEWS_LIMIT,
    ),
    financeNewsLimit: toPositiveInteger(
      env.MARKET_FINANCE_NEWS_LIMIT,
      DEFAULT_FINANCE_NEWS_LIMIT,
    ),
    newsSummaryMaxLength: toPositiveInteger(
      env.MARKET_NEWS_SUMMARY_MAX_LENGTH,
      DEFAULT_NEWS_SUMMARY_MAX_LENGTH,
    ),
    techAiNewsLimit: toPositiveInteger(
      env.MARKET_TECH_AI_NEWS_LIMIT,
      toPositiveInteger(env.MARKET_TECH_NEWS_LIMIT, DEFAULT_TECH_NEWS_LIMIT) +
        toPositiveInteger(env.MARKET_AI_NEWS_LIMIT, DEFAULT_AI_NEWS_LIMIT),
    ),
    messageMaxLength: toPositiveInteger(
      env.MARKET_MESSAGE_MAX_LENGTH,
      DEFAULT_MESSAGE_MAX_LENGTH,
    ),
    eastmoneyApiKey: env.EASTMONEY_APIKEY?.trim() || '',
    eastmoneySkillQuery: env.EASTMONEY_SKILL_QUERY?.trim() || '最新财经快讯',
    twelveDataApiKey: allowMissingMarketDataKey
      ? env.TWELVE_DATA_API_KEY?.trim() || ''
      : getRequiredEnv(env, 'TWELVE_DATA_API_KEY'),
    symbols: DEFAULT_SYMBOLS,
  };

  if (mode === 'onebot') {
    const onebotWsUrl = env.ONEBOT_WS_URL?.trim() || '';
    const onebotHttpUrl = env.ONEBOT_HTTP_URL?.trim() || '';

    if (!onebotWsUrl && !onebotHttpUrl) {
      throw new Error('缺少环境变量 ONEBOT_HTTP_URL 或 ONEBOT_WS_URL');
    }

    const legacyMessageType = env.ONEBOT_MESSAGE_TYPE?.trim() || '';
    const legacyTargetId = env.ONEBOT_TARGET_ID?.trim() || '';
    const extraTargets = parseOneBotTargetList(env.ONEBOT_EXTRA_TARGETS);
    const targets = dedupeOneBotTargets([
      ...(legacyMessageType && legacyTargetId
        ? [
            {
              messageType: normalizeOneBotMessageType(
                legacyMessageType,
                'ONEBOT_MESSAGE_TYPE',
              ),
              targetId: legacyTargetId,
            },
          ]
        : []),
      ...extraTargets,
    ]);

    if (targets.length === 0 && !allowMissingTarget) {
      throw new Error(
        '缺少 OneBot 目标，请设置 ONEBOT_TARGET_ID，或使用 ONEBOT_EXTRA_TARGETS=group:群号,private:QQ号',
      );
    }

    return {
      ...config,
      onebotTransport: onebotHttpUrl ? 'http' : 'ws',
      onebotWsUrl: onebotWsUrl ? normalizeWebSocketURL(onebotWsUrl) : '',
      onebotHttpUrl: onebotHttpUrl ? normalizeBaseURL(onebotHttpUrl) : '',
      onebotAccessToken: env.ONEBOT_ACCESS_TOKEN?.trim() || '',
      onebotMessageType:
        targets[0]?.messageType ||
        (legacyMessageType
          ? normalizeOneBotMessageType(legacyMessageType, 'ONEBOT_MESSAGE_TYPE')
          : ''),
      onebotTargetId: targets[0]?.targetId || legacyTargetId,
      onebotTargets: targets,
    };
  }

  if (mode === 'qq-official') {
    return {
      ...config,
      qqAppId: getRequiredEnv(env, 'QQ_BOT_APP_ID'),
      qqClientSecret: getRequiredEnv(env, 'QQ_BOT_CLIENT_SECRET'),
      qqTargetType: allowMissingTarget
        ? env.QQ_BOT_TARGET_TYPE?.trim() || ''
        : getRequiredEnv(env, 'QQ_BOT_TARGET_TYPE'),
      qqTargetId: allowMissingTarget
        ? env.QQ_BOT_TARGET_ID?.trim() || ''
        : getRequiredEnv(env, 'QQ_BOT_TARGET_ID'),
      qqApiBaseUrl: normalizeBaseURL(
        env.QQ_BOT_API_BASE_URL?.trim() || QQ_OFFICIAL_API_BASE_URL,
      ),
    };
  }

  throw new Error(
    `不支持的 QQ_BOT_MODE=${mode}，目前仅支持 onebot 或 qq-official`,
  );
}

export async function fetchTwelveDataQuote(symbol, apiKey) {
  const url = new URL(TWELVE_DATA_QUOTE_URL);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('apikey', apiKey);

  const data = await fetchJson(url);

  if (data?.status === 'error') {
    throw new Error(
      `Twelve Data ${symbol} 查询失败：${data.message || '未知错误'}`,
    );
  }

  const price = toNumberLike(data?.close ?? data?.price);
  if (price === null) {
    throw new Error(`Twelve Data ${symbol} 没有返回有效价格`);
  }

  return {
    symbol,
    price,
    percentChange: toNumberLike(data?.percent_change),
    exchange: data?.exchange || '',
    sourceTimestamp: data?.datetime || '',
  };
}

export async function fetchEastmoneyQuote(symbolConfig) {
  const url = new URL('https://push2.eastmoney.com/api/qt/stock/get');
  url.searchParams.set('secid', symbolConfig.secid);
  url.searchParams.set('fields', 'f43,f57,f58,f59,f169,f170');

  const response = await fetchEastmoneyJson(url);
  const data = response?.data;

  if (!data) {
    throw new Error(`东方财富 ${symbolConfig.label} 查询失败：未返回有效数据`);
  }

  const rawPrice = toNumberLike(data.f43);
  const decimals = toNumberLike(data.f59) ?? symbolConfig.decimals ?? 2;

  if (rawPrice === null) {
    throw new Error(`东方财富 ${symbolConfig.label} 没有返回有效价格`);
  }

  return {
    symbol: symbolConfig.symbol,
    price: rawPrice / 10 ** decimals,
    percentChange:
      toNumberLike(data.f170) === null ? null : toNumberLike(data.f170) / 100,
    exchange: data.f58 || '',
    sourceTimestamp: '',
  };
}

function parseCnbcQuotePayload(payload, symbolConfig) {
  const pattern = /"quote":\{"data":\[(\{.*?\})\],"news":/s;
  const match = payload.match(pattern);
  if (!match) {
    throw new Error(`CNBC ${symbolConfig.label} 未返回有效数据`);
  }

  let data = null;
  try {
    data = JSON.parse(match[1]);
  } catch (error) {
    throw new Error(
      `CNBC ${symbolConfig.label} 返回了不可解析的行情对象：${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const price = parseLooseNumber(data?.last);
  const previousClose = parseLooseNumber(data?.previous_day_closing);

  if (price === null) {
    throw new Error(`CNBC ${symbolConfig.label} 没有返回有效价格`);
  }

  return {
    symbol: symbolConfig.symbol,
    price,
    percentChange:
      previousClose === null
        ? parseLooseNumber(data?.change_pct)
        : calculatePercentChange(price, previousClose),
    exchange: data?.exchange || '',
    sourceTimestamp: data?.last_time || data?.last_timedate || '',
  };
}

async function fetchCnbcQuote(symbolConfig) {
  const url = `${CNBC_QUOTE_PAGE_URL}${encodeURIComponent(symbolConfig.cnbcSymbol)}`;
  const payload = await fetchTextWithFallbacks(url);
  return parseCnbcQuotePayload(payload, symbolConfig);
}

function parseStooqQuotePayload(payload, symbolConfig) {
  const line = String(payload || '')
    .trim()
    .split(/\r?\n/u)
    .find(Boolean);

  if (!line) {
    throw new Error(`Stooq ${symbolConfig.label} 未返回有效数据`);
  }

  const [symbol, date, time, , , , close] = line
    .split(',')
    .map((item) => item.trim());

  if (!symbol || symbol.toLowerCase() === 'symbol') {
    throw new Error(`Stooq ${symbolConfig.label} 返回了无效内容`);
  }

  const price = parseLooseNumber(close);
  if (price === null) {
    throw new Error(`Stooq ${symbolConfig.label} 没有返回有效价格`);
  }

  const normalizedDate =
    date && date.length === 8
      ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      : '';
  const normalizedTime =
    time && time.length === 6
      ? `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`
      : '';

  return {
    symbol: symbolConfig.symbol,
    price,
    percentChange: null,
    exchange: 'STOOQ',
    sourceTimestamp: normalizeWhitespace(`${normalizedDate} ${normalizedTime}`),
  };
}

async function fetchStooqQuote(symbolConfig) {
  const url = new URL(STOOQ_QUOTE_URL);
  url.searchParams.set('s', symbolConfig.stooqSymbol);
  url.searchParams.set('i', 'd');

  const payload = await fetchTextWithFallbacks(url);
  return parseStooqQuotePayload(payload, symbolConfig);
}

function parseSinaQuotePayload(payload, sinaSymbol) {
  const pattern = new RegExp(
    `var\\s+hq_str_${escapeRegExp(sinaSymbol)}="([^"]*)"`,
    'i',
  );
  const match = payload.match(pattern);
  if (!match) {
    throw new Error(`新浪行情 ${sinaSymbol} 未返回有效数据`);
  }

  return match[1].split(',').map((item) => item.trim());
}

function calculatePercentChange(price, basePrice) {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(basePrice) ||
    basePrice === 0
  ) {
    return null;
  }

  return ((price - basePrice) / basePrice) * 100;
}

async function fetchSinaQuotePayload(sinaSymbol) {
  const url = `${SINA_QUOTE_URL}${encodeURIComponent(sinaSymbol)}`;
  const options = {
    headers: {
      Referer: 'https://finance.sina.com.cn',
    },
  };

  try {
    return await fetchText(url, options);
  } catch {
    return fetchTextWithCurl(url, options);
  }
}

function parseSinaCommodityQuote(values, symbolConfig) {
  const price = toNumberLike(values[0]);
  const previousClose = toNumberLike(values[7] || values[1]);

  if (price === null) {
    throw new Error(`新浪行情 ${symbolConfig.label} 没有返回有效价格`);
  }

  return {
    symbol: symbolConfig.symbol,
    price,
    percentChange: calculatePercentChange(price, previousClose),
    exchange: '',
    sourceTimestamp: normalizeWhitespace(
      `${values[12] || ''} ${values[6] || ''}`,
    ),
  };
}

function parseSinaUsdxQuote(values, symbolConfig) {
  const price = toNumberLike(values[1]);
  const previousClose = toNumberLike(values[3]);

  if (price === null) {
    throw new Error(`新浪行情 ${symbolConfig.label} 没有返回有效价格`);
  }

  return {
    symbol: symbolConfig.symbol,
    price,
    percentChange: calculatePercentChange(price, previousClose),
    exchange: '',
    sourceTimestamp: normalizeWhitespace(
      `${values[10] || ''} ${values[0] || ''}`,
    ),
  };
}

function parseSinaShIndexQuote(values, symbolConfig) {
  const price = toNumberLike(values[1]);

  if (price === null) {
    throw new Error(`新浪行情 ${symbolConfig.label} 没有返回有效价格`);
  }

  return {
    symbol: symbolConfig.symbol,
    price,
    percentChange: toNumberLike(values[3]),
    exchange: '',
    sourceTimestamp: '',
  };
}

function parseSinaGlobalIndexQuote(values, symbolConfig) {
  const price = toNumberLike(values[1]);

  if (price === null) {
    throw new Error(`新浪行情 ${symbolConfig.label} 没有返回有效价格`);
  }

  return {
    symbol: symbolConfig.symbol,
    price,
    percentChange: toNumberLike(values[2]),
    exchange: '',
    sourceTimestamp: normalizeWhitespace(values[3] || ''),
  };
}

export async function fetchSinaQuote(symbolConfig) {
  const payload = await fetchSinaQuotePayload(symbolConfig.sinaSymbol);
  const values = parseSinaQuotePayload(payload, symbolConfig.sinaSymbol);

  if (symbolConfig.sinaType === 'hf') {
    return parseSinaCommodityQuote(values, symbolConfig);
  }

  if (symbolConfig.sinaType === 'usdx') {
    return parseSinaUsdxQuote(values, symbolConfig);
  }

  if (symbolConfig.sinaType === 'sh-index') {
    return parseSinaShIndexQuote(values, symbolConfig);
  }

  if (symbolConfig.sinaType === 'global-index') {
    return parseSinaGlobalIndexQuote(values, symbolConfig);
  }

  throw new Error(`不支持的新浪行情类型：${symbolConfig.sinaType}`);
}

export async function fetchQuote(symbolConfig, config) {
  if (symbolConfig.provider === 'sina') {
    try {
      return await fetchSinaQuote(symbolConfig);
    } catch (error) {
      if (symbolConfig.secid) {
        return fetchEastmoneyQuote(symbolConfig);
      }

      throw error;
    }
  }

  if (symbolConfig.provider === 'cnbc') {
    try {
      return await fetchCnbcQuote(symbolConfig);
    } catch (error) {
      if (symbolConfig.stooqSymbol) {
        return fetchStooqQuote(symbolConfig);
      }

      throw error;
    }
  }

  if (symbolConfig.provider === 'eastmoney') {
    return fetchEastmoneyQuote(symbolConfig);
  }

  return fetchTwelveDataQuote(symbolConfig.symbol, config.twelveDataApiKey);
}

export async function collectQuotes(config, quoteFetcher = fetchQuote) {
  return Promise.all(
    config.symbols.map(async (symbolConfig) => {
      const quote = await quoteFetcher(symbolConfig, config);
      return {
        ...quote,
        label: symbolConfig.label,
        displayName: symbolConfig.displayName || symbolConfig.label,
        decimals: symbolConfig.decimals,
      };
    }),
  );
}

export async function collectNews(config, newsFetcher = fetchNewsSection) {
  const categories = ['tech-ai', 'finance'];

  return Promise.all(
    categories.map(async (category) => {
      try {
        return await newsFetcher(category, config);
      } catch (error) {
        return {
          category,
          title: NEWS_CATEGORY_CONFIG[category].title,
          items: [],
          error:
            error instanceof Error
              ? error.message
              : `抓取 ${category} 新闻失败`,
        };
      }
    }),
  );
}

function formatPriceSection(quotes, generatedAt, timeZone) {
  const lines = [
    '【行情定时播报】',
    `时间：${formatTimestamp(generatedAt, timeZone)}`,
  ];

  for (const quote of quotes) {
    lines.push(
      `${quote.displayName || quote.label}：${formatPrice(
        quote.price,
        quote.decimals ?? null,
      )}（${formatPercentChange(quote.percentChange)}）`,
    );
  }

  return lines.join('\n');
}

function formatNewsItemLine(item, index) {
  return `${index}. ${item.summary}`;
}

function splitNewsSection(section, maxLength) {
  const header = `【${section.title} Top ${section.items.length}】`;

  if (section.error) {
    return [`${header}\n新闻抓取失败：${section.error}`];
  }

  if (!section.items.length) {
    return [`${header}\n${section.emptyText || '暂无符合条件的新闻。'}`];
  }

  const chunks = [];
  let current = header;

  section.items.forEach((item, index) => {
    const block = formatNewsItemLine(item, index + 1);
    const separator = '\n';
    const next = `${current}${separator}${block}`;

    if (next.length > maxLength && current !== header) {
      chunks.push(current);
      current = `${header}\n${block}`;
      return;
    }

    current = next;
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function packMessageSections(sections, maxLength) {
  const messages = [];
  let current = '';

  for (const section of sections.filter(Boolean)) {
    if (!current) {
      current = section;
      continue;
    }

    const next = `${current}${MESSAGE_SECTION_SEPARATOR}${section}`;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    messages.push(current);
    current = section;
  }

  if (current) {
    messages.push(current);
  }

  return messages;
}

export function buildReportMessages(
  quotes,
  newsSections,
  generatedAt,
  timeZone,
  maxLength = DEFAULT_MESSAGE_MAX_LENGTH,
) {
  const sections = [formatPriceSection(quotes, generatedAt, timeZone)];

  for (const section of newsSections) {
    sections.push(...splitNewsSection(section, maxLength));
  }

  return packMessageSections(sections, maxLength);
}

export function formatReport(quotes, newsSections, generatedAt, timeZone) {
  return buildReportMessages(quotes, newsSections, generatedAt, timeZone).join(
    MESSAGE_SECTION_SEPARATOR,
  );
}

async function sendViaOneBotHttp(config, content, target) {
  const messageType = normalizeOneBotMessageType(
    target.messageType,
    'ONEBOT_MESSAGE_TYPE',
  );
  const endpoint =
    messageType === 'group' ? 'send_group_msg' : 'send_private_msg';
  const targetField = messageType === 'group' ? 'group_id' : 'user_id';
  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.onebotAccessToken) {
    headers.Authorization = `Bearer ${config.onebotAccessToken}`;
  }

  const payload = {
    [targetField]: target.targetId,
    message: content,
    auto_escape: false,
  };

  const response = await fetchJson(`${config.onebotHttpUrl}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (response?.status !== 'ok' || response?.retcode !== 0) {
    throw new Error(
      `OneBot 推送失败：${response?.wording || response?.msg || '未知错误'}`,
    );
  }

  return response;
}

async function callOneBotWebSocket(config, action, params) {
  const headers = {};
  if (config.onebotAccessToken) {
    headers.Authorization = `Bearer ${config.onebotAccessToken}`;
  }

  const echo = `stock-bot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return new Promise((resolve, reject) => {
    let settled = false;
    const ws = new WebSocket(config.onebotWsUrl, {
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
    const timeout = setTimeout(() => {
      finish(
        new Error(
          `OneBot WebSocket 请求超时：${action} (${config.onebotWsUrl})`,
        ),
      );
    }, DEFAULT_ONEBOT_WS_TIMEOUT_MS);

    function finish(error, value) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);

      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }

      if (error) {
        reject(error);
        return;
      }

      resolve(value);
    }

    ws.once('open', () => {
      ws.send(
        JSON.stringify({
          action,
          params,
          echo,
        }),
      );
    });

    ws.on('message', (rawMessage) => {
      let message = null;

      try {
        message = JSON.parse(rawMessage.toString());
      } catch {
        return;
      }

      if (message?.echo !== echo) {
        return;
      }

      if (message?.status !== 'ok' || message?.retcode !== 0) {
        finish(
          new Error(
            `OneBot 推送失败：${message?.wording || message?.msg || '未知错误'}`,
          ),
        );
        return;
      }

      finish(null, message);
    });

    ws.once('error', (error) => {
      finish(
        new Error(
          `OneBot WebSocket 连接失败：${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
    });

    ws.once('close', (code, reasonBuffer) => {
      if (settled) {
        return;
      }

      const reason = reasonBuffer?.toString() || '';
      finish(
        new Error(
          `OneBot WebSocket 连接已关闭 (${code})${reason ? `：${reason}` : ''}`,
        ),
      );
    });
  });
}

async function sendViaOneBotWebSocket(config, content, target) {
  const messageType = normalizeOneBotMessageType(
    target.messageType,
    'ONEBOT_MESSAGE_TYPE',
  );
  const action =
    messageType === 'group' ? 'send_group_msg' : 'send_private_msg';
  const targetField = messageType === 'group' ? 'group_id' : 'user_id';

  return callOneBotWebSocket(config, action, {
    [targetField]: target.targetId,
    message: content,
    auto_escape: false,
  });
}

async function sendViaOneBot(config, content, target) {
  if (config.onebotTransport === 'ws') {
    return sendViaOneBotWebSocket(config, content, target);
  }

  return sendViaOneBotHttp(config, content, target);
}

async function getQqOfficialAccessToken(config) {
  const response = await fetchJson(QQ_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appId: config.qqAppId,
      clientSecret: config.qqClientSecret,
    }),
  });

  const token = response?.access_token;
  if (!token) {
    throw new Error('QQ 官方机器人鉴权失败：未返回 access_token');
  }

  return {
    accessToken: token,
    expiresIn: Number(response?.expires_in || 0),
  };
}

function buildQqOfficialEndpoint(config) {
  const targetType = config.qqTargetType.trim().toLowerCase();

  if (targetType === 'group') {
    return `${config.qqApiBaseUrl}/v2/groups/${config.qqTargetId}/messages`;
  }

  if (targetType === 'user') {
    return `${config.qqApiBaseUrl}/v2/users/${config.qqTargetId}/messages`;
  }

  throw new Error(
    `QQ_BOT_TARGET_TYPE=${config.qqTargetType} 无效，仅支持 group 或 user`,
  );
}

async function sendViaQqOfficial(config, content) {
  const { accessToken } = await getQqOfficialAccessToken(config);
  const endpoint = buildQqOfficialEndpoint(config);

  return fetchJson(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `QQBot ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Union-Appid': config.qqAppId,
    },
    body: JSON.stringify({
      content,
      msg_type: 0,
    }),
  });
}

export async function pushMessages(config, messages) {
  if (config.dryRun) {
    return {
      dryRun: true,
      messages,
    };
  }

  const results = [];
  if (config.mode === 'onebot') {
    const targets =
      config.onebotTargets && config.onebotTargets.length > 0
        ? config.onebotTargets
        : [
            {
              messageType: config.onebotMessageType,
              targetId: config.onebotTargetId,
            },
          ];

    for (const target of targets) {
      for (const message of messages) {
        results.push({
          target,
          response: await sendViaOneBot(config, message, target),
        });
      }
    }

    return results;
  }

  for (const message of messages) {
    results.push(await sendViaQqOfficial(config, message));
  }

  return results;
}

export async function runMarketPush({
  env = process.env,
  args = process.argv.slice(2),
  quoteFetcher = fetchQuote,
  newsFetcher = fetchNewsSection,
  messagePusher = pushMessages,
  newsStateStore = null,
  generatedAt = new Date(),
} = {}) {
  const isDryRun = args.includes('--dry-run') || env.MARKET_BOT_DRY_RUN === '1';
  const config = readConfig(
    {
      ...env,
      MARKET_BOT_DRY_RUN: isDryRun ? '1' : '0',
    },
    {
      allowMissingTarget: isDryRun,
    },
  );
  const [quotes, rawNewsSections] = await Promise.all([
    collectQuotes(config, quoteFetcher),
    collectNews(config, newsFetcher),
  ]);
  const effectiveNewsStateStore =
    config.dailyNewsDedupEnabled && newsStateStore === null
      ? createDailyNewsStateStore(config)
      : newsStateStore;
  const currentNewsState =
    config.dailyNewsDedupEnabled && effectiveNewsStateStore?.read
      ? await effectiveNewsStateStore.read()
      : createEmptyDailyNewsState();
  const newsSections = config.dailyNewsDedupEnabled
    ? filterDailyDuplicateNews(
        rawNewsSections,
        currentNewsState,
        config,
        generatedAt,
      )
    : rawNewsSections;
  const messages = buildReportMessages(
    quotes,
    newsSections,
    generatedAt,
    config.timeZone,
    config.messageMaxLength,
  );
  const message = messages.join(MESSAGE_SECTION_SEPARATOR);
  const result = await messagePusher(config, messages);

  if (
    config.dailyNewsDedupEnabled &&
    !config.dryRun &&
    effectiveNewsStateStore?.write
  ) {
    const nextNewsState = mergeDailyNewsState(
      currentNewsState,
      newsSections,
      config,
      generatedAt,
    );
    await effectiveNewsStateStore.write(nextNewsState);
  }

  return {
    config,
    generatedAt,
    quotes,
    newsSections,
    messages,
    message,
    result,
  };
}

export async function runQqOfficialAuthCheck({ env = process.env } = {}) {
  const config = readConfig(env, {
    allowMissingTarget: true,
    allowMissingMarketDataKey: true,
  });

  if (config.mode !== 'qq-official') {
    throw new Error('鉴权检查仅支持 QQ 官方机器人模式');
  }

  const tokenData = await getQqOfficialAccessToken(config);
  return {
    config,
    expiresIn: tokenData.expiresIn,
  };
}

function printHelp() {
  console.log(`QQ 行情机器人

用法：
  node scripts/qq-market-bot.mjs
  node scripts/qq-market-bot.mjs --dry-run
  node scripts/qq-market-bot.mjs --check-auth

必填环境变量：
  TWELVE_DATA_API_KEY
  QQ_BOT_MODE=onebot | qq-official

OneBot 模式：
  ONEBOT_HTTP_URL 或 ONEBOT_WS_URL（二选一；同时存在时优先 HTTP）
  ONEBOT_MESSAGE_TYPE=group | private
  ONEBOT_TARGET_ID
  ONEBOT_EXTRA_TARGETS=group:群号,private:QQ号 (可选，可配置多个)
  ONEBOT_ACCESS_TOKEN (可选)
  MARKET_DAILY_NEWS_DEDUPE=1 | 0 (可选，默认开启)
  MARKET_NEWS_STATE_FILE=/abs/path/news-state.json (可选)

QQ 官方机器人模式：
  QQ_BOT_APP_ID
  QQ_BOT_CLIENT_SECRET
  QQ_BOT_TARGET_TYPE=group | user
  QQ_BOT_TARGET_ID
  QQ_BOT_API_BASE_URL (可选，默认 https://api.sgroup.qq.com)

可选环境变量：
  MARKET_BOT_TIMEZONE=Asia/Shanghai
  MARKET_BOT_DRY_RUN=1
  MARKET_TECH_AI_NEWS_LIMIT=10
  MARKET_TECH_NEWS_LIMIT=5
  MARKET_AI_NEWS_LIMIT=5
  MARKET_FINANCE_NEWS_LIMIT=10
  MARKET_NEWS_SUMMARY_MAX_LENGTH=48
  MARKET_MESSAGE_MAX_LENGTH=1600
  EASTMONEY_APIKEY (可选)
  EASTMONEY_SKILL_QUERY=最新财经快讯`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--check-auth')) {
    runQqOfficialAuthCheck()
      .then(({ expiresIn }) => {
        console.log(
          `QQ 官方机器人鉴权成功，access token 有效期约 ${expiresIn || '未知'} 秒。`,
        );
      })
      .catch((error) => {
        console.error(
          `鉴权失败：${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 1;
      });
  } else {
    runMarketPush({ args })
      .then(({ message, result, config, messages }) => {
        console.log(message);

        if (config.dryRun) {
          console.log('\n[dry-run] 已跳过实际推送。');
          return;
        }

        const outputCount = Array.isArray(result) ? result.length : 1;
        const output =
          Array.isArray(result) && result.length > 0
            ? result
                .map((item) => {
                  const payload = item?.response || item;
                  const messageId =
                    payload?.id || payload?.data?.message_id || 'ok';
                  const target =
                    item?.target?.messageType && item?.target?.targetId
                      ? `${item.target.messageType}:${item.target.targetId}`
                      : '';
                  return target ? `${target}#${messageId}` : messageId;
                })
                .join(', ')
            : 'ok';
        console.log(`\n推送完成：共 ${outputCount} 条消息 -> ${output}`);
        console.log(`拆分结果：${messages.length} 个消息分片。`);
      })
      .catch((error) => {
        console.error(
          `执行失败：${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 1;
      });
  }
}
