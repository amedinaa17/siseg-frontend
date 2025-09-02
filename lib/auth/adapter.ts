export type Session = { token: string; user: { id: string; email: string } } | null;


export interface AuthAdapter {
    signIn(email: string, password: string): Promise<Session>;
    signUp(email: string, password: string): Promise<{ message: string } & { session?: Session }>;
    signOut(): Promise<void>;
    getSession(): Promise<Session>;
}

export type Provider = 'dev-mock' | 'rest';

let current: Provider = 'dev-mock'; // proveedor por defecto
export const setProvider = (p: Provider) => {
    current = p;
};

export async function getAuth(): Promise<AuthAdapter> {
    if (current === 'rest') {
        const { restAuth } = await import('./providers/rest');
        return restAuth;
    }
    const { devMockAuth } = await import('./providers/devMock');
    return devMockAuth;
}