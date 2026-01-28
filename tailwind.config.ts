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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
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
