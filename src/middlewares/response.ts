import { Request, Response, NextFunction } from 'express';

const responseMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.respond = (data: any, status: number) => {
        const response = { status, ...data };
        res.status(status).json(response);
    };

    next();
};

export default responseMiddleware;
