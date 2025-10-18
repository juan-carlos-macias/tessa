# 🤖 Tessa Project - AI Agent Development Guidelines

## 📋 Project Overview

**Tessa** is a Node.js + TypeScript backend application built with Express.js, using MongoDB (via Mongoose) for data persistence and Firebase Admin SDK for authentication. The project follows a **layered architecture** with clear separation of concerns across Controllers, Orchestrators, Services, and Models.

### Tech Stack

- **Runtime**: Node.js with TypeScript (ES2016 target, CommonJS modules)
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM 8.x
- **Authentication**: Firebase Admin SDK
- **Validation**: express-validator 7.x
- **Logging**: Winston 3.x
- **Security**: Helmet, CORS
- **Development**: nodemon, ts-node, ESLint (Airbnb + TypeScript), Prettier
- **Error Handling**: Custom ApiError class with express-async-errors

---

## 🏗️ Architecture & Project Structure

### Directory Layout

```
tessa/
├── src/                          # Source code directory
│   ├── index.ts                 # Application entry point
│   ├── app/                     # Application setup & configuration
│   │   ├── index.ts            # Express app initialization (App class)
│   │   └── config/             # Configuration modules
│   │       └── winston.config.ts  # Winston logger setup
│   ├── modules/                 # Feature modules (business logic)
│   │   ├── db.module.ts        # Database connection management
│   │   ├── users/              # User module
│   │   │   ├── user.interface.ts   # TypeScript interfaces & types
│   │   │   ├── user.model.ts       # Mongoose schema & model
│   │   │   ├── user.service.ts     # Business logic layer
│   │   │   └── user.validation.ts  # Input validation rules
│   │   ├── owners/             # Owner module (similar structure)
│   │   ├── errors/             # Error handling
│   │   │   ├── ApiError.ts    # Custom error class
│   │   │   └── index.ts       # Error middleware (ErrorConverter, ErrorHandler)
│   │   └── common/             # Shared utilities
│   │       └── plugins/        # Reusable helpers
│   │           ├── catchAsync.ts        # Async error wrapper
│   │           ├── createValidator.ts   # Validation middleware factory
│   │           └── firebase.ts          # Firebase Admin integration
│   ├── orchestrators/           # Complex business workflows layer
│   │   └── users/              
│   │       └── user.orchestrator.ts  # Multi-service coordination
│   ├── routes/                  # API route definitions
│   │   ├── routes.ts           # Main route configuration
│   │   └── apiv1/              # API v1 routes
│   │       ├── api.routes.ts   # API v1 aggregator
│   │       ├── users/          
│   │       │   ├── user.controller.ts  # HTTP request handlers
│   │       │   └── user.routes.ts      # Route definitions
│   │       ├── owner/          # Owner routes & controller
│   │       └── register/       # Registration routes
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.ts             # Authentication (apiBasicAuthorization)
│   │   └── response.ts         # Custom response formatter
│   └── @types/                  # Custom TypeScript declarations
│       └── express/            # Express type extensions
├── config/                      # Environment-based configuration
│   ├── default.js              # Default config (placeholders)
│   ├── production.js           # Production overrides
│   ├── test.js                 # Test environment settings
│   └── custom-environment-variables.js  # Env var mappings
├── context/                     # Documentation
│   └── agents.md               # Template AI agent guidelines
├── build/                       # Compiled TypeScript output (gitignored)
└── [config files]               # Root-level configuration files
    ├── package.json            # Dependencies & scripts
    ├── tsconfig.json           # TypeScript configuration
    ├── .eslintrc               # ESLint rules (Airbnb + TypeScript)
    ├── .prettierrc             # Code formatting rules
    └── .env.example            # Environment variable template
```

---

## 🎯 Architectural Layers

### Layer Hierarchy (Request Flow)

```
HTTP Request
    ↓
[Routes] → Define endpoints & apply validation
    ↓
[Middlewares] → Authentication, validation execution
    ↓
[Controllers] → Handle HTTP requests/responses
    ↓
[Orchestrators] → Coordinate multiple services (optional, for complex workflows)
    ↓
[Services] → Business logic & data operations
    ↓
[Models] → Database schema & ODM operations
    ↓
[Database] → MongoDB
```

### 1. Routes (`src/routes/`)

**Purpose**: Define API endpoints and apply middleware chains

