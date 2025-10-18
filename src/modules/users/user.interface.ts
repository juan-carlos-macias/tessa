import { Document, Types } from 'mongoose';

export enum UserRole {
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE',
}

export interface IUser {
    _id?: Types.ObjectId;
    ownerId: Types.ObjectId;
    name: string;
    password?: string;
    email: string;
    role: UserRole;
    createdAt?: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
    _id: Types.ObjectId;
}
