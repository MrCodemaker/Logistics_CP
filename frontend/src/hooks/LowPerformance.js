import { useState, useEffect } from 'react';

export const useDevicePerformance = () => {
    const [isLowPerformance, setIsLowPerformance] = useState(false);

    useEffect(() => {
        const checkPerformance = () => {
            // Проверяем количество логических процессоров
            const cores = navigator.hardwareConcurrency || 4;
            
            // Проверяем память устройства (если доступно)
            const memory = navigator.deviceMemory || 4;
            
            // Проверяем, является ли устройство мобильным
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // Определяем производительность устройства
            setIsLowPerformance(
                cores < 4 || 
                memory < 4 || 
                isMobile
            );
        };

        checkPerformance();
    }, []);

    return isLowPerformance;
};