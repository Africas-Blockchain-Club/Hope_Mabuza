/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#131313",
        surface:   "#1c1c1c",
        "surface2":"#242424",
        border:    "#2a2a2a",
        primary:   "#d3bbff",
        secondary: "#b89af0",
        tertiary:  "#2fd9f4",
        muted:     "#888",
        subtle:    "#555",
        success:   "#4ade80",
        warning:   "#fbbf24",
        danger:    "#f87171",
      },
      fontFamily: {
        sans:    ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
        "3xl": "24px",
        pill: "9999px",
      },
      boxShadow: {
        glow:       "0 0 24px rgba(211,187,255,0.18)",
        "glow-lg":  "0 0 48px rgba(211,187,255,0.25)",
        "glow-cyan":"0 0 24px rgba(47,217,244,0.25)",
        panel:      "0 8px 32px rgba(0,0,0,0.6)",
      },
      animation: {
        scan:     "scan 3s linear infinite",
        twinkle:  "twinkle 3s ease-in-out infinite",
        pulse2:   "pulse2 2s ease-in-out infinite",
        float:    "float 6s ease-in-out infinite",
        "spin-slow":"spin 8s linear infinite",
      },
      keyframes: {
        scan: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.2" },
          "50%":     { opacity: "1" },
        },
        pulse2: {
          "0%,100%": { opacity: "0.6" },
          "50%":     { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
