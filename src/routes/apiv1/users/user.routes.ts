import { Router } from 'express';
import catchAsync from '../../../modules/common/plugins/catchAsync';
import UserValidation from '../../../modules/users/user.validation';
import UserController from './user.controller';

class UserRoutes {
    public router: Router = Router();

    constructor() {
        this.router.post(
            '/',
            UserValidation.createUser(),
            catchAsync(UserController.create)
        );
        this.router.get('/', catchAsync(UserController.getAll));
        this.router.get(
            '/:id',
            UserValidation.getUserById(),
            catchAsync(UserController.getById)
        );
        this.router.patch(
            '/:id/role',
            UserValidation.updateUserRole(),
            catchAsync(UserController.updateRole)
        );
        this.router.delete(
            '/:id',
            UserValidation.deleteUser(),
            catchAsync(UserController.delete)
        );
    }
}

export default new UserRoutes();
