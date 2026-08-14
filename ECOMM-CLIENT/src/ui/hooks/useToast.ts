// src/lib/hooks/useToast.ts
import { useState, useCallback } from 'react';

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    id: number;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { message, type, id }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return { showToast, toasts };
};