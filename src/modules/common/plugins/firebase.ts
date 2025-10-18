import firebaseAdmin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import config from 'config';
import httpStatus from 'http-status';
import { ApiError } from '../../errors';

class Firebase {
    private auth: firebaseAdmin.auth.Auth;

    constructor() {
        let firebaseConfig: any = config.get('firebase.firebaseConfig');

        firebaseConfig =
            typeof firebaseConfig === 'string'
                ? JSON.parse(firebaseConfig)
                : JSON.parse(JSON.stringify(firebaseConfig));

        if (!firebaseAdmin.apps.length) {
            firebaseAdmin.initializeApp({
                credential: firebaseAdmin.credential.cert(
                    firebaseConfig as any
                ),
            });
        }

        this.auth = firebaseAdmin.auth();
    }

    public async createUser(
        userData: object
    ): Promise<firebaseAdmin.auth.UserRecord> {
        const userRecord: UserRecord = await this.auth.createUser(userData);
        return userRecord;
    }

    public async setCustomClaims(uid: string, role: string): Promise<void> {
        try {
            await this.auth.setCustomUserClaims(uid, { role });
        } catch (error) {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Error setting custom claims'
            );
        }
    }

    public async deleteUser(uid: string): Promise<void> {
        await this.auth.deleteUser(uid);
    }
}

export default new Firebase();
