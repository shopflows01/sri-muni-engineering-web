/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1E40AF',   // Primary — header, nav, active buttons
          light:   '#3B82F6',   // Hover / secondary accents
          muted:   '#DBEAFE',   // Backgrounds, chips, subtle fills
          text:    '#1E3A5F',   // Dark text on light brand surfaces
          danger:  '#DC2626',   // Destructive actions
          success: '#16A34A',   // Confirm / success states
        }
      }
    }
  },
  plugins: [],
}
