/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F4",
        cream: "#FFF9F0",
        ink: { 50: "#F4F4F8", 100: "#EDEDF3", 900: "#131328", 800: "#1E1E3A", 700: "#2E2E52", 600: "#4A4A6A", 500: "#6B6B8A", 400: "#8E8EA8" },
        brand: { 50: "#EEECFF", 100: "#DDD8FF", 200: "#BEB6FF", 300: "#9C8FFF", 400: "#7B68FF", 500: "#5B50E6", 600: "#4A3FD4", 700: "#3B32A8" },
        accent: { amber: "#FFB020", coral: "#FF6B4A", mint: "#16C784", sky: "#0EA5E9", pink: "#FF7AB8", lime: "#D4F34E" }
      },
      fontFamily: {
        display: ["Sora", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(19,19,40,0.05), 0 8px 24px -8px rgba(19,19,40,0.12)",
        card: "0 2px 8px rgba(19,19,40,0.06), 0 20px 44px -16px rgba(91,80,230,0.22)",
        pop: "0 12px 40px -12px rgba(91,80,230,0.45)"
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.75rem" },
      animation: {
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        blob: "blob 12s ease-in-out infinite"
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-14px)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        blob: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "33%": { transform: "translate(20px,-20px) scale(1.05)" }, "66%": { transform: "translate(-16px,12px) scale(0.96)" } }
      }
    }
  },
  plugins: []
};

