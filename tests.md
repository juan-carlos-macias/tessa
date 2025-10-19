# Tessa API - E2E Tests Specification

## Table of Contents
1. [Overview](#overview)
2. [Test Stack](#test-stack)
3. [Project Structure](#project-structure)
4. [Test Environment Setup](#test-environment-setup)
5. [Mocks & Middlewares](#mocks--middlewares)
6. [Database Setup](#database-setup)
7. [Test Structure Patterns](#test-structure-patterns)
8. [Response Validation](#response-validation)
9. [Error Handling Tests](#error-handling-tests)
10. [Naming Conventions](#naming-conventions)
11. [Complete Test Template](#complete-test-template)

---

## Overview

### Purpose
E2E (End-to-End) tests validate the complete request-response cycle of API endpoints, ensuring that all layers (routes → controllers → orchestrators → services → models → database) work together correctly.

### Testing Philosophy
- **Focus on endpoint logic**: Test the actual business logic and data flow through the API
- **Mock external services**: Firebase Admin, Winston logging, and other external integrations should be mocked
- **Use real MongoDB**: Tests run against a real MongoDB instance (via Docker) to ensure database operations work correctly
- **Isolate test data**: Each test suite should set up and tear down its own data to prevent cross-contamination
- **Skip external integrations**: Don't test actual Firebase authentication or third-party APIs

### Key Principles
- Tests must be **fast** (use in-memory or local Docker MongoDB)
- Tests must be **isolated** (no shared state between tests)
- Tests must be **deterministic** (same results every run)
- Tests must be **comprehensive** (cover happy paths, edge cases, and error scenarios)

---

## Test Stack

### Core Testing Libraries

```typescript
// Testing Framework
import { jest } from '@jest/globals';

// HTTP Testing
import request from 'supertest';

// Database & App
import { app as dbConnection } from '../modules/db.module';
import { onDBConnectionsReady } from '../modules/db.module';
import app from '../app'; // Express app instance
```

### Required Dependencies

Add to `package.json`:

```json
{
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@types/jest": "^29.5.12",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5"
  }
}
```

### Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000
};
```

---

## Project Structure

### Test File Organization

```
src/
├── routes/
│   └── apiv1/
│       ├── users/
│       │   ├── user.routes.ts
│       │   ├── user.controller.ts
│       │   └── __tests__/
│       │       └── user.routes.test.ts    # E2E tests here
│       ├── owner/
│       │   ├── owner.routes.ts
│       │   ├── owner.controller.ts
│       │   └── __tests__/
│       │       └── owner.routes.test.ts
│       └── register/
│           └── __tests__/
│               └── register.routes.test.ts
├── modules/
│   └── users/
│       └── __tests__/
│           └── user.service.test.ts      # Unit tests here
└── test/
    ├── helpers/
    │   ├── testDbHelpers.ts              # DB utilities
    │   ├── mockHelpers.ts                # Mock utilities
    │   └── fixtures/                     # Test data
    │       ├── users.fixture.ts
    │       └── owners.fixture.ts
    └── setup/
        └── testSetup.ts                  # Global test setup
```

---

## Test Environment Setup

### Environment Configuration

Ensure `config/test.js` is properly configured:

```javascript
require('dotenv').config();

module.exports = {
    port: 3000,
    environment: 'test',
    authorization: {
        username: 'test-user',
        password: 'test-password',
    },
    mongodb: {
        uri: 'mongodb://localhost:27017',
    },
    firebase: {
        firebaseConfig: {
            type: 'service_account',
            project_id: 'test-project',
            private_key_id: 'test-key-id',
            privateKey: 'test-private-key',
            client_email: 'test@test.iam.gserviceaccount.com',
            client_id: 'test-client-id',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test.iam.gserviceaccount.com',
            universe_domain: 'googleapis.com',
        },
    },
};
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage",
    "test:verbose": "NODE_ENV=test jest --verbose"
  }
}
```

---

## Mocks & Middlewares

### Firebase Admin Mock

Mock Firebase authentication to avoid requiring actual Firebase credentials:

```typescript
// At the top of test file, before other imports
jest.mock('firebase-admin', () => ({
    auth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({
            user_id: 'test-user-id-123',
            email: 'test@example.com',
            email_verified: true,
        }),
    }),
    credential: {
        cert: jest.fn(),
    },
    initializeApp: jest.fn(),
}));
```

### Winston Logger Mock

Suppress logging output during tests:

```typescript
jest.mock('winston', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
        json: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
    addColors: jest.fn(),
    configure: jest.fn(),
    exceptions: {
        handle: jest.fn(),
    },
}));
```

### Auth Middleware Mock

For tests that don't need authentication, you can mock auth middleware:

```typescript
// Optional: Mock auth middleware if needed
jest.mock('../../../middlewares/auth', () => ({
    firebaseAuth: jest.fn((req, res, next) => {
        req.userId = 'test-user-id-123';
        next();
    }),
    apiBasicAuthorization: jest.fn((req, res, next) => next()),
    appApiKeyAuthorization: jest.fn((req, res, next) => next()),
}));
```

**Note**: For testing actual authentication logic, don't mock the auth middleware - instead mock only Firebase Admin's `verifyIdToken` to return controlled test data.

---

## Database Setup

### Test Database Utilities

Create `src/test/helpers/testDbHelpers.ts`:

```typescript
import mongoose from 'mongoose';
import { app as dbConnection } from '../../modules/db.module';

/**
 * Clean up all collections in the test database
 */
export async function cleanDatabase(): Promise<void> {
    const collections = dbConnection.collections;
    
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
}

/**
 * Close all database connections
 */
export async function closeDatabase(): Promise<void> {
    await dbConnection.close();
}

/**
 * Create test data helper
 */
export async function createTestData<T>(
    model: mongoose.Model<T>,
    data: Partial<T> | Partial<T>[]
): Promise<T | T[]> {
    if (Array.isArray(data)) {
        return await model.insertMany(data);
    }
    return await model.create(data);
}
```

### Setup and Teardown Pattern

Every test file should follow this pattern:

```typescript
import request from 'supertest';
import { onDBConnectionsReady } from '../../../modules/db.module';
import { cleanDatabase, closeDatabase } from '../../../test/helpers/testDbHelpers';
import app from '../../../app';

// Mock Firebase and Winston (see Mocks section)
jest.mock('firebase-admin', () => ({ /* ... */ }));
jest.mock('winston', () => ({ /* ... */ }));

describe('User Routes - E2E Tests', () => {
    // Wait for DB connection before running any tests
    beforeAll((done) => {
        onDBConnectionsReady(() => {
            done();
        });
    });

    // Clean database before each test to ensure isolation
    beforeEach(async () => {
        await cleanDatabase();
    });

    // Close DB connection after all tests complete
    afterAll(async () => {
        await closeDatabase();
    });

    // Tests go here...
});
```

---

## Test Structure Patterns

### Describe Block Hierarchy

Organize tests using a clear hierarchy:

```typescript
describe('[Module] Routes - E2E Tests', () => {
    describe('POST /api/v1/resource', () => {
        describe('Success Cases', () => {
            it('should create a new resource with valid data', async () => {
                // Test implementation
            });

            it('should return 201 status code', async () => {
                // Test implementation
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when required field is missing', async () => {
                // Test implementation
            });

            it('should return 400 when field format is invalid', async () => {
                // Test implementation
            });
        });

        describe('Authorization Errors', () => {
            it('should return 401 when token is missing', async () => {
                // Test implementation
            });
        });
    });

    describe('GET /api/v1/resource/:id', () => {
        // Similar structure...
    });
});
```

### Test Organization Best Practices

1. **Group by HTTP method and endpoint**
2. **Separate success cases from error cases**
3. **Use descriptive test names** that explain what is being tested
4. **Follow AAA pattern**: Arrange → Act → Assert

---

## Response Validation

### Common Validation Patterns

#### Status Code Validation

```typescript
it('should return 200 status code', async () => {
    const response = await request(app)
        .get('/api/v1/users')
        .expect(200);
});
```

#### Response Body Structure

```typescript
it('should return user data with correct structure', async () => {
    const response = await request(app)
        .post('/api/v1/users')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('name', 'John Doe');
    expect(response.body.data).toHaveProperty('email', 'john@example.com');
    expect(response.body.data).toHaveProperty('createdAt');
});
```

#### Array Response Validation

```typescript
it('should return an array of users', async () => {
    // Arrange: Create test data
    await createTestData(UserModel, [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
    ]);

    // Act
    const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

    // Assert
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('name');
    expect(response.body.data[0]).toHaveProperty('email');
});
```

#### Nested Object Validation

```typescript
it('should return nested owner data', async () => {
    const response = await request(app)
        .get('/api/v1/users/123')
        .expect(200);

    expect(response.body.data).toHaveProperty('owner');
    expect(response.body.data.owner).toHaveProperty('_id');
    expect(response.body.data.owner).toHaveProperty('name');
});
```

#### Database Persistence Validation

```typescript
it('should persist user to database', async () => {
    const userData = { name: 'Jane Doe', email: 'jane@example.com' };
    
    const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

    // Verify in database
    const savedUser = await UserModel.findById(response.body.data._id);
    expect(savedUser).toBeDefined();
    expect(savedUser?.name).toBe(userData.name);
    expect(savedUser?.email).toBe(userData.email);
});
```

---

## Error Handling Tests

### 400 Bad Request - Validation Errors

```typescript
describe('Validation Errors', () => {
    it('should return 400 when name is missing', async () => {
        const response = await request(app)
            .post('/api/v1/users')
            .send({ email: 'test@example.com' }) // Missing name
            .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('name');
    });

    it('should return 400 when email format is invalid', async () => {
        const response = await request(app)
            .post('/api/v1/users')
            .send({ name: 'John Doe', email: 'invalid-email' })
            .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('email');
    });

    it('should return 400 when required fields are empty strings', async () => {
        const response = await request(app)
            .post('/api/v1/users')
            .send({ name: '', email: '' })
            .expect(400);

        expect(response.body).toHaveProperty('message');
    });
});
```

### 401 Unauthorized - Authentication Errors

```typescript
describe('Authorization Errors', () => {
    beforeEach(() => {
        // Re-mock Firebase to reject token for this test
        jest.spyOn(admin.auth(), 'verifyIdToken')
            .mockRejectedValueOnce(new Error('Invalid token'));
    });

    it('should return 401 when token is invalid', async () => {
        const response = await request(app)
            .get('/api/v1/users')
            .set('userauthorization', 'invalid-token')
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 when token is missing', async () => {
        const response = await request(app)
            .get('/api/v1/users')
            .expect(401);

        expect(response.body).toHaveProperty('message');
    });
});
```

### 404 Not Found - Resource Not Found

```typescript
describe('Not Found Errors', () => {
    it('should return 404 when user does not exist', async () => {
        const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
        
        const response = await request(app)
            .get(`/api/v1/users/${nonExistentId}`)
            .expect(404);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('not found');
    });

    it('should return 400 when ID format is invalid', async () => {
        const response = await request(app)
            .get('/api/v1/users/invalid-id-format')
            .expect(400);

        expect(response.body).toHaveProperty('message');
    });
});
```

### 409 Conflict - Duplicate Resource

```typescript
describe('Conflict Errors', () => {
    it('should return 409 when email already exists', async () => {
        const userData = { name: 'John Doe', email: 'john@example.com' };
        
        // Create first user
        await request(app)
            .post('/api/v1/users')
            .send(userData)
            .expect(201);

        // Try to create duplicate
        const response = await request(app)
            .post('/api/v1/users')
            .send(userData)
            .expect(409);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('already exists');
    });
});
```

---

## Naming Conventions

### Test File Naming

- **Pattern**: `[module].routes.test.ts`
- **Examples**:
  - `user.routes.test.ts`
  - `owner.routes.test.ts`
  - `register.routes.test.ts`
  - `calls.routes.test.ts`

### Test Description Naming

```typescript
// ✅ Good: Clear and specific
describe('POST /api/v1/users', () => {
    it('should create a new user with valid data', async () => {});
    it('should return 400 when email is missing', async () => {});
});

// ❌ Bad: Vague or unclear
describe('User tests', () => {
    it('works', async () => {});
    it('test validation', async () => {});
});
```

### Variable Naming

```typescript
// ✅ Good: Descriptive
const validUserData = { name: 'John Doe', email: 'john@example.com' };
const existingUser = await createTestData(UserModel, validUserData);
const response = await request(app).get('/api/v1/users');

// ❌ Bad: Unclear
const data = { name: 'John Doe', email: 'john@example.com' };
const user = await createTestData(UserModel, data);
const res = await request(app).get('/api/v1/users');
```

---

## Complete Test Template

### Full Example: User Routes Test

```typescript
/**
 * User Routes - E2E Tests
 * 
 * Tests the complete user management endpoints including:
 * - Creating users
 * - Retrieving users
 * - Updating user roles
 * - Deleting users
 */

import request from 'supertest';
import { onDBConnectionsReady } from '../../../modules/db.module';
import { cleanDatabase, closeDatabase } from '../../../test/helpers/testDbHelpers';
import app from '../../../app';
import UserModel from '../../../modules/users/user.model';

// Mock Firebase Admin to avoid requiring real credentials
jest.mock('firebase-admin', () => ({
    auth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({
            user_id: 'test-user-id-123',
            email: 'test@example.com',
            email_verified: true,
        }),
    }),
    credential: {
        cert: jest.fn(),
    },
    initializeApp: jest.fn(),
}));

// Mock Winston to suppress logging during tests
jest.mock('winston', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
        json: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
    addColors: jest.fn(),
    configure: jest.fn(),
    exceptions: {
        handle: jest.fn(),
    },
}));

