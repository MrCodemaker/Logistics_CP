import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleLogin = async (credentials) => {
        try {
            // Здесь будет логика авторизации
            const success = await authService.login(credentials);
            if (success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Неверный логин или пароль');
            // При определенных ошибках перенаправляем на восстановление пароля
            if (err.code === 'LOCKED_ACCOUNT') {
                navigate('/reset-password');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Логистика КП
                </h1>
                <LoginForm onSubmit={handleLogin} error={error} />
            </div>
        </div>
    );
};

export default LoginPage;