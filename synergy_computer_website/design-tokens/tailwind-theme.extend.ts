/**
 * Synergy Computers — Tailwind theme extension
 * Merge into tailwind.config.ts:
 *
 * import synergyTheme from './design-tokens/tailwind-theme.extend';
 * theme: { extend: { ...synergyTheme } }
 */

const synergyTheme = {
  colors: {
    white: '#FFFFFF',
    surface: {
      DEFAULT: '#FAFBFC',
      muted: '#F4F6F8',
    },
    ink: {
      DEFAULT: '#0D0D0D',
      secondary: '#1A1A1A',
      body: '#3D3D3D',
      muted: '#6B7280',
    },
    border: {
      DEFAULT: '#E5E7EB',
      strong: '#9CA3AF',
    },
    synergy: {
      DEFAULT: '#357C3C',
      dark: '#2A813E',
      muted: '#E6F2E8',
    },
    'on-synergy': '#FFFFFF',
  },
  backgroundColor: {
    canvas: '#FAFBFC',
  },
} as const;

export default synergyTheme;
