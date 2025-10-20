# Tessa API

A robust REST API built with Node.js, TypeScript, Express, and MongoDB, featuring Firebase authentication and clean architecture principles.

## 🚀 Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Firebase Authentication**: Secure user authentication and authorization
- **OpenAI Integration**: AI-powered features
- **Clean Architecture**: Organized code structure with separation of concerns
- **Validation**: Request validation using express-validator
- **Logging**: Winston logger for application monitoring
- **Testing**: Comprehensive test suite with Jest
- **Code Quality**: ESLint, Prettier, and Husky for maintaining code standards

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18.x or higher recommended)
- **npm** (v10.x or higher)
- **MongoDB** (v5.x or higher)
- **Firebase Admin SDK** credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:juan-carlos-macias/tessa.git
   cd tessa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URL=mongodb://localhost:27017/tessa
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Configure Firebase**
   
   Place your Firebase Admin SDK service account JSON file in the appropriate location and update the configuration in `config/` files.

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Production Mode
```bash
npm run build
npm start
```

## 📁 Project Structure

```
tessa/
├── config/                      # Configuration files
│   ├── default.js              # Default configuration
│   ├── development.js          # Development environment config
│   ├── production.js           # Production environment config
│   └── test.js                 # Test environment config
├── src/
│   ├── @types/                 # TypeScript type definitions
│   ├── app/                    # Application setup
│   │   ├── index.ts           # App initialization
│   │   └── config/            # App-specific configurations
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.ts           # Authentication middleware
│   │   └── response.ts       # Response formatting middleware
│   ├── modules/               # Business logic modules
│   │   ├── common/           # Common utilities
│   │   ├── errors/           # Error handling
│   │   ├── owners/           # Owner management
│   │   └── users/            # User management
│   ├── orchestrators/         # Business process orchestrators
│   │   └── users/            # User orchestration logic
│   ├── routes/                # API routes
│   │   ├── routes.ts         # Main routes configuration
│   │   └── apiv1/            # API v1 routes
│   │       ├── owner/        # Owner routes
│   │       ├── users/        # User routes
│   │       └── register/     # Registration routes
│   └── index.ts               # Application entry point
├── test/                       # Test files
│   ├── common/                # Test utilities and mocks
│   └── routes/                # Route tests
├── .env.example               # Environment variables template
├── .eslintrc                  # ESLint configuration
├── .prettierrc                # Prettier configuration
├── jest.config.ts             # Jest testing configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies and scripts
```

## 📚 API Documentation

### Complete API Documentation

For detailed API documentation including all endpoints, parameters, request/response examples, and error handling, please refer to:

- **[API Specifications](./docs/api/API_SPECIFICATIONS.md)** - General API specifications, authentication, response formats, and conventions
- **[Register Endpoints](./docs/api/REGISTER_ENDPOINTS.md)** - Owner registration endpoints
- **[Owner Endpoints](./docs/api/OWNER_ENDPOINTS.md)** - Owner management endpoints
- **[User Endpoints](./docs/api/USER_ENDPOINTS.md)** - User management endpoints

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run verbose tests
```bash
npm run test:verbose
```

## 🎨 Code Quality

### Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

### Code Formatting
The project uses Prettier for code formatting. Husky and lint-staged ensure code is formatted before commits.

## 📦 Dependencies

### Main Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **firebase-admin**: Firebase authentication
- **winston**: Logging
- **helmet**: Security headers
- **cors**: CORS support
- **dotenv**: Environment variables

### Development Dependencies
- **typescript**: TypeScript compiler
- **ts-node**: TypeScript execution
- **nodemon**: Development server
- **jest**: Testing framework
- **eslint**: Code linting
- **prettier**: Code formatting
- **husky**: Git hooks

## 🏗️ Architecture

The application follows **Clean Architecture** principles:

1. **Controllers** (`src/routes/apiv1/*/controller.ts`): Handle HTTP requests and responses
2. **Services** (`src/modules/*/service.ts`): Business logic and data access
3. **Orchestrators** (`src/orchestrators/`): Coordinate complex operations across multiple services
4. **Models** (`src/modules/*/model.ts`): MongoDB schemas and models
5. **Interfaces** (`src/modules/*/interface.ts`): TypeScript type definitions
6. **Validators** (`src/modules/*/validation.ts`): Request validation schemas

## 🔒 Security

- Firebase Admin SDK for authentication
- API key authentication
- Helmet for security headers
- Input validation with express-validator
- Password hashing (via Firebase)
- CORS configuration

## 📝 Logging

Winston logger is configured with:
- Console transport for development
- File transport for production
- Structured logging format
- Log levels: error, warn, info, debug

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Guidelines
- Follow conventional commits format
- Write clear, descriptive commit messages
- Keep commits atomic and focused

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Juan Carlos Macías - [GitHub](https://github.com/juan-carlos-macias)

## 🐛 Issues

Report issues at: [GitHub Issues](https://github.com/juan-carlos-macias/tessa/issues)

## 📞 Support

For support and questions, please contact the development team.

---

**Note**: This API is under active development. Features and endpoints may change.
