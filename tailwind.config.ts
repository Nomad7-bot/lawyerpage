import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "768px",
      md: "1024px",
      lg: "1280px",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B2A4A",
          light: "#2E5C8A",
        },
        accent: {
          DEFAULT: "#C4A265",
          light: "#D4C5A0",
        },
        "text-main": "#2D2D2D",
        "text-sub": "#666666",
        "bg-light": "#F5F5F5",
        "bg-white": "#FFFFFF",
        success: "#2E7D32",
        error: "#D32F2F",
        warning: "#F57C00",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontSize: {
        h1: ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        h4: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        none: "0px",
        card: "8px",
      },
      spacing: {
        // 8px 그리드 (PRD §12.2)
        "18": "72px",
        "22": "88px",
      },
    },
  },
  plugins: [typography],
};

export default config;
