# DevPulse API

DevPulse is an internal technology issue and feature-tracking REST API built with **Node.js**, **TypeScript**, **Express.js**, **PostgreSQL**, and **NeonDB**. It enables software-team members to report bugs, submit feature requests, review issues, and manage issue-resolution workflows through contributor and maintainer roles.

## Live Links

- **Live API:** ``
- **GitHub Repository:** ``



## Features

- User registration with contributor or maintainer role
- Secure password hashing using `bcrypt`
- JWT-based authentication and authorization
- Public issue listing and single-issue retrieval
- Authenticated issue creation
- Contributor ownership-based update permissions
- Maintainer access to update any issue
- Maintainer-only issue deletion
- Issue filtering by type and status
- Issue sorting by newest or oldest
- Raw parameterized SQL queries using the native `pg` driver
- PostgreSQL connection pooling
- Automatic `created_at` and `updated_at` timestamps
- Centralized error handling
- Strict TypeScript configuration
- Modular Express architecture
- Standard success and error response formats

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| TypeScript | Type-safe backend development |
| Express.js | REST API framework |
| PostgreSQL | Relational database |
| NeonDB | Serverless PostgreSQL hosting |
| `pg` | Native PostgreSQL driver |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT generation and verification |
| `http-status-codes` | Consistent HTTP status constants |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment-variable management |
| `tsx` | TypeScript runtime for development and start scripts |

---

## Project Structure

```text
src/
├── config/
│   └── index.ts
├── db/
│   └── index.ts
├── middleware/
│   ├── auth.ts
│   ├── globalErrorHandler.ts
│   ├── index.d.ts
│   └── notFound.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.interface.ts
│   │   ├── auth.route.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   └── issue/
│       ├── issue.controller.ts
│       ├── issue.interface.ts
│       ├── issue.route.ts
│       ├── issue.service.ts
│       └── issue.validation.ts
├── types/
├── utils/
│   ├── AppError.ts
│   ├── catchAsync.ts
│   ├── jwt.ts
│   └── sendResponse.ts
├── app.ts
└── server.ts
```

---

## Prerequisites

Before running the project locally, install:

- Node.js 24.x or later
- npm
- Git
- A PostgreSQL database, preferably NeonDB
- Postman or another API-testing tool

---

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/arik509/Next-Level-A02
```

### 2. Enter the project directory

```bash
cd devpulse
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the environment file

Create a `.env` file in the project root:

```env
PORT=5000

CONNECTION_STRING=your_neon_postgresql_connection_string

JWT_SECRET=your_long_secure_jwt_secret
JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10

NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
```

### 5. Start the development server

```bash
npm run dev
```

The server should be available at:

```text
http://localhost:5000
```

### 6. Check the root endpoint

```http
GET /
```

Expected response:

```json
{
  "success": true,
  "message": "DevPulse API is running"
}
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the server in watch mode using `tsx` |
| `npm run type-check` | Checks TypeScript types without generating files |
| `npm run build` | Compiles TypeScript into the `dist` directory |
| `npm start` | Starts the application using `tsx ./src/server.ts` |

Example:

```bash
npm run type-check
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `PORT` | No | Server port; defaults to `5000` |
| `CONNECTION_STRING` | Yes | NeonDB/PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | JWT expiration time; defaults to `7d` |
| `BCRYPT_SALT_ROUNDS` | No | Password-hashing rounds; recommended value is `10` |
| `NODE_ENV` | No | Application environment |
| `CLIENT_ORIGIN` | No | Allowed frontend origin for CORS |


---

## Database Schema

The application automatically initializes the required tables when the server starts.

### Users Table

| Field | Type | Rules |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `name` | `VARCHAR(100)` | Required |
| `email` | `VARCHAR(255)` | Required and unique |
| `password` | `TEXT` | Required and bcrypt-hashed |
| `role` | `VARCHAR(20)` | `contributor` or `maintainer`; defaults to `contributor` |
| `created_at` | `TIMESTAMPTZ` | Generated automatically |
| `updated_at` | `TIMESTAMPTZ` | Refreshed automatically on update |

### Issues Table

| Field | Type | Rules |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `title` | `VARCHAR(150)` | Required; maximum 150 characters |
| `description` | `TEXT` | Required; minimum 20 characters |
| `type` | `VARCHAR(30)` | `bug` or `feature_request` |
| `status` | `VARCHAR(20)` | `open`, `in_progress`, or `resolved`; defaults to `open` |
| `reporter_id` | `INTEGER` | User ID taken from the verified JWT |
| `created_at` | `TIMESTAMPTZ` | Generated automatically |
| `updated_at` | `TIMESTAMPTZ` | Refreshed automatically on update |

