/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#09090B",
        surface: {
          DEFAULT: "#111113",
          raised: "#17171A",
          hover: "#1D1D21",
        },
        line: {
          DEFAULT: "#232327",
          strong: "#33333A",
        },
        ink: {
          DEFAULT: "#FAFAFA",
          muted: "#A1A1AA",
          dim: "#71717A",
          faint: "#52525B",
        },
        accent: {
          DEFAULT: "#E9A23B",
          hover: "#F2B155",
          soft: "#2A1F0E",
          fg: "#0A0A0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Inter Tight'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        label: "0.12em",
      },
      boxShadow: {
        pop: "0 16px 40px -12px rgba(0, 0, 0, 0.7)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 200ms ease-out both",
        "fade-in": "fade-in 150ms ease-out both",
        blink: "blink 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
