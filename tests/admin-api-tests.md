# Al-Dahayan Admin API Tests

## 1. Purpose

This document defines the functional, validation, security, authorization, import, export, audit, and production-readiness tests for the Al-Dahayan Trading Company Admin API.

The Admin API contract is defined in:

api/admin-api.yaml

The integration and security guide is defined in:

api/admin-api-guide.md

These tests describe the expected backend behavior.

They do not indicate that a production backend is currently running.

---

## 2. Test Environment

Expected test environments:

- Local development
- Staging
- Production

Recommended base path:

/api/v1/admin

Production API domain will be configured separately.

---

## 3. Authentication Tests

### Test AUTH-001

Verify that an Admin API request without an Authorization header is rejected.

Expected:

- HTTP 401
- consistent error response
- no protected data returned

### Test AUTH-002

Verify that an invalid Bearer token is rejected.

Expected:

- HTTP 401
- no protected data returned

### Test AUTH-003

Verify that an expired token is rejected.

Expected:

- HTTP 401

### Test AUTH-004

Verify that a valid authenticated administrator can access authorized endpoints.

Expected:

- request succeeds according to endpoint permissions

### Test AUTH-005

Verify that authentication tokens are never returned in normal API responses.

---

## 4. Authorization Tests

### Test AUTHZ-001

Verify that Super Admin can access all permitted administrative functions.

### Test AUTHZ-002

Verify that Catalog Admin can manage OEM catalog records.

### Test AUTHZ-003

Verify that Inventory Admin can manage inventory.

### Test AUTHZ-004

Verify that Pricing Admin can manage pricing.

### Test AUTHZ-005

Verify that Media Admin can manage images.

### Test AUTHZ-006

Verify that Verification Admin can update compatibility verification.

### Test AUTHZ-007

Verify that Viewer cannot modify protected records.

Expected:

- HTTP 403

### Test AUTHZ-008

Verify that authorization is enforced server-side.

Frontend-only permission checks must never be considered sufficient.

---

## 5. OEM List Tests

Endpoint:

GET /api/v1/admin/oem

### Test OEM-001

Verify that an authorized administrator can retrieve OEM records.

Expected:

- HTTP 200
- success response
- OEM records
- pagination information
- request ID

### Test OEM-002

Verify pagination.

Example:

GET /api/v1/admin/oem?page=1&pageSize=25

Expected:

- correct page
- correct page size
- total record information where supported

### Test OEM-003

Verify OEM search.

Example:

GET /api/v1/admin/oem?search=12261

Expected:

- matching OEM records
- no unrelated records

### Test OEM-004

Verify invalid pagination values are rejected or safely normalized.

### Test OEM-005

Verify that unauthorized users cannot retrieve administrative OEM data.

---

## 6. OEM Create Tests

Endpoint:

POST /api/v1/admin/oem

### Test OEM-CREATE-001

Create a valid OEM record.

Example:

{
  "oemNumber": "12261-54130",
  "partName": "Engine Component",
  "brand": "Toyota",
  "category": "Engine"
}

Expected:

- HTTP 201 or contract-defined success status
- created record returned
- unique record ID
- request ID

### Test OEM-CREATE-002

Reject a missing OEM number.

### Test OEM-CREATE-003

Reject a missing part name when required.

### Test OEM-CREATE-004

Reject an unsupported brand.

### Test OEM-CREATE-005

Reject an invalid category.

### Test OEM-CREATE-006

Reject duplicate OEM numbers when duplicates are not allowed.

Expected:

- HTTP 409
- errorCode such as OEM_DUPLICATE

### Test OEM-CREATE-007

Verify that creating an OEM record creates an audit event.

Expected audit action:

OEM_CREATED

---

## 7. OEM Update Tests

Endpoint:

PATCH /api/v1/admin/oem/{oemId}

### Test OEM-UPDATE-001

Update one valid OEM field.

### Test OEM-UPDATE-002

Update multiple valid fields.

### Test OEM-UPDATE-003

Verify that omitted fields remain unchanged.

### Test OEM-UPDATE-004

Reject an invalid OEM ID.

Expected:

- HTTP 404

### Test OEM-UPDATE-005

Reject unauthorized updates.

Expected:

- HTTP 403

### Test OEM-UPDATE-006

Verify audit logging.

Expected audit action:

OEM_UPDATED

---

## 8. OEM Archive Tests

Endpoint:

POST /api/v1/admin/oem/{oemId}/archive

### Test OEM-ARCHIVE-001

Archive an active OEM record.

Expected:

- record becomes archived
- record is no longer treated as active

### Test OEM-ARCHIVE-002

Verify archive action is logged.

Expected audit action:

