/* eslint-disable import/prefer-default-export */
export const createAuthMock = (userId: string, role: string) => ({
    apiBasicAuthorization: (req: any, res: any, next: any) => next(),
    firebaseAuth: (req: any, res: any, next: any) => {
        req.userId = userId;
        req.role = role;
        next();
    },
    appApiKeyAuthorization: (req: any, res: any, next: any) => next(),
});
