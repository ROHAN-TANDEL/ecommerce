// src/modules/users/pages/UserList.tsx
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import { UserFilters } from '../components/UserFilters';
import type {User} from '../types/userTypes';

export const UserList: React.FC = () => {
    const { users, isLoading, error, fetchUsers, deleteUser } = useUserStore();
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const [filters, setFilters] = useState({ status: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users;

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (u) =>
                    u.first_name.toLowerCase().includes(query) ||
                    u.last_name.toLowerCase().includes(query) ||
                    u.email.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (filters.status) {
            result = result.filter((u) => u.status === filters.status);
        }

        setFilteredUsers(result);
    }, [users, searchQuery, filters]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteUser(id);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredUsers.length} users found
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add User</span>
                </button>
            </div>

            <UserFilters
                onFilter={(newFilters) => setFilters(newFilters)}
                onSearch={(query) => setSearchQuery(query)}
            />

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <UserTable
                    users={filteredUsers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                />
            </div>

            {showForm && (
                <UserForm
                    user={editingUser}
                    onClose={handleCloseForm}
                    onSuccess={() => {
                        handleCloseForm();
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};