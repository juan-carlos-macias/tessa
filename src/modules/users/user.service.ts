/* eslint-disable class-methods-use-this */
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { IUser, UserRole } from './user.interface';
import User from './user.model';
import { ApiError } from '../errors';

class UserService {
    public async createUser(user: IUser): Promise<IUser> {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            throw new ApiError(
                httpStatus.CONFLICT,
                'User with this email already exists'
            );
        }

        const userCreated = await User.create(user);

        return userCreated.toObject();
    }

    public async getAllUsers(ownerId: Types.ObjectId): Promise<IUser[]> {
        const users = await User.find({ownerId}).lean();
        return users;
    }

    public async getUserById(id: Types.ObjectId): Promise<IUser | null> {
        const user = await User.findById(id).lean();

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        return user;
    }

    public async updateUserRole(
        id: Types.ObjectId,
        role: UserRole
    ): Promise<IUser> {
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).lean();

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        return user;
    }

    public async deleteUser(id: Types.ObjectId): Promise<void> {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
    }
}

export default new UserService();
