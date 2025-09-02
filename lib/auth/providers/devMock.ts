import { sessionStorage } from '@/lib/session';
import type { AuthAdapter, Session } from '../adapter';


const KEY = 'AUTH_SESSION';


export const devMockAuth: AuthAdapter = {
    async signIn(email, password) {
        const session: Session = {
            token: 'dev-token-' + Math.random().toString(36).slice(2),
            user: { id: 'user_' + Date.now(), email },
        };
        await sessionStorage.setItem(KEY, JSON.stringify(session));
        return session;
    },
    async signUp(email, password) {
        const session: Session = {
            token: 'dev-token-' + Math.random().toString(36).slice(2),
            user: { id: 'user_' + Date.now(), email },
        };
        await sessionStorage.setItem(KEY, JSON.stringify(session));
        return { message: 'Cuenta creada (mock).', session };
    },
    async signOut() {
        await sessionStorage.removeItem(KEY);
    },
    async getSession() {
        const raw = await sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Session) : null;
    },
};