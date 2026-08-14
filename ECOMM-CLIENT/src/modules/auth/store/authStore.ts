// src/modules/auth/store/authStore.ts
import { create } from 'zustand';
import { api } from '../../../core/api/client';

interface AuthState {
    user: any | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, _get : any) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access, refresh } = response.data.token;
            const user = response.data.user || { email };

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                accessToken: access,
                refreshToken: refresh,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register', data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false
            });
        }
    },

    clearError: () => set({ error: null })
}));