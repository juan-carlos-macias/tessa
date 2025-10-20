# User Endpoints

## Overview

User endpoints allow managing user accounts under an owner. All endpoints require authentication.

**Base Path**: `/tessa/v1/user`

---

## POST /user

Creates a new user account under an owner.

### Endpoint
```
POST /tessa/v1/user
```

### Authentication
✅ Required - Firebase Bearer Token or Basic Auth

### Headers
```http
Content-Type: application/json
Authorization: Bearer <firebase-token>
# OR
Authorization: Basic <base64-credentials>
```

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | User's full name |
| `email` | string | ✅ | Valid email address |
| `role` | string | ✅ | User role: `MANAGER` or `EMPLOYEE` |
| `password` | string | ✅ | Password (minimum 6 characters) |
| `ownerId` | string | ✅ | MongoDB ObjectId of the owner |

### Request Example
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "EMPLOYEE",
  "password": "SecurePass123!",
  "ownerId": "507f1f77bcf86cd799439012"
}
```

### Validations

#### Name
- ✅ Required
- ✅ Must be a non-empty string

#### Email
- ✅ Required
- ✅ Must be a valid email format
- ✅ Must be unique in the system

#### Role
- ✅ Required
- ✅ Must be either `MANAGER` or `EMPLOYEE`
- ✅ Cannot be `OWNER` (owners are created via registration)

#### Password
- ✅ Required
- ✅ Minimum 6 characters

#### OwnerId
- ✅ Required
- ✅ Must be a valid MongoDB ObjectId
- ✅ Owner must exist in the system

### Responses

#### ✅ 201 Created - User Created Successfully

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "ownerId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "EMPLOYEE",
    "createdAt": "2023-10-19T12:00:00.000Z"
  }
}
```

#### ❌ 400 Bad Request - Validation Error

```json
{
  "code": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "role",
      "message": "Role must be MANAGER or EMPLOYEE"
    }
  ]
}
```

#### ❌ 401 Unauthorized

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 409 Conflict - Email Already Exists

```json
{
  "code": 409,
  "message": "Email already exists"
}
```

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Error creating user"
}
```

---

## GET /user

Retrieves all users for the authenticated owner.

### Endpoint
```
GET /tessa/v1/user
```

### Authentication
✅ Required - Firebase Bearer Token or Basic Auth

### Headers
```http
Authorization: Bearer <firebase-token>
# OR
Authorization: Basic <base64-credentials>
```

### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `page` | number | ❌ | Page number | 1 |
| `limit` | number | ❌ | Items per page | 10 |
| `sort` | string | ❌ | Sort field | createdAt |
| `order` | string | ❌ | Sort order (asc/desc) | desc |

### Request Example
```
GET /tessa/v1/user?page=1&limit=10&sort=name&order=asc
```

### Responses

#### ✅ 200 OK - Success

```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "ownerId": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "EMPLOYEE",
      "createdAt": "2023-10-19T12:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "ownerId": "507f1f77bcf86cd799439012",
      "name": "Bob Johnson",
      "email": "bob.johnson@example.com",
      "role": "MANAGER",
      "createdAt": "2023-10-19T11:00:00.000Z"
    }
  ]
}
```

#### ❌ 401 Unauthorized

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Error retrieving users"
}
```

---

## GET /user/:id

Retrieves a specific user by ID.

### Endpoint
```
GET /tessa/v1/user/:id
```

### Authentication
✅ Required - Firebase Bearer Token or Basic Auth

### Headers
```http
Authorization: Bearer <firebase-token>
# OR
Authorization: Basic <base64-credentials>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | MongoDB ObjectId of the user |

### Request Example
```
GET /tessa/v1/user/507f1f77bcf86cd799439013
```

### Responses

#### ✅ 200 OK - Success

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "ownerId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "EMPLOYEE",
    "createdAt": "2023-10-19T12:00:00.000Z"
  }
}
```

