# 🤖 AI Agent Development Guidelines

## 🧩 Template Purpose

This document defines general development rules and architectural patterns derived from analyzing well-structured projects. It serves as a guide for AI agents working across repositories with similar organizational philosophies, helping them understand project structure, follow established conventions, and integrate seamlessly into the development workflow.

**Key Principle:** Every project has an implicit "build philosophy" encoded in its structure, configuration, and conventions. This document makes that philosophy explicit.

---

## 🏗️ Typical Architecture & Structure

### Core Directory Organization

Most well-organized projects follow a predictable structure:

```
project-root/
├── src/                    # Primary source code directory
│   ├── index.ts           # Application entry point
│   ├── app/               # Application configuration & initialization
│   ├── modules/           # Feature-based modules (business logic)
│   ├── routes/            # API route definitions
│   ├── middlewares/       # Cross-cutting concerns (auth, logging, etc.)
│   └── @types/            # Custom TypeScript type definitions
├── config/                # Environment-specific configuration files
├── build/                 # Compiled/transpiled output (gitignored)
├── node_modules/          # Dependencies (gitignored)
└── [config files]         # Root-level configuration (see below)
```

### Module Organization Pattern

Projects typically organize features as self-contained modules:

```
modules/
└── [feature-name]/
    ├── [feature].interface.ts    # TypeScript interfaces & types
    ├── [feature].model.ts        # Database schema/model
    ├── [feature].service.ts      # Business logic & data operations
    ├── [feature].validation.ts   # Input validation rules
    └── [feature].controller.ts   # HTTP request handlers (in routes/)
```

**Separation of Concerns:**
- **Interfaces**: Define data structures and contracts
- **Models**: Database schema definitions (e.g., Mongoose, Sequelize)
- **Services**: Core business logic, data manipulation (class-based with static methods)
- **Controllers**: Handle HTTP requests/responses, call services
- **Validators**: Input validation middleware (e.g., express-validator, Joi)

### Common Shared Code

Reusable utilities are typically centralized:

```
modules/common/
├── plugins/              # Third-party integrations & utilities
├── errors/              # Custom error classes & handlers
└── helpers/             # Generic utility functions
```

---

## ⚙️ Coding Standards & Conventions

### Language & Framework Patterns

**TypeScript/JavaScript Projects:**
- Strict TypeScript configuration (`strict: true`)
- ES6+ features (async/await, arrow functions, destructuring)
- CommonJS or ESM module system
- Class-based architecture for services
- Interface-driven development

