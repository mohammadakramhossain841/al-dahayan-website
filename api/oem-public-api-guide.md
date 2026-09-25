# Al-Dahayan Public OEM API Guide

## Overview

The Al-Dahayan Public OEM API provides a structured interface for Toyota and Lexus spare-parts catalog data.

The API is designed for:

- OEM number search
- Spare-parts catalog browsing
- Vehicle compatibility
- Vehicle-based part discovery
- Public stock availability
- Customer spare-parts inquiries

The API is read-focused for public catalog data.

Administrative operations are not exposed through the public API.

---

## API Version

Current version:

`v1`

Base path:

`/api/v1`

OpenAPI contract:

`api/oem-public-api.yaml`

---

## Public Endpoints

### Catalog

```text
GET /api/v1/oem/catalog
