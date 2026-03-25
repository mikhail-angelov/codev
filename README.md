# Codev

Codev is a technical interview preparation app focused on one core loop: pick a problem, solve it in the browser, run visible sample tests, and get structured AI feedback.

## Structure

- `frontend/`: React + TypeScript + Vite app
- `backend/`: Express + TypeScript API
- `docs/`: product docs and UI reference
- `.github/workflows/`: CI/CD pipeline configuration

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

## CI/CD Pipeline

The project includes a GitHub Actions CI/CD pipeline that automatically:

1. **Runs tests** on every push and pull request
2. **Builds both backend and frontend** applications
3. **Builds and pushes Docker image** to GitHub Container Registry on master branch

### Pipeline Details

- **Trigger**: Push to `master` branch or pull requests targeting `master`
- **Test Job**: Runs `npm test` for both backend and frontend workspaces
- **Build-and-Docker Job**: 
  - Builds backend and frontend applications
  - Builds Docker image using pre-built artifacts
  - Pushes image to `ghcr.io/mikhail-angelov/codev` with tags:
    - `latest` for master branch
    - Branch name and commit SHA tags

### Docker Image

The Docker image is available at `ghcr.io/mikhail-angelov/codev:latest` and includes:
- Built backend application with production dependencies
- Built frontend static assets
- Proper environment configuration for production

### Manual Deployment

To deploy manually using the latest CI-built image:

```bash
docker pull ghcr.io/mikhail-angelov/codev:latest
docker compose up -d
```

### Development Workflow

1. Make changes and create a pull request
2. CI pipeline automatically runs tests
3. After merging to master, CI builds and pushes new Docker image
4. Deploy using the updated image



