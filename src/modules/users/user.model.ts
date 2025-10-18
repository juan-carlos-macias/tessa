import { Schema } from 'mongoose';
import { IUserDocument, UserRole } from './user.interface';
import { app } from '../db.module';

const UserSchema = new Schema<IUserDocument>(
    {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        ownerId: { type: Schema.Types.ObjectId, required: true },
        email: { type: String, required: true, unique: true },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
            default: UserRole.EMPLOYEE,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const User = app.model<IUserDocument>('User', UserSchema, 'users');

export default User;
