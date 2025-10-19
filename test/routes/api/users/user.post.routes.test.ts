/**
 * User Routes - E2E Tests
 *
 * Tests the create user endpoint:
 * - POST /tessa/v1/user - Creating new users
 */

import request from 'supertest';
import FirebaseMock, { winstonMock } from '../../../common/mocks/pluggins';
import { onDBConnectionsReady } from '../../../../src/modules/db.module';
import cleanUp from '../../../common/helpers/cleanUp';
import app from '../../../../src/app';
import OwnerModel from '../../../../src/modules/owners/owner.model';
import UserModel from '../../../../src/modules/users/user.model';
import TestDbServices from '../../../common/helpers/TestDbServices';
import { UserRole } from '../../../../src/modules/users/user.interface';

jest.mock('winston', () => winstonMock);
jest.mock(
    '../../../../src/modules/common/plugins/firebase',
    () => FirebaseMock
);
jest.mock('../../../../src/middlewares/auth', () =>
    require('../../../common/mocks/authMock').createAuthMock(
        '6819ad232a7d1f5f12288355',
        'OWNER'
    )
);

describe('User POST Routes - E2E Tests', () => {
    beforeAll((done) => {
        onDBConnectionsReady(() => {
            done();
        });
    });

    beforeEach(async () => {
        await OwnerModel.deleteMany({});
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await TestDbServices.close();
        jest.restoreAllMocks();
        await cleanUp();
    });

    describe('POST /tessa/v1/user', () => {
        describe('Success Cases', () => {
            it('should create a new employee user with valid data', async () => {
                // Create owner first
                const ownerResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'owner-emp@example.com',
                        password: 'SecurePass123!',
                    });

                const testOwnerId = ownerResponse.body.data._id;

                const userData = {
                    name: 'Test Employee',
                    email: 'employee@example.com',
                    password: 'SecurePassword123!',
                    ownerId: testOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(userData);

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data.name).toBe(userData.name);
                expect(response.body.data.email).toBe(userData.email);
                expect(response.body.data.role).toBe(userData.role);
                expect(response.body.data.ownerId).toBe(testOwnerId);
                expect(response.body.data).not.toHaveProperty('password');
            });

            it('should create a new manager user with valid data', async () => {
                // Create owner first
                const ownerResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'owner-mgr@example.com',
                        password: 'SecurePass123!',
                    });

                const testOwnerId = ownerResponse.body.data._id;

                const userData = {
                    name: 'Test Manager',
                    email: 'manager@example.com',
                    password: 'SecurePassword123!',
                    ownerId: testOwnerId,
                    role: UserRole.MANAGER,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(userData);

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.role).toBe(UserRole.MANAGER);
            });

            it('should return user with correct structure', async () => {
                const ownerResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'owner-struct@example.com',
                        password: 'SecurePass123!',
                    });

                const testOwnerId = ownerResponse.body.data._id;

                const userData = {
                    name: 'Structure Test User',
                    email: 'structure@example.com',
                    password: 'SecurePassword123!',
                    ownerId: testOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(userData);

                expect(response.status).toBe(201);
                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data).toHaveProperty('name');
                expect(response.body.data).toHaveProperty('email');
                expect(response.body.data).toHaveProperty('role');
                expect(response.body.data).toHaveProperty('ownerId');
                expect(response.body.data).toHaveProperty('createdAt');
                expect(response.body.data).not.toHaveProperty('password');
            });

            it('should return user with createdAt timestamp', async () => {
                const ownerResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'owner-time@example.com',
                        password: 'SecurePass123!',
                    });

                const testOwnerId = ownerResponse.body.data._id;

                const userData = {
                    name: 'Timestamped User',
                    email: 'timestamp@example.com',
                    password: 'SecurePassword123!',
                    ownerId: testOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(userData);

                expect(response.status).toBe(201);
                expect(response.body.data).toHaveProperty('createdAt');
                expect(new Date(response.body.data.createdAt)).toBeInstanceOf(
                    Date
                );
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when name is missing', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when name is too short', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'A',
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when email is missing', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    password: 'SecurePassword123!',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when email format is invalid', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    email: 'invalid-email-format',
                    password: 'SecurePassword123!',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when password is missing', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when password is too short', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Short',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when password has no capital letter', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'nocapitals123',
                    ownerId: mockOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when ownerId is missing', async () => {
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when ownerId format is invalid', async () => {
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                    ownerId: 'invalid-id',
                    role: UserRole.EMPLOYEE,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when role is missing', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                    ownerId: mockOwnerId,
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when role is invalid', async () => {
                const mockOwnerId = '6819ad232a7d1f5f12288355';
                const invalidData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                    ownerId: mockOwnerId,
                    role: 'INVALID_ROLE',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });

        describe('Conflict Errors', () => {
            it('should return 409 when email already exists', async () => {
                const ownerResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'owner-dup@example.com',
                        password: 'SecurePass123!',
                    });

                const testOwnerId = ownerResponse.body.data._id;

                const userData = {
                    name: 'Test User',
                    email: 'duplicate@example.com',
                    password: 'SecurePassword123!',
                    ownerId: testOwnerId,
                    role: UserRole.EMPLOYEE,
                };

                await request(app.app).post('/tessa/v1/user').send(userData);

                const response = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Another User',
                        email: 'duplicate@example.com',
                        password: 'DifferentPassword123!',
                        ownerId: testOwnerId,
                        role: UserRole.MANAGER,
                    });

                expect(response.status).toBe(409);
                expect(response.body).toHaveProperty('message');
            });
        });
    });
});
