/** @type {import('tailwindcss').Config} */

/**
 * DESIGN SYSTEM — Ana Castellano Florista
 * ----------------------------------------
 * Estética: florista de lujo, minimalista, elegante
 * Audiencia: clientes premium (eventos, bodas, decoración)
 *
 * Principios de color:
 *  - Fondos cálidos (blancos marfil, beige pálido) para evocar papel de alta calidad
 *  - Texto en negro suave (no puro #000) para reducir crudeza visual
 *  - Verde sage como color floral característico: conecta con lo botánico sin resultar saturado
 *  - Rosa pálido como acento secundario: femenino sin ser infantil
 *  - Dorado muy sutil para detalles de lujo (bordes, separadores)
 *  - Admin panel: misma paleta pero más neutra, fondos ligeramente más fríos
 */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    // Sobreescribimos los defaults de spacing/screens para usar nuestro sistema
    screens: {
      sm:    '375px',   // Mobile estándar
      md:    '768px',   // Tablet
      lg:    '1024px',  // Laptop
      xl:    '1280px',  // Desktop
      '2xl': '1536px',  // Wide desktop
    },

    extend: {
      // ─── PALETA DE COLORES ───────────────────────────────────────────────────
      colors: {

        // NEUTROS DE FONDO — cálidos, nunca fríos
        ivory: {
          50:  '#FDFCF9',  // Blanco casi puro con toque cálido — fondo principal
          100: '#FAF7F2',  // Blanco marfil — secciones alternas
          200: '#F5EFE6',  // Beige pálido — cards, fondos de formulario
          300: '#EDE3D5',  // Beige medio — bordes suaves, separadores
          400: '#D9CBBA',  // Beige oscuro — líneas divisoras
        },

        // TEXTO — negro suave y jerarquía gris elegante
        charcoal: {
          900: '#1A1714',  // Negro principal — títulos H1, H2
          800: '#2E2B27',  // Gris muy oscuro — body text
          700: '#4A4640',  // Gris oscuro — texto secundario, labels
          600: '#6B6560',  // Gris medio — placeholders, captions
          400: '#9C968F',  // Gris claro — texto deshabilitado
          200: '#C8C2BB',  // Gris muy claro — bordes de inputs
        },

        // VERDE SAGE — color floral principal, botánico y sofisticado
        sage: {
          50:  '#F4F6F2',  // Tinte sage muy pálido — hover states suaves
          100: '#E4EAE0',  // Sage casi blanco — fondos de badge
          200: '#C8D4C2',  // Sage claro — bordes con color
          300: '#A8BAA0',  // Sage medio claro
          400: '#7F9A76',  // Sage medio — estados activos
          500: '#5C7A52',  // SAGE PRINCIPAL — color de marca, CTAs primarios
          600: '#4A6341',  // Sage oscuro — hover de botón primario
          700: '#384D32',  // Sage muy oscuro — texto sobre fondos sage claros
          800: '#273624',  // Sage profundo
          900: '#182118',  // Sage casi negro
        },

        // ROSA PÁLIDO — acento floral secundario, femenino y sofisticado
        blush: {
          50:  '#FDF8F6',  // Rosa casi blanco — hover muy sutil
          100: '#FAF0EC',  // Rosa pálido — fondos de sección especial
          200: '#F3DDD6',  // Blush claro — cards destacadas
          300: '#E8C4B8',  // Blush medio — borders decorativos
          400: '#D99E8C',  // Blush intenso — iconos decorativos
          500: '#C4795E',  // Blush principal — acento secundario
          600: '#A85E45',  // Blush oscuro — hover acento secundario
        },

        // DORADO — para detalles de lujo únicamente, usar con moderación
        gold: {
          100: '#F9F3E3',  // Dorado muy pálido — fondo de badge premium
          200: '#EFE0B0',  // Dorado claro — bordes decorativos
          300: '#D4B86A',  // Dorado medio — separadores, líneas ornamentales
          400: '#B8943A',  // DORADO PRINCIPAL — detalles de lujo
          500: '#8C6D1F',  // Dorado oscuro — texto sobre fondo dorado claro
        },

        // SISTEMA SEMÁNTICO — estados de UI
        semantic: {
          'pending-bg':     '#FEF9EC',
          'pending-text':   '#8C6D1F',
          'pending-border': '#D4B86A',

          'success-bg':     '#F0F6EE',
          'success-text':   '#3A6434',
          'success-border': '#7F9A76',

          'error-bg':       '#FDF2F0',
          'error-text':     '#A83022',
          'error-border':   '#D98070',

          'info-bg':        '#EEF2F8',
          'info-text':      '#2C4A7A',
          'info-border':    '#7298CC',
        },

        // ADMIN PANEL — variante más neutra, misma familia
        admin: {
          bg:             '#F7F6F4',
          sidebar:        '#2E2B27',
          'sidebar-active': '#5C7A52',
          surface:        '#FFFFFF',
          border:         '#E5E0DA',
        },
      },

      // ─── TIPOGRAFÍA ──────────────────────────────────────────────────────────
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Jost', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        'xs':   ['0.75rem',   { lineHeight: '1.4',   letterSpacing: '0.06em'  }],  // 12px
        'sm':   ['0.875rem',  { lineHeight: '1.5',   letterSpacing: '0.04em'  }],  // 14px
        'base': ['1rem',      { lineHeight: '1.7',   letterSpacing: '0.02em'  }],  // 16px
        'lg':   ['1.125rem',  { lineHeight: '1.65',  letterSpacing: '0.015em' }],  // 18px
        'xl':   ['1.25rem',   { lineHeight: '1.5',   letterSpacing: '0.01em'  }],  // 20px
        '2xl':  ['1.5rem',    { lineHeight: '1.4',   letterSpacing: '0.005em' }],  // 24px
        '3xl':  ['1.875rem',  { lineHeight: '1.3',   letterSpacing: '0'       }],  // 30px
        '4xl':  ['2.25rem',   { lineHeight: '1.2',   letterSpacing: '-0.01em' }],  // 36px
        '5xl':  ['3rem',      { lineHeight: '1.15',  letterSpacing: '-0.02em' }],  // 48px
        '6xl':  ['3.75rem',   { lineHeight: '1.1',   letterSpacing: '-0.025em'}],  // 60px
        '7xl':  ['4.5rem',    { lineHeight: '1.05',  letterSpacing: '-0.03em' }],  // 72px
        '8xl':  ['6rem',      { lineHeight: '1',     letterSpacing: '-0.04em' }],  // 96px
      },

      fontWeight: {
        light:    '300',
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ─── ESPACIADO ───────────────────────────────────────────────────────────
      spacing: {
        px:    '1px',
        0:     '0',
        0.5:   '2px',
        1:     '4px',
        1.5:   '6px',
        2:     '8px',
        2.5:   '10px',
        3:     '12px',
        4:     '16px',
        5:     '20px',
        6:     '24px',
        7:     '28px',
        8:     '32px',
        9:     '36px',
        10:    '40px',
        11:    '44px',   // Mínimo touch target
        12:    '48px',
        14:    '56px',
        16:    '64px',
        18:    '72px',
        20:    '80px',
        24:    '96px',
        28:    '112px',
        32:    '128px',
        36:    '144px',
        40:    '160px',
        48:    '192px',
        56:    '224px',
        64:    '256px',
        72:    '288px',
        80:    '320px',
        96:    '384px',
        'section-sm': '64px',
        'section-md': '96px',
        'section-lg': '128px',
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────────────
      borderRadius: {
        none:    '0',
        sm:      '2px',
        DEFAULT: '4px',
        md:      '6px',
        lg:      '8px',
        xl:      '12px',
        '2xl':   '16px',
        '3xl':   '24px',
        full:    '9999px',
      },

      // ─── SOMBRAS ─────────────────────────────────────────────────────────────
      boxShadow: {
        none:    'none',
        xs:      '0 1px 2px 0 rgba(26, 23, 20, 0.04)',
        sm:      '0 1px 3px 0 rgba(26, 23, 20, 0.06), 0 1px 2px -1px rgba(26, 23, 20, 0.04)',
        DEFAULT: '0 2px 8px 0 rgba(26, 23, 20, 0.08), 0 1px 3px -1px rgba(26, 23, 20, 0.05)',
        md:      '0 4px 16px 0 rgba(26, 23, 20, 0.10), 0 2px 6px -2px rgba(26, 23, 20, 0.06)',
        lg:      '0 8px 24px 0 rgba(26, 23, 20, 0.12), 0 4px 10px -3px rgba(26, 23, 20, 0.08)',
        xl:      '0 16px 40px 0 rgba(26, 23, 20, 0.14), 0 8px 16px -4px rgba(26, 23, 20, 0.08)',
        sage:    '0 4px 16px 0 rgba(92, 122, 82, 0.28), 0 1px 4px 0 rgba(92, 122, 82, 0.16)',
        gold:    '0 2px 12px 0 rgba(184, 148, 58, 0.20)',
        inner:   'inset 0 1px 3px 0 rgba(26, 23, 20, 0.06)',
      },

      // ─── TRANSICIONES ────────────────────────────────────────────────────────
      transitionDuration: {
        fast:    '120ms',
        DEFAULT: '200ms',
        slow:    '320ms',
        slower:  '480ms',
        hero:    '600ms',
      },

      transitionTimingFunction: {
        DEFAULT:    'cubic-bezier(0.4, 0, 0.2, 1)',
        in:         'cubic-bezier(0.4, 0, 1, 1)',
        out:        'cubic-bezier(0, 0, 0.2, 1)',
        'soft-out': 'cubic-bezier(0.2, 0.8, 0.4, 1)',
      },

      // ─── ANIMACIONES ─────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'line-grow': {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
      },

      animation: {
        'fade-in':       'fade-in 400ms cubic-bezier(0.2, 0.8, 0.4, 1) both',
        'fade-in-up':    'fade-in-up 500ms cubic-bezier(0.2, 0.8, 0.4, 1) both',
        'fade-in-scale': 'fade-in-scale 300ms cubic-bezier(0.2, 0.8, 0.4, 1) both',
        'slide-in-left': 'slide-in-left 350ms cubic-bezier(0.2, 0.8, 0.4, 1) both',
        'slide-in-right':'slide-in-right 350ms cubic-bezier(0.2, 0.8, 0.4, 1) both',
        'shimmer':       'shimmer 1.8s linear infinite',
        'float':         'float 4s ease-in-out infinite',
        'line-grow':     'line-grow 600ms cubic-bezier(0.2, 0.8, 0.4, 1) both',
      },

      // ─── DIMENSIONES MÁXIMAS ─────────────────────────────────────────────────
      maxWidth: {
        content: '720px',
        card:    '400px',
        section: '1200px',
        wide:    '1440px',
      },

      // ─── ASPECT RATIOS ───────────────────────────────────────────────────────
      aspectRatio: {
        floral:   '4 / 5',
        hero:     '16 / 7',
        square:   '1 / 1',
        portrait: '3 / 4',
        card:     '3 / 2',
      },

      // ─── Z-INDEX ─────────────────────────────────────────────────────────────
      zIndex: {
        behind:   '-1',
        base:     '0',
        raised:   '10',
        overlay:  '20',
        dropdown: '30',
        sticky:   '40',
        modal:    '50',
        toast:    '60',
        top:      '9999',
      },

      // ─── BACKGROUND IMAGE ────────────────────────────────────────────────────
      backgroundImage: {
        'gradient-ivory':   'linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%)',
        'gradient-sage':    'linear-gradient(135deg, #F4F6F2 0%, #C8D4C2 100%)',
        'gradient-hero':    'linear-gradient(to bottom, rgba(26,23,20,0.15) 0%, rgba(26,23,20,0.55) 100%)',
        'gradient-overlay': 'linear-gradient(to right, rgba(26,23,20,0.70) 0%, rgba(26,23,20,0.10) 100%)',
        'shimmer-gold':     'linear-gradient(90deg, transparent 0%, rgba(212,184,106,0.15) 50%, transparent 100%)',
      },
    },
  },

  plugins: [],
};
