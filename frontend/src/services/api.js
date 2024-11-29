import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
    baseURL: '/api'
});

// Добавляем перехватчик для добавления токена к каждому запросу
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обработка ошибок
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const proposalService = {
    // Создание коммерческого предложения
    createProposal: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/create-proposal', formData);
        return response.data;
    },

    // Получение списка предложений
    getProposals: async (page = 1, perPage = 10) => {
        const response = await api.get(`/proposals?page=${page}&per_page=${perPage}`);
        return response.data;
    },

    // Скачивание файла
    downloadProposal: async (filename) => {
        const response = await api.get(`/download/${filename}`, {
            responseType: 'blob'
        });
        return response.data;
    }
};