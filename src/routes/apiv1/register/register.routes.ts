import { Router } from 'express';
import OwnerController from '../owner/owner.controller';
import Validation from '../../../modules/owners/owner.validation';

class RegisterRoutes {
    public router: Router = Router();

    constructor() {
        this.router.post('/', Validation.createOwner(), OwnerController.create);
    }
}

export default new RegisterRoutes();