The project does not use SQL `JOIN` queries. Reporter data is fetched separately and combined in the application layer.

---

## User Roles and Permissions

### Contributor

A contributor can:

- Register and log in
- Create bug reports and feature requests
- View all issues
- View a single issue
- Update their own issue while its current status is `open`

A contributor cannot:

- Update another user's issue
- Update an issue after its status changes from `open`
- Change an issue status
- Delete an issue

### Maintainer

A maintainer can:

- Perform all contributor actions
- Update any issue
- Change any issue status
- Delete any issue

---

## Authentication Flow

1. A user registers through `/api/auth/signup`.
2. The password is hashed using bcrypt before storage.
3. The user logs in through `/api/auth/login`.
4. The server validates the credentials.
5. The server returns a signed JWT.
6. The client sends the token in the `Authorization` header for protected endpoints.
7. The authentication middleware verifies the token, expiration, and role.

JWT payload:

```json
{
  "id": 1,
  "name": "John Doe",
  "role": "contributor"
}
```

Protected requests should use:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

The middleware also accepts the raw token format required by the assignment:

```text
Authorization: YOUR_JWT_TOKEN
```

---

# API Endpoints

Base URL for local development:

```text
http://localhost:5000
```

## Authentication Endpoints

### 1. Register User

```http
POST /api/auth/signup
```

**Access:** Public

Request body:

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-06-15T14:00:00.000Z",
    "updated_at": "2026-06-15T14:00:00.000Z"
  }
}
```

---

### 2. Login User

```http
POST /api/auth/login
```

**Access:** Public

Request body:

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-06-15T14:00:00.000Z",
      "updated_at": "2026-06-15T14:00:00.000Z"
    }
  }
}
```

---

## Issue Endpoints

### 3. Create Issue

```http
POST /api/issues
```

**Access:** Contributor or maintainer

Headers:

```text
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after concurrent queries and causes server errors.",
  "type": "bug"
}
```

Success response:

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 1,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after concurrent queries and causes server errors.",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-06-15T14:54:30.547Z",
    "updated_at": "2026-06-15T14:54:30.547Z"
  }
}
```

The server extracts `reporter_id` from the verified JWT. It does not accept the reporter ID from the request body.

---

### 4. Get All Issues

```http
GET /api/issues
```

**Access:** Public

Supported query parameters:

| Parameter | Valid Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | No filter |
| `status` | `open`, `in_progress`, `resolved` | No filter |

Examples:

```http
GET /api/issues?sort=newest
GET /api/issues?sort=oldest
GET /api/issues?type=bug
GET /api/issues?type=feature_request
GET /api/issues?status=open
GET /api/issues?sort=oldest&type=bug&status=open
```

Success response:

```json
{
  "success": true,
  "message": "Issues retrived successfully",
  "data": [
    {
      "id": 1,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after concurrent queries and causes server errors.",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-06-15T14:54:30.547Z",
      "updated_at": "2026-06-15T14:54:30.547Z"
    }
  ]
}
```

---

### 5. Get Single Issue

```http
GET /api/issues/:id
```

**Access:** Public

Example:

```http
GET /api/issues/1
```

Success response:

```json
{
  "success": true,
  "message": "Issue retrived successfully",
  "data": {
    "id": 1,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after concurrent queries and causes server errors.",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-06-15T14:54:30.547Z",
    "updated_at": "2026-06-15T14:54:30.547Z"
  }
}
```

---

### 6. Update Issue

```http
PATCH /api/issues/:id
```

**Access:** Contributor or maintainer

Headers:

```text
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Contributor request example:

```json
{
  "title": "Updated database connection timeout",
  "description": "The connection pool becomes exhausted during concurrent API requests.",
  "type": "bug"
}
```

Maintainer status-update example:

```json
{
  "status": "in_progress"
}
```

