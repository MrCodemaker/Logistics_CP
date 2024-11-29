import React from 'react';
import FileUpload from '../components/FileUpload';
import { useNavigate } from 'react-router-dom';

const CreateCP = () => {
    const navigate = useNavigate();

    const handleFileUpload = async (file) => {
        try {
            // Здесь будет логика загрузки файла
            const result = await proposalService.uploadFile(file);
            // После успешной загрузки переходим на предпросмотр
            navigate('/preview', { state: { data: result } });
        } catch (err) {
            console.error('Ошибка загрузки:', err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <FileUpload onUpload={handleFileUpload} />
        </div>
    );
};

export default CreateCP;