import { body, param } from 'express-validator';
import createValidation from '../common/plugins/createValidator';
import { UserRole } from './user.interface';

class UserValidation {
    public static createUser() {
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
                .isLength({ min: 6 })
                .withMessage(
                    'Password is required and must be at least 6 characters long.'
                )
                .matches(/[A-Z]/)
                .withMessage(
                    'Password must contain at least one capital letter.'
                ),
            body('ownerId')
                .exists()
                .withMessage('ownerId is required')
                .isMongoId()
                .withMessage('ownwerId must be valid'),
            body('role')
                .exists()
                .isIn(Object.values(UserRole))
                .withMessage(
                    `role must be one of ${Object.values(UserRole).join(', ')}`
                ),
        ]);
    }

    public static getUserById() {
        return createValidation([
            param('id')
                .exists()
                .withMessage('id is required')
                .isMongoId()
                .withMessage('id must be valid'),
        ]);
    }

    public static updateUserRole() {
        return createValidation([
            param('id')
                .exists()
                .withMessage('id is required')
                .isMongoId()
                .withMessage('id must be valid'),
            body('role')
                .exists()
                .withMessage('role is required')
                .isIn(Object.values(UserRole))
                .withMessage(
                    `role must be one of ${Object.values(UserRole).join(', ')}`
                ),
        ]);
    }

    public static deleteUser() {
        return createValidation([
            param('id')
                .exists()
                .withMessage('id is required')
                .isMongoId()
                .withMessage('id must be valid'),
        ]);
    }
}

export default UserValidation;
