#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PID_FILE="$ROOT_DIR/backend-dev.pid"
FRONTEND_PID_FILE="$ROOT_DIR/frontend-dev.pid"

stop_service() {
  local name="$1"
  local pid_file="$2"

  if [ ! -f "$pid_file" ]; then
    echo "[stop-dev] No PID file for $name"
    return
  fi

  local pid
  pid="$(cat "$pid_file" 2>/dev/null || echo)"
  if [ -z "$pid" ]; then
    echo "[stop-dev] Empty PID in $pid_file"
    rm -f "$pid_file"
    return
  fi

  if kill -0 "$pid" 2>/dev/null; then
    echo "[stop-dev] Stopping $name (PID $pid)..."
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  else
    echo "[stop-dev] $name already stopped"
  fi

  rm -f "$pid_file"
}

stop_service "backend" "$BACKEND_PID_FILE"
stop_service "frontend" "$FRONTEND_PID_FILE"

echo "[stop-dev] All dev services stopped."