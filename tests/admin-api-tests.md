# Al-Dahayan Admin API Tests

## 1. Purpose

This test plan validates the protected Admin API contract defined in:

`api/admin-api.yaml`

The tests cover:

- Authentication
- Authorization
- OEM management
- Inventory
- Pricing
- Images
- Compatibility
- Import
- Export
- Audit logging
- Validation
- Security
- Error handling
- Request tracing

These are API contract and integration tests.

They do not represent a live production backend until the backend is implemented.

---

## 2. Authentication Tests

### ADMIN-AUTH-001 — Missing token

Request:

```http
GET /api/v1/admin/oem
