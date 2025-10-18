import { body, param } from 'express-validator';
import createValidation from '../common/plugins/createValidator';

class Validation {
    public static createOwner() {
        return createValidation([
            body('name')
                .exists()
                .withMessage('name is required')
                .isString()
                .withMessage('name must be a string')
                .isLength({ min: 2 })
                .withMessage('name must be at least 2 characters long'),
            body('email')
                .exists()
                .withMessage('email is required')
                .isEmail()
                .withMessage('email must be valid'),
            body('password')
                .exists()
                .isLength({ min: 8 })
                .withMessage(
                    'Password is required and must be at least 8 characters long.'
                )
                .matches(/[A-Z]/)
                .withMessage(
                    'Password must contain at least one capital letter.'
                ),
        ]);
    }

    public static getOwnerById() {
        return createValidation([
            param('id')
                .exists()
                .withMessage('id is required')
                .isMongoId()
                .withMessage('id must be valid'),
        ]);
    }

    public static deleteOwner() {
        return createValidation([
            param('id')
                .exists()
                .withMessage('id is required')
                .isMongoId()
                .withMessage('id must be valid'),
        ]);
    }
}

export default Validation;
