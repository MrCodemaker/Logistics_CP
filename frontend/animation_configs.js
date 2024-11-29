export const ANIMATION_CONFIGS = {
    // Легкие анимации для слабых устройств
    light: {
        variants: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        transition: {
            duration: 0.2
        }
    },
    // Стандартные анимации
    normal: {
        variants: {
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
        },
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};