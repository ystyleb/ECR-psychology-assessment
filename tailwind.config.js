/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xs': '475px',  // 超小屏幕
      'sm': '640px',  // 小屏幕
      'md': '768px',  // 中等屏幕
      'lg': '1024px', // 大屏幕
      'xl': '1280px', // 超大屏幕
      '2xl': '1536px' // 超大屏幕
    },
    extend: {
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],// 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
        // 移动端优化的字体大小
        'mobile-xs': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px
        'mobile-sm': ['0.8125rem', { lineHeight: '1.125rem' }], // 13px
        'mobile-base': ['0.9375rem', { lineHeight: '1.375rem' }], // 15px
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fc',
          400: '#8b9cf7',
          500: '#667eea',
          600: '#5a6fd8',
          700: '#4c5bc5',
          800: '#3d4ba0',
          900: '#364080'
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        }
      },
      minHeight: {
        'touch': '44px',    // iOS推荐的最小触摸目标尺寸
        'mobile-button': '40px', // 移动端按钮最小高度
      },
      minWidth: {
        'touch': '44px',    // iOS推荐的最小触摸目标尺寸
        'mobile-button': '40px', // 移动端按钮最小宽度
      },
      maxWidth: {
        'mobile': '100vw',
        'mobile-content': 'calc(100vw - 2rem)', // 移动端内容最大宽度
        'xs': '20rem',      // 320px
        'sm': '24rem',      // 384px
      },
      gridTemplateColumns: {
        'mobile': 'repeat(1, minmax(0, 1fr))',
        'mobile-2': 'repeat(2, minmax(0, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(16rem, 1fr))',
        'auto-fit-xs': 'repeat(auto-fit, minmax(12rem, 1fr))',
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Roboto',
          'sans-serif'
        ]
      },
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
        // 移动端优化的间距
        'mobile-xs': '0.25rem',  // 4px
        'mobile-sm': '0.5rem',   // 8px
        'mobile-md': '0.75rem',  // 12px
        'mobile-lg': '1rem',     // 16px
        'mobile-xl': '1.25rem',  // 20px
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        custom: '0 6px 20px rgba(0, 0, 0, 0.08)',
        'custom-lg': '0 10px 30px rgba(0, 0, 0, 0.12)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    }
  },
  plugins: []
}
