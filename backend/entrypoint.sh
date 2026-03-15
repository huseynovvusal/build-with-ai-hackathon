#!/usr/bin/env sh
set -eu

if [ "${POSTGRES_HOST:-}" ] && [ "${POSTGRES_PORT:-}" ]; then
  echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
  python - <<'PY'
import os
import socket
import time

host = os.getenv("POSTGRES_HOST", "db")
port = int(os.getenv("POSTGRES_PORT", "5432"))
for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=2):
            print("PostgreSQL is available.")
            break
    except OSError:
        time.sleep(1)
else:
    raise SystemExit("PostgreSQL not reachable after 60 seconds.")
PY
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn communa_auth.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers ${GUNICORN_WORKERS:-3} \
  --threads ${GUNICORN_THREADS:-2} \
  --timeout ${GUNICORN_TIMEOUT:-60}
