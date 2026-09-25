# Al-Dahayan Admin API Guide

## 1. Purpose

The Admin API is the protected backend interface used by the Al-Dahayan Trading Company Admin Panel.

It manages:

- OEM catalog records
- Vehicle compatibility
- Inventory
- Pricing
- Images
- Import and validation
- Export
- Archive and status management
- Administrative audit history

The API contract is defined in:

api/admin-api.yaml

This document describes the intended integration and security model.

---

## 2. Architecture

The intended production architecture is:

Main Website
      |
      v
Public API
      |
      v
Backend Services
      |
      v
Production Database

Administrative architecture:

Admin Panel
      |
      v
Authentication
      |
      v
Protected Admin API
      |
      v
Backend Services
      |
      +------------------+
      |                  |
      v                  v
Production Database   File/Image Storage

The public website must not directly access protected Admin API endpoints.

---

## 3. Base URL

The current OpenAPI contract uses:

/api/v1/admin

Example production structure:

https://api.example.com/api/v1/admin

The final production domain will be selected when the backend is deployed.

---

## 4. Authentication

The Admin API requires authentication.

The current contract uses Bearer authentication:

Authorization: Bearer <access-token>

Production credentials and tokens must never be:

- hard-coded in frontend JavaScript
- committed to GitHub
- stored in public JSON files
- placed inside HTML
- shared in screenshots

---

## 5. Authorization

Authentication does not automatically provide every administrative permission.

The production backend should enforce role-based authorization.

Recommended roles:

| Role | Main permissions |
|---|---|
| Super Admin | Full administration |
| Catalog Admin | OEM/catalog management |
| Inventory Admin | Stock management |
| Pricing Admin | Pricing management |
| Media Admin | Image management |
| Verification Admin | Compatibility verification |
| Viewer | Read-only access |

Authorization must be enforced server-side.

Frontend permission checks are only interface controls and must not be treated as security controls.

---

## 6. OEM Management

### 6.1 List OEM Records

GET /api/v1/admin/oem

Optional parameters:

- page
- pageSize
- search

Example:

GET /api/v1/admin/oem?page=1&pageSize=25&search=12261

Expected response:

- HTTP 200
- success flag
- OEM records
- pagination
- request ID

### 6.2 Create OEM Record

POST /api/v1/admin/oem

Example request:

{
  "oemNumber": "12261-54130",
  "partName": "Engine Component",
  "brand": "Toyota",
  "category": "Engine"
}

The backend should validate:

- OEM number
- required fields
- duplicate OEM records
- supported brand
- category
- permissions

### 6.3 Update OEM Record

PATCH /api/v1/admin/oem/{oemId}

Only submitted fields should be changed.

### 6.4 Archive OEM Record

POST /api/v1/admin/oem/{oemId}/archive

Archive should normally be preferred over permanent deletion.

Archived records may remain available for:

- audit history
- reporting
- restoration
- historical references

---

## 7. Inventory Management

Inventory is maintained separately from the OEM catalog.

Endpoint:

PATCH /api/v1/admin/inventory/{oemId}

Example:

{
  "stockStatus": "in_stock",
  "quantity": 25,
  "reorderLevel": 5
}

Recommended stock states:

- in_stock
- low_stock
- out_of_stock
- on_order
- discontinued
- unknown

The backend should validate inventory status and quantity according to the production inventory rules.

---

## 8. Pricing Management

Endpoint:

PATCH /api/v1/admin/pricing/{oemId}

Example:

{
  "regularPrice": 250,
  "salePrice": 225,
  "currency": "SAR",
  "discountPercent": 10
}

The backend should validate:

- price is not negative
- sale price is valid
- currency is supported
- discount calculation
- pricing permissions

---

## 9. Image Management

Endpoint:

POST /api/v1/admin/images/{oemId}

Example:

{
  "imageUrl": "https://cdn.example.com/oem/12261-54130.jpg",
  "altText": "Toyota spare part",
  "isPrimary": true
}

