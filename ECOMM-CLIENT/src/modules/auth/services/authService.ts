// src/modules/auth/services/authService.ts
import { api } from '../../../core/api/client';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export const authService = {
    login: (credentials: LoginCredentials) =>
        api.post('/auth/login', credentials),

    register: (data: RegisterData) =>
        api.post('/auth/register', data),

    logout: () =>
        api.post('/auth/logout'),
};