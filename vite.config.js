import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path matches the GitHub Pages project site: digitarald.github.io/mini-strands
export default defineConfig({
  base: "/mini-strands/",
  plugins: [react()],
});
