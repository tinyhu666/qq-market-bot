#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import datetime as dt
import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


TWELVE_DATA_QUOTE_URL = "https://api.twelvedata.com/quote"
GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search"
DEFAULT_NEWS_LIMIT = 10
DEFAULT_NEWS_SUMMARY_MAX_LENGTH = 48
DEFAULT_MESSAGE_MAX_LENGTH = 1600
GOOGLE_NEWS_DEFAULT_PARAMS = {
    "hl": "zh-CN",
    "gl": "CN",
    "ceid": "CN:zh-Hans",
}

DEFAULT_SYMBOLS = [
    {"symbol": "XAU/USD", "label": "XAU/USD"},
    {"symbol": "ETH/USD", "label": "ETH/USD"},
]

NEWS_CATEGORY_CONFIG = {
    "tech": {
        "title": "全球科技/AI新闻",
        "queries": [
            '(AI OR "artificial intelligence" OR technology OR OpenAI OR Nvidia OR Microsoft) when:1d -Polymarket -mexc -crypto -Moomoo',
            '("生成式AI" OR "人工智能" OR OpenAI OR Nvidia OR 机器人 OR 芯片) when:1d -广告 -招聘 -Moomoo',
        ],
        "required_keywords": [
            r"ai",
            r"artificial intelligence",
            r"technology",
            r"openai",
            r"nvidia",
            r"microsoft",
            r"google",
            r"meta",
            r"anthropic",
            r"chip",
            r"robot",
            r"人工智能",
            r"生成式AI",
            r"大模型",
            r"算力",
            r"芯片",
            r"机器人",
            r"智算",
        ],
        "source_blacklist": [r"moomoo", r"polymarket", r"mexc"],
        "title_blacklist": [r"招聘", r"广告"],
    },
    "finance": {
        "title": "全球财经新闻",
        "queries": [
            '("stock market" OR "global economy" OR inflation OR earnings OR "federal reserve" OR "central bank") when:1d -crypto -Polymarket -mexc -Moomoo -minichart -AASTOCKS',
            '("oil price" OR gold OR "bond market" OR recession OR tariffs OR "economic outlook") when:1d -crypto -Polymarket -mexc -Moomoo',
        ],
        "required_keywords": [
            r"stock market",
            r"economy",
            r"inflation",
            r"earnings",
            r"federal reserve",
            r"central bank",
            r"oil",
            r"gold",
            r"bond",
            r"tariff",
            r"market",
            r"股市",
            r"经济",
            r"通胀",
            r"财报",
            r"美联储",
            r"央行",
            r"原油",
            r"黄金",
            r"债券",
            r"关税",
            r"避险",
        ],
        "source_blacklist": [
            r"moomoo",
            r"polymarket",
            r"mexc",
            r"minichart",
            r"aastocks",
            r"证券之星",
            r"黄金网",
        ],
        "title_blacklist": [
            r"投注赔率",
            r"研报",
            r"拟不分红",
            r"索赔",
            r"公司研究",
            r"季度收益",
            r"DLC",
            r"杠杆证书",
            r"US Stocks Quote",
            r"比特币",
            r"\bBTC\b",
            r"以太坊",
            r"加密货币",
            r"数字黄金",
            r"crypto",
            r"点金",
            r"金市直播",
            r"日内",
            r"看多",
            r"看空",
        ],
    },
}


def env_or_fail(key):
    value = os.environ.get(key, "").strip()
    if not value:
        raise RuntimeError("缺少环境变量 {}".format(key))
    return value


def env_int(key, default):
    raw = os.environ.get(key, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value > 0 else default


def request_text(url, method="GET", headers=None, body=None):
    request_headers = {
        "User-Agent": "Mozilla/5.0 stock-bot/1.0",
        "Accept": "application/json, text/xml, application/xml;q=0.9, */*;q=0.8",
    }
    if headers:
        request_headers.update(headers)
    req = urllib.request.Request(url=url, data=body, headers=request_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        message = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError("请求失败 ({}): {}".format(exc.code, message[:200]))
    except urllib.error.URLError as exc:
        raise RuntimeError("网络请求失败: {}".format(exc))


def request_json(url, method="GET", headers=None, payload=None):
    body = None
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
    text = request_text(url, method=method, headers=headers, body=body)
    try:
        return json.loads(text)
    except ValueError:
        raise RuntimeError("接口返回了不可解析的 JSON: {}".format(text[:200]))


def normalize_space(text):
    return re.sub(r"\s+", " ", text or "").strip()


def contains_chinese(text):
    return bool(re.search(r"[\u4e00-\u9fff]", text or ""))


def truncate_text(text, limit):
    text = text or ""
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 1)] + "…"


