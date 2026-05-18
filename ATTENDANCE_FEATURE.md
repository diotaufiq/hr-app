# attendance Feature Documentation

## Overview
The attendance feature provides API endpoints to record, view, and update employee attendance data in the Oracle database.

## Database Schema

### Table: `attendance`

| Column | Type | Constraint |
| --- | --- | --- |
| `id` | `NUMBER` | Primary key, identity |
| `employee_id` | `NUMBER` | Not null |
| `check_in` | `TIMESTAMP` | Nullable |
| `check_out` | `TIMESTAMP` | Nullable |
| `date_attendace` | `DATE` | Not null |
| `created_at` | `TIMESTAMP` | Default `CURRENT_TIMESTAMP` |

## API Endpoints

### 1. Get All Attendance Records
**Endpoint:** `GET /api/attendance`

**Description:** Get all attendance rows, sorted from newest to oldest.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
[
  [1, 101, "2026-05-11T08:00:00.000Z", "2026-05-11T17:00:00.000Z", "2026-05-11T00:00:00.000Z", "2026-05-11T09:00:00.000Z"]
]
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "No token provided"
}
```

---

### 2. Create attendance
**Endpoint:** `POST /api/attendance`

**Description:** Insert a new attendance record.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "employee_id": 101,
  "check_in": "2026-05-11T08:00:00.000Z",
  "check_out": "2026-05-11T17:00:00.000Z",
  "date_attendace": "2026-05-11"
}
```

**Response (201 Created):**
```json
{
  "message": "attendance created successfully",
  "id": 1
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "employee_id and date_attendace are required"
}
```

---

### 3. Update attendance
**Endpoint:** `PUT /api/attendance/:id`

**Description:** Update an attendance record by id.

**Headers:**
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "employee_id": 101,
  "check_in": "2026-05-11T08:15:00.000Z",
  "check_out": "2026-05-11T17:15:00.000Z",
  "date_attendace": "2026-05-11"
}
```

**Response (200 OK):**
```json
{
  "message": "attendance updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "attendance not found"
}
```

---

## Setup Instructions

1. **Create the table:**
   ```bash
   cd apps/api
   node scripts/migration-attendance.js
   ```

2. **Run the API server:**
   ```bash
   npm run dev
   ```

3. **Use a valid JWT token** for every attendance request because the route is protected by authentication.

## Testing with cURL

**Get attendance:**
```bash
curl -X GET http://localhost:3000/api/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create attendance:**
```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"employee_id":101,"check_in":"2026-05-11T08:00:00.000Z","check_out":"2026-05-11T17:00:00.000Z","date_attendace":"2026-05-11"}'
```

**Update attendance:**
```bash
curl -X PUT http://localhost:3000/api/attendance/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"employee_id":101,"check_in":"2026-05-11T08:15:00.000Z","check_out":"2026-05-11T17:15:00.000Z","date_attendace":"2026-05-11"}'
```

## Notes

- Field name `date_attendace` follows the current database and API implementation.
- `check_in` and `check_out` are optional in the request body.
- `employee_id` and `date_attendace` are required when creating attendance.