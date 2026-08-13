// src/modules/users/components/UserTable.tsx
import React from 'react';
import type {User} from '../types/userTypes';

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
                                                        users,
                                                        onEdit,
                                                        onDelete,
                                                        isLoading
                                                    }) => {
    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-gray-100 text-gray-800',
        SUSPENDED: 'bg-yellow-100 text-yellow-800',
        DELETED: 'bg-red-100 text-red-800'
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No users found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role_id === '1' ? 'Admin' : 'User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {user.status}
                                </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => onEdit(user)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(user.id)}
                                className="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};