OEM_ARCHIVED

### Test OEM-ARCHIVE-003

Verify archived records are not permanently deleted unless a separate approved deletion process exists.

### Test OEM-ARCHIVE-004

Verify unauthorized users cannot archive records.

---

## 9. Inventory Tests

Endpoint:

PATCH /api/v1/admin/inventory/{oemId}

### Test INV-001

Update valid inventory quantity.

### Test INV-002

Set stock status to in_stock.

### Test INV-003

Set stock status to low_stock.

### Test INV-004

Set stock status to out_of_stock.

### Test INV-005

Set stock status to on_order.

### Test INV-006

Reject an unsupported stock status.

### Test INV-007

Reject a negative quantity.

### Test INV-008

Verify inventory update creates an audit event.

Expected audit action:

STOCK_UPDATED

### Test INV-009

Verify unauthorized inventory updates are rejected.

---

## 10. Pricing Tests

Endpoint:

PATCH /api/v1/admin/pricing/{oemId}

### Test PRICE-001

Update a valid regular price.

### Test PRICE-002

Update a valid sale price.

### Test PRICE-003

Update a supported currency.

### Test PRICE-004

Reject negative prices.

### Test PRICE-005

Reject an invalid currency.

### Test PRICE-006

Validate discount percentage.

### Test PRICE-007

Verify sale price does not violate configured pricing rules.

### Test PRICE-008

Verify pricing changes are audited.

Expected audit action:

PRICE_UPDATED

### Test PRICE-009

Verify unauthorized pricing changes are rejected.

---

## 11. Image Tests

Endpoint:

POST /api/v1/admin/images/{oemId}

### Test IMAGE-001

Upload or register a valid image.

### Test IMAGE-002

Verify primary image status.

### Test IMAGE-003

Verify image metadata.

Expected metadata may include:

- image URL
- storage path
- image type
- alt text
- primary status
- upload metadata

### Test IMAGE-004

Reject unsupported image types.

### Test IMAGE-005

Reject oversized images.

### Test IMAGE-006

Reject invalid image content.

### Test IMAGE-007

Verify user-controlled filenames cannot escape the configured storage directory.

### Test IMAGE-008

Verify image changes are audited.

Expected audit action:

IMAGE_ADDED

---

## 12. Compatibility Tests

Endpoint:

PUT /api/v1/admin/compatibility/{oemId}

### Test COMP-001

Create valid compatibility data.

### Test COMP-002

Update an existing compatibility record.

### Test COMP-003

Reject an invalid vehicle reference.

### Test COMP-004

Reject invalid model year values.

### Test COMP-005

Reject malformed engine codes where validation is configured.

### Test COMP-006

Verify newly entered compatibility is not automatically marked as verified.

### Test COMP-007

Verify verification state can be changed only by an authorized role.

### Test COMP-008

Verify compatibility updates are audited.

Expected audit action:

COMPATIBILITY_UPDATED

---

## 13. Import Tests

Endpoint:

POST /api/v1/admin/import

Supported formats:

- CSV
- XLSX
- JSON

### Test IMPORT-001

Upload a valid CSV file.

### Test IMPORT-002

Upload a valid XLSX file.

### Test IMPORT-003

Upload a valid JSON file.

### Test IMPORT-004

Reject unsupported file types.

### Test IMPORT-005

Reject files larger than the configured size limit.

### Test IMPORT-006

Reject malformed CSV data.

### Test IMPORT-007

Reject malformed XLSX data.

### Test IMPORT-008

Reject malformed JSON data.

### Test IMPORT-009

Detect duplicate OEM numbers.

### Test IMPORT-010

Detect missing required fields.

### Test IMPORT-011

Validate supported brands.

### Test IMPORT-012

Validate supported categories.

### Test IMPORT-013

Validate price fields.

### Test IMPORT-014

Validate inventory fields.

### Test IMPORT-015

Validate vehicle references.

### Test IMPORT-016

Validate image URLs where applicable.

---

## 14. Import Workflow Tests

Recommended workflow:

Upload
   |
   v
Preview
   |
   v
Validate
   |
   v
Duplicate Detection
   |
   v
Admin Review
   |
   v
Commit
   |
   v
Audit Log

### Test IMPORT-FLOW-001

Verify preview mode does not modify production data.

### Test IMPORT-FLOW-002

Verify validation mode does not modify production data.

### Test IMPORT-FLOW-003

Verify duplicate detection occurs before commit.

### Test IMPORT-FLOW-004

Verify invalid rows are reported.

### Test IMPORT-FLOW-005

Verify valid rows are reported.

### Test IMPORT-FLOW-006

Verify commit modifies only approved valid records.

### Test IMPORT-FLOW-007

