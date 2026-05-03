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
npm install
```

Compile TypeSpec to OpenAPI:

```sh
npm run spec:compile
```

The generated OpenAPI file is written to `tsp-output/openapi/openapi.yaml`.

Run the frontend:

```sh
cd frontend
npm install
npm run dev
```

By default the UI reads API data from `http://localhost:4010`. Override it with `VITE_API_BASE_URL`.

Run a Prism mock API from the frontend folder:

```sh
npm run mock:api
```
