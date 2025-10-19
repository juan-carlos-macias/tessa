/**
 * User GET Routes - E2E Tests
 *
 * Tests the user retrieval endpoint:
 * - GET /tessa/v1/user - Get all users for an owner
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

describe('User GET Routes - E2E Tests', () => {
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

    describe('GET /tessa/v1/user', () => {
        describe('Success Cases', () => {
            it('should return all users for an owner', async () => {
                await request(app.app).post('/tessa/v1/user').send({
                    name: 'User 1',
                    email: 'user1@example.com',
                    password: 'SecurePass123!',
                    ownerId: '6819ad232a7d1f5f12288355',
                    role: UserRole.EMPLOYEE,
                });

                await request(app.app).post('/tessa/v1/user').send({
                    name: 'User 2',
                    email: 'user2@example.com',
                    password: 'SecurePass123!',
                    ownerId: '6819ad232a7d1f5f12288355',
                    role: UserRole.MANAGER,
                });

                const response = await request(app.app).get('/tessa/v1/user');

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body).toHaveProperty('data');
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBe(2);
            });

            it('should return empty array when no users exist', async () => {
                const response = await request(app.app).get('/tessa/v1/user');

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body.data).toEqual([]);
            });

            it('should return users with correct structure', async () => {
                await request(app.app).post('/tessa/v1/user').send({
                    name: 'Structured User',
                    email: `structured-@example.com`,
                    password: 'SecurePass123!',
                    ownerId: '6819ad232a7d1f5f12288355',
                    role: UserRole.EMPLOYEE,
                });

                const response = await request(app.app).get('/tessa/v1/user');

                expect(response.status).toBe(200);
                expect(response.body.data[0]).toHaveProperty('_id');
                expect(response.body.data[0]).toHaveProperty('name');
                expect(response.body.data[0]).toHaveProperty('email');
                expect(response.body.data[0]).toHaveProperty('role');
                expect(response.body.data[0]).toHaveProperty('ownerId');
                expect(response.body.data[0]).toHaveProperty('createdAt');
            });

            it('should return both EMPLOYEE and MANAGER users', async () => {
                await request(app.app).post('/tessa/v1/user').send({
                    name: 'Employee User',
                    email: `employee-get-@example.com`,
                    password: 'SecurePass123!',
                    ownerId: '6819ad232a7d1f5f12288355',
                    role: UserRole.EMPLOYEE,
                });

                await request(app.app).post('/tessa/v1/user').send({
                    name: 'Manager User',
                    email: `manager-get-@example.com`,
                    password: 'SecurePass123!',
                    ownerId: '6819ad232a7d1f5f12288355',
                    role: UserRole.MANAGER,
                });

                const response = await request(app.app).get('/tessa/v1/user');

                expect(response.status).toBe(200);
                expect(response.body.data.length).toBe(2);

                const roles = response.body.data.map((user: any) => user.role);
                expect(roles).toContain(UserRole.EMPLOYEE);
                expect(roles).toContain(UserRole.MANAGER);
            });
        });
    });
});
