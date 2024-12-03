import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            await axios.post('/api/reset-password', { email });
            setStatus('success');
            setTimeout(() => navigate('/'), 3000); // Редирект через 3 секунды
        } catch (error) {}
            setStatus('error');
            setError(err.response?.data?.message || 'Произошла ошибка');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center">
                    Восстановление пароля
                </h2>

                {status === 'success' ? (
                    <div className="text-center text-green-600 p-4 bg-green-50 rounded">
                        Инструкции по восстановлению пароля отправлены на почту
                    </div>

                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {status === 'loading' ? 'Загрузка...' : 'Отправить'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