#### ❌ 400 Bad Request - Invalid ID Format

```json
{
  "code": 400,
  "message": "Invalid ObjectId format"
}
```

#### ❌ 401 Unauthorized

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 404 Not Found

```json
{
  "code": 404,
  "message": "User not found"
}
```

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Internal server error"
}
```

---

## PATCH /user/:id/role

Updates a user's role.

### Endpoint
```
PATCH /tessa/v1/user/:id/role
```

### Authentication
✅ Required - Firebase Bearer Token or Basic Auth

### Headers
```http
Content-Type: application/json
Authorization: Bearer <firebase-token>
# OR
Authorization: Basic <base64-credentials>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | MongoDB ObjectId of the user |

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | ✅ | New role: `MANAGER` or `EMPLOYEE` |

### Request Example
```json
{
  "role": "MANAGER"
}
```

### Full Request
```
PATCH /tessa/v1/user/507f1f77bcf86cd799439013/role

{
  "role": "MANAGER"
}
```

### Validations

#### Role
- ✅ Required
- ✅ Must be either `MANAGER` or `EMPLOYEE`
- ✅ Cannot change to `OWNER`

### Responses

#### ✅ 200 OK - Role Updated Successfully

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "ownerId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "MANAGER",
    "createdAt": "2023-10-19T12:00:00.000Z"
  }
}
```

#### ❌ 400 Bad Request - Invalid Role

```json
{
  "code": 400,
  "message": "Invalid role. Must be MANAGER or EMPLOYEE"
}
```

#### ❌ 401 Unauthorized

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 404 Not Found

```json
{
  "code": 404,
  "message": "User not found"
}
```

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Error updating user role"
}
```

---

## DELETE /user/:id

Deletes a user from the system.

### Endpoint
```
DELETE /tessa/v1/user/:id
```

### Authentication
✅ Required - Firebase Bearer Token or Basic Auth

### Headers
```http
Authorization: Bearer <firebase-token>
# OR
Authorization: Basic <base64-credentials>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | MongoDB ObjectId of the user to delete |

### Request Example
```
DELETE /tessa/v1/user/507f1f77bcf86cd799439013
```

### Responses

#### ✅ 204 No Content - Successfully Deleted

No response body. The user has been successfully deleted.

#### ❌ 400 Bad Request - Invalid ID Format

```json
{
  "code": 400,
  "message": "Invalid ObjectId format"
}
```

#### ❌ 401 Unauthorized

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 404 Not Found

```json
{
  "code": 404,
  "message": "User not found"
}
```

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Error deleting user"
}
```

### Deletion Process

1. **Validation**: Validates the user ID format
2. **Authentication**: Verifies user credentials
3. **Authorization**: Checks if authenticated user has permission
4. **Firebase Deletion**: Removes user from Firebase Authentication
5. **Database Deletion**: Removes user record from MongoDB


### Important Notes

- **Permanent Action**: User deletion is permanent and cannot be undone
- **Firebase Account**: Deletes both MongoDB record and Firebase authentication account
- **Authorization**: Only the owner or authorized managers can delete users
- **Audit Trail**: Consider implementing soft deletes for audit purposes

---

## Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user` | Create new user | ✅ Yes |
| GET | `/user` | Get all users (for owner) | ✅ Yes |
| GET | `/user/:id` | Get user by ID | ✅ Yes |
| PATCH | `/user/:id/role` | Update user role | ✅ Yes |
| DELETE | `/user/:id` | Delete user | ✅ Yes |

### Related Endpoints

- [Owner Endpoints](./OWNER_ENDPOINTS.md) - Manage owner accounts
- [Register Endpoints](./REGISTER_ENDPOINTS.md) - Create new owner accounts

### User Roles

- **MANAGER**: Can manage other users and have elevated permissions
- **EMPLOYEE**: Standard user with basic access
- **OWNER**: System owner (created via registration, not user endpoints)