**Naming Conventions:**
- **Files**: `kebab-case.ts` or `camelCase.ts` (follow existing pattern)
- **Classes**: `PascalCase` (e.g., `UserService`, `ApiError`)
- **Functions/Methods**: `camelCase` (e.g., `createUser`, `validateInput`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IUserData`) or without prefix
- **Types**: `PascalCase` ending in `Type` (e.g., `ConfigType`)

### Code Organization Principles

1. **One Responsibility Per File**: Each file should have a single, clear purpose
2. **Dependency Injection**: Services receive dependencies via parameters or constructors
3. **Error Handling**: Use centralized error handling middleware
4. **Validation**: Validate all external inputs before processing
5. **Type Safety**: Prefer interfaces/types over `any`
6. **Async Operations**: Use async/await over callbacks or raw promises

### Formatting Standards

Detected patterns (verify with project config files):
- **Indentation**: 4 spaces or 2 spaces (check `.eslintrc` or `.prettierrc`)
- **Quotes**: Single or double quotes (follow ESLint/Prettier config)
- **Semicolons**: Required or optional (follow project style)
- **Line Length**: Typically 80-120 characters
- **Trailing Commas**: ES5 or all (check Prettier config)

---

## 📚 Sources of Truth

### Configuration Hierarchy

Projects typically use layered configuration:

1. **Environment Variables** (`.env` files)
   - Sensitive credentials, API keys
   - Environment-specific settings
   - Never committed to version control

2. **Configuration Files** (`config/` directory)
   - `default.js/ts`: Base configuration with undefined placeholders
   - `development.js/ts`: Development-specific overrides
   - `production.js/ts`: Production-specific settings
   - `test.js/ts`: Testing environment configuration

3. **Build Configuration**
   - `tsconfig.json`: TypeScript compiler options
   - `package.json`: Dependencies, scripts, metadata
   - `.eslintrc`: Linting rules
   - `.prettierrc`: Code formatting rules

### Package Management

**`package.json` is the project manifest:**
- Dependencies: Production runtime requirements
- DevDependencies: Development/build tools
- Scripts: Common development tasks
- Engines: Node/npm version requirements

**Common Scripts:**
- `start`: Run production build
- `start:dev` / `dev`: Development server with hot reload
- `build`: Compile/transpile source code
- `test`: Run test suite
- `lint`: Check code style
- `lint:fix`: Auto-fix linting issues

---

## 🤖 Agent Behavior Guidelines

### Before Writing Any Code

1. **Read Project Structure First**
   - Use `list_files` to understand directory organization
   - Identify the module/feature you'll be modifying
   - Locate related files (model, service, controller, etc.)

2. **Examine Existing Patterns**
   - Read similar existing files to understand conventions
   - Check how errors are handled
   - Review how validation is implemented
   - Study import/export patterns

3. **Verify Configuration**
   - Check `package.json` for available dependencies
   - Review `tsconfig.json` for TypeScript settings
   - Read ESLint/Prettier configs for style requirements

### Development Workflow

1. **Follow Established Patterns**
   - Match existing file naming conventions
   - Use the same class/function structure as similar modules
   - Maintain consistent indentation and formatting
   - Follow import organization (external → internal → relative)

2. **Respect Separation of Concerns**
   - Business logic belongs in services
   - HTTP handling belongs in controllers
   - Data validation belongs in validation files
   - Database operations belong in models/services

3. **Type Safety First**
   - Define interfaces before implementing features
   - Avoid `any` types unless absolutely necessary
   - Export types that will be reused
   - Use type guards for runtime checks

4. **Error Handling**
   - Use custom error classes (e.g., `ApiError`)
   - Provide meaningful error messages
   - Include HTTP status codes where applicable
   - Let centralized error middleware handle responses

### Testing & Verification

1. **After Making Changes**
   - Run the linter: `npm run lint`
   - Check TypeScript compilation: `npm run build`
   - Run tests if they exist: `npm test`
   - Verify in development mode: `npm run dev`

2. **Before Claiming Completion**
   - Ensure no linting errors
   - Verify TypeScript compilation succeeds
   - Test the feature manually if applicable
   - Check for unintended side effects in related code

### Critical Rules

❌ **Never Do:**
- Ignore existing patterns and "reinvent the wheel"
- Mix different architectural styles in the same project
- Commit secrets, API keys, or credentials
- Modify configuration files without understanding impact
- Assume behavior without testing
- Use deprecated packages or patterns

✅ **Always Do:**
- Read before writing
- Follow existing conventions
- Validate inputs
- Handle errors gracefully
- Write self-documenting code
- Test your changes ( only when it is requested )
- Update interfaces when changing data structures

---

## 🧭 Adaptation Notes

### Customizing This Template

When adapting this template for a specific project:

1. **Identify the Stack**
   - Language: TypeScript, Python, Go, etc.
   - Framework: Express, Django, Spring Boot, etc.
   - Database: MongoDB, PostgreSQL, Redis, etc.

2. **Map the Architecture**
   - Locate the source directory
   - Identify module organization pattern
   - Document routing/endpoint structure
   - Note middleware/interceptor locations

3. **Document Conventions**
   - Code style (from ESLint, Prettier, Black, etc.)
   - Naming patterns (from existing files)
   - Testing approach (unit, integration, e2e)
   - Git workflow (branch naming, commit messages)

4. **List Integration Points**
   - External APIs and services
   - Authentication/authorization mechanism
   - Logging framework
   - Monitoring/observability tools

### Project-Specific Additions

Add sections for:
- **Domain-Specific Rules**: Business logic constraints
- **Performance Guidelines**: Caching, optimization patterns
- **Security Requirements**: Authentication, authorization, data protection
- **API Contracts**: Request/response formats, versioning
- **Database Migrations**: Schema change procedures
- **Deployment Process**: CI/CD, environment promotion

---

## 📖 Using This Document

**For AI Agents:**
1. Read this file before starting any task
2. Use it as a checklist when writing code
3. Refer to it when uncertain about conventions
4. Propose updates when discovering new patterns

**For Developers:**
1. Keep this file updated as the project evolves
2. Add project-specific rules and exceptions
3. Document any deviations from standard patterns
4. Use it for onboarding new team members (human or AI)

---

**Remember:** The goal is not rigid conformity, but consistent, maintainable code that follows the project's established philosophy. When in doubt, prioritize clarity and consistency over cleverness.
