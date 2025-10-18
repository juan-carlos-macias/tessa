import { Schema } from 'mongoose';
import { IOwnerDocument, Role } from './owner.interface';
import { app } from '../db.module';

const OwnerSchema = new Schema<IOwnerDocument>(
    {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: {
            type: String,
            required: true,
            default: Role.OWNER,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Owner = app.model<IOwnerDocument>('Owner', OwnerSchema, 'owners');

export default Owner;