Production image storage should preferably be separate from the database.

The database should store:

- image URL
- storage path
- image type
- alt text
- primary image status
- upload metadata

---

## 10. Compatibility Management

Endpoint:

PUT /api/v1/admin/compatibility/{oemId}

Example:

{
  "vehicles": [
    {
      "make": "Toyota",
      "model": "Land Cruiser",
      "modelYear": 2024,
      "engineCode": "1GR-FE"
    }
  ]
}

Recommended verification states:

- unverified
- pending
- verified
- rejected

The system must not automatically mark compatibility as verified simply because an administrator entered a compatibility record.

---

## 11. OEM Import

The Admin API is designed to support future Excel/CSV catalog management.

Endpoint:

POST /api/v1/admin/import

Supported formats:

- CSV
- XLSX
- JSON

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

Supported import modes:

- preview
- validate
- commit

Production systems should avoid automatically committing unreviewed catalog data when approval is required.

---

## 12. Import Validation

The import service should validate:

- required fields
- OEM number format
- duplicate OEM numbers
- duplicate record IDs
- supported brands
- valid categories
- valid prices
- valid stock values
- valid vehicle references
- valid image URLs
- missing required fields
- supported file types

Import results should provide:

- totalRows
- validRows
- invalidRows
- duplicateRows

---

## 13. Bulk Operations

Future backend implementation may support:

- bulk OEM update
- bulk price update
- bulk stock update
- bulk compatibility update
- bulk category update
- bulk image update
- bulk archive
- bulk export

Large operations should preferably be processed as background jobs.

---

## 14. Export

Endpoint:

POST /api/v1/admin/export

Supported formats:

- CSV
- XLSX
- JSON

Example:

{
  "format": "xlsx",
  "includeArchived": false
}

Exports must respect administrator permissions.

---

## 15. Audit Logging

Endpoint:

GET /api/v1/admin/audit

Administrative actions should be logged.

Examples:

- OEM_CREATED
- OEM_UPDATED
- OEM_ARCHIVED
- PRICE_UPDATED
- STOCK_UPDATED
- IMAGE_ADDED
- COMPATIBILITY_UPDATED
- IMPORT_STARTED
- IMPORT_COMMITTED
- EXPORT_CREATED

Recommended audit fields:

- action
- resource
- resourceId
- adminId
- timestamp
- requestId

Authentication secrets and tokens must never be stored in audit logs.

---

## 16. Request IDs

Each Admin API request should have a unique request ID.

Example:

X-Request-ID: req_01HXYZ...

Request IDs help with:

- debugging
- support
- audit tracing
- incident investigation
- backend log correlation

If the client does not provide a request ID, the backend should generate one.

---

## 17. Error Handling

Errors should use a consistent structure.

Example:

{
  "success": false,
  "errorCode": "OEM_DUPLICATE",
  "message": "An OEM record with this number already exists.",
  "requestId": "req_123456"
}

Error responses must not expose:

- database credentials
- internal server paths
- stack traces
- SQL statements
- authentication secrets
- infrastructure configuration

---

## 18. Security Requirements

Production implementation should include:

- HTTPS
- secure authentication
- role-based authorization
- server-side validation
- rate limiting
- request size limits
- input sanitization
- audit logging
- secure session/token handling
- CORS restrictions
- CSRF protection where applicable
- secure file upload validation
- malware scanning where applicable
- database access controls
- secret management

---

## 19. File Import Security

Uploaded Excel, CSV and JSON files must be treated as untrusted input.

The backend should validate:

- file extension
- MIME type
- file size
- file structure
- row count
- field types
- spreadsheet formulas or dangerous content
- duplicate records
- malformed data

Uploaded files should be processed in a controlled backend environment.

---

## 20. Image Upload Security

Production image uploads should validate:

- file type
- file size
- filename
- image dimensions
- actual file content
- storage destination