Verify an import commit creates an audit event.

Expected audit action:

IMPORT_COMMITTED

### Test IMPORT-FLOW-008

Verify failed imports do not partially corrupt catalog data.

---

## 15. Import Report Tests

Expected import summary fields may include:

- totalRows
- validRows
- invalidRows
- duplicateRows

### Test IMPORT-REPORT-001

Verify total row count.

### Test IMPORT-REPORT-002

Verify valid row count.

### Test IMPORT-REPORT-003

Verify invalid row count.

### Test IMPORT-REPORT-004

Verify duplicate row count.

### Test IMPORT-REPORT-005

Verify import errors identify the affected row where appropriate.

---

## 16. Bulk Operation Tests

Future bulk operations may include:

- bulk OEM update
- bulk price update
- bulk stock update
- bulk compatibility update
- bulk category update
- bulk image update
- bulk archive
- bulk export

### Test BULK-001

Verify only authorized administrators can start bulk operations.

### Test BULK-002

Verify large operations are safely processed.

### Test BULK-003

Verify failed records are reported.

### Test BULK-004

Verify successful records are reported.

### Test BULK-005

Verify bulk operations create appropriate audit records.

---

## 17. Export Tests

Endpoint:

POST /api/v1/admin/export

Supported formats:

- CSV
- XLSX
- JSON

### Test EXPORT-001

Export valid catalog data as CSV.

### Test EXPORT-002

Export valid catalog data as XLSX.

### Test EXPORT-003

Export valid catalog data as JSON.

### Test EXPORT-004

Verify includeArchived=false excludes archived records.

### Test EXPORT-005

Verify includeArchived=true requires appropriate permission.

### Test EXPORT-006

Verify unauthorized users cannot export protected data.

### Test EXPORT-007

Verify export action is audited.

Expected audit action:

EXPORT_CREATED

---

## 18. Audit Tests

Endpoint:

GET /api/v1/admin/audit

### Test AUDIT-001

Verify authorized administrators can retrieve audit records.

### Test AUDIT-002

Verify unauthorized users cannot retrieve audit records.

### Test AUDIT-003

Verify OEM creation is logged.

### Test AUDIT-004

Verify OEM update is logged.

### Test AUDIT-005

Verify OEM archive is logged.

### Test AUDIT-006

Verify stock changes are logged.

### Test AUDIT-007

Verify pricing changes are logged.

### Test AUDIT-008

Verify image changes are logged.

### Test AUDIT-009

Verify compatibility changes are logged.

### Test AUDIT-010

Verify imports are logged.

### Test AUDIT-011

Verify exports are logged.

### Test AUDIT-012

Verify authentication tokens and secrets are never stored in audit records.

---

## 19. Request ID Tests

### Test TRACE-001

Send a request with X-Request-ID.

Expected:

- same request ID is returned or correlated according to backend rules

### Test TRACE-002

Send a request without X-Request-ID.

Expected:

- backend generates a request ID

### Test TRACE-003

Verify request IDs appear in error responses.

### Test TRACE-004

Verify request IDs can be correlated with backend logs.

---

## 20. Error Handling Tests

### Test ERROR-001

Verify validation errors use the standard error structure.

### Test ERROR-002

Verify authentication errors use the standard error structure.

### Test ERROR-003

Verify authorization errors use the standard error structure.

### Test ERROR-004

Verify not-found errors use the standard error structure.

### Test ERROR-005

Verify duplicate errors use the standard error structure.

### Test ERROR-006

Verify server errors do not expose stack traces.

### Test ERROR-007

Verify database credentials are never exposed.

### Test ERROR-008

Verify SQL statements are never exposed.

### Test ERROR-009

Verify internal filesystem paths are not exposed.

---

## 21. Rate Limiting Tests

### Test RATE-001

Verify rate limits are applied to administrative endpoints.

### Test RATE-002

Verify excessive requests are rejected or delayed according to configured policy.

Expected:

- HTTP 429 where applicable

### Test RATE-003

Verify rate-limit responses do not expose sensitive infrastructure information.

---

## 22. CORS Tests

### Test CORS-001

Verify only configured origins are allowed.

### Test CORS-002

Verify unauthorized origins are rejected.

### Test CORS-003

Verify allowed HTTP methods.

### Test CORS-004

Verify allowed request headers.

### Test CORS-005

Verify credentials behavior matches production security requirements.

---

## 23. File Security Tests

### Test FILE-001

Verify uploaded files are treated as untrusted input.

### Test FILE-002

Verify MIME type validation.

### Test FILE-003

Verify extension validation.

### Test FILE-004

Verify file-size validation.

### Test FILE-005

Verify malformed files are rejected.

