// src/modules/users/components/UserCard.tsx
import React from 'react';
import type {User} from '../services/userService';

interface UserCardProps {
    user: User;
    onEdit: () => void;
    onDelete: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
    const statusColors = {
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-gray-100 text-gray-800',
        SUSPENDED: 'bg-yellow-100 text-yellow-800',
        DELETED: 'bg-red-100 text-red-800'
    };

    const statusColor = statusColors[user.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                    {user.status}
                </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="ml-2 font-medium">
                            {user.role_id === '1' ? 'Admin' : 'User'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">Joined:</span>
                        <span className="ml-2">
                            {new Date(user.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                    onClick={onEdit}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};