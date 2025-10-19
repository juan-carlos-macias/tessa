/**
 * Shared mock utility functions
 * Import these functions in your test files instead of defining mocks inline
 *
 * Usage:
 * import { mockFirebase, mockWinston, mockAuth } from '../../../common/mocks/testMocks';
 *
 * mockFirebase();
 * mockWinston();
 * mockAuth('ADMIN');
 */

import FirebaseMock, { winstonMock } from './pluggins';

/**
 * Mock Firebase Admin SDK
 * Call this at the top of your test file before imports
 */
export const mockFirebase = () => {
    jest.mock('firebase-admin', () => FirebaseMock);
};

/**
 * Mock Winston logger
 * Call this at the top of your test file before imports
 */
export const mockWinston = () => {
    jest.mock('winston', () => winstonMock);
};

/**
 * Mock Auth middleware
 * @param role - The role to assign to the mock user (default: 'ADMIN')
 */
export const mockAuth = (role: string = 'ADMIN') => {
    jest.mock('../../../src/middlewares/auth', () => ({
        firebaseAuth: jest.fn((req, res, next) => {
            req.userId = 'test-user-id-123';
            req.role = role;
            next();
        }),
        apiBasicAuthorization: jest.fn((req, res, next) => next()),
        appApiKeyAuthorization: jest.fn((req, res, next) => next()),
    }));
};
