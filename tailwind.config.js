/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#33CFFF',
          secondary: '#154FA6',
          tertiary: '#2E84FD',
        },
        surface: {
          base: '#021A40',
          card: '#2B42B6',
          input: '#13203a',
          muted: '#154FA6',
        },
        ink: {
          primary: '#F1F5F9',
          secondary: '#E6FAFF',
          muted: '#708090',
          onAccent: '#021A40',
        },
        status: {
          success: '#22C55E',
          warning: '#F97316',
          danger: '#EF4444',
          info: '#EAB308',
        },
        border: {
          accent: '#33CFFF',
          strong: '#274B8E',
          muted: '#708090',
        },
      },
    },
  },
  plugins: [],
}

