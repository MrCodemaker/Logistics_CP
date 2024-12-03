import React, { useState } from 'react';
import { proposalService } from '../services/api';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { notify } from '../utils/notifications';
import ProgressBar from './ProgressBar';

const UploadForm = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();
    const [previewData, setPreviewData] = useState(null);


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && (
            selectedFile.type.includes('excel') ||
            selectedFile.name.endsWith('.xlsx') ||
            selectedFile.name.endsWith('.xls')
        )) {
            setFile(selectedFile);
            setError('');
            // Сразу запускаем валидацию при выборе файла
            handleFileUpload(selectedFile);
        } else {
            setError('Пожалуйста, выберите файл Excel');
            setFile(null);
        }
    };

    // Функция валидации
    const handleFileUpload = async (file) => {
        setLoading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/validate-excel', formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    setUploadProgress(progress);
                }
            });

            if (response.data.success) {
                notify.success('Файл успешно проверен');
                setPreviewData(response.data.preview);
                setFile(file);
            } else {
                const error = response.data.error;
                setError(error.message);
                notify.error(error.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Ошибка при загрузке файла';
            setError(errorMessage);
            notify.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Функция создания коммерческого предложения
    const createCommercialProposal = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await axios.post('/api/create-proposal', formData);
        
            if (response.data.success) {
                // Автоматическое скачивание файла
                const link = document.createElement('a');
                link.href = response.data.file_url;
                link.click();
                return response.data;
            } else {
                throw new Error(response.data.error);
            }
        } catch (err) {
            console.error("Ошибка: ", err);
            throw new Error("Произошла ошибка при создании документа");
        }
    };

    // Функция отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            await handleFileUpload(file);
        } catch (err) {
            setError(err.message || 'Ошибка при загрузке файла');
        } finally {
            setLoading(false);
        };

        try {
            // Пытаемся создать коммерческое предложение
            const result = await createCommercialProposal(file);
            
            if (result.success) {
                // Если есть callback для успешной загрузки
                if (onUploadSuccess) {
                    onUploadSuccess(result);
                }
                // Перенаправление на список предложений
                navigate('/proposals');
            }
        } catch (err) {
            setError(err.message || 'Ошибка при загрузке файла');
            
            // Если произошла ошибка при создании КП, пробуем обычную загрузку
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await axios.post('/api/upload', formData);
                if (onUploadSuccess) {
                    onUploadSuccess(response.data);
                }
            } catch (uploadErr) {
                setError('Ошибка при загрузке файла');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center"
                    >
                        <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <span className="mt-2 text-sm text-gray-500">
                            {file ? file.name : 'Выберите Excel файл'}
                        </span>
                    </label>
                </div>

                {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className={`
                        w-full py-2 px-4 rounded-lg font-semibold
                        ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}
                        text-white
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition duration-200
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Обработка...
                        </span>
                    ) : (
                        'Создать предложение'
                    )}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;