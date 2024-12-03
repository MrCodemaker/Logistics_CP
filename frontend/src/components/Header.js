import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('user');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="h-16 flex items-center justify-center relative">
                    {/* Логотип по центру */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <h1 className="text-xl font-bold">Логистика КП</h1>
                    </div>

                    {/* Кнопка выхода справа (показывается только если пользователь авторизован) */}
                    {isAuthenticated && location.pathname !== '/' && (
                        <button
                            onClick={handleLogout}
                            className="absolute right-4 text-gray-600 hover:text-gray-900
                                     dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            Выйти
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};