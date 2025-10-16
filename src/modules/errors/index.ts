/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import config from 'config';
import winston from 'winston';
import ApiError from './ApiError';

const ErrorConverter = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;
    if (!(err instanceof ApiError)) {
        const isMongoError = error instanceof mongoose.Error;
        const statusCode =
            err.statusCode || isMongoError
                ? httpStatus.BAD_REQUEST
                : httpStatus.INTERNAL_SERVER_ERROR;
        const message = err.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

const ErrorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { statusCode, message } = err;
    const inProduction: boolean = config.get('production');
    const response = {
        code: statusCode,
        message,
        ...(!inProduction && { stack: err.stack }),
    };

    if (!inProduction) {
        winston.error(err.stack);
    }

    res.status(statusCode).send(response);
};

export { ErrorConverter, ErrorHandler, ApiError };