**Pattern**:
```typescript
// routes/apiv1/users/user.routes.ts
class UserRoutes {
    public router: Router = Router();

    constructor() {
        this.router.post(
            '/',
            UserValidation.createUser(),      // Validation middleware
            catchAsync(UserController.create) // Controller wrapped in error handler
        );
    }
}
export default new UserRoutes();
```

**Key Characteristics**:
- Each feature module has its own route file
- Routes are instantiated as classes with a `router` property
- Validation middleware is applied before controllers
- All async controllers are wrapped with `catchAsync` plugin

### 2. Controllers (`src/routes/apiv1/*/[feature].controller.ts`)

**Purpose**: Handle HTTP requests and responses, orchestrate service calls

**Pattern**:
```typescript
// routes/apiv1/users/user.controller.ts
class UserController {
    public async create(req: Request, res: Response): Promise<void> {
        const { name, email, role, password, ownerId } = req.body;
        
        const user = await UserOrchestrator.createEmployeeWithFirebase({
            name, email, ownerId, role, password
        });

        res.status(httpStatus.CREATED).json({
            status: 'success',
            data: user
        });
    }
}
export default new UserController();
```

**Key Characteristics**:
- Class-based with async methods
- Methods match HTTP verb semantics (create, getAll, getById, update, delete)
- Extract data from `req.body`, `req.params`, `req.query`
- Call Orchestrators or Services (never Models directly)
- Return standardized JSON responses with `status` and `data` fields
- Use `http-status` package for status codes
- Exported as singleton instances

### 3. Orchestrators (`src/orchestrators/`)

**Purpose**: Coordinate complex workflows involving multiple services or external systems

**Pattern**:
```typescript
// orchestrators/users/user.orchestrator.ts
class UserOrchestrator {
    static async createEmployeeWithFirebase(data: IUser): Promise<IUser> {
        const userId = new Types.ObjectId();
        let createdUser: IUser | null = null;

        try {
            // Step 1: Create user in MongoDB
            createdUser = await UserService.createUser({ ...data, _id: userId });
            
            // Step 2: Create user in Firebase
            await FirebaseService.createUser({
                uid: userId.toString(),
                email: data.email,
                password: data.password,
                displayName: data.name
            });

            return createdUser;
        } catch (error) {
            // Rollback: Delete user from MongoDB if Firebase creation failed
            if (createdUser) {
                await UserService.deleteUser(userId);
            }
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create user');
        }
    }
}
export default UserOrchestrator;
```

**Key Characteristics**:
- Static methods (no instantiation needed)
- Handle multi-step operations requiring transaction-like behavior
- Implement rollback/compensation logic for failures
- Coordinate between Services and external APIs (Firebase, OpenAI, etc.)
- Only used when operations span multiple services or require rollback logic

### 4. Services (`src/modules/[feature]/[feature].service.ts`)

**Purpose**: Core business logic and database operations

**Pattern**:
```typescript
// modules/users/user.service.ts
class UserService {
    public async createUser(user: IUser): Promise<IUser> {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            throw new ApiError(httpStatus.CONFLICT, 'User with this email already exists');
        }
        const userCreated = await User.create(user);
        return userCreated.toObject();
    }

    public async getAllUsers(ownerId: Types.ObjectId): Promise<IUser[]> {
        const users = await User.find({ ownerId }).lean();
        return users;
    }
}
export default new UserService();
```

**Key Characteristics**:
- Class-based with instance methods (exported as singleton)
- Single responsibility: One service per domain entity
- Direct interaction with Models (Mongoose operations)
- Business logic validation (beyond input validation)
- Throw `ApiError` for domain-specific errors
- Return plain objects (`.lean()` or `.toObject()`) rather than Mongoose documents

### 5. Models (`src/modules/[feature]/[feature].model.ts`)

**Purpose**: Define database schemas and ORM/ODM models

**Pattern**:
```typescript
// modules/users/user.model.ts
import { Schema } from 'mongoose';
import { IUserDocument, UserRole } from './user.interface';
import { app } from '../db.module';

const UserSchema = new Schema<IUserDocument>(
    {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        ownerId: { type: Schema.Types.ObjectId, required: true },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
            default: UserRole.EMPLOYEE
        }
    },
    {
        timestamps: true,  // Automatically adds createdAt, updatedAt
        versionKey: false  // Disables __v field
    }
);

const User = app.model<IUserDocument>('User', UserSchema, 'users');
export default User;
```

