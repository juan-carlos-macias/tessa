/**
 * Shared mock implementations for Firebase and Winston
 * These are reused across all test files
 */

class FirebaseMock {
    private users: { [uid: string]: any } = {};

    public async createUser(userData: object): Promise<any> {
        const uid = 'mocked-user-uid';
        this.users[uid] = userData;
        return { uid, ...userData };
    }

    public async setCustomClaims(uid: string, role: string): Promise<void> {
        if (this.users[uid]) {
            this.users[uid].customClaims = { role };
        }
    }

    public async deleteUser(uid: string): Promise<void> {
        if (this.users[uid]) {
            delete this.users[uid];
        }
    }
}

export default new FirebaseMock();

export const winstonMock = {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    addColors: jest.fn(),
    configure: jest.fn(),
    exceptions: { handle: jest.fn() },
    transports: {
        Console: jest.fn(),
        File: jest.fn().mockImplementation(() => {}),
    },
    format: {
        timestamp: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
        combine: jest.fn(),
        json: jest.fn(),
    },
};
