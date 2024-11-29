import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateCP from './pages/CreateCP';
import DataPreview from './pages/DataPreview';
import ProposalsPage from './pages/ProposalsPage';

// Добавляем компонент загрузки
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
            <Suspense fallback={<LoadingFallback />}>
                <div className="min-h-screen">
                    <Layout>
                        <Header />
                        <Routes>
                            {/* Публичные маршруты */}
                            <Route path="/" element={<LoginPage />} />  
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/create" element={<CreateCP />} />
                            <Route path="/preview" element={<DataPreview />} />
                            <Route path="/proposals" element={<ProposalsPage />} />
                        </Routes>
                    </Layout>
                </div>
            </Suspense>
        </Router>
    );
}

export default App;