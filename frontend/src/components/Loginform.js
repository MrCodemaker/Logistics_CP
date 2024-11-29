import React, { useState } from 'react';
import { Oval } from 'react-loader-spinner'; // Импортируем компонент загрузки в виде крутящегося спиннера

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const controllerRef = useRef(null); // Ссылка для удержания AbortController

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setLoading(true); // Set loading to true
        controllerRef.current = new AbortController(); // Создаем новый AbortController
        const [canceling, setCanceling] = useState(false); // Состояние для омтмены

        try {
            const response = await fetch('/login', { // Запрос на backend
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ username, password }),
               signal: controllerRef.current.signal, // Передаем сигнал отмены 
            });

            if (!response.ok) {
                const data = await response.json();
                // Handle different HTTP error codes for better error messages
                if (response.status === 401) {
                    setError('Неправильный логин или пароль.');
                } else if (response.status === 400) {
                    setError(data.error || 'Bad Request'); // Use data.error if available
                } else {
                    setError('An unexpected error occurred.');
                } 
            } else { // Переход на экран №2
                const data = await response.json(); // Get data from successful response
                // Store token or user data in local storage or context
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/dashboard'; // Не забыть заменить /login и /dashboard на ваши реальные конечные точки API.
            }
        } catch (error) {
            if (error.name === 'AbortError') {} // Сообщение об отмене бронирования
                setError('Запрос на вход в систему отменен');
            } else { 
            setError('Ошибка сети. Пожалуйста, проверьте ваше соединение.');
            }
        } finally {
            setLoading(false); // Set loading to false regardless of success or failure
            controllerRef.current = null; // Сбрасываем ссылку на AbortController   
        }
    };

    const handleCancel = () => {
        setCanceling(true); // Отображаем состояние отмены
        if (controllerRef.current) {
            controllerRef.current.abort(); // Отменяем запрос
        }

    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ color: 'red' }}>{error}</div>} // Display error message
            <div>
                <label htmlFor="username">Логин</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Пароль</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                {loading ? (
                    <Oval
                        height={30}
                        width={30}
                        color="#4fa94d"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#4fa94d"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                ) : (
                    <button type="submit" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                )}
            </div>
            <div>
                {loading ? (
                    <>
                        <Oval height={30} width={30} color="#4fa94d" />
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            disabled={canceling}
                            style={{
                                opacity: canceling ? 0.5 : 1,
                                pointerEvents: canceling ? 'none' : 'auto',
                            }}
                        >
                            {canceling ? 'Отмена...' : 'Отмена'}
                        </button>
                    </>
                ) : (
                    <button type="submit" disabled={loading}>
                        Login
                    </button>
                )}
            </div>
        </form>
    );
}

export default LoginForm;