import firebaseAdmin from 'firebase-admin';
import httpStatus from 'http-status';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import config from 'config';
import { ApiError } from '../../errors';

class Firebase {
    private auth: firebaseAdmin.auth.Auth;

    constructor() {
        const firebaseConfig: string = config.get('firebase.firebaseConfig');
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(firebaseConfig),
        });
        this.auth = firebaseAdmin.auth();
    }

    public async createUser(
        userData: object
    ): Promise<firebaseAdmin.auth.UserRecord> {
        try {
            const userRecord: UserRecord = await this.auth.createUser(userData);
            return userRecord;
        } catch (error) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Error creating new user ${error}`
            );
        }
    }
}

export default new Firebase();
