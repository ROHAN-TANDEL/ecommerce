#!/bin/bash
# scripts/setup.sh - Main setup script

set -e

echo "🚀 Setting up eCommerce Client..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ $(echo "$NODE_VERSION < 18.0.0" | bc) -eq 1 ]; then
    echo -e "${RED}❌ Node.js 18 or higher required. Found v$NODE_VERSION${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js v$NODE_VERSION detected${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️ Please update .env with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p src/modules
mkdir -p src/core/api
mkdir -p src/core/store
mkdir -p src/core/config
mkdir -p src/lib/hooks
mkdir -p src/middleware
mkdir -p src/ui/Layout
mkdir -p src/ui/common
mkdir -p src/ui/feedback
mkdir -p src/styles

echo -e "${GREEN}✅ Directory structure created${NC}"

# Generate base files if they don't exist
echo "📄 Generating base files..."

# Create API client if not exists
if [ ! -f src/core/api/client.ts ]; then
    cat > src/core/api/client.ts << 'EOF'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Request-ID'] = crypto.randomUUID();
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }
                const response = await api.post('/auth/refresh-token', {
                    token: refreshToken
                });
                const { access, refresh } = response.data.token;
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
EOF
    echo -e "${GREEN}✅ API client created${NC}"
fi

# Create App.tsx if not exists
if [ ! -f src/app/App.tsx ]; then
    mkdir -p src/app
    cat > src/app/App.tsx << 'EOF'
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../middleware/ProtectedRoute';
import { MainLayout } from '../ui/Layout/MainLayout';

// Lazy load modules
const Login = React.lazy(() => import('../modules/auth/pages/Login'));
const Register = React.lazy(() => import('../modules/auth/pages/Register'));
const Dashboard = React.lazy(() => import('../modules/dashboard/pages/Dashboard'));
const UserList = React.lazy(() => import('../modules/users/pages/UserList'));
const ProductList = React.lazy(() => import('../modules/products/pages/ProductList'));
const Cart = React.lazy(() => import('../modules/cart/pages/Cart'));

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <React.Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute />}>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="users" element={<UserList />} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="cart" element={<Cart />} />
                        </Route>
                    </Route>
                </Routes>
            </React.Suspense>
        </BrowserRouter>
    );
};
EOF
    echo -e "${GREEN}✅ App.tsx created${NC}"
fi

# Create main.tsx if not exists
if [ ! -f src/main.tsx ]; then
    cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
EOF
    echo -e "${GREEN}✅ main.tsx created${NC}"
fi

# Create globals.css if not exists
if [ ! -f src/styles/globals.css ]; then
    cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    body {
        @apply bg-gray-50 text-gray-900 antialiased;
    }
    * {
        @apply box-border;
    }
}

@layer components {
    .btn-primary {
        @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors;
    }
    .btn-secondary {
        @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
    }
    .btn-danger {
        @apply bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors;
    }
    .input-field {
        @apply w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
    }
    .card {
        @apply bg-white rounded-lg shadow-md p-6;
    }
}
EOF
    echo -e "${GREEN}✅ globals.css created${NC}"
fi

# Setup complete
echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Update .env with your API URL"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Visit http://localhost:5173"
echo ""
