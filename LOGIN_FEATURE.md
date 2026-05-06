# Login Feature Documentation

## Overview
The login feature has been implemented with JWT (JSON Web Token) authentication for the HR application.

## API Endpoints

### 1. Register User
**Endpoint:** `POST /api/users/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "id": 1
}
```

---

### 2. Login
**Endpoint:** `POST /api/users/login`

**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. Get Users (Protected)
**Endpoint:** `GET /api/users/`

**Description:** Get all users (requires authentication)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
[
  [1, "John Doe", "john@example.com", "employee"],
  [2, "Jane Smith", "jane@example.com", "manager"]
]
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "No token provided"
}
```

---

## Features

✅ **Password Hashing:** Passwords are hashed using bcrypt before storage  
✅ **JWT Token:** Secure token-based authentication  
✅ **Token Expiration:** Tokens expire in 24 hours  
✅ **Email Validation:** Email uniqueness should be enforced at database level  
✅ **Protected Routes:** Authentication middleware protects sensitive endpoints  

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd apps/api
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` (in project root)
   - Update with your database and JWT secret:
   ```
   DB_USER=your_oracle_user
   DB_PASSWORD=your_oracle_password
   DB_CONNECT_STRING=localhost:1521/XE
   JWT_SECRET=your_super_secret_key
   ```

3. **Run the Server:**
   ```bash
   npm run dev        # Development mode with nodemon
   npm start          # Production mode
   ```

## Security Recommendations

1. **Use HTTPS:** Always use HTTPS in production
2. **Strong JWT Secret:** Use a strong, random JWT_SECRET key (min 32 characters)
3. **Database Constraints:** Add unique constraint on email column:
   ```sql
   ALTER TABLE users ADD CONSTRAINT uk_email UNIQUE (email);
   ```
4. **Password Requirements:** Implement password strength validation
5. **Rate Limiting:** Consider adding rate limiting to login endpoint
6. **Token Refresh:** Implement refresh tokens for better security

## File Structure
```
src/
├── middleware/
│   └── authMiddleware.js    (New - JWT verification middleware)
├── routes/
│   └── Users.js             (Updated - added login and register endpoints)
└── config/
    └── db.js
```

## Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","role":"employee"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

**Get Users (with token):**
```bash
curl -X GET http://localhost:3000/api/users/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
