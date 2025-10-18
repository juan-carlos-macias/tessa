import { Router } from 'express';
import catchAsync from '../../../modules/common/plugins/catchAsync';
import Validation from '../../../modules/owners/owner.validation';
import OwnerController from './owner.controller';

class OwnerRoutes {
    public router: Router = Router();

    constructor() {
        this.router.get(
            '/:id',
            Validation.getOwnerById(),
            catchAsync(OwnerController.getById)
        );
        this.router.delete(
            '/:id',
            Validation.deleteOwner(),
            catchAsync(OwnerController.delete)
        );
    }
}

export default new OwnerRoutes();
