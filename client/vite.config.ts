import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@app": path.resolve(import.meta.dirname, "src/app"),
      "@api": path.resolve(import.meta.dirname, "src/api"),
      "@components": path.resolve(import.meta.dirname, "src/components"),
      "@validations": path.resolve(import.meta.dirname, "src/validations"),
      "#hooks": path.resolve(import.meta.dirname, "src/hooks"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules\/(react|react-dom|react-router|react-router-dom)/,
              minSize: 20_000,
            },
            {
              name: "query-vendor",
              test: /node_modules\/(@tanstack|axios)/,
              minSize: 20_000,
            },
            {
              name: "icons-vendor",
              test: /node_modules\/(@hugeicons)/,
              minSize: 20_000,
            },
            {
              name: "yjs-vendor",
              test: /node_modules\/(yjs|y-websocket|y-protocols|lib0)/,
              minSize: 20_000,
            },
            {
              name: "editor-vendor",
              test: /node_modules\/(@excalidraw)/,
              minSize: 20_000,
            },
            {
              name: "ui-vendor",
              test: /node_modules\/(sonner|zustand|zod)/,
              minSize: 20_000,
            },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
