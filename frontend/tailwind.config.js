const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // Включаем поддержку темной темы
  theme: {
    extend: {
        colors: {
            primary: colors.blue,
            secondary: colors.gray,
            animation: {
                "spin-slow": "spin 2s linear infinite",
        },
        animation: {
            "fade-in": "fade-in 0.3s ease-in-out",
            "slide-up": "slide-up 0.4s ease-in-out",
            "progress": "progress 1s ease-in-out infinite",
        },
        keyframes: {
            fadeIn: {
                "0%": { opacity: 0 },
                "100%": { opacity: 1 },
            },
            slideUp: {
                "0%": { transform: "translateY(20px)", opacity: "0"},
                "100%": { transform: "translateY(0)", opacity: "1"},
            },
            progress: {
                "0%": { width: "0" },
                "100%": { width: "100%" },
            },
        },
        backgroundImage: {
            "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        },
    },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};







        }

        }

    }

  }


}