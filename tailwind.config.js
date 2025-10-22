/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF8108",
        secondary: "#FA9623",
        neutral: "#666666",
        accent: "#e76e07",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      screens: {
        xs: "480px", // pantalla muy pequeña
        sm: "640px", // pantallas pequeñas
        md: "768px", // laptops chicos
        lg: "1024px", // laptops grandes
        xl: "1280px", // pantallas amplias
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
