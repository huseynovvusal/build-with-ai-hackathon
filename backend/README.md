# Communa AI Backend

Django + DRF backend for:
- syncing GitHub organization members (mocked for demo)
- AI project proposal generation (mocked)
- project activation + notification flow (mocked)

## Features

- Clean service-layer architecture (`views` call `services`, logic stays out of views)
- Optional repository layer for data access abstraction
- Core models:
  - `Member`
  - `ProjectProposal`
  - `TeamAssignment`
- Simulated sync latency (`5s`) + terminal-like sync logs
- AI proposal generation from synced members
- Project activation that triggers mock notification output
- Production-oriented Docker setup (Gunicorn + PostgreSQL + healthchecks)

## Project Structure (backend)

```text
backend/
  communa_auth/
  members/
    services/
  Dockerfile
  entrypoint.sh
  manage.py
  requirements.txt
```

## Run with Docker (recommended)

From project root:

```bash
docker compose up --build -d
```

Check logs:

```bash
docker compose logs -f backend
```

Stop:

```bash
docker compose down
```

API base URL: `http://localhost:8000/api/`

## Run Locally (without Docker)

From project root (with your existing `.venv`):

```bash
.venv/bin/python -m pip install -r backend/requirements.txt
.venv/bin/python backend/manage.py migrate
.venv/bin/python backend/manage.py runserver
```

API base URL: `http://127.0.0.1:8000/api/`

## API Endpoints

- `POST /api/sync/`
  - body (optional): `{ "org_name": "communa-ai" }`
  - runs mock GitHub sync + proposal generation
- `GET /api/sync/logs/`
  - returns sync log lines
- `GET /api/members/`
  - returns synced members
- `GET /api/proposals/`
  - returns generated proposals with team assignments
- `POST /api/proposals/<id>/activate/`
  - sets proposal status to `ACTIVE` and triggers mock notification

## Quick Test

```bash
curl -X POST http://localhost:8000/api/sync/ -H 'Content-Type: application/json' -d '{"org_name":"communa-ai"}'
curl http://localhost:8000/api/sync/logs/
curl http://localhost:8000/api/members/
curl http://localhost:8000/api/proposals/
curl -X POST http://localhost:8000/api/proposals/1/activate/
```