**Key Characteristics**:
- Mongoose schemas with TypeScript typing (`IUserDocument`)
- Schema uses `_id` explicitly (MongoDB convention)
- Enums are enforced at schema level
- Timestamps enabled by default
- Models registered via centralized `db.module` connection
- Collection name explicitly specified (third parameter)

### 6. Interfaces (`src/modules/[feature]/[feature].interface.ts`)

**Purpose**: Define TypeScript types and data contracts

**Pattern**:
```typescript
// modules/users/user.interface.ts
import { Document, Types } from 'mongoose';

export enum UserRole {
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE'
}

export interface IUser {
    _id?: Types.ObjectId;
    ownerId: Types.ObjectId;
    name: string;
    password?: string;       // Optional: Only used during creation
    email: string;
    role: UserRole;
    createdAt?: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
    _id: Types.ObjectId;
}
```

**Key Characteristics**:
- Separate interfaces for business objects (`IUser`) and Mongoose documents (`IUserDocument`)
- Enums for constants (exported for reuse)
- Optional fields marked with `?`
- Uses Mongoose `Types.ObjectId` for ID references

### 7. Validations (`src/modules/[feature]/[feature].validation.ts`)

**Purpose**: Define input validation rules using express-validator

**Pattern**:
```typescript
// modules/users/user.validation.ts
import { body, param } from 'express-validator';
import createValidation from '../common/plugins/createValidator';

class UserValidation {
    public static createUser() {
        return createValidation([
            body('name')
                .exists().withMessage('name is required')
                .isString().withMessage('name must be a string')
                .isLength({ min: 2 }).withMessage('name must be at least 2 characters long'),
            body('email')
                .exists().withMessage('email is required')
                .isEmail().withMessage('email must be valid'),
            body('role')
                .exists()
                .isIn(Object.values(UserRole))
                .withMessage(`role must be one of ${Object.values(UserRole).join(', ')}`)
        ]);
    }
}
export default UserValidation;
```

**Key Characteristics**:
- Static methods returning middleware arrays
- Use `createValidation` wrapper (custom plugin)
- Chain validators with clear error messages
- Validate body, params, and query separately
- Validate against enums using `isIn(Object.values(Enum))`

---

## 🔧 Key Patterns & Conventions

### Module Organization Pattern

Each feature module follows this structure:

```
modules/[feature]/
├── [feature].interface.ts    # TypeScript interfaces, enums, types
├── [feature].model.ts        # Mongoose schema & model
├── [feature].service.ts      # Business logic & data operations
└── [feature].validation.ts   # express-validator rules
```

Controllers are located in `routes/apiv1/[feature]/` alongside route definitions.

### Error Handling

**Custom ApiError Class**:
```typescript
// modules/errors/ApiError.ts
class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }
}
```

**Usage Pattern**:
```typescript
// In Services
if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
}

if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'User with this email already exists');
}
```

**Centralized Error Handling**:
- `ErrorConverter`: Converts all errors to `ApiError` format
- `ErrorHandler`: Final middleware that formats error responses
- Registered in `app/index.ts` as the last middlewares

### Async Error Handling

**catchAsync Plugin**:
```typescript
// modules/common/plugins/catchAsync.ts
// Wraps async controllers to catch errors automatically
const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
```

**Usage**: All async controllers must be wrapped:
```typescript
router.post('/', catchAsync(UserController.create));
```

### Response Standardization

**Custom Response Middleware**:
```typescript
// middlewares/response.ts
// Adds .respond() method to Response object
res.respond(data, statusCode);
```

**Standard Response Format**:
```json
{
    "status": "success",
    "data": { ... }
}
```

### Database Connection

**Centralized DB Module**:
```typescript
// modules/db.module.ts
export const app = mongoose.connection; // Shared connection
export const onDBConnectionsReady = (callback: () => void) => {
    mongoose.connect(config.get('mongodbURI'))
        .then(() => {
            winston.info('MongoDB connected');
            callback();
        });
};
```

**Usage in Entry Point**:
```typescript
// index.ts
onDBConnectionsReady(() => {
    app.listen();
});
```

---

## 📚 Configuration Management

### Configuration Hierarchy

Uses `config` package with environment-specific files:

1. **config/default.js**: Base configuration with placeholder values
2. **config/custom-environment-variables.js**: Maps environment variables to config keys
3. **config/production.js**: Production overrides
4. **config/test.js**: Test environment settings