def strip_html(text):
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]*>", " ", text)
    return normalize_space(text)


def build_google_news_url(query):
    params = {"q": query}
    params.update(GOOGLE_NEWS_DEFAULT_PARAMS)
    return "{}?{}".format(GOOGLE_NEWS_RSS_URL, urllib.parse.urlencode(params))


def fetch_twelve_data_quote(symbol, api_key):
    params = urllib.parse.urlencode({"symbol": symbol, "apikey": api_key})
    data = request_json("{}?{}".format(TWELVE_DATA_QUOTE_URL, params))
    if data.get("status") == "error":
        raise RuntimeError(
            "Twelve Data {} 查询失败：{}".format(symbol, data.get("message", "未知错误"))
        )

    try:
        price = float(data.get("close") or data.get("price"))
    except (TypeError, ValueError):
        raise RuntimeError("Twelve Data {} 没有返回有效价格".format(symbol))

    percent_change = data.get("percent_change")
    try:
        percent_change = float(percent_change) if percent_change is not None else None
    except (TypeError, ValueError):
        percent_change = None

    return {
        "symbol": symbol,
        "price": price,
        "percent_change": percent_change,
        "exchange": data.get("exchange", ""),
    }


def parse_google_news_rss(xml_text):
    root = ET.fromstring(xml_text)
    items = []
    for item in root.findall("./channel/item"):
        title = strip_html(item.findtext("title", ""))
        source = strip_html(item.findtext("source", ""))
        if source and title.endswith(" - {}".format(source)):
            title = title[: -len(" - {}".format(source))]
        items.append(
            {
                "title": title,
                "source": source,
                "description": strip_html(item.findtext("description", "")),
                "link": strip_html(item.findtext("link", "")),
                "pub_date": strip_html(item.findtext("pubDate", "")),
            }
        )
    return items


def keep_news_item(item, category_config):
    haystack = "{} {}".format(item.get("title", ""), item.get("source", ""))

    for pattern in category_config["source_blacklist"]:
        if re.search(pattern, item.get("source", ""), re.I):
            return False

    for pattern in category_config["title_blacklist"]:
        if re.search(pattern, item.get("title", ""), re.I):
            return False

    for pattern in category_config["required_keywords"]:
        if re.search(pattern, haystack, re.I):
            return True
    return False


def build_news_summary(item, category, max_length):
    description = normalize_space(
        item.get("description", "")
        .replace(item.get("title", ""), "")
        .replace(item.get("source", ""), "")
    )

    if description and contains_chinese(description) and len(description) >= 12:
        return truncate_text(description, max_length)

    prefix = "科技/AI要点" if category == "tech" else "财经要点"
    if contains_chinese(item.get("title", "")):
        return truncate_text("{}：{}".format(prefix, item["title"]), max_length)

    source = item.get("source", "") or "该媒体"
    return truncate_text('{}报道了“{}”'.format(source, item.get("title", "")), max_length)


def fetch_news_category(category, tech_limit, finance_limit, summary_max_length):
    category_config = NEWS_CATEGORY_CONFIG[category]
    dedup = {}

    for query in category_config["queries"]:
        xml_text = request_text(
            build_google_news_url(query),
            headers={"User-Agent": "Mozilla/5.0 stock-bot/1.0"},
        )
        for item in parse_google_news_rss(xml_text):
            key = normalize_space(item.get("title", "")).lower()
            if key and key not in dedup:
                dedup[key] = item

    items = [item for item in dedup.values() if keep_news_item(item, category_config)]
    items.sort(key=lambda x: x.get("pub_date", ""), reverse=True)
    limit = tech_limit if category == "tech" else finance_limit
    items = items[:limit]

    for item in items:
        item["summary"] = build_news_summary(item, category, summary_max_length)

    return {
        "category": category,
        "title": category_config["title"],
        "items": items,
        "error": "",
    }


def format_price(value):
    if value is None:
        return "--"
    abs_value = abs(value)
    digits = 2 if abs_value >= 1000 else 4 if abs_value >= 1 else 6
    return "{{:,.{}f}}".format(digits).format(value)


def format_percent(value):
    if value is None:
        return "n/a"
    return "{:+.2f}%".format(value)


def now_string():
    return dt.datetime.utcnow() + dt.timedelta(hours=8)


