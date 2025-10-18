import { Document, Types } from 'mongoose';

export enum Role {
    OWNER = 'OWNER',
}

export interface IOwner {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    role?: Role.OWNER;
    createdAt?: Date;
}

export interface IOwnerDocument extends Omit<IOwner, '_id'>, Document {
    _id: Types.ObjectId;
}
