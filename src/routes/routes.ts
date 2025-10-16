import { Application } from 'express';
import httpStatus from 'http-status';
import ApiRoutesV1 from './apiv1/api.routes';
import { ApiError } from '../modules/errors';
import { apiBasicAuthorization } from '../middlewares/auth';

export default class Routes {
    public app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public setRoutes(): void {
        this.app.use(
            '/tessa/v1',
            apiBasicAuthorization,
            ApiRoutesV1.router
        );

        this.app.get('/', (req, res) => {
            res.respond(
                {
                    message: 'Welcome to Tessa API',
                    data: {
                        version: '1.0.0',
                        status: 'running',
                    },
                },
                httpStatus.OK
            );
        });

        this.app.use((req, res, next) => {
            next(new ApiError(httpStatus.NOT_FOUND, 'Route Not found'));
        });
    }
}
