import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#17211f", muted: "#59645f", slate: { 400: "#59645f", 500: "#53605a" }, line: "#e7ebe8", canvas: "#f6f8f6", forest: "#176b52", mint: "#e8f4ed", amber: "#f4b544", rose: "#c9574d" }, boxShadow: { soft: "0 2px 10px rgba(26, 43, 36, .045)" } } },
  plugins: [],
};

export default config;