Success response:

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 1,
    "title": "Updated database connection timeout",
    "description": "The connection pool becomes exhausted during concurrent API requests.",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-06-15T14:54:30.547Z",
    "updated_at": "2026-06-15T16:20:00.000Z"
  }
}
```

Contributor restrictions:

- Can update only their own issue
- Can update only while its current status is `open`
- Cannot submit the `status` field

Maintainer permissions:

- Can update any issue
- Can update `title`, `description`, `type`, and `status`

---

### 7. Delete Issue

```http
DELETE /api/issues/:id
```

**Access:** Maintainer only

Headers:

```text
Authorization: Bearer MAINTAINER_JWT_TOKEN
```

Success response:

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Standard Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

The `data` property is omitted when it is not required.

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

The `errors` property is included when detailed validation information is available.

---

## HTTP Status Codes

| Code | Name | Usage |
|---:|---|---|
| `200` | OK | Successful GET, PATCH, or DELETE |
| `201` | Created | Successful resource creation |
| `400` | Bad Request | Invalid input or validation failure |
| `401` | Unauthorized | Missing, invalid, or expired JWT |
| `403` | Forbidden | Valid JWT but insufficient permission |
| `404` | Not Found | Requested issue or route does not exist |
| `409` | Conflict | Contributor attempts to update a non-open issue |
| `500` | Internal Server Error | Unexpected server or database error |

---

## Validation Rules

### User Registration

- `name` is required
- `email` must be valid and unique
- `password` is required
- `role` must be `contributor` or `maintainer`
- Omitted role defaults to `contributor`

### Issue Creation

- `title` is required
- `title` must not exceed 150 characters
- `description` must contain at least 20 characters
- `type` must be `bug` or `feature_request`
- Initial status is always `open`
- `reporter_id` is taken from the JWT

### Issue Update

Allowed fields:

```text
title
description
type
status
```

The following fields cannot be updated:

```text
id
reporter_id
created_at
updated_at
```

Only maintainers can update `status`.

---

## Security Measures

- Passwords are hashed using bcrypt
- Passwords are never returned in API responses
- JWTs are signed with a server-side secret
- Protected routes reject missing or invalid tokens
- Role checks occur before privileged actions
- SQL queries use positional parameters such as `$1`, `$2`, and `$3`
- User input is never concatenated directly into SQL
- `.env` is excluded from Git
- Express's `x-powered-by` header is disabled
- Reporter IDs are taken from verified JWT payloads
- Duplicate email conflicts are handled safely

---

## Testing Checklist

Before deployment, verify:

- User registration succeeds
- Duplicate email registration is rejected
- Correct login returns a JWT
- Incorrect login returns `401`
- Protected routes reject missing tokens
- Invalid tokens return `401`
- Contributors can create issues
- Public users can retrieve issues
- Filters and sorting work correctly
- Contributors can update their own open issues
- Contributors cannot update other users' issues
- Contributors cannot change issue status
- Contributors cannot update non-open issues
- Maintainers can update any issue
- Maintainers can change issue status
- Contributors cannot delete issues
- Maintainers can delete issues
- Invalid issue IDs return `400`
- Missing issues return `404`
- `npm run type-check` passes
- `npm run build` passes
- `npm start` starts the application successfully

---

## Deployment

The API can be deployed to Render, Railway, or Vercel. Render or Railway is recommended for a standard Express server.

### Example Render Configuration

**Build Command**

```bash
npm install && npm run build
```

**Start Command**

```bash
npm start
```

Add the following environment variables in the hosting dashboard:

```text
CONNECTION_STRING
JWT_SECRET
JWT_EXPIRES_IN
BCRYPT_SALT_ROUNDS
NODE_ENV
CLIENT_ORIGIN
```

Do not manually set `PORT` if the hosting platform provides it automatically.

After deployment, test:

```http
GET https://your-live-api-url.com/
GET https://your-live-api-url.com/api/issues
```

---

## Git Commit Guidelines

The repository should include meaningful progressive commits, for example:

```text
chore: initialize TypeScript Express project
feat: configure Neon database and initialize tables
feat: implement user registration endpoint
feat: implement user login and JWT generation
feat: add JWT authentication middleware
feat: implement authenticated issue creation
feat: implement issue listing with filtering and sorting
feat: implement single issue retrieval
feat: implement role-based issue updates
feat: implement maintainer issue deletion
docs: add complete project documentation
```

---

## Academic Integrity

This project should represent the author's own implementation and understanding. Do not publish database passwords, JWT secrets, copied credentials, or code that you cannot explain during evaluation.

---

## Author

**Your Name**

- GitHub: `https://github.com/arik509`
- Email: `sabirhossainarik34@gmail.com`

---

## License

This project is created for educational purposes.
