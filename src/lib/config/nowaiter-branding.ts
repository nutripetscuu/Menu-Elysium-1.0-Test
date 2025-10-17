/**
 * NoWaiter Brand Identity Configuration
 *
 * The Innovator - Refined & Energetic
 * This palette takes the spirit of the original logo but refines it for a modern,
 * premium SaaS feel. Bold and confident, inspiring trust and technological competence.
 */

export const nowaiterBranding = {
  // Primary Colors
  colors: {
    primary: {
      deepOceanBlue: '#0B2C4D', // Backgrounds, primary headers, core branding
      poppyRed: '#FF3B30',      // "NO" in logo, primary buttons, CTAs, alerts
    },
    neutral: {
      graphite: '#333333',      // Body text
      cloudGrey: '#F0F2F5',     // UI backgrounds, cards, section dividers
      pureWhite: '#FFFFFF',     // Negative space, text on dark backgrounds
    },
  },

  // Logo paths
  logos: {
    main: '/branding/nowaiter-logo-1.svg',       // Primary logo
    alternate: '/branding/nowaiter-logo-2.svg',  // Alternate variation
    hero: '/branding/nowaiter-hero.svg',         // Hero/banner image
  },

  // Typography
  typography: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },

  // Design tokens
  tokens: {
    // Shadows
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },

    // Border radius
    radius: {
      sm: '0.375rem',   // 6px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
      full: '9999px',
    },

    // Spacing scale
    spacing: {
      xs: '0.5rem',     // 8px
      sm: '1rem',       // 16px
      md: '1.5rem',     // 24px
      lg: '2rem',       // 32px
      xl: '3rem',       // 48px
      '2xl': '4rem',    // 64px
      '3xl': '6rem',    // 96px
    },
  },

  // Gradient combinations
  gradients: {
    primary: `linear-gradient(135deg, #0B2C4D 0%, #1a4d7a 100%)`,
    accent: `linear-gradient(135deg, #FF3B30 0%, #ff6b63 100%)`,
    subtle: `linear-gradient(180deg, #F0F2F5 0%, #FFFFFF 100%)`,
  },
} as const;

// Export individual color groups for easy access
export const colors = nowaiterBranding.colors;
export const logos = nowaiterBranding.logos;
export const typography = nowaiterBranding.typography;
export const tokens = nowaiterBranding.tokens;
export const gradients = nowaiterBranding.gradients;
