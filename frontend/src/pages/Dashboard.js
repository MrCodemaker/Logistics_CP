import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col space-y-4 max-w-md mx-auto">
                <Link
                    to="/create"
                    className="btn-primary text-center py-4"
                >
                    Создать КП
                </Link>
                <button
                    className="btn-secondary py-4"
                    onClick={() => alert('Функционал в разработке')}
                >
                    Изменить КП
                </button>
            </div>
        </div>
    );
};

export default Dashboard;