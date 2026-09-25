# Al-Dahayan Public OEM API Tests

## 1. Catalog

### Test 1.1 — Basic catalog request

Request:

GET /api/v1/oem/catalog

Expected:

- HTTP 200
- `success` is true
- `data` is an array
- `pagination` is present
- `requestId` is present

---

### Test 1.2 — Pagination

Request:

GET /api/v1/oem/catalog?page=2&pageSize=24

Expected:

- HTTP 200
- Current page is 2
- Page size is 24
- Pagination values are valid

---

### Test 1.3 — Maximum page size

Request:

GET /api/v1/oem/catalog?page=1&pageSize=96

Expected:

- HTTP 200
- Page size is 96 or fewer records returned
- No server error

---

### Test 1.4 — Invalid page

Request:

GET /api/v1/oem/catalog?page=0

Expected:

- HTTP 400
- Error code indicates invalid page
- Internal server information is not exposed

---

## 2. OEM Record

### Test 2.1 — Existing OEM

Request:

GET /api/v1/oem/record?oemNumber=VALID_OEM

Expected:

- HTTP 200
- OEM number is returned
- Part information is returned
- Internal fields are excluded

---

### Test 2.2 — Missing OEM

Request:

GET /api/v1/oem/record?oemNumber=UNKNOWN_OEM

Expected:

- HTTP 404
- Error code indicates record not found
- No database information is exposed

---

### Test 2.3 — Missing parameter

Request:

GET /api/v1/oem/record

Expected:

- HTTP 400
- Safe validation error is returned

---

## 3. Search

### Test 3.1 — Text search

Request:

GET /api/v1/oem/search?q=brake

Expected:

- HTTP 200
- Matching records are returned
- Pagination is present

---

### Test 3.2 — OEM search

Request:

GET /api/v1/oem/search?oemNumber=VALID_OEM

Expected:

- HTTP 200 when matching
- Correct OEM records are returned

---

### Test 3.3 — Combined filters

Request:

GET /api/v1/oem/search?brand=Toyota&model=Camry

Expected:

- HTTP 200
- Results match requested filters

---

## 4. Vehicle

### Test 4.1 — Vehicle lookup

Request:

GET /api/v1/oem/vehicles?brand=Toyota&model=Camry

Expected:

- HTTP 200
- Vehicle records are returned
- Only public vehicle information is exposed

---

## 5. Compatibility

### Test 5.1 — Compatibility lookup

Request:

GET /api/v1/oem/compatibility?oemNumber=VALID_OEM&brand=Toyota

Expected:

- HTTP 200
- Compatibility result is present
- Vehicle information is returned only when available

---

### Test 5.2 — Invalid compatibility request

Request:

GET /api/v1/oem/compatibility

Expected:

- HTTP 400
- Safe validation error is returned

---

## 6. Availability

### Test 6.1 — Stock lookup

Request:

GET /api/v1/oem/availability?oemNumber=VALID_OEM

Expected:

- HTTP 200
- Public stock status is returned
- Private warehouse location is not returned

---

## 7. Inquiry

### Test 7.1 — Valid inquiry

Request:

POST /api/v1/oem/inquiry

Body:

```json
{
  "name": "Test Customer",
  "phone": "0500000000",
  "message": "I need this spare part."
}
