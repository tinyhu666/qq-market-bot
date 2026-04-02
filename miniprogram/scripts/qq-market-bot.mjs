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
const GEMINI_GENERATE_CONTENT_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/';
const DEEPSEEK_CHAT_COMPLETIONS_URL =
  'https://api.deepseek.com/chat/completions';
const SINA_QUOTE_URL = 'https://hq.sinajs.cn/list=';
const CNBC_QUOTE_PAGE_URL = 'https://www.cnbc.com/quotes/';
const STOOQ_QUOTE_URL = 'https://stooq.com/q/l/';
const YICAI_INFO_URL = 'https://www.yicai.com/news/info/';
const THIRTY_SIX_KR_NEWSFLASH_FEED_URL = 'https://36kr.com/feed-newsflash';
const OPENAI_NEWS_RSS_URL = 'https://openai.com/news/rss.xml';
const GOOGLE_AI_RSS_URL =
  'https://blog.google/innovation-and-ai/technology/ai/rss/';
const TECHCRUNCH_AI_RSS_URL =
  'https://techcrunch.com/tag/artificial-intelligence/feed/';
const VENTUREBEAT_AI_RSS_URL = 'https://venturebeat.com/category/ai/feed/';
const NVIDIA_BLOG_GENAI_RSS_URL =
  'https://blogs.nvidia.com/blog/category/generative-ai/feed/';
const NVIDIA_DEVELOPER_GENAI_ATOM_URL =
  'https://developer.nvidia.com/blog/category/generative-ai/feed/';
const QBITAI_RSS_URL = 'https://www.qbitai.com/feed';
const AIBASE_NEWS_URL = 'https://news.aibase.com/zh/news';
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
const DEFAULT_AI_NEWS_LLM_TIMEOUT_MS = 45000;
const DEFAULT_AI_NEWS_LLM_PRIMARY_PROVIDER = 'deepseek';
const DEFAULT_AI_NEWS_LLM_FALLBACK_PROVIDER = 'deepseek';
const DEFAULT_AI_NEWS_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_AI_NEWS_DEEPSEEK_MODEL = 'deepseek-chat';
const DEFAULT_TECH_AI_DOMESTIC_NEWS_LIMIT = 3;
const MESSAGE_SECTION_SEPARATOR = '\n----------------\n';
const NEWS_DUPLICATE_SIMILARITY_THRESHOLD = 0.88;
const TECH_AI_KEY_TERM_GENERIC_WORDS = new Set([
  'ai',
  'api',
  'llm',
  'gpu',
  'cpu',
  'sdk',
]);
const TECH_AI_KEY_TERM_EXACT_PHRASE_TAIL_WORDS = new Set([
  'api',
  'code',
  'sdk',
  'app',
  'apps',
  'model',
  'models',
  'agent',
  'agents',
  'assistant',
  'studio',
]);
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

