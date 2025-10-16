// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

declare global {
    namespace Express {
        interface Response {
            respond: (data: any, status: number) => void;
        }
        interface Request {
            userId: Types.ObjectId;
        }
    }
}
