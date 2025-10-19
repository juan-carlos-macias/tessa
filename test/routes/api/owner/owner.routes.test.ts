/**
 * Owner Routes - E2E Tests
 *
 * Tests the complete owner management endpoints including:
 * - Getting owner by ID
 * - Deleting owners
 */

import request from 'supertest';
import { Types } from 'mongoose';
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

describe('Owner Routes - E2E Tests', () => {
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

    describe('GET /tessa/v1/owner/:id', () => {
        describe('Success Cases', () => {
            it('should return owner by ID', async () => {
                // Create owner through API
                const createResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'owner@example.com',
                        password: 'SecurePass123!',
                    });

                expect(createResponse.status).toBe(201);
                const ownerId = createResponse.body.data._id;

                const response = await request(app.app).get(
                    `/tessa/v1/owner/${ownerId}`
                );

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('status', 'success');
                expect(response.body).toHaveProperty('data');
                expect(response.body.data._id).toBe(ownerId);
                expect(response.body.data.name).toBe('Test Owner');
                expect(response.body.data.email).toBe('owner@example.com');
                expect(response.body.data.role).toBe('OWNER');
            });

            it('should return owner with correct structure', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Another Owner',
                        email: 'another@example.com',
                        password: 'SecurePass123!',
                    });

                expect(createResponse.status).toBe(201);
                const ownerId = createResponse.body.data._id;

                const response = await request(app.app).get(
                    `/tessa/v1/owner/${ownerId}`
                );

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data).toHaveProperty('name');
                expect(response.body.data).toHaveProperty('email');
                expect(response.body.data).toHaveProperty('role');
                expect(response.body.data).toHaveProperty('createdAt');
            });
        });

        describe('Not Found Errors', () => {
            it('should return 404 when owner does not exist', async () => {
                const nonExistentId = new Types.ObjectId();

                const response = await request(app.app).get(
                    `/tessa/v1/owner/${nonExistentId}`
                );

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('message');
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when ID format is invalid', async () => {
                const response = await request(app.app).get(
                    '/tessa/v1/owner/invalid-id'
                );

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });
    });

    describe('DELETE /tessa/v1/owner/:id', () => {
        describe('Success Cases', () => {
            it('should delete owner by ID', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner',
                        email: 'delete-test@example.com',
                        password: 'SecurePass123!',
                    });

                expect(createResponse.status).toBe(201);
                const ownerId = createResponse.body.data._id;

                const response = await request(app.app).delete(
                    `/tessa/v1/owner/${ownerId}`
                );

                expect(response.status).toBe(204);

                const deletedOwner = await OwnerModel.findById(ownerId);
                expect(deletedOwner).toBeNull();
            });

            it('should not return data in response body', async () => {
                const createResponse = await request(app.app)
                    .post('/tessa/v1/register')
                    .send({
                        name: 'Test Owner 2',
                        email: 'delete-test2@example.com',
                        password: 'SecurePass123!',
                    });

                expect(createResponse.status).toBe(201);
                const ownerId = createResponse.body.data._id;

                const response = await request(app.app).delete(
                    `/tessa/v1/owner/${ownerId}`
                );

                expect(response.status).toBe(204);
                expect(response.body).toEqual({});
            });
        });

        describe('Validation Errors', () => {
            it('should return 400 when ID format is invalid', async () => {
                const response = await request(app.app).delete(
                    '/tessa/v1/owner/invalid-id'
                );

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
            });
        });
    });
});
