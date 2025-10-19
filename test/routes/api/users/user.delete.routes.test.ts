/**
 * User DELETE Routes - E2E Tests
 *
 * Tests the user deletion endpoint:
 * - DELETE /tessa/v1/user/:id - Delete user
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
describe('User DELETE Routes - E2E Tests', () => {
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

    describe('DELETE /tessa/v1/user/:id', () => {
        describe('Success Cases', () => {
            it('should delete user by ID', async () => {
                // Create user
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Test User',
                        email: `user-delete1-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                const response = await request(app.app).delete(
                    `/tessa/v1/user/${userId}`
                );

                expect(response.status).toBe(204);

                const deletedUser = await UserModel.findById(userId);
                expect(deletedUser).toBeNull();
            });

            it('should delete EMPLOYEE user', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Employee User',
                        email: `employee-delete-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                const response = await request(app.app).delete(
                    `/tessa/v1/user/${userId}`
                );

                expect(response.status).toBe(204);
            });

            it('should delete MANAGER user', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Manager User',
                        email: `manager-delete-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.MANAGER,
                    });

                const userId = createResponse.body.data._id;

                const response = await request(app.app).delete(
                    `/tessa/v1/user/${userId}`
                );

                expect(response.status).toBe(204);
            });

            it('should not return data in response body', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'No Body User',
                        email: `nobody-delete-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                const response = await request(app.app).delete(
                    `/tessa/v1/user/${userId}`
                );

                expect(response.status).toBe(204);
                expect(response.body).toEqual({});
            });

            it('should permanently remove user from database', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Permanent Delete User',
                        email: `permanent-delete-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                const userBeforeDelete = await UserModel.findById(userId);
                expect(userBeforeDelete).not.toBeNull();

                await request(app.app).delete(`/tessa/v1/user/${userId}`);

                const userAfterDelete = await UserModel.findById(userId);
                expect(userAfterDelete).toBeNull();
            });
        });

        describe('Not Found Errors', () => {
            it('should return 404 when user does not exist', async () => {
                const nonExistentId = new Types.ObjectId();

                const response = await request(app.app).delete(
                    `/tessa/v1/user/${nonExistentId}`
                );

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 404 when trying to delete already deleted user', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/user')
                    .send({
                        name: 'Double Delete User',
                        email: `doubledelete-@example.com`,
                        password: 'SecurePass123!',
                        ownerId: '6819ad232a7d1f5f12288355',
                        role: UserRole.EMPLOYEE,
                    });

                const userId = createResponse.body.data._id;

                await request(app.app).delete(`/tessa/v1/user/${userId}`);

                const response = await request(app.app).delete(
                    `/tessa/v1/user/${userId}`
                );

                expect(response.status).toBe(404);
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when ID format is invalid', async () => {
                const response = await request(app.app).delete(
                    '/tessa/v1/user/invalid-id'
                );

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });
    });
});
