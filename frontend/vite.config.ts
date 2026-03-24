import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3020",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/health": {
        target: "http://localhost:3020",
        changeOrigin: true,
      },
      "/problems": {
        target: "http://localhost:3020",
        changeOrigin: true,
      },
      "/review": {
        target: "http://localhost:3020",
        changeOrigin: true,
      },
      "/hint": {
        target: "http://localhost:3020",
        changeOrigin: true,
      },
      "/chat": {
        target: "http://localhost:3020",
        changeOrigin: true,
      },
    },
  },
});

