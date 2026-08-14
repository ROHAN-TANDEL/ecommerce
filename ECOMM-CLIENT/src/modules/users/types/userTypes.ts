// src/modules/users/types/userTypes.ts
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateUserData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    email?: string;
    status?: string;
    role?: string;
}

export interface UserListResponse {
    status: string;
    data: User[];
}