const TECH_AI_NEWS_SOURCES = [
  {
    name: 'OpenAI News',
    url: OPENAI_NEWS_RSS_URL,
    format: 'rss',
    sourcePriority: 10,
    region: 'international',
  },
  {
    name: 'Google AI',
    url: GOOGLE_AI_RSS_URL,
    format: 'rss',
    sourcePriority: 9,
    region: 'international',
  },
  {
    name: 'NVIDIA Blog',
    url: NVIDIA_BLOG_GENAI_RSS_URL,
    format: 'rss',
    sourcePriority: 8,
    region: 'international',
  },
  {
    name: 'NVIDIA Technical Blog',
    url: NVIDIA_DEVELOPER_GENAI_ATOM_URL,
    format: 'atom',
    sourcePriority: 8,
    region: 'international',
  },
  {
    name: 'VentureBeat AI',
    url: VENTUREBEAT_AI_RSS_URL,
    format: 'rss',
    sourcePriority: 7,
    region: 'international',
  },
  {
    name: 'TechCrunch AI',
    url: TECHCRUNCH_AI_RSS_URL,
    format: 'rss',
    sourcePriority: 5,
    region: 'international',
  },
  {
    name: '量子位',
    url: QBITAI_RSS_URL,
    format: 'rss',
    sourcePriority: 7,
    region: 'domestic',
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
  hotKeywords: [
    '发布',
    '推出',
    '开源',
    '上线',
    '升级',
    '融资',
    '估值',
    '财报',
    '白皮书',
    '投资',
    '收购',
    '并购',
    '合作',
    '删除',
    '下架',
    '版权',
    '筹资',
    'ipo',
    '上市',
    '转型',
    '开放',
  ],
  softKeywords: [
    '趋势',
    '观察',
    '评论',
    '解读',
    '教程',
    '测评',
    '盘点',
    '为什么',
    '如何',
    '未来',
    '担忧',
    '访谈',
    '对话',
    '播客',
    '圆桌',
    '启示',
    '思考',
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
    '应届生',
    '实习生',
    '校招',
    '招聘',
    '招募',
    'ai种子',
  ],
};

const TECH_AI_NEWS_REGION_CONFIG = {
  domesticKeywords: [
    '中国',
    '国内',
    '国产',
    '本土',
    '百度',
    '阿里',
    '阿里云',
    '腾讯',
    '联想',
    '高德',
    '快手',
    '可灵',
    '字节',
    '字节跳动',
    '华为',
    '小米',
    '京东',
    '美团',
    '蚂蚁',
    '深度求索',
    'deepseek',
    '千问',
    'qwen',
    '通义',
    'kimi',
    '月之暗面',
    '智谱',
    'minimax',
    '百川',
    '阶跃星辰',
    '零一万物',
    '商汤',
    '优必选',
    '科大讯飞',
    '王者荣耀',
  ],
  domesticLocationKeywords: [
    '北京',
    '上海',
    '深圳',
    '杭州',
    '广州',
    '成都',
    '苏州',
    '香港',
  ],
  internationalKeywords: [
    'openai',
    'anthropic',
    'claude',
    'google',
    'deepmind',
    'meta',
    'microsoft',
    'copilot',
    'apple',
    'amazon',
    'aws',
    'nvidia',
    'cuda',
    'amd',
    'intel',
    'tesla',
    'xai',
    'grok',
    'mistral',
    'perplexity',
    'oracle',
    'ibm',
    'adobe',
    'venturebeat',
    'techcrunch',
    'midjourney',
    'openrouter',
    'y combinator',
    'yc',
    'github',
    'ios',
    'iphone',
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

function normalizeAiNewsLlmProvider(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (normalized !== 'gemini' && normalized !== 'deepseek') {
    throw new Error(
      `MARKET_AI_LLM_PROVIDER=${value} 无效，仅支持 gemini 或 deepseek`,
    );
  }

  return normalized;
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

function buildTechAiNewsCoverageMap(items) {
  const coverageMap = new Map();
  const clusters = [];

  for (const item of items) {
    const normalizedTitle = normalizeTechAiNewsTitle(
      item.title || item.summary || '',
    );
    if (!normalizedTitle) {
      continue;
    }

    let matchedCluster = null;
    for (const cluster of clusters) {
      if (
        cluster.titles.some((title) =>
          isLikelyDuplicateNewsText(normalizedTitle, title),
        )
      ) {
        matchedCluster = cluster;
        break;
      }
    }

    if (!matchedCluster) {
      matchedCluster = {
        titles: [],
        items: [],
        sources: new Set(),
      };
      clusters.push(matchedCluster);
    }

    matchedCluster.titles.push(normalizedTitle);
    matchedCluster.items.push(item);
    if (item.source) {
      matchedCluster.sources.add(
        normalizeWhitespace(String(item.source || '')).toLowerCase(),
      );
    }
  }

  for (const cluster of clusters) {
    const coverageCount = cluster.items.length;
    const sourceCount = Math.max(cluster.sources.size, 1);

    for (const item of cluster.items) {
      coverageMap.set(item, {
        coverageCount,
        sourceCount,
      });
    }
  }

  return coverageMap;
}

function normalizeTechAiNewsTitle(text) {
  return truncateMultiTopicTechHeadline(
    collapseRepeatedHeadline(
      normalizeWhitespace(
        normalizeTechAiProperNames(stripHtml(text))
          .replace(/[|｜].*$/u, '')
          .replace(/_[^_]{1,20}$/u, '')
          .replace(/[：:]\s*Google News$/iu, ''),
      ),
    ),
  );
}

function normalizeTechAiProperNames(text) {
  return String(text || '').replace(
    /([A-Z][A-Za-z0-9.+#-]{2,})\s*代码/gu,
    '$1 Code',
  );
}

function normalizeTechAiKeyTerm(text) {
  return normalizeWhitespace(
    normalizeTechAiProperNames(String(text || '')).replace(
      /[“”"'‘’（）()]/gu,
      ' ',
    ),
  ).toLowerCase();
}

function isGenericTechAiKeyTerm(text) {
  const normalized = normalizeTechAiKeyTerm(text);
  if (!normalized) {
    return true;
  }

  const words = normalized.split(/\s+/u).filter(Boolean);
  const lexicalWords = words.filter((word) => /[a-z]/u.test(word));
  if (lexicalWords.length === 0) {
    return true;
  }

  if (lexicalWords.every((word) => TECH_AI_KEY_TERM_GENERIC_WORDS.has(word))) {
    return true;
  }

  return lexicalWords.length === 1 && lexicalWords[0].length < 4;
}

function extractTechAiTitleKeyTerms(text) {
  const normalizedTitle = normalizeTechAiNewsTitle(text).replace(
    /[“”"'‘’]/gu,
    ' ',
  );
  const phraseMatches =
    normalizedTitle.match(
      /\b[A-Za-z][A-Za-z0-9]*(?:[.+#-][A-Za-z0-9]+)*(?:\s+(?:[A-Za-z][A-Za-z0-9]*(?:[.+#-][A-Za-z0-9]+)*|\d{1,2}(?:\.\d+)?)){1,2}\b/gu,
    ) || [];
  const singleMatches =
    normalizedTitle.match(
      /\b(?:[A-Za-z]*\d[A-Za-z0-9.+#-]*|[A-Z]{2,}[A-Za-z0-9.+#-]*|[A-Za-z]+[A-Z][A-Za-z0-9.+#-]*)\b/gu,
    ) || [];
  const seen = new Set();
  const keyTerms = [];

  for (const rawTerm of [...phraseMatches, ...singleMatches]) {
    const value = normalizeWhitespace(rawTerm).replace(
      /^[“”"'‘’]+|[“”"'‘’]+$/gu,
      '',
    );
    const normalized = normalizeTechAiKeyTerm(value);

    if (!normalized || seen.has(normalized) || isGenericTechAiKeyTerm(value)) {
      continue;
    }

    seen.add(normalized);
    const words = normalized.split(/\s+/u).filter(Boolean);
    const lexicalWords = words.filter(
      (word) =>
        /[a-z]/u.test(word) && !TECH_AI_KEY_TERM_GENERIC_WORDS.has(word),
    );

    keyTerms.push({
      value,
      normalized,
      lexicalWords,
      requireExact:
        words.length > 1 &&
        TECH_AI_KEY_TERM_EXACT_PHRASE_TAIL_WORDS.has(words[words.length - 1]),
    });
  }

  return keyTerms.sort((left, right) => right.value.length - left.value.length);
}

function isTechAiSummaryMissingKeyTerms(summary, title) {
  const keyTerms = extractTechAiTitleKeyTerms(title);
  if (keyTerms.length === 0) {
    return false;
  }

  const normalizedSummary = normalizeTechAiKeyTerm(summary);
  if (!normalizedSummary) {
    return true;
  }

  return keyTerms.some((term) => {
    if (term.requireExact) {
      return !normalizedSummary.includes(term.normalized);
    }

    return term.lexicalWords.some(
      (word) => word.length >= 2 && !normalizedSummary.includes(word),
    );
  });
}

function countTechAiPreservedKeyTerms(text, referenceText) {
  const keyTerms = extractTechAiTitleKeyTerms(referenceText);
  const normalizedText = normalizeTechAiKeyTerm(text);

  if (!normalizedText || keyTerms.length === 0) {
    return 0;
  }

  return keyTerms.reduce((count, term) => {
    const matched = term.requireExact
      ? normalizedText.includes(term.normalized)
      : term.lexicalWords.every((word) => normalizedText.includes(word));

    return matched ? count + 1 : count;
  }, 0);
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
  if (item?.fingerprint) {
    return normalizeNewsDuplicateText(item.fingerprint);
  }

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

function buildSummaryFingerprint(item, category) {
  const summaryText =
    category === 'finance'
      ? normalizeFinanceHeadline(item.summary || item.title || '')
      : normalizeTechAiNewsTitle(item.summary || item.title || '');
  return normalizeNewsDuplicateText(summaryText);
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
  const dayState = normalizedState.days[dateKey] || {};
  const globalSeenFingerprints = Object.values(dayState)
    .flatMap((items) => items || [])
    .filter(Boolean);

  return newsSections.map((section) => {
    const seenFingerprints = [...globalSeenFingerprints];
    const uniqueItems = [];

    for (const item of section.items || []) {
      const fingerprint = buildNewsFingerprint(item, section.category);
      if (shouldSkipNewsByFingerprint(fingerprint, seenFingerprints)) {
        continue;
      }

      uniqueItems.push(item);
      if (fingerprint) {
        seenFingerprints.push(fingerprint);
        globalSeenFingerprints.push(fingerprint);
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

export function dedupeNewsSectionsForMessage(newsSections) {
  const seenFingerprints = [];

  return newsSections.map((section) => {
    const uniqueItems = [];

    for (const item of section.items || []) {
      const itemFingerprints = [
        buildNewsFingerprint(item, section.category),
        buildSummaryFingerprint(item, section.category),
        normalizeNewsDuplicateText(
          normalizeWhitespace(item.title || item.summary || ''),
        ),
        normalizeNewsDuplicateText(
          normalizeWhitespace(item.summary || item.title || ''),
        ),
      ].filter(Boolean);

      if (
        itemFingerprints.some((fingerprint) =>
          shouldSkipNewsByFingerprint(fingerprint, seenFingerprints),
        )
      ) {
        continue;
      }

      uniqueItems.push(item);
      seenFingerprints.push(...itemFingerprints);
    }

    return {
      ...section,
      items: uniqueItems,
      emptyText:
        section.items?.length > 0 && uniqueItems.length === 0
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
      data?.message ||
      data?.msg ||
      data?.error?.message ||
      data?.error ||
      `HTTP ${response.status}`;
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

function isLowQualityTechAiSummaryLine(text) {
  if (isLowQualitySummaryLine(text)) {
    return true;
  }

  if (/[？?]/u.test(text)) {
    return true;
  }

  if (/[!！]/u.test(text)) {
    return true;
  }

  if (
    /(?:最贵重的门票|沉浸式观感|一图看懂|保姆级|手把手|避坑|神器|封神|爆款攻略)/u.test(
      text,
    )
  ) {
    return true;
  }

  if (/^解锁.*(?:观感|体验|玩法)/u.test(text)) {
    return true;
  }

  if (/^强调/u.test(text)) {
    return true;
  }

  if (
    /(?:走了，.+来了|暴增\d+%|靠[「“"][^」”]{1,12}[」”]|都能搞|真正自主支付的钱包)/u.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /(?:唠嗑|vibe coding|这场闹剧|之所以能产生广泛影响|双重挑战)/iu.test(text)
  ) {
    return true;
  }

  if (/^(?:旨在|面向)/u.test(text)) {
    return true;
  }

  if (/^(?:本财年|下一阶段)/u.test(text)) {
    return true;
  }

  if (/^(?:利用|通过|采用|借助)/u.test(text)) {
    return true;
  }

  if (/从[“"][^”"]+[”"]迈向[“"][^”"]+[”"]/u.test(text)) {
    return true;
  }

  if (
    /(?:ai下一阶段|下一阶段发展进程|确立在[^，。]{0,20}领先地位)/iu.test(text)
  ) {
    return true;
  }

  if (
    /(?:会员可享|灵感值|[89]折优惠|平台还延长了|优惠计划|限时[0-9一二三四五六七八九]折|折起|会员模型)/u.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /(?:反封号|封号工具|意外揭示|很能说|很能干|主打|校招|应届生|实习生|ai种子)/iu.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /(?:银行普惠\s*ai\s*时代|未来所有产品、服务及流程都将以人工智能为核心重构|被视为混合式ai的实战年)/iu.test(
      text,
    )
  ) {
    return true;
  }

  if (/(?:专属客户经理体验|毫秒级响应优化传统银行流程)/u.test(text)) {
    return true;
  }

  if (
    /(?:实测拿\d+项sota|撸代码|源码泄露案反转|竟是[“"]?钓鱼|大佬)/iu.test(text)
  ) {
    return true;
  }

  return false;
}

function isLowQualityTechAiOutputItem(item) {
  const title = normalizeTechAiNewsTitle(item.title || item.summary || '');
  const summary = normalizeWhitespace(item.summary || item.title || '');

  return (
    isExcludedTechAiNewsItem({
      ...item,
      title,
      summary,
    }) ||
    (isLowQualityTechAiSummaryLine(summary) &&
      isLowQualityTechAiSummaryLine(title))
  );
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

function extractXmlTagAttribute(xml, tagName, attributeName) {
  const pattern = new RegExp(
    `<${tagName}(?:\\s[^>]*)?\\s${attributeName}=(?:"([^"]*)"|'([^']*)')[^>]*>`,
    'i',
  );
  const match = xml.match(pattern);
  if (!match) {
    return '';
  }

  return decodeHtmlEntities((match[1] || match[2] || '').trim());
}

function parseXmlEntries(xml, entryTagName) {
  const items = [];
  const pattern = new RegExp(
    `<${entryTagName}\\b[\\s\\S]*?</${entryTagName}>`,
    'gi',
  );
  let match = pattern.exec(xml);

  while (match) {
    items.push(match[0]);
    match = pattern.exec(xml);
  }

  return items;
}

function normalizeFeedSummary(summarySource, fallbackTitle) {
  const normalizedSummary = normalizeWhitespace(
    decodeHtmlEntities(stripHtml(summarySource || '')),
  );

  return normalizedSummary || fallbackTitle;
}

function stripTechAiSummaryNoise(text) {
  return normalizeWhitespace(
    normalizeTechAiProperNames(stripHtml(text || ''))
      .replace(/^AI 从[“"][^”"]+[”"]迈向[“"][^”"]+[”"]，[，\s]*/u, '')
      .replace(/^具身智能新突破[:：]\s*/u, '')
      .replace(/^重磅[:：]\s*/u, '')
      .replace(/^最新[:：]\s*/u, ''),
  );
}

function buildFeedItemMetadata(item, sourceName, sourcePriority, region) {
  return {
    source:
      sourceName ||
      decodeHtmlEntities(stripHtml(extractXmlTagValue(item, 'source'))),
    sourcePriority,
    region: region || '',
  };
}

function parseRssFeedItems(
  xml,
  sourceName = '',
  sourcePriority = 0,
  region = '',
) {
  return parseXmlEntries(xml, 'item')
    .map((itemXml) => {
      const title = decodeHtmlEntities(
        stripHtml(extractXmlTagValue(itemXml, 'title')),
      );
      const metadata = buildFeedItemMetadata(
        itemXml,
        sourceName,
        sourcePriority,
        region,
      );
      const publishedAtText =
        extractXmlTagValue(itemXml, 'pubDate') ||
        extractXmlTagValue(itemXml, 'dc:date');
      const publishedAt = publishedAtText ? new Date(publishedAtText) : null;
      const cleanedTitle = normalizeTechAiNewsTitle(
        metadata.source && title.endsWith(` - ${metadata.source}`)
          ? title.slice(0, -`${metadata.source}`.length - 3)
          : title,
      );
      const summary = normalizeFeedSummary(
        extractXmlTagValue(itemXml, 'description') ||
          extractXmlTagValue(itemXml, 'content:encoded'),
        cleanedTitle,
      );

      return {
        title: cleanedTitle,
        summary,
        source: metadata.source,
        publishedAt,
        llmSummary: summary,
        sourcePriority: metadata.sourcePriority,
        region: metadata.region,
      };
    })
    .filter((item) => item.title);
}

function parseGenericRssHeadlineItems(xml, sourceName = '') {
  return parseXmlEntries(xml, 'item')
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

function parseAtomFeedItems(
  xml,
  sourceName = '',
  sourcePriority = 0,
  region = '',
) {
  return parseXmlEntries(xml, 'entry')
    .map((entryXml) => {
      const title = normalizeTechAiNewsTitle(
        decodeHtmlEntities(stripHtml(extractXmlTagValue(entryXml, 'title'))),
      );
      const summary = normalizeFeedSummary(
        extractXmlTagValue(entryXml, 'summary') ||
          extractXmlTagValue(entryXml, 'content'),
        title,
      );
      const publishedAtText =
        extractXmlTagValue(entryXml, 'published') ||
        extractXmlTagValue(entryXml, 'updated');

      return {
        title,
        summary,
        source: sourceName,
        publishedAt: publishedAtText ? new Date(publishedAtText) : null,
        link: extractXmlTagAttribute(entryXml, 'link', 'href'),
        llmSummary: summary,
        sourcePriority,
        region: region || '',
      };
    })
    .filter((item) => item.title);
}

function parseAibaseRelativePublishedAt(text, now = new Date()) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return null;
  }

  if (/^(?:刚刚|刚才)$/u.test(normalized)) {
    return new Date(now.valueOf());
  }

  const minuteMatch = normalized.match(/(\d+)\s*分(?:钟)?前/u);
  if (minuteMatch) {
    return new Date(now.valueOf() - Number(minuteMatch[1]) * 60 * 1000);
  }

  const hourMatch = normalized.match(/(\d+)\s*小时前/u);
  if (hourMatch) {
    return new Date(now.valueOf() - Number(hourMatch[1]) * 60 * 60 * 1000);
  }

  const dayMatch = normalized.match(/(\d+)\s*天前/u);
  if (dayMatch) {
    return new Date(now.valueOf() - Number(dayMatch[1]) * 24 * 60 * 60 * 1000);
  }

  const absoluteMatch = normalized.match(
    /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})(?:日|号)?(?:\s+(\d{1,2}):(\d{2}))?/u,
  );
  if (!absoluteMatch) {
    return null;
  }

  const [, year, month, day, hour = '0', minute = '0'] = absoluteMatch;
  return new Date(
    `${year}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0',
    )}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00+08:00`,
  );
}

export function parseAibaseNewsItems(
  html,
  {
    sourceName = 'AIBase',
    sourcePriority = 0,
    region = 'domestic',
    now = new Date(),
  } = {},
) {
  const items = [];
  const pattern = /<a href="(\/zh\/news\/\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match = pattern.exec(html);

  while (match) {
    const cardHtml = match[2] || '';
    const titleMatch = cardHtml.match(
      /<div class="[^"]*font600[^"]*">([\s\S]*?)<\/div>/i,
    );
    const summaryMatch = cardHtml.match(
      /<div class="[^"]*truncate2[^"]*mt-\[6px\][^"]*">([\s\S]*?)<\/div>/i,
    );
    const publishedAtMatch = cardHtml.match(
      /icon-rili[^>]*><\/i>\s*([^<]+)\s*<\/div>/i,
    );

    const title = normalizeTechAiNewsTitle(
      decodeHtmlEntities(stripHtml(titleMatch?.[1] || '')),
    );
    const summary = normalizeFeedSummary(summaryMatch?.[1] || '', title);

    if (title) {
      items.push({
        title,
        summary,
        source: sourceName,
        publishedAt: parseAibaseRelativePublishedAt(
          publishedAtMatch?.[1] || '',
          now,
        ),
        link: `https://news.aibase.com${match[1]}`,
        llmSummary: summary,
        sourcePriority,
        region,
      });
    }

    match = pattern.exec(html);
  }

  return items;
}

export function parseTechAiSourceItems(payload, source, now = new Date()) {
  switch (source.format) {
    case 'atom':
      return parseAtomFeedItems(
        payload,
        source.name,
        source.sourcePriority,
        source.region,
      );
    case 'aibase-html':
      return parseAibaseNewsItems(payload, {
        sourceName: source.name,
        sourcePriority: source.sourcePriority,
        region: source.region,
        now,
      });
    case 'rss':
    default:
      return parseRssFeedItems(
        payload,
        source.name,
        source.sourcePriority,
        source.region,
      );
  }
}

function buildTechAiNewsItem(item, maxLength) {
  const cleanedTitle = normalizeTechAiNewsTitle(
    item.title || item.summary || '',
  );
  const rawSourceSummary = normalizeFeedSummary(
    item.llmSummary || item.summary || '',
    cleanedTitle,
  );
  const summaryReference = [cleanedTitle, rawSourceSummary]
    .filter(Boolean)
    .join(' ');
  const summary = normalizeSummaryLine(
    stripTechAiSummaryNoise(item.summary || item.title),
    maxLength,
  );
  const titleFallbackSummary = normalizeSummaryLine(cleanedTitle, maxLength);
  const rawFallbackSummary = normalizeSummaryLine(
    stripTechAiSummaryNoise(rawSourceSummary),
    maxLength,
  );
  const leadingRawFallbackSummary = truncateText(
    appendFullStop(stripTechAiSummaryNoise(rawSourceSummary)),
    maxLength,
  );
  const fallbackSummary =
    [titleFallbackSummary, rawFallbackSummary, leadingRawFallbackSummary]
      .filter(Boolean)
      .filter((candidate) => !isLowQualityTechAiSummaryLine(candidate))
      .map((candidate) => ({
        candidate,
        score:
          countTechAiPreservedKeyTerms(candidate, summaryReference) * 40 +
          scoreSummaryCandidate(candidate, maxLength) +
          (candidate === titleFallbackSummary ? 2 : 0),
      }))
      .sort((left, right) => right.score - left.score)[0]?.candidate ||
    titleFallbackSummary ||
    rawFallbackSummary ||
    '';

  return {
    title: cleanedTitle || item.title,
    summary:
      summary &&
      !isLowQualityTechAiSummaryLine(summary) &&
      !isTechAiSummaryMissingKeyTerms(summary, summaryReference)
        ? summary
        : fallbackSummary,
    source: item.source || '',
    publishedAt: item.publishedAt,
    fingerprint: item.fingerprint || '',
    region: item.region || classifyTechAiNewsRegion(item),
    llmSummary: rawSourceSummary,
    sourcePriority: item.sourcePriority || 0,
    heatScore: Number.isFinite(item.heatScore) ? item.heatScore : 0,
    coverageCount: item.coverageCount || 1,
    sourceCount: item.sourceCount || 1,
    llmRank: Number.isFinite(item.llmRank) ? item.llmRank : null,
  };
}

export function classifyTechAiNewsRegion(item) {
  const haystack = normalizeWhitespace(
    `${item?.title || ''} ${item?.summary || ''} ${item?.source || ''}`,
  ).toLowerCase();
  const domesticHits =
    countMatchedKeywords(
      haystack,
      TECH_AI_NEWS_REGION_CONFIG.domesticKeywords,
    ) +
    countMatchedKeywords(
      haystack,
      TECH_AI_NEWS_REGION_CONFIG.domesticLocationKeywords,
    );
  const internationalHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_REGION_CONFIG.internationalKeywords,
  );

  if (domesticHits > internationalHits && domesticHits > 0) {
    return 'domestic';
  }

  if (internationalHits > domesticHits && internationalHits > 0) {
    return 'international';
  }

  if (/(中国|国内|国产|本土)/u.test(haystack)) {
    return 'domestic';
  }

  return 'international';
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

function getPublishedAtValue(date) {
  return date instanceof Date && !Number.isNaN(date.valueOf())
    ? date.valueOf()
    : 0;
}

function compareTechAiNewsItemsByHeat(left, right) {
  const leftHeatScore = Number.isFinite(left?.heatScore) ? left.heatScore : 0;
  const rightHeatScore = Number.isFinite(right?.heatScore)
    ? right.heatScore
    : 0;
  const leftHasLlmRank = Number.isFinite(left?.llmRank);
  const rightHasLlmRank = Number.isFinite(right?.llmRank);

  if (leftHasLlmRank || rightHasLlmRank) {
    const leftLlmRank = leftHasLlmRank ? left.llmRank : Number.MAX_SAFE_INTEGER;
    const rightLlmRank = rightHasLlmRank
      ? right.llmRank
      : Number.MAX_SAFE_INTEGER;

    return (
      leftLlmRank - rightLlmRank ||
      rightHeatScore - leftHeatScore ||
      (right.sourcePriority || 0) - (left.sourcePriority || 0) ||
      getPublishedAtValue(right?.publishedAt) -
        getPublishedAtValue(left?.publishedAt)
    );
  }

  return (
    rightHeatScore - leftHeatScore ||
    (right.sourcePriority || 0) - (left.sourcePriority || 0) ||
    getPublishedAtValue(right?.publishedAt) -
      getPublishedAtValue(left?.publishedAt)
  );
}

function isExcludedTechAiNewsItem(item) {
  const title = normalizeWhitespace(item.title || '');
  const haystack = `${title} ${item.source || ''}`.toLowerCase();

  if (
    /^(?:甚至|毕竟|另外|同时|目前|对此|其中|而且|但是|“面对|到20\d{2}年底)/u.test(
      title,
    )
  ) {
    return true;
  }

  if (/[？?]/u.test(title)) {
    return true;
  }

  if (
    /(?:最贵重的门票|沉浸式观感|一图看懂|保姆级|手把手|爆款攻略)/u.test(title)
  ) {
    return true;
  }

  if (
    /(?:会员可享|灵感值|[89]折优惠|平台还延长了|优惠计划|限时[0-9一二三四五六七八九]折|折起|会员模型)/u.test(
      title,
    )
  ) {
    return true;
  }

  if (/《[^》]+》|短片|监制|联合发起|双榜|镜像/u.test(title)) {
    return true;
  }

  if (/来了[！!？?]?$/u.test(title)) {
    return true;
  }

  if (
    /(?:实测拿\d+项sota|撸代码|源码泄露案反转|竟是[“"]?钓鱼|大佬)/iu.test(title)
  ) {
    return true;
  }

  if (/(?:校招|应届生|实习生|ai种子|招聘|招募|种子计划)/iu.test(title)) {
    return true;
  }

  if (
    (item.sourcePriority || 0) <= 7 &&
    /(?:终于|来了[！!？?]?$|最贵重的门票|接近[“"]?不可用[”"]?|一句[「“"]|避坑|惊现|豪赌|神坛|火爆|打响)/u.test(
      title,
    )
  ) {
    return true;
  }

  if (
    (item.sourcePriority || 0) <= 4 &&
    /(?:镜像站|技能库|再无延迟|clawhub|clawdbot|openclaw|迷你主机|圆柱形设计|体积0\.65l|后门)/iu.test(
      `${title} ${item.summary || ''}`,
    )
  ) {
    return true;
  }

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

function scoreTechAiNewsItem(item, now = new Date()) {
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
  const hotKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.hotKeywords,
  );
  const softKeywordHits = countMatchedKeywords(
    haystack,
    TECH_AI_NEWS_FILTER_CONFIG.softKeywords,
  );
  const publishedAtValue = getPublishedAtValue(item.publishedAt);
  const ageHours =
    publishedAtValue > 0
      ? Math.max(0, (now.valueOf() - publishedAtValue) / (60 * 60 * 1000))
      : NEWS_LOOKBACK_HOURS;
  const recencyBoost =
    Math.max(0, NEWS_LOOKBACK_HOURS - Math.min(ageHours, NEWS_LOOKBACK_HOURS)) *
    1.2;
  const coverageBoost = Math.max((item.coverageCount || 1) - 1, 0) * 5;
  const sourceCoverageBoost = Math.max((item.sourceCount || 1) - 1, 0) * 6;
  const officialSourceBoost =
    (item.sourcePriority || 0) >= 9
      ? 10
      : (item.sourcePriority || 0) >= 8
        ? 6
        : 0;
  const actionBoost =
    /(?:发布|推出|开源|升级|上线|融资|收购|并购|合作|删除|下架|转型|财报|筹资|估值|白皮书)/u.test(
      haystack,
    )
      ? 6
      : 0;
  const softPenalty = softKeywordHits * 5;

  return (
    coreKeywordHits * 5 +
    infraKeywordHits * 3 +
    entityKeywordHits * 2 +
    hotKeywordHits * 3 +
    (item.sourcePriority || 0) * 4 +
    officialSourceBoost +
    coverageBoost +
    sourceCoverageBoost +
    recencyBoost +
    actionBoost -
    softPenalty
  );
}

export function selectTechAiNewsItems(
  items,
  config,
  now = new Date(),
  limit = config.techAiNewsLimit,
) {
  const coverageMap = buildTechAiNewsCoverageMap(items);
  const candidates = items
    .filter((item) =>
      isWithinLookbackWindow(item.publishedAt, NEWS_LOOKBACK_HOURS, now),
    )
    .map((item) => {
      const coverage = coverageMap.get(item) || {
        coverageCount: 1,
        sourceCount: 1,
      };
      const rankedItem = {
        ...item,
        coverageCount: coverage.coverageCount,
        sourceCount: coverage.sourceCount,
      };

      return {
        item: rankedItem,
        excluded: isExcludedTechAiNewsItem(rankedItem),
        relevant: isRelevantTechAiNewsItem(rankedItem),
        score: scoreTechAiNewsItem(rankedItem, now),
        publishedAt: getPublishedAtValue(rankedItem.publishedAt),
      };
    })
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

  return [...preferred, ...fallback].slice(0, limit).map((entry) =>
    buildTechAiNewsItem(
      {
        ...entry.item,
        heatScore: entry.score,
      },
      config.newsSummaryMaxLength,
    ),
  );
}

function getDailySeenFingerprints(
  state,
  category,
  config,
  generatedAt,
  { includeAllCategories = false } = {},
) {
  const normalizedState = normalizeDailyNewsState(state);
  const dateKey = formatDateKey(generatedAt, config.timeZone);
  const dayState = normalizedState.days[dateKey] || {};

  if (includeAllCategories) {
    return Object.values(dayState)
      .flatMap((items) => items || [])
      .filter(Boolean);
  }

  return [...(dayState[category] || [])];
}

function filterPreviouslySentNewsItems(
  items,
  category,
  state,
  config,
  generatedAt = new Date(),
  options = {},
) {
  const seenFingerprints = getDailySeenFingerprints(
    state,
    category,
    config,
    generatedAt,
    options,
  );

  if (seenFingerprints.length === 0) {
    return {
      items,
      filteredCount: 0,
    };
  }

  const unseenItems = [];
  let filteredCount = 0;

  for (const item of items) {
    const fingerprint = buildNewsFingerprint(item, category);
    if (shouldSkipNewsByFingerprint(fingerprint, seenFingerprints)) {
      filteredCount += 1;
      continue;
    }

    unseenItems.push({
      ...item,
      fingerprint: item.fingerprint || fingerprint,
    });
  }

  return {
    items: unseenItems,
    filteredCount,
  };
}

function filterNewsItemsByFingerprints(items, category, seenFingerprints) {
  if (!Array.isArray(seenFingerprints) || seenFingerprints.length === 0) {
    return {
      items,
      filteredCount: 0,
    };
  }

  const filteredItems = [];
  let filteredCount = 0;

  for (const item of items) {
    const fingerprint = buildNewsFingerprint(item, category);
    if (shouldSkipNewsByFingerprint(fingerprint, seenFingerprints)) {
      filteredCount += 1;
      continue;
    }

    filteredItems.push({
      ...item,
      fingerprint: item.fingerprint || fingerprint,
    });
  }

  return {
    items: filteredItems,
    filteredCount,
  };
}

function buildAiNewsLlmCandidateList(items) {
  return items.map((item, index) => ({
    candidateId: `c${String(index + 1).padStart(2, '0')}`,
    item: {
      ...item,
      heatScore: Number.isFinite(item.heatScore) ? item.heatScore : 0,
      coverageCount: item.coverageCount || 1,
      sourceCount: item.sourceCount || 1,
    },
    region: item.region || classifyTechAiNewsRegion(item),
  }));
}

function formatNewsLlmCandidateLine(candidateId, item) {
  const publishedAt =
    item.publishedAt instanceof Date &&
    !Number.isNaN(item.publishedAt.valueOf())
      ? item.publishedAt.toISOString()
      : '';

  return [
    `${candidateId}`,
    item.source || '未知来源',
    publishedAt || '未知时间',
    item.title || item.summary || '',
    item.llmSummary || item.summary || item.title || '',
  ].join(' | ');
}

function formatAiNewsLlmCandidateLine(candidateId, item) {
  const publishedAt =
    item.publishedAt instanceof Date &&
    !Number.isNaN(item.publishedAt.valueOf())
      ? item.publishedAt.toISOString()
      : '';
  const region =
    (item.region || classifyTechAiNewsRegion(item)) === 'domestic'
      ? '国内'
      : '国际';
  const heatScore = Number.isFinite(item.heatScore)
    ? Math.round(item.heatScore)
    : 0;
  const sourceCount = Math.max(item.sourceCount || item.coverageCount || 1, 1);

  return [
    `${candidateId}`,
    region,
    `热度${heatScore}`,
    `覆盖${sourceCount}源`,
    item.source || '未知来源',
    publishedAt || '未知时间',
    item.title || item.summary || '',
  ].join(' | ');
}

function buildAiNewsLlmPrompt(candidates, config) {
  const domesticTarget = Math.min(
    DEFAULT_TECH_AI_DOMESTIC_NEWS_LIMIT,
    config.techAiNewsLimit,
  );
  const internationalTarget = Math.max(
    config.techAiNewsLimit - domesticTarget,
    0,
  );
  const orderedCandidates = [...candidates].sort((left, right) =>
    compareTechAiNewsItemsByHeat(left.item, right.item),
  );

  return [
    `你是一名中文科技媒体总编，请直接总结过去24小时最热的 AI 行业 Top ${config.techAiNewsLimit}。`,
    `如果候选数量足够，最终榜单请保持 ${internationalTarget} 条国际新闻和 ${domesticTarget} 条国内新闻。`,
    '最终结果必须是一个统一热度榜，按热度从高到低排列，不能先把国际或国内新闻分段输出。',
    '只允许根据候选列表挑选，不能编造新事实，不能引入列表外事件。',
    '候选列表已经按初始热度从高到低排序，并附带热度分、覆盖源数、发布时间和来源，请优先依据这些信息判断过去24小时的热度。',
    '热度判断优先看事件影响面，再看多源覆盖/传播范围、来源权威度和发布时间新鲜度。',
    '优先选择与大模型、智能体、推理、芯片、算力、AI 基础设施、重要产品发布、企业 AI 战略、重大融资并购、监管和平台能力变化相关的内容。',
    '排除纯活动预告、泛营销、弱相关消费电子、校园/政务/直播类噪音内容，也不要选择趋势评论、访谈、观点解读、教程测评或社会泛讨论。',
    '如果候选更像招聘、校招、实习生、种子计划、教程、测评、八卦、反转或社区口水仗，请不要选择。',
    '输出必须是硬新闻快讯口吻，每句都要有明确主体（公司、机构、模型、产品或平台），不要写成评论、宣传、测评感受或行业感想。',
    '请为每条输出一句中文总结，要求：完整、客观、18-36 个汉字优先、不带链接/来源/序号/引号。',
    '如果候选标题或摘要是英文，输出时必须改写成自然中文。',
    '主要根据候选标题判断事件，如果标题已经完整，不要被媒体改写摘要带偏。',
    '必须保留标题里的关键仓库名、产品名、模型名、项目名和版本号，不能把事件改写成只有模糊主体的概述。',
    '禁止直接照抄候选原文长句，禁止输出半句，禁止以“甚至/毕竟/另外/同时/目前/对此/旨在/面向”等承接词开头。',
    '禁止使用惊叹号、口语化表达、招聘话术、营销词、夸张修辞，以及“很能说/很能干/主打/意外揭示/反转”等评论或宣传腔。',
    '如果某条候选无法写成主体明确的硬新闻短句，就不要返回该候选。',
    '必须严格输出 JSON，对象格式为 {"items":[{"candidateId":"c01","summary":"..."}]}，items 数组顺序就是最终热度排名。',
    '候选列表：',
    ...(orderedCandidates.length > 0
      ? orderedCandidates.map((candidate) =>
          formatAiNewsLlmCandidateLine(candidate.candidateId, candidate.item),
        )
      : ['无']),
  ].join('\n');
}

function buildFinanceNewsLlmPrompt(candidates) {
  return [
    `你是一名中文财经编辑，请基于候选列表输出最多 ${candidates.length} 条市场快讯总结。`,
    '数据源仍然以候选列表为准，不能编造列表外事实，不能更改事件方向。',
    '请保留价格、指数、财报、公司、政策、成交额等核心信息，去掉公告腔、标题党和冗余修饰。',
    '每条输出一句中文总结，要求：完整、客观、18-36 个汉字优先，不带链接、来源、序号或“快讯/报道称”。',
    '如果两条候选明显是同一事件或同一资产的重复波动，只保留信息更完整的一条，并优先保留主题更分散的结果。',
    '如果候选高度重复，可以少于上限返回，不要为了凑满条数重复表达同一件事。',
    '必须严格输出 JSON，对象格式为 {"items":[{"candidateId":"c01","summary":"..."}]}。',
    '候选列表：',
    ...candidates.map(({ candidateId, item }) =>
      formatNewsLlmCandidateLine(candidateId, item),
    ),
  ].join('\n');
}

function parseJsonTextResponse(rawText, providerLabel) {
  const text = String(rawText || '').trim();
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/iu);
  const normalized = (fencedMatch ? fencedMatch[1] : text).trim();

  try {
    return JSON.parse(normalized);
  } catch (error) {
    throw new Error(
      `${providerLabel} 返回了不可解析的 JSON：${normalized.slice(0, 200)}`,
    );
  }
}

function normalizeNewsLlmSelectedItem(
  rawItem,
  candidateEntry,
  config,
  category,
  builder,
) {
  const generatedSummary = normalizeSummaryLine(
    normalizeWhitespace(stripHtml(String(rawItem?.summary || ''))),
    config.newsSummaryMaxLength,
  );
  const fingerprint = buildNewsFingerprint(candidateEntry.item, category);

  return {
    candidateId: candidateEntry.candidateId,
    region: candidateEntry.region || '',
    item: builder(
      {
        ...candidateEntry.item,
        summary:
          generatedSummary ||
          candidateEntry.item.summary ||
          candidateEntry.item.title ||
          '',
        fingerprint,
        region: candidateEntry.region || candidateEntry.item.region || '',
        preferGeneratedSummary: true,
      },
      config.newsSummaryMaxLength,
    ),
  };
}

function normalizeFinanceNewsItem(item, maxLength) {
  const financeMaxLength = Math.max(maxLength, 68);
  const cleanedTitle = normalizeFinanceHeadline(
    item.title || item.summary || '',
  );
  const cleanedSummary = normalizeSummaryLine(
    stripFinanceNoise(item.summary || item.title || ''),
    financeMaxLength,
  );
  const fallbackSummary = normalizeSummaryLine(
    stripFinanceNoise(cleanedTitle || item.summary || ''),
    financeMaxLength,
  );

  return {
    title: cleanedTitle || item.title || '',
    summary:
      item.preferGeneratedSummary &&
      !isLowQualityFinanceSummaryLine(cleanedSummary)
        ? cleanedSummary
        : chooseFinanceSummary(
            cleanedSummary,
            fallbackSummary,
            item.source || '',
          ),
    source: item.source || '',
    publishedAt: item.publishedAt instanceof Date ? item.publishedAt : null,
    fingerprint: item.fingerprint || '',
  };
}

function normalizeAiNewsLlmItems(payload, candidates, config) {
  const candidateMap = new Map(
    candidates.map((entry) => [entry.candidateId, entry]),
  );
  const domesticTarget = Math.min(
    DEFAULT_TECH_AI_DOMESTIC_NEWS_LIMIT,
    config.techAiNewsLimit,
  );
  const internationalTarget = Math.max(
    config.techAiNewsLimit - domesticTarget,
    0,
  );
  const remainingTargetByRegion = {
    international: internationalTarget,
    domestic: domesticTarget,
  };
  const selectedEntries = [];
  const seenCandidateIds = new Set();
  const seenFingerprints = [];
  const orderedPayloadItems = Array.isArray(payload?.items)
    ? payload.items
    : [
        ...(payload?.internationalItems || []),
        ...(payload?.domesticItems || []),
      ].sort((left, right) => {
        const leftCandidate = candidateMap.get(
          String(left?.candidateId || '').trim(),
        );
        const rightCandidate = candidateMap.get(
          String(right?.candidateId || '').trim(),
        );

        return compareTechAiNewsItemsByHeat(
          leftCandidate?.item || {},
          rightCandidate?.item || {},
        );
      });

  function pushSelectedEntry(candidateEntry, rawItem = null, llmRank = null) {
    const region =
      candidateEntry.region === 'domestic' ? 'domestic' : 'international';
    const normalizedEntry = rawItem
      ? normalizeNewsLlmSelectedItem(
          rawItem,
          candidateEntry,
          config,
          'tech-ai',
          buildTechAiNewsItem,
        )
      : {
          candidateId: candidateEntry.candidateId,
          region,
          item: buildTechAiNewsItem(
            {
              ...candidateEntry.item,
              fingerprint: buildNewsFingerprint(candidateEntry.item, 'tech-ai'),
              region,
            },
            config.newsSummaryMaxLength,
          ),
        };

    normalizedEntry.item = {
      ...normalizedEntry.item,
      region,
      llmRank,
    };

    if (isLowQualityTechAiOutputItem(normalizedEntry.item)) {
      return false;
    }

    const normalizedFingerprint = buildNewsFingerprint(
      normalizedEntry.item,
      'tech-ai',
    );
    const summaryFingerprint = buildSummaryFingerprint(
      normalizedEntry.item,
      'tech-ai',
    );

    if (
      shouldSkipNewsByFingerprint(normalizedFingerprint, seenFingerprints) ||
      shouldSkipNewsByFingerprint(summaryFingerprint, seenFingerprints)
    ) {
      return false;
    }

    selectedEntries.push(normalizedEntry);
    seenCandidateIds.add(candidateEntry.candidateId);
    remainingTargetByRegion[region] = Math.max(
      remainingTargetByRegion[region] - 1,
      0,
    );

    if (normalizedFingerprint) {
      seenFingerprints.push(normalizedFingerprint);
    }
    if (summaryFingerprint) {
      seenFingerprints.push(summaryFingerprint);
    }

    return true;
  }

  for (const [index, rawItem] of orderedPayloadItems.entries()) {
    const candidateId = String(rawItem?.candidateId || '').trim();
    if (!candidateId || seenCandidateIds.has(candidateId)) {
      continue;
    }

    const candidateEntry = candidateMap.get(candidateId);
    if (!candidateEntry) {
      continue;
    }

    const region =
      candidateEntry.region === 'domestic' ? 'domestic' : 'international';
    const counterpartRegion =
      region === 'domestic' ? 'international' : 'domestic';
    const remainingCapacity =
      config.techAiNewsLimit - selectedEntries.length - 1;

    if (
      remainingTargetByRegion[region] <= 0 &&
      remainingCapacity < remainingTargetByRegion[counterpartRegion]
    ) {
      continue;
    }

    pushSelectedEntry(candidateEntry, rawItem, index);

    if (selectedEntries.length >= config.techAiNewsLimit) {
      break;
    }
  }

  for (const region of ['international', 'domestic']) {
    if (remainingTargetByRegion[region] <= 0) {
      continue;
    }

    for (const candidateEntry of candidates) {
      if (
        candidateEntry.region !== region ||
        seenCandidateIds.has(candidateEntry.candidateId)
      ) {
        continue;
      }

      if (pushSelectedEntry(candidateEntry, null, Number.MAX_SAFE_INTEGER)) {
        if (remainingTargetByRegion[region] <= 0) {
          break;
        }
      }
    }
  }

  if (selectedEntries.length < config.techAiNewsLimit) {
    for (const candidateEntry of candidates) {
      if (seenCandidateIds.has(candidateEntry.candidateId)) {
        continue;
      }

      if (
        pushSelectedEntry(candidateEntry, null, Number.MAX_SAFE_INTEGER) &&
        selectedEntries.length >= config.techAiNewsLimit
      ) {
        break;
      }
    }
  }

  return selectedEntries
    .map((entry) => entry.item)
    .sort(compareTechAiNewsItemsByHeat)
    .slice(0, config.techAiNewsLimit);
}

function normalizeFinanceNewsLlmItems(payload, candidates, config) {
  const candidateMap = new Map(
    candidates.map((entry) => [entry.candidateId, entry]),
  );
  const selectedItems = [];
  const seenCandidateIds = new Set();
  const seenFingerprints = [];

  for (const rawItem of payload?.items || []) {
    const candidateId = String(rawItem?.candidateId || '').trim();
    if (!candidateId || seenCandidateIds.has(candidateId)) {
      continue;
    }

    const candidateEntry = candidateMap.get(candidateId);
    if (!candidateEntry) {
      continue;
    }

    const normalizedEntry = normalizeNewsLlmSelectedItem(
      rawItem,
      candidateEntry,
      config,
      'finance',
      normalizeFinanceNewsItem,
    );
    const normalizedFingerprint = buildNewsFingerprint(
      normalizedEntry.item,
      'finance',
    );
    const summaryFingerprint = buildSummaryFingerprint(
      normalizedEntry.item,
      'finance',
    );

    if (
      shouldSkipNewsByFingerprint(normalizedFingerprint, seenFingerprints) ||
      shouldSkipNewsByFingerprint(summaryFingerprint, seenFingerprints)
    ) {
      continue;
    }

    selectedItems.push(normalizedEntry.item);
    seenCandidateIds.add(candidateId);
    if (normalizedFingerprint) {
      seenFingerprints.push(normalizedFingerprint);
    }
    if (summaryFingerprint) {
      seenFingerprints.push(summaryFingerprint);
    }

    if (selectedItems.length >= config.financeNewsLimit) {
      break;
    }
  }

  if (selectedItems.length === 0) {
    for (const candidateEntry of candidates) {
      if (seenCandidateIds.has(candidateEntry.candidateId)) {
        continue;
      }

      const fallbackFingerprint = buildNewsFingerprint(
        candidateEntry.item,
        'finance',
      );
      const fallbackItem = normalizeFinanceNewsItem(
        {
          ...candidateEntry.item,
          fingerprint: fallbackFingerprint,
        },
        config.newsSummaryMaxLength,
      );
      const fallbackSummaryFingerprint = buildSummaryFingerprint(
        fallbackItem,
        'finance',
      );
      if (
        shouldSkipNewsByFingerprint(fallbackFingerprint, seenFingerprints) ||
        shouldSkipNewsByFingerprint(
          fallbackSummaryFingerprint,
          seenFingerprints,
        )
      ) {
        continue;
      }

      selectedItems.push(fallbackItem);
      seenCandidateIds.add(candidateEntry.candidateId);
      if (fallbackFingerprint) {
        seenFingerprints.push(fallbackFingerprint);
      }
      if (fallbackSummaryFingerprint) {
        seenFingerprints.push(fallbackSummaryFingerprint);
      }

      if (selectedItems.length >= config.financeNewsLimit) {
        break;
      }
    }
  }

  return selectedItems;
}

async function fetchLlmJsonWithGemini(prompt, config, responseJsonSchema) {
  const url = `${GEMINI_GENERATE_CONTENT_BASE_URL}${encodeURIComponent(
    config.aiNewsGeminiModel,
  )}:generateContent`;
  const response = await fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.geminiApiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseJsonSchema,
      },
    }),
    signal: AbortSignal.timeout(config.aiNewsLlmTimeoutMs),
  });
  const text = (response?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini 未返回可用的结构化结果');
  }

  return parseJsonTextResponse(text, 'Gemini');
}

async function fetchLlmJsonWithDeepSeek(prompt, config) {
  const response = await fetchJson(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: config.aiNewsDeepseekModel,
      temperature: 0.2,
      max_tokens: 1400,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content:
            '你是中文 AI 新闻编辑，只能基于候选列表挑选新闻，必须返回 JSON。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(config.aiNewsLlmTimeoutMs),
  });
  const text = response?.choices?.[0]?.message?.content || '';

  if (!text.trim()) {
    throw new Error('DeepSeek 未返回可用的结构化结果');
  }

  return parseJsonTextResponse(text, 'DeepSeek');
}

function resolveNewsLlmProviders(config) {
  const providers = [
    config.aiNewsLlmProvider,
    config.aiNewsLlmFallbackProvider,
  ].filter(Boolean);

  return [...new Set(providers)].filter((provider) =>
    provider === 'gemini'
      ? Boolean(config.geminiApiKey)
      : Boolean(config.deepseekApiKey),
  );
}

async function fetchNewsLlmPayload(prompt, config, responseJsonSchema, label) {
  const providerOrder = resolveNewsLlmProviders(config);
  let lastError = null;

  for (const provider of providerOrder) {
    try {
      if (provider === 'gemini') {
        return await fetchLlmJsonWithGemini(prompt, config, responseJsonSchema);
      }

      if (provider === 'deepseek') {
        return await fetchLlmJsonWithDeepSeek(prompt, config);
      }
    } catch (error) {
      lastError = error;
      console.warn(
        `[qq-market-bot] ${label} LLM ${provider} 调用失败，准备尝试下一个提供方：${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  throw (
    lastError || new Error(`未配置可用的 ${label} LLM 提供方，请检查 API key`)
  );
}

export async function generateTechAiNewsWithLlm(candidates, config) {
  const payload = await fetchNewsLlmPayload(
    buildAiNewsLlmPrompt(candidates, config),
    config,
    {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              candidateId: { type: 'string' },
              summary: { type: 'string' },
            },
            required: ['candidateId', 'summary'],
          },
        },
      },
      required: ['items'],
    },
    'AI 新闻',
  );

  return normalizeAiNewsLlmItems(payload, candidates, config);
}

export async function generateFinanceNewsWithLlm(candidates, config) {
  const payload = await fetchNewsLlmPayload(
    buildFinanceNewsLlmPrompt(candidates),
    config,
    {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              candidateId: { type: 'string' },
              summary: { type: 'string' },
            },
            required: ['candidateId', 'summary'],
          },
        },
      },
      required: ['items'],
    },
    '财经新闻',
  );

  return normalizeFinanceNewsLlmItems(payload, candidates, config);
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
    fingerprint: item.fingerprint || '',
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
  const now = new Date();
  const feedResults = await Promise.allSettled(
    TECH_AI_NEWS_SOURCES.map(async (source) => {
      const payload = await fetchTextWithFallbacks(source.url);
      return parseTechAiSourceItems(payload, source, now);
    }),
  );

  const candidateItems = selectTechAiNewsItems(
    feedResults
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value),
    config,
    now,
    candidateLimit,
  );
  const unseenCandidateResult =
    config.dailyNewsDedupEnabled && config.currentDailyNewsState
      ? filterPreviouslySentNewsItems(
          candidateItems,
          category,
          config.currentDailyNewsState,
          config,
          config.generatedAtForNews || new Date(),
          {
            includeAllCategories: true,
          },
        )
      : {
          items: candidateItems,
          filteredCount: 0,
        };
  let items = unseenCandidateResult.items.slice(0, config.techAiNewsLimit);

  if (
    config.aiNewsLlmEnabled &&
    resolveNewsLlmProviders(config).length > 0 &&
    unseenCandidateResult.items.length > 0
  ) {
    try {
      const llmCandidates = buildAiNewsLlmCandidateList(
        unseenCandidateResult.items,
      );
      const llmItems = await generateTechAiNewsWithLlm(llmCandidates, config);
      if (llmItems.length > 0) {
        items = llmItems;
      }
    } catch (error) {
      console.warn(
        `[qq-market-bot] AI 新闻 LLM 汇总失败，已回退到规则筛选：${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

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
    emptyText:
      items.length === 0 && unseenCandidateResult.filteredCount > 0
        ? '今天暂无新的新闻。'
        : '',
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
    fingerprint: item.fingerprint || '',
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

  const unseenCandidateResult =
    config.dailyNewsDedupEnabled && config.currentDailyNewsState
      ? filterPreviouslySentNewsItems(
          selectedItems,
          category,
          config.currentDailyNewsState,
          config,
          config.generatedAtForNews || new Date(),
          {
            includeAllCategories: true,
          },
        )
      : {
          items: selectedItems,
          filteredCount: 0,
        };
  const crossSectionFilteredResult =
    Array.isArray(config.excludedNewsFingerprints) &&
    config.excludedNewsFingerprints.length > 0
      ? filterNewsItemsByFingerprints(
          unseenCandidateResult.items,
          category,
          config.excludedNewsFingerprints,
        )
      : {
          items: unseenCandidateResult.items,
          filteredCount: 0,
        };
  let items = crossSectionFilteredResult.items.slice(
    0,
    config.financeNewsLimit,
  );

  if (
    config.aiNewsLlmEnabled &&
    resolveNewsLlmProviders(config).length > 0 &&
    items.length > 0
  ) {
    try {
      const llmCandidates = buildAiNewsLlmCandidateList(items);
      const llmItems = await generateFinanceNewsWithLlm(llmCandidates, config);
      if (llmItems.length > 0) {
        items = llmItems;
      }
    } catch (error) {
      console.warn(
        `[qq-market-bot] 财经新闻 LLM 汇总失败，已回退到规则筛选：${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return {
    category,
    title: NEWS_CATEGORY_CONFIG[category].title,
    items,
    emptyText:
      items.length === 0 &&
      (unseenCandidateResult.filteredCount > 0 ||
        crossSectionFilteredResult.filteredCount > 0)
        ? '今天暂无新的新闻。'
        : '',
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
    aiNewsLlmEnabled: env.MARKET_AI_LLM_ENABLED !== '0',
    aiNewsLlmProvider: normalizeAiNewsLlmProvider(
      env.MARKET_AI_LLM_PROVIDER,
      DEFAULT_AI_NEWS_LLM_PRIMARY_PROVIDER,
    ),
    aiNewsLlmFallbackProvider: normalizeAiNewsLlmProvider(
      env.MARKET_AI_LLM_FALLBACK_PROVIDER,
      DEFAULT_AI_NEWS_LLM_FALLBACK_PROVIDER,
    ),
    geminiApiKey: env.GEMINI_API_KEY?.trim() || '',
    deepseekApiKey: env.DEEPSEEK_API_KEY?.trim() || '',
    aiNewsGeminiModel: env.GEMINI_MODEL?.trim() || DEFAULT_AI_NEWS_GEMINI_MODEL,
    aiNewsDeepseekModel:
      env.DEEPSEEK_MODEL?.trim() || DEFAULT_AI_NEWS_DEEPSEEK_MODEL,
    aiNewsLlmTimeoutMs: toPositiveInteger(
      env.MARKET_AI_LLM_TIMEOUT_MS,
      DEFAULT_AI_NEWS_LLM_TIMEOUT_MS,
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
  const sections = [];
  const seenFingerprints = [];

  for (const category of categories) {
    try {
      const section = await newsFetcher(category, {
        ...config,
        excludedNewsFingerprints: [...seenFingerprints],
      });
      sections.push(section);

      for (const item of section.items || []) {
        const fingerprint = buildNewsFingerprint(item, category);
        if (
          fingerprint &&
          !shouldSkipNewsByFingerprint(fingerprint, seenFingerprints)
        ) {
          seenFingerprints.push(fingerprint);
        }
      }
    } catch (error) {
      sections.push({
        category,
        title: NEWS_CATEGORY_CONFIG[category].title,
        items: [],
        error:
          error instanceof Error ? error.message : `抓取 ${category} 新闻失败`,
      });
    }
  }

  return sections;
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
  const dedupedNewsSections = dedupeNewsSectionsForMessage(newsSections);

  for (const section of dedupedNewsSections) {
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
  const runtimeConfig = {
    ...config,
    generatedAtForNews: generatedAt,
  };
  const [quotes, rawNewsSections] = await Promise.all([
    collectQuotes(runtimeConfig, quoteFetcher),
    collectNews(runtimeConfig, newsFetcher),
  ]);
  const finalNewsSections = dedupeNewsSectionsForMessage(rawNewsSections);
  const messages = buildReportMessages(
    quotes,
    finalNewsSections,
    generatedAt,
    config.timeZone,
    config.messageMaxLength,
  );
  const message = messages.join(MESSAGE_SECTION_SEPARATOR);
  const result = await messagePusher(runtimeConfig, messages);

  return {
    config: runtimeConfig,
    generatedAt,
    quotes,
    newsSections: finalNewsSections,
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

AI 新闻 LLM（可选，默认 DeepSeek）：
  MARKET_AI_LLM_ENABLED=1 | 0
  MARKET_AI_LLM_PROVIDER=deepseek | gemini
  MARKET_AI_LLM_FALLBACK_PROVIDER=deepseek | gemini
  DEEPSEEK_API_KEY
  DEEPSEEK_MODEL
  GEMINI_API_KEY
  GEMINI_MODEL
  MARKET_AI_LLM_TIMEOUT_MS

OneBot 模式：
  ONEBOT_HTTP_URL 或 ONEBOT_WS_URL（二选一；同时存在时优先 HTTP）
  ONEBOT_MESSAGE_TYPE=group | private
  ONEBOT_TARGET_ID
  ONEBOT_EXTRA_TARGETS=group:群号,private:QQ号 (可选，可配置多个)
  ONEBOT_ACCESS_TOKEN (可选)

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
