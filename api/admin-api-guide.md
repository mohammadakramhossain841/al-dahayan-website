# Al-Dahayan Admin API Guide

## 1. Purpose

The Admin API is the protected backend interface used by the Al-Dahayan
Admin Panel to manage the Toyota and Lexus OEM catalog.

It is designed for:

- OEM record management
- OEM import and validation
- Bulk catalog operations
- Inventory management
- Pricing management
- Image management
- Vehicle compatibility management
- Archive and status management
- Catalog export
- Administrative audit logging

This document describes the API contract and integration rules.

The API contract is defined in:

`api/admin-api.yaml`

---

## 2. Architecture

The intended production architecture is:

```text
Admin Panel
    |
    v
Authentication
    |
    v
Admin API
    |
    +-------------------+
    |                   |
    v                   v
Database           File/Image Storage
    |
    v
OEM Catalog
Inventory
Pricing
Compatibility
Audit History
