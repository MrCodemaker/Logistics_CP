import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Выносим варианты анимации за пределы компонента
const pageVariants = {
    initial: {
        opacity: 0,
        x: 0,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1
    },
    exit: {
        opacity: 0,
        x: 0,
        scale: 0.96
    }
};

// Оптимизированные настройки переходов
const pageTransition = {
    type: "tween",
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
    willChange: "transform, opacity"
};

// Легкие анимации для слабых устройств
const lightAnimationConfig = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
        duration: 0.2
    }
};

// Варианты анимаций для разных типов переходов
const pageTransitions = {
    default: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    },
    slide: {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
        transition: { duration: 0.4 }
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
    }
};

const Layout = ({ children }) => {
    const location = useLocation();

    // Определяем производительность устройства
    const isLowPerformance = window.navigator.hardwareConcurrency < 4 || 
                            /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Выбираем конфигурацию анимации
    const currentVariants = isLowPerformance ? lightAnimationConfig : pageVariants;
    const currentTransition = isLowPerformance ? lightAnimationConfig.transition : pageTransition;

    // Выбираем тип анимации в зависимости от маршрута
    const getTransitionType = (pathname) => {
        if (pathname.includes('preview')) return 'slide';
        if (pathname === '/') return 'fade';
        return 'default';
    };

    // Мемоизация функций
    const handleAnimationComplete = useCallback(() => {
        window.requestAnimationFrame(() => {
            document.body.style.removeProperty('pointer-events');
        });
    }, []);

    const handleAnimationStart = useCallback(() => {
        document.body.style.pointerEvents = 'none';
    }, []);

    const transitionType = getTransitionType(location.pathname);

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={currentVariants}
                transition={currentTransition}
                onAnimationStart={handleAnimationStart}
                onAnimationComplete={handleAnimationComplete}
                className={`
                    transform-gpu
                    min-h-screen 
                    bg-gray-100 
                    dark:bg-gray-900
                    transition-colors 
                    duration-200
                `}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    willChange: 'transform, opacity'
                }}
            >
            <motion.div
                key={location.pathname}
                {...pageTransitions[transitionType]}
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
            >
                {children}
            </motion.div>    
                <div className="container mx-auto px-4 py-8">
                    {children}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default React.memo(Layout);