User-controlled filenames must not be used directly as filesystem paths.

---

## 21. Public vs Admin API Boundary

Public architecture:

Public Website
      |
      v
Public API
      |
      v
Public Catalog Data

Administrative architecture:

Admin Panel
      |
      v
Protected Admin API
      |
      v
Private Management Data

The Admin API must not expose private administrative information to the public website.

Private information may include:

- administrator IDs
- audit records
- internal notes
- import history
- internal supplier information
- private stock locations
- private cost prices
- administrative permissions

---

## 22. Production Database Boundary

The current GitHub JSON files are foundation/demo data.

Production implementation should eventually use:

Admin Panel
    |
    v
Admin API
    |
    v
Backend Services
    |
    v
Production Database

The frontend should not treat static JSON files as the final production database.

---

## 23. Compatibility Data Safety

OEM compatibility information should be verified before being presented as official fitment information.

The system should distinguish:

- reference
- unverified
- pending verification
- verified
- rejected

Authorized administrators should be able to update the verification state.

---

## 24. API Versioning

The current API contract uses:

v1

Example:

/api/v1/admin/oem

Breaking API changes should use a new version rather than silently changing the existing contract.

---

## 25. Production Data Flow

Admin Login
    |
    v
Permission Check
    |
    v
Admin Dashboard
    |
    +--> OEM Management
    |
    +--> Excel/CSV Import
    |
    +--> Preview
    |
    +--> Validation
    |
    +--> Duplicate Detection
    |
    +--> Commit
    |
    +--> Inventory
    |
    +--> Pricing
    |
    +--> Images
    |
    +--> Compatibility
    |
    +--> Archive
    |
    +--> Export
    |
    +--> Audit History

---

## 26. Current Implementation Status

The following files define the current Admin API foundation:

api/admin-api.yaml
api/admin-api-guide.md
tests/admin-api-tests.md

These files define the planned contract and integration requirements.

They do not mean that a production backend is currently running.

---

## 27. Future Backend Flow

Admin Panel
      |
      v
Authentication
      |
      v
Protected Admin API
      |
      v
Backend Services
      |
      +-------------------+
      |                   |
      v                   v
Production Database   File/Image Storage

---

## 28. Related Files

Admin API contract:

api/admin-api.yaml

Admin API tests:

tests/admin-api-tests.md

Public API contract:

api/oem-public-api.yaml

Public API guide:

api/oem-public-api-guide.md

Backend implementation plan:

docs/backend-implementation-plan.md

---

## 29. Implementation Principle

The Admin API is designed as a backend contract first.

The frontend Admin Panel should communicate with the Admin API rather than directly modifying production database records.

The production implementation should maintain a clear separation between:

- public website
- public API
- admin panel
- protected admin API
- backend services
- production database
- image/file storage
- audit system

This separation allows the system to scale from the current GitHub foundation to a production-ready Toyota and Lexus spare-parts management platform.

---

## 30. Final Production Checklist

Before production deployment, verify:

- [ ] HTTPS enabled
- [ ] Authentication implemented
- [ ] Role-based authorization implemented
- [ ] Admin API protected
- [ ] Server-side validation enabled
- [ ] Rate limiting enabled
- [ ] CORS restricted
- [ ] File upload validation enabled
- [ ] Image upload validation enabled
- [ ] Audit logging enabled
- [ ] Request IDs enabled
- [ ] Production database connected
- [ ] Secure secret management configured
- [ ] Backup strategy configured
- [ ] Error handling verified
- [ ] Import validation tested
- [ ] Export permissions tested
- [ ] Compatibility verification workflow tested
- [ ] Public/Admin API separation verified
- [ ] Security testing completed

---

## Status

This document defines the planned Admin API integration, security boundary, and backend workflow for the Al-Dahayan Trading Company website.

Production backend implementation will be completed separately from the current static GitHub foundation.
