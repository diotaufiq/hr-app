# Employees Feature Documentation

## Overview
API endpoints to manage employee records. The `employees` table stores HR-related metadata for users (position, department, status, join date).

## Database Schema (observed)

Table: `employees`

| Column Name | Type | Notes |
| --- | --- | --- |
| `ID` | NUMBER | Primary key |
| `USER_ID` | NUMBER | References `users.id` (optional foreign key) |
| `POSITION` | VARCHAR2(100) | Optional |
| `DEPARTMENT` | VARCHAR2(100) | Optional |
| `STATUS` | VARCHAR2(20) | Optional (e.g., active/inactive) |
| `JOIN_DATE` | DATE | Optional |

> The above column names match the existing database screenshot. Adjust SQL if your actual schema differs.

## API Endpoints

All endpoints are protected by JWT. Include header:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### GET /api/employees
Return all employee records.

Response (200):

```json
[
  [1, 10, "Developer", "R&D", "active", "2024-01-10T00:00:00.000Z"]
]
```

### GET /api/employees/:id
Return a single employee by `id`.

Response (200):

```json
[1, 10, "Developer", "R&D", "active", "2024-01-10T00:00:00.000Z"]
```

### POST /api/employees
Create a new employee record.

Request body (JSON):

```json
{
  "user_id": 10,
  "position": "Developer",
  "department": "R&D",
  "status": "active",
  "join_date": "2024-01-10"
}
```

Response (201):

```json
{
  "message": "Employee created",
  "id": 1
}
```

### PUT /api/employees/:id
Update an employee record. Only provided fields will be updated.

Request body (JSON):

```json
{
  "position": "Senior Developer",
  "status": "active"
}
```

Response (200):

```json
{
  "message": "Employee updated"
}
```

## Usage Notes

- `user_id` and `join_date` are required when creating a record in the router implementation; modify validation if your rules differ.
- `join_date` accepts ISO date strings like `2024-01-10` or full timestamps.
- The router uses `RETURNING id INTO :id` on insert; ensure `employees` has auto-id (identity or sequence + trigger). If not present, either add a sequence/trigger or supply `ID` explicitly in the request.

## Example cURL

Create employee:

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":10,"position":"Developer","department":"R&D","status":"active","join_date":"2024-01-10"}'
```

Get employee list:

```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Update employee:

```bash
curl -X PUT http://localhost:5000/api/employees/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position":"Senior Developer"}'
```

## Next steps (optional)

- Add `apps/api/scripts/migration-employees.js` to create the `employees` table and ID sequence/trigger if needed.
- Add Postman collection with Authorization variable for easy testing.
