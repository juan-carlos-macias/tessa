/* eslint-disable class-methods-use-this */
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { IOwner } from './owner.interface';
import Owner from './owner.model';
import { ApiError } from '../errors';

class OwnerService {
    public async createOwner(owner: IOwner): Promise<IOwner> {
        const existingOwner = await Owner.findOne({ email: owner.email });
        if (existingOwner) {
            throw new ApiError(
                httpStatus.CONFLICT,
                'User with this email already exists'
            );
        }

        const OwnerCreated = await Owner.create(owner);

        return OwnerCreated.toObject();
    }

    public async getOwnerById(id: Types.ObjectId): Promise<IOwner | null> {

        const owner = await Owner.findById(id).lean();
        if (!owner) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        return owner;
    }

    public async deleteOwner(id: Types.ObjectId): Promise<void> {

        const owner = await Owner.findByIdAndDelete(id);
        if (!owner) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
    }
}

export default new OwnerService();
