import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lora: ['var(--font-lora)', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Parchment theme
        parchment: '#FAF6F0',
        cream: '#F5F0E8',
        ivory: '#FFFEF9',
        'warm-white': '#FEFCF8',
        linen: '#EDE8E0',
        espresso: '#3C2415',
        walnut: '#5C4033',
        stone: '#7A6F64',
        sand: '#A69B8D',
        amber: {
          light: '#F5E6C8',
          DEFAULT: '#B8860B',
          dark: '#8B6508',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1f2937', // gray-800
            p: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            // Highlight marks (marca-texto)
            mark: {
              backgroundColor: '#fef08a', // yellow-200
              padding: '0.125em 0.25em',
              borderRadius: '0.125rem',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
