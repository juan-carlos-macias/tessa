/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response, NextFunction } from 'express';
import config from 'config';
import httpStatus from 'http-status';
import admin from 'firebase-admin';
import { ApiError } from '../modules/errors';

export async function firebaseAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const errorMessage = 'Unauthorized Token. Access Denied';
    try {
        const token = req.headers?.userauthorization;

        if (typeof token !== 'string')
            throw new ApiError(httpStatus.UNAUTHORIZED, errorMessage);

        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken)
            throw new ApiError(httpStatus.UNAUTHORIZED, errorMessage);
        const { user_id } = decodedToken;

        req.userId = user_id;

        next();
    } catch (e: any) {
        const tokenExpiredMessage = 'The access token expired';
        if (e.errorInfo?.code === 'auth/id-token-expired')
            throw new ApiError(httpStatus.UNAUTHORIZED, tokenExpiredMessage);
        throw new ApiError(httpStatus.UNAUTHORIZED, errorMessage);
    }
}
export function apiBasicAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authorization = req.header('authorization');

    if (!authorization || authorization.indexOf('Basic ') === -1)
        throw new ApiError(401, 'Missing Authorization Header');

    const base64Credentials = authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii'
    );
    const [username, password] = credentials.split(':');

    const apiUsername: string = config.get('authorization.username');
    const apiPassword: string = config.get('authorization.password');

    if (username !== apiUsername || password !== apiPassword)
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'Invalid Authentication Credentials'
        );

    next();
}
export function appApiKeyAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const appApiKeyHeader = req.header('app-api-key');
    if (!appApiKeyHeader && typeof appApiKeyHeader !== 'string')
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Missing Api Key Header');

    const appApiKey = config.get('authorization.appApiKey');
    if (appApiKey !== appApiKeyHeader)
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Api Key Header');

    next();
}
