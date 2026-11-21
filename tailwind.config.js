module.exports = {content:['./index.html','./assets/js/app.js'],

      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            obsidian: {
              950: '#060608',
              900: '#0B0B0E',
              800: '#131318',
              700: '#1C1C24',
            },
            gold: {
              100: '#FBF3D5',
              200: '#F3E1A4',
              300: '#E5C66B',
              400: '#D4AF37',
              500: '#B89122',
              600: '#8F6D13',
            },
            crimson: {
              950: '#2A050A',
              900: '#450A12',
              800: '#6B0F1A',
              700: '#8C1524',
              600: '#A81D2E',
            },
            ivory: {
              50: '#FAF7F0',
              100: '#F5F0E6',
              200: '#E7DEC9',
              300: '#CFC2A5',
            }
          },
          fontFamily: {
            diplomatic: ['Cinzel', 'Georgia', 'serif'],
            editorial: ['Cormorant Garamond', 'Georgia', 'serif'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          keyframes: {
            shimmer: {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' },
            },
            fadeUp: {
              '0%': { opacity: '0', transform: 'translateY(18px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            sealStamp: {
              '0%': { opacity: '0', transform: 'scale(1.65) rotate(-14deg)' },
              '65%': { opacity: '1', transform: 'scale(0.95) rotate(2deg)' },
              '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
            },
            pulseGold: {
              '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.35)' },
              '50%': { boxShadow: '0 0 28px 4px rgba(212, 175, 55, 0.2)' },
            },
            spinSlow: {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }
          },
          animation: {
            shimmer: 'shimmer 3.8s linear infinite',
            fadeUp: 'fadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            sealStamp: 'sealStamp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            pulseGold: 'pulseGold 3s ease-in-out infinite',
            spinSlow: 'spinSlow 18s linear infinite',
          }
        }
      }
    };
