/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { IUser, UserRole } from '../../../modules/users/user.interface';
import UserService from '../../../modules/users/user.service';
import UserOrchestrator from '../../../orchestrators/users/user.orchestrator';

class UserController {
    public async create(req: Request, res: Response): Promise<void> {
        const { name, email, role, password, ownerId } = req.body;

        const user: IUser = await UserOrchestrator.createEmployeeWithFirebase({
            name,
            email,
            ownerId,
            role,
            password,
        });

        res.status(httpStatus.CREATED).json({
            status: 'success',
            data: user,
        });
    }

    public async getAll(req: Request, res: Response): Promise<void> {
        const ownerId = new Types.ObjectId(req.userId as string);
        const users = await UserService.getAllUsers(ownerId);
        res.status(httpStatus.OK).json({
            status: 'success',
            data: users,
        });
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const id = new Types.ObjectId(req.params.id);
        const user = await UserService.getUserById(id);
        res.status(httpStatus.OK).json({
            status: 'success',
            data: user,
        });
    }

    public async updateRole(req: Request, res: Response): Promise<void> {
        const id = new Types.ObjectId(req.params.id);

        const updatedUser = await UserService.updateUserRole(
            id,
            req.body.role as UserRole
        );
        res.status(httpStatus.OK).json({
            status: 'success',
            data: updatedUser,
        });
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const id = new Types.ObjectId(req.params.id);

        await UserOrchestrator.deleteUser(id);

        res.status(httpStatus.NO_CONTENT).send();
    }
}

export default new UserController();
