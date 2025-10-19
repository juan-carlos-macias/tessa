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
