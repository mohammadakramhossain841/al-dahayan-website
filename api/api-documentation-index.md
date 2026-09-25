# Al-Dahayan API Documentation Index

## Public OEM API

The Public OEM API provides customer-facing access to Toyota and Lexus spare-parts catalog information.

### Main Contract

- `api/oem-public-api.yaml`

OpenAPI contract for the public OEM API.

### Integration Guide

- `api/oem-public-api-guide.md`

Explains endpoints, requests, responses, security and frontend integration.

### Public API Configuration

The following configuration files define the API foundation:

- `data/oem-public-api-view.json`
- `data/oem-public-api-security.json`
- `data/oem-public-api-response.json`
- `data/oem-public-api-errors.json`
- `data/oem-public-api-request.json`
- `data/oem-public-api-query-validation.json`
- `data/oem-public-api-endpoints.json`
- `data/oem-public-api-cache.json`
- `data/oem-public-api-rate-limit.json`
- `data/oem-public-api-cors.json`
- `data/oem-public-api-version.json`
- `data/oem-public-api-request-tracing.json`
- `data/oem-public-api-health.json`
- `data/oem-public-api-maintenance.json`

These files describe the planned production API behavior.

---

## API Schemas

Existing API schemas:

- `api/schema/vehicle-schema.json`
- `api/schema/part-schema.json`
- `api/schema/inventory-schema.json`

---

## Existing API Documentation

- `api/README.md`
- `api/endpoints.md`
- `api/oem-public-api.yaml`
- `api/oem-public-api-guide.md`

---

## API Tests

Public OEM API tests:

- `tests/oem-public-api-tests.md`

Existing system tests:

- `tests/search-tests.md`
- `tests/vin-tests.md`
- `tests/inventory-tests.md`
- `tests/responsive-tests.md`

---

## API Architecture

The intended production architecture is:

```text
Frontend Website
       ↓
API Service Layer
       ↓
Public API
       ↓
Backend Services
       ↓
Database
       ↓
Inventory / Catalog / Compatibility
