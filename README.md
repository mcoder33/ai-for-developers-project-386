# Call Booking

### Hexlet tests and linter status:
[![Actions Status](https://github.com/mcoder33/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/mcoder33/ai-for-developers-project-386/actions)

Design First contract for a small appointment booking service.

## Files

- `docs/domain.md`: domain entities, roles, and business rules.
- `specs/main.tsp`: TypeSpec API contract.
- `tspconfig.yaml`: OpenAPI emitter configuration.

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
