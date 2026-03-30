#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${MARKET_BOT_ENV_FILE:-$SCRIPT_DIR/qq-market-bot.env}"
NODE_BIN="${NODE_BIN:-/opt/node-v24.14.1-linux-x64/bin/node}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "缺少环境文件: $ENV_FILE" >&2
  exit 1
fi

if [[ ! -x "$NODE_BIN" ]]; then
  echo "缺少 Node 可执行文件: $NODE_BIN" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ "${QQ_BOT_MODE:-}" == "onebot" && "${MARKET_SKIP_ENDPOINT_CHECK:-0}" != "1" ]]; then
  onebot_url="${ONEBOT_HTTP_URL:-}"
  onebot_ws_url="${ONEBOT_WS_URL:-}"

  if [[ -n "$onebot_url" ]]; then
    status_response="$(
      curl -fsS --max-time 3 \
        -H 'Content-Type: application/json' \
        -d '{}' \
        "${onebot_url%/}/get_status" 2>/dev/null || true
    )"

    if [[ -z "$status_response" || "$status_response" != *'"status":"ok"'* ]]; then
      printf '%s OneBot endpoint unreachable or unhealthy: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$onebot_url"
      exit 0
    fi
  elif [[ -n "$onebot_ws_url" ]]; then
    if ! "$NODE_BIN" -e "
      const net = require('node:net');
      const url = new URL(process.argv[1]);
      const isSecure = url.protocol === 'wss:';
      const port = Number(url.port || (isSecure ? 443 : 80));
      const socket = net.createConnection({
        host: url.hostname,
        port,
      });
      socket.setTimeout(3000);
      socket.on('connect', () => {
        socket.end();
        process.exit(0);
      });
      socket.on('timeout', () => {
        socket.destroy();
        process.exit(1);
      });
      socket.on('error', () => {
        process.exit(1);
      });
    " "$onebot_ws_url"; then
      printf '%s OneBot WS endpoint unreachable: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$onebot_ws_url"
      exit 0
    fi
  else
    echo "缺少环境变量 ONEBOT_HTTP_URL 或 ONEBOT_WS_URL" >&2
    exit 1
  fi
fi

exec "$NODE_BIN" "$SCRIPT_DIR/qq-market-bot.mjs" "$@"
