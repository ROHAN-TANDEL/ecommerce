import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../middleware/ProtectedRoute';
import { MainLayout } from '../ui/Layout/MainLayout';

import { Login } from '../modules/auth/pages/Login';
import { Register } from '../modules/auth/pages/Register';
import { Dashboard } from '../modules/dashboard/pages/Dashboard';
import { UserList } from '../modules/users/pages/UserList';
import { ProductList } from '../modules/products/pages/ProductList';
import { CartPage } from '../modules/cart/pages/CartPage.tsx';

import { OrderList } from '../modules/orders/pages/OrderList';
import { OrderHistory } from '../modules/orders/pages/OrderHistory';

// Lazy load modules
// const Login :any = React.lazy(() : any => import('../modules/auth/pages/Login'));
// const Register = React.lazy(():any => import('../modules/auth/pages/Register'));
// const Dashboard = React.lazy(():any => import('../modules/dashboard/pages/Dashboard'));
// const UserList = React.lazy(():any => import('../modules/users/pages/UserList'));
// const ProductList = React.lazy(():any => import('../modules/products/pages/ProductList'));
// const Cart = React.lazy(():any => import('../modules/cart/pages/Cart'));

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
                            <Route path="cart" element={<CartPage />} />
                            <Route path="orders" element={<OrderList />} />           {/* Admin */}
                            <Route path="my-orders" element={<OrderHistory />} />     {/* Customer */}
                        </Route>
                    </Route>
                </Routes>
            </React.Suspense>
        </BrowserRouter>
    );
};
