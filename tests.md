# Tessa API - Testing Documentation

## Table of Contents
1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Test Environment Setup](#test-environment-setup)
6. [Mocking Strategy](#mocking-strategy)
7. [Database Management](#database-management)
8. [Writing Tests](#writing-tests)
9. [Test Patterns & Best Practices](#test-patterns--best-practices)
10. [CI/CD Integration](#cicd-integration)
11. [Running Tests](#running-tests)

---

## Overview

### Purpose
This project uses **End-to-End (E2E) tests** to validate API endpoints and ensure the complete request-response cycle works correctly. Tests verify the entire application stack from HTTP request → routes → controllers → orchestrators → services → database.

### Testing Philosophy
- **Real Integration Testing**: Uses actual MongoDB instance (Docker in CI/CD, local for development)
- **Mock External Services**: Firebase Admin and Winston logger are mocked to avoid external dependencies
- **Test Isolation**: Each test suite cleans up its data to prevent interference between tests
- **Comprehensive Coverage**: Tests cover success cases, validation errors, authorization, and edge cases

### Key Principles
- ✅ Tests must be **fast** (optimized database operations)
- ✅ Tests must be **isolated** (no shared state between tests)
- ✅ Tests must be **deterministic** (same results every run)
- ✅ Tests must be **maintainable** (clear structure and naming)
- ✅ Tests must be **comprehensive** (cover all scenarios)

---

## Test Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Test Framework** | Jest 29.7.0 | Test runner and assertion library |
| **HTTP Testing** | Supertest 7.0.0 | HTTP assertions and request testing |
| **Database** | MongoDB (Docker) | Real database for integration testing |
| **TypeScript** | ts-jest 29.2.5 | TypeScript support in Jest |
| **Mocking** | Jest mocks | Mock external services (Firebase, Winston) |

### Test Types

This project uses **E2E (End-to-End) tests** exclusively:

- **E2E Tests**: Test complete user workflows through HTTP endpoints
- **Location**: `test/routes/api/`
- **Coverage**: Routes, Controllers, Orchestrators, Services, Database

**Note**: Unit tests for individual services can be added in the future under `src/modules/*/tests/` if needed.

---

## Project Structure

```
tessa/
├── src/                                    # Source code
│   ├── routes/apiv1/                      # API routes
│   ├── modules/                           # Business logic modules
│   └── app/                               # Express app setup
│
├── test/                                  # Test files
│   ├── common/                            # Shared test utilities
│   │   ├── mocks/                         # Mock implementations
│   │   │   ├── pluggins.ts               # Firebase & Winston mocks
│   │   │   ├── authMock.ts               # Auth middleware mock
│   │   │   └── testMocks.ts              # Other mocks
│   │   └── helpers/                       # Test utilities
│   │       ├── TestDbServices.ts         # MongoDB management
│   │       ├── cleanUp.ts                # Cleanup after tests
│   │       └── testDbHelpers.ts          # DB helper functions
│   │
│   └── routes/                            # E2E test suites
│       └── api/                           # API route tests
│           ├── register/
│           │   └── register.routes.test.ts
│           ├── owner/
│           │   └── owner.routes.test.ts
│           └── users/
│               ├── user.get.routes.test.ts
│               ├── user.post.routes.test.ts
│               ├── user.patch.routes.test.ts
│               └── user.delete.routes.test.ts
│
├── config/                                # Configuration files
│   └── test.js                           # Test environment config
│
├── jest.config.ts                        # Jest configuration
└── tests.md                              # This documentation
```

---

## Getting Started

### Prerequisites

1. **Node.js**: Version 20+ (specified in CI/CD)
2. **MongoDB**: Local instance or Docker container
3. **npm**: For dependency management

### Installation

```bash
# Install dependencies
npm install

# Install dev dependencies (if not already installed)
npm install --save-dev @jest/globals @types/jest @types/supertest jest supertest ts-jest
```

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

---

## Test Environment Setup

### Jest Configuration

**File**: `jest.config.ts`

```typescript
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test', '<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.interface.ts',
        '!src/index.ts',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 30000,
    testPathIgnorePatterns: ['/node_modules/', '/config/'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

export default config;
```

### Environment Configuration

**File**: `config/test.js`

```javascript
require('dotenv').config();

module.exports = {
    port: 3000,
    environment: 'test',
    authorization: {
        username: '',
        password: '',
    },
    mongodb: {
        uri: 'mongodb://localhost:27017',
    },
    firebase: {
        firebaseConfig: {
            type: '',
            project_id: '',
            private_key_id: '',
            privateKey: '',
            client_email: '',
            client_id: '',
            auth_uri: '',
            token_uri: '',
            auth_provider_x509_cert_url: '',
            client_x509_cert_url: '',
            universe_domain: '',
        },
    },
};
```

### NPM Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest --runInBand",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage --runInBand",
    "test:verbose": "NODE_ENV=test jest --verbose --runInBand"
  }
}
```

**Note**: `--runInBand` runs tests serially to avoid database conflicts.

---

## Mocking Strategy

### Firebase Admin Mock

**File**: `test/common/mocks/pluggins.ts`

The Firebase mock simulates Firebase Admin SDK operations without requiring real credentials:

```typescript
class FirebaseMock {
    private users: { [uid: string]: any } = {};

    public async createUser(userData: object): Promise<any> {
        const uid = 'mocked-user-uid';
        this.users[uid] = userData;
        return { uid, ...userData };
    }

    public async setCustomClaims(uid: string, role: string): Promise<void> {
        if (this.users[uid]) {
            this.users[uid].customClaims = { role };
        }
    }

    public async deleteUser(uid: string): Promise<void> {
        if (this.users[uid]) {
            delete this.users[uid];
        }
    }
}

export default new FirebaseMock();
```

### Winston Logger Mock

Suppresses logging output during test execution:

```typescript
export const winstonMock = {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    addColors: jest.fn(),
    configure: jest.fn(),
    exceptions: { handle: jest.fn() },
    transports: {
        Console: jest.fn(),
        File: jest.fn().mockImplementation(() => {}),
    },
    format: {
        timestamp: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
        combine: jest.fn(),
        json: jest.fn(),
    },
};
```

### Auth Middleware Mock

**File**: `test/common/mocks/authMock.ts`

Mocks authentication middleware to inject test user credentials:

```typescript
export const createAuthMock = (userId: string, role: string) => ({
    apiBasicAuthorization: (req: any, res: any, next: any) => next(),
    firebaseAuth: (req: any, res: any, next: any) => {
        req.userId = userId;
        req.role = role;
        next();
    },
    appApiKeyAuthorization: (req: any, res: any, next: any) => next(),
});
```

### Usage in Tests

```typescript
import FirebaseMock, { winstonMock } from '../../../common/mocks/pluggins';

// Mock Winston to suppress logs
jest.mock('winston', () => winstonMock);

// Mock Firebase to avoid real credentials
jest.mock('../../../../src/modules/common/plugins/firebase', () => FirebaseMock);

// Mock auth middleware with test user
jest.mock('../../../../src/middlewares/auth', () =>
    require('../../../common/mocks/authMock').createAuthMock(
        '6819ad232a7d1f5f12288355',  // Test user ID
        'OWNER'                        // Test user role
    )
);
```

---

## Database Management

### TestDbServices

**File**: `test/common/helpers/TestDbServices.ts`

Manages MongoDB connections and database lifecycle:

```typescript
class TestDbServices {
    // Connect to database
    async connect(dbName: string): Promise<any | null>
    
    // Get database instance
    async getDb(dbName: string): Promise<mongoose.mongo.Db | null>
    
    // Create database with collection
    async createDb(dbName: string, collection: string): Promise<any | null>
    
    // Close connections and clean up all test databases
    async close(): Promise<void>
}
```

**Key Features**:
- Manages MongoDB client connections
- Creates test databases on demand
- Drops all test databases on cleanup (except system databases: admin, local, config)
- Thread-safe connection management

### CleanUp Helper

**File**: `test/common/helpers/cleanUp.ts`

Closes application and database connections after tests:

```typescript
async function cleanUp() {
    await App.close();      // Close Express app
    await app.close();      // Close MongoDB connection
}

export default cleanUp;
```

### Database Cleanup Pattern

Each test suite follows this pattern:

```typescript
beforeAll((done) => {
    // Wait for MongoDB connection to be ready
    onDBConnectionsReady(() => {
        done();
    });
});

beforeEach(async () => {
    // Clean collections before each test for isolation
    await OwnerModel.deleteMany({});
    await UserModel.deleteMany({});
});

afterAll(async () => {
    // Close database connections and cleanup
    await TestDbServices.close();
    jest.restoreAllMocks();
    await cleanUp();
});
```

---

## Writing Tests

### Test File Template

```typescript
/**
 * [Module] Routes - E2E Tests
 *
 * Tests the [description] endpoints including:
 * - [Functionality 1]
 * - [Functionality 2]
 */

import request from 'supertest';
import FirebaseMock, { winstonMock } from '../../../common/mocks/pluggins';
import { onDBConnectionsReady } from '../../../../src/modules/db.module';
import cleanUp from '../../../common/helpers/cleanUp';
import app from '../../../../src/app';
import UserModel from '../../../../src/modules/users/user.model';
import TestDbServices from '../../../common/helpers/TestDbServices';

// Setup mocks
jest.mock('winston', () => winstonMock);
jest.mock('../../../../src/modules/common/plugins/firebase', () => FirebaseMock);
jest.mock('../../../../src/middlewares/auth', () =>
    require('../../../common/mocks/authMock').createAuthMock(
        '6819ad232a7d1f5f12288355',
        'OWNER'
    )
);

describe('[Module] Routes - E2E Tests', () => {
    beforeAll((done) => {
        onDBConnectionsReady(() => {
            done();
        });
    });

    beforeEach(async () => {
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await TestDbServices.close();
        jest.restoreAllMocks();
        await cleanUp();
    });

    describe('POST /tessa/v1/endpoint', () => {
        describe('Success Cases', () => {
            it('should create resource with valid data', async () => {
                const data = { name: 'Test', email: 'test@example.com' };
                
                const response = await request(app.app)
                    .post('/tessa/v1/endpoint')
                    .send(data);

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body.data.name).toBe(data.name);
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when required field is missing', async () => {
                const response = await request(app.app)
                    .post('/tessa/v1/endpoint')
                    .send({});

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });
    });
});
```

### Test Structure Guidelines

#### 1. Describe Block Hierarchy

```typescript
describe('[Module] Routes - E2E Tests', () => {
    describe('[HTTP METHOD] /path/to/endpoint', () => {
        describe('Success Cases', () => {
            it('should [expected behavior]', async () => {});
        });

        describe('Validation Errors', () => {
            it('should return 400 when [condition]', async () => {});
        });

        describe('Authorization Errors', () => {
            it('should return 401 when [condition]', async () => {});
        });

        describe('Not Found Errors', () => {
            it('should return 404 when [condition]', async () => {});
        });
    });
});
```

#### 2. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should create a new user with valid data', async () => {
    // Arrange: Prepare test data
    const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
    };

    // Act: Execute the operation
    const response = await request(app.app)
        .post('/tessa/v1/user')
        .send(userData);

    // Assert: Verify the results
    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe(userData.name);
});
```

#### 3. Testing Database Persistence

```typescript
it('should persist user to database', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    
    const response = await request(app.app)
        .post('/tessa/v1/user')
        .send(userData);

    // Verify in database
    const savedUser = await UserModel.findById(response.body.data._id);
    expect(savedUser).toBeDefined();
    expect(savedUser?.name).toBe(userData.name);
});
```

---

## Test Patterns & Best Practices

### Response Validation

#### Status Codes
```typescript
expect(response.status).toBe(200);  // Success
expect(response.status).toBe(201);  // Created
expect(response.status).toBe(400);  // Bad Request
expect(response.status).toBe(401);  // Unauthorized
expect(response.status).toBe(404);  // Not Found
expect(response.status).toBe(409);  // Conflict
```

#### Response Structure
```typescript
expect(response.body).toHaveProperty('status', 'success');
expect(response.body).toHaveProperty('data');
expect(response.body.data).toHaveProperty('_id');
expect(response.body.data).toHaveProperty('name');
```

#### Array Responses
```typescript
expect(Array.isArray(response.body.data)).toBe(true);
expect(response.body.data).toHaveLength(2);
expect(response.body.data[0]).toHaveProperty('email');
```

### Error Testing

#### Validation Errors (400)
```typescript
it('should return 400 when email is missing', async () => {
    const response = await request(app.app)
        .post('/tessa/v1/register')
        .send({ name: 'Test' }); // Missing email

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
});
```

#### Conflict Errors (409)
```typescript
it('should return 409 when email already exists', async () => {
    const data = { name: 'Test', email: 'test@example.com' };
    
    // Create first user
    await request(app.app).post('/tessa/v1/register').send(data);
    
    // Try to create duplicate
    const response = await request(app.app)
        .post('/tessa/v1/register')
        .send(data);

    expect(response.status).toBe(409);
});
```

### Naming Conventions

#### Test Files
- Pattern: `[module].[method].routes.test.ts`
- Examples: `user.get.routes.test.ts`, `owner.routes.test.ts`

#### Test Descriptions
```typescript
// ✅ Good: Clear and specific
it('should create a new user with valid data', async () => {});
it('should return 400 when email format is invalid', async () => {});

// ❌ Bad: Vague or unclear
it('works', async () => {});
it('test validation', async () => {});
```

### Common Patterns

#### Testing GET Endpoints
```typescript
describe('GET /tessa/v1/user', () => {
    it('should return empty array when no users exist', async () => {
        const response = await request(app.app).get('/tessa/v1/user');
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });

    it('should return all users', async () => {
        // Create test data
        await UserModel.insertMany([
            { name: 'User 1', email: 'user1@example.com' },
            { name: 'User 2', email: 'user2@example.com' },
        ]);

        const response = await request(app.app).get('/tessa/v1/user');
        
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
    });
});
```

#### Testing POST Endpoints
```typescript
describe('POST /tessa/v1/user', () => {
    it('should create resource with valid data', async () => {
        const data = { name: 'John', email: 'john@example.com' };
        
        const response = await request(app.app)
            .post('/tessa/v1/user')
            .send(data);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('_id');
    });
});
```

#### Testing PATCH Endpoints
```typescript
describe('PATCH /tessa/v1/user/:id', () => {
    it('should update user data', async () => {
        const user = await UserModel.create({
            name: 'Original Name',
            email: 'test@example.com'
        });

        const response = await request(app.app)
            .patch(`/tessa/v1/user/${user._id}`)
            .send({ name: 'Updated Name' });

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe('Updated Name');
    });
});
```

#### Testing DELETE Endpoints
```typescript
describe('DELETE /tessa/v1/user/:id', () => {
    it('should delete user by ID', async () => {
        const user = await UserModel.create({
            name: 'Test User',
            email: 'test@example.com'
        });

        const response = await request(app.app)
            .delete(`/tessa/v1/user/${user._id}`);

        expect(response.status).toBe(200);
        
        // Verify deletion
        const deletedUser = await UserModel.findById(user._id);
        expect(deletedUser).toBeNull();
    });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/integration_and_deployment_dev.yml`

```yaml
name: Continuous Integration

on: [pull_request]

jobs:
  lint:
    name: Run Linter
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  test:
    name: Run Tests
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand({ping: 1})'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test
        env:
          MONGODB_URI: mongodb://localhost:27017
```

### Why MongoDB Service Container?

Tests require a **real MongoDB instance** because:

1. **E2E Testing**: Tests verify complete database operations
2. **Mongoose Integration**: Real database connections are tested
3. **Data Persistence**: Tests verify data is correctly saved and retrieved
4. **Transaction Support**: Database transactions and operations are tested

**Benefits**:
- ✅ Automatic setup in CI/CD pipeline
- ✅ Health checks ensure MongoDB is ready before tests run
- ✅ Automatic cleanup after tests complete
- ✅ No manual Docker configuration needed

---

## Running Tests

### Local Development

#### Prerequisites
```bash
# Ensure MongoDB is running locally
docker run -d -p 27017:27017 mongo:7.0

# Or use local MongoDB installation
# MongoDB should be accessible at mongodb://localhost:27017
```

#### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run with verbose output
npm run test:verbose
```

### Debugging Tests

#### VSCode Launch Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-cache",
        "--watchAll=false"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

#### Debug Single Test File
```bash
# Run specific test file
npm test -- test/routes/api/users/user.get.routes.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create a new user"
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage will be generated in ./coverage directory
# Open ./coverage/lcov-report/index.html in browser
```

---

## Best Practices Summary

### DO ✅

- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange → Act → Assert
- **Test database persistence** when creating/updating records
- **Clean database before each test** for isolation
- **Mock external services** (Firebase, Winston) consistently
- **Test both success and error cases** comprehensively
- **Verify response structure** including nested objects
- **Use TypeScript types** for better IDE support
- **Run tests serially** (`--runInBand`) to avoid conflicts

### DON'T ❌

- **Don't share state between tests** - always clean up
- **Don't mock the database** - use real MongoDB for E2E tests
- **Don't hard-code IDs** - generate or use returned IDs
- **Don't skip cleanup** - always close connections in `afterAll`
- **Don't write vague test names** - be specific about what's tested
- **Don't test implementation details** - test behavior
- **Don't forget to wait for async operations** - use `async/await`

---

## Troubleshooting

### Common Issues

#### "Connection refused" Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running locally or in Docker

```bash
docker run -d -p 27017:27017 mongo:7.0
```

#### Tests Timeout
```
Error: Timeout - Async callback was not invoked within the 30000 ms timeout
```
**Solution**: 
- Check if database connection is established
- Increase timeout in `jest.config.ts`: `testTimeout: 60000`
- Verify `beforeAll` callback is being called

#### Database Not Cleaning
```
Error: E11000 duplicate key error
```
**Solution**: Ensure `beforeEach` cleanup is working

```typescript
beforeEach(async () => {
