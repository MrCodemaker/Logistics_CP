import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UploadForm from '../components/UploadForm';

const Home = () => {
    const navigate = useNavigate();
    
    const handleUploadSuccess = (result) => {
        console.log('Файл успешно загружен:', result);
        // Дополнительная логика после успешной загрузки

        // Показываем красивое уведомление
        toast.success('Файл успешно загружен!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
        
        // Перенаправляем на страницу со списком предложений
        setTimeout(() => {
            navigate('/proposals');
        }, 1000);
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">
                Создание коммерческого предложения
            </h1>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
    );
};

export default Home;