/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import OwnerService from '../../../modules/owners/owner.service';
import UserOrchestrator from '../../../orchestrators/users/user.orchestrator';

class OwnerController {
    public async create(req: Request, res: Response): Promise<void> {
        const { name, email, password } = req.body;

        const owner = await UserOrchestrator.createOwnerWithFirebase({
            name,
            email,
            password,
        });

        res.status(httpStatus.CREATED).json({
            status: 'success',
            data: owner,
        });
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const id = new Types.ObjectId(req.params.id);
        const owner = await OwnerService.getOwnerById(id);
        res.status(httpStatus.OK).json({
            status: 'success',
            data: owner,
        });
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const id = new Types.ObjectId(req.params.id);

        UserOrchestrator.deleteOwner(id);

        res.status(httpStatus.NO_CONTENT).send();
    }
}

export default new OwnerController();
