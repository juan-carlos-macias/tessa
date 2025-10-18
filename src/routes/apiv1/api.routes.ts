/* eslint-disable class-methods-use-this */

import { Router, IRouter } from 'express';
import { firebaseAuth } from '../../middlewares/auth';
import UserRoutes from './users/user.routes';
import RegisterRoutes from './register/register.routes';
import OwnerRoutes from './owner/owner.routes';

class ApiRoutes {
    public router: IRouter;

    constructor() {
        this.router = Router();
        this.setup();
    }

    private setup(): void {
        this.router.use('/user', firebaseAuth, UserRoutes.router);
        this.router.use('/register', RegisterRoutes.router);
        this.router.use('/owner', OwnerRoutes.router);
    }
}

export default new ApiRoutes();
