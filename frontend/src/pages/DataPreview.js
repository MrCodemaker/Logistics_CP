import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DataPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const previewData = location.state?.data;

    const handleConfirm = async () => {
        try {
            // Здесь будет логика создания PDF
            const result = await proposalService.createPDF(previewData);
            // Скачивание файла
            window.location.href = result.fileUrl;
            // Возврат на дашборд
            navigate('/dashboard');
        } catch (err) {
            console.error('Ошибка создания PDF:', err);
        }
    };

    const handleCancel = () => {
        navigate('/create');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Предпросмотр данных</h2>
                
                {/* Отображение данных из Excel */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    {/* Здесь будет отображение данных */}
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={handleConfirm}
                        className="btn-primary"
                    >
                        Подтвердить
                    </button>
                    <button
                        onClick={handleCancel}
                        className="btn-secondary"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataPreview;