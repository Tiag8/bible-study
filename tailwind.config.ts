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
        parchment: '#e8e0d1',
        cream: '#f0eee4',
        ivory: '#f5f0e8',
        'warm-white': '#f7f3eb',
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
            color: '#3C2415', // espresso - corpo do editor
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            p: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            // Headings com Lora (serif)
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-lora), Georgia, serif',
              color: '#3C2415', // espresso
            },
            // Blockquotes
            blockquote: {
              borderLeftColor: '#EDE8E0', // linen
              color: '#5C4033', // walnut
            },
            // Código inline
            code: {
              backgroundColor: '#f7f3eb', // warm-white
              borderRadius: '0.25rem',
              padding: '0.125em 0.25em',
              color: '#5C4033', // walnut
            },
            // Separadores
            hr: {
              borderColor: '#EDE8E0', // linen
            },
            // Links
            a: {
              color: '#B8860B', // amber
              textDecoration: 'underline',
              '&:hover': {
                color: '#8B6508', // amber-dark
              },
            },
            // Strong/Bold
            strong: {
              color: '#3C2415', // espresso
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
