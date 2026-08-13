// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { ToastProvider } from './context/ToastContext';  // ⭐ NEW
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ToastProvider>  {/* ⭐ WRAP */}
            <App />
        </ToastProvider>
    </React.StrictMode>
);