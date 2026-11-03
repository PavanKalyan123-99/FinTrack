/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepSpace: '#1B262C',
        royalBlue: '#0F4C75',
        skyFocus: '#3282B8',
        softCloud: '#BBE1FA',
        incomeGreen: '#16A34A',
        expenseRed: '#DC2626',
        mainBg: '#F7FAFC',
        cardBg: '#FFFFFF',
        primaryText: '#1B262C',
        secondaryText: '#64748B',
        borderColor: '#E2E8F0',
        successBg: '#DCFCE7',
        warningBg: '#FEF3C7',
        errorBg: '#FEE2E2',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(27, 38, 44, 0.06), 0 1px 4px -1px rgba(27, 38, 44, 0.04)',
        cardHover: '0 10px 25px -5px rgba(27, 38, 44, 0.1), 0 8px 10px -6px rgba(27, 38, 44, 0.05)',
        elevated: '0 20px 30px -10px rgba(15, 76, 117, 0.15)',
      },
    },
  },
  plugins: [],
};
