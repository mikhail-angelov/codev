# Codev

Codev is a technical interview preparation app focused on one core loop: pick a problem, solve it in the browser, run visible sample tests, and get structured AI feedback.

## Structure

- `frontend/`: React + TypeScript + Vite app
- `backend/`: Express + TypeScript API
- `docs/`: product docs and UI reference

## Local development

Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Run the backend:

```bash
npm run dev --prefix backend
```

Run the frontend:

```bash
npm run dev --prefix frontend
```

The frontend uses `VITE_API_URL` and defaults to `http://localhost:3020`.

## Docker

1. Copy `.env` to a real production env file and fill in the public API URL and DeepSeek key.
2. Run it

```bash
docker compose up -d
```



