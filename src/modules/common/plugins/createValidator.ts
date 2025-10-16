import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
    RequestParamHandler,
} from 'express';
import {
    ContextRunner,
    ValidationChain,
    validationResult,
} from 'express-validator';
import httpStatus from 'http-status';
import { ApiError } from '../../errors';

export default function createValidation(
    validators: ValidationChain[] | ContextRunner[] | RequestParamHandler[]
) {
    return [
        ...validators,
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    errors
                        .array()
                        .map((e) => e.msg)
                        .join(', ')
                );
            }

            next();
        },
    ] as RequestHandler[];
}
