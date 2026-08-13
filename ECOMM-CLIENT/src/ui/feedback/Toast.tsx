// src/ui/feedback/Toast.tsx
import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    return (
        <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border shadow-lg ${colors[type]} animate-slide-up`}>
            <div className="flex items-center justify-between">
                <span className="text-sm">{message}</span>
                <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
                    ×
                </button>
            </div>
        </div>
    );
};