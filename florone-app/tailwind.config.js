/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        flora: {
          black: '#0a0908',
          orange: '#eb5e28',
          cream: '#fffcf2',
          gray: '#1b1a19',
          graylt: '#3a3633',
        },
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
        why: '1380px',
      },
      keyframes: {
        whiteStartup: {
          '0%': { opacity: '0', filter: 'none' },
          '5%': { opacity: '1', filter: 'drop-shadow(0 0 12px #fff) drop-shadow(0 0 35px #fff)' },
          '10%': { opacity: '0', filter: 'none' },
          '18%': { opacity: '1', filter: 'drop-shadow(0 0 10px #fff) drop-shadow(0 0 25px #ccc)' },
          '22%': { opacity: '0', filter: 'none' },
          '28%': { opacity: '1', filter: 'drop-shadow(0 0 7px #fff)' },
          '31%': { opacity: '0.1', filter: 'none' },
          '48%': { opacity: '0.85', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' },
          '100%': {
            opacity: '1',
            filter:
              'drop-shadow(0 0 5px #fff) drop-shadow(0 0 14px rgba(255,255,255,0.75)) drop-shadow(0 0 28px rgba(255,255,255,0.3))',
          },
        },
        orangeStartup: {
          '0%': { opacity: '0', filter: 'none' },
          '5%': { opacity: '1', filter: 'drop-shadow(0 0 12px #eb5e28) drop-shadow(0 0 35px #eb5e28)' },
          '10%': { opacity: '0', filter: 'none' },
          '18%': { opacity: '1', filter: 'drop-shadow(0 0 10px #eb5e28) drop-shadow(0 0 25px #c94e20)' },
          '22%': { opacity: '0', filter: 'none' },
          '28%': { opacity: '1', filter: 'drop-shadow(0 0 7px #eb5e28)' },
          '31%': { opacity: '0.1', filter: 'none' },
          '48%': { opacity: '0.85', filter: 'drop-shadow(0 0 5px rgba(235,94,40,0.5))' },
          '100%': {
            opacity: '1',
            filter:
              'drop-shadow(0 0 5px #eb5e28) drop-shadow(0 0 14px rgba(235,94,40,0.75)) drop-shadow(0 0 28px rgba(235,94,40,0.3))',
          },
        },
        whitePulse: {
          '0%,100%': {
            opacity: '0.85',
            filter:
              'drop-shadow(0 0 5px #fff) drop-shadow(0 0 14px rgba(255,255,255,0.65)) drop-shadow(0 0 28px rgba(255,255,255,0.25))',
          },
          '50%': {
            opacity: '1',
            filter:
              'drop-shadow(0 0 9px #fff) drop-shadow(0 0 25px rgba(255,255,255,0.88)) drop-shadow(0 0 50px rgba(255,255,255,0.4))',
          },
        },
        orangePulse: {
          '0%,100%': {
            opacity: '0.85',
            filter:
              'drop-shadow(0 0 5px #eb5e28) drop-shadow(0 0 14px rgba(235,94,40,0.65)) drop-shadow(0 0 28px rgba(235,94,40,0.25))',
          },
          '50%': {
            opacity: '1',
            filter:
              'drop-shadow(0 0 9px #eb5e28) drop-shadow(0 0 25px rgba(235,94,40,0.88)) drop-shadow(0 0 50px rgba(235,94,40,0.4))',
          },
        },
        pinPulse: {
          '0%,100%': { boxShadow: '0 0 0 4px rgba(235,94,40,0.25)' },
          '50%': { boxShadow: '0 0 0 8px rgba(235,94,40,0.1)' },
        },
      },
      animation: {
        whiteLogo: 'whiteStartup 2.5s ease-out forwards, whitePulse 2s ease-in-out 2.5s infinite',
        orangeLogo: 'orangeStartup 2.5s ease-out forwards, orangePulse 2s ease-in-out 2.5s infinite',
        pinPulse: 'pinPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
