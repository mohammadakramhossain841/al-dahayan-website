# Al-Dahayan Backend Implementation Plan

## 1. Purpose

This document defines the planned backend implementation for the
Al-Dahayan Trading Company website.

The backend will eventually connect:

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

and:

Admin Panel
    |
    v
Protected Admin API
    |
    v
Backend Services
    |
    v
Production Database

The current GitHub project is a frontend and architecture foundation.
A production backend is not yet deployed.

---

## 2. Backend Responsibilities

The backend will eventually manage:

- OEM catalog
- Vehicle data
- Compatibility
- Inventory
- Pricing
- Images
- Customer inquiries
- Admin users
- Permissions
- Import/export
- Audit history
- API security
- Request tracing
- API rate limiting

---

## 3. Recommended Service Structure

backend/
|
├── config/
│   ├── environment
│   ├── database
│   └── security
│
├── routes/
│   ├── public/
│   └── admin/
│
├── controllers/
│   ├── oem
│   ├── vehicle
│   ├── inventory
│   ├── pricing
│   ├── compatibility
│   ├── inquiry
│   ├── import
│   └── export
│
├── services/
│   ├── oem-service
│   ├── inventory-service
│   ├── pricing-service
│   ├── compatibility-service
│   ├── image-service
│   ├── import-service
│   ├── export-service
│   └── audit-service
│
├── middleware/
│   ├── authentication
│   ├── authorization
│   ├── validation
│   ├── rate-limit
│   ├── cors
│   └── request-id
│
├── models/
│   ├── oem
│   ├── vehicle
│   ├── inventory
│   ├── pricing
│   ├── compatibility
│   ├── inquiry
│   ├── admin
│   └── audit
│
└── tests/

The exact programming language and framework can be selected during backend
implementation.

---

## 4. Database Architecture

The production database should contain separate logical entities for:

- OEM
- Vehicle
- Model
- Compatibility
- Inventory
- Location
- Pricing
- Image
- Inquiry
- Admin User
- Role
- Permission
- Audit Log
- Import Job
- Export Job

The database should avoid storing the entire catalog as one large JSON object.

---

## 5. OEM Entity

The OEM entity should contain:

- id
- oemNumber
- partName
- brand
- category
- description
- status
- verificationStatus
- createdAt
- updatedAt

The OEM number should have an appropriate uniqueness constraint according to
the final catalog rules.

---

## 6. Inventory Entity

Inventory should remain separate from OEM identity.

Example:

- id
- oemId
- locationId
- stockStatus
- quantity
- reorderLevel
- updatedAt

This allows one OEM to eventually exist in multiple warehouse or branch
locations.

---

## 7. Pricing Entity

Pricing should be separated from the basic OEM record.

Example:

- id
- oemId
- regularPrice
- salePrice
- currency
- discountPercent
- visibility
- updatedAt

This allows future pricing changes without rewriting the core OEM record.

---

## 8. Image Entity

Images should be stored separately from the OEM record.

Example:

- id
- oemId
- imageUrl
- storagePath
- altText
- isPrimary
- sortOrder
- createdAt

Actual image files should be stored in appropriate file/object storage rather
than directly inside the relational database where practical.

---

## 9. Compatibility Entity

Compatibility should connect parts with vehicles.

Example:

- id
- oemId
- vehicleId
- modelYearFrom
- modelYearTo
- engineCode
- verificationStatus
- verifiedBy
- verifiedAt

Compatibility must not automatically be treated as verified simply because a
record exists.

---

## 10. Inquiry Entity

Customer inquiries may contain:

- id
- customerName
- phone
- email
- oemNumber
- partName
- quantity
- vehicleMake
- vehicleModel
- vehicleYear
- engine
- vin
- message
- status
- createdAt
- updatedAt

Sensitive customer information must be protected.

---

## 11. Admin Authentication

Production Admin API authentication should be handled by the backend.

The system should support:

Admin Login
    |
    v
Authentication
    |
    v
Access Token / Session
    |
    v
Permission Check
    |
    v
Admin API

Credentials must never be stored in the public frontend repository.

---

## 12. Role-Based Access

The backend should enforce permissions server-side.

Recommended roles:

- Super Admin
- Catalog Admin
- Inventory Admin
- Pricing Admin
- Media Admin
- Verification Admin
- Viewer

A user may have one or more permissions depending on the final
implementation.

---

## 13. Public API

The public API should expose only information intended for customers.

Examples:

GET /api/v1/oem/catalog
GET /api/v1/oem/record
GET /api/v1/oem/search
GET /api/v1/oem/vehicles
GET /api/v1/oem/compatibility
GET /api/v1/oem/availability
POST /api/v1/oem/inquiry

Private administrative information must not be included.

---

## 14. Admin API

The protected Admin API will manage:

- OEM CRUD
- Inventory
- Pricing
- Images
- Compatibility
- Import
- Export
- Archive
- Audit

The contract is documented in:

api/admin-api.yaml

---

## 15. Import Architecture

The planned import pipeline is:

Excel / CSV / JSON
        |
        v
File Upload
        |
        v
Preview
        |
        v