def format_timestamp(dt_obj):
    return dt_obj.strftime("%Y-%m-%d %H:%M:%S")


def parse_pub_time(text):
    try:
        parsed = dt.datetime.strptime(text, "%a, %d %b %Y %H:%M:%S GMT")
        parsed = parsed + dt.timedelta(hours=8)
        return parsed.strftime("%m-%d %H:%M")
    except Exception:
        return "--:--"


def build_messages(quotes, news_sections, now_dt, message_max_length):
    messages = []
    price_lines = [
        "【行情定时播报】",
        "时间：{} (Asia/Shanghai)".format(format_timestamp(now_dt)),
        "",
        "【价格】",
    ]
    for quote in quotes:
        price_lines.append(
            "{}：{} | 涨跌幅 {}".format(
                quote["label"], format_price(quote["price"]), format_percent(quote["percent_change"])
            )
        )
    price_lines.extend(["", "数据源：Twelve Data / Google News RSS"])
    messages.append("\n".join(price_lines))

    for section in news_sections:
        title = "【{} Top {}】".format(section["title"], len(section["items"]))
        if section["error"]:
            messages.append("{}\n新闻抓取失败：{}".format(title, section["error"]))
            continue
        if not section["items"]:
            messages.append("{}\n暂无符合条件的新闻。".format(title))
            continue

        current = title
        for idx, item in enumerate(section["items"], 1):
            block = (
                "{}. {}\n来源：{} | 时间：{}\n摘要：{}".format(
                    idx,
                    item["title"],
                    item.get("source", "") or "未知来源",
                    parse_pub_time(item.get("pub_date", "")),
                    item.get("summary", ""),
                )
            )
            candidate = current + ("\n" if current == title else "\n\n") + block
            if len(candidate) > message_max_length and current != title:
                messages.append(current)
                current = title + "\n" + block
            else:
                current = candidate
        messages.append(current)

    return messages


def send_onebot(message_type, target_id, base_url, access_token, content):
    endpoint = "send_group_msg" if message_type == "group" else "send_private_msg"
    target_field = "group_id" if message_type == "group" else "user_id"
    headers = {"Content-Type": "application/json"}
    if access_token:
        headers["Authorization"] = "Bearer {}".format(access_token)
    payload = {target_field: target_id, "message": content, "auto_escape": False}
    return request_json(
        "{}/{}".format(base_url.rstrip("/"), endpoint),
        method="POST",
        headers=headers,
        payload=payload,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    api_key = env_or_fail("TWELVE_DATA_API_KEY")
    message_type = env_or_fail("ONEBOT_MESSAGE_TYPE").lower()
    target_id = env_or_fail("ONEBOT_TARGET_ID")
    onebot_url = env_or_fail("ONEBOT_HTTP_URL")
    access_token = os.environ.get("ONEBOT_ACCESS_TOKEN", "").strip()

    tech_limit = env_int("MARKET_TECH_NEWS_LIMIT", DEFAULT_NEWS_LIMIT)
    finance_limit = env_int("MARKET_FINANCE_NEWS_LIMIT", DEFAULT_NEWS_LIMIT)
    summary_max_length = env_int(
        "MARKET_NEWS_SUMMARY_MAX_LENGTH", DEFAULT_NEWS_SUMMARY_MAX_LENGTH
    )
    message_max_length = env_int("MARKET_MESSAGE_MAX_LENGTH", DEFAULT_MESSAGE_MAX_LENGTH)

    quotes = []
    for symbol in DEFAULT_SYMBOLS:
        quote = fetch_twelve_data_quote(symbol["symbol"], api_key)
        quote["label"] = symbol["label"]
        quotes.append(quote)

    news_sections = []
    for category in ("tech", "finance"):
        try:
            news_sections.append(
                fetch_news_category(category, tech_limit, finance_limit, summary_max_length)
            )
        except Exception as exc:
            news_sections.append(
                {
                    "category": category,
                    "title": NEWS_CATEGORY_CONFIG[category]["title"],
                    "items": [],
                    "error": str(exc),
                }
            )

    messages = build_messages(quotes, news_sections, now_string(), message_max_length)
    print("\n\n----------------\n\n".join(messages))

    if args.dry_run:
        print("\n[dry-run] 已跳过实际推送。")
        return 0

    results = []
    for message in messages:
        results.append(send_onebot(message_type, target_id, onebot_url, access_token, message))

    print("\n推送完成：共 {} 条消息。".format(len(results)))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print("执行失败：{}".format(exc), file=sys.stderr)
        sys.exit(1)
