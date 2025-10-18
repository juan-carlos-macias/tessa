import httpStatus from 'http-status';
import { Types } from 'mongoose';
import UserService from '../../modules/users/user.service';
import OwnerService from '../../modules/owners/owner.service';
import { ApiError } from '../../modules/errors';
import { IUser } from '../../modules/users/user.interface';
import FirebaseService from '../../modules/common/plugins/firebase';
import { IOwner } from '../../modules/owners/owner.interface';

class UserOrchestrator {
    static async createEmployeeWithFirebase(data: IUser): Promise<IUser> {
        const { name, email, role, password, ownerId } = data;
        const userId = new Types.ObjectId();

        let createdUser: IUser | null = null;

        try {
            createdUser = await UserService.createUser({
                _id: userId,
                ownerId,
                name,
                email,
                role,
            });
            await FirebaseService.createUser({
                uid: userId.toString(),
                email: data.email,
                password,
                displayName: data.name,
            });

            return createdUser;
        } catch (error) {
            if (createdUser) {
                await UserService.deleteUser(userId);
            }
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Failed to create user'
            );
        }
    }

    static async createOwnerWithFirebase(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<IOwner> {
        const userId = new Types.ObjectId();

        let createdOwner: IOwner | null = null;

        try {
            createdOwner = await OwnerService.createOwner({
                _id: userId,
                name: data.name,
                email: data.email,
            });
            await FirebaseService.createUser({
                uid: userId.toString(),
                email: data.email,
                password: data.password,
                displayName: data.name,
            });

            return createdOwner;
        } catch (error) {
            if (createdOwner) {
                await UserService.deleteUser(userId);
            }
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Failed to create user'
            );
        }
    }

    static async deleteUser(id: Types.ObjectId): Promise<void> {
        let deletedUser: IUser | null = null;

        try {
            const user = await UserService.getUserById(id);

            await UserService.deleteUser(id);
            deletedUser = user;

            await FirebaseService.deleteUser(id.toString());
        } catch (error) {
            if (deletedUser) {
                try {
                    await UserService.createUser({
                        _id: deletedUser._id,
                        ownerId: deletedUser.ownerId,
                        name: deletedUser.name,
                        email: deletedUser.email,
                        role: deletedUser.role,
                    });
                } catch (rollbackError) {
                    throw new ApiError(
                        httpStatus.INTERNAL_SERVER_ERROR,
                        'Failed to delete user and rollback failed. Data inconsistency detected.'
                    );
                }
            }

            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Failed to delete user'
            );
        }
    }

    static async deleteOwner(id: Types.ObjectId): Promise<void> {
        let deletedOwner: IOwner | null = null;

        try {
            const owner = await OwnerService.getOwnerById(id);

            await OwnerService.deleteOwner(id);
            deletedOwner = owner;

            await FirebaseService.deleteUser(id.toString());
        } catch (error) {
            if (deletedOwner) {
                try {
                    await OwnerService.createOwner({
                        _id: deletedOwner._id,
                        name: deletedOwner.name,
                        email: deletedOwner.email,
                    });
                } catch (rollbackError) {
                    throw new ApiError(
                        httpStatus.INTERNAL_SERVER_ERROR,
                        'Failed to delete user and rollback failed. Data inconsistency detected.'
                    );
                }
            }

            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Failed to delete user'
            );
        }
    }
}

export default UserOrchestrator;
