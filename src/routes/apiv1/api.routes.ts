/* eslint-disable class-methods-use-this */

import { Router, IRouter } from 'express';

class ApiRoutes {
    public router: IRouter;

    constructor() {
        this.router = Router();
        this.setup();
    }

    private setup(): void {}
}

export default new ApiRoutes();
