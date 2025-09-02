import { sessionStorage } from '@/lib/session';
import axios from 'axios';
import type { AuthAdapter, Session } from '../adapter';


const KEY = 'AUTH_SESSION';
const api = axios.create({ baseURL: 'http://BACKEND/api' });


export const restAuth: AuthAdapter = {
    async signIn(email, password) {
        const { data } = await api.post('/login', { email, password });
        const session: Session = { token: data.token, user: data.user };
        await sessionStorage.setItem(KEY, JSON.stringify(session));
        return session;
    },
    async signUp(email, password) {
        const { data } = await api.post('/register', { email, password });
        return { message: data.message ?? 'Registro exitoso' };
    },
    async signOut() {
        const raw = await sessionStorage.getItem(KEY);
        const token = raw ? (JSON.parse(raw) as Session)?.token : null;
        if (token) {
            try { await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } }); } catch { }
        }
        await sessionStorage.removeItem(KEY);
    },
    async getSession() {
        const raw = await sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Session) : null;
    },
};