**Usage**:
```typescript
import config from 'config';
const port: number = config.get('port');
const mongodbURI: string = config.get('mongodbURI');
```

### Environment Variables

Required environment variables (see `.env.example`):
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `FIREBASE_*`: Firebase Admin SDK credentials
- `NODE_ENV`: Environment (development/production/test)

---

## 🎨 Code Style & Standards

### TypeScript Configuration

- **Target**: ES2016
- **Module System**: CommonJS
- **Strict Mode**: Enabled
- **No Implicit Any**: Disabled (but avoid `any` when possible)
- **Output Directory**: `build/`

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `kebab-case.ts` | `user.service.ts`, `winston.config.ts` |
| Classes | `PascalCase` | `UserService`, `ApiError` |
| Interfaces | `PascalCase` with `I` prefix | `IUser`, `IUserDocument` |
| Enums | `PascalCase` | `UserRole` |
| Methods/Functions | `camelCase` | `createUser`, `getAllUsers` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| Variables | `camelCase` | `userName`, `userId` |

### Import Organization

Follow this order:
1. External packages (`express`, `mongoose`, etc.)
2. Internal modules (`../modules/users/user.service`)
3. Relative imports (`./user.interface`)
4. Type imports (if separated)

### ESLint Configuration

- **Extends**: Airbnb Base + Airbnb TypeScript + Prettier
- **Parser**: @typescript-eslint/parser
- **Plugins**: @typescript-eslint, import, prettier

**Key Rules** (from Airbnb):
- Single quotes for strings
- No semicolons (or required, check `.eslintrc`)
- 4-space indentation (verify in `.eslintrc` or `.prettierrc`)
- Trailing commas in multiline

### Class-Based Architecture

Services, Controllers, and Route definitions use classes:
```typescript
class UserService {
    public async createUser(user: IUser): Promise<IUser> {
        // Implementation
    }
}
export default new UserService(); // Export singleton instance
```

Orchestrators use static methods:
```typescript
class UserOrchestrator {
    static async createEmployeeWithFirebase(data: IUser): Promise<IUser> {
        // Implementation
    }
}
export default UserOrchestrator; // Export class, not instance
```

---

## 🛠️ Common Development Tasks

### Adding a New Feature Module

1. **Create Module Directory**:
   ```
   src/modules/[feature]/
   ```

2. **Define Interface** (`[feature].interface.ts`):
   ```typescript
   export interface IFeature {
       _id?: Types.ObjectId;
       name: string;
       // ... other fields
   }

   export interface IFeatureDocument extends Omit<IFeature, '_id'>, Document {
       _id: Types.ObjectId;
   }
   ```

3. **Create Model** (`[feature].model.ts`):
   ```typescript
   import { Schema } from 'mongoose';
   import { app } from '../db.module';

   const FeatureSchema = new Schema<IFeatureDocument>({
       _id: { type: Schema.Types.ObjectId, required: true },
       name: { type: String, required: true }
   }, { timestamps: true, versionKey: false });

   const Feature = app.model<IFeatureDocument>('Feature', FeatureSchema, 'features');
   export default Feature;
   ```

4. **Implement Service** (`[feature].service.ts`):
   ```typescript
   class FeatureService {
       public async create(data: IFeature): Promise<IFeature> {
           const created = await Feature.create(data);
           return created.toObject();
       }
   }
   export default new FeatureService();
   ```

5. **Add Validation** (`[feature].validation.ts`):
   ```typescript
   import { body } from 'express-validator';
   import createValidation from '../common/plugins/createValidator';

   class FeatureValidation {
       public static create() {
           return createValidation([
               body('name').exists().isString()
           ]);
       }
   }
   export default FeatureValidation;
   ```

6. **Create Controller** (`src/routes/apiv1/[feature]/[feature].controller.ts`):
   ```typescript
   class FeatureController {
       public async create(req: Request, res: Response): Promise<void> {
           const data = await FeatureService.create(req.body);
           res.status(httpStatus.CREATED).json({ status: 'success', data });
       }
   }
   export default new FeatureController();
   ```

7. **Define Routes** (`src/routes/apiv1/[feature]/[feature].routes.ts`):
   ```typescript
   class FeatureRoutes {
       public router: Router = Router();
       
       constructor() {
           this.router.post('/', 
               FeatureValidation.create(), 
               catchAsync(FeatureController.create)
           );
       }
   }
   export default new FeatureRoutes();
   ```

