// src/modules/users/pages/UserList.tsx
import React, { useEffect } from 'react';

export const UserList: React.FC = () => {
    const [_users, _setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        // Fetch users from API
        // For now, show placeholder
        setLoading(false);
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Users</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">1</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">john@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};