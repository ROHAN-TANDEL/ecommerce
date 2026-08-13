// src/ui/Layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex pt-16">
                <Sidebar isOpen={sidebarOpen} />
                <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};