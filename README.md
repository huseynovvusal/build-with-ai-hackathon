# Communa AI — Meritocratic Org Intelligence Platform

Communa AI is a full-stack platform that maps engineering talent from GitHub activity, computes merit-based contribution signals, and uses AI to generate high-impact project initiatives with team recommendations.

The system is designed for organization-scale collaboration:
- Authenticate contributors through GitHub OAuth
- Continuously ingest member/org contribution data from GitHub APIs
- Rank contributors using measurable contribution metrics
- Generate project proposals and team assignments via DeepSeek
- Stream analysis progress to the UI in real time via SSE

---

## What the project does

### 1) Identity + onboarding
- User signs in with GitHub
- Backend creates/updates a `Member` profile
- Background analysis starts immediately (non-blocking login)

### 2) Data intelligence pipeline
- Pulls user and organization data from GitHub APIs
- Derives skills and contribution counters (`commits`, `merged PRs`, `issues`, `reviews`)
- Computes impact score from repository + contribution signals

### 3) AI planning and staffing
- DeepSeek generates project proposals with:
	- `ai_reasoning`
	- `initiatives`
	- `technical_tips`
	- `overall_strategy`
	- `required_dna`
- DeepSeek also assigns best-fit team members and role suggestions

### 4) Real-time UX
- Frontend subscribes to `/api/auth/stream/` (SSE)
- Progress updates are pushed while analysis/sync is running
- Members, leaderboard, and proposals auto-refresh without manual reload

---

## Architecture at a glance

- **Backend:** Django + Django REST Framework + SimpleJWT + PostgreSQL
- **Frontend:** React + Vite + TypeScript
- **AI Provider:** DeepSeek Chat Completions API
- **Infra:** Docker Compose (`db`, `backend`, `frontend`)
- **Realtime:** Server-Sent Events (SSE)

Backend follows a service-oriented pattern:
- `views` handle HTTP contracts
- `services` contain domain/business logic
- `repositories` encapsulate data access patterns
- `models` define persisted domain entities

---

## Repository structure

```text
build-with-ai-hackathon/
	backend/
		communa_auth/         # Django project config
		members/              # Members, proposals, projects domain
			services/           # AI generation, sync, matching, notifications
			repositories.py     # Data access helpers
			views.py            # REST endpoints
			models.py           # Domain models
		users/                # OAuth/auth/session/profile streaming
		requirements.txt
	frontend/
		src/
			api/                # HTTP clients
			components/         # UI screens/widgets
			context/            # Auth + realtime state
	docker-compose.yml
	.env.example
	README.md
```

---

## Runtime flow (end-to-end)

1. **User authenticates** via `POST /api/auth/github/`
2. API responds quickly with JWT + initial profile
3. Background worker continues ingestion and AI generation
4. Backend updates analysis status/progress on `Member`
5. Frontend listens to `GET /api/auth/stream/?token=<access_token>`
6. UI updates in real time (progress bar/messages + refreshed datasets)

---

## How to run

## 1) Prerequisites
- Docker + Docker Compose
- GitHub OAuth app (client ID/secret)
- DeepSeek API key

## 2) Environment setup

Copy env template:

```bash
cp .env.example .env
```

Set required values in [.env](.env):
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `DEEPSEEK_API_KEY`

Recommended callback for GitHub OAuth app:
- `http://localhost:5173/auth/callback`

## 3) Start services

```bash
docker compose up -d --build
```

## 4) Access apps
- Frontend: http://localhost:5173
- Backend API root: http://localhost:8000/api/

---

## Key API endpoints

### Auth
- `POST /api/auth/github/` — exchange GitHub OAuth code for JWT
- `GET /api/auth/me/` — current member profile
- `PUT /api/auth/me/` — update profile (skills/roles/org)
- `GET /api/auth/stream/?token=<access_token>` — SSE member progress updates

### Sync + Members
- `POST /api/sync/` — sync organization members + regenerate AI proposals
- `GET /api/sync/logs/` — sync log lines
- `GET /api/members/` — member list

### Proposals
- `GET /api/proposals/` — list AI proposals
- `POST /api/proposals/refresh/` — regenerate AI proposal set
- `POST /api/proposals/<id>/activate/` — activate a proposal

### Projects
- `GET /api/projects/` — list created projects
- `POST /api/projects/create/` — create project + AI team assignment

---

## AI behavior guarantees

- Project ideas and team assignments are configured as **AI-only**
- No hardcoded fallback proposals/teams are used in generation flows
- If DeepSeek is unavailable or misconfigured, APIs return explicit errors

---

## Operational notes

- Leaderboard metrics are sourced from GitHub-derived contribution data
- Organization sync uses authenticated token when available for better coverage
- SSE updates are used by frontend to avoid manual refresh cycles

---

## Troubleshooting

- **“Failed to refresh AI ideas”**
	- Verify `DEEPSEEK_API_KEY` in [.env](.env)
	- Ensure backend container restarted after env changes

- **No org members synced**
	- Check org visibility/membership visibility
	- Ensure GitHub OAuth scope includes org visibility where required

- **No realtime updates**
	- Confirm auth token exists and SSE endpoint is reachable
	- Check backend logs for stream/auth errors
