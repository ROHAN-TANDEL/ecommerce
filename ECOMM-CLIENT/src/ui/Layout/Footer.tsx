// src/ui/Layout/Footer.tsx
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 h-12 flex items-center justify-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} eCommerce. All rights reserved.</p>
        </footer>
    );
};