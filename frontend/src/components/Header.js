import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <nav className="flex space-x-4">
                        <Link 
                            to="/" 
                            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 
                                     dark:hover:text-blue-400 transition-colors duration-200"
                        >
                            Главная
                        </Link>
                        <Link 
                            to="/create" 
                            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 
                                     dark:hover:text-blue-400 transition-colors duration-200"
                        >
                            Создать КП
                        </Link>
                        <Link 
                            to="/proposals" 
                            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 
                                     dark:hover:text-blue-400 transition-colors duration-200"
                        >
                            Предложения
                        </Link>
                    </nav>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );

};

export default Header;
