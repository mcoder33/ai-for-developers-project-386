# Call Booking

### Hexlet tests and linter status:
[![Actions Status](https://github.com/mcoder33/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/mcoder33/ai-for-developers-project-386/actions)

Design First contract for a small appointment booking service.

## Files

- `docs/domain.md`: domain entities, roles, and business rules.
- `specs/main.tsp`: TypeSpec API contract.
- `tspconfig.yaml`: OpenAPI emitter configuration.
- `frontend/`: Vite React UI that works with the API contract.

## Commands

Install dependencies:

```sh
make install
```

Compile TypeSpec to OpenAPI:

```sh
make spec-compile
```

The generated OpenAPI file is written to `tsp-output/openapi/openapi.yaml`.

Run the backend and frontend together:

```sh
make dev
```

This starts the Go API on `http://localhost:3000` and Vite frontend on its dev-server URL. The frontend uses `http://localhost:3000` as `VITE_API_BASE_URL` by default.

Run only the frontend:

```sh
make frontend-dev
```

Override the frontend API URL when needed:

```sh
make frontend-dev VITE_API_BASE_URL=http://localhost:4010
```

Run a Prism mock API:

```sh
make mock-api
```

## Go backend

Run the in-memory backend implementation:

```sh
make backend-dev
```

The backend listens on `http://localhost:3000`.

Build the frontend:

```sh
make frontend-build
```

Backend tests:

```sh
make backend-test
```

## Docker

Build and run the production image:

```sh
make docker-build
make docker-run
```

The container serves the React frontend and the Go API from one process. The frontend calls the API under `/api`.

## Deployment

Render deployment is described in `render.yaml`.
