# Tessa API - General Specifications

## General Information

- **Version**: 1.0.0
- **Base URL**: `http://localhost:3000/tessa/v1`
- **Protocol**: HTTP/HTTPS
- **Data Format**: JSON
- **Charset**: UTF-8

## Authentication

The API uses two authentication methods:

### 1. Firebase Authentication (Recommended)
```http
Authorization: Bearer <firebase-token>
```

### 2. Basic Authentication (For internal services)
```http
Authorization: Basic <base64(username:password)>
```

Example:
```bash
# username: admin, password: secret
# base64(admin:secret) = YWRtaW46c2VjcmV0
Authorization: Basic YWRtaW46c2VjcmV0
```

## Response Structure

### Successful Responses

All successful responses follow this structure:

```json
{
  "status": "success",
  "data": { }
}
```

### Error Responses

All error responses follow this structure:

```json
{
  "code": 400,
  "message": "Descriptive error message",
  "stack": "Stack trace (development only)"
}
```

## HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful request with no response body |
| 400 | Bad Request | Client request error |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Conflict with current resource state |
| 500 | Internal Server Error | Server internal error |

## Common Error Types

### Validation Error
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

### Authentication Error
```json
{
  "code": 401,
  "message": "Authentication failed"
}
```

### Permission Error
```json
{
  "code": 403,
  "message": "Insufficient permissions"
}
```

### Resource Not Found
```json
{
  "code": 404,
  "message": "Resource not found"
}
```

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `OWNER` | System owner | Full access to all resources |
| `MANAGER` | Manager | User management and operations |
| `EMPLOYEE` | Employee | Basic access to assigned resources |


## API Versioning

The API uses URL versioning:
- **v1**: `/tessa/v1/` (Current version)

Future versions will be added as `/tessa/v2/`, etc.

## MongoDB IDs

MongoDB IDs are 24-character hexadecimal ObjectIds:
```
507f1f77bcf86cd799439011
```

## Available Endpoints

- [Register Endpoints](./REGISTER_ENDPOINTS.md)
- [Owner Endpoints](./OWNER_ENDPOINTS.md)
- [User Endpoints](./USER_ENDPOINTS.md)

## Security

### Security Headers

The API implements the following security headers (via Helmet):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

### CORS

CORS is enabled with the following configurations:
- `credentials: true`
- `origin: true` (allow all origins in development)

### Input Validation

All endpoints validate input using `express-validator`:
- Data type validation
- Format validation (email, ObjectId, etc.)
- Data sanitization

## Logging

The API uses Winston for logging with the following levels:
- `error`: Critical errors
- `warn`: Warnings
- `info`: General information
- `debug`: Debug information (development only)

## Environment Variables

Check `.env.example` for all required environment variables:
- `PORT`: Server port
- `NODE_ENV`: Environment (development/production/test)
- `MONGODB_URL`: MongoDB connection URL
- `FIREBASE_*`: Firebase credentials

## Support

To report issues or request help:
- GitHub Issues: [Report Issue](https://github.com/juan-carlos-macias/tessa/issues)
- Email: Contact development team