Schema Validation
        |
        v
Field Validation
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
Database
        |
        v
Audit Log

The system should support safe recovery if an import fails.

---

## 16. Bulk Operations

Bulk operations may eventually support:

- Bulk OEM update
- Bulk price update
- Bulk stock update
- Bulk compatibility update
- Bulk category update
- Bulk image update
- Bulk archive
- Bulk export

Large operations should preferably be processed as background jobs rather than
blocking a normal HTTP request.

---

## 17. Image Processing

The production image pipeline may be:

Admin Upload
     |
     v
File Validation
     |
     v
Image Processing
     |
     v
Storage
     |
     v
Image URL
     |
     v
Database

The system should generate suitable image sizes for the public website where
appropriate.

---

## 18. Search Architecture

The initial backend search can use database indexes.

Search fields may include:

- OEM number
- Part name
- Brand
- Category
- Vehicle
- Model
- Alias

As catalog size grows, a dedicated search engine can be considered if
database search performance becomes insufficient.

---

## 19. VIN Architecture

VIN functionality should remain separated from the OEM catalog.

The planned flow is:

VIN
 |
 v
VIN Validation
 |
 v
Vehicle Identification
 |
 v
Vehicle Record
 |
 v
Compatibility Lookup
 |
 v
Compatible OEM Parts

A production VIN decoder should only be integrated when a reliable data source
or service is selected.

---

## 20. Caching

Public catalog responses may be cached.

Potential cache targets:

- OEM search
- Vehicle lists
- Category lists
- Public catalog
- Compatibility lookups
- Availability responses

Administrative data changes should invalidate affected cache entries where
necessary.

---

## 21. Security Layers

Production backend should implement:

- HTTPS
- Authentication
- Authorization
- Input Validation
- Rate Limiting
- CORS
- Request Size Limits
- Secure File Upload
- Database Access Control
- Audit Logging
- Secret Management
- Monitoring

Security controls must be implemented server-side.

---

## 22. Environment Configuration

Production secrets should be supplied through environment or secret-management
systems.

Examples of configuration names:

DATABASE_URL
AUTH_SECRET
API_SECRET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY

These are configuration names only.

Real credentials must never be committed to GitHub.

---

## 23. Development Environments

The backend should eventually support separate environments:

Development
     |
     v
Staging
     |
     v
Production

Production data should not be used directly for development testing.

---

## 24. Logging

Backend logs should support:

- requestId
- timestamp
- HTTP method
- route
- status
- response time
- service
- error code

Logs must not expose passwords, tokens, or other sensitive credentials.

---

## 25. Monitoring

Production monitoring should track:

- API availability
- Response time
- Error rate
- Database health
- Import failures
- Export failures
- Authentication failures
- Rate-limit events
- Storage failures

Alerts can be added after the backend infrastructure is selected.

---

## 26. Backup and Recovery

Production database backups should be configured before the catalog becomes
business-critical.

The recovery plan should cover:

- Database failure
- Accidental catalog changes
- Failed import
- Image storage failure
- Application failure

Import operations should preferably support rollback or recovery procedures.

---

## 27. Deployment Flow

Recommended deployment flow:

Local Development
       |
       v
Automated Tests
       |
       v
Staging
       |
       v
Staging Validation
       |
       v
Production Deployment

The exact hosting provider can be selected later.

---

## 28. Current Project Boundary

Current repository contains:

- Frontend
- Data Foundation
- Admin UI Foundation
- API Contracts
- Documentation
- Tests

Future backend will contain:

- Authentication
- API Runtime
- Database
- Storage
- Background Jobs
- Monitoring
- Production Security

The current static GitHub website must not be presented as a production
database-backed system until these backend services are implemented.

---

## 29. Implementation Order

Recommended backend implementation order:

1. Backend project setup
2. Environment configuration
3. Database connection
4. Database migrations/schema
5. Authentication
6. Authorization
7. OEM service
8. Vehicle service
9. Compatibility service
10. Inventory service
11. Pricing service
12. Image service
13. Import service
14. Export service
15. Inquiry service
16. Public API
17. Admin API
18. Audit logging
19. Rate limiting
20. Monitoring
21. Automated tests
22. Staging deployment
23. Production deployment

---

## 30. Final Architecture

                    ┌──────────────────┐
                    │   Main Website   │
                    └────────┬─────────┘
                             │
                             v
                    ┌──────────────────┐
                    │    Public API    │
                    └────────┬─────────┘
                             │
                             v
┌──────────────┐     ┌──────────────────┐
│ Admin Panel  │────>│    Admin API     │
└──────────────┘     └────────┬─────────┘
                              │
                              v
                    ┌──────────────────┐
                    │ Backend Services │
                    └────────┬─────────┘
                             │
             ┌───────────────┼───────────────┐
             v               v               v
       ┌──────────┐    ┌───────────┐   ┌───────────┐
       │ Database │    │   Images  │   │   Jobs    │
       └──────────┘    └───────────┘   └───────────┘

This architecture is designed to support the catalog growing from hundreds
of OEM records to thousands or more without moving catalog management into
hard-coded frontend files.
