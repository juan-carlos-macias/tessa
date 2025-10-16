import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import config from 'config';
import winston from 'winston';
import Routes from '../routes/routes';
import {
    uncaughtExceptionLogger,
    configWinstonLogger,
} from './config/winston.config';
import { ErrorConverter, ErrorHandler } from '../modules/errors';
import reponseMiddleware from '../middlewares/response';

class App {
    public app: express.Application;

    private serverListener?: any;

    public constructor() {
        this.app = express();
        uncaughtExceptionLogger();
        configWinstonLogger();
        winston.debug('Logger configured ...');

        this.setMiddlewares();
        this.setRoutes();
        this.setErrorHandlers();
    }

    private setMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(helmet());
        this.app.use(cors({ credentials: true, origin: true }));
        this.app.use(reponseMiddleware);
        winston.debug('Middlewares configured ...');
    }

    private setRoutes(): void {
        const router = new Routes(this.app);
        router.setRoutes();
        winston.debug('Routes configured ...');
    }

    private setErrorHandlers() {
        this.app.use(ErrorConverter);
        this.app.use(ErrorHandler);
        winston.debug('Error handlers configured ...');
    }

    public listen(): void {
        const port: number = config.get('port');
        this.serverListener = this.app.listen(port, () => {
            winston.info(`Server running on port ${port} ...`);
        });
    }

    public async close(): Promise<void> {
        if (this.serverListener) {
            this.serverListener.close();
        }
    }
}

export default new App();