### Test FILE-006

Verify dangerous spreadsheet content is handled safely.

### Test FILE-007

Verify uploaded files cannot execute server-side code.

### Test FILE-008

Verify temporary uploaded files are safely handled and removed according to retention policy.

---

## 24. Database Security Tests

### Test DB-001

Verify public users cannot directly access the production database.

### Test DB-002

Verify Admin API uses controlled database access.

### Test DB-003

Verify database credentials are stored securely.

### Test DB-004

Verify SQL injection protections.

### Test DB-005

Verify database permissions follow least privilege.

### Test DB-006

Verify backups are configured before production deployment.

---

## 25. Public/Admin Boundary Tests

### Test BOUNDARY-001

Verify the public API cannot access private audit records.

### Test BOUNDARY-002

Verify the public API cannot access administrator IDs.

### Test BOUNDARY-003

Verify the public API cannot access internal supplier information.

### Test BOUNDARY-004

Verify the public API cannot access private cost prices.

### Test BOUNDARY-005

Verify the public website cannot directly call protected administrative operations.

### Test BOUNDARY-006

Verify Admin API permissions are independent from public API permissions.

---

## 26. Compatibility Verification Tests

### Test VERIFY-001

New compatibility records should start with an appropriate non-verified state.

### Test VERIFY-002

Only authorized verification users can mark compatibility as verified.

### Test VERIFY-003

Rejected compatibility remains clearly marked.

### Test VERIFY-004

Verification state changes are audited.

### Test VERIFY-005

Public responses must not present unverified compatibility as confirmed official fitment.

---

## 27. Security Tests

### Test SECURITY-001

Verify HTTPS is required in production.

### Test SECURITY-002

Verify secure token handling.

### Test SECURITY-003

Verify secrets are not stored in frontend code.

### Test SECURITY-004

Verify secrets are not stored in GitHub JSON files.

### Test SECURITY-005

Verify server-side validation.

### Test SECURITY-006

Verify request-size limits.

### Test SECURITY-007

Verify authentication brute-force protections where applicable.

### Test SECURITY-008

Verify CSRF protections where applicable.

### Test SECURITY-009

Verify secure CORS configuration.

### Test SECURITY-010

Verify sensitive information is not included in error messages.

---

## 28. Performance Tests

### Test PERF-001

Verify OEM list endpoint performs correctly with large datasets.

### Test PERF-002

Verify search performs correctly with thousands of OEM records.

### Test PERF-003

Verify pagination prevents unnecessarily large responses.

### Test PERF-004

Verify import processing remains stable with large files.

### Test PERF-005

Verify bulk operations do not block the API unnecessarily.

### Test PERF-006

Verify image operations do not unnecessarily load large image files into the API process.

---

## 29. Data Integrity Tests

### Test DATA-001

Verify OEM numbers remain unique where required.

### Test DATA-002

Verify record IDs remain unique.

### Test DATA-003

Verify archived records retain historical information.

### Test DATA-004

Verify inventory remains associated with the correct OEM.

### Test DATA-005

Verify pricing remains associated with the correct OEM.

### Test DATA-006

Verify images remain associated with the correct OEM.

### Test DATA-007

Verify compatibility remains associated with the correct OEM.

### Test DATA-008

Verify failed operations do not leave inconsistent partial records.

---

## 30. Production Readiness Checklist

Before production deployment:

- [ ] Authentication tested
- [ ] Authorization tested
- [ ] OEM CRUD operations tested
- [ ] Archive workflow tested
- [ ] Inventory tested
- [ ] Pricing tested
- [ ] Image management tested
- [ ] Compatibility tested
- [ ] Import preview tested
- [ ] Import validation tested
- [ ] Import commit tested
- [ ] Duplicate detection tested
- [ ] Bulk operations tested
- [ ] Export tested
- [ ] Audit logging tested
- [ ] Request IDs tested
- [ ] Error handling tested
- [ ] Rate limiting tested
- [ ] CORS tested
- [ ] File security tested
- [ ] Database security tested
- [ ] Public/Admin boundary tested
- [ ] Compatibility verification tested
- [ ] Performance tested
- [ ] Data integrity tested
- [ ] Backup strategy verified
- [ ] Secret management verified
- [ ] HTTPS verified
- [ ] Security testing completed

---

## 31. Test Status

Current status:

Planned test specification.

These tests define the expected behavior of the future production Admin API.

They should be executed against the actual backend implementation before production deployment.

---

## 32. Related Files

Admin API contract:

api/admin-api.yaml

Admin API guide:

api/admin-api-guide.md

Public API contract:

api/oem-public-api.yaml

Backend implementation plan:

docs/backend-implementation-plan.md
