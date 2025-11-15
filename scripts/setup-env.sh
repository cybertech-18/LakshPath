#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_ENV="$ROOT_DIR/backend/.env"
FRONTEND_ENV="$ROOT_DIR/frontend/.env"

copy_if_missing() {
  local example_file="$1"
  local target_file="$2"
  local label="$3"

  if [ -f "$target_file" ]; then
    echo "✅ $label already exists ($target_file)"
  else
    cp "$example_file" "$target_file"
    echo "📄 Created $label from template ($target_file)"
  fi
}

copy_if_missing "$ROOT_DIR/backend/.env.example" "$BACKEND_ENV" "backend/.env"
copy_if_missing "$ROOT_DIR/frontend/.env.example" "$FRONTEND_ENV" "frontend/.env"

echo
cat <<'EOT'
Next steps:
1. backend/.env already includes the provided GEMINI_API_KEY (AIzaSyAc3hciPc0IHDiRqhLlyX8VLvd_hcxqG-o); replace it plus GOOGLE_CLIENT_ID/JWT_SECRET with your own values before deploying.
2. Open frontend/.env and point VITE_API_BASE_URL (and VITE_GOOGLE_CLIENT_ID) to match your backend + Google project.
3. Restart both servers so they pick up the new environment variables.
EOT
