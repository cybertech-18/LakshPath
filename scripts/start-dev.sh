#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PID_FILE="$ROOT_DIR/backend-dev.pid"
FRONTEND_PID_FILE="$ROOT_DIR/frontend-dev.pid"
BACKEND_LOG="$ROOT_DIR/backend-dev.log"
FRONTEND_LOG="$ROOT_DIR/frontend-dev.log"

BACKEND_PORT="${PORT:-5001}"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
API_BASE_URL="${API_BASE_URL:-http://localhost:${BACKEND_PORT}/api}"

ensure_dir() {
  local target_dir="$1"
  if [ ! -d "$target_dir" ]; then
    echo "[start-dev] Missing directory: $target_dir" >&2
    exit 1
  fi
}

is_running() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || echo)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

start_backend() {
  if is_running "$BACKEND_PID_FILE"; then
    echo "[start-dev] Backend already running (PID $(cat "$BACKEND_PID_FILE"))"
    return
  fi

  ensure_dir "$BACKEND_DIR"
  echo "[start-dev] Starting backend on port $BACKEND_PORT..."
  (
    cd "$BACKEND_DIR"
    PORT="$BACKEND_PORT" npm run dev
  ) >>"$BACKEND_LOG" 2>&1 &
  echo $! >"$BACKEND_PID_FILE"
  echo "[start-dev] Backend logs: $BACKEND_LOG"
}

start_frontend() {
  if is_running "$FRONTEND_PID_FILE"; then
    echo "[start-dev] Frontend already running (PID $(cat "$FRONTEND_PID_FILE"))"
    return
  fi

  ensure_dir "$FRONTEND_DIR"
  echo "[start-dev] Starting frontend on port $FRONTEND_PORT (API $API_BASE_URL)..."
  (
    cd "$FRONTEND_DIR"
    VITE_API_BASE_URL="$API_BASE_URL" npm run dev -- --port "$FRONTEND_PORT"
  ) >>"$FRONTEND_LOG" 2>&1 &
  echo $! >"$FRONTEND_PID_FILE"
  echo "[start-dev] Frontend logs: $FRONTEND_LOG"
}

start_backend
start_frontend

echo "[start-dev] Backend:   http://localhost:${BACKEND_PORT}/"
echo "[start-dev] Frontend:  http://localhost:${FRONTEND_PORT}/"
echo "[start-dev] Press Ctrl+C to exit this script. Services continue running in the background."