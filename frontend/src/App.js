import React, { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateCP from './pages/CreateCP';
import DataPreview from './pages/DataPreview';
import ProposalsPage from './pages/ProposalsPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import UploadForm from './components/UploadForm';

// Добавляем компонент загрузки
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
);

// Ленивая загрузка компонентов
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/Home'));
const CreateProposalPage = React.lazy(() => import('./pages/CreateCP'));
const DataPreviewPage = React.lazy(() => import('./pages/DataPreview'));
const ProposalsPage = React.lazy(() => import('./pages/ProposalsPage'));

function App() {
    return (
        <Router>
            <Layout>
                <Header />
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        /* Публичные маршруты */
                        <Route path="/" element={<Home />} />
                        <Route path="/" element={<LoginForm />} />  
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                            /* Защищенные маршруты */
                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={
                                    <div className="container mx-auto px-4 py-8">
                                        <div className="flex flex-col space-y-4 max-w-md mx-auto">
                                            <button 
                                                onClick={() => navigate('/create')}
                                                className="btn-primary py-3"
                                            >
                                                Создать КП
                                            </button>
                                            <button 
                                                className="btn-secondary py-3"
                                                onClick={() => alert('Функционал в разработке')}
                                            >
                                                Изменить КП
                                            </button>
                                        </div>
                                    </div>
                                } />
                            <Route path="/create" element={<UploadForm />} />
                            /* Компонент предпросмотра данных */
                            <Route path="/preview" element={<DataPreview />} />
                            <Route path="/create" element={<CreateCP />} />
                            <Route path="/proposals" element={<ProposalsPage />} />
                        </Route> 
                    </Routes>
                </Suspense>
            </Layout>
            <ToastContainer /> /* Контейнер для уведомлений
       
        </Router>
    );
}

export default App;