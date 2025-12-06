/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Custom color palette
                'deep-space': '#0a0a0f',
                'surface': '#1a1a2e',
                'surface-light': '#252542',
                'electric': {
                    50: '#e6fcff',
                    100: '#b3f5ff',
                    200: '#80eeff',
                    300: '#4de7ff',
                    400: '#1ae0ff',
                    500: '#00d4ff',
                    600: '#00a8cc',
                    700: '#007c99',
                    800: '#005066',
                    900: '#002433',
                },
                'neon-purple': {
                    50: '#f3f0ff',
                    100: '#e5dbff',
                    200: '#cbb5ff',
                    300: '#b08fff',
                    400: '#9669ff',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient': 'gradient 8s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
