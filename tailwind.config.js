/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  content: ['./src/**/*.{html,ts}', './src/app/shared/ui/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        success: 'hsl(var(--success))',
        'success-foreground': 'hsl(var(--success-foreground))',
        warning: 'hsl(var(--warning))',
        'warning-foreground': 'hsl(var(--warning-foreground))',
      },
    },
  },
  plugins: [],
};
