/**
 * User PATCH Routes - E2E Tests
 *
 * Tests the user role update endpoint:
 * - PATCH /tessa/v1/user/:id/role - Update user role
 */

import request from 'supertest';
import { Types } from 'mongoose';
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

describe('User PATCH Routes - E2E Tests', () => {
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

    describe('PATCH /tessa/v1/user/:id/role', () => {
        describe('Success Cases', () => {
            it('should update user role from EMPLOYEE to MANAGER', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Test User',
                        email: `user-patch1-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                const response = await request(app.app)
                    .patch(`/tessa/v1/user/${userId}/role`)
                    .send({
                        role: UserRole.MANAGER,
                    });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data._id).toBe(userId);
                expect(response.body.data.role).toBe(UserRole.MANAGER);
            });

            it('should update user role from MANAGER to EMPLOYEE', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Test Manager',
                        email: `manager-patch-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.MANAGER,
                    });

                const userId = createResponse.body.data._id;

                // Update role to EMPLOYEE
                const response = await request(app.app)
                    .patch(`/tessa/v1/user/${userId}/role`)
                    .send({
                        role: UserRole.EMPLOYEE,
                    });

                expect(response.status).toBe(200);
                expect(response.body.data.role).toBe(UserRole.EMPLOYEE);
            });

            it('should return updated user with correct structure', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Structure Test',
                        email: `structure-patch-$@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                const response = await request(app.app)
                    .patch(`/tessa/v1/user/${userId}/role`)
                    .send({
                        role: UserRole.MANAGER,
                    });

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data).toHaveProperty('name');
                expect(response.body.data).toHaveProperty('email');
                expect(response.body.data).toHaveProperty('role');
                expect(response.body.data).toHaveProperty('ownerId');
                expect(response.body.data).toHaveProperty('createdAt');
            });

            it('should persist role change in database', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Persist Test',
                        email: `persist-patch-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                await request(app.app)
                    .patch(`/tessa/v1/user/${userId}/role`)
                    .send({
                        role: UserRole.MANAGER,
                    });

                const updatedUser = await UserModel.findById(userId);
                expect(updatedUser).toBeDefined();
                expect(updatedUser?.role).toBe(UserRole.MANAGER);
            });
        });

        describe('Not Found Errors', () => {
            it('should return 404 when user does not exist', async () => {
                const nonExistentId = new Types.ObjectId();

                const response = await request(app.app)
                    .patch(`/tessa/v1/user/${nonExistentId}/role`)
                    .send({
                        role: UserRole.MANAGER,
                    });

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('message');
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when id format is invalid', async () => {
                const response = await request(app.app)
                    .patch('/tessa/v1/user/invalid-id/role')
                    .send({
                        role: UserRole.MANAGER,
                    });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when role is missing', async () => {
                const mockUserId = new Types.ObjectId();

                const response = await request(app.app)
                    .patch(`/tessa/v1/user/${mockUserId}/role`)
                    .send({});

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when role is invalid', async () => {
                const mockUserId = new Types.ObjectId();

                const response = await request(app.app)
                    .patch(`/tessa/v1/user/${mockUserId}/role`)
                    .send({
                        role: 'INVALID_ROLE',
                    });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });
    });
});
