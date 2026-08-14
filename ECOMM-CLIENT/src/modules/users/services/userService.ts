// src/modules/users/services/userService.ts
import { api } from '../../../core/api/client';
import type { User, CreateUserData, UpdateUserData } from '../types/userTypes';

export const userService = {
    list: () =>
        api.get<{ status: string; data: User[] }>('/users'),

    getById: (id: string) =>
        api.get<{ status: string; data: User }>(`/users/${id}`),

    create: (data: CreateUserData) =>
        api.post<{ status: string; data: User }>('/users', data),

    update: (id: string, data: UpdateUserData) =>
        api.post<{ status: string; data: User }>(`/users/${id}`, data),

    delete: (id: string) =>
        api.delete<{ status: string; data: { id: string; deleted_at: string } }>(`/users/${id}`)
};