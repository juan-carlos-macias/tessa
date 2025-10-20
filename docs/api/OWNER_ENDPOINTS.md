# Owner Endpoints

## Overview

Owner endpoints allow managing Owner accounts. All endpoints require authentication except registration (covered in [Register Endpoints](./REGISTER_ENDPOINTS.md)).

**Base Path**: `/tessa/v1/owner`

---

## GET /owner/:id

Retrieves owner information by ID.

### Endpoint
```
GET /tessa/v1/owner/:id
```

### Authentication
✅ Required - Firebase Bearer Token and Basic Auth

### Headers
```http
Authorization: Bearer <firebase-token>
# AND
Authorization: Basic <base64-credentials>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | MongoDB ObjectId of the owner |

### Request Example
```
GET /tessa/v1/owner/507f1f77bcf86cd799439011
```

### Responses

#### ✅ 200 OK - Success

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "OWNER",
    "createdAt": "2023-10-19T12:00:00.000Z"
  }
}
```

**Response Fields:**
- `_id`: Owner's unique identifier
- `name`: Owner's full name
- `email`: Owner's email address
- `role`: User role (always "OWNER")
- `createdAt`: Account creation timestamp

#### ❌ 400 Bad Request - Invalid ID Format

```json
{
  "code": 400,
  "message": "Invalid ObjectId format"
}
```

#### ❌ 401 Unauthorized - Authentication Failed

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 404 Not Found - Owner Not Found

```json
{
  "code": 404,
  "message": "Owner not found"
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

## DELETE /owner/:id

Deletes an owner account from the system.

### Endpoint
```
DELETE /tessa/v1/owner/:id
```

### Authentication
✅ Required - Firebase Bearer Token and Basic Auth

### Headers
```http
Authorization: Bearer <firebase-token>
# AND
Authorization: Basic <base64-credentials>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | MongoDB ObjectId of the owner to delete |

### Request Example
```
DELETE /tessa/v1/owner/507f1f77bcf86cd799439011
```

### Responses

#### ✅ 204 No Content - Successfully Deleted

No response body. The owner has been successfully deleted.

#### ❌ 400 Bad Request - Invalid ID Format

```json
{
  "code": 400,
  "message": "Invalid ObjectId format"
}
```

#### ❌ 401 Unauthorized - Authentication Failed

```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

#### ❌ 404 Not Found - Owner Not Found

```json
{
  "code": 404,
  "message": "Owner not found"
}
```

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Error deleting owner"
}
```

### Deletion Process

1. **Validation**: Validates the owner ID format
2. **Authentication**: Verifies user credentials
3. **Firebase Deletion**: Removes user from Firebase Authentication
4. **Database Deletion**: Removes owner record from MongoDB
5. **Cascade Effects**: May delete associated users (depending on configuration)

### Important Notes

- **Permanent Action**: Owner deletion is permanent and cannot be undone
- **Firebase Account**: Deletes both MongoDB record and Firebase authentication account
- **Associated Data**: Consider the impact on associated users before deletion
- **Authorization**: Only authenticated users with proper permissions can delete owners
- **Audit Trail**: Consider implementing soft deletes for audit purposes

### Related Endpoints

- [Register Endpoints](./REGISTER_ENDPOINTS.md) - Create new owner accounts
- [User Endpoints](./USER_ENDPOINTS.md) - Manage users under owner account

## Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/owner/:id` | Get owner by ID | ✅ Yes |
| DELETE | `/owner/:id` | Delete owner | ✅ Yes |

**Note**: Owner creation is handled through the `/register` endpoint.
