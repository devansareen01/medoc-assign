# Medoc Backend API

A Node.js/Express backend for managing patients, diagnostic tests, and patient reports, with JWT authentication and role-based access control. Built with MongoDB and Mongoose.

---

## Features
- User authentication (doctor, lab assistant roles)
- Patient management
- Diagnostic test management
- Patient report management
- JWT-based access control
- Rate limiting on auth endpoints
- Pagination on list endpoints
- Swagger API documentation

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or remote)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in `medoc-assign/` with:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/medoc
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

### Running the Server
```bash
npm start    
```

Server runs on `http://localhost:3000` by default.

---

## API Documentation

### Production Server
- **Azure Server**: http://20.248.208.172:8001/api-docs
- **Base URL**: http://20.248.208.172:8001/api

### Local Development
- **Swagger UI**: http://localhost:3000/api-docs
- **Base URL**: http://localhost:3000/api

---

## Authentication
- Register and login to receive JWT access tokens.
- Use the access token in the `Authorization: Bearer <token>` header for protected endpoints.
- Refresh tokens are managed via HTTP-only cookies.

### Example: Register
```http
POST /api/auth/register
Content-Type: application/json
{
  "username": "doctor1",
  "password": "password123",
  "role": "doctor"
}
```

### Example: Login
```http
POST /api/auth/login
Content-Type: application/json
{
  "username": "doctor1",
  "password": "password123"
}
```
Response:
```json
{
  "accessToken": "...",
  "user": { "id": "...", "username": "doctor1", "role": "doctor" }
}
```

---

## Main Endpoints & Examples

### Patients
- **Add Patient** (doctor only):
  ```http
  POST /api/patients
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "name": "John Doe",
    "age": 30,
    "gender": "Male",
    "contact": "9876543210"
  }
  ```
- **Get Patient Reports** (paginated):
  ```http
  GET /api/patients/{id}/reports?page=1&limit=10
  Authorization: Bearer <token>
  ```
  Response:
  ```json
  {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "data": [ { ...reportObj... } ]
  }
  ```

### Diagnostic Tests
- **Add Test** (doctor only):
  ```http
  POST /api/diagnostic-tests
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "name": "Blood Test",
    "description": "Full blood count",
    "cost": 1500
  }
  ```
- **List Tests** (paginated):
  ```http
  GET /api/diagnostic-tests?page=1&limit=10
  Authorization: Bearer <token>
  ```
  Response:
  ```json
  {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "data": [ { ...testObj... } ]
  }
  ```

### Reports
- **Create Report** (lab assistant only):
  ```http
  POST /api/reports
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "patientId": "...",
    "testId": "...",
    "reportData": {
      "result": "Positive",
      "remarks": "Further investigation needed.",
      "testedAt": "2023-10-26T10:00:00Z"
    }
  }
  ```
- **Get Report by ID**:
  ```http
  GET /api/reports/{id}
  Authorization: Bearer <token>
  ```
- **Download Report as PDF**:
  ```http
  GET /api/reports/{id}/pdf
  Authorization: Bearer <token>
  ```

---

## Models Overview

### User
- `username` (string, unique)
- `password` (string, hashed)
- `role` (doctor | lab_assistant)

### Patient
- `name` (string)
- `age` (number)
- `gender` (Male | Female | Other)
- `contact` (10-digit string)

### DiagnosticTest
- `name` (string, unique)
- `description` (string)
- `cost` (number)

### PatientReport
- `patientId` (ref: Patient)
- `testId` (ref: DiagnosticTest)
- `reportData.result` (string)
- `reportData.remarks` (string)
- `reportData.testedAt` (date)

---

## Notes
- All endpoints (except `/auth/*`) require a valid JWT access token.
- Use `/api-docs` for full interactive API docs (Swagger UI).
- Rate limiting is applied to `/auth/login` and `/auth/register`.
- Pagination is available on list endpoints via `?page` and `?limit`.

---

## Deployment

### Azure Server
The application is deployed on Azure at:
- **Server URL**: http://20.248.208.172:8001
- **API Base URL**: http://20.248.208.172:8001/api
- **Swagger Documentation**: http://20.248.208.172:8001/api-docs

### Environment Setup
For production deployment, ensure the following environment variables are configured:
- `PORT=8001`
- `MONGO_URI` (your production MongoDB connection string)
- `JWT_SECRET` (secure JWT secret)
- `REFRESH_SECRET` (secure refresh token secret)
- `NODE_ENV=production`

---

## Tech Notes & Implementation Details

### Custom asyncHandler Middleware
- All async route handlers are wrapped with a custom `asyncHandler` to catch errors and pass them to the error handler, avoiding repetitive try/catch blocks.

### Centralized Error Handling
- All errors are handled by a custom `errorHandler` middleware, which formats and sends error responses in a consistent way.

### Request Validation
- Uses `express-validator` to validate and sanitize incoming request data for all endpoints (e.g., registration, login, patient creation).
- Validation errors are returned with clear messages and status 400.

### Refresh Access Token Flow
- After login, a refresh token is set as an HTTP-only cookie.
- To get a new access token, call `POST /api/auth/refresh-token` (cookie must be present).
- If the refresh token is valid and not expired, a new access token is returned.
- **Access token expiration:** 15 minutes (default)
- **Refresh token expiration:** 7 days (default)
- Logout (`POST /api/auth/logout`) clears the refresh token cookie and invalidates it server-side.

---

## License
MIT 