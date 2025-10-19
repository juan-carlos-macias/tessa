/**
 * Register Routes - E2E Tests
 *
 * Tests the owner registration endpoint including:
 * - Creating new owner accounts
 */

import request from 'supertest';
import FirebaseMock, { winstonMock } from '../../../common/mocks/pluggins';
import { onDBConnectionsReady } from '../../../../src/modules/db.module';
import cleanUp from '../../../common/helpers/cleanUp';
import app from '../../../../src/app';
import OwnerModel from '../../../../src/modules/owners/owner.model';
import TestDbServices from '../../../common/helpers/TestDbServices';

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

describe('Register Routes - E2E Tests', () => {
    beforeAll((done) => {
        onDBConnectionsReady(() => {
            done();
        });
    });

    beforeEach(async () => {
        await OwnerModel.deleteMany({});
    });

    afterAll(async () => {
        await TestDbServices.close();
        jest.restoreAllMocks();
        await cleanUp();
    });

    describe('POST /tessa/v1/register', () => {
        describe('Success Cases', () => {
            it('should create a new owner with valid data', async () => {
                const ownerData = {
                    name: 'New Owner',
                    email: 'newowner@example.com',
                    password: 'SecurePassword123!',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(ownerData);

                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data.name).toBe(ownerData.name);
                expect(response.body.data.email).toBe(ownerData.email);
                expect(response.body.data.role).toBe('OWNER');
                expect(response.body.data).not.toHaveProperty('password');
            });

            it('should persist owner to database', async () => {
                const ownerData = {
                    name: 'Test Owner',
                    email: 'testowner@example.com',
                    password: 'SecurePassword123!',
                };

                const createResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(ownerData);

                expect(createResponse.status).toBe(201);

                const getResponse = await request(app.app).get(
                    `/tessa/v1/owner/${createResponse.body.data._id}`
                );

                expect(getResponse.status).toBe(200);
                expect(getResponse.body.data).toBeDefined();
                expect(getResponse.body.data.name).toBe(ownerData.name);
                expect(getResponse.body.data.email).toBe(ownerData.email);
                expect(getResponse.body.data.role).toBe('OWNER');
            });

            it('should return owner with createdAt timestamp', async () => {
                const ownerData = {
                    name: 'Owner With Timestamp',
                    email: 'timestamp@example.com',
                    password: 'SecurePassword123!',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(ownerData);

                expect(response.status).toBe(201);
                expect(response.body.data).toHaveProperty('createdAt');
                expect(new Date(response.body.data.createdAt)).toBeInstanceOf(
                    Date
                );
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when name is missing', async () => {
                const invalidData = {
                    email: 'test@example.com',
                    password: 'SecurePassword123!',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when email is missing', async () => {
                const invalidData = {
                    name: 'Test Owner',
                    password: 'SecurePassword123!',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when password is missing', async () => {
                const invalidData = {
                    name: 'Test Owner',
                    email: 'test@example.com',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });

            it('should return 400 when email format is invalid', async () => {
                const invalidData = {
                    name: 'Test Owner',
                    email: 'invalid-email-format',
                    password: 'SecurePassword123!',
                };

                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send(invalidData);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });

        describe('Conflict Errors', () => {
            it('should return 409 when email already exists', async () => {
                const ownerData = {
                    name: 'Test Owner',
                    email: 'duplicate@example.com',
                    password: 'SecurePassword123!',
                };

                // Create first owner
                await request(app.app)
                    .post('/tessa/v1/register')
                    .send(ownerData);

                // Try to create duplicate with same email
                const response = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Another Owner',
                        email: 'duplicate@example.com',
                        password: 'DifferentPassword123!',
                    });

                expect(response.status).toBe(409);
                expect(response.body).toHaveProperty('message');
            });
        });
    });
});