describe('User Routes - E2E Tests', () => {
    // Setup: Wait for database connection
    beforeAll((done) => {
        onDBConnectionsReady(() => {
            done();
        });
    });

    // Setup: Clean database before each test for isolation
    beforeEach(async () => {
        await cleanDatabase();
    });

    // Cleanup: Close database connection after all tests
    afterAll(async () => {
        await closeDatabase();
    });

    describe('POST /api/v1/users', () => {
        describe('Success Cases', () => {
            it('should create a new user with valid data', async () => {
                // Arrange
                const userData = {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phoneNumber: '+1234567890',
                    role: 'user',
                };

                // Act
                const response = await request(app)
                    .post('/api/v1/users')
                    .send(userData)
                    .expect(201);

                // Assert
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data.name).toBe(userData.name);
                expect(response.body.data.email).toBe(userData.email);
                expect(response.body.data.phoneNumber).toBe(userData.phoneNumber);
                expect(response.body.data.role).toBe(userData.role);
            });

            it('should persist user to database', async () => {
                // Arrange
                const userData = {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phoneNumber: '+9876543210',
                    role: 'admin',
                };

                // Act
                const response = await request(app)
                    .post('/api/v1/users')
                    .send(userData)
                    .expect(201);

                // Assert
                const savedUser = await UserModel.findById(response.body.data._id);
                expect(savedUser).toBeDefined();
                expect(savedUser?.name).toBe(userData.name);
                expect(savedUser?.email).toBe(userData.email);
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when name is missing', async () => {
                // Arrange
                const invalidData = {
                    email: 'test@example.com',
                    phoneNumber: '+1234567890',
                    role: 'user',
                };

                // Act
                const response = await request(app)
                    .post('/api/v1/users')
                    .send(invalidData)
                    .expect(400);

                // Assert
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when email format is invalid', async () => {
                // Arrange
                const invalidData = {
                    name: 'John Doe',
                    email: 'invalid-email',
                    phoneNumber: '+1234567890',
                    role: 'user',
                };

                // Act
                const response = await request(app)
                    .post('/api/v1/users')
                    .send(invalidData)
                    .expect(400);

                // Assert
                expect(response.body).toHaveProperty('message');
            });
        });
    });

    describe('GET /api/v1/users', () => {
        describe('Success Cases', () => {
            it('should return empty array when no users exist', async () => {
                // Act
                const response = await request(app)
                    .get('/api/v1/users')
                    .expect(200);

                // Assert
                expect(response.body).toHaveProperty('data');
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data).toHaveLength(0);
            });

            it('should return all users', async () => {
                // Arrange: Create test users
                const users = [
                    { name: 'User 1', email: 'user1@example.com', role: 'user' },
                    { name: 'User 2', email: 'user2@example.com', role: 'admin' },
                ];
                await UserModel.insertMany(users);

                // Act
                const response = await request(app)
                    .get('/api/v1/users')
                    .expect(200);

                // Assert
                expect(response.body.data).toHaveLength(2);
                expect(response.body.data[0]).toHaveProperty('name');
                expect(response.body.data[0]).toHaveProperty('email');
                expect(response.body.data[0]).toHaveProperty('role');
            });
        });
    });

    describe('GET /api/v1/users/:id', () => {
        describe('Success Cases', () => {
            it('should return user by ID', async () => {
                // Arrange: Create a test user
                const testUser = await UserModel.create({
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user',
                });

                // Act
                const response = await request(app)
                    .get(`/api/v1/users/${testUser._id}`)
                    .expect(200);

                // Assert
                expect(response.body.data._id).toBe(testUser._id.toString());
                expect(response.body.data.name).toBe(testUser.name);
                expect(response.body.data.email).toBe(testUser.email);
            });
        });

        describe('Not Found Errors', () => {
            it('should return 404 when user does not exist', async () => {
                // Arrange: Valid but non-existent ObjectId
                const nonExistentId = '507f1f77bcf86cd799439011';

                // Act
                const response = await request(app)
                    .get(`/api/v1/users/${nonExistentId}`)
                    .expect(404);

                // Assert
                expect(response.body).toHaveProperty('message');
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when ID format is invalid', async () => {
                // Act
                const response = await request(app)
                    .get('/api/v1/users/invalid-id')
                    .expect(400);

                // Assert
                expect(response.body).toHaveProperty('message');
            });
        });
    });

    describe('PATCH /api/v1/users/:id/role', () => {
        describe('Success Cases', () => {
            it('should update user role', async () => {
                // Arrange: Create a test user
                const testUser = await UserModel.create({
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user',
                });

                const updateData = { role: 'admin' };

                // Act
                const response = await request(app)
                    .patch(`/api/v1/users/${testUser._id}/role`)
                    .send(updateData)
                    .expect(200);

                // Assert
                expect(response.body.data.role).toBe('admin');
                
                // Verify in database
                const updatedUser = await UserModel.findById(testUser._id);
                expect(updatedUser?.role).toBe('admin');
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when role is invalid', async () => {
                // Arrange: Create a test user
                const testUser = await UserModel.create({
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user',
                });

                const invalidData = { role: 'invalid-role' };

                // Act
                const response = await request(app)
                    .patch(`/api/v1/users/${testUser._id}/role`)
                    .send(invalidData)
                    .expect(400);

                // Assert
                expect(response.body).toHaveProperty('message');
            });
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        describe('Success Cases', () => {
            it('should delete user by ID', async () => {
                // Arrange: Create a test user
                const testUser = await UserModel.create({
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user',
                });

                // Act
                const response = await request(app)
                    .delete(`/api/v1/users/${testUser._id}`)
                    .expect(200);

                // Assert
                expect(response.body).toHaveProperty('data');
                
                // Verify deletion in database
                const deletedUser = await UserModel.findById(testUser._id);
                expect(deletedUser).
