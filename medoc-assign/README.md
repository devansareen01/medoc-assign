# Medoc Backend API

A Node.js/Express backend for managing patients, diagnostic tests, and patient reports, with JWT authentication and role-based access control. Built with MongoDB and Mongoose.

---

## 🌐 Live Server

**Production Server**: http://20.248.208.172:8001

### API Endpoints
- **Base URL**: http://20.248.208.172:8001/api
- **Swagger Documentation**: http://20.248.208.172:8001/api-docs
- **Health Check**: http://20.248.208.172:8001/health

---

## Features
- ✅ User authentication (doctor, lab assistant roles)
- ✅ Patient management
- ✅ Diagnostic test management
- ✅ Patient report management
- ✅ JWT-based access control
- ✅ Rate limiting on auth endpoints
- ✅ Pagination on list endpoints
- ✅ Swagger API documentation
- ✅ PDF report generation
- ✅ Role-based authorization

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or remote)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory with:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/medoc
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

### Running the Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📚 API Documentation

### Production Server
- **Azure Server**: http://20.248.208.172:8001/api-docs
- **Base URL**: http://20.248.208.172:8001/api

### Local Development
- **Swagger UI**: http://localhost:3000/api-docs
- **Base URL**: http://localhost:3000/api

---

## 🔐 Authentication

### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "doctor1",
  "password": "password123",
  "role": "doctor"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "doctor1",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60c72b2f9b1d8e001c8a4f2b",
    "username": "doctor1",
    "role": "doctor"
  }
}
```

### Using Authentication
Add the JWT token to your requests:
```http
Authorization: Bearer <your_access_token>
```

---

## 📋 Main Endpoints & Examples

### Patients

#### Add Patient (Doctor only)
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

#### Get Patient Reports (Paginated)
```http
GET /api/patients/{id}/reports?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
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

#### Add Test (Doctor only)
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

#### List Tests (Paginated)
```http
GET /api/diagnostic-tests?page=1&limit=10
Authorization: Bearer <token>
```

### Reports

#### Create Report (Lab Assistant only)
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "60c72b2f9b1d8e001c8a4f2b",
  "testId": "60c72b2f9b1d8e001c8a4f2c",
  "reportData": {
    "result": "Positive",
    "remarks": "Further investigation needed.",
    "testedAt": "2023-10-26T10:00:00Z"
  }
}
```

#### Get Report by ID
```http
GET /api/reports/{id}
Authorization: Bearer <token>
```

#### Download Report as PDF
```http
GET /api/reports/{id}/pdf
Authorization: Bearer <token>
```

---

## 📊 Data Models

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

## 🚀 Deployment

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

## 🔧 Technical Implementation

### Custom asyncHandler Middleware
- All async route handlers are wrapped with a custom `asyncHandler` to catch errors and pass them to the error handler, avoiding repetitive try/catch blocks.

### Centralized Error Handling
- All errors are handled by a custom `errorHandler` middleware, which formats and sends error responses in a consistent way.

### Request Validation
- Uses `express-validator` to validate and sanitize incoming request data for all endpoints.
- Validation errors are returned with clear messages and status 400.

### Refresh Access Token Flow
- After login, a refresh token is set as an HTTP-only cookie.
- To get a new access token, call `POST /api/auth/refresh-token` (cookie must be present).
- **Access token expiration:** 15 minutes (default)
- **Refresh token expiration:** 7 days (default)
- Logout (`POST /api/auth/logout`) clears the refresh token cookie and invalidates it server-side.

---

## 📝 Notes
- All endpoints (except `/auth/*`) require a valid JWT access token.
- Use `/api-docs` for full interactive API docs (Swagger UI).
- Rate limiting is applied to `/auth/login` and `/auth/register`.
- Pagination is available on list endpoints via `?page` and `?limit`.
- PDF reports are generated using Puppeteer.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Documentation**: Swagger/OpenAPI 3.0
- **PDF Generation**: Puppeteer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

---

