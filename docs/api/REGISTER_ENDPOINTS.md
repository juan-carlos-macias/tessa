# Register Endpoints

## Overview

Register endpoints allow creating new Owner accounts in the system. **No authentication required** as these are the entry points for new users.

**Base Path**: `/tessa/v1/register`

---

## POST /register

Creates a new Owner account with Firebase authentication.

### Endpoint
```
POST /tessa/v1/register
```

### Authentication
❌ No authentication required

### Headers
```http
Content-Type: application/json
```

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Owner's full name |
| `email` | string | ✅ | Valid email address (used for authentication) |
| `password` | string | ✅ | Password (minimum 6 characters) |

### Request Example
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### Validations

#### Name
- ✅ Required
- ✅ Must be a non-empty string
- ✅ Type: string

#### Email
- ✅ Required
- ✅ Must be a valid email format
- ✅ Must be unique in the system
- ✅ Format: `user@domain.com`

#### Password
- ✅ Required
- ✅ Minimum 6 characters
- ✅ Recommended: Include uppercase, lowercase, numbers, and symbols

### Responses

#### ✅ 201 Created - Registration Successful

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
- `_id`: MongoDB ObjectId of the created owner
- `name`: Owner's full name
- `email`: Owner's email address
- `role`: Always "OWNER" for registered accounts
- `createdAt`: Account creation timestamp

#### ❌ 400 Bad Request - Validation Error

```json
{
  "code": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Common validation errors:**
- Invalid email format
- Password too short (less than 6 characters)
- Missing required fields
- Invalid data types

#### ❌ 409 Conflict - Email Already Exists

```json
{
  "code": 409,
  "message": "Email already exists"
}
```

This error occurs when attempting to register with an email that's already in the system.

#### ❌ 500 Internal Server Error

```json
{
  "code": 500,
  "message": "Error creating owner account"
}
```

**Possible causes:**
- Firebase connection error
- MongoDB connection error
- Internal server error

### Registration Process

1. **Input Validation**: All form fields are validated
2. **Email Verification**: Checks if email already exists in database
3. **Firebase Creation**: Creates user in Firebase Authentication
4. **MongoDB Creation**: Saves owner record in database
5. **Response**: Returns created owner data

### Notes

- After successful registration, the owner can log in using Firebase Authentication
- The password is securely stored in Firebase (not in MongoDB)
- Email must be verified through Firebase before full access is granted
- The `OWNER` role is automatically assigned and cannot be changed

### Related Endpoints

- [Owner Endpoints](./OWNER_ENDPOINTS.md) - Manage owner accounts after registration
- [User Endpoints](./USER_ENDPOINTS.md) - Create users under owner account
