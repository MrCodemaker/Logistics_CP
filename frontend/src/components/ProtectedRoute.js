import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('user'); // Проверка аутентификации

    if (!isAuthenticated) {
        // Редирект на страницу логика с сохранением изначального маршрута
        return <Navigate to="/" state={{ from: location }} replace />;

    }

    // Если пользователь аутентифицирован, рендерим дочершие маршруты
    return <Outlet />;

};

export default ProtectedRoute;

