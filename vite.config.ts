// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  // Base path should be your repo name on GitHub Pages
  base: "/sps-bill-brew/",

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // removed extra "./"
    },
  },
});
