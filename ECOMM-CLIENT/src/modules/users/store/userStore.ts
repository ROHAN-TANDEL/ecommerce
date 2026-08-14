// src/modules/users/store/userStore.ts
import { create } from 'zustand';
import { userService, type User, type CreateUserData, type UpdateUserData } from '../services/userService';

interface UserState {
    users: User[];
    selectedUser: User | null;
    isLoading: boolean;
    error: string | null;

    fetchUsers: () => Promise<void>;
    fetchUser: (id: string) => Promise<void>;
    createUser: (data: CreateUserData) => Promise<void>;
    updateUser: (id: string, data: UpdateUserData) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    clearError: () => void;
    clearSelected: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await userService.list();
            set({ users: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch users',
                isLoading: false
            });
        }
    },

    fetchUser: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await userService.getById(id);
            set({ selectedUser: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch user',
                isLoading: false
            });
        }
    },

    createUser: async (data: CreateUserData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await userService.create(data);
            set((state) => ({
                users: [response.data.data, ...state.users],
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create user',
                isLoading: false
            });
            throw error;
        }
    },

    updateUser: async (id: string, data: UpdateUserData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await userService.update(id, data);
            set((state) => ({
                users: state.users.map((user) =>
                    user.id === id ? response.data.data : user
                ),
                selectedUser: response.data.data,
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update user',
                isLoading: false
            });
            throw error;
        }
    },

    deleteUser: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await userService.delete(id);
            set((state) => ({
                users: state.users.filter((user) => user.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to delete user',
                isLoading: false
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    clearSelected: () => set({ selectedUser: null })
}));