8. **Register in API Routes** (`src/routes/apiv1/api.routes.ts`):
   ```typescript
   import FeatureRoutes from './[feature]/[feature].routes';
   
   this.router.use('/[feature]', FeatureRoutes.router);
   ```

### Running the Application

**Development Mode**:
```bash
npm run start:dev
```

**Linting**:
```bash
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
```

**Building**:
```bash
npx tsc                # Compile TypeScript
```

---

## 🤖 AI Agent Guidelines

### Before Writing Code

1. **Understand the Module**: Read existing files in the target module
2. **Check Patterns**: Review similar features to understand conventions
3. **Verify Dependencies**: Check `package.json` for available packages
4. **Review Configuration**: Examine `tsconfig.json`, `.eslintrc`, `.prettierrc`

### While Writing Code

1. **Follow Layer Separation**:
   - Controllers handle HTTP, call Services/Orchestrators
   - Services contain business logic, call Models
   - Models define schemas only
   - Orchestrators coordinate multiple services

2. **Use Existing Patterns**:
   - Export services as singletons (`new ServiceName()`)
   - Export orchestrators as classes (static methods)
   - Wrap controllers with `catchAsync`
   - Use `ApiError` for exceptions

3. **Type Safety**:
   - Define interfaces before implementation
   - Avoid `any` type
   - Use `Types.ObjectId` for MongoDB IDs
   - Extend interfaces for Mongoose documents

4. **Validation**:
   - Validate all inputs with express-validator
   - Use `createValidation` wrapper
   - Provide clear error messages
   - Validate enums with `isIn()`

5. **Error Handling**:
   - Throw `ApiError` with appropriate status codes
   - Use `http-status` package constants
   - Let centralized middleware handle responses

### After Writing Code

1. **Lint**: Run `npm run lint:fix`
2. **Type Check**: Ensure TypeScript compiles without errors
3. **Test Manually**: Run `npm run start:dev` and test endpoints
4. **Review**: Ensure code matches existing patterns

### Critical Rules

❌ **Never**:
- Mix controller logic with service logic
- Call Models directly from Controllers
- Use `any` type without justification
- Ignore validation for user inputs
- Return Mongoose documents (use `.lean()` or `.toObject()`)
- Create orchestrators for simple single-service operations

✅ **Always**:
- Follow the layered architecture
- Use TypeScript interfaces
- Validate all external inputs
- Throw `ApiError` for errors
- Use singleton pattern for Services
- Use static methods for Orchestrators
- Wrap async controllers with `catchAsync`

---

## 📖 Quick Reference

### Common Imports

```typescript
// HTTP & Express
import { Request, Response, Router } from 'express';
import httpStatus from 'http-status';

// Database
import { Types } from 'mongoose';

// Validation
import { body, param, query } from 'express-validator';
import createValidation from '../common/plugins/createValidator';

// Utilities
import catchAsync from '../modules/common/plugins/catchAsync';
import { ApiError } from '../modules/errors';

// Configuration
import config from 'config';
import winston from 'winston';
```

### Common Patterns

**Service Method**:
```typescript
public async methodName(params): Promise<ReturnType> {
    const result = await Model.find({ ...query }).lean();
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Resource not found');
    }
    return result;
}
```

**Controller Method**:
```typescript
public async methodName(req: Request, res: Response): Promise<void> {
    const data = await Service.methodName(req.body);
    res.status(httpStatus.OK).json({ status: 'success', data });
}
```

**Route Definition**:
```typescript
this.router.post('/', 
    Validation.methodName(), 
    catchAsync(Controller.methodName)
);
```

---

## 🔄 Project Evolution

When extending this project:

1. **Document Deviations**: Update this file if introducing new patterns
2. **Maintain Consistency**: Follow established conventions
3. **Update Interfaces**: Keep TypeScript types in sync with database schemas
4. **Version APIs**: Consider API versioning for breaking changes
5. **Security First**: Always validate inputs, sanitize outputs
6. **Logging**: Use Winston for all application logs
7. **Error Messages**: Be descriptive but avoid leaking sensitive information

---

**Last Updated**: Based on current project structure as of analysis

**Note**: This document serves as a comprehensive reference for understanding and extending the Tessa project. When in doubt, examine existing code in similar modules to ensure consistency.
