// src/ui/Layout/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../modules/auth/store/authStore';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">eCommerce</h1>
                </div>

                {/* Right section */}
                <div className="flex items-center space-x-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.first_name?.[0] || 'U'}
                            </div>
                            <span className="hidden md:block text-sm font-medium">
                                {user?.first_name || 'User'}
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Settings
                                </button>
                                <hr className="my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};